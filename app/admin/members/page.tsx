import { createClient as createServerClient } from "@/lib/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { MembersClient } from "./members-client"
import { redirect } from "next/navigation"

export default async function AdminMembersPage() {
  const supabase = await createServerClient()
  
  // Verify user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  // Create an admin client to bypass RLS and fetch ALL data
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get all profiles
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // Get all downloads with resource metadata
  const { data: downloads } = await supabaseAdmin
    .from('downloads')
    .select('id, user_id, downloaded_at, resource:resources(id, title, type)')
    .order('downloaded_at', { ascending: false })

  // Get all purchases with resource metadata
  const { data: purchases } = await supabaseAdmin
    .from('purchases')
    .select('id, user_id, created_at, resource:resources(id, title, type)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-4xl font-bold text-foreground tracking-tight">Community Directory</h1>
        <p className="text-muted-foreground text-lg font-medium opacity-80">
          Global database of all souls journeying with Soul Home.
        </p>
      </div>

      <MembersClient 
        profiles={profiles || []} 
        downloads={(downloads as any) || []} 
        purchases={(purchases as any) || []}
      />
    </div>
  )
}
