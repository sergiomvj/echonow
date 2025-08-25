import { ContentGenerator } from '../ai/content-generator'
import { Article } from '@/types'

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

describe('ContentGenerator', () => {
  let contentGenerator: ContentGenerator
  let mockCreate: jest.Mock

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    contentGenerator = new ContentGenerator()
    
    // Mock OpenAI response
    mockCreate = jest.fn().mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            title: 'Test Article Title',
            content: 'This is a test article content with multiple sentences. It provides comprehensive information about the topic.',
            summary: 'Test summary of the article',
            tags: ['test', 'article', 'content'],
            category: 'Tecnologia',
            keyPoints: ['Key point 1', 'Key point 2']
          })
        }
      }]
    })
    
    // Set up the mock on the instance
    ;(contentGenerator as any).openai = {
      chat: {
        completions: {
          create: mockCreate
        }
      }
    }
  })

  describe('generateArticle', () => {
    test('generates article with valid request', async () => {
      const request = {
        topic: 'AI Technology',
        style: 'neutral' as const,
        length: 'medium' as const
      }

      const result = await contentGenerator.generateArticle(request)

      expect(result).toMatchObject({
        title: 'Test Article Title',
        content: expect.any(String),
        summary: 'Test summary of the article',
        tags: ['test', 'article', 'content'],
        category: 'Tecnologia',
        keyPoints: ['Key point 1', 'Key point 2'],
        readTime: expect.any(Number),
        biasScore: expect.any(Number)
      })

      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-4-turbo-preview',
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'system' }),
          expect.objectContaining({ role: 'user' })
        ]),
        temperature: 0.3,
        max_tokens: 1200
      })
    })

    test('handles different article lengths', async () => {
      const shortRequest = {
        topic: 'Test Topic',
        length: 'short' as const
      }

      await contentGenerator.generateArticle(shortRequest)

      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        max_tokens: 600
      }))
    })

    test('handles different writing styles', async () => {
      const analyticalRequest = {
        topic: 'Test Topic',
        style: 'analytical' as const
      }

      await contentGenerator.generateArticle(analyticalRequest)

      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ 
            role: 'system',
            content: expect.stringContaining('analytical')
          })
        ])
      }))
    })

    test('handles API errors gracefully', async () => {
      mockCreate.mockRejectedValueOnce(new Error('API Error'))

      const request = {
        topic: 'Test Topic'
      }

      await expect(contentGenerator.generateArticle(request))
        .rejects.toThrow('Failed to generate article content')
    })

    test('handles invalid JSON response', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: 'Invalid JSON response'
          }
        }]
      })

      const request = {
        topic: 'Test Topic'
      }

      const result = await contentGenerator.generateArticle(request)
      
      expect(result.title).toContain('Test Topic')
      expect(result.category).toBe('Geral')
    })
  })

  describe('generateShortScript', () => {
    test('generates short script for article', async () => {
      const mockArticle: Article = {
        id: '1',
        title: 'Test Article',
        summary: 'Test summary',
        category: 'Tecnologia',
        content: 'Test content',
        tags: ['test'],
        author: 'Test Author',
        authorType: 'human',
        biasScore: 0.2,
        viewCount: 100,
        likes: 10,
        shares: 5,
        readTime: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        isExclusive: false
      }

      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: '[0:00] Hook content [0:15] Main content [0:45] Call to action'
          }
        }]
      })

      const result = await contentGenerator.generateShortScript('1', mockArticle)

      expect(result).toContain('[0:00]')
      expect(result).toContain('Hook')
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        model: 'gpt-4-turbo-preview',
        temperature: 0.4,
        max_tokens: 300
      }))
    })
  })

  describe('generateCustomPrompt', () => {
    test('processes custom prompt correctly', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: 'Custom response to the prompt'
          }
        }]
      })

      const result = await contentGenerator.generateCustomPrompt(
        'Explain AI ethics',
        'Technology context'
      )

      expect(result).toBe('Custom response to the prompt')
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            content: expect.stringContaining('Technology context')
          })
        ])
      }))
    })
  })

  describe('private methods', () => {
    test('calculateBasicBiasScore works correctly', async () => {
      const neutralContent = 'This is a factual article about technology.'
      const biasedContent = 'Obviously, this is clearly the best solution that everyone should use.'

      // Access private method for testing
      const neutralScore = await (contentGenerator as any).calculateBasicBiasScore(neutralContent)
      const biasedScore = await (contentGenerator as any).calculateBasicBiasScore(biasedContent)

      expect(neutralScore).toBeLessThan(biasedScore)
      expect(neutralScore).toBeGreaterThanOrEqual(0)
      expect(biasedScore).toBeLessThanOrEqual(1)
    })

    test('validateCategory works correctly', () => {
      const validCategory = (contentGenerator as any).validateCategory('Tecnologia')
      const invalidCategory = (contentGenerator as any).validateCategory('Invalid Category')

      expect(validCategory).toBe('Tecnologia')
      expect(invalidCategory).toBe('Geral')
    })
  })
})", "original_text": "", "replace_all": false}]