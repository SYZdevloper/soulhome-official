import { createClient } from "@/lib/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BookOpen, Headphones, Play, FileText, Clock, ArrowRight } from "lucide-react"
import { ResourceFilters } from "./resource-filters"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

interface ResourcesPageProps {
  searchParams: Promise<{ type?: string; category?: string; search?: string }>
}

export const dynamic = 'force-dynamic'

export default async function ResourcesPage({ searchParams }: ResourcesPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query
  let query = supabase
    .from('resources')
    .select('*, category:categories(*)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (params.type) {
    query = query.eq('type', params.type)
  }

  if (params.category) {
    query = query.eq('category_id', params.category)
  }

  if (params.search) {
    query = query.ilike('title', `%${params.search}%`)
  }

  const { data: resources } = await query

  // Get categories for filter using admin client to bypass RLS
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: categories, error: catError } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (catError) {
    console.error('Error fetching categories:', catError)
  }

  const selectedCategory = params.category ? categories?.find((c: any) => c.id === params.category) : null

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
    <div className="space-y-8 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">Resource Library</h1>
        <p className="mt-2 text-muted-foreground">
          Explore our collection of teachings, meditations, and guides.
        </p>
      </div>

      {/* Filters */}
      <ResourceFilters
        categories={categories || []}
        currentType={params.type}
        currentCategory={params.category}
        currentSearch={params.search}
      />

      {/* Category Description */}
      {selectedCategory && selectedCategory.description && (
        <Card className="border-border/50 bg-primary/5">
          <CardHeader className="py-4">
            <CardTitle className="font-serif text-xl">{selectedCategory.name}</CardTitle>
            <CardDescription className="text-foreground/80 mt-1">
              {selectedCategory.description}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Resources Grid */}
      {resources && resources.length > 0 ? (
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
                      <Link href={`/kundalini-school/${resource.slug}`}>
                        View
                      </Link>
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
            <BookOpen className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-semibold text-foreground">No Resources Found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your filters or check back later for new content.
            </p>
            <Button variant="outline" className="mt-4 bg-transparent" asChild>
              <Link href="/kundalini-school">Clear Filters</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
