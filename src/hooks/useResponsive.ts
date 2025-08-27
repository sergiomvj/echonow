'use client'

import { useState, useEffect } from 'react'

// Breakpoint definitions matching Tailwind config
export const BREAKPOINTS = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

type Breakpoint = keyof typeof BREAKPOINTS

interface UseResponsiveReturn {
  // Current screen size
  width: number
  height: number
  
  // Breakpoint checks
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isWide: boolean
  
  // Specific breakpoint checks
  isXs: boolean
  isSm: boolean
  isMd: boolean
  isLg: boolean
  isXl: boolean
  is2Xl: boolean
  
  // Utility functions
  isAbove: (breakpoint: Breakpoint) => boolean
  isBelow: (breakpoint: Breakpoint) => boolean
  isBetween: (min: Breakpoint, max: Breakpoint) => boolean
  
  // Orientation
  isLandscape: boolean
  isPortrait: boolean
  
  // Device capabilities
  isTouch: boolean
  hasHover: boolean
  prefersReducedMotion: boolean
}

export function useResponsive(): UseResponsiveReturn {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  })

  const [deviceCapabilities, setDeviceCapabilities] = useState({
    isTouch: false,
    hasHover: true,
    prefersReducedMotion: false,
  })

  useEffect(() => {
    // Update dimensions
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Update device capabilities
    const updateCapabilities = () => {
      setDeviceCapabilities({
        isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        hasHover: window.matchMedia('(hover: hover)').matches,
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      })
    }

    updateDimensions()
    updateCapabilities()

    // Event listeners
    window.addEventListener('resize', updateDimensions)
    
    // Media query listeners
    const hoverQuery = window.matchMedia('(hover: hover)')
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    hoverQuery.addEventListener('change', updateCapabilities)
    motionQuery.addEventListener('change', updateCapabilities)

    return () => {
      window.removeEventListener('resize', updateDimensions)
      hoverQuery.removeEventListener('change', updateCapabilities)
      motionQuery.removeEventListener('change', updateCapabilities)
    }
  }, [])

  const { width, height } = dimensions
  const { isTouch, hasHover, prefersReducedMotion } = deviceCapabilities

  // Breakpoint helpers
  const isAbove = (breakpoint: Breakpoint) => width >= BREAKPOINTS[breakpoint]
  const isBelow = (breakpoint: Breakpoint) => width < BREAKPOINTS[breakpoint]
  const isBetween = (min: Breakpoint, max: Breakpoint) => 
    width >= BREAKPOINTS[min] && width < BREAKPOINTS[max]

  // Category checks
  const isMobile = isBelow('md')
  const isTablet = isBetween('md', 'lg')
  const isDesktop = isAbove('lg')
  const isWide = isAbove('xl')

  // Specific breakpoints
  const isXs = isBetween('xs', 'sm')
  const isSm = isBetween('sm', 'md')
  const isMd = isBetween('md', 'lg')
  const isLg = isBetween('lg', 'xl')
  const isXl = isBetween('xl', '2xl')
  const is2Xl = isAbove('2xl')

  // Orientation
  const isLandscape = width > height
  const isPortrait = height > width

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    isAbove,
    isBelow,
    isBetween,
    isLandscape,
    isPortrait,
    isTouch,
    hasHover,
    prefersReducedMotion,
  }
}

// Media query hook for specific queries
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}

// Viewport hook for intersection observer
export function useInViewport(options?: IntersectionObserverInit) {
  const [isInViewport, setIsInViewport] = useState(false)
  const [ref, setRef] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!ref) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting)
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    )

    observer.observe(ref)

    return () => {
      if (ref) observer.unobserve(ref)
    }
  }, [ref, options])

  return [setRef, isInViewport] as const
}

// Responsive value hook
export function useResponsiveValue<T>(values: Partial<Record<Breakpoint | 'base', T>>): T {
  const { width } = useResponsive()
  
  // Sort breakpoints by size (largest first)
  const sortedBreakpoints = Object.keys(BREAKPOINTS)
    .sort((a, b) => BREAKPOINTS[b as Breakpoint] - BREAKPOINTS[a as Breakpoint]) as Breakpoint[]
  
  // Find the appropriate value
  for (const breakpoint of sortedBreakpoints) {
    if (values[breakpoint] !== undefined && width >= BREAKPOINTS[breakpoint]) {
      return values[breakpoint]!
    }
  }
  
  // Fallback to base value
  return values.base!
}

// Responsive grid columns
export function useResponsiveColumns(config: {
  xs?: number
  sm?: number 
  md?: number
  lg?: number
  xl?: number
  '2xl'?: number
}): number {
  return useResponsiveValue({
    base: config.xs || 1,
    xs: config.xs || 1,
    sm: config.sm || config.xs || 2,
    md: config.md || config.sm || 3,
    lg: config.lg || config.md || 4,
    xl: config.xl || config.lg || 5,
    '2xl': config['2xl'] || config.xl || 6,
  })
}