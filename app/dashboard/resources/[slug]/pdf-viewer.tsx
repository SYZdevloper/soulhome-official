"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

export function PdfViewer({ url, title }: { url: string, title: string }) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div 
      className="relative w-full bg-[#323639] rounded-xl overflow-hidden border border-border shadow-sm"
      style={{ 
        height: "min(75vh, 800px)", // Prevents infinite expansion on iOS
        WebkitOverflowScrolling: "touch",
        overflowY: "auto" 
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#323639] z-20">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <p className="text-sm text-zinc-300 font-medium animate-pulse">
            Loading Resource securely...
          </p>
          <p className="text-xs text-zinc-500 mt-2 text-center max-w-[250px]">
            This may take a few moments depending on your connection speed.
          </p>
        </div>
      )}
      
      {/* 
        Using absolute positioning for the iframe is a known fix for iOS Safari 
        so it respects the parent container's bounds instead of stretching to PDF height.
      */}
      <iframe
        src={url}
        className="absolute inset-0 w-full h-full border-0"
        title={title}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  )
}
