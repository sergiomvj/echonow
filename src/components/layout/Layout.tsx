'use client'

import { ReactNode, Suspense } from 'react'
import Navigation from './Navigation'
import Footer from './Footer'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import { LoadingStates } from '@/components/ui/LoadingStates'
import PerformancePanel, { PerformanceWarnings, withPerformanceTracking } from '@/components/ui/PerformancePanel'

interface LayoutProps {
  children: ReactNode
  currentPage?: string
  showPerformancePanel?: boolean
}

function Layout({ children, currentPage, showPerformancePanel = false }: LayoutProps) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background flex flex-col">
        <Suspense fallback={<LoadingStates.Skeleton className="h-16 w-full" />}>
          <Navigation currentPage={currentPage} />
        </Suspense>
        
        <main className="flex-1">
          <Suspense fallback={
            <div className="echo-container py-12">
              <LoadingStates.Skeleton className="h-8 w-48 mb-4" />
              <LoadingStates.Skeleton className="h-64 w-full" />
            </div>
          }>
            {children}
          </Suspense>
        </main>
        
        <Suspense fallback={<LoadingStates.Skeleton className="h-24 w-full" />}>
          <Footer />
        </Suspense>
        
        {/* Performance monitoring in development or when explicitly enabled */}
        <PerformancePanel showInProduction={showPerformancePanel} />
        <PerformanceWarnings />
      </div>
    </ErrorBoundary>
  )
}

// Export with performance tracking
export default withPerformanceTracking(Layout, 'Layout')