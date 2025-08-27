import { z } from 'zod'

// User validation schemas
export const userRegistrationSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  
  email: z.string()
    .email('Email inválido')
    .max(254, 'Email muito longo'),
  
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(128, 'Senha muito longa')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/\d/, 'Senha deve conter pelo menos um número')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Senha deve conter pelo menos um caractere especial'),
  
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
})

export const userLoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
})

export const userProfileUpdateSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .optional(),
  
  avatar: z.string().url('URL de avatar inválida').optional(),
  
  bio: z.string()
    .max(500, 'Bio deve ter no máximo 500 caracteres')
    .optional()
})

// Content validation schemas
export const articleSchema = z.object({
  title: z.string()
    .min(10, 'Título deve ter pelo menos 10 caracteres')
    .max(200, 'Título deve ter no máximo 200 caracteres'),
  
  content: z.string()
    .min(100, 'Conteúdo deve ter pelo menos 100 caracteres')
    .max(10000, 'Conteúdo deve ter no máximo 10.000 caracteres'),
  
  summary: z.string()
    .min(50, 'Resumo deve ter pelo menos 50 caracteres')
    .max(500, 'Resumo deve ter no máximo 500 caracteres'),
  
  category: z.string().min(1, 'Categoria é obrigatória'),
  
  tags: z.array(z.string())
    .min(1, 'Pelo menos uma tag é obrigatória')
    .max(10, 'Máximo 10 tags permitidas'),
  
  sourceUrl: z.string().url('URL inválida').optional(),
  
  imageUrl: z.string().url('URL de imagem inválida').optional(),
  
  isExclusive: z.boolean().default(false)
})

