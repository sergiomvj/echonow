'use client'

import { ReactNode } from 'react'
import Navigation from './Navigation'

interface LayoutProps {
  children: ReactNode
  currentPage?: string
}

export default function Layout({ children, currentPage }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage={currentPage} />
      <main className="pb-8">
        {children}
      </main>
      <footer className="border-t border-border bg-background/95 backdrop-blur">
        <div className="container px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and description */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-echo-cyan to-echo-amber">
                  <span className="text-sm font-bold text-white">E</span>
                </div>
                <span className="text-xl font-bold font-space-grotesk echo-gradient-text">
                  EchoNow
                </span>
              </div>
              <p className="text-muted-foreground text-sm max-w-md">
                Repercussão inteligente. Aprofundamento sem viés. 
                Plataforma que repercute e aprofunda fatos relevantes com IA.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h3 className="font-semibold mb-4">Navegação</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/" className="hover:text-echo-cyan transition-colors">Home</a></li>
                <li><a href="/explore" className="hover:text-echo-cyan transition-colors">Explorar</a></li>
                <li><a href="/editor" className="hover:text-echo-cyan transition-colors">Editor Virtual</a></li>
                <li><a href="/reels" className="hover:text-echo-cyan transition-colors">Reels & Shorts</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/premium" className="hover:text-echo-cyan transition-colors">Premium</a></li>
                <li><a href="/help" className="hover:text-echo-cyan transition-colors">Ajuda</a></li>
                <li><a href="/privacy" className="hover:text-echo-cyan transition-colors">Privacidade</a></li>
                <li><a href="/terms" className="hover:text-echo-cyan transition-colors">Termos</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>&copy; 2024 EchoNow. Todos os direitos reservados.</p>
            <p className="mt-2 md:mt-0">
              Feito com ❤️ para um mundo mais informado
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}