'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Layout from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Clock,
  Calendar,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  BarChart3,
  Eye,
  Heart,
  Share2,
  Filter,
  Search,
  Play,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Globe,
  MapPin,
  Users,
  Zap,
  History,
  Repeat
} from 'lucide-react'

interface TimelineEvent {
  id: string
  date: Date
  title: string
  description: string
  category: string
  impact: 'low' | 'medium' | 'high'
  region: string
  relatedEvents: string[]
  modernParallel?: {
    title: string
    date: Date
    similarity: number
  }
  stats: {
    views: number
    reactions: number
    discussions: number
  }
}

interface TimelinePeriod {
  id: string
  name: string
  startYear: number
  endYear: number
  description: string
}

export default function TimelinePage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('recent')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'timeline' | 'comparison'>('timeline')
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)

  const periods: TimelinePeriod[] = [
    {
      id: 'recent',
      name: 'Últimos 12 Meses',
      startYear: 2023,
      endYear: 2024,
      description: 'Eventos recentes e suas repercussões'
    },
    {
      id: 'decade',
      name: 'Última Década',
      startYear: 2014,
      endYear: 2024,
      description: 'Transformações da década de 2010-2020'
    },
    {
      id: 'century',
      name: 'Século XXI',
      startYear: 2000,
      endYear: 2024,
      description: 'Grandes marcos do novo milênio'
    },
    {
      id: 'historical',
      name: 'Marcos Históricos',
      startYear: 1900,
      endYear: 2024,
      description: 'Eventos que moldaram o mundo moderno'
    }
  ]

  const categories = [
    { id: 'all', name: 'Todos', icon: Globe },
    { id: 'politics', name: 'Política', icon: Users },
    { id: 'technology', name: 'Tecnologia', icon: Zap },
    { id: 'economy', name: 'Economia', icon: TrendingUp },
    { id: 'health', name: 'Saúde', icon: Heart },
    { id: 'environment', name: 'Meio Ambiente', icon: Globe }
  ]

  const timelineEvents: TimelineEvent[] = [
    {
      id: '1',
      date: new Date('2024-01-15'),
      title: 'IA Revoluciona Diagnósticos Médicos',
      description: 'Novos algoritmos conseguem detectar doenças com precisão superior a médicos especialistas.',
      category: 'technology',
      impact: 'high',
      region: 'Global',
      relatedEvents: ['2', '3'],
      modernParallel: {
        title: 'Descoberta dos Raios-X (1895)',
        date: new Date('1895-11-08'),
        similarity: 85
      },
      stats: {
        views: 45600,
        reactions: 1200,
        discussions: 340
      }
    },
    {
      id: '2',
      date: new Date('2023-12-10'),
      title: 'Crise Energética Global Intensifica',
      description: 'Países enfrentam desafios sem precedentes no fornecimento de energia.',
      category: 'economy',
      impact: 'high',
      region: 'Global',
      relatedEvents: ['1', '4'],
      modernParallel: {
        title: 'Crise do Petróleo de 1973',
        date: new Date('1973-10-17'),
        similarity: 92
      },
      stats: {
        views: 32100,
        reactions: 890,
        discussions: 245
      }
    },
    {
      id: '3',
      date: new Date('2023-11-20'),
      title: 'Mudanças Climáticas Aceleram',
      description: 'Novos dados revelam impactos mais rápidos que o previsto nas mudanças climáticas.',
      category: 'environment',
      impact: 'high',
      region: 'Global',
      relatedEvents: ['2', '5'],
      modernParallel: {
        title: 'Revolução Industrial (1760)',
        date: new Date('1760-01-01'),
        similarity: 78
      },
      stats: {
        views: 67800,
        reactions: 2100,
        discussions: 567
      }
    },
    {
      id: '4',
      date: new Date('2023-10-15'),
      title: 'Eleições Democratas Globais',
      description: 'Múltiplos países realizam eleições em um ano crucial para a democracia.',
      category: 'politics',
      impact: 'medium',
      region: 'Global',
      relatedEvents: ['2', '3'],
      modernParallel: {
        title: 'Ondas Democráticas de 1989',
        date: new Date('1989-11-09'),
        similarity: 71
      },
      stats: {
        views: 89200,
        reactions: 3400,
        discussions: 890
      }
    },
    {
      id: '5',
      date: new Date('2023-09-05'),
      title: 'Revolução das Criptomoedas',
      description: 'Adoção massiva de moedas digitais transforma o sistema financeiro.',
      category: 'economy',
      impact: 'medium',
      region: 'Global',
      relatedEvents: ['1', '4'],
      modernParallel: {
        title: 'Criação do Sistema Bretton Woods (1944)',
        date: new Date('1944-07-22'),
        similarity: 65
      },
      stats: {
        views: 156700,
        reactions: 4200,
        discussions: 1200
      }
    }
  ]

  const filteredEvents = timelineEvents.filter(event => {
    if (selectedCategory !== 'all' && event.category !== selectedCategory) {
      return false
    }
    return true
  })

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const formatDate = (date: Date) => {
    // Use consistent formatting to avoid server/client hydration mismatches
    const year = date.getFullYear()
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const day = date.getDate().toString().padStart(2, '0')
    return `${day} ${month} ${year}`
  }

  const calculateDaysAgo = (date: Date) => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Component for client-only content to prevent hydration issues
  const ClientOnlyText = ({ children }: { children: React.ReactNode }) => {
    return <span suppressHydrationWarning>{children}</span>
  }

  return (
    <Layout currentPage="timeline">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-echo-cyan/10 to-echo-amber/10 py-12">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-echo-cyan/20 to-echo-amber/20 px-4 py-2 rounded-full">
                <Clock className="h-5 w-5 text-echo-cyan" />
                <span className="text-sm font-medium">Análise Temporal</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold font-space-grotesk mb-4">
              Linha do Tempo
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Explore a repercussão cronológica de fatos e descubra padrões históricos
              que se repetem ao longo do tempo
            </p>
          </div>
        </div>
      </section>

      {/* Period Selection */}
      <section className="py-8 border-b border-border">
        <div className="container px-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Period Tabs */}
            <div className="flex flex-wrap gap-2">
              {periods.map((period) => (
                <Button
                  key={period.id}
                  variant={selectedPeriod === period.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period.id)}
                  className="flex flex-col items-start p-3 h-auto"
                >
                  <span className="font-medium">{period.name}</span>
                  <span className="text-xs opacity-70">{period.description}</span>
                </Button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-4">
              <div className="flex border border-border rounded-md">
                <Button
                  variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('timeline')}
                  className="rounded-r-none"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Timeline
                </Button>
                <Button
                  variant={viewMode === 'comparison' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('comparison')}
                  className="rounded-l-none border-l"
                >
                  <Repeat className="h-4 w-4 mr-2" />
                  Comparações
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="py-6 bg-muted/30">
        <div className="container px-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {category.name}
                </Button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Main Timeline Content */}
      <section className="py-12">
        <div className="container px-4">
          {viewMode === 'timeline' ? (
            <div className="max-w-4xl mx-auto">
              {/* Timeline */}
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-echo-cyan to-echo-amber" />
                
                {/* Timeline Events */}
                <div className="space-y-8">
                  {filteredEvents.map((event, index) => (
                    <div key={event.id} className="relative flex items-start space-x-6">
                      {/* Timeline Dot */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-4 h-4 rounded-full border-2 border-white ${getImpactColor(event.impact)} z-10 relative`} />
                        <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-echo-cyan/20 animate-pulse" />
                      </div>

                      {/* Event Card */}
                      <Card className="flex-1 hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {event.category}
                                </Badge>
                                <Badge 
                                  className={`text-xs text-white ${getImpactColor(event.impact)}`}
                                >
                                  {event.impact === 'high' ? 'Alto Impacto' : 
                                   event.impact === 'medium' ? 'Médio Impacto' : 'Baixo Impacto'}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {event.region}
                                </span>
                              </div>
                              
                              <h3 className="text-lg font-semibold mb-2 hover:text-echo-cyan cursor-pointer transition-colors">
                                {event.title}
                              </h3>
                              <p className="text-muted-foreground text-sm mb-4">
                                {event.description}
                              </p>

                              {/* Historical Parallel */}
                              {event.modernParallel && (
                                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <History className="h-4 w-4 text-echo-amber" />
                                    <span className="text-sm font-medium">Paralelo Histórico</span>
                                    <Badge variant="secondary" className="text-xs">
                                      {event.modernParallel.similarity}% similar
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    <strong>{event.modernParallel.title}</strong> • <ClientOnlyText><span>{formatDate(event.modernParallel.date)}</span></ClientOnlyText>
                                  </p>
                                </div>
                              )}

                              {/* Stats */}
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <span className="flex items-center">
                                  <Eye className="h-3 w-3 mr-1" />
                                  <ClientOnlyText>
                                    <span>{(event.stats.views / 1000).toFixed(1)}K views</span>
                                  </ClientOnlyText>
                                </span>
                                <span className="flex items-center">
                                  <Heart className="h-3 w-3 mr-1" />
                                  {event.stats.reactions}
                                </span>
                                <span className="flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  {event.stats.discussions} discussões
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <ClientOnlyText>
                                <div className="text-sm font-medium">
                                  {formatDate(event.date)}
                                </div>
                              </ClientOnlyText>
                              <ClientOnlyText>
                                <div className="text-xs text-muted-foreground">
                                  {calculateDaysAgo(event.date)} dias atrás
                                </div>
                              </ClientOnlyText>
                            </div>
                          </div>

                          {/* Expand/Collapse Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedEvent(
                              expandedEvent === event.id ? null : event.id
                            )}
                            className="w-full"
                          >
                            {expandedEvent === event.id ? (
                              <>
                                <ChevronUp className="h-4 w-4 mr-2" />
                                Mostrar Menos
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-2" />
                                Ver Análise Completa
                              </>
                            )}
                          </Button>

                          {/* Expanded Content */}
                          {expandedEvent === event.id && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Análise Detalhada</h4>
                                  <p className="text-sm text-muted-foreground mb-4">
                                    Este evento representa um marco significativo que ecoa padrões 
                                    históricos semelhantes, oferecendo insights valiosos sobre 
                                    tendências sociais e econômicas.
                                  </p>
                                  <Button size="sm" variant="outline">
                                    <BookOpen className="h-3 w-3 mr-2" />
                                    Ler Artigo Completo
                                  </Button>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Eventos Relacionados</h4>
                                  <div className="space-y-2">
                                    {event.relatedEvents.slice(0, 2).map((relatedId) => {
                                      const related = timelineEvents.find(e => e.id === relatedId)
                                      return related ? (
                                        <div key={relatedId} className="text-sm">
                                          <span className="text-echo-cyan cursor-pointer hover:underline">
                                            {related.title}
                                          </span>
                                        </div>
                                      ) : null
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Comparison View
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-semibold mb-6">Eventos Atuais</h2>
                  <div className="space-y-4">
                    {filteredEvents.slice(0, 3).map((event) => (
                      <Card key={event.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline">{event.category}</Badge>
                          <ClientOnlyText>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(event.date)}
                            </span>
                          </ClientOnlyText>
                        </div>
                        <h3 className="font-semibold mb-2">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-6">Paralelos Históricos</h2>
                  <div className="space-y-4">
                    {filteredEvents.slice(0, 3).map((event) => (
                      event.modernParallel && (
                        <Card key={event.id} className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {event.modernParallel.similarity}% similar
                            </Badge>
                            <ClientOnlyText>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(event.modernParallel.date)}
                              </span>
                            </ClientOnlyText>
                          </div>
                          <h3 className="font-semibold mb-2">{event.modernParallel.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Evento histórico que apresenta padrões similares ao atual "{event.title}"
                          </p>
                          <div className="mt-3">
                            <Button size="sm" variant="outline">
                              <ArrowRight className="h-3 w-3 mr-2" />
                              Comparar Detalhes
                            </Button>
                          </div>
                        </Card>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Interactive Insights */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold font-space-grotesk mb-4">
              Insights Temporais
            </h2>
            <p className="text-muted-foreground mb-8">
              Padrões e tendências identificados pela nossa análise temporal
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-echo-cyan/20 mb-4">
                  <BarChart3 className="h-6 w-6 text-echo-cyan" />
                </div>
                <h3 className="font-semibold mb-2">Ciclos Históricos</h3>
                <p className="text-sm text-muted-foreground">
                  Identificamos 12 padrões recorrentes nos últimos 50 anos
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-echo-amber/20 mb-4">
                  <TrendingUp className="h-6 w-6 text-echo-amber" />
                </div>
                <h3 className="font-semibold mb-2">Tendências Emergentes</h3>
                <p className="text-sm text-muted-foreground">
                  IA e sustentabilidade dominam as discussões atuais
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-green-500/20 mb-4">
                  <Globe className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="font-semibold mb-2">Impacto Global</h3>
                <p className="text-sm text-muted-foreground">
                  89% dos eventos têm repercussão internacional
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}