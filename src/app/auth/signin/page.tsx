'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Github, Mail, AlertCircle } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const error = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setAuthError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setAuthError('Credenciais inválidas. Verifique seu email e senha.')
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      setAuthError('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl })
    } catch (error) {
      setAuthError('Erro ao conectar com o provedor. Tente novamente.')
      setIsLoading(false)
    }
  }

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'CredentialsSignin':
        return 'Credenciais inválidas'
      case 'OAuthAccountNotLinked':
        return 'Esta conta já está vinculada a outro método de login'
      case 'OAuthCallback':
        return 'Erro na autenticação OAuth'
      default:
        return 'Erro desconhecido'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold font-space-grotesk bg-gradient-to-r from-echo-cyan to-echo-amber bg-clip-text text-transparent">
            EchoNow
          </h1>
          <p className="text-muted-foreground">
            Entre na sua conta para continuar
          </p>
        </div>

        {/* Error Message */}
        {(error || authError) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2 text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">
              {authError || getErrorMessage(error)}
            </span>
          </div>
        )}

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Entrar</CardTitle>
            <CardDescription>
              Escolha seu método de login preferido
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* OAuth Providers */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthSignIn('google')}
                disabled={isLoading}
              >
                <Mail className="h-4 w-4 mr-2" />
                Continuar com Google
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthSignIn('github')}
                disabled={isLoading}
              >
                <Github className="h-4 w-4 mr-2" />
                Continuar com GitHub
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou continue com email
                </span>
              </div>
            </div>

            {/* Credentials Form */}
            <form onSubmit={handleCredentialsSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-echo-cyan"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-echo-cyan"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !email || !password}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            {/* Links */}
            <div className="text-center space-y-2">
              <Link 
                href="/auth/forgot-password" 
                className="text-sm text-echo-cyan hover:underline"
              >
                Esqueci minha senha
              </Link>
              
              <div className="text-sm text-muted-foreground">
                Não tem uma conta?{' '}
                <Link 
                  href="/auth/signup" 
                  className="text-echo-cyan hover:underline"
                >
                  Criar conta
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          Ao continuar, você concorda com nossos{' '}
          <Link href="/terms" className="text-echo-cyan hover:underline">
            Termos de Uso
          </Link>{' '}
          e{' '}
          <Link href="/privacy" className="text-echo-cyan hover:underline">
            Política de Privacidade
          </Link>
        </div>
      </div>
    </div>
  )
}