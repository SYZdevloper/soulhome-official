import { createClient } from "@/lib/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Download, FileText, Headphones, Play, Clock, ExternalLink } from "lucide-react"

export default async function DownloadsPage() {
  const supabase = await createClient()
  let user = null
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    user = authUser
  } catch {
    return null
  }

  if (!user) {
    return null
  }

  const { data: downloads } = await supabase
    .from('downloads')
    .select('*, resource:resources(*, category:categories(*))')
    .eq('user_id', user.id)
    .order('downloaded_at', { ascending: false })

  const typeIcons = {
    pdf: FileText,
    audio: Headphones,
    video: Play,
  }

  const typeLabels = {
    pdf: "PDF",
    audio: "Audio",
    video: "Video",
  }

  const typeColors = {
    pdf: "bg-blue-500/10 text-blue-600",
    audio: "bg-green-500/10 text-green-600",
    video: "bg-orange-500/10 text-orange-600",
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">My Downloads</h1>
        <p className="mt-2 text-muted-foreground">
          Keep track of all the resources you{"'"}ve downloaded.
        </p>
      </div>

      {downloads && downloads.length > 0 ? (
        <div className="space-y-4">
          {downloads.map((download) => {
            const resource = download.resource
            if (!resource) return null
            
            const Icon = typeIcons[resource.type as keyof typeof typeIcons] || FileText
            const typeLabel = typeLabels[resource.type as keyof typeof typeLabels] || resource.type
            const typeColor = typeColors[resource.type as keyof typeof typeColors] || "bg-secondary text-foreground"
            
            return (
              <Card key={download.id} className="border-border/50">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-medium text-foreground">
                        {resource.title}
                      </h3>
                      <Badge variant="secondary" className={typeColor}>
                        {typeLabel}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                      {resource.category && (
                        <span>{resource.category.name}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(download.downloaded_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/kundalini-school/${resource.slug}`}>
                        View
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <a href={resource.file_url} download>
                        <Download className="mr-1 h-3 w-3" />
                        Download
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Download className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-semibold text-foreground">No Downloads Yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Start exploring our resource library and download content for offline access.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/resources">Browse Resources</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
