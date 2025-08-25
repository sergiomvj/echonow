import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { stripe, createBillingPortalSession } from '@/lib/stripe/config'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user subscription details
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        subscription: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        subscriptionCurrentPeriodEnd: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let subscriptionDetails = null

    // Get Stripe subscription details if user has one
    if (user.stripeSubscriptionId) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)
        subscriptionDetails = {
          id: stripeSubscription.id,
          status: stripeSubscription.status,
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          priceId: stripeSubscription.items.data[0]?.price?.id
        }
      } catch (error) {
        console.error('Failed to fetch Stripe subscription:', error)
      }
    }

    return NextResponse.json({
      subscription: user.subscription,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionDetails,
      hasStripeCustomer: !!user.stripeCustomerId
    })

  } catch (error) {
    console.error('Subscription fetch failed:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch subscription' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = await request.json()
    
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true }
    })

    if (!user?.stripeCustomerId) {
      return NextResponse.json({ 
        error: 'No billing account found' 
      }, { status: 400 })
    }

    switch (action) {
      case 'create_portal_session':
        const portalSession = await createBillingPortalSession({
          customerId: user.stripeCustomerId,
          returnUrl: `${process.env.NEXTAUTH_URL}/premium`
        })
        
        return NextResponse.json({ url: portalSession.url })

      case 'cancel_subscription':
        // Handle subscription cancellation
        const canceledSubscription = await stripe.subscriptions.update(
          user.stripeCustomerId,
          { cancel_at_period_end: true }
        )
        
        return NextResponse.json({ 
          success: true, 
          cancelAtPeriodEnd: canceledSubscription.cancel_at_period_end 
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Subscription management failed:', error)
    return NextResponse.json({ 
      error: 'Failed to manage subscription' 
    }, { status: 500 })
  }
}