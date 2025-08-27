'use client'

import * as React from "react"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearAll: () => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])

    // Auto remove after duration (default 5 seconds)
    const duration = toast.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearAll = React.useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return {
    ...context,
    success: (message: string, title?: string) => context.addToast({
      title,
      description: message,
      variant: 'success'
    }),
    error: (message: string, title?: string) => context.addToast({
      title,
      description: message,
      variant: 'error'
    }),
    warning: (message: string, title?: string) => context.addToast({
      title,
      description: message,
      variant: 'warning'
    }),
    info: (message: string, title?: string) => context.addToast({
      title,
      description: message,
      variant: 'info'
    })
  }
}

function ToastViewport() {
  const { toasts } = useToast()

  return (
    <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} {...toast} />
      ))}
    </div>
  )
}

interface ToastComponentProps extends Toast {
  className?: string
}

function ToastComponent({ 
  id, 
  title, 
  description, 
  variant = 'default', 
  action,
  className 
}: ToastComponentProps) {
  const { removeToast } = useToast()

  const icons = {
    default: null,
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  }

  const Icon = icons[variant]

  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
        variant === 'default' && "border bg-background text-foreground",
        variant === 'success' && "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-100",
        variant === 'error' && "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-100",
        variant === 'warning' && "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-100",
        variant === 'info' && "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100",
        className
      )}
    >
      <div className="flex items-start space-x-3 flex-1">
        {Icon && (
          <Icon className={cn(
            "h-5 w-5 flex-shrink-0 mt-0.5",
            variant === 'success' && "text-green-600 dark:text-green-400",
            variant === 'error' && "text-red-600 dark:text-red-400",
            variant === 'warning' && "text-yellow-600 dark:text-yellow-400",
            variant === 'info' && "text-blue-600 dark:text-blue-400"
          )} />
        )}
        
        <div className="flex-1">
          {title && (
            <div className="text-sm font-semibold">{title}</div>
          )}
          {description && (
            <div className={cn(
              "text-sm opacity-90",
              title && "mt-1"
            )}>
              {description}
            </div>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                "mt-2 text-sm underline hover:no-underline focus:outline-none",
                variant === 'success' && "text-green-700 dark:text-green-300",
                variant === 'error' && "text-red-700 dark:text-red-300",
                variant === 'warning' && "text-yellow-700 dark:text-yellow-300",
                variant === 'info' && "text-blue-700 dark:text-blue-300"
              )}
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
      
      <button
        onClick={() => removeToast(id)}
        className={cn(
          "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
          variant === 'success' && "hover:text-green-900 dark:hover:text-green-100",
          variant === 'error' && "hover:text-red-900 dark:hover:text-red-100",
          variant === 'warning' && "hover:text-yellow-900 dark:hover:text-yellow-100",
          variant === 'info' && "hover:text-blue-900 dark:hover:text-blue-100"
        )}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Utility function for programmatic usage
export function toast(message: string, options?: {
  title?: string
  variant?: ToastVariant
  duration?: number
  action?: { label: string; onClick: () => void }
}) {
  // This would be used with a global toast instance
  // Implementation depends on how you want to handle global state
  console.log('Toast:', message, options)
}