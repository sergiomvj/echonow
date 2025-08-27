'use client'

import { useEffect, useState, useMemo } from 'react'
import { PerformanceMonitor, getMemoryUsage, trackWebVitals } from '@/lib/performance'
import { cn } from '@/lib/utils'

interface PerformanceMetrics {
  memory?: {
    used: number
    total: number
    limit: number
  }
  timings: Record<string, {
    average: number
    count: number
    latest: number
  }>
  webVitals: {
    cls: number
    lcp: number
    fid: number
  }
}

export function PerformancePanel({ 
  className,
  showInProduction = false 
}: { 
  className?: string
  showInProduction?: boolean 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    timings: {},
    webVitals: { cls: 0, lcp: 0, fid: 0 }
  })

  const performanceMonitor = useMemo(() => PerformanceMonitor.getInstance(), [])

  // Only show in development unless explicitly enabled for production
  const shouldShow = process.env.NODE_ENV === 'development' || showInProduction

  useEffect(() => {
    if (!shouldShow) return

    // Initialize web vitals tracking
    trackWebVitals()

    // Update metrics every 2 seconds
    const interval = setInterval(() => {
      const timings = performanceMonitor.getMetrics()
      const memory = getMemoryUsage()

      setMetrics(prev => ({
        ...prev,
        timings,
        memory: memory || prev.memory
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [performanceMonitor, shouldShow])

  if (!shouldShow) return null

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-4 right-4 z-50",
          "w-12 h-12 bg-primary text-primary-foreground rounded-full",
          "flex items-center justify-center shadow-lg",
          "hover:bg-primary/90 transition-colors",
          className
        )}
        title="Performance Monitor"
      >
        📊
      </button>

      {/* Performance Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80 max-h-96 overflow-y-auto">
          <div className="bg-background border border-border rounded-lg shadow-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Performance Monitor</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {/* Memory Usage */}
            {metrics.memory && (
              <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                <h4 className="text-xs font-medium mb-2">Memory Usage</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Used:</span>
                    <span className="font-mono">{metrics.memory.used}MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-mono">{metrics.memory.total}MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Limit:</span>
                    <span className="font-mono">{metrics.memory.limit}MB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all",
                        metrics.memory.used / metrics.memory.limit > 0.8
                          ? "bg-red-500"
                          : metrics.memory.used / metrics.memory.limit > 0.6
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      )}
                      style={{
                        width: `${(metrics.memory.used / metrics.memory.limit) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Timing Metrics */}
            {Object.keys(metrics.timings).length > 0 && (
              <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                <h4 className="text-xs font-medium mb-2">Response Times (ms)</h4>
                <div className="space-y-2 text-xs max-h-32 overflow-y-auto">
                  {Object.entries(metrics.timings).map(([key, timing]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="truncate mr-2" title={key}>
                          {key.length > 15 ? `${key.slice(0, 15)}...` : key}
                        </span>
                        <span className="font-mono text-xs">
                          {timing.average.toFixed(1)}ms
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Count: {timing.count}</span>
                        <span>Latest: {timing.latest.toFixed(1)}ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  performanceMonitor.clearMetrics()
                  setMetrics(prev => ({ ...prev, timings: {} }))
                }}
                className="flex-1 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded"
              >
                Clear
              </button>
              <button
                onClick={() => {
                  const data = {
                    timestamp: new Date().toISOString(),
                    memory: metrics.memory,
                    timings: metrics.timings,
                    webVitals: metrics.webVitals
                  }
                  console.log('Performance Metrics:', data)
                }}
                className="flex-1 px-2 py-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Higher-order component for automatic performance tracking
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  const PerformanceTrackedComponent = (props: P) => {
    const performanceMonitor = useMemo(() => PerformanceMonitor.getInstance(), [])

    useEffect(() => {
      const endTiming = performanceMonitor.startTiming(`component-${componentName}`)
      return endTiming
    }, [performanceMonitor])

    return <WrappedComponent {...props} />
  }

  PerformanceTrackedComponent.displayName = `withPerformanceTracking(${componentName})`
  return PerformanceTrackedComponent
}

// Hook for component-level performance tracking
export function usePerformanceTracking(operationName: string) {
  const performanceMonitor = useMemo(() => PerformanceMonitor.getInstance(), [])

  const trackOperation = useMemo(() => {
    return (operation: () => Promise<any> | any) => {
      const endTiming = performanceMonitor.startTiming(operationName)
      
      try {
        const result = operation()
        
        if (result instanceof Promise) {
          return result.finally(endTiming)
        } else {
          endTiming()
          return result
        }
      } catch (error) {
        endTiming()
        throw error
      }
    }
  }, [performanceMonitor, operationName])

  return trackOperation
}

// Component for displaying performance warnings
export function PerformanceWarnings() {
  const [warnings, setWarnings] = useState<string[]>([])

  useEffect(() => {
    // Check for performance issues
    const checkPerformance = () => {
      const newWarnings: string[] = []
      
      // Check memory usage
      const memory = getMemoryUsage()
      if (memory && memory.used / memory.limit > 0.8) {
        newWarnings.push('High memory usage detected')
      }

      // Check for slow operations
      const monitor = PerformanceMonitor.getInstance()
      const metrics = monitor.getMetrics()
      
      Object.entries(metrics).forEach(([key, timing]) => {
        if (timing.average > 1000) { // More than 1 second
          newWarnings.push(`Slow operation detected: ${key}`)
        }
      })

      setWarnings(newWarnings)
    }

    const interval = setInterval(checkPerformance, 5000)
    return () => clearInterval(interval)
  }, [])

  if (warnings.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-lg">
        <div className="flex items-center mb-2">
          <span className="text-yellow-600 mr-2">⚠️</span>
          <span className="text-sm font-medium text-yellow-800">
            Performance Warning
          </span>
        </div>
        <ul className="text-xs text-yellow-700 space-y-1">
          {warnings.map((warning, index) => (
            <li key={index}>• {warning}</li>
          ))}
        </ul>
        <button
          onClick={() => setWarnings([])}
          className="mt-2 text-xs text-yellow-600 hover:text-yellow-800"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

export default PerformancePanel