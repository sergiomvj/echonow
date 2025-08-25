import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Database helper functions
export async function seedDatabase() {
  try {
    // Seed categories
    const categories = [
      {
        name: 'Política',
        slug: 'politica',
        description: 'Análises políticas nacionais e internacionais',
        icon: '🏛️',
        color: '#FF6B6B',
        articleCount: 127
      },
      {
        name: 'Economia',
        slug: 'economia',
        description: 'Mercados, finanças e análises econômicas',
        icon: '📈',
        color: '#4ECDC4',
        articleCount: 89
      },
      {
        name: 'Tecnologia',
        slug: 'tecnologia',
        description: 'Inovações e tendências tecnológicas',
        icon: '🚀',
        color: '#45B7D1',
        articleCount: 156
      },
      {
        name: 'Meio Ambiente',
        slug: 'meio-ambiente',
        description: 'Sustentabilidade e mudanças climáticas',
        icon: '🌱',
        color: '#96CEB4',
        articleCount: 67
      },
      {
        name: 'Saúde',
        slug: 'saude',
        description: 'Medicina, pesquisas e saúde pública',
        icon: '🏥',
        color: '#FFEAA7',
        articleCount: 93
      },
      {
        name: 'Cultura',
        slug: 'cultura',
        description: 'Arte, entretenimento e sociedade',
        icon: '🎭',
        color: '#DDA0DD',
        articleCount: 74
      }
    ]

    for (const category of categories) {
      await db.category.upsert({
        where: { slug: category.slug },
        update: category,
        create: category
      })
    }

    console.log('✅ Database seeded successfully')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

export async function resetDatabase() {
  try {
    await db.reaction.deleteMany()
    await db.vote.deleteMany()
    await db.aiPrompt.deleteMany()
    await db.topicSuggestion.deleteMany()
    await db.historicalComparison.deleteMany()
    await db.short.deleteMany()
    await db.article.deleteMany()
    await db.category.deleteMany()
    await db.user.deleteMany()
    await db.analytics.deleteMany()
    
    console.log('✅ Database reset successfully')
  } catch (error) {
    console.error('❌ Error resetting database:', error)
    throw error
  }
}

export async function getDbStats() {
  try {
    const stats = {
      users: await db.user.count(),
      articles: await db.article.count(),
      shorts: await db.short.count(),
      categories: await db.category.count(),
      suggestions: await db.topicSuggestion.count(),
      reactions: await db.reaction.count()
    }
    
    return stats
  } catch (error) {
    console.error('❌ Error getting database stats:', error)
    throw error
  }
}

// Database connection test
export async function testConnection() {
  try {
    await db.$queryRaw`SELECT 1`
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}