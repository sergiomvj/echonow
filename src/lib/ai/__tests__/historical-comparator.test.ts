import { HistoricalComparator } from '../historical-comparator'

// Mock OpenAI
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn()
        }
      }
    }))
  }
})

describe('HistoricalComparator', () => {
  let historicalComparator: HistoricalComparator
  let mockCreate: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    
    historicalComparator = new HistoricalComparator()
    
    // Mock OpenAI response
    mockCreate = jest.fn().mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            comparisons: [
              {
                event: 'Crise de 1929',
                year: 1929,
                similarity: 0.85,
                context: 'Crise econômica global',
                keyParallels: ['Colapso do mercado financeiro', 'Desemprego em massa'],
                differences: ['Contexto tecnológico diferente', 'Sistemas regulatórios mais desenvolvidos'],
                lessons: ['Importância da regulação financeira'],
                sources: ['História Econômica do Século XX']
              }
            ],
            overallAnalysis: 'Análise detalhada das semelhanças históricas'
          })
        }
      }]
    })
    
    // Set up the mock on the instance
    ;(historicalComparator as any).openai = {
      chat: {
        completions: {
          create: mockCreate
        }
      }
    }
  })

  describe('findHistoricalParallels', () => {
    test('finds historical parallels for current event', async () => {
      const currentEvent = {
        title: 'Crise Econômica Global 2024',
        context: 'Recessão mundial devido a fatores geopolíticos',
        date: new Date('2024-01-01'),
        category: 'Economia'
      }

      const result = await historicalComparator.findHistoricalParallels(currentEvent)

      expect(result).toMatchObject({
        comparisons: [
          {
            event: 'Crise de 1929',
            year: 1929,
            similarity: 0.85,
            context: 'Crise econômica global',
            keyParallels: expect.any(Array),
            differences: expect.any(Array),
            lessons: expect.any(Array),
            sources: expect.any(Array)
          }
        ],
        overallAnalysis: 'Análise detalhada das semelhanças históricas',
        searchMetadata: {
          query: currentEvent.title,
          category: currentEvent.category,
          searchDate: expect.any(Date),
          totalResults: 1
        }
      })

      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-4-turbo-preview',
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'system' }),
          expect.objectContaining({ role: 'user' })
        ]),
        temperature: 0.2,
        max_tokens: 2000
      })
    })

    test('handles different event categories', async () => {
      const politicalEvent = {
        title: 'Mudança de Regime Político',
        context: 'Transição democrática',
        date: new Date('2024-01-01'),
        category: 'Política'
      }

      await historicalComparator.findHistoricalParallels(politicalEvent)

      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            content: expect.stringContaining('eventos políticos')
          })
        ])
      }))
    })

    test('handles API errors gracefully', async () => {
      mockCreate.mockRejectedValueOnce(new Error('API Error'))

      const event = {
        title: 'Test Event',
        context: 'Test context',
        date: new Date('2024-01-01'),
        category: 'Geral'
      }

      await expect(historicalComparator.findHistoricalParallels(event))
        .rejects.toThrow('Failed to find historical parallels')
    })

    test('handles invalid JSON response', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: 'Invalid JSON response'
          }
        }]
      })

      const event = {
        title: 'Test Event',
        context: 'Test context',
        date: new Date('2024-01-01'),
        category: 'Geral'
      }

      const result = await historicalComparator.findHistoricalParallels(event)

      expect(result.comparisons).toHaveLength(0)
      expect(result.overallAnalysis).toContain('Não foi possível')
    })
  })

  describe('calculateSimilarityScore', () => {
    test('calculates similarity between events', async () => {
      const event1 = {
        title: 'Crise Econômica 2024',
        context: 'Recessão global',
        date: new Date('2024-01-01'),
        category: 'Economia'
      }

      const event2 = {
        title: 'Crise de 1929',
        context: 'Grande Depressão',
        year: 1929,
        category: 'Economia'
      }

      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              similarity: 0.78,
              reasoning: 'Ambos são crises econômicas globais'
            })
          }
        }]
      })

      const result = await historicalComparator.calculateSimilarityScore(event1, event2)

      expect(result).toEqual({
        score: 0.78,
        reasoning: 'Ambos são crises econômicas globais',
        confidence: expect.any(Number)
      })

      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        model: 'gpt-4-turbo-preview',
        temperature: 0.1
      }))
    })

    test('handles low similarity scores', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              similarity: 0.15,
              reasoning: 'Eventos muito diferentes'
            })
          }
        }]
      })

      const event1 = {
        title: 'Inovação Tecnológica',
        context: 'Nova descoberta científica',
        date: new Date('2024-01-01'),
        category: 'Tecnologia'
      }

      const event2 = {
        title: 'Guerra Civil',
        context: 'Conflito interno',
        year: 1861,
        category: 'Política'
      }

      const result = await historicalComparator.calculateSimilarityScore(event1, event2)

      expect(result.score).toBe(0.15)
      expect(result.confidence).toBeLessThan(0.5)
    })
  })

  describe('analyzeHistoricalTrends', () => {
    test('analyzes trends from multiple comparisons', async () => {
      const comparisons = [
        {
          event: 'Crise de 1929',
          year: 1929,
          similarity: 0.85,
          context: 'Crise econômica',
          keyParallels: ['Colapso financeiro'],
          differences: ['Contexto tecnológico'],
          lessons: ['Regulação necessária'],
          sources: ['História Econômica']
        },
        {
          event: 'Crise de 2008',
          year: 2008,
          similarity: 0.92,
          context: 'Crise subprime',
          keyParallels: ['Especulação imobiliária'],
          differences: ['Era digital'],
          lessons: ['Supervisão bancária'],
          sources: ['Análise Financeira']
        }
      ]

      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              patterns: ['Ciclos econômicos se repetem', 'Especulação gera bolhas'],
              frequency: 'Crises econômicas ocorrem a cada 15-20 anos',
              predictions: ['Próxima crise pode ocorrer em 2025-2030'],
              confidence: 0.75,
              recommendations: ['Fortalecer regulação financeira']
            })
          }
        }]
      })

      const result = await historicalComparator.analyzeHistoricalTrends(comparisons)

      expect(result).toMatchObject({
        patterns: expect.any(Array),
        frequency: expect.any(String),
        predictions: expect.any(Array),
        confidence: expect.any(Number),
        recommendations: expect.any(Array),
        methodology: expect.any(String)
      })

      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            content: expect.stringContaining('análise de tendências')
          })
        ])
      }))
    })

    test('handles empty comparisons array', async () => {
      const result = await historicalComparator.analyzeHistoricalTrends([])

      expect(result.patterns).toEqual([])
      expect(result.frequency).toBe('Dados insuficientes')
      expect(result.confidence).toBe(0)
    })
  })

  describe('private methods', () => {
    test('formatEventForAnalysis works correctly', () => {
      const event = {
        title: 'Test Event',
        context: 'Test context',
        date: new Date('2024-01-01'),
        category: 'Economia'
      }

      const formatted = (historicalComparator as any).formatEventForAnalysis(event)

      expect(formatted).toContain('Test Event')
      expect(formatted).toContain('Test context')
      expect(formatted).toContain('2024')
      expect(formatted).toContain('Economia')
    })

    test('validateComparison works correctly', () => {
      const validComparison = {
        event: 'Test Event',
        year: 1929,
        similarity: 0.85,
        context: 'Test context',
        keyParallels: ['Test parallel'],
        differences: ['Test difference'],
        lessons: ['Test lesson'],
        sources: ['Test source']
      }

      const invalidComparison = {
        event: 'Test Event',
        similarity: 1.5, // Invalid similarity score
        keyParallels: []
      }

      const valid = (historicalComparator as any).validateComparison(validComparison)
      const invalid = (historicalComparator as any).validateComparison(invalidComparison)

      expect(valid).toBe(true)
      expect(invalid).toBe(false)
    })

    test('categorizeHistoricalPeriod works correctly', () => {
      const ancient = (historicalComparator as any).categorizeHistoricalPeriod(500)
      const medieval = (historicalComparator as any).categorizeHistoricalPeriod(1200)
      const modern = (historicalComparator as any).categorizeHistoricalPeriod(1800)
      const contemporary = (historicalComparator as any).categorizeHistoricalPeriod(1950)

      expect(ancient).toBe('Antiguidade')
      expect(medieval).toBe('Medieval')
      expect(modern).toBe('Era Moderna')
      expect(contemporary).toBe('Era Contemporânea')
    })
  })
})