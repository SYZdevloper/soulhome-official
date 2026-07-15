import { createClient } from "@/lib/server"
import { NextResponse } from "next/server"

import { sendWelcomeEmail } from "@/app/actions/email"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  // if "next" is in search params, use it as the redirect URL
  const next = searchParams.get("next") ?? "/kundalini-school"

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && user) {
      // Check if this is the user's first time signing in using a metadata flag
      if (!user.user_metadata?.welcome_sent) {
        console.log(`[Auth Callback] New user detected: ${user.email}. Sending welcome email...`)
        
        // Use full_name from metadata or default to email prefix
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'there'
        
        // Trigger Welcome Email (Async)
        sendWelcomeEmail(user.email!, name).catch(err => {
          console.error("[Auth Callback] Failed to send welcome email:", err)
        })

        // Mark welcome email as sent in user metadata
        await supabase.auth.updateUser({
          data: { welcome_sent: true }
        })
      }

      const forwardedHost = request.headers.get("x-forwarded-host") // original origin
      const isLocalEnv = process.env.NODE_ENV === "development"
      if (isLocalEnv) {
        // we can be sure that origin is localhost
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
