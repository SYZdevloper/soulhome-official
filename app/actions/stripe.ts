"use server"

import Stripe from "stripe"
import { createClient } from "@/lib/server"
import { getProduct, PRODUCTS } from "@/lib/products"
import { rateLimit } from "@/lib/rate-limit"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function createCheckoutSession(productId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Rate Limiting: 5 checkout attempts per 2 minutes per user
  const { success } = rateLimit(`checkout:${user.id}`, 5, 120000)
  if (!success) {
    throw new Error("Too many checkout attempts. Please wait a few minutes before trying again.")
  }

  const product = getProduct(productId)
  if (!product) {
    throw new Error("Product not found")
  }

  // Check if user already has an active subscription ONLY if buying a subscription
  if (product.type === 'subscription') {
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (existingSubscription) {
      throw new Error("You already have an active subscription")
    }
  }

  // Check if user has a Stripe customer ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  let customerId: string | undefined = profile?.stripe_customer_id

  // If user doesn't have a Stripe customer, create one
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        supabase_user_id: user.id,
      },
    })
    customerId = customer.id
    // Store the customer ID - updating profile
    await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
  } else {
    // If they HAVE a customer ID, make sure the metadata is synced
    // This fixes the issue where old test customers didn't have the ID attached
    try {
      await stripe.customers.update(customerId, {
        metadata: {
          supabase_user_id: user.id
        }
      })
    } catch (error: any) {
      // If the customer was created in Test Mode, it won't exist in Live Mode. 
      // Catch the missing error and create a new Live customer instead.
      if (error?.code === 'resource_missing' || error?.message?.includes('No such customer')) {
        console.warn(`Customer ${customerId} not found in Stripe. Creating a new one.`)
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            supabase_user_id: user.id,
          },
        })
        customerId = customer.id
        await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
      } else {
        throw error
      }
    }
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    customer_update: {
      address: 'auto',
    },
    // When customer is provided, customer_email must NOT be provided
    // customer_email: customerId ? undefined : user.email, 
    line_items: [
      {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.priceInCents,
          recurring: product.type === 'subscription' && product.interval ? {
            interval: product.interval,
          } : undefined,
        },
        quantity: 1,
      },
    ],
    mode: product.type === 'subscription' ? 'subscription' : 'payment',
    ui_mode: 'embedded',
    payment_method_types: ['card', 'link'],
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    metadata: {
      user_id: user.id,
      product_id: productId,
      type: product.type,
    },
    // CRITICAL: Pass metadata directly to the subscription object
    // so the webhook can read user_id from subscription.metadata
    ...(product.type === 'subscription' ? {
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          product_id: productId,
        }
      }
    } : {}),
  })

  return { clientSecret: session.client_secret }
}

export async function getCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription', 'customer'],
  })

  return session
}

export async function createBillingPortalSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!subscription?.stripe_customer_id) {
    throw new Error("No subscription found")
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings`,
  })

  return { url: session.url }
}

export async function cancelSubscription() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Rate Limiting: 3 cancellations per 10 minutes per user
  const { success } = rateLimit(`cancel_sub:${user.id}`, 3, 600000)
  if (!success) {
    throw new Error("Too many cancellation attempts. Please contact support if you need assistance.")
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!subscription?.stripe_subscription_id) {
    throw new Error("No active subscription found")
  }

  try {
    // Cancel at the end of the current billing period (respecting the 30-day notice period)
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    })
  } catch (stripeError: any) {
    // If Stripe says the subscription doesn't exist (e.g. account was changed),
    // just mark it as cancelled in Supabase so the user can re-subscribe cleanly.
    if (stripeError?.code === 'resource_missing') {
      console.warn(`Stripe subscription ${subscription.stripe_subscription_id} not found — marking as cancelled in DB.`)
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled', updated_at: new Date().toISOString() })
        .eq('id', subscription.id)
      return { success: true }
    }
    throw stripeError
  }

  // Update status in Supabase — keep active until period end webhook fires
  await supabase
    .from('subscriptions')
    .update({ 
      status: 'active',
      cancel_at_period_end: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', subscription.id)

  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'there'
  
  // Try to find the period end date to include in the email
  let periodEndString = 'the end of your current billing period';
  if (subscription.current_period_end) {
    periodEndString = new Date(subscription.current_period_end).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // Import dynamically to avoid top-level issues if needed, or use static import
  const { sendCancellationEmail } = await import('@/app/actions/email')
  
  // Send immediate cancellation confirmation
  sendCancellationEmail(user.email!, name, periodEndString).catch(err => {
    console.error("Failed to send immediate cancellation email:", err)
  })

  // Log the cancellation request for admin notification

  // Since we don't have an email service, we record this event
  console.log(`CANCELLATION REQUESTED: User ${user.email} (${user.id}) requested cancellation for subscription ${subscription.stripe_subscription_id}`)
  
  return { success: true }
}
