import { createClient as createServerClient } from "@/lib/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { WaitlistClient } from "./waitlist-client"
import { redirect } from "next/navigation"

export default async function AdminWaitlistPage() {
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

  // Get all waitlist entries
  const { data: waitlist } = await supabaseAdmin
    .from('waitlist')
    .select('*')
    .order('created_at', { ascending: false })

  // Get today's email logs to calculate limit
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { data: logs } = await supabaseAdmin
    .from('email_logs')
    .select('recipient_count')
    .gte('sent_at', today.toISOString())
    
  const emailsSentToday = logs?.reduce((sum, log) => sum + log.recipient_count, 0) || 0

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-4xl font-bold text-foreground tracking-tight">Waitlist</h1>
        <p className="text-muted-foreground text-lg font-medium opacity-80">
          View all members who have signed up for the waitlist.
        </p>
      </div>

      <WaitlistClient waitlist={waitlist || []} />
    </div>
  )
}
