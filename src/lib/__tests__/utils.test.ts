import { 
  formatRelativeTime, 
  formatNumber, 
  getBiasColor, 
  getBiasLabel,
  cn 
} from '../utils'

describe('formatRelativeTime', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-01-15T10:00:00Z'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  test('formats recent time correctly', () => {
    const fiveMinutesAgo = new Date('2024-01-15T09:55:00Z')
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('há 5 minutos')
  })

  test('formats hours correctly', () => {
    const twoHoursAgo = new Date('2024-01-15T08:00:00Z')
    expect(formatRelativeTime(twoHoursAgo)).toBe('há 2 horas')
  })

  test('formats days correctly', () => {
    const threeDaysAgo = new Date('2024-01-12T10:00:00Z')
    expect(formatRelativeTime(threeDaysAgo)).toBe('há 3 dias')
  })

  test('formats weeks correctly', () => {
    const twoWeeksAgo = new Date('2024-01-01T10:00:00Z')
    expect(formatRelativeTime(twoWeeksAgo)).toBe('há 2 semanas')
  })

  test('formats months correctly', () => {
    const threeMonthsAgo = new Date('2023-10-15T10:00:00Z')
    expect(formatRelativeTime(threeMonthsAgo)).toBe('há 3 meses')
  })

  test('formats years correctly', () => {
    const twoYearsAgo = new Date('2022-01-15T10:00:00Z')
    expect(formatRelativeTime(twoYearsAgo)).toBe('há 2 anos')
  })
})

describe('formatNumber', () => {
  test('formats small numbers correctly', () => {
    expect(formatNumber(123)).toBe('123')
    expect(formatNumber(999)).toBe('999')
  })

  test('formats thousands correctly', () => {
    expect(formatNumber(1000)).toBe('1K')
    expect(formatNumber(1500)).toBe('1.5K')
    expect(formatNumber(12300)).toBe('12.3K')
    expect(formatNumber(999999)).toBe('1000K')
  })

  test('formats millions correctly', () => {
    expect(formatNumber(1000000)).toBe('1M')
    expect(formatNumber(1500000)).toBe('1.5M')
    expect(formatNumber(12300000)).toBe('12.3M')
  })

  test('formats billions correctly', () => {
    expect(formatNumber(1000000000)).toBe('1B')
    expect(formatNumber(1500000000)).toBe('1.5B')
  })
})

describe('getBiasColor', () => {
  test('returns green for low bias scores', () => {
    expect(getBiasColor(0.1)).toBe('#10B981')
    expect(getBiasColor(0.2)).toBe('#10B981')
  })

  test('returns yellow for moderate bias scores', () => {
    expect(getBiasColor(0.4)).toBe('#F59E0B')
    expect(getBiasColor(0.5)).toBe('#F59E0B')
  })

  test('returns red for high bias scores', () => {
    expect(getBiasColor(0.7)).toBe('#EF4444')
    expect(getBiasColor(0.9)).toBe('#EF4444')
  })

  test('handles edge cases', () => {
    expect(getBiasColor(0)).toBe('#10B981')
    expect(getBiasColor(1)).toBe('#EF4444')
    expect(getBiasColor(0.3)).toBe('#10B981')
    expect(getBiasColor(0.6)).toBe('#EF4444')
  })
})

describe('getBiasLabel', () => {
  test('returns correct labels for different bias scores', () => {
    expect(getBiasLabel(0.1)).toBe('Muito Baixo')
    expect(getBiasLabel(0.2)).toBe('Baixo')
    expect(getBiasLabel(0.4)).toBe('Moderado')
    expect(getBiasLabel(0.7)).toBe('Alto')
    expect(getBiasLabel(0.9)).toBe('Muito Alto')
  })

  test('handles edge cases', () => {
    expect(getBiasLabel(0)).toBe('Muito Baixo')
    expect(getBiasLabel(1)).toBe('Muito Alto')
    expect(getBiasLabel(0.2)).toBe('Baixo')
    expect(getBiasLabel(0.6)).toBe('Alto')
  })
})

describe('cn (className utility)', () => {
  test('merges class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
    expect(cn('class1', undefined, 'class2')).toBe('class1 class2')
    expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3')
  })

  test('handles Tailwind conflicts correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  test('handles conditional classes', () => {
    expect(cn('base', true && 'conditional')).toBe('base conditional')
    expect(cn('base', false && 'conditional')).toBe('base')
  })

  test('handles empty inputs', () => {
    expect(cn()).toBe('')
    expect(cn('')).toBe('')
    expect(cn(undefined, null, false)).toBe('')
  })
})