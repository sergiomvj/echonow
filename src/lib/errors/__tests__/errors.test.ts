import {
  APIError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  SubscriptionError,
  DatabaseError,
  ExternalServiceError,
  handleAPIError,
  ClientAPIError,
  withErrorHandling,
  withRetry,
  sanitizeErrorDetails,
  ErrorConfig
} from '../index'
import { ZodError } from 'zod'

describe('Custom Error Classes', () => {
  describe('APIError', () => {
    it('should create error with correct properties', () => {
      const error = new APIError('Test message', 500, 'TEST_CODE', { detail: 'test' })
      
      expect(error.message).toBe('Test message')
      expect(error.statusCode).toBe(500)
      expect(error.code).toBe('TEST_CODE')
      expect(error.details).toEqual({ detail: 'test' })
      expect(error.name).toBe('APIError')
    })

    it('should use default values when not provided', () => {
      const error = new APIError('Test message')
      
      expect(error.statusCode).toBe(500)
      expect(error.code).toBe('INTERNAL_ERROR')
      expect(error.details).toBeUndefined()
    })
  })

  describe('ValidationError', () => {
    it('should create validation error with 400 status', () => {
      const error = new ValidationError('Validation failed', { field: 'email' })
      
      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.details).toEqual({ field: 'email' })
    })
  })

  describe('AuthenticationError', () => {
    it('should create authentication error with 401 status', () => {
      const error = new AuthenticationError()
      
      expect(error.statusCode).toBe(401)
      expect(error.code).toBe('AUTHENTICATION_REQUIRED')
      expect(error.message).toBe('Authentication required')
    })
  })

  describe('RateLimitError', () => {
    it('should create rate limit error with retry info', () => {
      const error = new RateLimitError('Too many requests', 60)
      
      expect(error.statusCode).toBe(429)
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED')
      expect(error.details).toEqual({ retryAfter: 60 })
    })
  })
})

describe('Error Handler', () => {
  const mockRequestId = 'req-123'

  it('should handle ZodError correctly', () => {
    const zodError = new ZodError([
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'number',
        path: ['email'],
        message: 'Expected string, received number'
      }
    ])

    const response = handleAPIError(zodError, mockRequestId)
    const responseBody = response.json() as any

    expect(response.status).toBe(400)
    expect(responseBody.error.code).toBe('VALIDATION_ERROR')
    expect(responseBody.error.details.validationErrors).toHaveLength(1)
    expect(responseBody.error.requestId).toBe(mockRequestId)
  })

  it('should handle custom API errors', () => {
    const apiError = new ValidationError('Invalid input')
    
    const response = handleAPIError(apiError, mockRequestId)
    const responseBody = response.json() as any

    expect(response.status).toBe(400)
    expect(responseBody.error.code).toBe('VALIDATION_ERROR')
    expect(responseBody.error.message).toBe('Invalid input')
  })

  it('should handle generic errors', () => {
    const genericError = new Error('Something went wrong')
    
    const response = handleAPIError(genericError, mockRequestId)
    const responseBody = response.json() as any

    expect(response.status).toBe(500)
    expect(responseBody.error.code).toBe('INTERNAL_ERROR')
    expect(responseBody.error.message).toBe('Internal server error')
  })

  it('should include original message in development', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    const genericError = new Error('Debug message')
    const response = handleAPIError(genericError)
    const responseBody = response.json() as any

    expect(responseBody.error.details?.originalMessage).toBe('Debug message')

    process.env.NODE_ENV = originalEnv
  })
})

describe('ClientAPIError', () => {
  it('should create client error from response', () => {
    const errorResponse = {
      error: {
        message: 'Not found',
        code: 'NOT_FOUND',
        statusCode: 404,
        timestamp: new Date().toISOString()
      }
    }

    const clientError = new ClientAPIError(errorResponse)

    expect(clientError.message).toBe('Not found')
    expect(clientError.status).toBe(404)
    expect(clientError.code).toBe('NOT_FOUND')
  })
})

