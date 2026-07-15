'use client'

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, Download, Calendar, Shield, CreditCard, ChevronRight, XCircle, AlertCircle, FileText, Music, Video, LineChart as LineChartIcon } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart, Legend } from 'recharts'
import { format, subDays, startOfDay, isAfter, startOfMonth, subMonths } from "date-fns"

interface Profile {
  id: string
  email: string
  full_name: string | null
  is_admin: boolean
  created_at: string
}



interface Download {
  id: string
  user_id: string
  downloaded_at: string
  resource: {
    id: string
    title: string
    type: string
  } | null
}

interface Purchase {
  id: string
  user_id: string
  created_at: string
  resource: {
    id: string
    title: string
    type: string
  } | null
}

type TimeRange = 'today' | 'yesterday' | '7d' | '28d' | '3m' | '1y'

export function MembersClient({ 
  profiles, 
  downloads,
  purchases 
}: { 
  profiles: Profile[]
  downloads: Download[]
  purchases: Purchase[]
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUserForDownloads, setSelectedUserForDownloads] = useState<Profile | null>(null)
  const [selectedUserForPurchases, setSelectedUserForPurchases] = useState<Profile | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>("28d")
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 15

  // Map downloads & purchases by user

  const userDownloadsMap = useMemo(() => {
    return downloads.reduce((acc, d) => {
      if (!acc[d.user_id]) acc[d.user_id] = []
      acc[d.user_id].push(d)
      return acc
    }, {} as Record<string, Download[]>)
  }, [downloads])

  const userPurchasesMap = useMemo(() => {
    return purchases.reduce((acc, p) => {
      if (!acc[p.user_id]) acc[p.user_id] = []
      acc[p.user_id].push(p)
      return acc
    }, {} as Record<string, Purchase[]>)
  }, [purchases])

  // Chart Data Preparation
  const chartData = useMemo(() => {
    const data: { dateStr: string, dateObj: Date, signups: number, purchases: number }[] = []
    const now = new Date()
    
    if (timeRange === 'today') {
      // 24 hours of today
      for (let i = 0; i <= now.getHours(); i++) {
        const d = new Date(now)
        d.setHours(i, 0, 0, 0)
        data.push({ dateStr: format(d, 'ha'), dateObj: d, signups: 0, purchases: 0 })
      }
    } else if (timeRange === 'yesterday') {
      const yest = subDays(now, 1)
      for (let i = 0; i <= 23; i++) {
        const d = new Date(yest)
        d.setHours(i, 0, 0, 0)
        data.push({ dateStr: format(d, 'ha'), dateObj: d, signups: 0, purchases: 0 })
      }
    } else if (timeRange === '7d' || timeRange === '28d') {
      const days = timeRange === '7d' ? 7 : 28
      for (let i = days - 1; i >= 0; i--) {
        const d = startOfDay(subDays(now, i))
        data.push({ dateStr: format(d, 'MMM dd'), dateObj: d, signups: 0, purchases: 0 })
      }
    } else if (timeRange === '3m') {
      for (let i = 89; i >= 0; i--) {
        const d = startOfDay(subDays(now, i))
        data.push({ dateStr: format(d, 'MMM dd'), dateObj: d, signups: 0, purchases: 0 })
      }
    } else if (timeRange === '1y') {
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      for (let i = 11; i >= 0; i--) {
        let m = currentMonth - i
        let y = currentYear
        if (m < 0) {
          m += 12
          y -= 1
        }
        const d = new Date(y, m, 1)
        data.push({ dateStr: format(d, 'MMM yyyy'), dateObj: d, signups: 0, purchases: 0 })
      }
    }

    // Populate data
    const isSameHour = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate() && d1.getHours() === d2.getHours()
    const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
    const isSameMonth = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth()

    profiles.forEach(p => {
      if (!p.created_at) return
      const pDate = new Date(p.created_at)
      let index = -1
      if (timeRange === 'today' || timeRange === 'yesterday') {
        index = data.findIndex(d => isSameHour(d.dateObj, pDate))
      } else if (timeRange === '1y') {
        index = data.findIndex(d => isSameMonth(d.dateObj, pDate))
      } else {
        index = data.findIndex(d => isSameDay(d.dateObj, pDate))
      }
      if (index !== -1) data[index].signups++
    })

    purchases.forEach(p => {
      if (!p.created_at) return
      const pDate = new Date(p.created_at)
      let index = -1
      if (timeRange === 'today' || timeRange === 'yesterday') {
        index = data.findIndex(d => isSameHour(d.dateObj, pDate))
      } else if (timeRange === '1y') {
        index = data.findIndex(d => isSameMonth(d.dateObj, pDate))
      } else {
        index = data.findIndex(d => isSameDay(d.dateObj, pDate))
      }
      if (index !== -1) data[index].purchases++
    })

    return data
  }, [profiles, purchases, timeRange])

  // Filtered profiles for table
  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      const matchesSearch = 
        (p.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
        p.email.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesSearch
    })
  }, [profiles, searchQuery])

  // Reset to page 1 when search changes
  useMemo(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const totalPages = Math.ceil(filteredProfiles.length / ITEMS_PER_PAGE)
  const paginatedProfiles = filteredProfiles.slice(0, currentPage * ITEMS_PER_PAGE)

  return (
    <div className="space-y-8">
      {/* Chart Section */}
      <Card className="border-border/40 bg-white/40 backdrop-blur-xl dark:bg-black/40 overflow-hidden shadow-sm">
        <CardHeader className="border-b border-border/40 pb-4 bg-white/50 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <LineChartIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-serif text-xl">Growth Analytics</CardTitle>
              <CardDescription>Signups and new purchases over time</CardDescription>
            </div>
          </div>
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="28d">Last 28 Days</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="1y">Last 1 Year</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0453B8" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0453B8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="dateStr" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  dy={10}
                  minTickGap={20}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  allowDecimals={false}
                />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '14px', fontWeight: 600 }} />
                <Area 
                  type="monotone" 
                  dataKey="signups" 
                  name="New Members (Free & Paid)"
                  stroke="#0453B8" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSignups)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="purchases" 
                  name="New Purchases"
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSubs)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card className="border-border/40 bg-white/40 backdrop-blur-xl dark:bg-black/40 overflow-hidden shadow-sm">
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40">
          <div className="flex items-center gap-2 max-w-sm w-full">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search explorers by name or email..."
                className="pl-9 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border/40">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Explorer</th>
                <th className="px-6 py-4 font-bold tracking-wider">Joined</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Purchases</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Transmissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {paginatedProfiles.length > 0 ? (
                paginatedProfiles.map(profile => {
                  const userDownloads = userDownloadsMap[profile.id] || []
                  const userPurchases = userPurchasesMap[profile.id] || []
                  
                  return (
                    <tr key={profile.id} className="bg-white/10 hover:bg-white/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-bold shadow-sm">
                            {profile.full_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-foreground">{profile.full_name || 'Unnamed Explorer'}</div>
                            <div className="text-xs text-muted-foreground">{profile.email}</div>
                          </div>
                          {profile.is_admin && (
                            <Shield className="h-3.5 w-3.5 text-blue-500 ml-1" />
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="text-muted-foreground">Joined: <span className="font-semibold text-foreground">{format(new Date(profile.created_at), 'MMM d, yyyy')}</span></span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className={`h-8 px-3 rounded-full text-xs font-bold ${userPurchases.length > 0 ? 'bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20' : 'text-muted-foreground hover:bg-secondary'}`}
                              onClick={() => setSelectedUserForPurchases(profile)}
                            >
                              <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                              {userPurchases.length}
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-full sm:max-w-md border-l border-border/40 bg-slate-50/95 backdrop-blur-xl">
                            <SheetHeader className="mb-6">
                              <SheetTitle className="font-serif text-2xl flex items-center gap-2">
                                <CreditCard className="h-6 w-6 text-indigo-600" />
                                Purchase History
                              </SheetTitle>
                              <SheetDescription>
                                Resource purchases for {selectedUserForPurchases?.full_name || selectedUserForPurchases?.email}
                              </SheetDescription>
                            </SheetHeader>
                            
                            <div className="overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                              {userPurchases.length > 0 ? (
                                <div className="space-y-3">
                                  {userPurchases.map((p) => (
                                    <div key={p.id} className="bg-white border border-border/50 rounded-xl p-4 shadow-sm flex items-start gap-4 transition-all hover:border-indigo-500/30">
                                      <div className="mt-0.5 h-8 w-8 rounded-lg bg-indigo-500/5 flex items-center justify-center text-indigo-600 shrink-0">
                                        {p.resource?.type === 'audio' ? <Music className="h-4 w-4" /> :
                                         p.resource?.type === 'video' ? <Video className="h-4 w-4" /> :
                                         <FileText className="h-4 w-4" />}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-foreground mb-1 leading-tight">{p.resource?.title || 'Unknown Resource'}</h4>
                                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                                          <Calendar className="h-3 w-3" />
                                          {format(new Date(p.created_at), 'MMM d, yyyy • h:mm a')}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                  <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                                    <CreditCard className="h-8 w-8 text-muted-foreground/50" />
                                  </div>
                                  <h3 className="text-lg font-bold text-foreground">No Purchases</h3>
                                  <p className="text-sm text-muted-foreground max-w-[250px] mt-1">This explorer hasn't purchased any resources yet.</p>
                                </div>
                              )}
                            </div>
                          </SheetContent>
                        </Sheet>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className={`h-8 px-3 rounded-full text-xs font-bold ${userDownloads.length > 0 ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-muted-foreground hover:bg-secondary'}`}
                              onClick={() => setSelectedUserForDownloads(profile)}
                            >
                              <Download className="mr-1.5 h-3.5 w-3.5" />
                              {userDownloads.length}
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-full sm:max-w-md border-l border-border/40 bg-slate-50/95 backdrop-blur-xl">
                            <SheetHeader className="mb-6">
                              <SheetTitle className="font-serif text-2xl flex items-center gap-2">
                                <Download className="h-6 w-6 text-primary" />
                                Transmission Log
                              </SheetTitle>
                              <SheetDescription>
                                Resource download history for {selectedUserForDownloads?.full_name || selectedUserForDownloads?.email}
                              </SheetDescription>
                            </SheetHeader>
                            
                            <div className="overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                              {userDownloads.length > 0 ? (
                                <div className="space-y-3">
                                  {userDownloads.map((dl) => (
                                    <div key={dl.id} className="bg-white border border-border/50 rounded-xl p-4 shadow-sm flex items-start gap-4 transition-all hover:border-primary/30">
                                      <div className="mt-0.5 h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0">
                                        {dl.resource?.type === 'audio' ? <Music className="h-4 w-4" /> :
                                         dl.resource?.type === 'video' ? <Video className="h-4 w-4" /> :
                                         <FileText className="h-4 w-4" />}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-foreground mb-1 leading-tight">{dl.resource?.title || 'Unknown Resource'}</h4>
                                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                                          <Calendar className="h-3 w-3" />
                                          {format(new Date(dl.downloaded_at), 'MMM d, yyyy • h:mm a')}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                  <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                                    <Download className="h-8 w-8 text-muted-foreground/50" />
                                  </div>
                                  <h3 className="text-lg font-bold text-foreground">No Transmissions</h3>
                                  <p className="text-sm text-muted-foreground max-w-[250px] mt-1">This explorer hasn't downloaded any resources yet.</p>
                                </div>
                              )}
                            </div>
                          </SheetContent>
                        </Sheet>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No explorers found matching your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Load More Control */}
        {filteredProfiles.length > paginatedProfiles.length && (
          <div className="p-4 border-t border-border/40 flex items-center justify-center bg-white/20">
            <Button 
              variant="outline" 
              onClick={() => setCurrentPage(p => p + 1)}
              className="bg-white hover:bg-slate-50"
            >
              Load More Explorers
            </Button>
          </div>
        )}
        <div className="p-4 text-center text-xs text-muted-foreground border-t border-border/40">
          Showing {paginatedProfiles.length} of {filteredProfiles.length} explorers
        </div>
      </Card>
    </div>
  )
}
