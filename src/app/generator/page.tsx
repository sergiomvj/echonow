'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Layout from '@/components/layout/Layout'
import { LoadingStates } from '@/components/ui/LoadingStates'
import { useToast } from '@/components/ui/toast'
import { useDebounce, useMemoizedFetch, PerformanceMonitor } from '@/lib/performance'
import { aiGenerationSchema } from '@/lib/validations'
import { cn } from '@/lib/utils'

type FormData = z.infer<typeof aiGenerationSchema>

const contentTypes = [
  { id: 'article', name: 'Article', description: 'In-depth news articles' },
  { id: 'short', name: 'Short', description: 'Quick summaries and highlights' },
  { id: 'analysis', name: 'Analysis', description: 'Detailed analysis and insights' }
]

const styles = [
  { id: 'neutral', name: 'Neutral' },
  { id: 'analytical', name: 'Analytical' },
  { id: 'comprehensive', name: 'Comprehensive' }
]

export default function AIGeneratorPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { success: showToast, error: showError } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [contentHistory, setContentHistory] = useState<Array<{
    id: string
    content: string
    prompt: string
    type: string
    createdAt: Date
  }>>([])

  // Performance monitoring
  const performanceMonitor = useMemo(() => PerformanceMonitor.getInstance(), [])

  // Form setup with validation
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(aiGenerationSchema),
    defaultValues: {
      type: 'article',
      style: 'neutral',
      length: 'medium',
      includeHistorical: false,
      targetAudience: 'general'
    }
  })

  // Watch form values for real-time updates
  const watchedValues = watch()
  const debouncedTopic = useDebounce(watchedValues.topic || '', 300)

  // Fetch user's content history with caching
  const { 
    data: historyData, 
    loading: historyLoading 
  } = useMemoizedFetch<Array<any>>(
    '/api/ai/history',
    { headers: { 'Content-Type': 'application/json' } },
    [session?.user?.id]
  )

  // Update content history when data is fetched
  useEffect(() => {
    if (historyData) {
      setContentHistory(historyData)
    }
  }, [historyData])

  // Character count for topic
  const topicLength = useMemo(() => {
    return debouncedTopic.length
  }, [debouncedTopic])

  // Generate content with performance tracking
  const generateContent = useCallback(async (data: FormData) => {
    if (!session) {
      showError('Please sign in to generate content')
      return
    }

    const endTiming = performanceMonitor.startTiming('ai-generation')
    setIsGenerating(true)
    setGeneratedContent('')

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to generate content')
      }

      const result = await response.json()
      setGeneratedContent(result.content)
      
      // Add to history
      const newItem = {
        id: Date.now().toString(),
        content: result.content,
        prompt: data.topic,
        type: data.type,
        createdAt: new Date()
      }
      setContentHistory((prev: typeof contentHistory) => [newItem, ...prev])
      
      showToast('Content generated successfully!')
    } catch (error) {
      console.error('Generation error:', error)
      showError(
        error instanceof Error ? error.message : 'Failed to generate content'
      )
    } finally {
      setIsGenerating(false)
      endTiming()
    }
  }, [session, performanceMonitor, showToast, showError])

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showToast('Copied to clipboard!')
    } catch (error) {
      showError('Failed to copy to clipboard')
    }
  }, [showToast, showError])

  // Save content
  const saveContent = useCallback(async (content: string, topic: string) => {
    try {
      const response = await fetch('/api/ai/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, topic }),
      })

      if (!response.ok) {
        throw new Error('Failed to save content')
      }

      showToast('Content saved successfully!')
    } catch (error) {
      showError('Failed to save content')
    }
  }, [showToast, showError])

  if (!session) {
    return (
      <Layout currentPage="AI Generator">
        <div className="echo-container py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">AI Content Generator</h1>
            <p className="text-muted-foreground mb-8">
              Please sign in to access the AI content generator.
            </p>
            <button
              onClick={() => router.push('/auth/signin')}
              className="echo-button bg-primary text-primary-foreground px-6 py-3"
            >
              Sign In
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout currentPage="AI Generator">
      <div className="echo-container py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold echo-gradient-text mb-2">
              AI Content Generator
            </h1>
            <p className="text-muted-foreground">
              Create engaging content with our AI-powered generator
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Generation Form */}
            <div className="lg:col-span-2">
              <div className="echo-card p-6">
                <form onSubmit={handleSubmit(generateContent)} className="space-y-6">
                  {/* Content Type Selection */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Content Type
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {contentTypes.map((type) => (
                        <label
                          key={type.id}
                          className={cn(
                            "flex flex-col p-3 border rounded-lg cursor-pointer transition-colors",
                            "hover:border-primary/50",
                            watchedValues.type === type.id
                              ? "border-primary bg-primary/5"
                              : "border-border"
                          )}
                        >
                          <input
                            type="radio"
                            value={type.id}
                            {...register('type')}
                            className="sr-only"
                          />
                          <span className="font-medium text-sm">{type.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {type.description}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Topic */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Topic to generate content about
                      <span className="text-xs text-muted-foreground ml-2">
                        ({topicLength}/500 characters)
                      </span>
                    </label>
                    <textarea
                      {...register('topic')}
                      placeholder="e.g., Sustainable technology trends in 2024, AI impact on journalism..."
                      className={cn(
                        "w-full p-3 border border-border rounded-lg",
                        "focus:ring-2 focus:ring-primary focus:border-transparent",
                        "resize-none h-32",
                        errors.topic && "border-destructive"
                      )}
                      maxLength={500}
                    />
                    {errors.topic && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.topic.message}
                      </p>
                    )}
                  </div>

                  {/* Style and Length */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Style
                      </label>
                      <select
                        {...register('style')}
                        className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        {styles.map((style) => (
                          <option key={style.id} value={style.id}>
                            {style.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Length
                      </label>
                      <select
                        {...register('length')}
                        className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="short">Short (100-200 words)</option>
                        <option value="medium">Medium (200-500 words)</option>
                        <option value="long">Long (500+ words)</option>
                      </select>
                    </div>
                  </div>

                  {/* Target Audience and Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Target Audience
                      </label>
                      <select
                        {...register('targetAudience')}
                        className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="general">General Public</option>
                        <option value="expert">Industry Experts</option>
                        <option value="young">Young Adults</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-3">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register('includeHistorical')}
                          className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                        />
                        <span className="text-sm font-medium">
                          Include Historical Context
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Source URL */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Source URL (Optional)
                    </label>
                    <input
                      type="url"
                      {...register('sourceUrl')}
                      placeholder="https://example.com/source-article"
                      className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {errors.sourceUrl && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.sourceUrl.message}
                      </p>
                    )}
                  </div>

                  {/* Custom Prompt */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Custom Instructions (Optional)
                    </label>
                    <textarea
                      {...register('customPrompt')}
                      placeholder="Add any specific instructions or requirements..."
                      className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none h-24"
                      maxLength={1000}
                    />
                    {errors.customPrompt && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.customPrompt.message}
                      </p>
                    )}
                  </div>

                  {/* Generate Button */}
                  <LoadingStates.Button
                    type="submit"
                    isLoading={isGenerating}
                    disabled={isGenerating || !debouncedTopic.trim()}
                    className="w-full py-3 text-base"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Content'}
                  </LoadingStates.Button>
                </form>
              </div>

              {/* Generated Content */}
              {(generatedContent || isGenerating) && (
                <div className="echo-card p-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Generated Content</h3>
                    {generatedContent && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyToClipboard(generatedContent)}
                          className="text-sm px-3 py-1 border border-border rounded hover:bg-accent"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => saveContent(generatedContent, watchedValues.topic || '')}
                          className="text-sm px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>

                  {isGenerating ? (
                    <div className="space-y-4">
                      <LoadingStates.Skeleton className="h-4 w-full" />
                      <LoadingStates.Skeleton className="h-4 w-full" />
                      <LoadingStates.Skeleton className="h-4 w-3/4" />
                      <LoadingStates.Skeleton className="h-4 w-full" />
                      <LoadingStates.Skeleton className="h-4 w-2/3" />
                    </div>
                  ) : (
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap bg-muted/30 p-4 rounded-lg">
                        {generatedContent}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* History Sidebar */}
            <div className="lg:col-span-1">
              <div className="echo-card p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Generations</h3>
                
                {historyLoading ? (
                  <LoadingStates.List items={3} />
                ) : contentHistory.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {contentHistory.slice(0, 10).map((item: any) => (
                      <div
                        key={item.id}
                        className="p-3 border border-border rounded-lg hover:bg-accent/50 cursor-pointer"
                        onClick={() => {
                          setGeneratedContent(item.content)
                        }}
                      >
                        <div className="text-sm font-medium capitalize mb-1">
                          {item.type}
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {item.prompt.slice(0, 50)}...
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No content generated yet. Create your first piece of content!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}