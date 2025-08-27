import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import { biasDetector } from '@/lib/ai/bias-detector'
import { z } from 'zod'

const biasAnalysisSchema = z.object({
  content: z.string().min(100, 'Content must be at least 100 characters for meaningful analysis'),
  contentType: z.enum(['article', 'short', 'comment']).optional(),
  checkHistorical: z.boolean().optional()
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

    const body = await request.json()
    const validatedData = biasAnalysisSchema.parse(body)

    // Analyze content for bias
    const biasAnalysis = await biasDetector.analyzeContent(
      validatedData.content,
      validatedData.contentType || 'article'
    )

    // Get detailed breakdown
    const detailedAnalysis = await biasDetector.getDetailedAnalysis(
      validatedData.content
    )

    // Historical comparison if requested
    let historicalContext = null
    if (validatedData.checkHistorical) {
      historicalContext = await biasDetector.compareWithHistoricalBias(
        validatedData.content
      )
    }

    const response = {
      analysis: biasAnalysis,
      detailed: detailedAnalysis,
      historical: historicalContext,
      analyzedAt: new Date().toISOString(),
      contentLength: validatedData.content.length,
      recommendations: generateRecommendations(biasAnalysis)
    }

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('Bias analysis error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to analyze content for bias' },
      { status: 500 }
    )
  }
}

function generateRecommendations(biasAnalysis: any) {
  const recommendations = []

  if (biasAnalysis.overallScore > 0.7) {
    recommendations.push({
      type: 'high-bias',
      message: 'Content shows significant bias indicators. Consider reviewing language and sources.',
      priority: 'high'
    })
  }

  if (biasAnalysis.categories.political > 0.5) {
    recommendations.push({
      type: 'political-bias',
      message: 'Political bias detected. Include multiple perspectives or clarify editorial stance.',
      priority: 'medium'
    })
  }

  if (biasAnalysis.categories.emotional > 0.6) {
    recommendations.push({
      type: 'emotional-language',
      message: 'High emotional language detected. Consider more neutral phrasing for objectivity.',
      priority: 'medium'
    })
  }

  if (biasAnalysis.categories.factual < 0.3) {
    recommendations.push({
      type: 'low-factual',
      message: 'Content may lack factual backing. Add more sources and data.',
      priority: 'high'
    })
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'good-balance',
      message: 'Content appears well-balanced with minimal bias indicators.',
      priority: 'info'
    })
  }

  return recommendations
}