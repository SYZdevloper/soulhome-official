import { createClient } from "@/lib/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, FileText, Headphones, Play, Eye, EyeOff, Pencil, Trash2, Download, Library, ExternalLink } from "lucide-react"
import { DeleteResourceButton } from "./delete-resource-button"

export default async function AdminResourcesPage() {
  const supabase = await createClient()

  const { data: resources } = await supabase
    .from('resources')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false })

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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Resources</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your resource library content.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/resources/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Resource
          </Link>
        </Button>
      </div>

      {resources && resources.length > 0 ? (
        <div className="grid gap-6">
          {resources.map((resource) => {
            const Icon = typeIcons[resource.type as keyof typeof typeIcons] || FileText
            const typeLabel = typeLabels[resource.type as keyof typeof typeLabels] || resource.type

            return (
              <Card key={resource.id} className="group overflow-hidden border-border/40 bg-white/40 backdrop-blur-xl dark:bg-black/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5">
                <CardContent className="flex items-center gap-6 p-5">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-primary/5 shadow-inner transition-transform duration-500 group-hover:scale-105">
                    {resource.thumbnail_url ? (
                      <img
                        src={resource.thumbnail_url}
                        alt={resource.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Icon className="h-8 w-8 text-primary/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                       <Badge variant="outline" className="rounded-full px-3 py-0.5 border-primary/20 bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-widest leading-none">
                         {typeLabel}
                       </Badge>
                       {resource.is_published ? (
                        <Badge variant="secondary" className="rounded-full px-3 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] uppercase font-bold tracking-widest leading-none">
                          Published
                        </Badge>
                       ) : (
                        <Badge variant="secondary" className="rounded-full px-3 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] uppercase font-bold tracking-widest leading-none">
                          Draft Mode
                        </Badge>
                       )}
                       {resource.category && (
                         <Badge variant="ghost" className="rounded-full px-3 py-0.5 bg-secondary/50 text-muted-foreground text-[10px] uppercase font-bold tracking-widest leading-none">
                           {resource.category.name}
                         </Badge>
                       )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-foreground tracking-tight truncate group-hover:text-primary transition-colors">
                      {resource.title}
                    </h3>
                    
                    <p className="mt-1 text-sm text-muted-foreground font-medium opacity-70">
                      Created on {new Date(resource.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {resource.file_url && (
                      <Button variant="outline" size="sm" className="h-10 rounded-xl font-bold bg-white text-primary border-primary/20 hover:bg-primary/5 mr-2" asChild title="Directly preview or download this file (bypasses all member limits)">
                        <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View File
                        </a>
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300" asChild title="Edit Content">
                      <Link href={`/admin/resources/${resource.id}/edit`}>
                        <Pencil className="h-5 w-5" />
                      </Link>
                    </Button>
                    <DeleteResourceButton resourceId={resource.id} resourceTitle={resource.title} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="border-border/40 bg-white/40 backdrop-blur-xl dark:bg-black/40 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
              <Library className="h-10 w-10 text-primary/40" />
            </div>
            <h3 className="text-2xl font-bold text-foreground tracking-tight">The Library is Empty</h3>
            <p className="mt-2 text-muted-foreground font-medium max-w-sm mx-auto">
              You haven't added any resources yet. Start building your knowledge repository for members.
            </p>
            <Button className="mt-8 rounded-xl px-8 py-6 text-lg h-auto shadow-xl shadow-primary/20" asChild>
              <Link href="/admin/resources/new">
                <Plus className="mr-2 h-5 w-5" />
                Manifest First Resource
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
