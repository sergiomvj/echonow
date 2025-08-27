import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

// Custom error classes
export class APIError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly details?: any

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message)
    this.name = 'APIError'
    this.statusCode = statusCode
    this.code = code || 'INTERNAL_ERROR'
    this.details = details
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_REQUIRED')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'INSUFFICIENT_PERMISSIONS')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends APIError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class RateLimitError extends APIError {
  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', { retryAfter })
    this.name = 'RateLimitError'
  }
}

export class SubscriptionError extends APIError {
  constructor(message: string = 'Subscription upgrade required') {
    super(message, 402, 'SUBSCRIPTION_REQUIRED')
    this.name = 'SubscriptionError'
  }
}

export class DatabaseError extends APIError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR')
    this.name = 'DatabaseError'
  }
}

export class ExternalServiceError extends APIError {
  constructor(service: string, message: string = 'External service unavailable') {
    super(message, 503, 'EXTERNAL_SERVICE_ERROR', { service })
    this.name = 'ExternalServiceError'
  }
}

// Error response interface
export interface ErrorResponse {
  error: {
    message: string
    code: string
    statusCode: number
    details?: any
    timestamp: string
    requestId?: string
  }
}

// Error handler function
export function handleAPIError(error: unknown, requestId?: string): NextResponse<ErrorResponse> {
  console.error('API Error:', error)

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }))

    return NextResponse.json({
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        details: { validationErrors: formattedErrors },
        timestamp: new Date().toISOString(),
        requestId
      }
    }, { status: 400 })
  }

  // Handle custom API errors
  if (error instanceof APIError) {
    return NextResponse.json({
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
        timestamp: new Date().toISOString(),
        requestId
      }
    }, { status: error.statusCode })
  }

  // Handle Prisma errors
  if (error instanceof Error && error.name.includes('Prisma')) {
    return handlePrismaError(error, requestId)
  }

  // Handle generic errors
  const message = error instanceof Error ? error.message : 'Unknown error occurred'
  return NextResponse.json({
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
      details: process.env.NODE_ENV === 'development' ? { originalMessage: message } : undefined,
      timestamp: new Date().toISOString(),
      requestId
    }
  }, { status: 500 })
}

// Handle Prisma-specific errors
function handlePrismaError(error: Error, requestId?: string): NextResponse<ErrorResponse> {
  const message = error.message

  // Common Prisma error patterns
  if (message.includes('Unique constraint')) {
    return NextResponse.json({
      error: {
        message: 'Resource already exists',
        code: 'DUPLICATE_RESOURCE',
        statusCode: 409,
        timestamp: new Date().toISOString(),
        requestId
      }
    }, { status: 409 })
  }

  if (message.includes('Foreign key constraint')) {
    return NextResponse.json({
      error: {
        message: 'Referenced resource not found',
        code: 'INVALID_REFERENCE',
        statusCode: 400,
        timestamp: new Date().toISOString(),
        requestId
      }
    }, { status: 400 })
  }

  if (message.includes('Record to update not found')) {
    return NextResponse.json({
      error: {
        message: 'Resource not found',
        code: 'NOT_FOUND',
        statusCode: 404,
        timestamp: new Date().toISOString(),
        requestId
      }
    }, { status: 404 })
  }

  // Generic database error
  return NextResponse.json({
    error: {
      message: 'Database operation failed',
      code: 'DATABASE_ERROR',
      statusCode: 500,
      timestamp: new Date().toISOString(),
      requestId
    }
  }, { status: 500 })
}

// API wrapper with error handling
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args)
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      
      // Convert generic errors to APIError
      const message = error instanceof Error ? error.message : 'Unknown error'
      throw new APIError(message, 500, 'INTERNAL_ERROR')
    }
  }
}

// Client-side error handler
export class ClientAPIError extends Error {
  public readonly status: number
  public readonly code: string
  public readonly details?: any

  constructor(response: ErrorResponse) {
    super(response.error.message)
    this.name = 'ClientAPIError'
    this.status = response.error.statusCode
    this.code = response.error.code
    this.details = response.error.details
  }
}

// Client API call wrapper
export async function apiCall<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  })

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json()
    throw new ClientAPIError(errorData)
  }

  return response.json()
}

// Error logging utility
export function logError(error: unknown, context?: string) {
  const timestamp = new Date().toISOString()
  const errorInfo = {
    timestamp,
    context,
    error: {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }
  }

  console.error('Error logged:', JSON.stringify(errorInfo, null, 2))

  // In production, send to logging service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to Sentry, LogRocket, etc.
    // reportError(errorInfo)
  }
}

// Error boundary helper
export function getErrorMessage(error: unknown): string {
  if (error instanceof ClientAPIError) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'Erro desconhecido'
}

// Retry logic for network errors
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      // Don't retry client errors (4xx)
      if (error instanceof ClientAPIError && error.status < 500) {
        throw error
      }

      if (attempt === maxAttempts) {
        break
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)))
    }
  }

  throw lastError
}

// Error reporting configuration
export const ErrorConfig = {
  // Whether to include stack traces in development
  includeStackTrace: process.env.NODE_ENV === 'development',
  
  // Maximum error message length
  maxMessageLength: 1000,
  
  // Whether to log errors to console
  logToConsole: true,
  
  // Sensitive fields to exclude from error details
  sensitiveFields: ['password', 'token', 'secret', 'key', 'authorization']
}

// Sanitize error details
export function sanitizeErrorDetails(details: any): any {
  if (!details || typeof details !== 'object') {
    return details
  }

  const sanitized = { ...details }
  
  for (const field of ErrorConfig.sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]'
    }
  }

  return sanitized
}