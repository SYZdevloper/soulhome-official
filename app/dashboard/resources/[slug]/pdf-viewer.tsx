"use client"

import { useState, useRef, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Configure worker using unpkg (standard for Next.js react-pdf integration)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export function PdfViewer({ url, title }: { url: string, title: string }) {
  const [numPages, setNumPages] = useState<number>()
  const [isLoading, setIsLoading] = useState(true)
  const [containerWidth, setContainerWidth] = useState<number>()
  const containerRef = useRef<HTMLDivElement>(null)

  // Track container width to dynamically resize PDF pages on mobile
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width - 32) // 16px padding on each side
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setIsLoading(false)
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full bg-[#323639] rounded-xl overflow-y-auto overflow-x-hidden border border-border shadow-sm flex flex-col items-center py-6"
      style={{ 
        height: "min(75vh, 800px)", // Prevents infinite expansion on iOS
        WebkitOverflowScrolling: "touch",
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#323639] z-20">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <p className="text-sm text-zinc-300 font-medium animate-pulse">
            Loading Document securely...
          </p>
          <p className="text-xs text-zinc-500 mt-2 text-center max-w-[250px]">
            This may take a few moments. Direct downloads are disabled.
          </p>
        </div>
      )}
      
      <div className="w-full max-w-full flex flex-col items-center">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={null}
          error={
            <div className="text-red-400 text-center p-4">
              Failed to load secure document.
            </div>
          }
          className="flex flex-col items-center w-full"
        >
          {Array.from(new Array(numPages || 0), (el, index) => (
            <div key={`page_${index + 1}`} className="mb-4 shadow-xl last:mb-0 max-w-full">
              <Page
                pageNumber={index + 1}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                width={containerWidth ? Math.min(containerWidth, 800) : undefined}
                className="max-w-full rounded-md overflow-hidden"
              />
            </div>
          ))}
        </Document>
      </div>
    </div>
  )
}