export const shortSchema = z.object({
  title: z.string()
    .min(5, 'Título deve ter pelo menos 5 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  
  description: z.string()
    .min(20, 'Descrição deve ter pelo menos 20 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  
  duration: z.number()
    .min(15, 'Duração mínima de 15 segundos')
    .max(180, 'Duração máxima de 3 minutos'),
  
  category: z.string().min(1, 'Categoria é obrigatória'),
  
  tags: z.array(z.string()).max(5, 'Máximo 5 tags permitidas'),
  
  articleId: z.string().min(1, 'ID do artigo é obrigatório')
})

// AI generation validation
export const aiGenerationSchema = z.object({
  topic: z.string()
    .min(5, 'Tópico deve ter pelo menos 5 caracteres')
    .max(500, 'Tópico deve ter no máximo 500 caracteres'),
  
  sourceUrl: z.string().url('URL inválida').optional(),
  
  type: z.enum(['article', 'short', 'analysis'], {
    required_error: 'Tipo de conteúdo é obrigatório'
  }),
  
  style: z.enum(['neutral', 'analytical', 'comprehensive']).default('neutral'),
  
  length: z.enum(['short', 'medium', 'long']).default('medium'),
  
  includeHistorical: z.boolean().default(false),
  
  targetAudience: z.enum(['general', 'expert', 'young']).default('general'),
  
  customPrompt: z.string().max(1000, 'Prompt customizado muito longo').optional()
})

// Community validation schemas
export const topicSuggestionSchema = z.object({
  title: z.string()
    .min(10, 'Título deve ter pelo menos 10 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  
  description: z.string()
    .min(20, 'Descrição deve ter pelo menos 20 caracteres')
    .max(1000, 'Descrição deve ter no máximo 1.000 caracteres')
})

export const voteSchema = z.object({
  suggestionId: z.string().min(1, 'ID da sugestão é obrigatório'),
  type: z.enum(['up', 'down'], {
    required_error: 'Tipo de voto é obrigatório'
  })
})

export const reactionSchema = z.object({
  type: z.enum(['like', 'share', 'save', 'bias-report'], {
    required_error: 'Tipo de reação é obrigatório'
  }),
  contentType: z.enum(['article', 'short'], {
    required_error: 'Tipo de conteúdo é obrigatório'
  }),
  contentId: z.string().min(1, 'ID do conteúdo é obrigatório')
})

// Subscription validation
export const subscriptionSchema = z.object({
  planId: z.enum(['premium', 'pro'], {
    required_error: 'Plano é obrigatório'
  })
})

// Comment validation
export const commentSchema = z.object({
  content: z.string()
    .min(5, 'Comentário deve ter pelo menos 5 caracteres')
    .max(1000, 'Comentário deve ter no máximo 1.000 caracteres'),
  
  contentId: z.string().min(1, 'ID do conteúdo é obrigatório'),
  
  contentType: z.enum(['article', 'short'], {
    required_error: 'Tipo de conteúdo é obrigatório'
  }),
  
  parentId: z.string().optional() // For nested comments
})

// Search validation
export const searchSchema = z.object({
  query: z.string()
    .min(1, 'Consulta de busca é obrigatória')
    .max(200, 'Consulta muito longa'),
  
  category: z.string().optional(),
  
  tags: z.array(z.string()).optional(),
  
  dateFrom: z.string().datetime().optional(),
  
  dateTo: z.string().datetime().optional(),
  
  sortBy: z.enum(['relevance', 'date', 'popularity', 'bias-score']).default('relevance'),
  
  limit: z.number().min(1).max(100).default(20),
  
  offset: z.number().min(0).default(0)
})

// Newsletter subscription
export const newsletterSchema = z.object({
  email: z.string().email('Email inválido'),
  frequency: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
  categories: z.array(z.string()).optional()
})

// Contact form validation
export const contactSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  
  email: z.string().email('Email inválido'),
  
  subject: z.string()
    .min(5, 'Assunto deve ter pelo menos 5 caracteres')
    .max(100, 'Assunto deve ter no máximo 100 caracteres'),
  
  message: z.string()
    .min(20, 'Mensagem deve ter pelo menos 20 caracteres')
    .max(2000, 'Mensagem deve ter no máximo 2.000 caracteres'),
  
  type: z.enum(['support', 'feedback', 'bug', 'feature', 'press', 'partnership']).default('support')
})

// Export types for TypeScript
export type UserRegistration = z.infer<typeof userRegistrationSchema>
export type UserLogin = z.infer<typeof userLoginSchema>
export type UserProfileUpdate = z.infer<typeof userProfileUpdateSchema>
export type Article = z.infer<typeof articleSchema>
export type Short = z.infer<typeof shortSchema>
export type AIGeneration = z.infer<typeof aiGenerationSchema>
export type TopicSuggestion = z.infer<typeof topicSuggestionSchema>
export type Vote = z.infer<typeof voteSchema>
export type Reaction = z.infer<typeof reactionSchema>
export type Subscription = z.infer<typeof subscriptionSchema>
export type Comment = z.infer<typeof commentSchema>
export type Search = z.infer<typeof searchSchema>
export type Newsletter = z.infer<typeof newsletterSchema>
export type Contact = z.infer<typeof contactSchema>

// Validation helper functions
export function validateEmail(email: string): boolean {
  return z.string().email().safeParse(email).success
}

export function validatePassword(password: string): { 
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) errors.push('Deve ter pelo menos 8 caracteres')
  if (!/[A-Z]/.test(password)) errors.push('Deve conter uma letra maiúscula')
  if (!/[a-z]/.test(password)) errors.push('Deve conter uma letra minúscula')
  if (!/\d/.test(password)) errors.push('Deve conter um número')
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Deve conter um caractere especial')
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function sanitizeHtml(content: string): string {
  // Basic HTML sanitization (in production, use a proper library like DOMPurify)
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Rate limiting validation
export function validateRateLimit(
  userLevel: 'free' | 'premium' | 'pro',
  action: 'ai_generation' | 'content_creation' | 'api_request',
  currentUsage: number
): { allowed: boolean; limit: number; remaining: number } {
  const limits = {
    free: { ai_generation: 5, content_creation: 10, api_request: 100 },
    premium: { ai_generation: 50, content_creation: 100, api_request: 1000 },
    pro: { ai_generation: -1, content_creation: -1, api_request: 5000 }
  }
  
  const limit = limits[userLevel][action]
  const remaining = limit === -1 ? -1 : Math.max(0, limit - currentUsage)
  const allowed = limit === -1 || currentUsage < limit
  
  return { allowed, limit, remaining }
}