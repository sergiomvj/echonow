'use client'

import { ReactNode, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useLazyLoad } from '@/lib/performance'

// Skeleton loader component
export function Skeleton({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    />
  )
}

// Loading spinner component
export function LoadingSpinner({ 
  size = 'md', 
  className 
}: { 
  size?: 'sm' | 'md' | 'lg'
  className?: string 
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-gray-300 border-t-primary",
          sizeClasses[size]
        )}
      />
    </div>
  )
}

// Loading dots animation
export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-2 w-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  )
}

// Card skeleton for content loading
export function CardSkeleton() {
  return (
    <div className="echo-card p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

// Table skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

// List skeleton
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Page loading overlay
export function LoadingOverlay({ 
  isLoading, 
  children,
  message = "Loading..."
}: {
  isLoading: boolean
  children: ReactNode
  message?: string
}) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Button loading state
export function LoadingButton({
  isLoading,
  children,
  disabled,
  className,
  ...props
}: {
  isLoading?: boolean
  children: ReactNode
  disabled?: boolean
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        "echo-button inline-flex items-center justify-center space-x-2",
        "px-4 py-2 text-sm font-medium",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {isLoading && <LoadingSpinner size="sm" />}
      <span>{children}</span>
    </button>
  )
}

// Lazy loading wrapper with skeleton
export function LazyLoadWrapper({
  children,
  skeleton,
  className
}: {
  children: ReactNode
  skeleton: ReactNode
  className?: string
}) {
  const { elementRef, hasBeenVisible } = useLazyLoad()

  return (
    <div ref={elementRef as React.RefObject<HTMLDivElement>} className={className}>
      {hasBeenVisible ? children : skeleton}
    </div>
  )
}

// Progressive loading for images
export function ProgressiveImage({
  src,
  alt,
  placeholder,
  className,
  ...props
}: {
  src: string
  alt: string
  placeholder?: string
  className?: string
} & React.ImgHTMLAttributes<HTMLImageElement>) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [imageSrc, setImageSrc] = useState(placeholder || '')

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImageSrc(src)
      setIsLoaded(true)
    }
    img.src = src
  }, [src])

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        src={imageSrc}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-70"
        )}
        {...props}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  )
}

// Legacy object export for backward compatibility
// Note: Use individual named imports when possible for better RSC support
export const LoadingStates = {
  Skeleton,
  Spinner: LoadingSpinner,
  Dots: LoadingDots,
  Card: CardSkeleton,
  Table: TableSkeleton,
  List: ListSkeleton,
  Overlay: LoadingOverlay,
  Button: LoadingButton,
  LazyWrapper: LazyLoadWrapper,
  ProgressiveImage
} as const

export default LoadingStates