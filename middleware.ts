import { withAuth } from 'next-auth/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many requests, please try again later'
}

// Simple in-memory rate limiter (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function rateLimit(req: NextRequest): boolean {
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  const key = `${ip}:${req.nextUrl.pathname}`
  
  const record = rateLimitMap.get(key)
  
  if (!record) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT.windowMs })
    return true
  }
  
  if (now > record.resetTime) {
    record.count = 1
    record.resetTime = now + RATE_LIMIT.windowMs
    return true
  }
  
  if (record.count >= RATE_LIMIT.maxRequests) {
    return false
  }
  
  record.count++
  return true
}

export default withAuth(
  function middleware(req: NextRequest & { nextauth: { token: any } }) {
    const { pathname, origin } = req.nextUrl
    const token = req.nextauth.token

    // Apply rate limiting to API routes
    if (pathname.startsWith('/api/')) {
      if (!rateLimit(req)) {
        return new NextResponse(
          JSON.stringify({ error: RATE_LIMIT.message }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '900' // 15 minutes
            }
          }
        )
      }
    }

    // Security headers
    const response = NextResponse.next()
    
    // Add security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()'
    )
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    )

    // CORS for API routes
    if (pathname.startsWith('/api/')) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
      )
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With'
      )
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: response.headers })
    }

    // Protected routes that require authentication
    const protectedRoutes = [
      '/creator',
      '/premium/success',
      '/premium/manage',
      '/profile',
      '/settings',
      '/api/user',
      '/api/content',
      '/api/ai',
      '/api/subscriptions'
    ]

    // Creator-only routes
    const creatorRoutes = ['/creator', '/admin']
    
    // Premium routes (premium or pro subscription required)
    const premiumRoutes = ['/premium/features', '/api/ai/premium', '/api/content/premium']
    
    // Admin routes
    const adminRoutes = ['/admin', '/api/admin']

    // Check if route requires authentication
    const requiresAuth = protectedRoutes.some(route => pathname.startsWith(route))
    
    if (requiresAuth && !token) {
      const signInUrl = new URL('/auth/signin', req.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }

    if (token) {
      // Check creator access
      if (creatorRoutes.some(route => pathname.startsWith(route))) {
        if (token.role !== 'creator' && token.role !== 'admin') {
          return NextResponse.redirect(new URL('/premium', req.url))
        }
      }

      // Check premium access
      if (premiumRoutes.some(route => pathname.startsWith(route))) {
        if (token.subscription === 'free') {
          return NextResponse.redirect(new URL('/premium', req.url))
        }
      }

      // Check admin access  
      if (adminRoutes.some(route => pathname.startsWith(route))) {
        if (token.role !== 'admin') {
          return NextResponse.redirect(new URL('/', req.url))
        }
      }
    }

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }: { token: any; req: NextRequest }) => {
        const { pathname } = req.nextUrl
        
        // Always allow access to public routes
        const publicRoutes = [
          '/',
          '/explore',
          '/reels',
          '/timeline',
          '/participate',
          '/auth',
          '/api/public'
        ]

        const isPublicRoute = publicRoutes.some(route => 
          pathname === route || pathname.startsWith(route)
        )

        if (isPublicRoute) return true

        // For protected routes, require a valid token
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/public (public API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!api/public|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}