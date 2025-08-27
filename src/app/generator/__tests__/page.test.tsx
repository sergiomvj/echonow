import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import '@testing-library/jest-dom'
import AIGeneratorPage from '../page'

// Mock dependencies
jest.mock('next-auth/react')
jest.mock('next/navigation')
jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn()
  })
}))

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

// Mock fetch
global.fetch = jest.fn()

describe('AI Generator Page', () => {
  const mockPush = jest.fn()
  
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      pathname: '/generator',
      query: {},
      asPath: '/generator',
    } as any)
    
    // Reset fetch mock
    ;(fetch as jest.Mock).mockReset()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication', () => {
    it('redirects to sign in when user is not authenticated', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn()
      } as any)

      render(<AIGeneratorPage />)

      const signInButton = screen.getByText('Sign In')
      expect(signInButton).toBeInTheDocument()
      
      fireEvent.click(signInButton)
      expect(mockPush).toHaveBeenCalledWith('/auth/signin')
    })

    it('shows generator form when user is authenticated', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { 
            id: '1', 
            name: 'Test User', 
            email: 'test@example.com',
            subscription: 'free',
            role: 'user'
          }
        },
        status: 'authenticated',
        update: jest.fn()
      } as any)

      render(<AIGeneratorPage />)

      expect(screen.getByText('AI Content Generator')).toBeInTheDocument()
      expect(screen.getByText('Content Type')).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Sustainable technology trends/)).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: { 
            id: '1', 
            name: 'Test User', 
            email: 'test@example.com',
            subscription: 'free',
            role: 'user'
          }
        },
        status: 'authenticated',
        update: jest.fn()
      } as any)
    })

    it('renders all required form fields', () => {
      render(<AIGeneratorPage />)

      // Content type options
      expect(screen.getByText('Article')).toBeInTheDocument()
      expect(screen.getByText('Short')).toBeInTheDocument()
      expect(screen.getByText('Analysis')).toBeInTheDocument()

      // Topic textarea
      expect(screen.getByPlaceholderText(/Sustainable technology trends/)).toBeInTheDocument()

      // Style dropdown
      expect(screen.getByText('Style')).toBeInTheDocument()

      // Length dropdown
      expect(screen.getByText('Length')).toBeInTheDocument()

      // Target audience
      expect(screen.getByText('Target Audience')).toBeInTheDocument()

      // Generate button
      expect(screen.getByText('Generate Content')).toBeInTheDocument()
    })

    it('disables generate button when topic is empty', () => {
      render(<AIGeneratorPage />)

      const generateButton = screen.getByText('Generate Content')
      expect(generateButton).toBeDisabled()
    })

    it('enables generate button when topic is filled', async () => {
      render(<AIGeneratorPage />)

      const topicInput = screen.getByPlaceholderText(/Sustainable technology trends/)
      fireEvent.change(topicInput, { target: { value: 'Test topic for AI generation' } })

      await waitFor(() => {
        const generateButton = screen.getByText('Generate Content')
        expect(generateButton).toBeEnabled()
      })
    })
  })

  describe('Content Generation', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: { 
            id: '1', 
            name: 'Test User', 
            email: 'test@example.com',
            subscription: 'free',
            role: 'user'
          }
        },
        status: 'authenticated',
        update: jest.fn()
      } as any)
    })

    it('submits form with correct data', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: 'Generated content example' })
      })

      render(<AIGeneratorPage />)

      // Fill form
      const topicInput = screen.getByPlaceholderText(/Sustainable technology trends/)
      fireEvent.change(topicInput, { target: { value: 'AI in healthcare 2024' } })

      // Select content type
      const articleOption = screen.getByLabelText('Article')
      fireEvent.click(articleOption)

      // Submit form
      const generateButton = screen.getByText('Generate Content')
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/ai/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic: 'AI in healthcare 2024',
            type: 'article',
            style: 'neutral',
            length: 'medium',
            includeHistorical: false,
            targetAudience: 'general'
          })
        })
      })
    })

    it('displays generated content after successful generation', async () => {
      const mockContent = 'This is the generated AI content about healthcare technology.'
      
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: mockContent })
      })

      render(<AIGeneratorPage />)

      // Fill and submit form
      const topicInput = screen.getByPlaceholderText(/Sustainable technology trends/)
      fireEvent.change(topicInput, { target: { value: 'Healthcare AI trends' } })

      const generateButton = screen.getByText('Generate Content')
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText(mockContent)).toBeInTheDocument()
        expect(screen.getByText('Copy')).toBeInTheDocument()
        expect(screen.getByText('Save')).toBeInTheDocument()
      })
    })

    it('handles generation errors gracefully', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Rate limit exceeded' })
      })

      render(<AIGeneratorPage />)

      // Fill and submit form
      const topicInput = screen.getByPlaceholderText(/Sustainable technology trends/)
      fireEvent.change(topicInput, { target: { value: 'Test topic' } })

      const generateButton = screen.getByText('Generate Content')
      fireEvent.click(generateButton)

      // The error should be handled by the useToast hook
      await waitFor(() => {
        expect(fetch).toHaveBeenCalled()
      })
    })
  })

  describe('Content History', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: { 
            id: '1', 
            name: 'Test User', 
            email: 'test@example.com',
            subscription: 'free',
            role: 'user'
          }
        },
        status: 'authenticated',
        update: jest.fn()
      } as any)
    })

    it('displays empty state when no history exists', () => {
      render(<AIGeneratorPage />)

      expect(screen.getByText('Recent Generations')).toBeInTheDocument()
      expect(screen.getByText(/No content generated yet/)).toBeInTheDocument()
    })
  })
})