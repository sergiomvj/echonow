'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Github, Mail, AlertCircle, CheckCircle } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const passwordRequirements = [
    { text: 'Pelo menos 8 caracteres', met: formData.password.length >= 8 },
    { text: 'Uma letra maiúscula', met: /[A-Z]/.test(formData.password) },
    { text: 'Uma letra minúscula', met: /[a-z]/.test(formData.password) },
    { text: 'Um número', met: /\d/.test(formData.password) }
  ]

  const isPasswordValid = passwordRequirements.every(req => req.met)
  const doPasswordsMatch = formData.password === formData.confirmPassword

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!isPasswordValid) {
      setError('A senha não atende aos requisitos mínimos')
      setIsLoading(false)
      return
    }

    if (!doPasswordsMatch) {
      setError('As senhas não coincidem')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar conta')
      }

      setSuccess(true)
      
      // Auto sign-in after successful registration
      setTimeout(async () => {
        await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          callbackUrl: '/'
        })
      }, 2000)

    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignUp = async (provider: string) => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl: '/' })
    } catch (error) {
      setError('Erro ao conectar com o provedor. Tente novamente.')
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md text-center p-6">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold">Conta criada com sucesso!</h1>
            <p className="text-muted-foreground">
              Bem-vindo ao EchoNow! Você será redirecionado automaticamente...
            </p>
          </div>
        </Card>
      </div>
    )
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
            Crie sua conta gratuita
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2 text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Criar Conta</CardTitle>
            <CardDescription>
              Comece sua jornada no EchoNow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* OAuth Providers */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthSignUp('google')}
                disabled={isLoading}
              >
                <Mail className="h-4 w-4 mr-2" />
                Continuar com Google
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthSignUp('github')}
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
                  Ou crie com email
                </span>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Nome completo
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-echo-cyan"
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
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
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
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

                {/* Password Requirements */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs">
                        <div className={`w-2 h-2 rounded-full ${req.met ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className={req.met ? 'text-green-600' : 'text-muted-foreground'}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                  Confirmar senha
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pr-10 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-echo-cyan"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {formData.confirmPassword && !doPasswordsMatch && (
                  <p className="mt-1 text-xs text-red-500">As senhas não coincidem</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !isPasswordValid || !doPasswordsMatch || !formData.name || !formData.email}
              >
                {isLoading ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </form>

            {/* Links */}
            <div className="text-center">
              <div className="text-sm text-muted-foreground">
                Já tem uma conta?{' '}
                <Link 
                  href="/auth/signin" 
                  className="text-echo-cyan hover:underline"
                >
                  Fazer login
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          Ao criar uma conta, você concorda com nossos{' '}
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