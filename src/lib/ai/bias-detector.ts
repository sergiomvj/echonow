import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface BiasAnalysis {
  overallScore: number // 0-1, where 0 is unbiased and 1 is highly biased
  categories: {
    political: number
    emotional: number
    linguistic: number
    factual: number
  }
  indicators: string[]
  suggestions: string[]
  confidence: number
  explanation: string
}

export interface BiasDetectionOptions {
  detailed?: boolean
  includeSuggestions?: boolean
  language?: 'pt' | 'en'
}

export class BiasDetector {
  private openai: OpenAI
  
  // Bias indicators patterns
  private biasPatterns = {
    political: [
      /esquerda|direita|conservador|liberal|progressista/gi,
      /regime|ditadura|democracia|autoritário/gi,
      /capitalismo|socialismo|comunismo/gi
    ],
    emotional: [
      /inacreditável|absurdo|escandaloso|chocante/gi,
      /obviamente|claramente|sem dúvida|certamente/gi,
      /desastre|catástrofe|maravilhoso|terrível/gi,
      /todos sabem|é óbvio que|qualquer um pode ver/gi
    ],
    linguistic: [
      /sempre|nunca|todos|ninguém|jamais/gi,
      /definitivamente|absolutamente|completamente/gi,
      /apenas|somente|simplesmente/gi
    ],
    loaded: [
      /terrorista|extremista|radical|fanático/gi,
      /herói|vilão|salvador|destruidor/gi,
      /invasão|ocupação|libertação/gi
    ]
  }

  constructor() {
    this.openai = openai
  }

  async analyzeContent(
    content: string, 
    options: BiasDetectionOptions = {}
  ): Promise<BiasAnalysis> {
    try {
      // Run both rule-based and AI-based analysis
      const ruleBasedAnalysis = this.runRuleBasedAnalysis(content)
      const aiAnalysis = await this.runAIAnalysis(content, options)
      
      // Combine results
      return this.combineAnalyses(ruleBasedAnalysis, aiAnalysis, options)
    } catch (error) {
      console.error('Error analyzing bias:', error)
      return this.getFallbackAnalysis(content)
    }
  }

  async batchAnalyze(contents: string[]): Promise<BiasAnalysis[]> {
    const analyses = await Promise.allSettled(
      contents.map(content => this.analyzeContent(content))
    )
    
    return analyses.map(result => 
      result.status === 'fulfilled' 
        ? result.value 
        : this.getFallbackAnalysis('')
    )
  }

  async compareArticles(article1: string, article2: string): Promise<{
    article1Bias: BiasAnalysis
    article2Bias: BiasAnalysis
    comparison: string
    recommendation: string
  }> {
    const [bias1, bias2] = await Promise.all([
      this.analyzeContent(article1),
      this.analyzeContent(article2)
    ])

    const comparison = await this.generateComparison(bias1, bias2)
    
    return {
      article1Bias: bias1,
      article2Bias: bias2,
      comparison: comparison.comparison,
      recommendation: comparison.recommendation
    }
  }

  private runRuleBasedAnalysis(content: string) {
    const analysis = {
      political: 0,
      emotional: 0,
      linguistic: 0,
      loaded: 0,
      indicators: [] as string[]
    }

    const wordCount = content.split(' ').length

    // Analyze each category
    Object.entries(this.biasPatterns).forEach(([category, patterns]) => {
      let categoryScore = 0
      
      patterns.forEach(pattern => {
        const matches = content.match(pattern)
        if (matches) {
          categoryScore += matches.length
          analysis.indicators.push(`${category}: "${matches[0]}"`)
        }
      })
      
      // Normalize by word count
      analysis[category as keyof typeof analysis] = Math.min(categoryScore / wordCount * 100, 1)
    })

    return analysis
  }

  private async runAIAnalysis(content: string, options: BiasDetectionOptions) {
    const prompt = `
      Analyze this text for bias and provide a detailed assessment:
      
      "${content.substring(0, 1500)}..."
      
      Evaluate:
      1. Political bias (left/right leaning language)
      2. Emotional manipulation (loaded language, appeals to emotion)
      3. Factual accuracy (unsupported claims, generalizations)
      4. Linguistic bias (absolute statements, unfair characterizations)
      5. Overall objectivity
      
      Provide scores (0-1) for each category and an overall bias score.
      ${options.includeSuggestions ? 'Include specific suggestions for improvement.' : ''}
      
      Respond in JSON format:
      {
        "political": 0.0,
        "emotional": 0.0,
        "factual": 0.0,
        "linguistic": 0.0,
        "overall": 0.0,
        "confidence": 0.0,
        "explanation": "Brief explanation of the assessment",
        "indicators": ["specific examples of bias"],
        "suggestions": ["improvement suggestions"]
      }
    `

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in media bias detection and journalistic objectivity. Analyze content for various forms of bias with high accuracy.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 800,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) throw new Error('No AI analysis response')

