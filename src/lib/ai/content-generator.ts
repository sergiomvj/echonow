import OpenAI from 'openai'
import { Article, Short, HistoricalComparison } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ContentGenerationRequest {
  topic: string
  sourceUrl?: string
  style?: 'neutral' | 'analytical' | 'comprehensive'
  length?: 'short' | 'medium' | 'long'
  includeSources?: boolean
  targetAudience?: 'general' | 'expert' | 'young'
}

export interface GeneratedContent {
  title: string
  content: string
  summary: string
  tags: string[]
  category: string
  readTime: number
  biasScore: number
  keyPoints: string[]
  sources?: string[]
  historicalParallels?: HistoricalComparison[]
}

const SYSTEM_PROMPTS = {
  neutral: `You are EchoNow AI, an unbiased content creator specialized in providing balanced, factual analysis. 
  Your role is to create content that:
  - Presents multiple perspectives without ideological bias
  - Uses clear, accessible language
  - Includes relevant historical context
  - Maintains journalistic objectivity
  - Focuses on facts and verified information
  
  Always structure content with clear sections and maintain a balanced tone.`,
  
  analytical: `You are EchoNow AI, focused on deep analytical content.
  Create thorough analysis that:
  - Examines multiple angles and implications
  - Provides data-driven insights
  - Connects current events to broader patterns
  - Uses expert-level terminology when appropriate
  - Includes statistical context and trends`,
  
  comprehensive: `You are EchoNow AI, creating comprehensive coverage.
  Provide extensive content that:
  - Covers all major aspects of the topic
  - Includes background information and context
  - Presents various stakeholder perspectives
  - Offers long-term implications analysis
  - Maintains journalistic standards throughout`
}

const CATEGORIES = [
  'Política', 'Economia', 'Tecnologia', 'Meio Ambiente', 
  'Saúde', 'Cultura', 'Ciência', 'Internacional', 'Sociedade'
]

export class ContentGenerator {
  private openai: OpenAI

  constructor() {
    this.openai = openai
  }

