"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

const PdfViewer = dynamic(() => import("./pdf-viewer").then(mod => mod.PdfViewer), { 
  ssr: false,
  loading: () => (
    <div className="aspect-[4/3] flex flex-col items-center justify-center bg-zinc-100 rounded-xl border border-zinc-200">
      <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
      <p className="text-sm text-zinc-500 font-medium">Loading Document Viewer...</p>
    </div>
  )
})

export function PdfViewerWrapper({ url, title }: { url: string, title: string }) {
  return <PdfViewer url={url} title={title} />
}
