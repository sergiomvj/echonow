'use client'

import { useState, useRef, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  Share2,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Eye,
  TrendingUp,
  Filter,
  Search,
  Grid3X3,
  List,
  Download,
  ExternalLink,
  Clock,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { sampleShorts, sampleCategories } from '@/lib/sampleData'

interface ShortCardProps {
  short: any
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
  isMuted: boolean
  onToggleMute: () => void
}

function ShortCard({ short, isPlaying, onPlay, onPause, isMuted, onToggleMute }: ShortCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  return (
    <Card className="relative overflow-hidden group cursor-pointer bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Video Placeholder */}
      <div className="relative aspect-[9/16] bg-gradient-to-br from-echo-cyan/20 to-echo-amber/20">
        {/* Play/Pause Overlay */}
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={isPlaying ? onPause : onPlay}
        >
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            {isPlaying ? (
              <Pause className="h-8 w-8 text-white" />
            ) : (
              <Play className="h-8 w-8 text-white ml-1" />
            )}
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="default" className="bg-black/50 text-white">
            <Clock className="h-3 w-3 mr-1" />
            {short.duration}s
          </Badge>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-echo-cyan/90 text-white">
            {short.category}
          </Badge>
        </div>

        {/* Bottom Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent h-24" />

        {/* Content Info */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="font-semibold text-sm mb-1 line-clamp-2">
            {short.title}
          </h3>
          <p className="text-xs opacity-80 line-clamp-2 mb-2">
            {short.description}
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                {(short.viewCount / 1000).toFixed(1)}K
              </span>
              <span className="flex items-center">
                <Heart className="h-3 w-3 mr-1" />
                {short.likes}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleMute()
                }}
                className="p-1 rounded bg-black/30"
              >
                {isMuted ? (
                  <VolumeX className="h-3 w-3" />
                ) : (
                  <Volume2 className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Playing Indicator */}
        {isPlaying && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-2 h-2 bg-echo-cyan rounded-full animate-pulse" />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="absolute right-3 bottom-20 flex flex-col space-y-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsLiked(!isLiked)
          }}
          className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
            isLiked ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>
        
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
        </button>
        
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-colors"
        >
          <Share2 className="h-4 w-4" />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsSaved(!isSaved)
          }}
          className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
            isSaved ? 'bg-echo-cyan text-white' : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
        
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-colors"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </Card>
  )
}

