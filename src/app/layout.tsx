import type { Metadata } from 'next'
import React, { Suspense } from 'react'
import { Inter, Space_Grotesk, Archivo_Black } from 'next/font/google'
import './globals.css'
import { SpinnerFallback, SkeletonFallback } from '@/components/ui/ServerLoadingFallback'
import { ClientProviders } from '@/components/providers/ClientProviders'

// Font optimization with preload
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  preload: true,
})

const archivoBlack = Archivo_Black({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-archivo-black',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://echonow.com' : 'http://localhost:3000'),
  title: {
    default: 'EchoNow - Repercussão inteligente sem viés',
    template: '%s | EchoNow'
  },
  description: 'Plataforma digital que repercute e aprofunda fatos, notícias e acontecimentos relevantes de forma não ideológica, com linguagem acessível e visão plural.',
  keywords: ['notícias', 'análise', 'IA', 'sem viés', 'repercussão', 'inteligência artificial', 'geração de conteúdo', 'AI content'],
  authors: [{ name: 'EchoNow Team' }],
  creator: 'EchoNow',
  publisher: 'EchoNow',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://echonow.com',
    siteName: 'EchoNow',
    title: 'EchoNow - Repercussão inteligente sem viés',
    description: 'Plataforma digital que repercute e aprofunda fatos, notícias e acontecimentos relevantes de forma não ideológica.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EchoNow - Repercussão inteligente sem viés',
    description: 'Plataforma digital que repercute e aprofunda fatos, notícias e acontecimentos relevantes de forma não ideológica.',
    creator: '@echonow',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

// Separate viewport export (required in Next.js 14+)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#04D9FF' },
    { media: '(prefers-color-scheme: dark)', color: '#1C1C1E' },
  ],
}

// Server-compatible metadata and font definitions

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/api/auth/session" as="fetch" crossOrigin="anonymous" />
        
        {/* DNS prefetch for external services */}
        <link rel="dns-prefetch" href="https://api.openai.com" />
        <link rel="dns-prefetch" href="https://api.stripe.com" />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${archivoBlack.variable} font-inter antialiased`}
      >
        <Suspense fallback={<SpinnerFallback />}>
          <ClientProviders>
            <Suspense fallback={<SkeletonFallback className="min-h-screen" />}>
              {children}
            </Suspense>
          </ClientProviders>
        </Suspense>
      </body>
    </html>
  )
}