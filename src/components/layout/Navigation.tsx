'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Search, 
  PenTool, 
  Video, 
  Clock, 
  Users, 
  Settings,
  Crown,
  Menu,
  X,
  Moon,
  Sun
} from 'lucide-react'

interface NavigationProps {
  currentPage?: string
}

export default function Navigation({ currentPage = 'home' }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const router = useRouter()

  const navigationItems = [
    { href: '/', label: 'Home', icon: Home, id: 'home' },
    { href: '/explore', label: 'Explorar', icon: Search, id: 'explore' },
    { href: '/editor', label: 'Editor Virtual', icon: PenTool, id: 'editor' },
    { href: '/reels', label: 'Reels & Shorts', icon: Video, id: 'reels' },
    { href: '/timeline', label: 'Linha do Tempo', icon: Clock, id: 'timeline' },
    { href: '/participate', label: 'Participar', icon: Users, id: 'participate' },
    { href: '/creator', label: 'Painel do Criador', icon: Settings, id: 'creator' },
    { href: '/premium', label: 'Premium', icon: Crown, id: 'premium' },
  ]

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border">
      <div className="container flex h-16 items-center px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-echo-cyan to-echo-amber">
            <span className="text-sm font-bold text-white">E</span>
          </div>
          <span className="text-xl font-bold font-space-grotesk echo-gradient-text">
            EchoNow
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex ml-8 space-x-1">
          {navigationItems.slice(0, 6).map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                  isActive 
                    ? 'bg-echo-cyan/10 text-echo-cyan' 
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="flex-1" />

        {/* Right side items */}
        <div className="flex items-center space-x-4">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Premium badge for desktop */}
          <div className="hidden md:block">
            <Link href="/premium">
              <Badge variant="secondary" className="cursor-pointer hover:bg-echo-amber/80">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            </Link>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur">
          <div className="container px-4 py-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium transition-colors hover:bg-accent ${
                    isActive 
                      ? 'bg-echo-cyan/10 text-echo-cyan' 
                      : 'text-muted-foreground'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {item.id === 'premium' && (
                    <Badge variant="secondary" className="ml-auto">
                      Pro
                    </Badge>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}