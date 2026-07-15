import { createClient } from "@/lib/server"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Headphones, Play, FileText, Clock, ArrowRight } from "lucide-react"

export async function LatestResources() {
  const supabase = await createClient()

  // Build query
  const { data: resources } = await supabase
    .from('resources')
    .select('*, category:categories(*)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(3)

  if (!resources || resources.length === 0) return null

  const typeIcons = {
    pdf: FileText,
    audio: Headphones,
    video: Play,
  }

  const typeLabels = {
    pdf: "PDF Guide",
    audio: "Audio",
    video: "Video",
  }

  const typeColors = {
    pdf: "bg-blue-500/10 text-blue-600",
    audio: "bg-green-500/10 text-green-600",
    video: "bg-orange-500/10 text-orange-600",
  }

  return (
    <section className="py-20 sm:py-28 bg-background border-t border-border/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-6">
          <div className="text-center sm:text-left">
            <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl tracking-widest uppercase">
              Latest Resources
            </h2>
            <p className="mt-2 text-muted-foreground max-w-2xl text-lg">
              Explore our newest teachings, meditations, and guides to support your journey.
            </p>
          </div>
          <Button variant="outline" asChild className="hidden sm:inline-flex px-8 rounded-full">
            <Link href="/kundalini-school">View All Library <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => {
            const Icon = typeIcons[resource.type as keyof typeof typeIcons] || FileText
            const typeLabel = typeLabels[resource.type as keyof typeof typeLabels] || resource.type
            const typeColor = typeColors[resource.type as keyof typeof typeColors] || "bg-secondary text-foreground"

            return (
              <Card key={resource.id} className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="p-0">
                  <div className="aspect-video w-full overflow-hidden bg-muted relative group-hover:opacity-90 transition-opacity">
                    {resource.thumbnail_url ? (
                      <img
                        src={resource.thumbnail_url}
                        alt={resource.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-secondary/30">
                        <Icon className="h-12 w-12 text-primary/20" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className={`${typeColor} backdrop-blur-md bg-white/80 dark:bg-black/50 border-0`}>
                        {typeLabel}
                      </Badge>
                    </div>
                  </div>
                  <div className="px-5 pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      {resource.category && (
                        <Badge variant="outline" className="text-[10px] h-5 px-2 text-muted-foreground border-primary/20">
                          {resource.category.name}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="font-serif text-lg group-hover:text-primary transition-colors line-clamp-1">
                      {resource.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <CardDescription className="line-clamp-2 text-xs mb-4">
                    {resource.description || 'No description available'}
                  </CardDescription>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {resource.duration_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {resource.duration_minutes} min
                        </span>
                      )}
                    </div>
                    <Button size="sm" className="rounded-full px-4" asChild>
                      <Link href={`/resources/${resource.slug}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
        
        <div className="mt-10 sm:hidden flex justify-center">
          <Button variant="outline" asChild className="px-8 rounded-full w-full">
            <Link href="/kundalini-school">View All Library <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
