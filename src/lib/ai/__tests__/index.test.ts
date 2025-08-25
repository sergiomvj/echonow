import { AIService } from '../index'
import { ContentGenerator } from '../content-generator'
import { BiasDetector } from '../bias-detector'
import { VoiceSynthesizer } from '../voice-synthesizer'
import { HistoricalComparator } from '../historical-comparator'

// Mock all AI services
jest.mock('../content-generator')
jest.mock('../bias-detector')
jest.mock('../voice-synthesizer')
jest.mock('../historical-comparator')

describe('AIService', () => {
  let aiService: AIService
  let mockContentGenerator: jest.Mocked<ContentGenerator>
  let mockBiasDetector: jest.Mocked<BiasDetector>
  let mockVoiceSynthesizer: jest.Mocked<VoiceSynthesizer>
  let mockHistoricalComparator: jest.Mocked<HistoricalComparator>

  beforeEach(() => {
    jest.clearAllMocks()

    // Create mocked instances
    mockContentGenerator = {
      generateArticle: jest.fn(),
      generateShortScript: jest.fn(),
      generateCustomPrompt: jest.fn()
    } as any

    mockBiasDetector = {
      analyzeContent: jest.fn(),
      generateNeutralVersion: jest.fn(),
      detectBiasSignals: jest.fn()
    } as any

    mockVoiceSynthesizer = {
      synthesizeText: jest.fn(),
      synthesizeShort: jest.fn(),
      getAvailableVoices: jest.fn()
    } as any

    mockHistoricalComparator = {
      findHistoricalParallels: jest.fn(),
      calculateSimilarityScore: jest.fn(),
      analyzeHistoricalTrends: jest.fn()
    } as any

    // Mock constructor returns
    ;(ContentGenerator as jest.Mock).mockImplementation(() => mockContentGenerator)
    ;(BiasDetector as jest.Mock).mockImplementation(() => mockBiasDetector)
    ;(VoiceSynthesizer as jest.Mock).mockImplementation(() => mockVoiceSynthesizer)
    ;(HistoricalComparator as jest.Mock).mockImplementation(() => mockHistoricalComparator)

    aiService = new AIService()
  })

  describe('generateContent', () => {
    test('generates article content successfully', async () => {
      const mockArticle = {
        title: 'Test Article',
        content: 'Test content',
        summary: 'Test summary',
        tags: ['test'],
        category: 'Tecnologia',
        keyPoints: ['Point 1'],
        readTime: 5,
        biasScore: 0.2
      }

      mockContentGenerator.generateArticle.mockResolvedValue(mockArticle)

      const request = {
        topic: 'AI Technology',
        style: 'neutral' as const,
        length: 'medium' as const
      }

      const result = await aiService.generateContent(request)

      expect(result).toEqual(mockArticle)
      expect(mockContentGenerator.generateArticle).toHaveBeenCalledWith(request)
    })

    test('handles content generation errors', async () => {
      mockContentGenerator.generateArticle.mockRejectedValue(new Error('Generation failed'))

      const request = {
        topic: 'Test Topic'
      }

      await expect(aiService.generateContent(request))
        .rejects.toThrow('Content generation failed')
    })
  })

  describe('analyzeBias', () => {
    test('analyzes content bias successfully', async () => {
      const mockAnalysis = {
        overallScore: 0.25,
        signals: [
          {
            type: 'loaded_language',
            severity: 'medium',
            examples: ['obviously', 'clearly'],
            suggestion: 'Use neutral language'
          }
        ],
        breakdown: {
          emotional: 0.3,
          political: 0.1,
          commercial: 0.4,
          cultural: 0.2
        },
        recommendations: ['Remove emotional language'],
        confidence: 0.85
      }

      mockBiasDetector.analyzeContent.mockResolvedValue(mockAnalysis)

      const content = 'This is obviously the best solution that everyone should use.'

      const result = await aiService.analyzeBias(content)

      expect(result).toEqual(mockAnalysis)
      expect(mockBiasDetector.analyzeContent).toHaveBeenCalledWith(content)
    })

    test('handles bias analysis errors', async () => {
      mockBiasDetector.analyzeContent.mockRejectedValue(new Error('Analysis failed'))

      await expect(aiService.analyzeBias('test content'))
        .rejects.toThrow('Bias analysis failed')
    })
  })

  describe('synthesizeVoice', () => {
    test('synthesizes voice successfully', async () => {
      const mockResult = {
        audioBuffer: new ArrayBuffer(1024),
        contentType: 'audio/mpeg',
        voiceId: 'voice1'
      }

      mockVoiceSynthesizer.synthesizeText.mockResolvedValue(mockResult)

      const text = 'Este é um teste de síntese de voz.'

      const result = await aiService.synthesizeVoice(text)

      expect(result).toEqual(mockResult)
      expect(mockVoiceSynthesizer.synthesizeText).toHaveBeenCalledWith(text, undefined)
    })

    test('synthesizes voice with custom voice ID', async () => {
      const mockResult = {
        audioBuffer: new ArrayBuffer(1024),
        contentType: 'audio/mpeg',
        voiceId: 'custom-voice'
      }

      mockVoiceSynthesizer.synthesizeText.mockResolvedValue(mockResult)

      const text = 'Test text'
      const voiceId = 'custom-voice'

      const result = await aiService.synthesizeVoice(text, voiceId)

      expect(result).toEqual(mockResult)
      expect(mockVoiceSynthesizer.synthesizeText).toHaveBeenCalledWith(text, voiceId)
    })

    test('handles voice synthesis errors', async () => {
      mockVoiceSynthesizer.synthesizeText.mockRejectedValue(new Error('Synthesis failed'))

      await expect(aiService.synthesizeVoice('test text'))
        .rejects.toThrow('Voice synthesis failed')
    })
  })

  describe('findHistoricalParallels', () => {
    test('finds historical parallels successfully', async () => {
      const mockResult = {
        comparisons: [
          {
            event: 'Crise de 1929',
            year: 1929,
            similarity: 0.85,
            context: 'Economic crisis',
            keyParallels: ['Market collapse'],
            differences: ['Technology'],
            lessons: ['Regulation needed'],
            sources: ['History book']
          }
        ],
        overallAnalysis: 'Detailed analysis',
        searchMetadata: {
          query: 'Test Event',
          category: 'Economia',
          searchDate: new Date(),
          totalResults: 1
        }
      }

      mockHistoricalComparator.findHistoricalParallels.mockResolvedValue(mockResult)

      const event = {
        title: 'Test Event',
        context: 'Test context',
        date: new Date(),
        category: 'Economia'
      }

      const result = await aiService.findHistoricalParallels(event)

      expect(result).toEqual(mockResult)
      expect(mockHistoricalComparator.findHistoricalParallels).toHaveBeenCalledWith(event)
    })

    test('handles historical analysis errors', async () => {
      mockHistoricalComparator.findHistoricalParallels.mockRejectedValue(new Error('Analysis failed'))

      const event = {
        title: 'Test Event',
        context: 'Test context',
        date: new Date(),
        category: 'Geral'
      }

      await expect(aiService.findHistoricalParallels(event))
        .rejects.toThrow('Historical analysis failed')
    })
  })

  describe('generateShortScript', () => {
    test('generates short script successfully', async () => {
      const mockScript = '[0:00] Intro [0:15] Main content [0:45] Conclusion'

      mockContentGenerator.generateShortScript.mockResolvedValue(mockScript)

      const articleId = 'article1'
      const article = {
        id: 'article1',
        title: 'Test Article',
        summary: 'Test summary',
        category: 'Tecnologia',
        content: 'Test content',
        tags: ['test'],
        author: 'Test Author',
        authorType: 'human' as const,
        biasScore: 0.2,
        viewCount: 100,
        likes: 10,
        shares: 5,
        readTime: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        isExclusive: false
      }

      const result = await aiService.generateShortScript(articleId, article)

      expect(result).toBe(mockScript)
      expect(mockContentGenerator.generateShortScript).toHaveBeenCalledWith(articleId, article)
    })

    test('handles script generation errors', async () => {
      mockContentGenerator.generateShortScript.mockRejectedValue(new Error('Generation failed'))

      const article = {
        id: 'article1',
        title: 'Test Article',
        summary: 'Test summary',
        category: 'Tecnologia',
        content: 'Test content',
        tags: ['test'],
        author: 'Test Author',
        authorType: 'human' as const,
        biasScore: 0.2,
        viewCount: 100,
        likes: 10,
        shares: 5,
        readTime: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        isExclusive: false
      }

      await expect(aiService.generateShortScript('article1', article))
        .rejects.toThrow('Script generation failed')
    })
  })

  describe('createNeutralVersion', () => {
    test('creates neutral version successfully', async () => {
      const mockNeutralContent = 'This is a neutral version of the content.'

      mockBiasDetector.generateNeutralVersion.mockResolvedValue(mockNeutralContent)

      const biasedContent = 'This is obviously the best solution ever!'

      const result = await aiService.createNeutralVersion(biasedContent)

      expect(result).toBe(mockNeutralContent)
      expect(mockBiasDetector.generateNeutralVersion).toHaveBeenCalledWith(biasedContent)
    })

    test('handles neutral version creation errors', async () => {
      mockBiasDetector.generateNeutralVersion.mockRejectedValue(new Error('Generation failed'))

      await expect(aiService.createNeutralVersion('test content'))
        .rejects.toThrow('Neutral content generation failed')
    })
  })

  describe('processContentWorkflow', () => {
    test('processes complete content workflow', async () => {
      // Mock all service responses
      const mockArticle = {
        title: 'Test Article',
        content: 'Test content',
        summary: 'Test summary',
        tags: ['test'],
        category: 'Tecnologia',
        keyPoints: ['Point 1'],
        readTime: 5,
        biasScore: 0.2
      }

      const mockBiasAnalysis = {
        overallScore: 0.15,
        signals: [],
        breakdown: { emotional: 0.1, political: 0.1, commercial: 0.1, cultural: 0.1 },
        recommendations: [],
        confidence: 0.9
      }

      const mockScript = '[0:00] Intro [0:15] Content [0:45] End'

      const mockVoiceResult = {
        segments: [
          { timestamp: '0:00', text: 'Intro', audioBuffer: new ArrayBuffer(512) }
        ],
        totalDuration: 60,
        voiceId: 'voice1'
      }

      mockContentGenerator.generateArticle.mockResolvedValue(mockArticle)
      mockBiasDetector.analyzeContent.mockResolvedValue(mockBiasAnalysis)
      mockContentGenerator.generateShortScript.mockResolvedValue(mockScript)
      mockVoiceSynthesizer.synthesizeShort.mockResolvedValue(mockVoiceResult)

      const request = {
        topic: 'AI Technology',
        includeShort: true,
        includeVoice: true
      }

      const result = await aiService.processContentWorkflow(request)

      expect(result).toEqual({
        article: mockArticle,
        biasAnalysis: mockBiasAnalysis,
        shortScript: mockScript,
        voiceShort: mockVoiceResult
      })

      expect(mockContentGenerator.generateArticle).toHaveBeenCalled()
      expect(mockBiasDetector.analyzeContent).toHaveBeenCalledWith(mockArticle.content)
      expect(mockContentGenerator.generateShortScript).toHaveBeenCalled()
      expect(mockVoiceSynthesizer.synthesizeShort).toHaveBeenCalledWith(mockScript)
    })

    test('processes workflow without optional components', async () => {
      const mockArticle = {
        title: 'Test Article',
        content: 'Test content',
        summary: 'Test summary',
        tags: ['test'],
        category: 'Tecnologia',
        keyPoints: ['Point 1'],
        readTime: 5,
        biasScore: 0.2
      }

      const mockBiasAnalysis = {
        overallScore: 0.15,
        signals: [],
        breakdown: { emotional: 0.1, political: 0.1, commercial: 0.1, cultural: 0.1 },
        recommendations: [],
        confidence: 0.9
      }

      mockContentGenerator.generateArticle.mockResolvedValue(mockArticle)
      mockBiasDetector.analyzeContent.mockResolvedValue(mockBiasAnalysis)

      const request = {
        topic: 'AI Technology',
        includeShort: false,
        includeVoice: false
      }

      const result = await aiService.processContentWorkflow(request)

      expect(result).toEqual({
        article: mockArticle,
        biasAnalysis: mockBiasAnalysis
      })

      expect(mockContentGenerator.generateShortScript).not.toHaveBeenCalled()
      expect(mockVoiceSynthesizer.synthesizeShort).not.toHaveBeenCalled()
    })
  })

  describe('service initialization', () => {
    test('initializes all services correctly', () => {
      expect(ContentGenerator).toHaveBeenCalledTimes(1)
      expect(BiasDetector).toHaveBeenCalledTimes(1)
      expect(VoiceSynthesizer).toHaveBeenCalledTimes(1)
      expect(HistoricalComparator).toHaveBeenCalledTimes(1)
    })

    test('exposes all required methods', () => {
      expect(typeof aiService.generateContent).toBe('function')
      expect(typeof aiService.analyzeBias).toBe('function')
      expect(typeof aiService.synthesizeVoice).toBe('function')
      expect(typeof aiService.findHistoricalParallels).toBe('function')
      expect(typeof aiService.generateShortScript).toBe('function')
      expect(typeof aiService.createNeutralVersion).toBe('function')
      expect(typeof aiService.processContentWorkflow).toBe('function')
    })
  })
})