import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Agora mesmo'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}min atrás`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}h atrás`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}d atrás`
  } else {
    return formatDate(date)
  }
}

export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.split(' ').length
  return Math.ceil(words / wordsPerMinute)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

export function getBiasColor(score: number): string {
  if (score < 0.3) return 'text-green-500'
  if (score < 0.6) return 'text-yellow-500'
  return 'text-red-500'
}

export function getBiasLabel(score: number): string {
  if (score < 0.3) return 'Neutro'
  if (score < 0.6) return 'Moderado'
  return 'Alto Viés'
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function getSubscriptionFeatures(plan: 'free' | 'premium' | 'pro'): string[] {
  const features = {
    free: [
      'Acesso a artigos gerados',
      'Shorts e vídeos',
      'Filtros básicos'
    ],
    premium: [
      'Todos os recursos gratuitos',
      'Criação de conteúdos via IA (limitado)',
      'Filtros interativos',
      'Envio para Kindle',
      'Análises semanais exclusivas',
      'Download de vídeos e PDFs'
    ],
    pro: [
      'Todos os recursos Premium',
      'Criação ilimitada via IA',
      'Prompt avançado customizado',
      'Acesso prioritário a novos recursos',
      'Suporte premium'
    ]
  }
  return features[plan]
}