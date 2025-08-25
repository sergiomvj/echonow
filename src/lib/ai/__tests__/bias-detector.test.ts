import { BiasDetector } from '../bias-detector'

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

describe('BiasDetector', () => {
  let biasDetector: BiasDetector
  let mockCreate: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    
    biasDetector = new BiasDetector()
    
    // Mock OpenAI response
    mockCreate = jest.fn().mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            political: 0.2,
            emotional: 0.3,
            factual: 0.1,
            linguistic: 0.2,
            overall: 0.2,
            confidence: 0.8,
            explanation: 'Test explanation',
            indicators: ['Test indicator'],
            suggestions: ['Test suggestion']
          })
        }
      }]
    })
    
    // Set up the mock on the instance
    ;(biasDetector as any).openai = {
      chat: {
        completions: {
          create: mockCreate
        }
      }
    }
  })

  describe('analyzeContent', () => {
    test('analyzes neutral content correctly', async () => {
      const neutralContent = 'The technology industry continues to grow at a steady pace. Companies are investing in research and development.'
      
      const result = await biasDetector.analyzeContent(neutralContent)
      
      expect(result).toMatchObject({
        overallScore: expect.any(Number),
        categories: {
          political: expect.any(Number),
          emotional: expect.any(Number),
          linguistic: expect.any(Number),
          factual: expect.any(Number)
        },
        indicators: expect.any(Array),
        suggestions: expect.any(Array),
        confidence: expect.any(Number),
        explanation: expect.any(String)
      })
      
      expect(result.overallScore).toBeGreaterThanOrEqual(0)
      expect(result.overallScore).toBeLessThanOrEqual(1)
    })

    test('detects political bias in content', async () => {
      const politicalContent = 'The conservative government\\'s policies are obviously flawed. Liberal approaches are clearly superior.'
      
      const result = await biasDetector.analyzeContent(politicalContent)
      
      // Rule-based analysis should detect political keywords
      expect(result.categories.political).toBeGreaterThan(0)
    })

    test('detects emotional bias in content', async () => {
      const emotionalContent = 'This is absolutely amazing and incredibly wonderful! Everyone will obviously love this fantastic solution.'
      
      const result = await biasDetector.analyzeContent(emotionalContent)
      
      // Rule-based analysis should detect emotional language
      expect(result.categories.emotional).toBeGreaterThan(0)
    })

    test('detects linguistic bias in content', async () => {
      const linguisticContent = 'All people always think this. Everyone agrees that this is definitely the only solution.'
      
      const result = await biasDetector.analyzeContent(linguisticContent)
      
      // Rule-based analysis should detect absolute statements
      expect(result.categories.linguistic).toBeGreaterThan(0)
    })

    test('handles empty content', async () => {
      const result = await biasDetector.analyzeContent('')
      
      expect(result.overallScore).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeGreaterThan(0)
    })

    test('includes suggestions when requested', async () => {
      const content = 'Test content'
      
      const result = await biasDetector.analyzeContent(content, {
        includeSuggestions: true
      })
      
      expect(result.suggestions).toBeDefined()
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            content: expect.stringContaining('suggestions')
          })
        ])
      }))
    })

    test('handles AI service errors gracefully', async () => {
      mockCreate.mockRejectedValueOnce(new Error('AI Service Error'))
      
      const result = await biasDetector.analyzeContent('Test content')
      
      // Should return fallback analysis
      expect(result).toMatchObject({
        overallScore: expect.any(Number),
        categories: expect.any(Object),
        indicators: expect.arrayContaining(['Análise de viés indisponível']),
        confidence: 0.1
      })
    })

    test('handles invalid JSON response from AI', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: 'Invalid JSON response'
          }
        }]
      })
      
      const result = await biasDetector.analyzeContent('Test content')
      
      // Should fall back to parsed response
      expect(result).toMatchObject({
        overallScore: expect.any(Number),
        categories: expect.any(Object)
      })
    })
  })

  describe('batchAnalyze', () => {
    test('analyzes multiple contents', async () => {
      const contents = [
        'First neutral content',
        'Second neutral content',
        'Third neutral content'
      ]
      
      const results = await biasDetector.batchAnalyze(contents)
      
      expect(results).toHaveLength(3)
      results.forEach(result => {
        expect(result).toMatchObject({
          overallScore: expect.any(Number),
          categories: expect.any(Object)
        })
      })
    })

    test('handles failures in batch analysis', async () => {
      mockCreate
        .mockResolvedValueOnce({ choices: [{ message: { content: JSON.stringify({ overall: 0.2, political: 0.1, emotional: 0.1, factual: 0.1, linguistic: 0.1, confidence: 0.8, explanation: 'Test', indicators: [], suggestions: [] }) } }] })
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce({ choices: [{ message: { content: JSON.stringify({ overall: 0.3, political: 0.1, emotional: 0.1, factual: 0.1, linguistic: 0.1, confidence: 0.8, explanation: 'Test', indicators: [], suggestions: [] }) } }] })
      
      const contents = ['Content 1', 'Content 2', 'Content 3']
      const results = await biasDetector.batchAnalyze(contents)
      
      expect(results).toHaveLength(3)
      expect(results[0].overallScore).toBe(0.2)
      expect(results[1]).toMatchObject({ overallScore: expect.any(Number) }) // Fallback
      expect(results[2].overallScore).toBe(0.3)
    })
  })

  describe('compareArticles', () => {
    test('compares two articles', async () => {
      const article1 = 'First article content'
      const article2 = 'Second article content'
      
      // Mock comparison response
      mockCreate.mockImplementation((params) => {
        if (params.messages.some((m: any) => m.content.includes('Compare these two'))) {
          return Promise.resolve({
            choices: [{
              message: {
                content: 'Article 1 is more objective. Key differences include... Recommendation: read both sources.'
              }
            }]
          })
        }
        return Promise.resolve({
          choices: [{
            message: {
              content: JSON.stringify({
                political: 0.2, emotional: 0.1, factual: 0.1, linguistic: 0.1,
                overall: 0.15, confidence: 0.8, explanation: 'Test', indicators: [], suggestions: []
              })
            }
          }]
        })
      })
      
      const result = await biasDetector.compareArticles(article1, article2)
      
      expect(result).toMatchObject({
        article1Bias: expect.any(Object),
        article2Bias: expect.any(Object),
        comparison: expect.any(String),
        recommendation: expect.any(String)
      })
    })
  })

  describe('utility methods', () => {
    test('getBiasLabel returns correct labels', () => {
      expect(biasDetector.getBiasLabel(0.1)).toBe('Muito Baixo')
      expect(biasDetector.getBiasLabel(0.3)).toBe('Baixo')
      expect(biasDetector.getBiasLabel(0.5)).toBe('Moderado')
      expect(biasDetector.getBiasLabel(0.7)).toBe('Alto')
      expect(biasDetector.getBiasLabel(0.9)).toBe('Muito Alto')
    })

    test('getBiasColor returns correct colors', () => {
      expect(biasDetector.getBiasColor(0.2)).toBe('#10B981') // green
      expect(biasDetector.getBiasColor(0.5)).toBe('#F59E0B') // yellow
      expect(biasDetector.getBiasColor(0.8)).toBe('#EF4444') // red
    })
  })

  describe('rule-based analysis', () => {
    test('identifies political keywords', () => {
      const politicalContent = 'The conservative party and liberal opposition disagree on capitalism versus socialism.'
      
      const analysis = (biasDetector as any).runRuleBasedAnalysis(politicalContent)
      
      expect(analysis.political).toBeGreaterThan(0)
      expect(analysis.indicators.some((i: string) => i.includes('political'))).toBe(true)
    })

    test('identifies emotional language', () => {
      const emotionalContent = 'This is absolutely incredible and obviously the best solution ever!'
      
      const analysis = (biasDetector as any).runRuleBasedAnalysis(emotionalContent)
      
      expect(analysis.emotional).toBeGreaterThan(0)
    })

    test('identifies linguistic bias patterns', () => {
      const linguisticContent = 'Everyone always agrees that this is definitely the only solution.'
      
      const analysis = (biasDetector as any).runRuleBasedAnalysis(linguisticContent)
      
      expect(analysis.linguistic).toBeGreaterThan(0)
    })
  })
})", "original_text": "", "replace_all": false}]