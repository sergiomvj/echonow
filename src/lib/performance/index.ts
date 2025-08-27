'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startTiming(key: string): () => void {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      if (!this.metrics.has(key)) {
        this.metrics.set(key, [])
      }
      
      this.metrics.get(key)!.push(duration)
      
      // Keep only last 100 measurements
      const values = this.metrics.get(key)!
      if (values.length > 100) {
        values.shift()
      }
    }
  }

  getAverageTime(key: string): number {
    const values = this.metrics.get(key)
    if (!values || values.length === 0) return 0
    
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  getMetrics(): Record<string, { average: number; count: number; latest: number }> {
    const result: Record<string, { average: number; count: number; latest: number }> = {}
    
    for (const [key, values] of this.metrics.entries()) {
      result[key] = {
        average: this.getAverageTime(key),
        count: values.length,
        latest: values[values.length - 1] || 0
      }
    }
    
    return result
  }

  clearMetrics(): void {
    this.metrics.clear()
  }
}

// Cache implementation with TTL
export class Cache<T = any> {
  private cache = new Map<string, { value: T; expires: number }>()
  private defaultTtl: number

  constructor(defaultTtl: number = 5 * 60 * 1000) { // 5 minutes default
    this.defaultTtl = defaultTtl
  }

  set(key: string, value: T, ttl?: number): void {
    const expires = Date.now() + (ttl || this.defaultTtl)
    this.cache.set(key, { value, expires })
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) return null
    
    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key)
      }
    }
  }
}

// Global cache instances
export const apiCache = new Cache(5 * 60 * 1000) // 5 minutes
export const componentCache = new Cache(10 * 60 * 1000) // 10 minutes

// Debounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Throttle hook
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now())

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args)
        lastRun.current = Date.now()
      }
    }) as T,
    [callback, delay]
  )
}

// Memoized API call hook
export function useMemoizedFetch<T>(
  url: string,
  options?: RequestInit,
  deps: any[] = []
): {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => void
} {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const cacheKey = useMemo(() => {
    return `${url}:${JSON.stringify(options)}:${JSON.stringify(deps)}`
  }, [url, options, deps])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Check cache first
      const cachedData = apiCache.get(cacheKey)
      if (cachedData) {
        setData(cachedData)
        setLoading(false)
        return
      }

      const response = await fetch(url, options)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      // Cache the result
      apiCache.set(cacheKey, result)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [url, options, cacheKey])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Intersection observer hook for lazy loading
export function useLazyLoad(options?: IntersectionObserverInit) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasBeenVisible, setHasBeenVisible] = useState(false)
  const elementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          setHasBeenVisible(true)
        } else {
          setIsVisible(false)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [options])

  return { elementRef, isVisible, hasBeenVisible }
}

// Performance-optimized list rendering
export function useVirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5
}: {
  items: T[]
  itemHeight: number
  containerHeight: number
  overscan?: number
}) {
  const [scrollTop, setScrollTop] = useState(0)

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index
    }))
  }, [items, startIndex, endIndex])

  const totalHeight = items.length * itemHeight

  return {
    visibleItems,
    totalHeight,
    startIndex,
    setScrollTop,
    scrollTop
  }
}

// Image optimization utilities
export function getOptimizedImageUrl(
  src: string,
  width: number,
  height?: number,
  quality: number = 75
): string {
  // If using Next.js Image optimization
  if (src.startsWith('/')) {
    const params = new URLSearchParams({
      url: src,
      w: width.toString(),
      q: quality.toString()
    })
    
    if (height) {
      params.set('h', height.toString())
    }
    
    return `/_next/image?${params.toString()}`
  }
  
  // For external images, you might want to use a service like Cloudinary
  return src
}

// Bundle size utilities
export const bundleAnalysis = {
  logBundleSize: (componentName: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📦 Component loaded: ${componentName}`)
    }
  },
  
  measureComponentRender: (componentName: string) => {
    const monitor = PerformanceMonitor.getInstance()
    return monitor.startTiming(`component-${componentName}`)
  }
}

// Web Vitals monitoring
export function trackWebVitals() {
  if (typeof window === 'undefined') return

  // Track CLS (Cumulative Layout Shift)
  let cls = 0
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        cls += (entry as any).value
      }
    }
  }).observe({ type: 'layout-shift', buffered: true })

  // Track LCP (Largest Contentful Paint)
  new PerformanceObserver((list) => {
    const entries = list.getEntries()
    const lastEntry = entries[entries.length - 1]
    console.log('LCP:', lastEntry.startTime)
  }).observe({ type: 'largest-contentful-paint', buffered: true })

  // Track FID (First Input Delay)
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const fid = entry.processingStart - entry.startTime
      console.log('FID:', fid)
    }
  }).observe({ type: 'first-input', buffered: true })
}

// Memory usage monitoring
export function getMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    return {
      used: Math.round(memory.usedJSHeapSize / 1048576),
      total: Math.round(memory.totalJSHeapSize / 1048576),
      limit: Math.round(memory.jsHeapSizeLimit / 1048576)
    }
  }
  return null
}