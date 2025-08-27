import { renderHook, act } from '@testing-library/react'
import { useResponsive, useMediaQuery, useResponsiveValue, useResponsiveColumns } from '../useResponsive'

// Mock window object
const mockWindow = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  matchMedia: jest.fn()
}

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}))

beforeAll(() => {
  Object.defineProperty(global, 'window', {
    value: mockWindow,
    writable: true
  })
})

beforeEach(() => {
  jest.clearAllMocks()
  mockWindow.innerWidth = 1024
  mockWindow.innerHeight = 768
})

describe('useResponsive', () => {
  it('should return correct initial values for desktop', () => {
    const { result } = renderHook(() => useResponsive())
    
    expect(result.current.width).toBe(1024)
    expect(result.current.height).toBe(768)
    expect(result.current.isDesktop).toBe(true)
    expect(result.current.isMobile).toBe(false)
    expect(result.current.isTablet).toBe(false)
    expect(result.current.isLandscape).toBe(true)
    expect(result.current.isPortrait).toBe(false)
  })

  it('should detect mobile screen size', () => {
    mockWindow.innerWidth = 375
    mockWindow.innerHeight = 667
    
    const { result } = renderHook(() => useResponsive())
    
    expect(result.current.isMobile).toBe(true)
    expect(result.current.isDesktop).toBe(false)
    expect(result.current.isTablet).toBe(false)
    expect(result.current.isPortrait).toBe(true)
  })

  it('should detect tablet screen size', () => {
    mockWindow.innerWidth = 768
    mockWindow.innerHeight = 1024
    
    const { result } = renderHook(() => useResponsive())
    
    expect(result.current.isTablet).toBe(true)
    expect(result.current.isMobile).toBe(false)
    expect(result.current.isDesktop).toBe(false)
  })

  it('should provide correct breakpoint checks', () => {
    mockWindow.innerWidth = 1280
    
    const { result } = renderHook(() => useResponsive())
    
    expect(result.current.isAbove('lg')).toBe(true)
    expect(result.current.isAbove('xl')).toBe(true)
    expect(result.current.isBelow('2xl')).toBe(true)
    expect(result.current.isBetween('lg', '2xl')).toBe(true)
  })

  it('should handle window resize', () => {
    const { result } = renderHook(() => useResponsive())
    
    // Simulate window resize
    act(() => {
      mockWindow.innerWidth = 640
      mockWindow.innerHeight = 480
      const resizeHandler = mockWindow.addEventListener.mock.calls.find(
        call => call[0] === 'resize'
      )?.[1]
      resizeHandler?.()
    })
    
    expect(result.current.width).toBe(640)
    expect(result.current.height).toBe(480)
    expect(result.current.isMobile).toBe(true)
  })
})

describe('useMediaQuery', () => {
  it('should return match result', () => {
    const mockMediaQuery = {
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    }
    
    mockWindow.matchMedia.mockReturnValue(mockMediaQuery)
    
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    
    expect(result.current).toBe(true)
    expect(mockWindow.matchMedia).toHaveBeenCalledWith('(min-width: 768px)')
  })

  it('should handle media query changes', () => {
    const mockMediaQuery = {
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    }
    
    mockWindow.matchMedia.mockReturnValue(mockMediaQuery)
    
    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'))
    
    expect(result.current).toBe(false)
    
    // Simulate media query change
    act(() => {
      const changeHandler = mockMediaQuery.addEventListener.mock.calls.find(
        call => call[0] === 'change'
      )?.[1]
      changeHandler?.({ matches: true })
    })
    
    expect(result.current).toBe(true)
  })
})

describe('useResponsiveValue', () => {
  it('should return correct value for current breakpoint', () => {
    mockWindow.innerWidth = 1024
    
    const values = {
      base: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 5
    }
    
    const { result } = renderHook(() => useResponsiveValue(values))
    
    expect(result.current).toBe(4) // lg breakpoint
  })

  it('should fallback to base value', () => {
    mockWindow.innerWidth = 320 // below xs
    
    const values = {
      base: 1,
      md: 3,
      lg: 4
    }
    
    const { result } = renderHook(() => useResponsiveValue(values))
    
    expect(result.current).toBe(1) // base fallback
  })

  it('should use largest matching breakpoint', () => {
    mockWindow.innerWidth = 1280 // xl
    
    const values = {
      base: 1,
      sm: 2,
      md: 3,
      lg: 4
      // no xl value, should use lg
    }
    
    const { result } = renderHook(() => useResponsiveValue(values))
    
    expect(result.current).toBe(4) // lg value (largest available)
  })
})

describe('useResponsiveColumns', () => {
  it('should return correct columns for mobile', () => {
    mockWindow.innerWidth = 375
    
    const config = {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 5
    }
    
    const { result } = renderHook(() => useResponsiveColumns(config))
    
    expect(result.current).toBe(1)
  })

  it('should return correct columns for desktop', () => {
    mockWindow.innerWidth = 1024
    
    const config = {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 5
    }
    
    const { result } = renderHook(() => useResponsiveColumns(config))
    
    expect(result.current).toBe(4)
  })

  it('should handle missing breakpoint values', () => {
    mockWindow.innerWidth = 768 // md
    
    const config = {
      xs: 1,
      lg: 4
      // missing sm, md - should fallback appropriately
    }
    
    const { result } = renderHook(() => useResponsiveColumns(config))
    
    expect(result.current).toBe(1) // fallback to xs
  })

  it('should use default fallbacks', () => {
    mockWindow.innerWidth = 640 // sm
    
    const config = {} // empty config
    
    const { result } = renderHook(() => useResponsiveColumns(config))
    
    expect(result.current).toBe(2) // default sm fallback
  })
})