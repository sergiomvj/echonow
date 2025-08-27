'use client'

import Link from 'next/link'
import { 
  Brain, 
  Twitter, 
  Github, 
  Linkedin, 
  Mail,
  Heart,
  Globe,
  Shield,
  FileText,
  Users
} from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const navigation = {
    product: [
      { name: 'Explorar', href: '/explore' },
      { name: 'Editor IA', href: '/editor' },
      { name: 'Shorts & Reels', href: '/reels' },
      { name: 'Linha do Tempo', href: '/timeline' },
      { name: 'Participar', href: '/participate' }
    ],
    premium: [
      { name: 'Planos Premium', href: '/premium' },
      { name: 'Painel Criador', href: '/creator' },
      { name: 'API Access', href: '/api-docs' },
      { name: 'Analytics', href: '/analytics' }
    ],
    company: [
      { name: 'Sobre Nós', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Carreiras', href: '/careers' },
      { name: 'Imprensa', href: '/press' },
      { name: 'Contato', href: '/contact' }
    ],
    support: [
      { name: 'Central de Ajuda', href: '/help' },
      { name: 'Documentação', href: '/docs' },
      { name: 'Status do Sistema', href: '/status' },
      { name: 'Reportar Bug', href: '/report' }
    ],
    legal: [
      { name: 'Privacidade', href: '/privacy' },
      { name: 'Termos de Uso', href: '/terms' },
      { name: 'Cookies', href: '/cookies' },
      { name: 'LGPD', href: '/lgpd' }
    ]
  }

  const socialLinks = [
    { name: 'Twitter', href: 'https://twitter.com/echonow', icon: Twitter },
    { name: 'GitHub', href: 'https://github.com/echonow', icon: Github },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/echonow', icon: Linkedin },
    { name: 'Email', href: 'mailto:contato@echonow.com', icon: Mail }
  ]

  return (
    <footer className="bg-background border-t border-border">
      {/* Main Footer Content */}
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="h-8 w-8 text-echo-cyan" />
              <span className="text-2xl font-bold font-space-grotesk bg-gradient-to-r from-echo-cyan to-echo-amber bg-clip-text text-transparent">
                EchoNow
              </span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Repercussão inteligente sem viés. Transformando informação em conhecimento contextualizado através de IA avançada.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="text-muted-foreground hover:text-echo-cyan transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="sr-only">{social.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Produto</h3>
            <ul className="space-y-2">
              {navigation.product.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Premium */}
          <div>
            <h3 className="font-semibold mb-4">Premium</h3>
            <ul className="space-y-2">
              {navigation.premium.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2">
              {navigation.support.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="max-w-md">
            <h3 className="font-semibold mb-2">Fique por dentro</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Receba as últimas análises e descobertas diretamente no seu email.
            </p>
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="seu@email.com"
                className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-echo-cyan"
              />
              <button className="px-4 py-2 bg-echo-cyan text-white rounded-md hover:bg-echo-cyan/90 transition-colors text-sm font-medium">
                Inscrever
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>© {currentYear} EchoNow. Todos os direitos reservados.</span>
              <div className="hidden md:flex items-center space-x-1">
                <span>Feito com</span>
                <Heart className="h-4 w-4 text-red-500" />
                <span>no Brasil</span>
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-6 text-sm">
              {navigation.legal.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-muted/30 border-t border-border">
        <div className="container px-4 py-4">
          <div className="flex flex-wrap justify-center items-center space-x-8 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4" />
              <span>LGPD Compliant</span>
            </div>
            <div className="flex items-center space-x-1">
              <Globe className="h-4 w-4" />
              <span>Carbon Neutral</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>Open Source</span>
            </div>
            <div className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>ISO 27001</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}