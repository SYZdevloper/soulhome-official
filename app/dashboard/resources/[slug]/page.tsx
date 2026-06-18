import { createClient } from "@/lib/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, BookOpen, Headphones, Play, FileText, Clock, Download, Calendar, Lock } from "lucide-react"
import { DownloadButton } from "./download-button"
import { getFileIdFromUrl } from "@/lib/google-drive"
import { PdfViewer } from "./pdf-viewer"

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
    redirect("/auth/login")
  }

  if (!user) {
    redirect("/auth/login")
  }

  // Check subscription status
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, downloads_used, downloads_limit')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  const downloadsUsed = subscription?.downloads_used ?? 0
  const downloadsLimit = subscription?.downloads_limit ?? 3
  const downloadsLeft = Math.max(0, downloadsLimit - downloadsUsed)

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

  // Check if already downloaded
  const { data: existingDownload } = await supabase
    .from('downloads')
    .select('*')
    .eq('user_id', user.id)
    .eq('resource_id', resource.id)
    .single()

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
    <div className="space-y-8">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/dashboard/resources">
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
                      if (existingDownload) {
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
                              {subscription
                                ? "Click the 'Open Resource' button on the right to unlock and watch this video."
                                : "Subscribe to the membership to unlock and watch this video."}
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
                      if (existingDownload) {
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
                              {subscription ? "Click 'Open Resource' to listen." : "Subscribe to listen."}
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

              {/* PDF Preview Area (New) */}
              {resource.type === 'pdf' && resource.file_url && (
                <div className="rounded-lg bg-secondary relative overflow-hidden">
                  {(() => {
                    if (driveFileId) {
                      if (existingDownload) {
                        // PDF Preview - load from secure local proxy to bypass Safari cookie blocking
                        return (
                          <PdfViewer 
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
                              {subscription ? "Unlock this guide by clicking 'Open Resource'." : "Subscribe to access this guide."}
                            </p>
                          </div>
                        )
                      }
                    }

                    // Direct PDF Link fallback (just download link usually, but we can try embed)
                    // Regular PDFs are hard to embed without a viewer, but browsers handle iframes ok often.
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
          {/* Download Counter */}
          {subscription && (() => {
            // Purple shades that intensify: 0 used = lightest, 3 used = darkest
            const ratio = downloadsUsed / downloadsLimit
            const bgShade = ratio >= 1
              ? 'bg-purple-900/15 border-purple-400'
              : ratio >= 0.67
              ? 'bg-purple-700/12 border-purple-300'
              : ratio >= 0.34
              ? 'bg-purple-500/10 border-purple-200'
              : 'bg-purple-100/60 border-purple-100'
            const textShade = ratio >= 1
              ? 'text-purple-900'
              : ratio >= 0.67
              ? 'text-purple-800'
              : ratio >= 0.34
              ? 'text-purple-700'
              : 'text-purple-600'
            const barShade = ratio >= 1
              ? 'bg-purple-800'
              : ratio >= 0.67
              ? 'bg-purple-600'
              : ratio >= 0.34
              ? 'bg-purple-500'
              : 'bg-purple-400'
            const message = downloadsLeft === 0
              ? 'Access limit reached'
              : downloadsLeft === 1
              ? '1 unlock left this month'
              : `${downloadsLeft} unlocks left this month`
            return (
              <div className={`rounded-xl border p-4 ${bgShade}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-sm font-semibold ${textShade}`}>{message}</p>
                </div>
                <div className="h-2 rounded-full bg-purple-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barShade}`}
                    style={{ width: `${Math.min(100, ratio * 100)}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-purple-500">{downloadsUsed} / {downloadsLimit} used</p>
              </div>
            )
          })()}
          {/* Access Card */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Unlock Resource</CardTitle>
              <CardDescription>
                {subscription
                  ? "Unlock this resource to view it on the website"
                  : "Subscribe to unlock resources"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscription ? (
                (!existingDownload && downloadsLeft === 0) ? (
                  <div className="text-center p-4 bg-muted/50 rounded-lg border border-border">
                    <p className="text-sm font-medium text-foreground">Limit Reached</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You have used all your unlocks for this billing period.
                    </p>
                  </div>
                ) : (
                  <DownloadButton
                    resourceId={resource.id}
                    fileUrl={resource.file_url}
                    fileName={`${resource.slug}.${resource.type === 'pdf' ? 'pdf' : resource.type === 'audio' ? 'mp3' : 'mp4'}`}
                    hasDownloaded={!!existingDownload}
                    slug={slug}
                  />
                )
              ) : (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    An active subscription is required to download resources.
                  </p>
                  <Button className="mt-4 w-full" asChild>
                    <Link href="/membership">Subscribe Now</Link>
                  </Button>
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
