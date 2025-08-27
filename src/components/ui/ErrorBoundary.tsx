'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
}

interface ErrorFallbackProps {
  error?: Error
  resetError: () => void
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Report error to monitoring service
    if (typeof window !== 'undefined') {
      // Example: Sentry, LogRocket, etc.
      // reportError(error, errorInfo)
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent 
          error={this.state.error} 
          resetError={this.resetError}
        />
      )
    }

    return this.props.children
  }
}

// Default error fallback component
function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Oops! Algo deu errado</CardTitle>
          <CardDescription>
            Encontramos um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isDevelopment && error && (
            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-semibold text-sm mb-2">Detalhes do Erro (Dev):</h4>
              <pre className="text-xs text-muted-foreground overflow-auto max-h-40">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={resetError} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'} className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              Ir para Home
            </Button>
          </div>
          
          <div className="text-center">
            <Button
              variant="link"
              size="sm"
              onClick={() => window.open('/report', '_blank')}
              className="text-muted-foreground"
            >
              <Bug className="h-3 w-3 mr-1" />
              Reportar este erro
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// API Error Display Component
interface ApiErrorProps {
  error: {
    message: string
    status?: number
    code?: string
  }
  onRetry?: () => void
  onDismiss?: () => void
}

export function ApiError({ error, onRetry, onDismiss }: ApiErrorProps) {
  const getErrorMessage = (status?: number, code?: string) => {
    if (status === 401) return 'Sessão expirada. Faça login novamente.'
    if (status === 403) return 'Você não tem permissão para esta ação.'
    if (status === 404) return 'Recurso não encontrado.'
    if (status === 429) return 'Muitas tentativas. Tente novamente mais tarde.'
    if (status && status >= 500) return 'Erro interno do servidor. Tente novamente.'
    if (code === 'NETWORK_ERROR') return 'Erro de conexão. Verifique sua internet.'
    return error.message || 'Erro desconhecido'
  }

  return (
    <Card className="border-destructive">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-destructive">Erro</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {getErrorMessage(error.status, error.code)}
            </p>
            {error.status && (
              <p className="text-xs text-muted-foreground mt-1">
                Status: {error.status}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            {onRetry && (
              <Button size="sm" variant="outline" onClick={onRetry}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Tentar
              </Button>
            )}
            {onDismiss && (
              <Button size="sm" variant="ghost" onClick={onDismiss}>
                ✕
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Network Error Component
export function NetworkError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center py-8">
      <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Sem conexão</h3>
      <p className="text-muted-foreground mb-4">
        Verifique sua conexão com a internet e tente novamente.
      </p>
      <Button onClick={onRetry}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Tentar Novamente
      </Button>
    </div>
  )
}

// 404 Not Found Component
export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-muted-foreground/30">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Página não encontrada</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="space-x-2">
          <Button onClick={() => window.history.back()}>
            Voltar
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            <Home className="h-4 w-4 mr-2" />
            Ir para Home
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ErrorBoundary
export { ErrorBoundary }