export default function ReelsPage() {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [searchQuery, setSearchQuery] = useState('')

  // Extended shorts data for demo
  const extendedShorts = [
    ...sampleShorts,
    {
      id: '4',
      title: 'Eleições 2024: O Que Você Precisa Saber',
      description: 'Análise rápida das principais propostas eleitorais',
      videoUrl: '/api/placeholder/video/short4.mp4',
      thumbnailUrl: '/api/placeholder/400/600',
      duration: 75,
      articleId: '4',
      category: 'Política',
      tags: ['Eleições', 'Democracia'],
      viewCount: 89200,
      likes: 3400,
      shares: 890,
      createdAt: new Date('2024-01-12T08:30:00Z')
    },
    {
      id: '5',
      title: 'Criptomoedas: Revolução ou Bolha?',
      description: 'Entenda o futuro das moedas digitais em 60 segundos',
      videoUrl: '/api/placeholder/video/short5.mp4',
      thumbnailUrl: '/api/placeholder/400/600',
      duration: 60,
      articleId: '5',
      category: 'Economia',
      tags: ['Crypto', 'Blockchain'],
      viewCount: 156700,
      likes: 4200,
      shares: 1200,
      createdAt: new Date('2024-01-11T14:15:00Z')
    },
    {
      id: '6',
      title: 'IA na Arte: Criatividade Digital',
      description: 'Como a inteligência artificial está mudando a arte',
      videoUrl: '/api/placeholder/video/short6.mp4',
      thumbnailUrl: '/api/placeholder/400/600',
      duration: 55,
      articleId: '6',
      category: 'Cultura',
      tags: ['IA', 'Arte'],
      viewCount: 78300,
      likes: 2100,
      shares: 450,
      createdAt: new Date('2024-01-10T11:45:00Z')
    }
  ]

  const filteredShorts = extendedShorts.filter(short => {
    const matchesSearch = searchQuery === '' || 
      short.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      short.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || 
      short.category.toLowerCase() === selectedCategory.toLowerCase()
    
    return matchesSearch && matchesCategory
  })

  const sortedShorts = [...filteredShorts].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.viewCount - a.viewCount
      case 'liked':
        return b.likes - a.likes
      case 'recent':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const handlePlay = (shortId: string) => {
    setCurrentlyPlaying(shortId)
  }

  const handlePause = () => {
    setCurrentlyPlaying(null)
  }

  const trendingTopics = [
    { name: 'Eleições 2024', count: 45 },
    { name: 'IA & Medicina', count: 38 },
    { name: 'Mudanças Climáticas', count: 32 },
    { name: 'Economia Global', count: 28 },
    { name: 'Tecnologia', count: 25 }
  ]

  return (
    <Layout currentPage="reels">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-echo-cyan/10 to-echo-amber/10 py-12">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold font-space-grotesk mb-4">
              Reels & Shorts
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Conteúdo rápido e informativo derivado dos nossos artigos mais relevantes
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por shorts..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-echo-cyan"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Controls */}
      <section className="py-6 border-b border-border">
        <div className="container px-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                Todos
              </Button>
              {sampleCategories.slice(0, 5).map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.name ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <span className="mr-1">{category.icon}</span>
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Sort and View Controls */}
            <div className="flex items-center gap-4">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-md border border-border bg-background text-sm"
              >
                <option value="recent">Mais Recentes</option>
                <option value="popular">Mais Populares</option>
                <option value="liked">Mais Curtidos</option>
              </select>

              {/* View Mode */}
              <div className="flex border border-border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none border-l"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-muted-foreground">
            {sortedShorts.length} shorts encontrados
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Shorts Grid */}
            <div className="lg:col-span-3">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {sortedShorts.map((short) => (
                    <ShortCard
                      key={short.id}
                      short={short}
                      isPlaying={currentlyPlaying === short.id}
                      onPlay={() => handlePlay(short.id)}
                      onPause={handlePause}
                      isMuted={isMuted}
                      onToggleMute={() => setIsMuted(!isMuted)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedShorts.map((short) => (
                    <Card key={short.id} className="p-4">
                      <div className="flex space-x-4">
                        <div className="flex-shrink-0 w-24 h-32 rounded-lg overflow-hidden bg-gradient-to-br from-echo-cyan/20 to-echo-amber/20 relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="h-6 w-6 text-echo-cyan" />
                          </div>
                          <div className="absolute bottom-1 right-1">
                            <Badge className="text-xs bg-black/50 text-white">
                              {short.duration}s
                            </Badge>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline">{short.category}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(short.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <h3 className="font-semibold mb-2 line-clamp-2">{short.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {short.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex space-x-4 text-xs text-muted-foreground">
                              <span className="flex items-center">
                                <Eye className="h-3 w-3 mr-1" />
                                {(short.viewCount / 1000).toFixed(1)}K
                              </span>
                              <span className="flex items-center">
                                <Heart className="h-3 w-3 mr-1" />
                                {short.likes}
                              </span>
                              <span className="flex items-center">
                                <Share2 className="h-3 w-3 mr-1" />
                                {short.shares}
                              </span>
                            </div>
                            <Button size="sm" variant="outline">
                              <Play className="h-3 w-3 mr-1" />
                              Assistir
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Trending Topics */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-echo-cyan" />
                  Trending Agora
                </h3>
                <div className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm cursor-pointer hover:text-echo-cyan transition-colors">
                        #{topic.name}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {topic.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Ações Rápidas</h3>
                <div className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Selecionados
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar Playlist
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver no YouTube
                  </Button>
                </div>
              </Card>

              {/* Create Content CTA */}
              <Card className="p-6 bg-gradient-to-br from-echo-cyan/10 to-echo-amber/10 border-echo-cyan/20">
                <h3 className="font-semibold mb-2">Crie Seus Shorts</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Use nosso Editor Virtual para transformar seus artigos em shorts envolventes
                </p>
                <Button size="sm" variant="gradient" className="w-full">
                  Começar Criação
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Load More */}
      <section className="py-8 text-center">
        <Button variant="outline" size="lg">
          Carregar Mais Shorts
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </section>
    </Layout>
  )
}