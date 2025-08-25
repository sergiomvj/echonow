import OpenAI from 'openai'
import { HistoricalComparison } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface HistoricalQuery {
  currentEvent: string
  context?: string
  timeRange?: {
    startYear?: number
    endYear?: number
  }
  maxResults?: number
  categories?: string[]
  minRelevanceScore?: number
}

export interface HistoricalAnalysis {
  parallels: HistoricalComparison[]
  summary: string
  keyInsights: string[]
  patterns: string[]
  lessons: string[]
  confidence: number
}

export interface ComparisonMetrics {
  contextualSimilarity: number
  consequencesSimilarity: number
  stakeholdersSimilarity: number
  timelineSimilarity: number
  overallRelevance: number
}

export class HistoricalComparator {
  private openai: OpenAI

  // Historical categories for better matching
  private categories = {
    economic: ['crise', 'economia', 'mercado', 'inflação', 'recessão'],
    political: ['eleição', 'governo', 'política', 'democracia', 'autoritarismo'],
    social: ['movimento', 'protesto', 'revolução', 'mudança social'],
    technological: ['inovação', 'tecnologia', 'invenção', 'disruption'],
    environmental: ['clima', 'desastre', 'sustentabilidade', 'recursos'],
    international: ['guerra', 'conflito', 'diplomacia', 'tratado'],
    health: ['pandemia', 'epidemia', 'saúde pública', 'medicina']
  }

  constructor() {
    this.openai = openai
  }

  async findHistoricalParallels(query: HistoricalQuery): Promise<HistoricalAnalysis> {
    try {
      const parallels = await this.searchParallels(query)
      const analysis = await this.analyzeParallels(query.currentEvent, parallels)
      
      return {
        parallels: parallels.slice(0, query.maxResults || 3),
        summary: analysis.summary,
        keyInsights: analysis.insights,
        patterns: analysis.patterns,
        lessons: analysis.lessons,
        confidence: analysis.confidence
      }
    } catch (error) {
      console.error('Error finding historical parallels:', error)
      return this.getFallbackAnalysis(query.currentEvent)
    }
  }

  async compareEvents(
    currentEvent: string, 
    historicalEvent: string, 
    historicalYear: number
  ): Promise<{
    comparison: string
    metrics: ComparisonMetrics
    insights: string[]
    differences: string[]
    similarities: string[]
  }> {
    try {
      const prompt = `
        Compare these two events in detail:
        
        Current Event: ${currentEvent}
        Historical Event: ${historicalEvent} (${historicalYear})
        
        Provide detailed analysis covering:
        1. Contextual similarities and differences
        2. Key stakeholders and their roles
        3. Consequences and outcomes
        4. Timeline and progression patterns
        5. Lessons that can be applied today
        
        Rate similarity in these areas (0-1):
        - Contextual Similarity
        - Consequences Similarity  
        - Stakeholders Similarity
        - Timeline Similarity
        - Overall Relevance
        
        Format as JSON:
        {
          "comparison": "detailed comparison text",
          "contextualSimilarity": 0.0,
          "consequencesSimilarity": 0.0,
          "stakeholdersSimilarity": 0.0,
          "timelineSimilarity": 0.0,
          "overallRelevance": 0.0,
          "insights": ["insight 1", "insight 2"],
          "differences": ["difference 1", "difference 2"],
          "similarities": ["similarity 1", "similarity 2"]
        }
      `

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a historian specializing in comparative analysis of historical and contemporary events. Provide detailed, nuanced comparisons.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 1500,
      })

      const response = completion.choices[0]?.message?.content
      if (!response) throw new Error('No comparison response')

      const parsed = JSON.parse(response)
      
