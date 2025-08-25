import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe, STRIPE_WEBHOOK_EVENTS } from '@/lib/stripe/config'
import { db } from '@/lib/db'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const body = await request.text()
  const headersList = headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    console.error('No Stripe signature found')
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log(`Processing webhook event: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id)
  
  const userId = session.metadata?.userId
  if (!userId) {
    console.error('No userId in checkout session metadata')
    return
  }

  // Update user with Stripe customer ID
  if (session.customer && typeof session.customer === 'string') {
    await db.user.update({
      where: { id: userId },
      data: { stripeCustomerId: session.customer }
    })
  }

  // Handle subscription creation if this was a subscription checkout
  if (session.subscription && typeof session.subscription === 'string') {
    const subscription = await stripe.subscriptions.retrieve(session.subscription)
    await updateUserSubscription(userId, subscription)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Invoice payment succeeded:', invoice.id)
  
  if (invoice.subscription && typeof invoice.subscription === 'string') {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
    const userId = subscription.metadata?.userId
    
    if (userId) {
      await updateUserSubscription(userId, subscription)
      
      // Log successful payment
      console.log(`Payment succeeded for user ${userId}: ${invoice.amount_paid / 100} ${invoice.currency}`)
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id)
  
  if (invoice.subscription && typeof invoice.subscription === 'string') {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
    const userId = subscription.metadata?.userId
    
    if (userId) {
      // You might want to send a notification to the user
      console.log(`Payment failed for user ${userId}`)
      
      // Optionally downgrade to free plan after multiple failed attempts
      if (invoice.attempt_count >= 3) {
        await db.user.update({
          where: { id: userId },
          data: { 
            subscription: 'free',
            subscriptionStatus: 'incomplete'
          }
        })
      }
    }
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id)
  
  const userId = subscription.metadata?.userId
  if (userId) {
    await updateUserSubscription(userId, subscription)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id)
  
  const userId = subscription.metadata?.userId
  if (userId) {
    await updateUserSubscription(userId, subscription)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id)
  
  const userId = subscription.metadata?.userId
  if (userId) {
    // Downgrade user to free plan
    await db.user.update({
      where: { id: userId },
      data: { 
        subscription: 'free',
        subscriptionStatus: 'canceled',
        stripeSubscriptionId: null
      }
    })
  }
}

async function updateUserSubscription(userId: string, subscription: Stripe.Subscription) {
  // Determine subscription plan based on price ID
  let subscriptionPlan: 'free' | 'premium' | 'pro' = 'free'
  
  const priceId = subscription.items.data[0]?.price?.id
  if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
    subscriptionPlan = 'premium'
  } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
    subscriptionPlan = 'pro'
  }

  // Update user in database
  await db.user.update({
    where: { id: userId },
    data: {
      subscription: subscriptionPlan,
      subscriptionStatus: subscription.status,
      stripeSubscriptionId: subscription.id,
      subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      // Auto-promote to creator if pro subscription
      role: subscriptionPlan === 'pro' ? 'creator' : undefined
    }
  })

  console.log(`Updated user ${userId} subscription to ${subscriptionPlan} (${subscription.status})`)
}