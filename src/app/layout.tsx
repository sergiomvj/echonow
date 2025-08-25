import type { Metadata } from 'next'
import { Inter, Space_Grotesk, Archivo_Black } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

const archivoBlack = Archivo_Black({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-archivo-black',
})

export const metadata: Metadata = {
  title: 'EchoNow - Repercussão inteligente sem viés',
  description: 'Plataforma digital que repercute e aprofunda fatos, notícias e acontecimentos relevantes de forma não ideológica, com linguagem acessível e visão plural.',
  keywords: ['notícias', 'análise', 'IA', 'sem viés', 'repercussão', 'inteligência artificial'],
  authors: [{ name: 'EchoNow Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#04D9FF' },
    { media: '(prefers-color-scheme: dark)', color: '#1C1C1E' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${archivoBlack.variable} font-inter antialiased`}
      >
        {children}
      </body>
    </html>
  )
}