  async generateArticle(request: ContentGenerationRequest): Promise<GeneratedContent> {
    try {
      const systemPrompt = SYSTEM_PROMPTS[request.style || 'neutral']
      const targetLength = this.getTargetLength(request.length || 'medium')
      
      const prompt = this.buildArticlePrompt(request, targetLength)
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: targetLength.maxTokens,
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('No response from OpenAI')
      }

      return this.parseGeneratedContent(response, request)
    } catch (error) {
      console.error('Error generating article:', error)
      throw new Error('Failed to generate article content')
    }
  }

  async generateShortScript(articleId: string, article: Article): Promise<string> {
    try {
      const prompt = `
        Create a engaging short video script (60 seconds max) based on this article:
        
        Title: ${article.title}
        Summary: ${article.summary}
        Category: ${article.category}
        
        Requirements:
        - Hook viewers in first 3 seconds
        - Present key information clearly
        - Use dynamic, visual language
        - Include a call-to-action
        - Format as natural speech with timing cues
        - Maximum 150 words
        
        Format as: [TIMING] Script content
      `

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are a video script writer specialized in engaging short-form content.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 300,
      })

      return completion.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('Error generating short script:', error)
      throw new Error('Failed to generate video script')
    }
  }

  async enhanceWithHistoricalContext(content: string, topic: string): Promise<HistoricalComparison[]> {
    try {
      const prompt = `
        Find 2-3 relevant historical parallels for this topic: "${topic}"
        
        Content context: ${content.substring(0, 500)}...
        
        For each parallel, provide:
        - Event title
        - Year
        - Brief description (max 100 words)
        - Relevance score (0-1)
        - Why it's relevant to current topic
        
        Focus on events that provide meaningful context or lessons.
        Format as JSON array.
      `

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are a history expert providing relevant historical context for current events.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 800,
      })

      const response = completion.choices[0]?.message?.content
      if (!response) return []

      try {
        const parsed = JSON.parse(response)
        return parsed.map((item: any, index: number) => ({
          id: `hist-${Date.now()}-${index}`,
          title: item.title,
          description: item.description,
          year: item.year,
          relevanceScore: item.relevanceScore,
          sourceUrl: null
        }))
      } catch {
        return []
      }
    } catch (error) {
      console.error('Error generating historical context:', error)
      return []
    }
  }

  async generateCustomPrompt(prompt: string, context?: string): Promise<string> {
    try {
      const enhancedPrompt = context 
        ? `Context: ${context}\n\nUser Request: ${prompt}`
        : prompt

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPTS.neutral },
          { role: 'user', content: enhancedPrompt }
        ],
        temperature: 0.4,
        max_tokens: 1500,
      })

      return completion.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('Error with custom prompt:', error)
      throw new Error('Failed to process custom prompt')
    }
  }

  private buildArticlePrompt(request: ContentGenerationRequest, targetLength: any): string {
    return `
      Create a comprehensive article about: "${request.topic}"
      ${request.sourceUrl ? `Source URL for reference: ${request.sourceUrl}` : ''}
      
      Requirements:
      - Target length: ${targetLength.words} words
      - Audience: ${request.targetAudience || 'general'}
      - Style: ${request.style || 'neutral'}
      - Include relevant tags and category
      - Provide engaging title and summary
      - Structure with clear sections
      ${request.includeSources ? '- Include credible sources' : ''}
      
      Return in this JSON format:
      {
        "title": "Engaging article title",
        "content": "Full article content with proper formatting",
        "summary": "2-3 sentence summary",
        "tags": ["tag1", "tag2", "tag3"],
        "category": "Most appropriate category",
        "keyPoints": ["key point 1", "key point 2", "key point 3"],
        "sources": ["source1", "source2"] // if requested
      }
    `
  }

  private getTargetLength(length: string) {
    const lengths = {
      short: { words: 400, maxTokens: 600 },
      medium: { words: 800, maxTokens: 1200 },
      long: { words: 1500, maxTokens: 2000 }
    }
    return lengths[length as keyof typeof lengths] || lengths.medium
  }

  private async parseGeneratedContent(response: string, request: ContentGenerationRequest): Promise<GeneratedContent> {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(response)
      
      // Calculate read time (average 200 words per minute)
      const wordCount = parsed.content.split(' ').length
      const readTime = Math.ceil(wordCount / 200)
      
      // Calculate basic bias score (to be enhanced by bias detection service)
      const biasScore = await this.calculateBasicBiasScore(parsed.content)
      
      return {
        title: parsed.title,
        content: parsed.content,
        summary: parsed.summary,
        tags: parsed.tags || [],
        category: this.validateCategory(parsed.category),
        readTime,
        biasScore,
        keyPoints: parsed.keyPoints || [],
        sources: request.includeSources ? parsed.sources : undefined,
        historicalParallels: await this.enhanceWithHistoricalContext(parsed.content, request.topic)
      }
    } catch (error) {
      // Fallback parsing if JSON fails
      return this.parseNonJsonResponse(response, request)
    }
  }

  private validateCategory(category: string): string {
    return CATEGORIES.includes(category) ? category : 'Geral'
  }

  private async calculateBasicBiasScore(content: string): Promise<number> {
    // Basic bias indicators (to be enhanced by dedicated bias detection)
    const biasIndicators = [
      /obviously|clearly|undoubtedly|certainly/gi,
      /always|never|all|none|everyone|no one/gi,
      /disaster|catastrophe|amazing|incredible/gi
    ]
    
    let score = 0
    biasIndicators.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) score += matches.length * 0.1
    })
    
    return Math.min(score, 1)
  }

  private parseNonJsonResponse(response: string, request: ContentGenerationRequest): GeneratedContent {
    // Fallback parsing logic for non-JSON responses
    const lines = response.split('\n')
    const title = lines.find(line => line.toLowerCase().includes('title:'))?.replace(/title:/i, '').trim() || request.topic
    
    return {
      title,
      content: response,
      summary: response.substring(0, 200) + '...',
      tags: [request.topic],
      category: 'Geral',
      readTime: Math.ceil(response.split(' ').length / 200),
      biasScore: 0.3,
      keyPoints: []
    }
  }
}

export const contentGenerator = new ContentGenerator()