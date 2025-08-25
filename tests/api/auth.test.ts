import { createMocks } from 'node-mocks-http'
import { NextRequest } from 'next/server'
import { POST } from '../../app/api/auth/register/route'

// Mock database
jest.mock('@/lib/auth/utils', () => ({
  createUser: jest.fn()
}))

import { createUser } from '@/lib/auth/utils'

describe('/api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('successfully creates a new user', async () => {
    const mockUser = {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      subscription: 'free',
      role: 'user'
    }

    ;(createUser as jest.Mock).mockResolvedValueOnce(mockUser)

    const { req } = createMocks({
      method: 'POST',
      body: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123'
      }
    })

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.user).toMatchObject({
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      subscription: 'free',
      role: 'user'
    })
    expect(data.user.password).toBeUndefined()
  })

  test('validates required fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        // Missing email and password
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  test('validates email format', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'invalid-email',
        password: 'TestPassword123'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Email inválido')
  })

  test('validates password requirements', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'weak' // Too short, no uppercase, no number
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Senha deve ter pelo menos 8 caracteres')
  })

  test('validates password uppercase requirement', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword123' // No uppercase
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('letra maiúscula')
  })

  test('validates password number requirement', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword' // No number
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('número')
  })

  test('handles duplicate user error', async () => {
    ;(createUser as jest.Mock).mockRejectedValueOnce(new Error('User already exists'))

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'existing@example.com',
        password: 'TestPassword123'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe('Já existe uma conta com este email')
  })

  test('handles unexpected database errors', async () => {
    ;(createUser as jest.Mock).mockRejectedValueOnce(new Error('Database connection failed'))

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Erro interno do servidor')
  })

  test('validates name length', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'A', // Too short
        email: 'test@example.com',
        password: 'TestPassword123'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Nome deve ter pelo menos 2 caracteres')
  })
})", "original_text": "", "replace_all": false}]