'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3,
  Eye,
  Heart,
  Share2,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  FileText,
  Video,
  Settings,
  Plus,
  Filter,
  Download,
  Edit3,
  Trash2,
  MoreHorizontal,
  DollarSign,
  Target,
  Award
} from 'lucide-react'
import { formatNumber, formatRelativeTime } from '@/lib/utils'
import { sampleArticles } from '@/lib/sampleData'

// Mock data for creator analytics
const creatorStats = {
  totalViews: 2450000,
  totalLikes: 89500,
  totalShares: 12300,
  followers: 45600,
  articlesCount: 127,
  shortsCount: 89,
  monthlyEarnings: 3420,
  avgBiasScore: 0.18
}

const recentContent = sampleArticles.slice(0, 5).map(article => ({
  ...article,
  status: Math.random() > 0.5 ? 'published' : 'draft',
  earnings: Math.floor(Math.random() * 500) + 50
}))

const analytics = {
  viewsData: [
    { month: 'Jan', views: 180000 },
    { month: 'Fev', views: 220000 },
    { month: 'Mar', views: 195000 },
    { month: 'Abr', views: 280000 },
    { month: 'Mai', views: 310000 },
    { month: 'Jun', views: 245000 }
  ],
  topPerforming: [
    { title: 'IA Revoluciona Diagnósticos Médicos', views: 125000, engagement: 8.5 },
    { title: 'Eleições 2024: Análise Isenta', views: 98000, engagement: 12.3 },
    { title: 'Mudanças Climáticas: O Que os Dados Não Contam', views: 87000, engagement: 9.8 }
  ]
}

export default function CreatorPanelPage() {
  const [selectedTab, setSelectedTab] = useState('dashboard')
  const [filterStatus, setFilterStatus] = useState('all')

  const StatCard = ({ title, value, icon: Icon, change, description }: any) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change && (
            <p className={`text-xs ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change > 0 ? '+' : ''}{change}% vs mês anterior
            </p>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="h-12 w-12 rounded-full bg-echo-cyan/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-echo-cyan" />
        </div>
      </div>
    </Card>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-space-grotesk">Painel do Criador</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie seu conteúdo e acompanhe o desempenho das suas publicações
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar Dados
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Conteúdo
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Visualizações Totais"
              value={formatNumber(creatorStats.totalViews)}
              icon={Eye}
              change={12.5}
            />
            <StatCard
              title="Curtidas"
              value={formatNumber(creatorStats.totalLikes)}
              icon={Heart}
              change={8.2}
            />
            <StatCard
              title="Seguidores"
              value={formatNumber(creatorStats.followers)}
              icon={Users}
              change={5.7}
            />
            <StatCard
              title="Ganhos do Mês"
              value={`R$ ${formatNumber(creatorStats.monthlyEarnings)}`}
              icon={DollarSign}
              change={15.3}
            />
          </div>

          {/* Performance Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Conteúdo Publicado</CardTitle>
                <CardDescription>Resumo das suas publicações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-echo-cyan" />
                    <span className="text-sm">Artigos</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{creatorStats.articlesCount}</p>
                    <p className="text-xs text-muted-foreground">+12 este mês</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Video className="h-4 w-4 text-echo-amber" />
                    <span className="text-sm">Shorts</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{creatorStats.shortsCount}</p>
                    <p className="text-xs text-muted-foreground">+8 este mês</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Pontuação de Viés Média</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{creatorStats.avgBiasScore}</p>
                    <p className="text-xs text-green-500">Excelente</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Conteúdo Recente</CardTitle>
                <CardDescription>Suas últimas publicações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentContent.slice(0, 4).map((content) => (
                    <div key={content.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{content.title}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={content.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                            {content.status === 'published' ? 'Publicado' : 'Rascunho'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(content.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatNumber(content.viewCount)}</p>
                        <p className="text-xs text-muted-foreground">views</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Management Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                Todos
              </Button>
              <Button
                variant={filterStatus === 'published' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('published')}
              >
                Publicados
              </Button>
              <Button
                variant={filterStatus === 'draft' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('draft')}
              >
                Rascunhos
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Criar Novo
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {recentContent
              .filter(content => filterStatus === 'all' || content.status === filterStatus)
              .map((content) => (
                <Card key={content.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant={content.status === 'published' ? 'default' : 'secondary'}>
                          {content.status === 'published' ? 'Publicado' : 'Rascunho'}
                        </Badge>
                        <Badge variant="outline">{content.category}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(content.createdAt)}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2">{content.title}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                        {content.summary}
                      </p>
                      
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {formatNumber(content.viewCount)}
                        </span>
                        <span className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          {formatNumber(content.likes)}
                        </span>
                        <span className="flex items-center">
                          <Share2 className="h-4 w-4 mr-1" />
                          {formatNumber(content.shares)}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          R$ {content.earnings}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Performance Mensal</CardTitle>
                <CardDescription>Visualizações dos últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.viewsData.map((data, index) => (
                    <div key={data.month} className="flex items-center justify-between">
                      <span className="text-sm">{data.month}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div 
                            className="bg-echo-cyan h-2 rounded-full"
                            style={{ width: `${(data.views / 320000) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-16 text-right">
                          {formatNumber(data.views)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Top Conteúdos</CardTitle>
                <CardDescription>Melhor performance por engajamento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topPerforming.map((content, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-echo-cyan/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-echo-cyan">#{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2">{content.title}</p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                          <span>{formatNumber(content.views)} views</span>
                          <span>{content.engagement}% engajamento</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="p-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Métricas Detalhadas</CardTitle>
              <CardDescription>Estatísticas completas do seu conteúdo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-echo-cyan">{formatNumber(creatorStats.totalViews)}</div>
                  <div className="text-sm text-muted-foreground">Total de Visualizações</div>
                  <div className="text-xs text-green-500 mt-1">↗ +12.5% este mês</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-echo-amber">{(creatorStats.totalLikes / creatorStats.totalViews * 100).toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Taxa de Curtidas</div>
                  <div className="text-xs text-green-500 mt-1">↗ +2.3% este mês</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">R$ {formatNumber(creatorStats.monthlyEarnings * 12)}</div>
                  <div className="text-sm text-muted-foreground">Ganhos Anuais Projetados</div>
                  <div className="text-xs text-green-500 mt-1">↗ +18.7% este ano</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Perfil do Criador</CardTitle>
                <CardDescription>Informações públicas do seu perfil</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome de Exibição</label>
                  <input 
                    type="text" 
                    className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    defaultValue="Editor EchoNow"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Bio</label>
                  <textarea 
                    className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    rows={3}
                    defaultValue="Especialista em análises imparciais e conteúdo de qualidade."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Especialidades</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['Política', 'Economia', 'Tecnologia'].map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <Button className="w-full">Salvar Perfil</Button>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Preferências</CardTitle>
                <CardDescription>Configure suas preferências de trabalho</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificações de Performance</p>
                    <p className="text-sm text-muted-foreground">Receber alertas sobre métricas</p>
                  </div>
                  <div className="w-10 h-6 bg-echo-cyan rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sugestões de IA</p>
                    <p className="text-sm text-muted-foreground">Receber sugestões automáticas</p>
                  </div>
                  <div className="w-10 h-6 bg-muted rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Monetização Automática</p>
                    <p className="text-sm text-muted-foreground">Ativar ads em conteúdos</p>
                  </div>
                  <div className="w-10 h-6 bg-echo-cyan rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Objetivo Mensal de Artigos</label>
                  <input 
                    type="number" 
                    className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    defaultValue="15"
                  />
                </div>

                <Button className="w-full">Salvar Preferências</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}