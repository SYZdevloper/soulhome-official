import { createClient } from "@/lib/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, BookOpen, Headphones, Play, FileText, Clock, Download, Calendar, Lock } from "lucide-react"
import { DownloadButton } from "./download-button"
import { getFileIdFromUrl } from "@/lib/google-drive"
import { PdfViewerWrapper } from "./pdf-viewer-wrapper"
import { PurchaseAction } from "@/components/purchase-action"

interface ResourcePageProps {
  params: Promise<{ slug: string }>
}

export default async function ResourcePage({ params }: ResourcePageProps) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const supabase = await createClient()
  let user = null
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    user = authUser
  } catch {
    // Let it be null
  }

  // Get profile to check admin status
  const { data: profile } = user ? await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() : { data: null }

  // Get resource
  const { data: resource } = await supabase
    .from('resources')
    .select('*, category:categories(*)')
    .eq('slug', decodedSlug)
    .eq('is_published', true)
    .single()

  if (!resource) {
    notFound()
  }

  // Check purchase status
  const { data: purchase } = user ? await supabase
    .from('purchases')
    .select('*')
    .eq('user_id', user.id)
    .eq('resource_id', resource.id)
    .single() : { data: null }

  const hasAccess = !!purchase || profile?.is_admin

  // Check if already downloaded 
  let existingDownload = null
  if (user) {
    const { data: downloadData } = await supabase
      .from('downloads')
      .select('*')
      .eq('user_id', user.id)
      .eq('resource_id', resource.id)
      .single()
    existingDownload = downloadData
  }

  const typeIcons = {
    pdf: FileText,
    audio: Headphones,
    video: Play,
  }

  const typeLabels = {
    pdf: "PDF Guide",
    audio: "Audio Meditation",
    video: "Video Teaching",
  }

  const typeColors = {
    pdf: "bg-blue-500/10 text-blue-600",
    audio: "bg-green-500/10 text-green-600",
    video: "bg-orange-500/10 text-orange-600",
  }

  const Icon = typeIcons[resource.type as keyof typeof typeIcons] || FileText
  const typeLabel = typeLabels[resource.type as keyof typeof typeLabels] || resource.type
  const typeColor = typeColors[resource.type as keyof typeof typeColors] || "bg-secondary text-foreground"
  const driveFileId = resource.file_url ? getFileIdFromUrl(resource.file_url) : null

  function formatFileSize(bytes: number | null) {
    if (!bytes) return null
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  return (
    <div className="space-y-8 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/kundalini-school">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className={typeColor}>
                      {typeLabel}
                    </Badge>
                    {resource.category && (
                      <Badge variant="outline">{resource.category.name}</Badge>
                    )}
                  </div>
                  <CardTitle className="mt-2 font-serif text-2xl">
                    {resource.title}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {resource.description && (
                <div>
                  <h3 className="font-semibold text-foreground">Description</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    {resource.description}
                  </p>
                </div>
              )}

              {/* Resource Preview/Player Area */}
              {resource.type === 'video' && resource.file_url && (
                <div className="aspect-video overflow-hidden rounded-lg bg-secondary relative">
                  {(() => {
                    // Case 1: Google Drive Video
                    if (driveFileId) {
                      if (hasAccess) {
                        // Access Granted -> Show Player
                        return (
                          <iframe
                            src={`https://drive.google.com/file/d/${driveFileId}/preview`}
                            className="h-full w-full border-0"
                            allow="autoplay; fullscreen"
                            title={resource.title}
                          />
                        )
                      } else {
                        // Locked -> Show Lock Screen
                        return (
                          <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-900/90 text-white p-6 text-center">
                            {resource.thumbnail_url && (
                              <div className="absolute inset-0 -z-10">
                                <img src={resource.thumbnail_url} className="w-full h-full object-cover opacity-20 blur-sm" alt="" />
                              </div>
                            )}
                            <Lock className="w-12 h-12 mb-4 text-white/50" />
                            <p className="text-xl font-serif font-semibold">Video Locked</p>
                            <p className="text-sm text-white/70 mt-2 max-w-sm">
                              {hasAccess
                                ? "Click the 'Open Resource' button on the right to unlock and watch this video."
                                : "Purchase this resource to unlock and watch this video."}
                            </p>
                          </div>
                        )
                      }
                    }

                    // Case 2: Standard Direct Video File
                    return (
                      <video
                        controls
                        className="h-full w-full"
                        src={resource.file_url}
                        poster={resource.thumbnail_url || undefined}
                      >
                        Your browser does not support the video tag.
                      </video>
                    )
                  })()}
                </div>
              )}

              {/* Audio Player Area */}
              {resource.type === 'audio' && resource.file_url && (
                <div className="rounded-lg bg-secondary p-6 relative">
                  {(() => {
                    if (driveFileId) {
                      if (hasAccess) {
                        return (
                          <div className="aspect-[16/5] w-full">
                            <iframe
                              src={`https://drive.google.com/file/d/${driveFileId}/preview`}
                              className="h-full w-full border-0 rounded-md"
                              allow="autoplay"
                              title={resource.title}
                            />
                          </div>
                        )
                      } else {
                        return (
                          <div className="flex flex-col items-center justify-center text-center p-8 bg-zinc-900/5 rounded-lg border border-dashed border-zinc-300">
                            <Lock className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="font-semibold text-foreground">Audio Locked</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {hasAccess ? "Click 'Open Resource' to listen." : "Purchase to listen."}
                            </p>
                          </div>
                        )
                      }
                    }

                    return (
                      <audio controls className="w-full">
                        <source src={resource.file_url} />
                        Your browser does not support the audio element.
                      </audio>
                    )
                  })()}
                </div>
              )}

              {/* PDF Preview Area */}
              {resource.type === 'pdf' && resource.file_url && (
                <div className="rounded-lg bg-secondary relative overflow-hidden">
                  {(() => {
                    if (driveFileId) {
                      if (hasAccess) {
                        return (
                          <PdfViewerWrapper 
                            url={`/api/resources/${resource.id}/pdf#toolbar=0`} 
                            title={resource.title} 
                          />
                        )
                      } else {
                        return (
                          <div className="aspect-[4/3] flex flex-col items-center justify-center bg-zinc-100 text-center p-6 border-2 border-dashed border-zinc-200 m-4 rounded-xl">
                            <Lock className="w-10 h-10 mb-3 text-zinc-400" />
                            <p className="font-serif text-lg font-semibold text-zinc-700">PDF Guide Locked</p>
                            <p className="text-sm text-zinc-500 mt-2 max-w-xs">
                              {hasAccess ? "Unlock this guide by clicking 'Open Resource'." : "Purchase to access this guide."}
                            </p>
                          </div>
                        )
                      }
                    }

                    return (
                      <div className="aspect-[4/5] w-full bg-white">
                        <iframe
                          src={resource.file_url}
                          className="h-full w-full border-0"
                          title={resource.title}
                        />
                      </div>
                    )
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Access Card */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">{hasAccess ? "Download Resource" : "Unlock Resource"}</CardTitle>
              <CardDescription>
                {hasAccess
                  ? "Download a copy of this resource to your device"
                  : resource.price 
                    ? `Purchase for $${resource.price} to unlock this resource`
                    : "Purchase to unlock this resource"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasAccess ? (
                <DownloadButton
                  resourceId={resource.id}
                  fileUrl={resource.file_url}
                  fileName={`${resource.slug}.${resource.type === 'pdf' ? 'pdf' : resource.type === 'audio' ? 'mp3' : 'mp4'}`}
                  hasDownloaded={!!existingDownload}
                  slug={slug}
                />
              ) : (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    You do not own this resource.
                  </p>
                  {resource.calendly_url ? (
                    <PurchaseAction 
                      calendlyUrl={resource.calendly_url} 
                      slug={slug}
                      price={resource.price} 
                    />
                  ) : (
                    <Button className="w-full" disabled>
                      Purchase Unavailable (No Link Set)
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {resource.duration_minutes && (
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Duration</p>
                    <p className="text-sm text-muted-foreground">{resource.duration_minutes} minutes</p>
                  </div>
                </div>
              )}
              {resource.file_size_bytes && (
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">File Size</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(resource.file_size_bytes)}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Added</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(resource.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div >
  )
}