describe('Error Handling Utilities', () => {
  describe('withErrorHandling', () => {
    it('should pass through successful operations', async () => {
      const successHandler = withErrorHandling(async (value: string) => {
        return `Success: ${value}`
      })

      const result = await successHandler('test')
      expect(result).toBe('Success: test')
    })

    it('should wrap generic errors in APIError', async () => {
      const failingHandler = withErrorHandling(async () => {
        throw new Error('Generic error')
      })

      await expect(failingHandler()).rejects.toThrow(APIError)
    })

    it('should pass through APIErrors unchanged', async () => {
      const apiErrorHandler = withErrorHandling(async () => {
        throw new ValidationError('Validation failed')
      })

      await expect(apiErrorHandler()).rejects.toThrow(ValidationError)
    })
  })

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      let attempts = 0
      const operation = async () => {
        attempts++
        return 'success'
      }

      const result = await withRetry(operation, 3, 100)
      expect(result).toBe('success')
      expect(attempts).toBe(1)
    })

    it('should retry on server errors', async () => {
      let attempts = 0
      const operation = async () => {
        attempts++
        if (attempts < 3) {
          throw new ClientAPIError({
            error: {
              message: 'Server error',
              code: 'SERVER_ERROR',
              statusCode: 500,
              timestamp: new Date().toISOString()
            }
          })
        }
        return 'success'
      }

      const result = await withRetry(operation, 3, 10)
      expect(result).toBe('success')
      expect(attempts).toBe(3)
    })

    it('should not retry on client errors', async () => {
      let attempts = 0
      const operation = async () => {
        attempts++
        throw new ClientAPIError({
          error: {
            message: 'Bad request',
            code: 'BAD_REQUEST',
            statusCode: 400,
            timestamp: new Date().toISOString()
          }
        })
      }

      await expect(withRetry(operation, 3, 10)).rejects.toThrow(ClientAPIError)
      expect(attempts).toBe(1)
    })

    it('should fail after max attempts', async () => {
      let attempts = 0
      const operation = async () => {
        attempts++
        throw new Error('Always fails')
      }

      await expect(withRetry(operation, 2, 10)).rejects.toThrow('Always fails')
      expect(attempts).toBe(2)
    })
  })

  describe('sanitizeErrorDetails', () => {
    it('should redact sensitive fields', () => {
      const details = {
        email: 'user@example.com',
        password: 'secret123',
        token: 'jwt-token',
        publicData: 'safe'
      }

      const sanitized = sanitizeErrorDetails(details)

      expect(sanitized.email).toBe('user@example.com')
      expect(sanitized.password).toBe('[REDACTED]')
      expect(sanitized.token).toBe('[REDACTED]')
      expect(sanitized.publicData).toBe('safe')
    })

    it('should handle non-object details', () => {
      expect(sanitizeErrorDetails('string')).toBe('string')
      expect(sanitizeErrorDetails(123)).toBe(123)
      expect(sanitizeErrorDetails(null)).toBe(null)
    })

    it('should handle nested objects', () => {
      const details = {
        user: {
          password: 'secret',
          name: 'John'
        },
        auth: {
          secret: 'api-key'
        }
      }

      const sanitized = sanitizeErrorDetails(details)

      expect(sanitized.user.password).toBe('[REDACTED]')
      expect(sanitized.user.name).toBe('John')
      expect(sanitized.auth.secret).toBe('[REDACTED]')
    })
  })
})

describe('Error Configuration', () => {
  it('should have correct default config', () => {
    expect(ErrorConfig.logToConsole).toBe(true)
    expect(ErrorConfig.maxMessageLength).toBe(1000)
    expect(ErrorConfig.sensitiveFields).toContain('password')
    expect(ErrorConfig.sensitiveFields).toContain('token')
  })
})