'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import SubscriptionPlanCard from '@/components/ui/SubscriptionPlanCard'
import { 
  Sparkles, 
  Crown, 
  Check, 
  AlertCircle,
  CreditCard,
  Settings,
  ExternalLink,
  Zap,
  Brain,
  Video,
  Download,
  Shield,
  Users,
  Headphones
} from 'lucide-react'
import { SUBSCRIPTION_PLANS } from '@/lib/stripe/config'

export default function PremiumPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const canceled = searchParams.get('canceled')
  
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [checkoutLoading, setCheckoutLoading] = useState('')

  useEffect(() => {
    if (session) {
      fetchSubscriptionDetails()
    } else {
      setIsLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (canceled) {
      setError('Checkout cancelado. Você pode tentar novamente a qualquer momento.')
    }
  }, [canceled])

  const fetchSubscriptionDetails = async () => {
    try {
      const response = await fetch('/api/subscriptions/manage')
      const data = await response.json()
      
      if (response.ok) {
        setCurrentSubscription(data)
      } else {
        setError('Erro ao carregar detalhes da assinatura')
      }
    } catch (error) {
      setError('Erro de conexão')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectPlan = async (planId: string) => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/premium')
      return
    }

    if (planId === 'free') {
      handleManageBilling()
      return
    }

    setCheckoutLoading(planId)
    setError('')

    try {
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Erro ao criar sessão de checkout')
      }
    } catch (error) {
      setError('Erro ao processar pagamento')
    } finally {
      setCheckoutLoading('')
    }
  }

  const handleManageBilling = async () => {
    if (!currentSubscription?.hasStripeCustomer) {
      setError('Nenhuma conta de cobrança encontrada')
      return
    }

    try {
      const response = await fetch('/api/subscriptions/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_portal_session' })
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        setError('Erro ao acessar portal de cobrança')
      }
    } catch (error) {
      setError('Erro ao processar solicitação')
    }
  }

  const features = [
    {
      icon: Brain,
      title: 'IA Avançada',
      description: 'Geração inteligente de conteúdo com contexto histórico'
    },
    {
      icon: Video,
      title: 'Shorts Automáticos',
      description: 'Transforme artigos em vídeos curtos para redes sociais'
    },
    {
      icon: Shield,
      title: 'Filtro de Viés',
      description: 'Detecção automática de tendências e inclinações'
    },
    {
      icon: Download,
      title: 'Exports Diversos',
      description: 'PDF, Kindle, áudio e vídeo em alta qualidade'
    },
    {
      icon: Sparkles,
      title: 'Prompts Personalizados',
      description: 'Controle total sobre a geração de conteúdo'
    },
    {
      icon: Headphones,
      title: 'Suporte Premium',
      description: 'Atendimento prioritário e consultoria especializada'
    }
  ]

  return (
    <Layout currentPage="premium">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-echo-cyan/10 via-echo-amber/10 to-purple-500/10 py-16">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-echo-cyan to-echo-amber px-4 py-2 rounded-full text-white">
                <Crown className="h-5 w-5" />
                <span className="font-medium">Premium Features</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold font-space-grotesk mb-6">
              Potencialize Sua
              <br />
              <span className="echo-gradient-text">Criação de Conteúdo</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Desbloqueie todo o potencial da IA para criar conteúdo excepcional,
              análises profundas e insights únicos que fazem a diferença.
            </p>

            {session && currentSubscription && currentSubscription.subscription !== 'free' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <div className="flex items-center space-x-2 text-green-700">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">
                    Você está no plano {currentSubscription.subscription.charAt(0).toUpperCase() + currentSubscription.subscription.slice(1)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="container px-4 mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Current Subscription Status */}
      {session && currentSubscription && !isLoading && (
        <section className="py-8">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Sua Assinatura</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Plano Atual</span>
                      <p className="font-semibold capitalize">{currentSubscription.subscription}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Status</span>
                      <p className="font-semibold">
                        <Badge variant={currentSubscription.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                          {currentSubscription.subscriptionStatus === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Ações</span>
                      <div className="space-x-2">
                        {currentSubscription.hasStripeCustomer && (
                          <Button size="sm" onClick={handleManageBilling}>
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Gerenciar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Subscription Plans */}
      <section className="py-16">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-space-grotesk mb-4">
                Escolha o Plano Ideal
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                De recursos básicos a IA ilimitada, temos o plano perfeito para suas necessidades.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              {(['free', 'premium', 'pro'] as const).map((planId) => (
                <SubscriptionPlanCard
                  key={planId}
                  planId={planId}
                  currentPlan={currentSubscription?.subscription}
                  onSelectPlan={handleSelectPlan}
                  isLoading={checkoutLoading === planId}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-space-grotesk mb-4">
                Recursos Poderosos
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Todas as ferramentas que você precisa para criar conteúdo excepcional.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-echo-cyan/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-6 w-6 text-echo-cyan" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}