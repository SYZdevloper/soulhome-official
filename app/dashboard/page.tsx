import { createClient } from "@/lib/server"

export const dynamic = "force-dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Headphones, Play, Download, ArrowRight, Clock, FileText, AlertCircle } from "lucide-react"
import { getResourceCounts, getRecentResources } from "@/lib/queries"

export default async function DashboardPage() {
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

  // Parallelize all data fetching
  const [
    { data: profile },
    { data: recentDownloads, count: downloadCount },
    { pdfCount, audioCount, videoCount },
    recentResources
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
    // Fetch both the recent downloads and the total count in one query
    supabase
      .from('downloads')
      .select('*, resource:resources(*)', { count: 'exact' })
      .eq('user_id', user.id)
      .order('downloaded_at', { ascending: false })
      .limit(3),
    getResourceCounts(),
    getRecentResources()
  ])

  const stats = [
    { label: "PDF Guides", value: pdfCount || 0, icon: BookOpen, href: "/kundalini-school?type=pdf", color: "from-blue-500/20 to-indigo-500/10", iconColor: "text-blue-600" },
    { label: "Audio Meditations", value: audioCount || 0, icon: Headphones, href: "/kundalini-school?type=audio", color: "from-emerald-500/20 to-teal-500/10", iconColor: "text-emerald-600" },
    { label: "Video Teachings", value: videoCount || 0, icon: Play, href: "/kundalini-school?type=video", color: "from-amber-500/20 to-orange-500/10", iconColor: "text-amber-600" },
    { label: "My Downloads", value: downloadCount || 0, icon: Download, href: "/dashboard/downloads", color: "from-purple-500/20 to-pink-500/10", iconColor: "text-purple-600" },
  ]

  const typeIcons = {
    pdf: FileText,
    audio: Headphones,
    video: Play,
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-4xl font-bold text-foreground tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Welcome back, {user.email?.split('@')[0]}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Continue your spiritual journey with our latest resources and teachings.
        </p>
      </div>

      {/* Stats Grid - Bento Style */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group outline-none">
            <Card className={`relative h-full overflow-hidden border-border/40 bg-gradient-to-br ${stat.color} backdrop-blur-md transition-all duration-500 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1`}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-background/50 shadow-sm transition-transform duration-300 group-hover:rotate-6 ${stat.iconColor}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground tabular-nums tracking-tight">{stat.value}</p>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Recent Resources - 2/3 width on desktop */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-foreground">New Discoveries</h2>
            <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/5" asChild>
              <Link href="/kundalini-school" className="flex items-center gap-2">
                Explore Library <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {recentResources && recentResources.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentResources.map((resource) => (
                <Link
                  key={resource.id}
                  href={`/resources/${resource.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:border-primary/20"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-muted relative">
                    {resource.thumbnail_url ? (
                      <img
                        src={resource.thumbnail_url}
                        alt={resource.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-secondary/20">
                        <BookOpen className="h-10 w-10 text-muted-foreground/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="text-white text-xs font-medium flex items-center gap-1">
                        View Resource <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-1">
                      {resource.category?.name || 'Teachings'}
                    </p>
                    <h3 className="font-serif text-base font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {resource.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 bg-transparent text-center py-12">
              <p className="text-muted-foreground">New wisdom is arriving soon.</p>
            </Card>
          )}
        </div>

        {/* Side Section: Recent Activity & Quick Links */}
        <div className="space-y-8">
          <div>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Recent Activity</h2>
            <Card className="border-border/40 bg-card/40 backdrop-blur-sm divide-y divide-border/10 overflow-hidden">
              {recentDownloads && recentDownloads.length > 0 ? (
                <div className="divide-y divide-border/10">
                  {recentDownloads.map((download) => {
                    const Icon = download.resource?.type === 'audio' ? Headphones : download.resource?.type === 'video' ? Play : FileText
                    return (
                      <div key={download.id} className="group p-4 flex items-center gap-4 transition-colors hover:bg-primary/5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/50 group-hover:bg-primary/10 transition-colors">
                          <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground leading-tight">
                            {download.resource?.title || 'Unknown Resource'}
                          </p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-2.5 w-2.5" />
                            {new Date(download.downloaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Download className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-xs text-muted-foreground">No downloads yet.</p>
                </div>
              )}
              <div className="p-4 bg-primary/[0.02]">
                <Button variant="ghost" className="w-full text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/5" asChild>
                  <Link href="/dashboard/downloads">Full History</Link>
                </Button>
              </div>
            </Card>
          </div>

          {/* Quick Support Card */}
          <Card className="bg-primary text-primary-foreground overflow-hidden relative shadow-lg shadow-primary/20">
            <CardContent className="p-6 relative z-10">
              <h3 className="text-lg font-bold mb-2">Need Guidance?</h3>
              <p className="text-sm text-primary-foreground/80 mb-4 leading-relaxed">
                If you have questions about our resources or need technical help, our team is here for you.
              </p>
              <Button variant="secondary" className="w-full font-bold group" asChild>
                <Link href="/contact">
                  Contact Support <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
            {/* Background design elements */}
            <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -top-10 -left-10 h-32 w-32 bg-primary-foreground/10 rounded-full blur-2xl" />
          </Card>
        </div>
      </div>
    </div>
  )
}

