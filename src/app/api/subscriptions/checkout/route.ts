import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { 
  stripe, 
  SUBSCRIPTION_PLANS, 
  createStripeCustomer, 
  createCheckoutSession 
} from '@/lib/stripe/config'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId } = await request.json()
    
    if (!planId || !SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]
    
    if (planId === 'free') {
      return NextResponse.json({ error: 'Cannot checkout for free plan' }, { status: 400 })
    }

    if (!plan.stripePriceId) {
      return NextResponse.json({ error: 'Plan not configured for payments' }, { status: 400 })
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create Stripe customer if doesn't exist
    let customerId = user.stripeCustomerId
    
    if (!customerId) {
      const customer = await createStripeCustomer({
        email: user.email,
        name: user.name,
        userId: user.id
      })
      
      customerId = customer.id
      
      // Update user with Stripe customer ID
      await db.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
      })
    }

    // Create checkout session
    const checkoutSession = await createCheckoutSession({
      customerId,
      priceId: plan.stripePriceId,
      successUrl: `${process.env.NEXTAUTH_URL}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXTAUTH_URL}/premium?canceled=true`,
      userId: user.id
    })

    return NextResponse.json({ 
      url: checkoutSession.url,
      sessionId: checkoutSession.id 
    })

  } catch (error: any) {
    console.error('Checkout session creation failed:', error)
    return NextResponse.json({ 
      error: 'Failed to create checkout session' 
    }, { status: 500 })
  }
}