import { getServerSession } from 'next-auth/next'
import { authOptions } from './config'
import { db } from '@/lib/db'
import { hash } from 'bcryptjs'

// Server-side session utilities
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function requireRole(role: 'user' | 'creator' | 'admin') {
  const user = await requireAuth()
  if (user.role !== role && user.role !== 'admin') {
    throw new Error('Insufficient permissions')
  }
  return user
}

export async function requireSubscription(minLevel: 'free' | 'premium' | 'pro') {
  const user = await requireAuth()
  
  const levels = { free: 0, premium: 1, pro: 2 }
  const userLevel = levels[user.subscription]
  const requiredLevel = levels[minLevel]
  
  if (userLevel < requiredLevel) {
    throw new Error('Subscription upgrade required')
  }
  
  return user
}

// User management utilities
export async function createUser(data: {
  email: string
  password: string
  name: string
}) {
  const existingUser = await db.user.findUnique({
    where: { email: data.email }
  })

  if (existingUser) {
    throw new Error('User already exists')
  }

  const hashedPassword = await hash(data.password, 12)

  const user = await db.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      subscription: 'free',
      role: 'user'
    }
  })

  return user
}

export async function updateUserSubscription(
  userId: string, 
  subscription: 'free' | 'premium' | 'pro'
) {
  return await db.user.update({
    where: { id: userId },
    data: { 
      subscription,
      // Auto-promote to creator if pro subscription
      role: subscription === 'pro' ? 'creator' : undefined
    }
  })
}

export async function updateUserProfile(
  userId: string,
  data: Partial<{
    name: string
    avatar: string
    bio: string
  }>
) {
  return await db.user.update({
    where: { id: userId },
    data
  })
}

// Permission checking utilities
export function hasPermission(
  userRole: string,
  requiredRole: 'user' | 'creator' | 'admin'
): boolean {
  const roles = { user: 0, creator: 1, admin: 2 }
  const userLevel = roles[userRole as keyof typeof roles] || 0
  const requiredLevel = roles[requiredRole]
  
  return userLevel >= requiredLevel
}

export function hasSubscriptionAccess(
  userSubscription: string,
  requiredSubscription: 'free' | 'premium' | 'pro'
): boolean {
  const levels = { free: 0, premium: 1, pro: 2 }
  const userLevel = levels[userSubscription as keyof typeof levels] || 0
  const requiredLevel = levels[requiredSubscription]
  
  return userLevel >= requiredLevel
}

export function canAccessCreatorPanel(user: any): boolean {
  return hasPermission(user.role, 'creator')
}

export function canAccessPremiumFeatures(user: any): boolean {
  return hasSubscriptionAccess(user.subscription, 'premium')
}

export function canUseAIFeatures(user: any): boolean {
  return hasSubscriptionAccess(user.subscription, 'premium')
}

export function canUseUnlimitedAI(user: any): boolean {
  return hasSubscriptionAccess(user.subscription, 'pro')
}

// Rate limiting utilities
export async function checkUserRateLimit(
  userId: string,
  action: 'ai_generation' | 'content_creation' | 'api_request',
  subscription: 'free' | 'premium' | 'pro'
): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
  const limits = {
    free: {
      ai_generation: 5,
      content_creation: 10,
      api_request: 100
    },
    premium: {
      ai_generation: 50,
      content_creation: 100,
      api_request: 1000
    },
    pro: {
      ai_generation: -1, // unlimited
      content_creation: -1,
      api_request: 5000
    }
  }

  const userLimit = limits[subscription][action]
  
  if (userLimit === -1) {
    return { allowed: true, remaining: -1, resetTime: new Date() }
  }

  // Check current usage (implementation would depend on your rate limiting strategy)
  // This is a simplified version
  const currentUsage = await getCurrentUsage(userId, action)
  const remaining = Math.max(0, userLimit - currentUsage)
  
  return {
    allowed: remaining > 0,
    remaining,
    resetTime: getResetTime()
  }
}

async function getCurrentUsage(userId: string, action: string): Promise<number> {
  // Implementation would check usage from database or cache
  // For now, return a mock value
  return 0
}

function getResetTime(): Date {
  const now = new Date()
  const resetTime = new Date(now)
  resetTime.setHours(24, 0, 0, 0) // Reset at midnight
  return resetTime
}