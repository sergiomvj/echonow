import { createMocks } from 'node-mocks-http'
import { POST as checkoutHandler } from '@/app/api/subscriptions/checkout/route'
import { POST as manageHandler } from '@/app/api/subscriptions/manage/route'
import { POST as webhookHandler } from '@/app/api/webhooks/stripe/route'

// Mock NextAuth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn()
}))

// Mock Stripe
jest.mock('@/lib/stripe/config', () => ({
  stripe: {
    customers: {
      create: jest.fn(),
      retrieve: jest.fn()
    },
    checkout: {
      sessions: {
        create: jest.fn(),
        retrieve: jest.fn()
      }
    },
    subscriptions: {
      retrieve: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn()
    },
    billingPortal: {
      sessions: {
        create: jest.fn()
      }
    },
    webhooks: {
      constructEvent: jest.fn()
    }
  },
  SUBSCRIPTION_PLANS: {
    free: { name: 'Free', price: 0, stripePriceId: null },
    premium: { name: 'Premium', price: 19, stripePriceId: 'price_premium' },
    pro: { name: 'Pro', price: 49, stripePriceId: 'price_pro' }
  },
  createStripeCustomer: jest.fn(),
  createCheckoutSession: jest.fn()
}))

// Mock database
jest.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn()
    },
    subscription: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }
}))

const { getServerSession } = require('next-auth/next')
const { stripe, createStripeCustomer, createCheckoutSession } = require('@/lib/stripe/config')
const { db } = require('@/lib/db')

describe('/api/subscriptions/checkout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('creates checkout session for premium plan', async () => {
    // Mock authenticated user
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com', name: 'Test User' }
    })

    // Mock user from database
    db.user.findUnique.mockResolvedValue({
      id: 'user1',
      email: 'test@example.com',
      name: 'Test User',
      stripeCustomerId: null
    })

    // Mock Stripe customer creation
    createStripeCustomer.mockResolvedValue({
      id: 'cus_test123'
    })

    // Mock checkout session creation
    createCheckoutSession.mockResolvedValue({
      id: 'cs_test123',
      url: 'https://checkout.stripe.com/pay/cs_test123'
    })

    // Mock database update
    db.user.update.mockResolvedValue({})

    const { req } = createMocks({
      method: 'POST',
      body: { planId: 'premium' }
    })

    const response = await checkoutHandler(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      url: 'https://checkout.stripe.com/pay/cs_test123',
      sessionId: 'cs_test123'
    })

    expect(createStripeCustomer).toHaveBeenCalledWith({
      email: 'test@example.com',
      name: 'Test User',
      userId: 'user1'
    })

    expect(createCheckoutSession).toHaveBeenCalledWith({
      customerId: 'cus_test123',
      priceId: 'price_premium',
      successUrl: expect.stringContaining('/premium/success'),
      cancelUrl: expect.stringContaining('/premium'),
      userId: 'user1'
    })
  })

  test('rejects unauthenticated requests', async () => {
    getServerSession.mockResolvedValue(null)

    const { req } = createMocks({
      method: 'POST',
      body: { planId: 'premium' }
    })

    const response = await checkoutHandler(req)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  test('rejects invalid plan IDs', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' }
    })

    const { req } = createMocks({
      method: 'POST',
      body: { planId: 'invalid_plan' }
    })

    const response = await checkoutHandler(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid plan')
  })

  test('rejects free plan checkout', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' }
    })

    const { req } = createMocks({
      method: 'POST', 
      body: { planId: 'free' }
    })

    const response = await checkoutHandler(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Cannot checkout for free plan')
  })

  test('handles user not found', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'nonexistent', email: 'test@example.com' }
    })

    db.user.findUnique.mockResolvedValue(null)

    const { req } = createMocks({
      method: 'POST',
      body: { planId: 'premium' }
    })

    const response = await checkoutHandler(req)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('User not found')
  })
})

describe('/api/subscriptions/manage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('creates billing portal session', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' }
    })

    db.user.findUnique.mockResolvedValue({
      id: 'user1',
      stripeCustomerId: 'cus_test123'
    })

    stripe.billingPortal.sessions.create.mockResolvedValue({
      url: 'https://billing.stripe.com/session/test123'
    })

    const { req } = createMocks({
      method: 'POST'
    })

    const response = await manageHandler(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.url).toBe('https://billing.stripe.com/session/test123')

    expect(stripe.billingPortal.sessions.create).toHaveBeenCalledWith({
      customer: 'cus_test123',
      return_url: expect.stringContaining('/premium')
    })
  })

  test('rejects unauthenticated requests', async () => {
    getServerSession.mockResolvedValue(null)

    const { req } = createMocks({
      method: 'POST'
    })

    const response = await manageHandler(req)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  test('handles user without Stripe customer ID', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' }
    })

    db.user.findUnique.mockResolvedValue({
      id: 'user1',
      stripeCustomerId: null
    })

    const { req } = createMocks({
      method: 'POST'
    })

    const response = await manageHandler(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('No subscription found')
  })
})

