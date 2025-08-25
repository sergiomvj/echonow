'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight, Sparkles, Crown } from 'lucide-react'

export default function SubscriptionSuccessPage() {
  const { data: session, update } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  
  const [isLoading, setIsLoading] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (sessionId && session) {
      // Refresh session to get updated subscription
      update().then(() => {
        fetchSubscriptionDetails()
      })
    } else if (!sessionId) {
      setError('ID da sessão não encontrado')
      setIsLoading(false)
    }
  }, [sessionId, session, update])

  const fetchSubscriptionDetails = async () => {
    try {
      const response = await fetch('/api/subscriptions/manage')
      const data = await response.json()
      
      if (response.ok) {
        setSubscription(data)
      } else {
        setError('Erro ao carregar detalhes da assinatura')
      }
    } catch (error) {
      setError('Erro de conexão')
    } finally {
      setIsLoading(false)
    }
  }

  const getSubscriptionIcon = (plan: string) => {
    switch (plan) {
      case 'premium':
        return <Sparkles className="h-8 w-8 text-echo-cyan" />
      case 'pro':
        return <Crown className="h-8 w-8 text-echo-amber" />
      default:
        return <CheckCircle className="h-8 w-8 text-green-500" />
    }
  }

  const getSubscriptionTitle = (plan: string) => {
    switch (plan) {
      case 'premium':
        return 'Bem-vindo ao EchoNow Premium!'
      case 'pro':
        return 'Bem-vindo ao EchoNow Pro!'
      default:
        return 'Assinatura ativada!'
    }
  }

  const getNextSteps = (plan: string) => {
    const commonSteps = [
      {
        title: 'Explore o Virtual Editor',
        description: 'Crie conteúdo com nossa IA avançada',
        url: '/editor'
      },
      {
        title: 'Acesse recursos Premium',
        description: 'Filtros avançados e análises detalhadas',
        url: '/explore'
      }
    ]

    if (plan === 'pro') {
      return [
        {
          title: 'Acesse o Painel do Criador',
          description: 'Gerencie seu conteúdo e veja analytics',
          url: '/creator'
        },
        ...commonSteps,
        {
          title: 'Configure prompts personalizados',
          description: 'Crie templates de IA personalizados',
          url: '/premium/prompts'
        }
      ]
    }

    return commonSteps
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-echo-cyan mx-auto"></div>
          <p className="text-muted-foreground">Processando sua assinatura...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <div className="text-red-500 mb-4">
              <CheckCircle className="h-12 w-12 mx-auto" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Erro</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.push('/premium')}>
              Voltar para Premium
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentPlan = session?.user?.subscription || 'free'
  const nextSteps = getNextSteps(currentPlan)

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            {getSubscriptionIcon(currentPlan)}
          </div>
          
          <h1 className="text-4xl font-bold font-space-grotesk mb-4">
            {getSubscriptionTitle(currentPlan)}
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sua assinatura foi ativada com sucesso. Agora você tem acesso a todos os recursos do plano {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}.
          </p>
        </div>

        {/* Subscription Details */}
        {subscription && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Detalhes da Assinatura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Plano</span>
                  <p className="font-semibold capitalize">{subscription.subscription}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Status</span>
                  <p className="font-semibold">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Ativo
                    </span>
                  </p>
                </div>
                {subscription.subscriptionDetails?.currentPeriodEnd && (
                  <div className="md:col-span-2">
                    <span className="text-sm text-muted-foreground">Próxima cobrança</span>
                    <p className="font-semibold">
                      {new Date(subscription.subscriptionDetails.currentPeriodEnd).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Próximos passos</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {nextSteps.map((step, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {step.description}
                      </p>
                      <Link href={step.url}>
                        <Button variant="outline" size="sm">
                          Começar
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="space-x-4">
            <Button size="lg" onClick={() => router.push('/')}>
              Ir para Home
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push('/premium')}>
              Gerenciar Assinatura
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Dúvidas? Entre em contato com nosso{' '}
            <Link href="/support" className="text-echo-cyan hover:underline">
              suporte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}