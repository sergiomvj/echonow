'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ArticleCard from '@/components/ui/ArticleCard'
import { 
  TrendingUp, 
  Zap, 
  Clock, 
  Users,
  Video,
  Brain,
  Eye,
  ChevronRight,
  Sparkles,
  Globe,
  BarChart3
} from 'lucide-react'
import { sampleArticles, sampleShorts, sampleCategories } from '@/lib/sampleData'

export default function HomePage() {
  const [featuredArticles, setFeaturedArticles] = useState(sampleArticles.slice(0, 3))
  const [trendingArticles, setTrendingArticles] = useState(sampleArticles.slice(3, 6))
  const [recentShorts, setRecentShorts] = useState(sampleShorts)

  const stats = [
    { label: 'Artigos Gerados', value: '1,247', icon: Brain, color: 'text-echo-cyan' },
    { label: 'Visualizações', value: '2.8M', icon: Eye, color: 'text-echo-amber' },
    { label: 'Usuários Ativos', value: '127K', icon: Users, color: 'text-green-500' },
    { label: 'Shorts Criados', value: '3,456', icon: Video, color: 'text-purple-500' }
  ]

  return (
    <Layout currentPage="home">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-echo-dark via-echo-dark/90 to-echo-dark/80">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="container relative px-4 py-16 md:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 flex justify-center">
              <Badge variant="secondary" className="px-4 py-1">
                <Sparkles className="mr-2 h-3 w-3" />
                Repercussão Inteligente
              </Badge>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-6xl font-space-grotesk">
              <span className="echo-gradient-text">EchoNow</span>
              <br />
              Aprofundamento sem viés
            </h1>
            
            <p className="mb-8 text-lg text-gray-300 max-w-2xl mx-auto">
              Plataforma que repercute e aprofunda fatos relevantes com inteligência artificial,
              oferecendo análises contextualizadas, comparações históricas e visão plural.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="gradient" className="h-12 px-8">
                <Brain className="mr-2 h-5 w-5" />
                Explorar Conteúdo
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8">
                <Video className="mr-2 h-5 w-5" />
                Assistir Shorts
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-background/50">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center p-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 mb-4 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold font-space-grotesk">{stat.value}</h3>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-16">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold font-space-grotesk mb-2">
                Destaques do Momento
              </h2>
              <p className="text-muted-foreground">
                Artigos mais relevantes gerados pela nossa IA
              </p>
            </div>
            <Button variant="outline">
              Ver Todos
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {featuredArticles.map((article) => (
              <ArticleCard 
                key={article.id} 
                article={article} 
                variant="featured"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-space-grotesk mb-4">
              Explore por Categoria
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Navegue pelos temas que mais importam para você, com análises 
              aprofundadas e contexto histórico
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {sampleCategories.map((category) => (
              <Card key={category.id} className="p-6 text-center hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="text-3xl mb-3">{category.icon}</div>
                <h3 className="font-semibold mb-2 group-hover:text-echo-cyan transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  {category.articleCount} artigos
                </p>
                <Badge variant="outline" className="text-xs">
                  Explorar
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Shorts Section */}
      <section className="py-16">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold font-space-grotesk mb-2">
                Shorts Recentes
              </h2>
              <p className="text-muted-foreground">
                Conteúdo rápido e informativo em formato de vídeo
              </p>
            </div>
            <Button variant="outline">
              <Video className="mr-2 h-4 w-4" />
              Ver Galeria
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {recentShorts.map((short) => (
              <Card key={short.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className="relative aspect-[9/16] bg-gradient-to-br from-echo-cyan/20 to-echo-amber/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Video className="h-12 w-12 text-echo-cyan mx-auto mb-4" />
                      <p className="text-sm font-medium text-white">{short.duration}s</p>
                    </div>
                  </div>
                  <div className="absolute top-3 left-3">
                    <Badge variant="default">{short.category}</Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-echo-cyan transition-colors">
                    {short.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {short.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{short.viewCount.toLocaleString()} views</span>
                    <span>{short.likes.toLocaleString()} likes</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold font-space-grotesk mb-2">
                <TrendingUp className="inline mr-3 h-8 w-8 text-echo-cyan" />
                Em Alta Agora
              </h2>
              <p className="text-muted-foreground">
                Os temas mais discutidos e analisados recentemente
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {trendingArticles.map((article) => (
              <ArticleCard 
                key={article.id} 
                article={article} 
                variant="compact"
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container px-4">
          <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-echo-cyan/10 to-echo-amber/10 border-echo-cyan/20">
            <div className="max-w-2xl mx-auto">
              <Brain className="h-16 w-16 text-echo-cyan mx-auto mb-6" />
              <h2 className="text-3xl font-bold font-space-grotesk mb-4">
                Crie Seu Próprio Conteúdo
              </h2>
              <p className="text-muted-foreground mb-6">
                Use nossa IA para gerar artigos personalizados, análises históricas 
                e comparações contextualizadas sobre qualquer tema
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="gradient">
                  <Zap className="mr-2 h-5 w-5" />
                  Começar Gratuitamente
                </Button>
                <Button size="lg" variant="outline">
                  <Globe className="mr-2 h-5 w-5" />
                  Saiba Mais
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </Layout>
  )
}