      return {
        comparison: parsed.comparison,
        metrics: {
          contextualSimilarity: parsed.contextualSimilarity,
          consequencesSimilarity: parsed.consequencesSimilarity,
          stakeholdersSimilarity: parsed.stakeholdersSimilarity,
          timelineSimilarity: parsed.timelineSimilarity,
          overallRelevance: parsed.overallRelevance
        },
        insights: parsed.insights || [],
        differences: parsed.differences || [],
        similarities: parsed.similarities || []
      }
    } catch (error) {
      console.error('Error comparing events:', error)
      return this.getFallbackComparison(currentEvent, historicalEvent)
    }
  }

  async generateTimeline(
    currentEvent: string, 
    historicalParallels: HistoricalComparison[]
  ): Promise<{
    timeline: Array<{
      year: number
      event: string
      description: string
      relevance: string
      type: 'historical' | 'current'
    }>
    narrative: string
  }> {
    try {
      const prompt = `
        Create a chronological timeline showing the progression from historical events to the current situation:
        
        Current Event: ${currentEvent}
        
        Historical Parallels:
        ${historicalParallels.map(p => `- ${p.year}: ${p.title} - ${p.description}`).join('\n')}
        
        Create a timeline that:
        1. Shows key historical events in chronological order
        2. Highlights the progression of similar patterns over time
        3. Connects to the current event
        4. Explains the relevance of each connection
        
        Also provide a narrative explaining the historical pattern.
        
        Format as JSON with timeline array and narrative string.
      `

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a historian creating educational timelines that show patterns across history.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1200,
      })

      const response = completion.choices[0]?.message?.content
      if (!response) throw new Error('No timeline response')

      return JSON.parse(response)
    } catch (error) {
      console.error('Error generating timeline:', error)
      return {
        timeline: historicalParallels.map(p => ({
          year: p.year,
          event: p.title,
          description: p.description,
          relevance: 'Contexto histórico relevante',
          type: 'historical' as const
        })),
        narrative: 'Timeline gerado automaticamente com base nos paralelos históricos encontrados.'
      }
    }
  }

  private async searchParallels(query: HistoricalQuery): Promise<HistoricalComparison[]> {
    const categoryHints = this.categorizeEvent(query.currentEvent)
    const timeConstraints = query.timeRange 
      ? `between ${query.timeRange.startYear || 1800} and ${query.timeRange.endYear || 2020}`
      : 'from any historical period'

    const prompt = `
      Find historical parallels for this current event: "${query.currentEvent}"
      ${query.context ? `Additional context: ${query.context}` : ''}
      
      Look for events ${timeConstraints} that share:
      - Similar causes or triggers
      - Comparable social/economic/political contexts
      - Similar stakeholders or power dynamics
      - Analogous consequences or patterns
      
      Focus on events related to: ${categoryHints.join(', ')}
      
      For each parallel, provide:
      - Event title
      - Year
      - Detailed description (100-150 words)
      - Specific relevance to current event
      - Relevance score (0-1)
      - Key lessons or patterns
      
      Return 5-7 of the most relevant parallels.
      Format as JSON array.
    `

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a historian with expertise in finding meaningful historical parallels to contemporary events. Focus on substantive connections rather than superficial similarities.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 2000,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) return []

    try {
      const parsed = JSON.parse(response)
      return parsed
        .filter((item: any) => item.relevanceScore >= (query.minRelevanceScore || 0.6))
        .map((item: any, index: number) => ({
          id: `hist-${Date.now()}-${index}`,
          title: item.title,
          description: item.description,
          year: item.year,
          relevanceScore: item.relevanceScore,
          sourceUrl: null
        }))
    } catch (error) {
      console.error('Error parsing historical parallels:', error)
      return []
    }
  }

  private async analyzeParallels(
    currentEvent: string, 
    parallels: HistoricalComparison[]
  ): Promise<{
    summary: string
    insights: string[]
    patterns: string[]
    lessons: string[]
    confidence: number
  }> {
    if (parallels.length === 0) {
      return {
        summary: 'Não foram encontrados paralelos históricos significativos.',
        insights: [],
        patterns: [],
        lessons: [],
        confidence: 0
      }
    }

    const prompt = `
      Analyze these historical parallels for: "${currentEvent}"
      
      Historical Events:
      ${parallels.map(p => `${p.year}: ${p.title} - ${p.description}`).join('\n\n')}
      
      Provide:
      1. Summary of the overall historical pattern
      2. Key insights about recurring themes
      3. Specific patterns that repeat across time
      4. Practical lessons for understanding current situation
      5. Confidence level in analysis (0-1)
      
      Focus on actionable insights and meaningful patterns.
    `

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a historical analyst providing insights about patterns across time. Focus on practical, actionable analysis.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 800,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      return {
        summary: 'Análise não disponível',
        insights: [],
        patterns: [],
        lessons: [],
        confidence: 0.3
      }
    }

    // Parse response (assuming structured format)
    const lines = response.split('\n').filter(line => line.trim())
    
    return {
      summary: lines[0] || 'Análise dos paralelos históricos',
      insights: this.extractListItems(response, 'insights') || [],
      patterns: this.extractListItems(response, 'patterns') || [],
      lessons: this.extractListItems(response, 'lessons') || [],
      confidence: 0.8
    }
  }

  private categorizeEvent(eventDescription: string): string[] {
    const description = eventDescription.toLowerCase()
    const matches: string[] = []
    
    Object.entries(this.categories).forEach(([category, keywords]) => {
      if (keywords.some(keyword => description.includes(keyword))) {
        matches.push(category)
      }
    })
    
    return matches.length > 0 ? matches : ['general']
  }

  private extractListItems(text: string, section: string): string[] {
    const sectionRegex = new RegExp(`${section}:?([^]*?)(?=\\n\\n|$)`, 'i')
    const match = text.match(sectionRegex)
    
    if (!match) return []
    
    return match[1]
      .split('\n')
      .map(line => line.replace(/^[-•*]\s*/, '').trim())
      .filter(line => line.length > 0)
  }

  private getFallbackAnalysis(currentEvent: string): HistoricalAnalysis {
    return {
      parallels: [],
      summary: `Não foi possível encontrar paralelos históricos para: ${currentEvent}`,
      keyInsights: ['Análise histórica limitada devido a falha no sistema'],
      patterns: [],
      lessons: ['Consulte múltiplas fontes para contexto histórico'],
      confidence: 0.1
    }
  }

  private getFallbackComparison(currentEvent: string, historicalEvent: string) {
    return {
      comparison: `Comparação limitada entre ${currentEvent} e ${historicalEvent} devido a falha no sistema.`,
      metrics: {
        contextualSimilarity: 0.3,
        consequencesSimilarity: 0.3,
        stakeholdersSimilarity: 0.3,
        timelineSimilarity: 0.3,
        overallRelevance: 0.3
      },
      insights: ['Análise comparativa limitada'],
      differences: ['Dados insuficientes para comparação detalhada'],
      similarities: ['Análise não disponível']
    }
  }

  // Utility methods
  getRelevanceLabel(score: number): string {
    if (score >= 0.8) return 'Muito Alta'
    if (score >= 0.6) return 'Alta'
    if (score >= 0.4) return 'Moderada'
    if (score >= 0.2) return 'Baixa'
    return 'Muito Baixa'
  }

  getRelevanceColor(score: number): string {
    if (score >= 0.7) return '#10B981' // green
    if (score >= 0.5) return '#F59E0B' // yellow
    if (score >= 0.3) return '#F97316' // orange
    return '#EF4444' // red
  }
}

export const historicalComparator = new HistoricalComparator()