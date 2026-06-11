import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import { revokeFolderAccess, grantFolderAccess } from "@/lib/google-drive"
import { sendCancellationEmail } from "@/app/actions/email"
export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  // Initialize Stripe and Supabase INSIDE the handler to avoid build-time errors
  // when environment variables might be missing.
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription

        // Find user by stripe customer id
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('stripe_subscription_id', subscription.id)
          .single()


        const toISO = (timestamp: number | null | undefined, context: string) => {
          if (!timestamp) {
            console.warn(`[Stripe Webhook] Missing timestamp for ${context} in subscription ${subscription.id}`)
            // Default to 30 days from now if missing
            return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }
          return new Date(timestamp * 1000).toISOString()
        }

        // Access properties safely, defaulting to snake_case but checking if they are missing
        const currentPeriodStart = (subscription as any).current_period_start
        let currentPeriodEnd = (subscription as any).current_period_end

        // Safety check: if end <= start or missing, add 30 days
        if (!currentPeriodEnd || (currentPeriodStart && currentPeriodEnd <= currentPeriodStart)) {
          console.warn(`[Stripe Webhook] Invalid or equal period end for subscription ${subscription.id}. Adjusting.`)
          const start = currentPeriodStart || Math.floor(Date.now() / 1000)
          currentPeriodEnd = start + 30 * 24 * 60 * 60
        }

        console.log(`[Stripe Webhook] Processing subscription ${subscription.id}. Start: ${currentPeriodStart}, End: ${currentPeriodEnd}`)

        const subscriptionData = {
          stripe_customer_id: subscription.customer as string,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          current_period_start: toISO(currentPeriodStart, 'start'),
          current_period_end: toISO(currentPeriodEnd, 'end'),
          cancel_at_period_end: subscription.cancel_at_period_end,
        }

        if (existingSub) {
          // Parse dates to compare timestamps to see if the billing period rolled over (renewed)
          const oldStartMs = existingSub.current_period_start ? new Date(existingSub.current_period_start).getTime() : 0
          const newStartMs = currentPeriodStart ? currentPeriodStart * 1000 : 0

          // If the new start time is greater than the old start time, it is a renewal rollover
          const isRollover = oldStartMs > 0 && newStartMs > oldStartMs

          const updateData = {
            ...subscriptionData,
            ...(isRollover ? { downloads_used: 0 } : {})
          }

          console.log(`[Stripe Webhook] Updating subscription ${subscription.id}. isRollover: ${isRollover}`)

          await supabase
            .from('subscriptions')
            .update(updateData)
            .eq('stripe_subscription_id', subscription.id)
        } else {
          // === FIND THE USER ID ===
          // Priority 1: Read from subscription metadata (most reliable)
          let supabaseUserId = subscription.metadata?.supabase_user_id

          // Priority 2: Fall back to customer metadata
          if (!supabaseUserId) {
            console.warn(`[Webhook] No user_id in subscription metadata, checking customer...`)
            const customer = await stripe.customers.retrieve(subscription.customer as string)
            if (!(customer as any).deleted) {
              supabaseUserId = (customer as Stripe.Customer).metadata?.supabase_user_id
            }
          }

          // Priority 3: Fall back to looking up profile by stripe_customer_id
          if (!supabaseUserId) {
            console.warn(`[Webhook] No user_id in customer metadata, checking profiles table...`)
            const { data: profileMatch } = await supabase
              .from('profiles')
              .select('id')
              .eq('stripe_customer_id', subscription.customer as string)
              .single()
            if (profileMatch) {
              supabaseUserId = profileMatch.id
            }
          }

          if (supabaseUserId) {
            console.log(`[Webhook] Creating subscription for user ${supabaseUserId}`)

            const insertData = {
              user_id: supabaseUserId,
              ...subscriptionData,
              status: 'active',
              plan_id: subscription.metadata?.product_id || 'monthly-membership',
            }

            const { error: insertError } = await supabase.from('subscriptions').insert(insertData)

            if (insertError) {
              console.error("[Webhook] Error inserting subscription:", insertError)
            } else {
              console.log("[Webhook] Subscription created successfully!")

              // Grant Google Drive Access
              try {
                const folderId = process.env.GOOGLE_DRIVE_RESOURCE_ID
                const customer = await stripe.customers.retrieve(subscription.customer as string)
                const email = !(customer as any).deleted ? (customer as Stripe.Customer).email : null
                if (folderId && email) {
                  await grantFolderAccess(email, folderId)
                }
              } catch (driveErr) {
                console.error("[Webhook] Failed to grant Drive access:", driveErr)
              }
            }

          } else {
            console.error("[Webhook] CRITICAL: Could not find user for subscription:", subscription.id, "customer:", subscription.customer)
          }
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        // 1. Mark subscription as canceled
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id)

        // 2. Fetch user data for cancellation email
        const { data: userData } = await supabase
          .from('subscriptions')
          .select('user_id, current_period_end')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (userData?.user_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', userData.user_id)
            .single()

          if (profile?.email) {
            const name = profile.full_name || 'there'
            const periodEnd = new Date(userData.current_period_end).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })

            // Trigger Cancellation Email (Async)
            sendCancellationEmail(profile.email, name, periodEnd).catch(err => {
              console.error("[Webhook] Failed to send cancellation email:", err)
            })
          }

          // 3. Revoke Google Drive Access for ALL downloads
          const { data: downloads } = await supabase
            .from('downloads')
            .select('drive_permission_id, drive_file_id')
            .eq('user_id', userData.user_id)
            .not('drive_permission_id', 'is', null)

          if (downloads && downloads.length > 0) {
            console.log(`Revoking ${downloads.length} Drive permissions for user ${userData.user_id}...`)
            for (const d of downloads) {
              if (d.drive_permission_id && d.drive_file_id) {
                try {
                  await revokeFolderAccess(d.drive_permission_id, d.drive_file_id)
                } catch (err) {
                  console.error(`Failed to revoke ${d.drive_file_id}:`, err)
                }
              }
            }
          }
        }
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice

        if ((invoice as any).subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            (invoice as any).subscription as string
          )

          await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
              current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
              downloads_used: 0, // Reset download counter for the new billing period
            })
            .eq('stripe_subscription_id', subscription.id)
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice

        if ((invoice as any).subscription) {
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', (invoice as any).subscription as string)
        }
        break
      }
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        // === SAFETY NET: Handle subscription fulfillment ===
        // If subscription.created webhook missed the activation, this catches it
        if (session.mode === 'subscription' && session.subscription) {
          const userId = session.metadata?.user_id
          const subscriptionId = typeof session.subscription === 'string' 
            ? session.subscription 
            : session.subscription.id

          if (userId) {
            // Check if subscription already exists in our DB
            const { data: existingSub } = await supabase
              .from('subscriptions')
              .select('id')
              .eq('stripe_subscription_id', subscriptionId)
              .single()

            if (!existingSub) {
              console.log(`[Webhook] checkout.session.completed: Creating missing subscription for user ${userId}`)
              
              // Retrieve the full subscription from Stripe
              const subscription = await stripe.subscriptions.retrieve(subscriptionId)
              const currentPeriodStart = (subscription as any).current_period_start
              const currentPeriodEnd = (subscription as any).current_period_end

              const { error: insertError } = await supabase.from('subscriptions').insert({
                user_id: userId,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: subscriptionId,
                status: 'active',
                plan_id: session.metadata?.product_id || 'monthly-membership',
                current_period_start: currentPeriodStart 
                  ? new Date(currentPeriodStart * 1000).toISOString() 
                  : new Date().toISOString(),
                current_period_end: currentPeriodEnd 
                  ? new Date(currentPeriodEnd * 1000).toISOString() 
                  : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                cancel_at_period_end: false,
              })

              if (insertError) {
                console.error("[Webhook] checkout.session.completed insert error:", insertError)
              } else {
                console.log("[Webhook] checkout.session.completed: Subscription activated successfully!")
                
                // Grant Google Drive Access
                try {
                  const folderId = process.env.GOOGLE_DRIVE_RESOURCE_ID
                  const customer = await stripe.customers.retrieve(session.customer as string)
                  const email = !(customer as any).deleted ? (customer as Stripe.Customer).email : null
                  if (folderId && email) {
                    await grantFolderAccess(email, folderId)
                  }
                } catch (driveErr) {
                  console.error("[Webhook] Drive access error:", driveErr)
                }
              }
            } else {
              console.log(`[Webhook] checkout.session.completed: Subscription already exists, skipping.`)
            }
          }
        }

        // Handle one-time payments for events
        if (session.mode === 'payment' && session.metadata?.type === 'one_time') {
          const userId = session.metadata.user_id

          await supabase.from('bookings').insert({
            user_id: userId,
            stripe_session_id: session.id,
            payment_intent_id: session.payment_intent as string,
            amount_paid: session.amount_total,
            currency: session.currency,
            status: 'paid',
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json(
      { error: `Webhook handler failed: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    )
  }
}
