import { Article, Short, Category, HistoricalComparison } from '@/types'

export const sampleCategories: Category[] = [
  {
    id: '1',
    name: 'Política',
    slug: 'politica',
    description: 'Análises políticas nacionais e internacionais',
    icon: '🏛️',
    color: '#FF6B6B',
    articleCount: 127
  },
  {
    id: '2',
    name: 'Economia',
    slug: 'economia',
    description: 'Mercados, finanças e análises econômicas',
    icon: '📈',
    color: '#4ECDC4',
    articleCount: 89
  },
  {
    id: '3',
    name: 'Tecnologia',
    slug: 'tecnologia',
    description: 'Inovações e tendências tecnológicas',
    icon: '🚀',
    color: '#45B7D1',
    articleCount: 156
  },
  {
    id: '4',
    name: 'Meio Ambiente',
    slug: 'meio-ambiente',
    description: 'Sustentabilidade e mudanças climáticas',
    icon: '🌱',
    color: '#96CEB4',
    articleCount: 67
  },
  {
    id: '5',
    name: 'Saúde',
    slug: 'saude',
    description: 'Medicina, pesquisas e saúde pública',
    icon: '🏥',
    color: '#FFEAA7',
    articleCount: 93
  },
  {
    id: '6',
    name: 'Cultura',
    slug: 'cultura',
    description: 'Arte, entretenimento e sociedade',
    icon: '🎭',
    color: '#DDA0DD',
    articleCount: 74
  }
]

export const sampleArticles: Article[] = [
  {
    id: '1',
    title: 'IA Revoluciona Diagnósticos Médicos: O Futuro da Medicina Chegou?',
    content: 'A inteligência artificial está transformando radicalmente a medicina...',
    summary: 'Novos algoritmos de IA conseguem detectar doenças com precisão superior a médicos especialistas, prometendo revolucionar diagnósticos.',
    category: 'Tecnologia',
    tags: ['IA', 'Medicina', 'Inovação', 'Saúde'],
    author: 'EchoNow AI',
    authorType: 'ai',
    biasScore: 0.15,
    viewCount: 12500,
    likes: 347,
    shares: 89,
    sourceUrl: 'https://example.com/ai-medicina',
    imageUrl: '/api/placeholder/600/400',
    readTime: 8,
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
    isExclusive: false,
    historicalComparison: [
      {
        id: '1',
        title: 'Descoberta dos Raios-X',
        description: 'Em 1895, a descoberta dos raios-X revolucionou o diagnóstico médico',
        year: 1895,
        relevanceScore: 0.85,
        sourceUrl: 'https://example.com/raios-x'
      }
    ]
  },
  {
    id: '2',
    title: 'Crise Energética Global: Lições do Passado Para o Presente',
    content: 'A atual crise energética mundial ecoa eventos históricos similares...',
    summary: 'Análise comparativa entre a crise energética atual e crises históricas revela padrões importantes para políticas futuras.',
    category: 'Economia',
    tags: ['Energia', 'Crise', 'História', 'Geopolítica'],
    author: 'EchoNow AI',
    authorType: 'ai',
    biasScore: 0.28,
    viewCount: 8900,
    likes: 234,
    shares: 67,
    sourceUrl: 'https://example.com/crise-energetica',
    imageUrl: '/api/placeholder/600/400',
    readTime: 12,
    createdAt: new Date('2024-01-14T15:45:00Z'),
    updatedAt: new Date('2024-01-14T15:45:00Z'),
    isExclusive: false,
    historicalComparison: [
      {
        id: '2',
        title: 'Crise do Petróleo de 1973',
        description: 'O embargo do petróleo pelos países árabes causou uma crise energética global',
        year: 1973,
        relevanceScore: 0.92,
        sourceUrl: 'https://example.com/crise-1973'
      }
    ]
  },
  {
    id: '3',
    title: 'Mudanças Climáticas: O Que os Dados Não Contam',
    content: 'Além dos números sobre aquecimento global, existe uma narrativa mais complexa...',
    summary: 'Investigação aprofundada sobre aspectos menos discutidos das mudanças climáticas e seus impactos socioeconomicos.',
    category: 'Meio Ambiente',
    tags: ['Clima', 'Sustentabilidade', 'Dados', 'Sociedade'],
    author: 'Dr. Maria Silva',
    authorType: 'human',
    biasScore: 0.22,
    viewCount: 15600,
    likes: 456,
    shares: 123,
    sourceUrl: 'https://example.com/mudancas-climaticas',
    imageUrl: '/api/placeholder/600/400',
    readTime: 15,
    createdAt: new Date('2024-01-13T09:20:00Z'),
    updatedAt: new Date('2024-01-13T09:20:00Z'),
    isExclusive: true,
    historicalComparison: [
      {
        id: '3',
        title: 'Revolução Industrial',
        description: 'O início da era industrial marcou o começo das emissões em massa de CO2',
        year: 1760,
        relevanceScore: 0.78,
        sourceUrl: 'https://example.com/revolucao-industrial'
      }
    ]
  },
  {
    id: '4',
    title: 'Eleições 2024: Análise Isenta dos Principais Candidatos',
    content: 'Uma análise objetiva das propostas eleitorais sem viés partidário...',
    summary: 'Comparação imparcial das propostas dos principais candidatos, focando em dados e histórico político.',
    category: 'Política',
    tags: ['Eleições', 'Análise', 'Democracia', 'Propostas'],
    author: 'EchoNow AI',
    authorType: 'ai',
    biasScore: 0.08,
    viewCount: 22300,
    likes: 567,
    shares: 189,
    sourceUrl: 'https://example.com/eleicoes-2024',
    imageUrl: '/api/placeholder/600/400',
    readTime: 20,
    createdAt: new Date('2024-01-12T14:15:00Z'),
    updatedAt: new Date('2024-01-12T14:15:00Z'),
    isExclusive: false
  },
  {
    id: '5',
    title: 'O Boom das Criptomoedas: Bolha ou Revolução Financeira?',
    content: 'O mercado de criptomoedas continua volátil, mas qual é a verdadeira tendência?...',
    summary: 'Análise técnica e histórica do mercado cripto, comparando com outras bolhas financeiras do passado.',
    category: 'Economia',
    tags: ['Crypto', 'Blockchain', 'Finanças', 'Inovação'],
    author: 'EchoNow AI',
    authorType: 'ai',
    biasScore: 0.35,
    viewCount: 9800,
    likes: 298,
    shares: 76,
    sourceUrl: 'https://example.com/criptomoedas',
    imageUrl: '/api/placeholder/600/400',
    readTime: 10,
    createdAt: new Date('2024-01-11T11:30:00Z'),
    updatedAt: new Date('2024-01-11T11:30:00Z'),
    isExclusive: false
  },
  {
    id: '6',
    title: 'Inteligência Artificial na Arte: Criatividade ou Imitação?',
    content: 'O debate sobre IA gerativa na arte levanta questões sobre autoria e criatividade...',
    summary: 'Discussão sobre o impacto da IA na produção artística e o futuro da criatividade humana.',
    category: 'Cultura',
    tags: ['IA', 'Arte', 'Criatividade', 'Tecnologia'],
    author: 'Prof. João Santos',
    authorType: 'human',
    biasScore: 0.18,
    viewCount: 7400,
    likes: 189,
    shares: 45,
    sourceUrl: 'https://example.com/ia-arte',
    imageUrl: '/api/placeholder/600/400',
    readTime: 7,
    createdAt: new Date('2024-01-10T16:45:00Z'),
    updatedAt: new Date('2024-01-10T16:45:00Z'),
    isExclusive: false
  }
]

