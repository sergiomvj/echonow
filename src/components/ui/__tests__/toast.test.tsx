import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider, useToast } from '../../ui/toast'

// Test component that uses the toast hook
function TestToastComponent() {
  const { success, error, warning, info, addToast, clearAll } = useToast()

  return (
    <div>
      <button onClick={() => success('Success message')}>Success</button>
      <button onClick={() => error('Error message')}>Error</button>
      <button onClick={() => warning('Warning message')}>Warning</button>
      <button onClick={() => info('Info message')}>Info</button>
      <button 
        onClick={() => addToast({
          title: 'Custom Toast',
          description: 'Custom description',
          variant: 'success',
          action: { label: 'Action', onClick: () => {} }
        })}
      >
        Custom
      </button>
      <button onClick={clearAll}>Clear All</button>
    </div>
  )
}

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  )
}

describe('Toast System', () => {
  beforeEach(() => {
    // Clear any existing toasts
    document.body.innerHTML = ''
  })

  it('should render without crashing', () => {
    render(
      <TestWrapper>
        <TestToastComponent />
      </TestWrapper>
    )

    expect(screen.getByText('Success')).toBeInTheDocument()
    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('should display success toast', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <TestToastComponent />
      </TestWrapper>
    )

    await user.click(screen.getByText('Success'))
    
    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument()
    })
  })

  it('should display error toast', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <TestToastComponent />
      </TestWrapper>
    )

    await user.click(screen.getByText('Error'))
    
    await waitFor(() => {
      expect(screen.getByText('Error message')).toBeInTheDocument()
    })
  })

  it('should display warning toast', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <TestToastComponent />
      </TestWrapper>
    )

    await user.click(screen.getByText('Warning'))
    
    await waitFor(() => {
      expect(screen.getByText('Warning message')).toBeInTheDocument()
    })
  })

  it('should display info toast', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <TestToastComponent />
      </TestWrapper>
    )

    await user.click(screen.getByText('Info'))
    
    await waitFor(() => {
      expect(screen.getByText('Info message')).toBeInTheDocument()
    })
  })

  it('should display custom toast with title and action', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <TestToastComponent />
      </TestWrapper>
    )

    await user.click(screen.getByText('Custom'))
    
    await waitFor(() => {
      expect(screen.getByText('Custom Toast')).toBeInTheDocument()
      expect(screen.getByText('Custom description')).toBeInTheDocument()
      expect(screen.getByText('Action')).toBeInTheDocument()
    })
  })

  it('should allow dismissing toasts', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <TestToastComponent />
      </TestWrapper>
    )

    await user.click(screen.getByText('Success'))
    
    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument()
    })

    // Find and click the close button (X)
    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)
    
    await waitFor(() => {
      expect(screen.queryByText('Success message')).not.toBeInTheDocument()
    })
  })

  it('should clear all toasts', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <TestToastComponent />
      </TestWrapper>
    )

    // Add multiple toasts
    await user.click(screen.getByText('Success'))
    await user.click(screen.getByText('Error'))
    
    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument()
      expect(screen.getByText('Error message')).toBeInTheDocument()
    })

    // Clear all
    await user.click(screen.getByText('Clear All'))
    
    await waitFor(() => {
      expect(screen.queryByText('Success message')).not.toBeInTheDocument()
      expect(screen.queryByText('Error message')).not.toBeInTheDocument()
    })
  })

  it('should auto-dismiss toasts after duration', async () => {
    jest.useFakeTimers()
    
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    
    render(
      <TestWrapper>
        <TestToastComponent />
      </TestWrapper>
    )

    await user.click(screen.getByText('Success'))
    
    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument()
    })

    // Fast-forward time
    jest.advanceTimersByTime(5000)
    
    await waitFor(() => {
      expect(screen.queryByText('Success message')).not.toBeInTheDocument()
    })

    jest.useRealTimers()
  })

  it('should handle toast action clicks', async () => {
    const actionMock = jest.fn()
    const user = userEvent.setup()
    
    function CustomActionToast() {
      const { addToast } = useToast()
      
      return (
        <button 
          onClick={() => addToast({
            title: 'Action Toast',
            description: 'Click the action',
            action: { label: 'Test Action', onClick: actionMock }
          })}
        >
          Add Action Toast
        </button>
      )
    }

    render(
      <TestWrapper>
        <CustomActionToast />
      </TestWrapper>
    )

    await user.click(screen.getByText('Add Action Toast'))
    
    await waitFor(() => {
      expect(screen.getByText('Action Toast')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Test Action'))
    
    expect(actionMock).toHaveBeenCalledTimes(1)
  })
})"