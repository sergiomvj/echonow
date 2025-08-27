import * as React from "react"
import { Eye, EyeOff, AlertCircle, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  showPasswordToggle?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    label, 
    error, 
    success, 
    hint, 
    leftIcon, 
    rightIcon, 
    showPasswordToggle,
    id,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    
    const inputId = id || React.useId()
    const isPassword = type === "password"
    const currentType = isPassword && showPassword ? "text" : type

    const handlePasswordToggle = () => {
      setShowPassword(!showPassword)
    }

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          
          <input
            type={currentType}
            id={inputId}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              leftIcon && "pl-10",
              (rightIcon || showPasswordToggle || error || success) && "pr-10",
              error && "border-destructive focus-visible:ring-destructive",
              success && "border-green-500 focus-visible:ring-green-500",
              isFocused && !error && !success && "border-echo-cyan focus-visible:ring-echo-cyan",
              className
            )}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            {...props}
          />
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {error && (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
            
            {success && !error && (
              <Check className="h-4 w-4 text-green-500" />
            )}
            
            {showPasswordToggle && isPassword && (
              <button
                type="button"
                onClick={handlePasswordToggle}
                className="text-muted-foreground hover:text-foreground focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}
            
            {rightIcon && !showPasswordToggle && !error && !success && (
              <div className="text-muted-foreground">
                {rightIcon}
              </div>
            )}
          </div>
        </div>
        
        {(hint || error || success) && (
          <div className="text-sm">
            {error && (
              <p className="text-destructive flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span>{error}</span>
              </p>
            )}
            
            {success && !error && (
              <p className="text-green-600 flex items-center space-x-1">
                <Check className="h-3 w-3" />
                <span>{success}</span>
              </p>
            )}
            
            {hint && !error && !success && (
              <p className="text-muted-foreground">{hint}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

// Textarea variant
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  success?: string
  hint?: string
  maxLength?: number
  showCount?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    label, 
    error, 
    success, 
    hint, 
    maxLength,
    showCount,
    id,
    value,
    ...props 
  }, ref) => {
    const inputId = id || React.useId()
    const currentLength = typeof value === 'string' ? value.length : 0
    
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        
        <textarea
          id={inputId}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            success && "border-green-500 focus-visible:ring-green-500",
            className
          )}
          maxLength={maxLength}
          value={value}
          ref={ref}
          {...props}
        />
        
        <div className="flex justify-between">
          <div className="text-sm">
            {error && (
              <p className="text-destructive flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span>{error}</span>
              </p>
            )}
            
            {success && !error && (
              <p className="text-green-600 flex items-center space-x-1">
                <Check className="h-3 w-3" />
                <span>{success}</span>
              </p>
            )}
            
            {hint && !error && !success && (
              <p className="text-muted-foreground">{hint}</p>
            )}
          </div>
          
          {showCount && maxLength && (
            <div className="text-sm text-muted-foreground">
              {currentLength}/{maxLength}
            </div>
          )}
        </div>
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Input, Textarea }