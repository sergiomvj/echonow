import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create categories
  const categories = [
    {
      id: 'cat-politica',
      name: 'Política',
      slug: 'politica',
      description: 'Análises políticas nacionais e internacionais',
      icon: '🏛️',
      color: '#FF6B6B',
      articleCount: 0
    },
    {
      id: 'cat-economia',
      name: 'Economia',
      slug: 'economia',
      description: 'Mercados, finanças e análises econômicas',
      icon: '📈',
      color: '#4ECDC4',
      articleCount: 0
    },
    {
      id: 'cat-tecnologia',
      name: 'Tecnologia',
      slug: 'tecnologia',
      description: 'Inovações e tendências tecnológicas',
      icon: '🚀',
      color: '#45B7D1',
      articleCount: 0
    },
    {
      id: 'cat-meio-ambiente',
      name: 'Meio Ambiente',
      slug: 'meio-ambiente',
      description: 'Sustentabilidade e mudanças climáticas',
      icon: '🌱',
      color: '#96CEB4',
      articleCount: 0
    },
    {
      id: 'cat-saude',
      name: 'Saúde',
      slug: 'saude',
      description: 'Medicina, pesquisas e saúde pública',
      icon: '🏥',
      color: '#FFEAA7',
      articleCount: 0
    },
    {
      id: 'cat-cultura',
      name: 'Cultura',
      slug: 'cultura',
      description: 'Arte, entretenimento e sociedade',
      icon: '🎭',
      color: '#DDA0DD',
      articleCount: 0
    }
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category
    })
  }

  console.log('✅ Categories created')

  // Create sample user
  const sampleUser = await prisma.user.upsert({
    where: { email: 'editor@echonow.com' },
    update: {},
    create: {
      id: 'user-echonow-editor',
      email: 'editor@echonow.com',
      name: 'Editor EchoNow',
      avatar: '/api/placeholder/100/100',
      subscription: 'pro'
    }
  })

  console.log('✅ Sample user created')

  // Create sample articles
  const sampleArticles = [
    {
      id: 'article-1',
      title: 'IA Revoluciona Diagnósticos Médicos: O Futuro da Medicina Chegou?',
      content: 'A inteligência artificial está transformando radicalmente a medicina, especialmente no campo de diagnósticos. Novos algoritmos de machine learning conseguem detectar doenças com precisão superior a médicos especialistas em algumas áreas específicas...',
      summary: 'Novos algoritmos de IA conseguem detectar doenças com precisão superior a médicos especialistas, prometendo revolucionar diagnósticos.',
      category: 'Tecnologia',
      tags: ['IA', 'Medicina', 'Inovação', 'Saúde'],
      author: 'EchoNow AI',
      authorType: 'ai',
      authorId: sampleUser.id,
      biasScore: 0.15,
      viewCount: 12500,
      likes: 347,
      shares: 89,
      sourceUrl: 'https://example.com/ai-medicina',
      imageUrl: '/api/placeholder/600/400',
      readTime: 8,
      isExclusive: false
    },
    {
      id: 'article-2',
      title: 'Crise Energética Global: Lições do Passado Para o Presente',
      content: 'A atual crise energética mundial ecoa eventos históricos similares, oferecendo insights valiosos para políticas futuras. Uma análise comparativa revela padrões interessantes...',
      summary: 'Análise comparativa entre a crise energética atual e crises históricas revela padrões importantes para políticas futuras.',
      category: 'Economia',
      tags: ['Energia', 'Crise', 'História', 'Geopolítica'],
      author: 'EchoNow AI',
      authorType: 'ai',
      authorId: sampleUser.id,
      biasScore: 0.28,
      viewCount: 8900,
      likes: 234,
      shares: 67,
      sourceUrl: 'https://example.com/crise-energetica',
      imageUrl: '/api/placeholder/600/400',
      readTime: 12,
      isExclusive: false
    },
    {
      id: 'article-3',
      title: 'Mudanças Climáticas: O Que os Dados Não Contam',
      content: 'Além dos números sobre aquecimento global, existe uma narrativa mais complexa que merece atenção. Esta investigação explora aspectos menos discutidos...',
      summary: 'Investigação aprofundada sobre aspectos menos discutidos das mudanças climáticas e seus impactos socioeconomicos.',
      category: 'Meio Ambiente',
      tags: ['Clima', 'Sustentabilidade', 'Dados', 'Sociedade'],
      author: 'Dr. Maria Silva',
      authorType: 'human',
      authorId: sampleUser.id,
      biasScore: 0.22,
      viewCount: 15600,
      likes: 456,
      shares: 123,
      sourceUrl: 'https://example.com/mudancas-climaticas',
      imageUrl: '/api/placeholder/600/400',
      readTime: 15,
      isExclusive: true
    }
  ]

  for (const article of sampleArticles) {
    await prisma.article.upsert({
      where: { id: article.id },
      update: article,
      create: article
    })
  }

  console.log('✅ Sample articles created')

  // Create historical comparisons
  const historicalComparisons = [
    {
      id: 'hist-1',
      title: 'Descoberta dos Raios-X',
      description: 'Em 1895, a descoberta dos raios-X revolucionou o diagnóstico médico',
      year: 1895,
      relevanceScore: 0.85,
      sourceUrl: 'https://example.com/raios-x',
      articleId: 'article-1'
    },
    {
      id: 'hist-2',
      title: 'Crise do Petróleo de 1973',
      description: 'O embargo do petróleo pelos países árabes causou uma crise energética global',
      year: 1973,
      relevanceScore: 0.92,
      sourceUrl: 'https://example.com/crise-1973',
      articleId: 'article-2'
    },
    {
      id: 'hist-3',
      title: 'Revolução Industrial',
      description: 'O início da era industrial marcou o começo das emissões em massa de CO2',
      year: 1760,
      relevanceScore: 0.78,
      sourceUrl: 'https://example.com/revolucao-industrial',
      articleId: 'article-3'
    }
  ]

  for (const comparison of historicalComparisons) {
    await prisma.historicalComparison.upsert({
      where: { id: comparison.id },
      update: comparison,
      create: comparison
    })
  }

  console.log('✅ Historical comparisons created')

  // Create sample shorts
  const sampleShorts = [
    {
      id: 'short-1',
      title: 'IA vs Médicos: Quem Diagnostica Melhor?',
      description: 'Comparação rápida entre diagnósticos de IA e especialistas humanos',
      videoUrl: '/api/placeholder/video/short1.mp4',
      thumbnailUrl: '/api/placeholder/400/600',
      duration: 60,
      articleId: 'article-1',
      category: 'Tecnologia',
      tags: ['IA', 'Medicina'],
      viewCount: 45600,
      likes: 1200,
      shares: 340
    },
    {
      id: 'short-2',
      title: 'Crise Energética: 1973 vs 2024',
      description: 'Paralelos históricos da crise energética atual',
      videoUrl: '/api/placeholder/video/short2.mp4',
      thumbnailUrl: '/api/placeholder/400/600',
      duration: 45,
      articleId: 'article-2',
      category: 'Economia',
      tags: ['Energia', 'História'],
      viewCount: 32100,
      likes: 890,
      shares: 245
    }
  ]

  for (const short of sampleShorts) {
    await prisma.short.upsert({
      where: { id: short.id },
      update: short,
      create: short
    })
  }

  console.log('✅ Sample shorts created')

  // Create sample topic suggestions
  const sampleSuggestions = [
    {
      id: 'suggestion-1',
      title: 'Análise do Impacto da IA na Educação',
      description: 'Como a inteligência artificial está transformando métodos de ensino e aprendizagem',
      votes: 23,
      status: 'pending',
      userId: sampleUser.id
    },
    {
      id: 'suggestion-2',
      title: 'Comparação: Crise Imobiliária 2008 vs Atual',
      description: 'Análise das semelhanças e diferenças entre as crises imobiliárias',
      votes: 15,
      status: 'in-progress',
      userId: sampleUser.id
    }
  ]

  for (const suggestion of sampleSuggestions) {
    await prisma.topicSuggestion.upsert({
      where: { id: suggestion.id },
      update: suggestion,
      create: suggestion
    })
  }

  console.log('✅ Sample topic suggestions created')

  // Update category article counts
  await prisma.category.update({
    where: { slug: 'tecnologia' },
    data: { articleCount: 1 }
  })

  await prisma.category.update({
    where: { slug: 'economia' },
    data: { articleCount: 1 }
  })

  await prisma.category.update({
    where: { slug: 'meio-ambiente' },
    data: { articleCount: 1 }
  })

  console.log('✅ Category counts updated')
  console.log('🎉 Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })