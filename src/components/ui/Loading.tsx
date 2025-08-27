'use client'

import { Brain, Loader2, Zap, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'dots' | 'pulse' | 'brain' | 'minimal'
  text?: string
  className?: string
}

export function Loading({ 
  size = 'md', 
  variant = 'default', 
  text, 
  className 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const containerSizeClasses = {
    sm: 'gap-2 text-sm',
    md: 'gap-3 text-base',
    lg: 'gap-4 text-lg',
    xl: 'gap-6 text-xl'
  }

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <Loader2 className={cn('animate-spin text-echo-cyan', sizeClasses[size])} />
      </div>
    )
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center justify-center', containerSizeClasses[size], className)}>
        <div className="flex space-x-1">
          <div className={cn('rounded-full bg-echo-cyan animate-bounce', 
            size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'
          )} style={{ animationDelay: '0ms' }} />
          <div className={cn('rounded-full bg-echo-amber animate-bounce', 
            size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'
          )} style={{ animationDelay: '150ms' }} />
          <div className={cn('rounded-full bg-echo-cyan animate-bounce', 
            size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'
          )} style={{ animationDelay: '300ms' }} />
        </div>
        {text && <span className="text-muted-foreground">{text}</span>}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex flex-col items-center justify-center', containerSizeClasses[size], className)}>
        <div className={cn(
          'rounded-full bg-gradient-to-r from-echo-cyan to-echo-amber animate-pulse',
          size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-12 h-12' : size === 'lg' ? 'w-16 h-16' : 'w-20 h-20'
        )} />
        {text && <span className="text-muted-foreground mt-2">{text}</span>}
      </div>
    )
  }

  if (variant === 'brain') {
    return (
      <div className={cn('flex flex-col items-center justify-center', containerSizeClasses[size], className)}>
        <div className="relative">
          <Brain className={cn('text-echo-cyan animate-pulse', sizeClasses[size])} />
          <Sparkles className={cn(
            'absolute -top-1 -right-1 text-echo-amber animate-bounce',
            size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : size === 'lg' ? 'w-5 h-5' : 'w-6 h-6'
          )} />
        </div>
        {text && <span className="text-muted-foreground mt-2">{text}</span>}
      </div>
    )
  }

  // Default spinner
  return (
    <div className={cn('flex flex-col items-center justify-center', containerSizeClasses[size], className)}>
      <div className="relative">
        <Loader2 className={cn('animate-spin text-echo-cyan', sizeClasses[size])} />
        <Zap className={cn(
          'absolute inset-0 text-echo-amber animate-ping',
          sizeClasses[size]
        )} style={{ animationDuration: '2s' }} />
      </div>
      {text && <span className="text-muted-foreground mt-2">{text}</span>}
    </div>
  )
}

// Full page loading component
interface FullPageLoadingProps {
  message?: string
  submessage?: string
}

export function FullPageLoading({ 
  message = 'Carregando...', 
  submessage 
}: FullPageLoadingProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center space-y-4">
        <Loading variant="brain" size="xl" />
        <div>
          <h3 className="text-lg font-semibold">{message}</h3>
          {submessage && (
            <p className="text-muted-foreground text-sm">{submessage}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Content loading skeleton
export function ContentSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="space-y-4">
        <div className="h-4 bg-muted rounded-md w-3/4" />
        <div className="h-4 bg-muted rounded-md w-1/2" />
        <div className="h-4 bg-muted rounded-md w-5/6" />
        <div className="h-32 bg-muted rounded-md" />
        <div className="flex space-x-2">
          <div className="h-6 bg-muted rounded-full w-16" />
          <div className="h-6 bg-muted rounded-full w-20" />
          <div className="h-6 bg-muted rounded-full w-12" />
        </div>
      </div>
    </div>
  )
}

// Article card skeleton
export function ArticleCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-card rounded-lg border border-border p-6 space-y-4">
        <div className="h-6 bg-muted rounded-md w-3/4" />
        <div className="h-20 bg-muted rounded-md" />
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <div className="h-5 bg-muted rounded-full w-12" />
            <div className="h-5 bg-muted rounded-full w-16" />
          </div>
          <div className="h-4 bg-muted rounded-md w-20" />
        </div>
      </div>
    </div>
  )
}