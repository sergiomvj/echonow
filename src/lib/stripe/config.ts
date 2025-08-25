import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
})

// EchoNow subscription plans
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Acesso básico a artigos e shorts',
    price: 0,
    currency: 'BRL',
    interval: 'month',
    features: [
      'Artigos limitados por dia',
      'Shorts básicos',
      'Análise de viés limitada',
      'Acesso ao timeline histórico'
    ],
    limits: {
      articlesPerDay: 5,
      aiGenerationsPerMonth: 5,
      shortsPerDay: 3
    }
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    description: 'IA limitada + filtros + downloads',
    price: 1900, // R$ 19.00 in cents
    currency: 'BRL',
    interval: 'month',
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    features: [
      'Artigos ilimitados',
      'IA para criação de conteúdo (50/mês)',
      'Filtros avançados',
      'Downloads de conteúdo',
      'Shorts com narração IA',
      'Análise detalhada de viés',
      'Comparações históricas completas'
    ],
    limits: {
      articlesPerDay: -1, // unlimited
      aiGenerationsPerMonth: 50,
      shortsPerDay: 20
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'IA ilimitada + prompts personalizados + painel criador',
    price: 4900, // R$ 49.00 in cents
    currency: 'BRL',
    interval: 'month',
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      'Todos os recursos Premium',
      'IA ilimitada para criação',
      'Prompts personalizados',
      'Painel do criador',
      'Analytics avançados',
      'Suporte prioritário',
      'Acesso antecipado a novos recursos',
      'API access'
    ],
    limits: {
      articlesPerDay: -1, // unlimited
      aiGenerationsPerMonth: -1, // unlimited
      shortsPerDay: -1 // unlimited
    }
  }
}

// Stripe webhook events we handle
export const STRIPE_WEBHOOK_EVENTS = [
  'checkout.session.completed',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.created'
] as const

// Helper functions
export function getSubscriptionPlan(planId: string) {
  return SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS] || SUBSCRIPTION_PLANS.free
}

export function formatPrice(price: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency
  }).format(price / 100)
}

export function canAccessFeature(
  userPlan: string,
  requiredPlan: string
): boolean {
  const planHierarchy = { free: 0, premium: 1, pro: 2 }
  const userLevel = planHierarchy[userPlan as keyof typeof planHierarchy] || 0
  const requiredLevel = planHierarchy[requiredPlan as keyof typeof planHierarchy] || 0
  
  return userLevel >= requiredLevel
}

export async function createStripeCustomer({
  email,
  name,
  userId
}: {
  email: string
  name: string
  userId: string
}) {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId
    }
  })
  
  return customer
}

export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  userId
}: {
  customerId?: string
  priceId: string
  successUrl: string
  cancelUrl: string
  userId: string
}) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId
    },
    subscription_data: {
      metadata: {
        userId
      }
    }
  })
  
  return session
}

export async function createBillingPortalSession({
  customerId,
  returnUrl
}: {
  customerId: string
  returnUrl: string
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl
  })
  
  return session
}