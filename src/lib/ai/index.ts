// Main AI Service Orchestrator for EchoNow
import { contentGenerator, ContentGenerationRequest, GeneratedContent } from './content-generator'
import { biasDetector, BiasAnalysis } from './bias-detector'
import { voiceSynthesizer, VoiceOptions, SynthesisResult } from './voice-synthesizer'
import { historicalComparator, HistoricalQuery, HistoricalAnalysis } from './historical-comparator'
import { Article, Short } from '@/types'

export interface AIServiceConfig {
  openaiApiKey?: string
  elevenlabsApiKey?: string
  maxRetries?: number
  timeout?: number
}

export interface ContentCreationResult {
  article: GeneratedContent
  biasAnalysis: BiasAnalysis
  historicalContext: HistoricalAnalysis
  shortScript?: string
  audioNarration?: SynthesisResult
  success: boolean
  errors: string[]
}

export interface ShortCreationResult {
  script: string
  audioNarration: SynthesisResult
  duration: number
  success: boolean
  errors: string[]
}

export class AIService {
  private config: AIServiceConfig
  private isInitialized: boolean = false

  constructor(config: AIServiceConfig = {}) {
    this.config = {
      maxRetries: 3,
      timeout: 30000,
      ...config
    }
  }

  async initialize(): Promise<boolean> {
    try {
      // Check service availability
      const [voiceStatus] = await Promise.all([
        voiceSynthesizer.checkServiceStatus()
      ])

      console.log('AI Services Status:')
      console.log('- Voice Synthesis:', voiceStatus.available ? '✅' : '❌', voiceStatus.message)

      this.isInitialized = true
      return true
    } catch (error) {
      console.error('AI Service initialization failed:', error)
      this.isInitialized = false
      return false
    }
  }

  // ========== COMPREHENSIVE CONTENT CREATION ==========

  async createComprehensiveContent(request: ContentGenerationRequest): Promise<ContentCreationResult> {
    const errors: string[] = []
    
    try {
      // Step 1: Generate main article content
      const article = await contentGenerator.generateArticle(request)
      
      // Step 2: Analyze bias in parallel with historical context
      const [biasAnalysis, historicalContext] = await Promise.allSettled([
        biasDetector.analyzeContent(article.content, { 
          detailed: true, 
          includeSuggestions: true 
        }),
        historicalComparator.findHistoricalParallels({
          currentEvent: request.topic,
          context: article.summary,
          maxResults: 3,
          minRelevanceScore: 0.6
        })
      ])

      // Step 3: Generate short script if requested
      let shortScript: string | undefined
      let audioNarration: SynthesisResult | undefined

      if (request.style !== 'comprehensive') { // Skip for very long content
        try {
          shortScript = await contentGenerator.generateShortScript('temp', {
            id: 'temp',
            title: article.title,
            summary: article.summary,
            category: article.category
          } as Article)

          // Step 4: Generate audio narration
          audioNarration = await voiceSynthesizer.synthesizeShortScript(
            shortScript, 
            'narrator'
          )
        } catch (error) {
          errors.push(`Audio generation failed: ${error}`)
        }
      }

      return {
        article,
        biasAnalysis: biasAnalysis.status === 'fulfilled' ? biasAnalysis.value : this.getFallbackBiasAnalysis(),
        historicalContext: historicalContext.status === 'fulfilled' ? historicalContext.value : this.getFallbackHistoricalAnalysis(),
        shortScript,
        audioNarration,
        success: true,
        errors
      }
    } catch (error) {
      console.error('Comprehensive content creation failed:', error)
      errors.push(`Content generation failed: ${error}`)
      
      return {
        article: this.getFallbackContent(request.topic),
        biasAnalysis: this.getFallbackBiasAnalysis(),
        historicalContext: this.getFallbackHistoricalAnalysis(),
        success: false,
        errors
      }
    }
  }

  // ========== SHORT VIDEO CREATION ==========

  async createShortFromArticle(
    article: Article, 
    voiceStyle: 'narrator' | 'casual' | 'news' | 'expert' | 'young' = 'narrator'
  ): Promise<ShortCreationResult> {
    const errors: string[] = []

    try {
      // Generate script optimized for short format
      const script = await contentGenerator.generateShortScript(article.id, article)
      
      // Generate audio narration
      const audioNarration = await voiceSynthesizer.synthesizeShortScript(script, voiceStyle)
      
      if (!audioNarration.success) {
        errors.push(`Audio synthesis failed: ${audioNarration.error}`)
      }

      return {
        script,
        audioNarration,
        duration: audioNarration.duration,
        success: audioNarration.success,
        errors
      }
    } catch (error) {
      console.error('Short creation failed:', error)
      return {
        script: `Erro ao gerar script para: ${article.title}`,
        audioNarration: {
          audioBuffer: new ArrayBuffer(0),
          duration: 0,
          success: false,
          error: 'Audio generation failed'
        },
        duration: 0,
        success: false,
        errors: [`Short creation failed: ${error}`]
      }
    }
  }

  // ========== BIAS ANALYSIS ==========

