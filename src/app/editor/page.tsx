'use client'

import { useState } from 'react'
import Layout from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Brain,
  Wand2,
  FileText,
  Video,
  BarChart3,
  Settings,
  Zap,
  Clock,
  Download,
  Share2,
  Copy,
  RefreshCw,
  Sparkles,
  Globe,
  Eye,
  Crown,
  History
} from 'lucide-react'

interface GenerationRequest {
  topic: string
  type: 'article' | 'short' | 'analysis'
  style: 'neutral' | 'analytical' | 'storytelling'
  length: 'short' | 'medium' | 'long'
  includeHistorical: boolean
  customPrompt?: string
}

export default function EditorPage() {
  const [currentRequest, setCurrentRequest] = useState<GenerationRequest>({
    topic: '',
    type: 'article',
    style: 'neutral',
    length: 'medium',
    includeHistorical: false,
    customPrompt: ''
  })
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const contentTypes = [
    { 
      id: 'article', 
      label: 'Artigo Completo', 
      icon: FileText, 
      description: 'Análise aprofundada e contextualizada',
      duration: '3-5 min'
    },
    { 
      id: 'short', 
      label: 'Short/Reel', 
      icon: Video, 
      description: 'Conteúdo rápido para redes sociais',
      duration: '30-60s'
    },
    { 
      id: 'analysis', 
      label: 'Análise Comparativa', 
      icon: BarChart3, 
      description: 'Comparação com eventos históricos',
      duration: '5-8 min'
    }
  ]

  const styleOptions = [
    { id: 'neutral', label: 'Neutro', description: 'Factual e imparcial' },
    { id: 'analytical', label: 'Analítico', description: 'Dados e estatísticas' },
    { id: 'storytelling', label: 'Narrativo', description: 'Envolvente e acessível' }
  ]

  const lengthOptions = [
    { id: 'short', label: 'Curto', words: '300-500 palavras', time: '2-3 min' },
    { id: 'medium', label: 'Médio', words: '800-1200 palavras', time: '5-7 min' },
    { id: 'long', label: 'Longo', words: '1500-2500 palavras', time: '8-12 min' }
  ]

  const recentTopics = [
    'Inteligência Artificial na Medicina',
    'Crise Energética Global',
    'Mudanças Climáticas e Economia',
    'Futuro do Trabalho Remoto',
    'Revolução das Criptomoedas'
  ]

  const handleGenerate = async () => {
    if (!currentRequest.topic.trim()) return
    
    setIsGenerating(true)
    
    // Simulate AI generation
    setTimeout(() => {
      const sampleContent = `# ${currentRequest.topic}

## Introdução

Este é um exemplo de conteúdo gerado pela IA do EchoNow, analisando o tema "${currentRequest.topic}" de forma objetiva e contextualizada.

## Análise Principal

A inteligência artificial revoluciona constantemente nossa compreensão sobre diversos temas. No caso específico de ${currentRequest.topic.toLowerCase()}, observamos tendências significativas que merecem análise detalhada.

### Pontos-chave:

1. **Contexto Histórico**: Eventos similares no passado mostram padrões interessantes
2. **Impacto Atual**: As implicações para o presente são multifacetadas
3. **Projeções Futuras**: Cenários possíveis baseados em dados disponíveis

## Comparação Histórica

${currentRequest.includeHistorical ? `
### Eventos Relacionados do Passado:
- **1973**: Crise do Petróleo - Paralelos econômicos
- **1995**: Início da Internet Comercial - Transformação tecnológica
- **2008**: Crise Financeira Global - Impactos sistêmicos
` : ''}

## Conclusão

A análise de ${currentRequest.topic.toLowerCase()} revela complexidades que transcendem visões simplistas, oferecendo perspectivas balanceadas para compreensão mais profunda do tema.

---
*Conteúdo gerado por EchoNow AI em ${new Date().toLocaleDateString('pt-BR')}*
*Nível de viés detectado: Baixo (15%)*`

      setGeneratedContent(sampleContent)
      setIsGenerating(false)
    }, 3000)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent)
  }

  return (
    <Layout currentPage="editor">
      <div className="container px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-echo-cyan/10 to-echo-amber/10 px-4 py-2 rounded-full">
                <Brain className="h-5 w-5 text-echo-cyan" />
                <span className="text-sm font-medium">Editor Virtual IA</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold font-space-grotesk mb-4">
              Crie Conteúdo Inteligente
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Use nossa IA para gerar artigos, análises e conteúdo para redes sociais 
              com contexto histórico e visão plural
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Configuration Panel */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Configuração
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Topic Input */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tópico ou Link da Notícia
                    </label>
                    <textarea
                      placeholder="Digite o tema que deseja explorar ou cole o link de uma notícia..."
                      className="w-full p-3 rounded-md border border-border bg-background resize-none"
                      rows={3}
                      value={currentRequest.topic}
                      onChange={(e) => setCurrentRequest({
                        ...currentRequest,
                        topic: e.target.value
                      })}
                    />
                  </div>

                  {/* Recent Topics */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tópicos Recentes
                    </label>
                    <div className="space-y-1">
                      {recentTopics.map((topic, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentRequest({
                            ...currentRequest,
                            topic
                          })}
                          className="w-full text-left text-sm p-2 rounded hover:bg-muted transition-colors"
                        >
                          <Clock className="h-3 w-3 inline mr-2" />
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content Type */}
                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Tipo de Conteúdo
                    </label>
                    <div className="space-y-2">
                      {contentTypes.map((type) => {
                        const Icon = type.icon
                        return (
                          <button
                            key={type.id}
                            onClick={() => setCurrentRequest({
                              ...currentRequest,
                              type: type.id as any
                            })}
                            className={`w-full p-3 rounded-md border text-left transition-colors ${
                              currentRequest.type === type.id
                                ? 'border-echo-cyan bg-echo-cyan/10'
                                : 'border-border hover:bg-muted'
                            }`}
                          >
                            <div className="flex items-start">
                              <Icon className="h-5 w-5 mt-0.5 mr-3 text-echo-cyan" />
                              <div>
                                <div className="font-medium text-sm">{type.label}</div>
                                <div className="text-xs text-muted-foreground">{type.description}</div>
                                <div className="text-xs text-echo-cyan mt-1">{type.duration}</div>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Style */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Estilo de Escrita
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {styleOptions.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setCurrentRequest({
                            ...currentRequest,
                            style: style.id as any
                          })}
                          className={`p-2 rounded text-left text-sm transition-colors ${
                            currentRequest.style === style.id
                              ? 'bg-echo-cyan/10 border border-echo-cyan'
                              : 'border border-border hover:bg-muted'
                          }`}
                        >
                          <div className="font-medium">{style.label}</div>
                          <div className="text-xs text-muted-foreground">{style.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Length */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tamanho do Conteúdo
                    </label>
                    <div className="space-y-2">
                      {lengthOptions.map((length) => (
                        <button
                          key={length.id}
                          onClick={() => setCurrentRequest({
                            ...currentRequest,
                            length: length.id as any
                          })}
                          className={`w-full p-2 rounded text-left text-sm transition-colors ${
                            currentRequest.length === length.id
                              ? 'bg-echo-amber/10 border border-echo-amber'
                              : 'border border-border hover:bg-muted'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{length.label}</span>
                            <span className="text-xs text-muted-foreground">{length.time}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">{length.words}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Historical Comparison */}
                  <div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentRequest.includeHistorical}
                        onChange={(e) => setCurrentRequest({
                          ...currentRequest,
                          includeHistorical: e.target.checked
                        })}
                        className="rounded"
                      />
                      <span className="text-sm font-medium">Incluir Comparação Histórica</span>
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Adiciona contexto histórico e eventos similares do passado
                    </p>
                  </div>

                  {/* Advanced Options */}
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="w-full"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Opções Avançadas
                      <Crown className="h-3 w-3 ml-2" />
                    </Button>
                    
                    {showAdvanced && (
                      <div className="mt-4 p-3 border border-border rounded-md bg-muted/30">
                        <label className="block text-sm font-medium mb-2">
                          Prompt Personalizado (Premium)
                        </label>
                        <textarea
                          placeholder="Ex: 'Crie um vídeo sobre a crise de energia no Chile comparando com o caso do Texas'"
                          className="w-full p-2 rounded text-sm border border-border bg-background"
                          rows={3}
                          value={currentRequest.customPrompt}
                          onChange={(e) => setCurrentRequest({
                            ...currentRequest,
                            customPrompt: e.target.value
                          })}
                        />
                        <div className="flex items-center mt-2">
                          <Crown className="h-3 w-3 text-echo-amber mr-1" />
                          <span className="text-xs text-muted-foreground">Recurso Premium</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerate}
                    disabled={!currentRequest.topic.trim() || isGenerating}
                    className="w-full h-12"
                    variant="gradient"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Gerar Conteúdo
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Content Display */}
            <div className="lg:col-span-2 space-y-6">
              {generatedContent ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-center">
                        <Zap className="h-5 w-5 mr-2 text-echo-cyan" />
                        Conteúdo Gerado
                      </CardTitle>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={copyToClipboard}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Baixar
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="h-4 w-4 mr-2" />
                          Compartilhar
                        </Button>
                      </div>
                    </div>
                    <div className="flex space-x-4 text-sm text-muted-foreground">
                      <span>Tipo: {contentTypes.find(t => t.id === currentRequest.type)?.label}</span>
                      <span>Estilo: {styleOptions.find(s => s.id === currentRequest.style)?.label}</span>
                      <Badge variant="success" className="text-xs">
                        Viés: Baixo (15%)
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {generatedContent}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-96 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Brain className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Pronto para criar</h3>
                    <p className="text-sm">
                      Configure as opções ao lado e clique em "Gerar Conteúdo" 
                      para começar
                    </p>
                  </div>
                </Card>
              )}

              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-echo-amber" />
                    Dicas para Melhores Resultados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-echo-cyan rounded-full mt-2" />
                      <div>
                        <strong>Seja específico:</strong> Quanto mais detalhado o tópico, 
                        melhor será a análise gerada
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-echo-amber rounded-full mt-2" />
                      <div>
                        <strong>Use links:</strong> Cole links de notícias para análises 
                        mais contextualizadas
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      <div>
                        <strong>Comparação histórica:</strong> Ative esta opção para 
                        insights mais profundos
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                      <div>
                        <strong>Prompts personalizados:</strong> Use o Premium para 
                        controle total sobre o resultado
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}