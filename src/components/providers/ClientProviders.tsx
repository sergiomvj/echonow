'use client'

import React from 'react'
import { SessionProvider } from 'next-auth/react'
import { ToastProvider } from '@/components/ui/toast'
import { trackWebVitals } from '@/lib/performance'

// Client-side performance tracking component
function ClientPerformanceTracking() {
  React.useEffect(() => {
    trackWebVitals()
  }, [])
  
  return null
}

// Client-side providers wrapper for server component compatibility
export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        {children}
        <ClientPerformanceTracking />
      </ToastProvider>
    </SessionProvider>
  )
}