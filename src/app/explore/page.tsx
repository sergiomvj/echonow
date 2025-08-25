'use client'

import { useState } from 'react'
import Layout from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ArticleCard from '@/components/ui/ArticleCard'
import { 
  Search, 
  Filter, 
  Grid, 
  List,
  TrendingUp,
  Clock,
  Star,
  Globe,
  Users,
  Zap,
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react'
import { sampleArticles, sampleCategories } from '@/lib/sampleData'

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedFilter, setSelectedFilter] = useState('recent')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  const filterOptions = [
    { id: 'recent', label: 'Mais Recentes', icon: Clock },
    { id: 'trending', label: 'Em Alta', icon: TrendingUp },
    { id: 'popular', label: 'Mais Populares', icon: Star },
    { id: 'bias-free', label: 'Sem Viés', icon: Zap },
  ]

  const regionFilters = [
    { id: 'global', label: 'Global', icon: Globe },
    { id: 'brazil', label: 'Brasil', icon: '🇧🇷' },
    { id: 'latam', label: 'América Latina', icon: '🌎' },
    { id: 'usa', label: 'Estados Unidos', icon: '🇺🇸' },
    { id: 'europe', label: 'Europa', icon: '🇪🇺' },
    { id: 'asia', label: 'Ásia', icon: '🌏' },
  ]

  const timeFilters = [
    { id: 'today', label: 'Hoje' },
    { id: 'week', label: 'Esta Semana' },
    { id: 'month', label: 'Este Mês' },
    { id: 'year', label: 'Este Ano' },
    { id: 'all', label: 'Todos' },
  ]

  const filteredArticles = sampleArticles.filter(article => {
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || 
      article.category.toLowerCase() === selectedCategory.toLowerCase()
    
    return matchesSearch && matchesCategory
  })

  return (
    <Layout currentPage="explore">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-echo-cyan/10 to-echo-amber/10 py-12">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold font-space-grotesk mb-4">
              Explore o Conhecimento
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Navegue por análises aprofundadas, fatos atemporais e descobertas contextualizadas
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Busque por temas, palavras-chave ou tags..."
                className="w-full pl-12 pr-4 py-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-echo-cyan"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-8 border-b border-border">
        <div className="container px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className="mb-2"
            >
              Todas as Categorias
            </Button>
            {sampleCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.name ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.name)}
                className="mb-2"
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Filters and Controls */}
      <section className="py-6 bg-muted/30">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Filter Options */}
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((filter) => {
                const Icon = filter.icon
                return (
                  <Button
                    key={filter.id}
                    variant={selectedFilter === filter.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFilter(filter.id)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {filter.label}
                  </Button>
                )
              })}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtros Avançados
              </Button>
              
              <div className="flex border border-border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
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

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 p-6 bg-background rounded-lg border border-border">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Region Filter */}
                <div>
                  <h3 className="font-semibold mb-3">Região</h3>
                  <div className="space-y-2">
                    {regionFilters.map((region) => (
                      <label key={region.id} className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{typeof region.icon === 'string' ? region.icon : <region.icon className="h-4 w-4" />}</span>
                        <span className="text-sm">{region.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Time Filter */}
                <div>
                  <h3 className="font-semibold mb-3">Período</h3>
                  <div className="space-y-2">
                    {timeFilters.map((time) => (
                      <label key={time.id} className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="timeFilter" className="rounded" />
                        <span className="text-sm">{time.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Bias Filter */}
                <div>
                  <h3 className="font-semibold mb-3">Nível de Viés</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <Badge variant="success" className="text-xs">Neutro (0-30%)</Badge>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <Badge variant="warning" className="text-xs">Moderado (30-60%)</Badge>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <Badge variant="destructive" className="text-xs">Alto (60%+)</Badge>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      <section className="py-8">
        <div className="container px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {filteredArticles.length} resultados encontrados
            </h2>
            <div className="text-sm text-muted-foreground">
              Ordenado por: {filterOptions.find(f => f.id === selectedFilter)?.label}
            </div>
          </div>

          {/* Articles Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
                  variant="default"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
                  variant="compact"
                />
              ))}
            </div>
          )}

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Carregar Mais Artigos
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Trending Topics Sidebar */}
      <section className="py-8 bg-muted/30">
        <div className="container px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <h3 className="text-xl font-semibold mb-4">Fatos Atemporais</h3>
              <p className="text-muted-foreground mb-6">
                Descobertas e análises que transcendem o tempo, oferecendo contexto histórico e perspectiva duradoura.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {sampleArticles.slice(0, 4).map((article) => (
                  <Card key={article.id} className="p-4">
                    <h4 className="font-semibold text-sm mb-2 line-clamp-2">{article.title}</h4>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{article.summary}</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-xs">{article.category}</Badge>
                      <span className="text-xs text-muted-foreground">{article.readTime}min</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-echo-cyan" />
                  Trending Agora
                </h3>
                <div className="space-y-3">
                  {['Inteligência Artificial', 'Mudanças Climáticas', 'Economia Global', 'Política Internacional'].map((topic, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{topic}</span>
                      <Badge variant="secondary" className="text-xs">
                        {Math.floor(Math.random() * 100) + 50}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-echo-amber" />
                  Comunidade
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong>1,247</strong> artigos sugeridos pela comunidade
                  </div>
                  <div>
                    <strong>5,689</strong> votos em pautas ativas
                  </div>
                  <div>
                    <strong>89</strong> temas em análise
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    Participar
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}