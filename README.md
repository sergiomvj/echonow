# EchoNow - Repercussão Inteligente sem Viés

Uma plataforma digital que repercute e aprofunda fatos, notícias e acontecimentos relevantes de forma não ideológica, com linguagem acessível, visão plural e abordagem atemporal.

## 🚀 Características Principais

- **Conteúdo Interpretativo**: Análises contextualizadas sem ideologias
- **IA Avançada**: Geração automática de artigos, shorts e análises
- **Interface Moderna**: Design responsivo com modo escuro/claro
- **Comparações Históricas**: Contextualização com eventos do passado
- **Filtro de Viés**: Sistema que identifica possíveis inclinações
- **Comunidade Ativa**: Curadoria colaborativa e participação

## 🎯 Funcionalidades

### Páginas Principais
- **Home**: Destaques gerados automaticamente
- **Explorar**: Navegação por categorias e filtros avançados
- **Editor Virtual**: Criação de conteúdos personalizados com IA
- **Reels & Shorts**: Galeria de vídeos rápidos
- **Linha do Tempo**: Repercussão cronológica de fatos
- **Participar**: Área para sugestões e votação da comunidade
- **Painel do Criador**: Para editores e parceiros
- **Premium**: Recursos exclusivos para assinantes

### Recursos Inteligentes
- 🧠 **IA Redatora**: Cria artigos baseados em links ou resumos
- 📹 **Gerador de Shorts**: Transforma artigos em vídeos curtos
- 🧭 **Análises Cruzadas**: Comparações com momentos históricos
- 💬 **Curadoria Colaborativa**: Usuários podem sugerir correções
- 🧠 **Filtro de Viés**: Pontua conteúdos com possíveis inclinações
- 🪄 **Prompt Customizado**: Criação de conteúdo via comando (Premium)

## 🛠️ Tecnologias

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Animações**: Framer Motion
- **Componentes**: Radix UI + Lucide Icons
- **Banco de Dados**: Supabase + Prisma ORM
- **IA**: OpenAI/Mistral + ElevenLabs (voz)
- **Pagamentos**: Stripe
- **Deploy**: Vercel/Railway

## 📦 Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd echonow

# Instale as dependências
npm install
# ou
yarn install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves

# Execute o projeto
npm run dev
# ou
yarn dev
```

## 🎨 Design System

### Paleta de Cores
- **Fundo**: `#1C1C1E` (preto suave)
- **Primária**: `#04D9FF` (ciano neon)
- **Secundária**: `#F9A825` (âmbar vibrante)
- **Texto Principal**: `#FFFFFF` (branco)
- **Texto Secundário**: `#B0BEC5` (cinza claro)

### Fontes
- **Títulos**: Space Grotesk
- **Corpo**: Inter
- **Destaques**: Archivo Black

## 💰 Modelos de Monetização

### Planos
- **Free**: Acesso básico a artigos e shorts
- **Premium** (R$ 19/mês): IA limitada + filtros + downloads
- **Pro** (R$ 49/mês): IA ilimitada + prompts personalizados

### Outras Receitas
- Ads moderados e relevantes
- Licenciamento B2B
- Doações (Buy Me a Coffee)
- Gamificação com pontos
- Marketplace de vozes IA

## 🚀 Deploy

```bash
# Build do projeto
npm run build

# Deploy na Vercel
vercel deploy

# Deploy no Railway
railway up
```

## 📝 Variáveis de Ambiente

```env
# Database
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=

# AI Services
OPENAI_API_KEY=
ELEVENLABS_API_KEY=

# Authentication
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Payment
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**EchoNow** - Construindo um mundo mais informado, uma análise por vez. 🌍✨