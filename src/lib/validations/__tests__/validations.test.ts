import {
  userRegistrationSchema,
  userLoginSchema,
  articleSchema,
  aiGenerationSchema,
  validateEmail,
  validatePassword,
  validateUrl,
  validateRateLimit,
  sanitizeHtml
} from '../index'

describe('User Validation', () => {
  describe('userRegistrationSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'MinhaSenh@123',
        confirmPassword: 'MinhaSenh@123'
      }

      const result = userRegistrationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid name formats', () => {
      const invalidData = {
        name: 'João123', // numbers not allowed
        email: 'joao@example.com',
        password: 'MinhaSenh@123',
        confirmPassword: 'MinhaSenh@123'
      }

      const result = userRegistrationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('apenas letras')
      }
    })

    it('should reject weak passwords', () => {
      const invalidData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'senha123', // missing uppercase and special chars
        confirmPassword: 'senha123'
      }

      const result = userRegistrationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject mismatched passwords', () => {
      const invalidData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'MinhaSenh@123',
        confirmPassword: 'OutraSenh@123'
      }

      const result = userRegistrationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('não coincidem')
      }
    })
  })

  describe('userLoginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'user@example.com',
        password: 'anypassword'
      }

      const result = userLoginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password'
      }

      const result = userLoginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})

describe('Content Validation', () => {
  describe('articleSchema', () => {
    it('should validate complete article data', () => {
      const validData = {
        title: 'Inteligência Artificial na Medicina Moderna',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20),
        summary: 'Uma análise sobre o uso de IA na medicina moderna e seus impactos.',
        category: 'Tecnologia',
        tags: ['IA', 'Medicina', 'Tecnologia'],
        sourceUrl: 'https://example.com/source',
        imageUrl: 'https://example.com/image.jpg'
      }

      const result = articleSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject article with short content', () => {
      const invalidData = {
        title: 'Título muito bom',
        content: 'Conteúdo curto', // too short
        summary: 'Resumo adequado para teste de validação completa',
        category: 'Tecnologia',
        tags: ['tag1']
      }

      const result = articleSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject article without tags', () => {
      const invalidData = {
        title: 'Título adequado para teste',
        content: 'Conteúdo longo o suficiente para passar na validação. '.repeat(10),
        summary: 'Resumo adequado para teste de validação completa',
        category: 'Tecnologia',
        tags: [] // empty tags
      }

      const result = articleSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('aiGenerationSchema', () => {
    it('should validate AI generation request', () => {
      const validData = {
        topic: 'Impactos da IA na educação',
        type: 'article' as const,
        style: 'neutral' as const,
        length: 'medium' as const,
        includeHistorical: true
      }

      const result = aiGenerationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid content type', () => {
      const invalidData = {
        topic: 'Tópico válido',
        type: 'invalid-type' as any
      }

      const result = aiGenerationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct emails', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('valid+email@test-domain.org')).toBe(true)
    })

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('user@')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('MinhaSenh@123')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should identify password weaknesses', () => {
      const result = validatePassword('senha123')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Deve conter uma letra maiúscula')
      expect(result.errors).toContain('Deve conter um caractere especial')
    })

    it('should reject short passwords', () => {
      const result = validatePassword('Abc@1')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Deve ter pelo menos 8 caracteres')
    })
  })

  describe('validateUrl', () => {
    it('should validate correct URLs', () => {
      expect(validateUrl('https://example.com')).toBe(true)
      expect(validateUrl('http://test.org/path')).toBe(true)
      expect(validateUrl('https://sub.domain.com/path?query=1')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(validateUrl('invalid-url')).toBe(false)
      expect(validateUrl('ftp://example.com')).toBe(true) // FTP is valid URL
      expect(validateUrl('')).toBe(false)
    })
  })

  describe('sanitizeHtml', () => {
    it('should remove dangerous scripts', () => {
      const dangerous = '<p>Safe content</p><script>alert(\"xss\")</script>'
      const sanitized = sanitizeHtml(dangerous)
      expect(sanitized).not.toContain('<script>')
      expect(sanitized).toContain('<p>Safe content</p>')
    })

    it('should remove iframe tags', () => {
      const dangerous = '<div>Content</div><iframe src=\"evil.com\"></iframe>'
      const sanitized = sanitizeHtml(dangerous)
      expect(sanitized).not.toContain('<iframe>')
      expect(sanitized).toContain('<div>Content</div>')
    })

    it('should remove javascript protocols', () => {
      const dangerous = '<a href=\"javascript:alert(1)\">Link</a>'
      const sanitized = sanitizeHtml(dangerous)
      expect(sanitized).not.toContain('javascript:')
    })
  })

  describe('validateRateLimit', () => {
    it('should allow requests within limits', () => {
      const result = validateRateLimit('premium', 'ai_generation', 10)
      expect(result.allowed).toBe(true)
      expect(result.limit).toBe(50)
      expect(result.remaining).toBe(40)
    })

    it('should reject requests over limit', () => {
      const result = validateRateLimit('free', 'ai_generation', 10)
      expect(result.allowed).toBe(false)
      expect(result.limit).toBe(5)
      expect(result.remaining).toBe(0)
    })

    it('should handle unlimited pro plans', () => {
      const result = validateRateLimit('pro', 'ai_generation', 1000)
      expect(result.allowed).toBe(true)
      expect(result.limit).toBe(-1)
      expect(result.remaining).toBe(-1)
    })
  })
})