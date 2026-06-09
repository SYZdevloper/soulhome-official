import { createClient as createServerClient } from "@/lib/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { EmailClient } from "./email-client"
import { redirect } from "next/navigation"

export default async function AdminEmailPage() {
  const supabase = await createServerClient()
  
  // Verify user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  // Verify Admin
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()
  if (!profile?.is_admin) {
    redirect('/')
  }

  // Create an admin client to bypass RLS and fetch ALL data
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get today's email logs to calculate limit
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { data: logs } = await supabaseAdmin
    .from('email_logs')
    .select('recipient_count')
    .gte('sent_at', today.toISOString())
    
  const emailsSentToday = logs?.reduce((sum, log) => sum + log.recipient_count, 0) || 0

  // Calculate Audience Counts
  const { data: profiles } = await supabaseAdmin.from("profiles").select("id, email")
  const { data: subscriptions } = await supabaseAdmin.from("subscriptions").select("user_id, status")
  const { data: waitlist } = await supabaseAdmin.from("waitlist").select("email, wants_reminder")

  const subsByUser = new Map()
  subscriptions?.forEach(sub => subsByUser.set(sub.user_id, sub.status))

  let activeCount = 0
  let expiredCount = 0
  let freeCount = 0
  let registeredCount = 0

  profiles?.forEach(p => {
    if (!p.email) return
    registeredCount++
    const status = subsByUser.get(p.id)
    if (status === "active") activeCount++
    else if (status && status !== "active") expiredCount++
    else if (!status) freeCount++
  })

  let waitlistAllCount = 0
  let waitlistYesCount = 0
  let waitlistNoCount = 0

  waitlist?.forEach(w => {
    if (!w.email) return
    waitlistAllCount++
    if (w.wants_reminder) waitlistYesCount++
    else waitlistNoCount++
  })

  // Global Deduplicated Count
  const allEmails = new Set()
  profiles?.forEach(p => { if (p.email) allEmails.add(p.email) })
  waitlist?.forEach(w => { if (w.email) allEmails.add(w.email) })
  const globalCount = allEmails.size

  const audienceCounts = {
    global: globalCount,
    all_registered: registeredCount,
    active: activeCount,
    expired: expiredCount,
    free: freeCount,
    waitlist_all: waitlistAllCount,
    waitlist_yes: waitlistYesCount,
    waitlist_no: waitlistNoCount
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-4xl font-bold text-foreground tracking-tight">Communications Hub</h1>
        <p className="text-muted-foreground text-lg font-medium opacity-80">
          Compose and send beautifully formatted emails to specific segments of your audience.
        </p>
      </div>

      <EmailClient emailsSentToday={emailsSentToday} audienceCounts={audienceCounts} />
    </div>
  )
}