export const sampleShorts: Short[] = [
  {
    id: '1',
    title: 'IA vs Médicos: Quem Diagnostica Melhor?',
    description: 'Comparação rápida entre diagnósticos de IA e especialistas humanos',
    videoUrl: '/api/placeholder/video/short1.mp4',
    thumbnailUrl: '/api/placeholder/400/600',
    duration: 60,
    articleId: '1',
    category: 'Tecnologia',
    tags: ['IA', 'Medicina'],
    viewCount: 45600,
    likes: 1200,
    shares: 340,
    createdAt: new Date('2024-01-15T11:00:00Z')
  },
  {
    id: '2',
    title: 'Crise Energética: 1973 vs 2024',
    description: 'Paralelos históricos da crise energética atual',
    videoUrl: '/api/placeholder/video/short2.mp4',
    thumbnailUrl: '/api/placeholder/400/600',
    duration: 45,
    articleId: '2',
    category: 'Economia',
    tags: ['Energia', 'História'],
    viewCount: 32100,
    likes: 890,
    shares: 245,
    createdAt: new Date('2024-01-14T16:15:00Z')
  },
  {
    id: '3',
    title: 'Mudanças Climáticas em 60 Segundos',
    description: 'Os dados que você precisa saber sobre o clima',
    videoUrl: '/api/placeholder/video/short3.mp4',
    thumbnailUrl: '/api/placeholder/400/600',
    duration: 58,
    articleId: '3',
    category: 'Meio Ambiente',
    tags: ['Clima', 'Dados'],
    viewCount: 67800,
    likes: 2100,
    shares: 567,
    createdAt: new Date('2024-01-13T10:30:00Z')
  }
]