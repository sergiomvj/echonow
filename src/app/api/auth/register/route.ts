import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/auth/utils'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/\d/, 'Senha deve conter pelo menos um número')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = registerSchema.parse(body)
    
    // Create user
    const user = await createUser({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password
    })

    // Return success (don't include password in response)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        role: user.role
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Registration error:', error)
    
    // Handle validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json({
        error: error.errors[0].message
      }, { status: 400 })
    }
    
    // Handle duplicate user
    if (error.message === 'User already exists') {
      return NextResponse.json({
        error: 'Já existe uma conta com este email'
      }, { status: 409 })
    }
    
    // Handle other errors
    return NextResponse.json({
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}