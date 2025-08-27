'use client'

import { LoadingStates } from '@/components/ui/LoadingStates'

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation skeleton */}
      <div className="border-b border-border">
        <div className="echo-container">
          <div className="flex items-center justify-between h-16">
            <LoadingStates.Skeleton className="h-8 w-32" />
            <div className="flex space-x-4">
              <LoadingStates.Skeleton className="h-8 w-16" />
              <LoadingStates.Skeleton className="h-8 w-16" />
              <LoadingStates.Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <main className="flex-1">
        <div className="echo-container py-8">
          <div className="max-w-6xl mx-auto">
            {/* Page title */}
            <div className="mb-8">
              <LoadingStates.Skeleton className="h-10 w-64 mb-2" />
              <LoadingStates.Skeleton className="h-5 w-96" />
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Cards */}
                {Array.from({ length: 3 }).map((_, i) => (
                  <LoadingStates.Card key={i} />
                ))}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <LoadingStates.Card />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer skeleton */}
      <div className="border-t border-border bg-muted/30">
        <div className="echo-container py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <LoadingStates.Skeleton className="h-5 w-24" />
                <LoadingStates.Skeleton className="h-4 w-20" />
                <LoadingStates.Skeleton className="h-4 w-16" />
                <LoadingStates.Skeleton className="h-4 w-18" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="fixed bottom-4 right-4">
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-2">
            <LoadingStates.Spinner size="sm" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  )
}