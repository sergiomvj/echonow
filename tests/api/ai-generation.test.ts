import { NextRequest } from 'next/server'
import { POST } from '../../src/app/api/ai/generate/route'
import { getServerSession } from 'next-auth/next'

// Mock dependencies
jest.mock('next-auth/next')
jest.mock('../../src/lib/auth/config')
jest.mock('../../src/lib/auth/utils')
jest.mock('../../src/lib/ai/content-generator')

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

// Mock content generator
const mockContentGenerator = {
  generateArticle: jest.fn(),
  generateShortScript: jest.fn(),
  enhanceWithHistoricalContext: jest.fn()
}

jest.mock('../../src/lib/ai/content-generator', () => ({
  contentGenerator: mockContentGenerator
}))

describe('/api/ai/generate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST', () => {
    it('should require authentication', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/ai/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Test topic',
          type: 'article'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Authentication required')
    })

    it('should generate article content', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1', subscription: 'premium' }
      })

      const mockGeneratedContent = {
        title: 'Generated Article',
        content: 'Generated content...',
        summary: 'Article summary',
        tags: ['tag1', 'tag2'],
        category: 'Technology',
        readTime: 5,
        biasScore: 0.2,
        keyPoints: ['Point 1', 'Point 2']
      }

      mockContentGenerator.generateArticle.mockResolvedValue(mockGeneratedContent)

      const request = new NextRequest('http://localhost:3000/api/ai/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Artificial Intelligence in Healthcare',
          type: 'article',
          style: 'neutral',
          length: 'medium'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.title).toBe('Generated Article')
      expect(data.contentType).toBe('article')
      expect(mockContentGenerator.generateArticle).toHaveBeenCalledWith({
        topic: 'Artificial Intelligence in Healthcare',
        style: 'neutral',
        length: 'medium',
        targetAudience: 'general',
        includeSources: true
      })
    })

    it('should generate short content with script', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1', subscription: 'premium' }
      })

      const mockBaseContent = {
        title: 'Short Title',
        summary: 'Short summary',
        category: 'Technology',
        content: 'Base content',
        tags: ['short'],
        readTime: 1,
        biasScore: 0.1,
        keyPoints: ['Key point']
      }

      const mockScript = '[0:00] Hook content [0:10] Main point...'

      mockContentGenerator.generateArticle.mockResolvedValue(mockBaseContent)
      mockContentGenerator.generateShortScript.mockResolvedValue(mockScript)

      const request = new NextRequest('http://localhost:3000/api/ai/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: 'AI in 60 seconds',
          type: 'short'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.script).toBe(mockScript)
      expect(data.type).toBe('short')
    })

    it('should generate analysis with historical context', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1', subscription: 'premium' }
      })

      const mockAnalysisContent = {
        title: 'Analysis Title',
        content: 'Analysis content',
        summary: 'Analysis summary',
        tags: ['analysis'],
        category: 'Politics',
        readTime: 8,
        biasScore: 0.15,
        keyPoints: ['Analysis point']
      }

      const mockHistoricalContext = [
        {
          id: 'hist-1',
          title: 'Similar Event 1990',
          description: 'Historical context',
          year: 1990,
          relevanceScore: 0.8
        }
      ]

      mockContentGenerator.generateArticle.mockResolvedValue(mockAnalysisContent)
      mockContentGenerator.enhanceWithHistoricalContext.mockResolvedValue(mockHistoricalContext)

      const request = new NextRequest('http://localhost:3000/api/ai/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Political Crisis Analysis',
          type: 'analysis',
          includeHistorical: true
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.historicalParallels).toEqual(mockHistoricalContext)
    })

    it('should validate request data', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1', subscription: 'premium' }
      })

      const request = new NextRequest('http://localhost:3000/api/ai/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Hi', // too short
          type: 'article'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Topic must be at least 5 characters')
    })

    it('should handle invalid content type', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1', subscription: 'premium' }
      })

      const request = new NextRequest('http://localhost:3000/api/ai/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Valid topic',
          type: 'invalid-type'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid content type')
    })

    it('should handle content generation errors', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1', subscription: 'premium' }
      })

      mockContentGenerator.generateArticle.mockRejectedValue(new Error('AI service unavailable'))

      const request = new NextRequest('http://localhost:3000/api/ai/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Test topic',
          type: 'article'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to generate content')
    })
  })

  describe('GET - Generation History', () => {
    it('should return user generation history', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user-1', subscription: 'premium' }
      })

      const request = new NextRequest('http://localhost:3000/api/ai/generate?limit=5', {
        method: 'GET'
      })

      // Mock GET method from the route
      // This would need to be implemented in the actual route file
      // For now, we'll test the structure we expect
      
      // const response = await GET(request)
      // const data = await response.json()

      // expect(response.status).toBe(200)
      // expect(data.history).toBeDefined()
      // expect(data.total).toBeDefined()
    })
  })
})