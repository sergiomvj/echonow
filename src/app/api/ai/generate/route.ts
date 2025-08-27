import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import { requireSubscription } from '@/lib/auth/utils'
import { contentGenerator } from '@/lib/ai/content-generator'
import { z } from 'zod'

const generateContentSchema = z.object({
  topic: z.string().min(5, 'Topic must be at least 5 characters'),
  sourceUrl: z.string().url().optional(),
  type: z.enum(['article', 'short', 'analysis']),
  style: z.enum(['neutral', 'analytical', 'comprehensive']).optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
  includeHistorical: z.boolean().optional(),
  customPrompt: z.string().optional(),
  targetAudience: z.enum(['general', 'expert', 'young']).optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      )
    }

    // Check subscription for AI features
    try {
      await requireSubscription('premium')
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Premium subscription required for AI content generation',
          upgradeUrl: '/premium'
        }, 
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = generateContentSchema.parse(body)

    // Check rate limits based on subscription
    // Implementation would check user's usage limits

    // Generate content based on type
    let result: any

    switch (validatedData.type) {
      case 'article':
        result = await contentGenerator.generateArticle({
          topic: validatedData.topic,
          sourceUrl: validatedData.sourceUrl,
          style: validatedData.style || 'neutral',
          length: validatedData.length || 'medium',
          targetAudience: validatedData.targetAudience || 'general',
          includeSources: true
        })
        break

      case 'short':
        // For shorts, first create a basic article then generate script
        const baseContent = await contentGenerator.generateArticle({
          topic: validatedData.topic,
          sourceUrl: validatedData.sourceUrl,
          style: 'neutral',
          length: 'short',
          targetAudience: 'general'
        })

        const script = await contentGenerator.generateShortScript('temp', {
          id: 'temp',
          title: baseContent.title,
          summary: baseContent.summary,
          category: baseContent.category,
          content: baseContent.content,
          tags: baseContent.tags,
          author: 'AI',
          authorType: 'ai',
          biasScore: baseContent.biasScore,
          viewCount: 0,
          likes: 0,
          shares: 0,
          readTime: baseContent.readTime,
          isExclusive: false,
          createdAt: new Date(),
          updatedAt: new Date()
        } as any)

        result = {
          ...baseContent,
          script,
          type: 'short'
        }
        break

      case 'analysis':
        result = await contentGenerator.generateArticle({
          topic: validatedData.topic,
          sourceUrl: validatedData.sourceUrl,
          style: 'analytical',
          length: validatedData.length || 'long',
          targetAudience: 'expert',
          includeSources: true
        })

        // Add historical context for analysis
        if (validatedData.includeHistorical) {
          result.historicalParallels = await contentGenerator.enhanceWithHistoricalContext(
            result.content,
            validatedData.topic
          )
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid content type' },
          { status: 400 }
        )
    }

    // Add metadata
    const response = {
      ...result,
      generatedAt: new Date().toISOString(),
      generatedBy: session.user.id,
      contentType: validatedData.type,
      settings: {
        style: validatedData.style || 'neutral',
        length: validatedData.length || 'medium',
        includeHistorical: validatedData.includeHistorical || false
      }
    }

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('Content generation error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    if (error.message.includes('subscription')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}

// GET method to retrieve user's generation history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type')

    // This would typically fetch from database
    // For now, return mock data
    const mockHistory = [
      {
        id: '1',
        topic: 'Inteligência Artificial na Medicina',
        type: 'article',
        createdAt: new Date().toISOString(),
        title: 'IA Revoluciona Diagnósticos Médicos',
        wordCount: 850
      },
      {
        id: '2',
        topic: 'Sustentabilidade Corporativa',
        type: 'analysis',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        title: 'O Impacto ESG nas Empresas Modernas',
        wordCount: 1200
      }
    ]

    const filteredHistory = type 
      ? mockHistory.filter(item => item.type === type)
      : mockHistory

    const paginatedHistory = filteredHistory.slice(offset, offset + limit)

    return NextResponse.json({
      history: paginatedHistory,
      total: filteredHistory.length,
      hasMore: offset + limit < filteredHistory.length
    })

  } catch (error) {
    console.error('Error fetching generation history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    )
  }
}