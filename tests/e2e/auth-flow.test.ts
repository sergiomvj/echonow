import { test, expect } from '@playwright/test'

// E2E tests for authentication flow
test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/')
  })

  test('should show sign in page when accessing protected route', async ({ page }) => {
    // Try to access protected route
    await page.goto('/editor')
    
    // Should redirect to sign in
    await expect(page).toHaveURL(/.*auth\/signin/)
    await expect(page.getByText('Entre na sua conta')).toBeVisible()
  })

  test('should allow user registration', async ({ page }) => {
    // Navigate to sign up
    await page.goto('/auth/signup')
    
    // Fill registration form
    await page.fill('[data-testid="name-input"]', 'João Silva')
    await page.fill('[data-testid="email-input"]', 'joao@test.com')
    await page.fill('[data-testid="password-input"]', 'MinhaSenh@123')
    await page.fill('[data-testid="confirm-password-input"]', 'MinhaSenh@123')
    
    // Submit form
    await page.click('[data-testid="register-button"]')
    
    // Should show success message or redirect
    await expect(page.getByText('Conta criada com sucesso')).toBeVisible()
  })

  test('should validate registration form', async ({ page }) => {\n    await page.goto('/auth/signup')\n    \n    // Try to submit empty form\n    await page.click('[data-testid=\"register-button\"]')\n    \n    // Should show validation errors\n    await expect(page.getByText('Nome é obrigatório')).toBeVisible()\n    \n    // Test weak password\n    await page.fill('[data-testid=\"password-input\"]', '123')\n    await page.blur('[data-testid=\"password-input\"]')\n    \n    await expect(page.getByText('Senha deve ter pelo menos 8 caracteres')).toBeVisible()\n  })\n\n  test('should allow user login', async ({ page }) => {\n    await page.goto('/auth/signin')\n    \n    // Fill login form\n    await page.fill('[data-testid=\"email-input\"]', 'test@echonow.com')\n    await page.fill('[data-testid=\"password-input\"]', 'password123')\n    \n    // Submit form\n    await page.click('[data-testid=\"login-button\"]')\n    \n    // Should redirect to home or dashboard\n    await expect(page).toHaveURL('/')\n    \n    // Should show user is logged in\n    await expect(page.getByTestId('user-menu')).toBeVisible()\n  })\n\n  test('should handle login errors', async ({ page }) => {\n    await page.goto('/auth/signin')\n    \n    // Try invalid credentials\n    await page.fill('[data-testid=\"email-input\"]', 'invalid@test.com')\n    await page.fill('[data-testid=\"password-input\"]', 'wrongpassword')\n    \n    await page.click('[data-testid=\"login-button\"]')\n    \n    // Should show error message\n    await expect(page.getByText('Credenciais inválidas')).toBeVisible()\n  })\n\n  test('should allow password toggle', async ({ page }) => {\n    await page.goto('/auth/signin')\n    \n    const passwordInput = page.getByTestId('password-input')\n    const toggleButton = page.getByTestId('password-toggle')\n    \n    // Initially password should be hidden\n    await expect(passwordInput).toHaveAttribute('type', 'password')\n    \n    // Click toggle to show password\n    await toggleButton.click()\n    await expect(passwordInput).toHaveAttribute('type', 'text')\n    \n    // Click again to hide\n    await toggleButton.click()\n    await expect(passwordInput).toHaveAttribute('type', 'password')\n  })\n\n  test('should support OAuth login', async ({ page }) => {\n    await page.goto('/auth/signin')\n    \n    // Check OAuth buttons are present\n    await expect(page.getByText('Continuar com Google')).toBeVisible()\n    await expect(page.getByText('Continuar com GitHub')).toBeVisible()\n    \n    // Note: Full OAuth testing would require additional setup\n  })\n})\n\ntest.describe('Protected Routes', () => {\n  test.beforeEach(async ({ page }) => {\n    // Mock authentication state\n    await page.addInitScript(() => {\n      localStorage.setItem('echonow-auth', JSON.stringify({\n        user: {\n          id: 'test-user',\n          email: 'test@echonow.com',\n          name: 'Test User',\n          subscription: 'free'\n        }\n      }))\n    })\n  })\n\n  test('should access editor when authenticated', async ({ page }) => {\n    await page.goto('/editor')\n    \n    // Should be able to access editor\n    await expect(page.getByText('Crie Conteúdo Inteligente')).toBeVisible()\n  })\n\n  test('should show subscription upgrade for premium features', async ({ page }) => {\n    await page.goto('/editor')\n    \n    // Try to use premium feature\n    await page.click('[data-testid=\"premium-feature\"]')\n    \n    // Should show upgrade prompt\n    await expect(page.getByText('Premium subscription required')).toBeVisible()\n  })\n})"