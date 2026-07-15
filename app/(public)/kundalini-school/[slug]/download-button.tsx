"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BookOpen, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { downloadResource } from "@/app/actions/download"

interface DownloadButtonProps {
  resourceId: string
  fileUrl: string
  fileName: string
  hasDownloaded: boolean
  slug: string
}

export function DownloadButton({
  resourceId,
  fileUrl,
  fileName,
  hasDownloaded,
  slug
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(hasDownloaded)

  async function handleDownload() {
    setIsDownloading(true)

    try {
      // Call Server Action to unlock access
      const result = await downloadResource(resourceId, fileUrl, slug)

      if (result.success) {
        setDownloaded(true)
        toast.success("Access Granted! Resource unlocked.")
      }
    } catch (error) {
      console.error('Unlock failed:', error)
      toast.error(error instanceof Error ? error.message : "Unlock failed")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-3">
      {downloaded ? (
        <div className="flex items-center justify-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg text-primary text-sm font-semibold">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Access Unlocked
        </div>
      ) : (
        <Button
          className="w-full"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Unlocking...
            </>
          ) : (
            <>
              <BookOpen className="mr-2 h-4 w-4" />
              Unlock Resource
            </>
          )}
        </Button>
      )}
    </div>
  )
}