    try {
      return JSON.parse(response)
    } catch {
      return this.parseNonJsonAIResponse(response)
    }
  }

  private combineAnalyses(
    ruleBasedAnalysis: any,
    aiAnalysis: any,
    options: BiasDetectionOptions
  ): BiasAnalysis {
    // Weight AI analysis more heavily than rule-based
    const aiWeight = 0.7
    const ruleWeight = 0.3

    const categories = {
      political: (aiAnalysis.political * aiWeight) + (ruleBasedAnalysis.political * ruleWeight),
      emotional: (aiAnalysis.emotional * aiWeight) + (ruleBasedAnalysis.emotional * ruleWeight),
      linguistic: (aiAnalysis.linguistic * aiWeight) + (ruleBasedAnalysis.linguistic * ruleWeight),
      factual: aiAnalysis.factual || 0
    }

    const overallScore = Object.values(categories).reduce((sum, score) => sum + score, 0) / 4

    return {
      overallScore: Math.min(overallScore, 1),
      categories,
      indicators: [...ruleBasedAnalysis.indicators, ...(aiAnalysis.indicators || [])],
      suggestions: options.includeSuggestions ? (aiAnalysis.suggestions || []) : [],
      confidence: aiAnalysis.confidence || 0.8,
      explanation: aiAnalysis.explanation || 'Análise baseada em padrões linguísticos e contextuais'
    }
  }

  private async generateComparison(bias1: BiasAnalysis, bias2: BiasAnalysis) {
    const prompt = `
      Compare these two bias analyses and provide insights:
      
      Article 1: Overall bias ${bias1.overallScore.toFixed(2)}, 
      Categories: Political ${bias1.categories.political.toFixed(2)}, 
      Emotional ${bias1.categories.emotional.toFixed(2)}
      
      Article 2: Overall bias ${bias2.overallScore.toFixed(2)}, 
      Categories: Political ${bias2.categories.political.toFixed(2)}, 
      Emotional ${bias2.categories.emotional.toFixed(2)}
      
      Provide:
      1. Which article is more objective and why
      2. Key differences in bias types
      3. Recommendation for readers
      
      Keep response concise (max 200 words).
    `

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are a media literacy expert helping readers understand bias in news articles.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 300,
    })

    const response = completion.choices[0]?.message?.content || ''
    const parts = response.split('\n')
    
    return {
      comparison: parts.slice(0, -1).join('\n'),
      recommendation: parts[parts.length - 1] || 'Compare multiple sources for balanced perspective.'
    }
  }

  private parseNonJsonAIResponse(response: string) {
    // Fallback parsing for non-JSON AI responses
    const lines = response.toLowerCase()
    
    return {
      political: this.extractScore(lines, 'political') || 0.3,
      emotional: this.extractScore(lines, 'emotional') || 0.3,
      factual: this.extractScore(lines, 'factual') || 0.3,
      linguistic: this.extractScore(lines, 'linguistic') || 0.3,
      overall: 0.3,
      confidence: 0.6,
      explanation: 'Análise baseada em resposta não estruturada',
      indicators: [],
      suggestions: []
    }
  }

  private extractScore(text: string, category: string): number | null {
    const patterns = [
      new RegExp(`${category}[:\\s]+([0-9.]+)`, 'i'),
      new RegExp(`${category}[^0-9]*([0-9.]+)`, 'i')
    ]
    
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        const score = parseFloat(match[1])
        return isNaN(score) ? null : Math.min(score, 1)
      }
    }
    
    return null
  }

  private getFallbackAnalysis(content: string): BiasAnalysis {
    const wordCount = content.split(' ').length
    const baseScore = Math.min(wordCount > 100 ? 0.2 : 0.4, 1)
    
    return {
      overallScore: baseScore,
      categories: {
        political: baseScore,
        emotional: baseScore,
        linguistic: baseScore,
        factual: baseScore
      },
      indicators: ['Análise limitada devido a erro no sistema'],
      suggestions: [],
      confidence: 0.3,
      explanation: 'Análise de fallback devido a falha no sistema principal'
    }
  }

  // Utility methods
  getBiasLabel(score: number): string {
    if (score < 0.2) return 'Muito Baixo'
    if (score < 0.4) return 'Baixo'
    if (score < 0.6) return 'Moderado'
    if (score < 0.8) return 'Alto'
    return 'Muito Alto'
  }

  getBiasColor(score: number): string {
    if (score < 0.3) return '#10B981' // green
    if (score < 0.6) return '#F59E0B' // yellow
    return '#EF4444' // red
  }
}

export const biasDetector = new BiasDetector()