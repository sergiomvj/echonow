'use client'

// Fixed lucide-react import issues

import { useState } from 'react'
import Layout from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users,
  Plus,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Flag,
  TrendingUp,
  Clock,
  Eye,
  Star,
  Award,
  Target,
  Lightbulb,
  Send,
  Filter,
  Search,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  UserCheck,
  Zap,
  Crown,
  Heart
} from 'lucide-react'

interface TopicSuggestion {
  id: string
  title: string
  description: string
  author: string
  authorAvatar: string
  category: string
  votes: number
  userVote?: 'up' | 'down' | null
  comments: number
  status: 'pending' | 'approved' | 'rejected' | 'in-progress'
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  tags: string[]
  reasoning?: string
}

interface CommunityStats {
  totalSuggestions: number
  activeVoters: number
  implementedSuggestions: number
  averageResponseTime: number
}

export default function ParticipatePage() {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'voting' | 'contribute'>('suggestions')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('popular')
  const [showNewSuggestionForm, setShowNewSuggestionForm] = useState(false)
  const [newSuggestion, setNewSuggestion] = useState({
    title: '',
    description: '',
    category: '',
    tags: ''
  })

  const communityStats: CommunityStats = {
    totalSuggestions: 1247,
    activeVoters: 5689,
    implementedSuggestions: 189,
    averageResponseTime: 3.2
  }

  const topicSuggestions: TopicSuggestion[] = [
    {
      id: '1',
      title: 'Análise do Impacto da IA na Educação Brasileira',
      description: 'Seria interessante uma análise aprofundada sobre como a inteligência artificial está transformando o sistema educacional no Brasil, incluindo benefícios e desafios.',
      author: 'Maria Silva',
      authorAvatar: '👩‍🏫',
      category: 'Educação',
      votes: 247,
      userVote: 'up',
      comments: 34,
      status: 'approved',
      priority: 'high',
      createdAt: new Date('2024-01-10T14:30:00Z'),
      tags: ['IA', 'Educação', 'Brasil', 'Tecnologia'],
      reasoning: 'Tema relevante e atual com grande interesse da comunidade'
    },
    {
      id: '2',
      title: 'Comparação: Crise Hídrica Atual vs. Secas Históricas',
      description: 'Uma análise comparativa entre a atual crise hídrica e grandes secas históricas, explorando padrões climáticos e soluções implementadas.',
      author: 'João Santos',
      authorAvatar: '👨‍🔬',
      category: 'Meio Ambiente',
      votes: 189,
      userVote: null,
      comments: 22,
      status: 'in-progress',
      priority: 'medium',
      createdAt: new Date('2024-01-08T09:15:00Z'),
      tags: ['Clima', 'História', 'Água', 'Sustentabilidade']
    },
    {
      id: '3',
      title: 'O Futuro das Criptomoedas no Sistema Financeiro',
      description: 'Análise sobre o papel futuro das criptomoedas e como elas podem transformar o sistema financeiro tradicional.',
      author: 'Ana Costa',
      authorAvatar: '👩‍💼',
      category: 'Economia',
      votes: 156,
      userVote: 'up',
      comments: 45,
      status: 'pending',
      priority: 'medium',
      createdAt: new Date('2024-01-05T16:20:00Z'),
      tags: ['Criptomoedas', 'Finanças', 'Futuro', 'Blockchain']
    },
    {
      id: '4',
      title: 'Impacto das Redes Sociais na Saúde Mental dos Jovens',
      description: 'Uma investigação sobre como as redes sociais afetam a saúde mental da juventude e comparações com estudos históricos.',
      author: 'Pedro Lima',
      authorAvatar: '👨‍⚕️',
      category: 'Saúde',
      votes: 134,
      userVote: null,
      comments: 18,
      status: 'rejected',
      priority: 'low',
      createdAt: new Date('2024-01-03T11:45:00Z'),
      tags: ['Saúde Mental', 'Redes Sociais', 'Juventude'],
      reasoning: 'Tema já abordado recentemente em análise similar'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />
      case 'in-progress': return <BarChart3 className="h-4 w-4 text-echo-cyan" />
      default: return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprovado'
      case 'rejected': return 'Rejeitado'
      case 'in-progress': return 'Em Produção'
      default: return 'Pendente'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      default: return 'bg-green-500'
    }
  }

  const handleVote = (suggestionId: string, voteType: 'up' | 'down') => {
    // Handle voting logic here
    console.log(`Voting ${voteType} on suggestion ${suggestionId}`)
  }

  const handleSubmitSuggestion = () => {
    if (newSuggestion.title && newSuggestion.description) {
      console.log('Submitting suggestion:', newSuggestion)
      setNewSuggestion({ title: '', description: '', category: '', tags: '' })
      setShowNewSuggestionForm(false)
    }
  }

  const filteredSuggestions = topicSuggestions.filter(suggestion => {
    if (filterStatus !== 'all' && suggestion.status !== filterStatus) {
      return false
    }
    return true
  })

  const sortedSuggestions = [...filteredSuggestions].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.votes - a.votes
      case 'trending':
        return b.comments - a.comments
      case 'recent':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  return (
    <Layout currentPage="participate">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-echo-cyan/10 to-echo-amber/10 py-12">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-echo-cyan/20 to-echo-amber/20 px-4 py-2 rounded-full">
                <Users className="h-5 w-5 text-echo-cyan" />
                <span className="text-sm font-medium">Comunidade Ativa</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold font-space-grotesk mb-4">
              Participe da Construção
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Sua voz importa! Sugira temas, vote em pautas e ajude a moldar
              o futuro do conteúdo inteligente
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-echo-cyan">{communityStats.totalSuggestions.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Sugestões Totais</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-echo-amber">{communityStats.activeVoters.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Votos Ativos</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-green-500">{communityStats.implementedSuggestions}</div>
                <div className="text-xs text-muted-foreground">Implementadas</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-500">{communityStats.averageResponseTime}</div>
                <div className="text-xs text-muted-foreground">Dias Resp. Média</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="py-6 border-b border-border">
        <div className="container px-4">
          <div className="flex justify-center">
            <div className="flex space-x-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'suggestions'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Lightbulb className="h-4 w-4 mr-2 inline" />
                Sugestões
              </button>
              <button
                onClick={() => setActiveTab('voting')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'voting'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <BarChart3 className="h-4 w-4 mr-2 inline" />
                Votação
              </button>
              <button
                onClick={() => setActiveTab('contribute')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'contribute'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Plus className="h-4 w-4 mr-2 inline" />
                Contribuir
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container px-4">
          {activeTab === 'suggestions' && (
            <div className="max-w-4xl mx-auto">
              {/* Filters and Controls */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex flex-wrap gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 rounded-md border border-border bg-background text-sm"
                  >
                    <option value="all">Todos os Status</option>
                    <option value="pending">Pendentes</option>
                    <option value="approved">Aprovados</option>
                    <option value="in-progress">Em Produção</option>
                    <option value="rejected">Rejeitados</option>
                  </select>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 rounded-md border border-border bg-background text-sm"
                  >
                    <option value="popular">Mais Populares</option>
                    <option value="recent">Mais Recentes</option>
                    <option value="trending">Em Alta</option>
                  </select>
                </div>

                <Button onClick={() => setShowNewSuggestionForm(true)} variant="gradient">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Sugestão
                </Button>
              </div>

              {/* Suggestions List */}
              <div className="space-y-6">
                {sortedSuggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{suggestion.authorAvatar}</div>
                          <div>
                            <div className="font-medium">{suggestion.author}</div>
                            <div className="text-xs text-muted-foreground">
                              {suggestion.createdAt.toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(suggestion.priority)}`} />
                          {getStatusIcon(suggestion.status)}
                          <Badge variant="outline" className="text-xs">
                            {getStatusLabel(suggestion.status)}
                          </Badge>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className="bg-echo-cyan/10 text-echo-cyan">
                            {suggestion.category}
                          </Badge>
                          <div className="flex space-x-1">
                            {suggestion.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold mb-2">{suggestion.title}</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          {suggestion.description}
                        </p>

                        {suggestion.reasoning && (
                          <div className="bg-muted/50 rounded-lg p-3 mb-4">
                            <div className="text-xs font-medium mb-1">Decisão da Equipe:</div>
                            <div className="text-xs text-muted-foreground">{suggestion.reasoning}</div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant={suggestion.userVote === 'up' ? 'default' : 'outline'}
                              onClick={() => handleVote(suggestion.id, 'up')}
                            >
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {suggestion.votes}
                            </Button>
                            <Button
                              size="sm"
                              variant={suggestion.userVote === 'down' ? 'destructive' : 'outline'}
                              onClick={() => handleVote(suggestion.id, 'down')}
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <MessageSquare className="h-3 w-3" />
                            <span>{suggestion.comments} comentários</span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button size="sm" variant="ghost">
                            <Flag className="h-3 w-3 mr-1" />
                            Reportar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'voting' && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold font-space-grotesk mb-4">
                  Votação da Comunidade
                </h2>
                <p className="text-muted-foreground">
                  Vote nas sugestões que considera mais importantes para o futuro da plataforma
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {sortedSuggestions.filter(s => s.status === 'pending').map((suggestion) => (
                  <Card key={suggestion.id} className="p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <Badge className="bg-echo-amber/10 text-echo-amber">
                        {suggestion.category}
                      </Badge>
                      <div className="text-right">
                        <div className="text-lg font-bold">{suggestion.votes}</div>
                        <div className="text-xs text-muted-foreground">votos</div>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold mb-2 line-clamp-2">{suggestion.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {suggestion.description}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant={suggestion.userVote === 'up' ? 'default' : 'outline'}
                          onClick={() => handleVote(suggestion.id, 'up')}
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          Apoiar
                        </Button>
                        <Button
                          size="sm"
                          variant={suggestion.userVote === 'down' ? 'destructive' : 'outline'}
                          onClick={() => handleVote(suggestion.id, 'down')}
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center text-xs text-muted-foreground">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {suggestion.comments}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'contribute' && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold font-space-grotesk mb-4">
                  Contribua com Suas Ideias
                </h2>
                <p className="text-muted-foreground">
                  Sua sugestão pode se tornar o próximo grande artigo da plataforma
                </p>
              </div>

              <Card className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Título da Sugestão *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Análise do impacto da IA na educação brasileira"
                      className="w-full p-3 rounded-md border border-border bg-background"
                      value={newSuggestion.title}
                      onChange={(e) => setNewSuggestion({
                        ...newSuggestion,
                        title: e.target.value
                      })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Descrição Detalhada *
                    </label>
                    <textarea
                      placeholder="Descreva sua ideia em detalhes, incluindo o que gostaria de ver abordado..."
                      className="w-full p-3 rounded-md border border-border bg-background resize-none"
                      rows={5}
                      value={newSuggestion.description}
                      onChange={(e) => setNewSuggestion({
                        ...newSuggestion,
                        description: e.target.value
                      })}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Categoria
                      </label>
                      <select
                        className="w-full p-3 rounded-md border border-border bg-background"
                        value={newSuggestion.category}
                        onChange={(e) => setNewSuggestion({
                          ...newSuggestion,
                          category: e.target.value
                        })}
                      >
                        <option value="">Selecione uma categoria</option>
                        <option value="Tecnologia">Tecnologia</option>
                        <option value="Política">Política</option>
                        <option value="Economia">Economia</option>
                        <option value="Meio Ambiente">Meio Ambiente</option>
                        <option value="Saúde">Saúde</option>
                        <option value="Educação">Educação</option>
                        <option value="Cultura">Cultura</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Tags (separadas por vírgula)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: IA, educação, brasil"
                        className="w-full p-3 rounded-md border border-border bg-background"
                        value={newSuggestion.tags}
                        onChange={(e) => setNewSuggestion({
                          ...newSuggestion,
                          tags: e.target.value
                        })}
                      />
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Lightbulb className="h-4 w-4 mr-2 text-echo-amber" />
                      Dicas para uma boa sugestão:
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Seja específico sobre o que quer ver abordado</li>
                      <li>• Explique por que o tema é relevante agora</li>
                      <li>• Sugira possíveis comparações históricas</li>
                      <li>• Indique fontes ou referências se tiver</li>
                    </ul>
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      className="flex-1"
                      variant="gradient"
                      onClick={handleSubmitSuggestion}
                      disabled={!newSuggestion.title || !newSuggestion.description}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Sugestão
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setNewSuggestion({ title: '', description: '', category: '', tags: '' })}
                    >
                      Limpar
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Contribution Guidelines */}
              <Card className="mt-8 p-6 bg-gradient-to-br from-echo-cyan/10 to-echo-amber/10">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-echo-cyan" />
                  Sistema de Recompensas
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Sugestão aprovada:</span>
                    <Badge className="bg-green-500 text-white">+50 pontos</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Sugestão implementada:</span>
                    <Badge className="bg-echo-cyan text-white">+200 pontos</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Destaque da semana:</span>
                    <Badge className="bg-echo-amber text-white">+500 pontos</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    * Pontos podem ser trocados por acesso Premium ou produtos exclusivos
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </section>
    </Layout>
  )
}