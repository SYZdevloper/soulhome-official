import { createClient as createServerClient } from "@/lib/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Library, Download, CreditCard, TrendingUp, Clock, FileText } from "lucide-react"

export default async function AdminPage() {
  const supabase = await createServerClient()
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

  // Create an admin client to bypass RLS and fetch ALL data
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get stats
  const { count: totalMembers } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: totalPurchases } = await supabaseAdmin
    .from('purchases')
    .select('*', { count: 'exact', head: true })

  const { count: totalResources } = await supabaseAdmin
    .from('resources')
    .select('*', { count: 'exact', head: true })

  const { count: publishedResources } = await supabaseAdmin
    .from('resources')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)

  const { count: totalDownloads } = await supabaseAdmin
    .from('downloads')
    .select('*', { count: 'exact', head: true })

  const { count: totalBlogs } = await supabaseAdmin
    .from('blogs')
    .select('*', { count: 'exact', head: true })

  // Get recent activity
  const { data: recentMembers } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: recentDownloads } = await supabaseAdmin
    .from('downloads')
    .select('*, resource:resources(title), profile:profiles(full_name, email)')
    .order('downloaded_at', { ascending: false })
    .limit(5)

  const stats = [
    { label: "Total Members", value: totalMembers || 0, icon: Users, color: "from-blue-500/20 to-blue-600/5", iconColor: "text-blue-600 dark:text-blue-400" },
    { label: "Total Purchases", value: totalPurchases || 0, icon: CreditCard, color: "from-emerald-500/20 to-emerald-600/5", iconColor: "text-emerald-600 dark:text-emerald-400" },
    { label: "Total Blogs", value: totalBlogs || 0, icon: FileText, color: "from-violet-500/20 to-violet-600/5", iconColor: "text-violet-600 dark:text-violet-400" },
    { label: "Resources", value: totalResources || 0, icon: Library, color: "from-amber-500/20 to-amber-600/5", iconColor: "text-amber-600 dark:text-amber-400" },
  ]

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-4xl font-bold text-foreground tracking-tight">Executive Overview</h1>
        <p className="text-muted-foreground text-lg font-medium opacity-80">
          Global platform metrics and recent administrative activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="group relative overflow-hidden border-border/40 bg-white/40 backdrop-blur-xl dark:bg-black/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
            <CardContent className="relative z-10 flex items-center gap-5 p-6">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary/50 backdrop-blur-sm shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                <stat.icon className={`h-7 w-7 ${stat.iconColor}`} />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-3xl font-black text-foreground tracking-tight">{stat.value}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Primary Analytics Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/40 bg-white/40 backdrop-blur-xl dark:bg-black/40 p-8">
           <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-serif text-xl font-bold">Platform Conversion</h3>
                <p className="text-sm text-muted-foreground">Membership uptake and resource distribution</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 text-primary">
                 <TrendingUp className="h-6 w-6" />
              </div>
           </div>

           <div className="grid gap-8 sm:grid-cols-2">
              <div className="space-y-4">
                 <div className="flex items-center justify-between text-sm">
                   <span className="font-medium text-muted-foreground">Conversion Rate</span>
                   <span className="font-bold text-primary">{totalMembers ? Math.round(((totalPurchases || 0) / totalMembers) * 100) : 0}%</span>
                 </div>
                 <div className="h-3 w-full rounded-full bg-secondary/50 overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full" 
                      style={{ width: `${totalMembers ? Math.round(((totalPurchases || 0) / totalMembers) * 100) : 0}%` }} 
                    />
                 </div>
                 <p className="text-[11px] text-muted-foreground italic">Percentage of registered members with at least one purchase</p>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between text-sm">
                   <span className="font-medium text-muted-foreground">Published Content</span>
                   <span className="font-bold text-primary">{Math.round(((publishedResources || 0) / (totalResources || 1)) * 100)}%</span>
                 </div>
                 <div className="h-3 w-full rounded-full bg-secondary/50 overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" 
                      style={{ width: `${Math.round(((publishedResources || 0) / (totalResources || 1)) * 100)}%` }} 
                    />
                 </div>
                 <p className="text-[11px] text-muted-foreground italic">{publishedResources} of {totalResources} resources are currently live</p>
              </div>
           </div>
        </Card>

        <Card className="border-border/40 bg-primary shadow-2xl shadow-primary/20 p-8 text-primary-foreground flex flex-col justify-between relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 transition-transform duration-700 group-hover:scale-150">
              <Download className="h-32 w-32" />
           </div>
           <div className="relative z-10">
              <h3 className="text-lg font-bold opacity-80 uppercase tracking-widest mb-2">Global Downloads</h3>
              <p className="text-5xl font-black tracking-tighter mb-4">{totalDownloads || 0}</p>
              <p className="text-sm opacity-70 leading-relaxed font-medium">Total digital resources distributed across your spiritual community.</p>
           </div>
           <div className="relative z-10 mt-6 pt-6 border-t border-white/20 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-bold tracking-widest uppercase">System Operational</span>
           </div>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Members */}
        <Card className="border-border/40 bg-white/40 backdrop-blur-xl dark:bg-black/40 overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif text-2xl">Latest Explorers</CardTitle>
                <CardDescription>Members who recently joined the journey</CardDescription>
              </div>
              <Users className="h-6 w-6 text-muted-foreground/30" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentMembers && recentMembers.length > 0 ? (
              <div className="divide-y divide-border/40">
                {recentMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-5 transition-colors hover:bg-primary/5"
                  >
                    <div className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold shadow-sm">
                       {member.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground truncate">
                        {member.full_name || 'Unnamed Traveler'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate font-medium">{member.email}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-1">Joined</p>
                       <p className="text-xs font-bold text-foreground/80">
                         {new Date(member.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                       </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center">
                <p className="text-sm text-muted-foreground italic">The journey has no new travelers yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Downloads */}
        <Card className="border-border/40 bg-white/40 backdrop-blur-xl dark:bg-black/40 overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-6">
             <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif text-2xl">Recent Transmissions</CardTitle>
                <CardDescription>Latest community resource downloads</CardDescription>
              </div>
              <Clock className="h-6 w-6 text-muted-foreground/30" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentDownloads && recentDownloads.length > 0 ? (
              <div className="divide-y divide-border/40">
                {recentDownloads.map((download) => (
                  <div
                    key={download.id}
                    className="flex items-center gap-4 p-5 transition-colors hover:bg-primary/5"
                  >
                    <div className="h-12 w-12 shrink-0 rounded-xl bg-secondary/50 flex items-center justify-center text-primary shadow-inner">
                       <Download className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground truncate">
                        {download.resource?.title || 'Celestial Resource'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate font-medium">
                        by {download.profile?.full_name || download.profile?.email || 'Unknown Soul'}
                      </p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-1">Received</p>
                       <p className="text-xs font-bold text-foreground/80">
                         {new Date(download.downloaded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                       </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center">
                <p className="text-sm text-muted-foreground italic">Quiet moments in the knowledge stream.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
