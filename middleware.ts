import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Protected routes that require authentication
    const protectedRoutes = [
      '/creator',
      '/premium',
      '/profile',
      '/api/user',
      '/api/content',
      '/api/ai'
    ]

    // Creator-only routes
    const creatorRoutes = ['/creator']
    
    // Premium routes (premium or pro subscription required)
    const premiumRoutes = ['/premium/features', '/api/ai/premium']
    
    // Admin routes
    const adminRoutes = ['/admin', '/api/admin']

    // Check if route requires authentication
    const requiresAuth = protectedRoutes.some(route => pathname.startsWith(route))
    
    if (requiresAuth && !token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
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

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
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