describe('/api/webhooks/stripe', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('handles subscription created webhook', async () => {
    const mockEvent = {
      type: 'customer.subscription.created',
      data: {
        object: {
          id: 'sub_test123',
          customer: 'cus_test123',
          status: 'active',
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + 2592000, // 30 days
          items: {
            data: [
              {
                price: {
                  id: 'price_premium'
                }
              }
            ]
          }
        }
      }
    }

    stripe.webhooks.constructEvent.mockReturnValue(mockEvent)

    db.user.findUnique.mockResolvedValue({
      id: 'user1',
      stripeCustomerId: 'cus_test123'
    })

    db.subscription.create.mockResolvedValue({})

    const { req } = createMocks({
      method: 'POST',
      headers: {
        'stripe-signature': 'test_signature'
      },
      body: JSON.stringify(mockEvent)
    })

    const response = await webhookHandler(req)

    expect(response.status).toBe(200)
    expect(db.subscription.create).toHaveBeenCalledWith({
      data: {
        userId: 'user1',
        stripeSubscriptionId: 'sub_test123',
        stripePriceId: 'price_premium',
        status: 'active',
        currentPeriodStart: expect.any(Date),
        currentPeriodEnd: expect.any(Date)
      }
    })
  })

  test('handles subscription updated webhook', async () => {
    const mockEvent = {
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_test123',
          customer: 'cus_test123',
          status: 'canceled',
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + 2592000,
          items: {
            data: [
              {
                price: {
                  id: 'price_premium'
                }
              }
            ]
          }
        }
      }
    }

    stripe.webhooks.constructEvent.mockReturnValue(mockEvent)

    db.subscription.findUnique.mockResolvedValue({
      id: 'subscription1',
      stripeSubscriptionId: 'sub_test123'
    })

    db.subscription.update.mockResolvedValue({})

    const { req } = createMocks({
      method: 'POST',
      headers: {
        'stripe-signature': 'test_signature'
      },
      body: JSON.stringify(mockEvent)
    })

    const response = await webhookHandler(req)

    expect(response.status).toBe(200)
    expect(db.subscription.update).toHaveBeenCalledWith({
      where: {
        stripeSubscriptionId: 'sub_test123'
      },
      data: {
        status: 'canceled',
        currentPeriodStart: expect.any(Date),
        currentPeriodEnd: expect.any(Date)
      }
    })
  })

  test('handles subscription deleted webhook', async () => {
    const mockEvent = {
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'sub_test123'
        }
      }
    }

    stripe.webhooks.constructEvent.mockReturnValue(mockEvent)

    db.subscription.delete.mockResolvedValue({})

    const { req } = createMocks({
      method: 'POST',
      headers: {
        'stripe-signature': 'test_signature'
      },
      body: JSON.stringify(mockEvent)
    })

    const response = await webhookHandler(req)

    expect(response.status).toBe(200)
    expect(db.subscription.delete).toHaveBeenCalledWith({
      where: {
        stripeSubscriptionId: 'sub_test123'
      }
    })
  })

  test('handles invalid signature', async () => {
    stripe.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('Invalid signature')
    })

    const { req } = createMocks({
      method: 'POST',
      headers: {
        'stripe-signature': 'invalid_signature'
      },
      body: 'invalid_body'
    })

    const response = await webhookHandler(req)

    expect(response.status).toBe(400)
  })

  test('ignores unhandled event types', async () => {
    const mockEvent = {
      type: 'customer.created',
      data: {
        object: {
          id: 'cus_test123'
        }
      }
    }

    stripe.webhooks.constructEvent.mockReturnValue(mockEvent)

    const { req } = createMocks({
      method: 'POST',
      headers: {
        'stripe-signature': 'test_signature'
      },
      body: JSON.stringify(mockEvent)
    })

    const response = await webhookHandler(req)

    expect(response.status).toBe(200)
    // Should not call any database operations for unhandled events
    expect(db.subscription.create).not.toHaveBeenCalled()
    expect(db.subscription.update).not.toHaveBeenCalled()
    expect(db.subscription.delete).not.toHaveBeenCalled()
  })
})