  async analyzeContentBias(content: string, includeComparison?: string): Promise<{
    analysis: BiasAnalysis
    comparison?: any
    recommendations: string[]
  }> {
    try {
      const analysis = await biasDetector.analyzeContent(content, {
        detailed: true,
        includeSuggestions: true
      })

      let comparison
      if (includeComparison) {
        comparison = await biasDetector.compareArticles(content, includeComparison)
      }

      const recommendations = this.generateBiasRecommendations(analysis)

      return {
        analysis,
        comparison,
        recommendations
      }
    } catch (error) {
      console.error('Bias analysis failed:', error)
      throw new Error('Failed to analyze content bias')
    }
  }

  // ========== HISTORICAL CONTEXT ==========

  async getHistoricalContext(
    topic: string, 
    context?: string,
    options?: Partial<HistoricalQuery>
  ): Promise<HistoricalAnalysis> {
    try {
      return await historicalComparator.findHistoricalParallels({
        currentEvent: topic,
        context,
        maxResults: 5,
        minRelevanceScore: 0.5,
        ...options
      })
    } catch (error) {
      console.error('Historical context generation failed:', error)
      throw new Error('Failed to generate historical context')
    }
  }

  // ========== CUSTOM AI PROMPTS ==========

  async processCustomPrompt(
    prompt: string, 
    context?: string,
    includeVoice?: boolean
  ): Promise<{
    content: string
    audioNarration?: SynthesisResult
    biasScore?: number
  }> {
    try {
      const content = await contentGenerator.generateCustomPrompt(prompt, context)
      
      let audioNarration: SynthesisResult | undefined
      let biasScore: number | undefined

      if (includeVoice && content.length < 1000) { // Only for shorter content
        audioNarration = await voiceSynthesizer.synthesizeText(content)
      }

      // Quick bias check
      const biasAnalysis = await biasDetector.analyzeContent(content)
      biasScore = biasAnalysis.overallScore

      return {
        content,
        audioNarration,
        biasScore
      }
    } catch (error) {
      console.error('Custom prompt processing failed:', error)
      throw new Error('Failed to process custom prompt')
    }
  }

  // ========== UTILITY METHODS ==========

  private generateBiasRecommendations(analysis: BiasAnalysis): string[] {
    const recommendations: string[] = []

    if (analysis.categories.emotional > 0.6) {
      recommendations.push('Considere usar linguagem mais neutra e menos emotiva')
    }

    if (analysis.categories.political > 0.7) {
      recommendations.push('Inclua perspectivas de diferentes pontos de vista políticos')
    }

    if (analysis.categories.linguistic > 0.5) {
      recommendations.push('Evite declarações absolutas; use qualificadores quando apropriado')
    }

    if (analysis.categories.factual > 0.6) {
      recommendations.push('Adicione fontes e evidências para sustentar as afirmações')
    }

    if (recommendations.length === 0) {
      recommendations.push('Conteúdo demonstra boa objetividade jornalística')
    }

    return recommendations
  }

  private getFallbackContent(topic: string): GeneratedContent {
    return {
      title: `Análise sobre ${topic}`,
      content: `Conteúdo sobre ${topic} não pôde ser gerado devido a falha no sistema.`,
      summary: `Resumo indisponível para ${topic}`,
      tags: [topic],
      category: 'Geral',
      readTime: 2,
      biasScore: 0.5,
      keyPoints: []
    }
  }

  private getFallbackBiasAnalysis(): BiasAnalysis {
    return {
      overallScore: 0.5,
      categories: {
        political: 0.5,
        emotional: 0.5,
        linguistic: 0.5,
        factual: 0.5
      },
      indicators: ['Análise de viés indisponível'],
      suggestions: ['Sistema de análise temporariamente indisponível'],
      confidence: 0.1,
      explanation: 'Análise de fallback devido a falha no sistema'
    }
  }

  private getFallbackHistoricalAnalysis(): HistoricalAnalysis {
    return {
      parallels: [],
      summary: 'Análise histórica indisponível',
      keyInsights: [],
      patterns: [],
      lessons: [],
      confidence: 0.1
    }
  }

  // ========== SERVICE STATUS ==========

  async getServiceStatus(): Promise<{
    contentGeneration: boolean
    biasDetection: boolean
    voiceSynthesis: boolean
    historicalAnalysis: boolean
    overall: boolean
  }> {
    const voiceStatus = await voiceSynthesizer.checkServiceStatus()
    
    return {
      contentGeneration: !!process.env.OPENAI_API_KEY,
      biasDetection: !!process.env.OPENAI_API_KEY,
      voiceSynthesis: voiceStatus.available,
      historicalAnalysis: !!process.env.OPENAI_API_KEY,
      overall: this.isInitialized
    }
  }
}

// Export singleton instance
export const aiService = new AIService()

// Export individual services for direct access
export {
  contentGenerator,
  biasDetector,
  voiceSynthesizer,
  historicalComparator
}

// Export types
export type {
  ContentGenerationRequest,
  GeneratedContent,
  BiasAnalysis,
  VoiceOptions,
  SynthesisResult,
  HistoricalQuery,
  HistoricalAnalysis
}