'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Star, Crown, Zap } from 'lucide-react'
import { SUBSCRIPTION_PLANS, formatPrice } from '@/lib/stripe/config'

interface PlanCardProps {
  planId: 'free' | 'premium' | 'pro'
  currentPlan?: string
  onSelectPlan: (planId: string) => void
  isLoading?: boolean
}

const planIcons = {
  free: <Star className="h-6 w-6" />,
  premium: <Zap className="h-6 w-6" />,
  pro: <Crown className="h-6 w-6" />
}

const planColors = {
  free: 'border-gray-200',
  premium: 'border-echo-cyan ring-2 ring-echo-cyan/20',
  pro: 'border-echo-amber ring-2 ring-echo-amber/20'
}

export default function SubscriptionPlanCard({ 
  planId, 
  currentPlan, 
  onSelectPlan, 
  isLoading = false 
}: PlanCardProps) {
  const { data: session } = useSession()
  const plan = SUBSCRIPTION_PLANS[planId]
  const isCurrentPlan = currentPlan === planId
  const isFreePlan = planId === 'free'
  const isPremiumPlan = planId === 'premium'
  const isProPlan = planId === 'pro'

  const handleSelectPlan = () => {
    if (!isCurrentPlan && !isLoading) {
      onSelectPlan(planId)
    }
  }

  return (
    <Card className={`relative h-full transition-all duration-200 hover:shadow-lg ${planColors[planId]}`}>
      {isPremiumPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-echo-cyan text-white">Mais Popular</Badge>
        </div>
      )}
      
      {isProPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-echo-amber text-white">Criador</Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4 ${
          isFreePlan ? 'bg-gray-100 text-gray-600' :
          isPremiumPlan ? 'bg-echo-cyan/10 text-echo-cyan' :
          'bg-echo-amber/10 text-echo-amber'
        }`}>
          {planIcons[planId]}
        </div>
        
        <CardTitle className="text-2xl font-bold font-space-grotesk">
          {plan.name}
        </CardTitle>
        
        <CardDescription className="text-muted-foreground">
          {plan.description}
        </CardDescription>
        
        <div className="mt-4">
          {isFreePlan ? (
            <div className="text-3xl font-bold">Grátis</div>
          ) : (
            <div className="space-y-1">
              <div className="text-3xl font-bold">
                {formatPrice(plan.price)}
              </div>
              <div className="text-sm text-muted-foreground">por mês</div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Features List */}
        <div className="space-y-3">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3">
              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {/* Usage Limits */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Limites de uso:</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div>
              Artigos: {plan.limits.articlesPerDay === -1 ? 'Ilimitado' : `${plan.limits.articlesPerDay}/dia`}
            </div>
            <div>
              IA: {plan.limits.aiGenerationsPerMonth === -1 ? 'Ilimitado' : `${plan.limits.aiGenerationsPerMonth}/mês`}
            </div>
            <div>
              Shorts: {plan.limits.shortsPerDay === -1 ? 'Ilimitado' : `${plan.limits.shortsPerDay}/dia`}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          {isCurrentPlan ? (
            <Button variant="outline" className="w-full" disabled>
              Plano Atual
            </Button>
          ) : (
            <Button 
              className={`w-full ${
                isPremiumPlan ? 'bg-echo-cyan hover:bg-echo-cyan/90' :
                isProPlan ? 'bg-echo-amber hover:bg-echo-amber/90' :
                ''
              }`}
              onClick={handleSelectPlan}
              disabled={isLoading}
            >
              {isLoading ? 'Processando...' : 
               isFreePlan ? 'Downgrade para Free' : 
               `Upgrade para ${plan.name}`}
            </Button>
          )}
        </div>

        {/* Additional Info */}
        {!isFreePlan && (
          <div className="text-xs text-muted-foreground text-center">
            • Cancele a qualquer momento<br />
            • Suporte 24/7<br />
            • Garantia de 30 dias
          </div>
        )}
      </CardContent>
    </Card>
  )
}