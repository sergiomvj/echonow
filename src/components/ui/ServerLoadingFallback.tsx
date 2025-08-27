'use client'

import { LoadingSpinner, Skeleton } from './LoadingStates'

// Client-side loading components for server component compatibility
export function SpinnerFallback() {
  return <LoadingSpinner />
}

export function SkeletonFallback({ className }: { className?: string }) {
  return <Skeleton className={className} />
}