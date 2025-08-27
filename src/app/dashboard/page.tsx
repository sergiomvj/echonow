'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Layout from '@/components/layout/Layout'
import { LoadingStates } from '@/components/ui/LoadingStates'
import { useToast } from '@/components/ui/toast'
import { useMemoizedFetch, PerformanceMonitor, useVirtualList } from '@/lib/performance'
import { cn } from '@/lib/utils'

interface DashboardStats {
  totalContent: number
  contentThisMonth: number
  totalWords: number
  subscriptionStatus: string
  subscriptionPlan: string
  remainingCredits: number
}

interface ContentItem {
  id: string
  title: string
  type: string
  content: string
  createdAt: string
  wordCount: number
  status: 'draft' | 'published'
}

const quickActions = [
  {
    title: 'Generate Blog Post',
    description: 'Create engaging blog content',
    href: '/generator?type=blog',
    icon: '📝',
    color: 'bg-blue-500'
  },
  {
    title: 'Social Media Posts',
    description: 'Create social media content',
    href: '/generator?type=social',
    icon: '📱',
    color: 'bg-pink-500'
  },
  {
    title: 'Email Campaign',
    description: 'Write marketing emails',
    href: '/generator?type=email',
    icon: '📧',
    color: 'bg-green-500'
  },
  {
    title: 'Product Descriptions',
    description: 'Create product copy',
    href: '/generator?type=product',
    icon: '🛍️',
    color: 'bg-purple-500'
  }
]

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { success: showToast } = useToast()
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'draft' | 'published'>('all')

  // Performance monitoring
  const performanceMonitor = useMemo(() => PerformanceMonitor.getInstance(), [])

  // Fetch dashboard stats with caching
  const { 
    data: stats, 
    loading: statsLoading,
    error: statsError 
  } = useMemoizedFetch<DashboardStats>(
    '/api/dashboard/stats',
    { 
      headers: { 'Content-Type': 'application/json' },
      method: 'GET'
    },
    [session?.user?.id]
  )

  // Fetch recent content with caching
  const { 
    data: contentData, 
    loading: contentLoading,
    error: contentError 
  } = useMemoizedFetch<ContentItem[]>(
    '/api/content/recent',
    { 
      headers: { 'Content-Type': 'application/json' },
      method: 'GET'
    },
    [session?.user?.id]
  )

  // Filter content based on selected filter
  const filteredContent = useMemo(() => {
    if (!contentData) return []
    
    if (selectedFilter === 'all') return contentData
    return contentData.filter(item => item.status === selectedFilter)
  }, [contentData, selectedFilter])

  // Virtual list for large content lists
  const { visibleItems, totalHeight, setScrollTop } = useVirtualList({
    items: filteredContent,
    itemHeight: 80,
    containerHeight: 400,
    overscan: 5
  })

  // Handle authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Performance tracking
  useEffect(() => {
    const endTiming = performanceMonitor.startTiming('dashboard-load')
    return endTiming
  }, [performanceMonitor])

  if (status === 'loading') {
    return (
      <Layout currentPage="Dashboard">
        <div className="echo-container py-8">
          <div className="space-y-6">
            <LoadingStates.Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <LoadingStates.Card key={i} />
              ))}
            </div>
            <LoadingStates.Skeleton className="h-64 w-full" />
          </div>
        </div>
      </Layout>
    )
  }

  if (!session) {
    return null // Will redirect via useEffect
  }

  return (
    <Layout currentPage="Dashboard">
      <div className="echo-container py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold echo-gradient-text mb-2">
              Welcome back, {session.user?.name?.split(' ')[0] || 'Creator'}!
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your content today.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <LoadingStates.Card key={i} />
              ))
            ) : statsError ? (
              <div className="col-span-full echo-card p-6 text-center">
                <p className="text-destructive">Failed to load stats</p>
              </div>
            ) : stats ? (
              <>
                <StatCard
                  title="Total Content"
                  value={stats.totalContent}
                  icon="📄"
                  change="+12% from last month"
                />
                <StatCard
                  title="This Month"
                  value={stats.contentThisMonth}
                  icon="📅"
                  change="New pieces created"
                />
                <StatCard
                  title="Total Words"
                  value={stats.totalWords.toLocaleString()}
                  icon="📊"
                  change="Across all content"
                />
                <StatCard
                  title="Remaining Credits"
                  value={stats.remainingCredits}
                  icon="⚡"
                  change={`${stats.subscriptionPlan} plan`}
                  isCredit
                />
              </>
            ) : null}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="echo-card-hover p-4 block group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center text-white",
                      action.color
                    )}>
                      <span className="text-lg">{action.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="echo-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Recent Content</h2>
                  <div className="flex space-x-2">
                    {(['all', 'draft', 'published'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setSelectedFilter(filter)}
                        className={cn(
                          "px-3 py-1 text-sm rounded-md capitalize transition-colors",
                          selectedFilter === filter
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                        )}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {contentLoading ? (
                  <LoadingStates.List items={5} />
                ) : contentError ? (
                  <div className="text-center py-8">
                    <p className="text-destructive">Failed to load content</p>
                  </div>
                ) : filteredContent.length > 0 ? (
                  <div
                    className="space-y-4 max-h-96 overflow-y-auto"
                    onScroll={(e: React.UIEvent<HTMLDivElement>) => setScrollTop(e.currentTarget.scrollTop)}
                  >
                    <div style={{ height: totalHeight }}>
                      {visibleItems.map(({ item, index }: { item: any; index: any }) => (
                        <ContentItemCard
                          key={item.id}
                          item={item}
                          style={{
                            position: 'absolute',
                            top: index * 80,
                            left: 0,
                            right: 0,
                            height: 80
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No content found. Start creating!
                    </p>
                    <Link
                      href="/generator"
                      className="echo-button bg-primary text-primary-foreground px-4 py-2"
                    >
                      Create Content
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="lg:col-span-1">
              <div className="echo-card p-6">
                <h3 className="text-lg font-semibold mb-4">Activity Feed</h3>
                <ActivityFeed />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  change,
  isCredit = false
}: {
  title: string
  value: number | string
  icon: string
  change: string
  isCredit?: boolean
}) {
  return (
    <div className="echo-card p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="mb-1">
        <span className={cn(
          "text-2xl font-bold",
          isCredit && typeof value === 'number' && value < 10 
            ? "text-destructive" 
            : "text-foreground"
        )}>
          {value}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{change}</p>
    </div>
  )
}

// Content Item Card Component
function ContentItemCard({ 
  item, 
  style 
}: { 
  item: ContentItem
  style?: React.CSSProperties 
}) {
  const { success: showToast, error: showError } = useToast()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.content)
      showToast('Content copied to clipboard!')
    } catch (error) {
      showError('Failed to copy content')
    }
  }

  return (
    <div
      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
      style={style}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <h4 className="font-medium truncate">{item.title}</h4>
          <span className={cn(
            "px-2 py-1 text-xs rounded-full",
            item.status === 'published' 
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
          )}>
            {item.status}
          </span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span className="capitalize">{item.type}</span>
          <span>{item.wordCount} words</span>
          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={handleCopy}
          className="text-sm px-3 py-1 border border-border rounded hover:bg-accent"
        >
          Copy
        </button>
        <Link
          href={`/content/${item.id}`}
          className="text-sm px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Edit
        </Link>
      </div>
    </div>
  )
}

// Activity Feed Component
function ActivityFeed() {
  const activities = [
    { id: 1, text: 'Generated blog post about AI trends', time: '2 hours ago' },
    { id: 2, text: 'Created social media campaign', time: '5 hours ago' },
    { id: 3, text: 'Published product description', time: '1 day ago' },
    { id: 4, text: 'Saved email newsletter draft', time: '2 days ago' },
  ]

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex space-x-3">
          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm">{activity.text}</p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}