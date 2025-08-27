import { db } from '@/lib/db'
import { PrismaClient } from '@prisma/client'

/**
 * Database Management Utility for EchoNow
 * Provides common database operations and maintenance tasks
 */
export class DatabaseManager {
  private db: PrismaClient

  constructor() {
    this.db = db
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.db.$queryRaw`SELECT 1`
      console.log('✅ Database connection successful')
      return true
    } catch (error) {
      console.error('❌ Database connection failed:', error)
      return false
    }
  }

  /**
   * Get database statistics
   */
  async getStats() {
    try {
      const [
        users,
        articles,
        shorts,
        categories,
        suggestions,
        reactions
      ] = await Promise.all([
        this.db.user.count(),
        this.db.article.count(),
        this.db.short.count(),
        this.db.category.count(),
        this.db.topicSuggestion.count(),
        this.db.reaction.count()
      ])

      return {
        users,
        articles,
        shorts,
        categories,
        suggestions,
        reactions,
        totalContent: articles + shorts
      }
    } catch (error) {
      console.error('❌ Error getting database stats:', error)
      throw error
    }
  }

  /**
   * Initialize database with default data
   */
  async seedDatabase() {
    try {
      console.log('🌱 Seeding database...')

      // Categories
      const categories = [
        {
          name: 'Política',
          slug: 'politica',
          description: 'Análises políticas nacionais e internacionais',
          icon: '🏛️',
          color: '#FF6B6B',
          articleCount: 0
        },
        {
          name: 'Economia',
          slug: 'economia',
          description: 'Mercados, finanças e análises econômicas',
          icon: '📈',
          color: '#4ECDC4',
          articleCount: 0
        },
        {
          name: 'Tecnologia',
          slug: 'tecnologia',
          description: 'Inovações e tendências tecnológicas',
          icon: '🚀',
          color: '#45B7D1',
          articleCount: 0
        },
        {
          name: 'Meio Ambiente',
          slug: 'meio-ambiente',
          description: 'Sustentabilidade e mudanças climáticas',
          icon: '🌱',
          color: '#96CEB4',
          articleCount: 0
        },
        {
          name: 'Saúde',
          slug: 'saude',
          description: 'Medicina, pesquisas e saúde pública',
          icon: '🏥',
          color: '#FFEAA7',
          articleCount: 0
        },
        {
          name: 'Cultura',
          slug: 'cultura',
          description: 'Arte, entretenimento e sociedade',
          icon: '🎭',
          color: '#DDA0DD',
          articleCount: 0
        }
      ]

      for (const category of categories) {
        await this.db.category.upsert({
          where: { slug: category.slug },
          update: category,
          create: category
        })
      }

      console.log('✅ Categories seeded successfully')

      // Create analytics entry for today
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      await this.db.analytics.upsert({
        where: { date: today },
        update: {},
        create: {
          date: today,
          totalViews: 0,
          totalShares: 0,
          totalLikes: 0,
          userGrowth: 0
        }
      })

      console.log('✅ Analytics initialized')
      console.log('✅ Database seeded successfully')
    } catch (error) {
      console.error('❌ Error seeding database:', error)
      throw error
    }
  }

  /**
   * Reset database (development only)
   */
  async resetDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot reset database in production environment')
    }

    try {
      console.log('🗑️  Resetting database...')

      // Delete in order to respect foreign key constraints
      await this.db.reaction.deleteMany()
      await this.db.vote.deleteMany()
      await this.db.aiPrompt.deleteMany()
      await this.db.topicSuggestion.deleteMany()
      await this.db.historicalComparison.deleteMany()
      await this.db.short.deleteMany()
      await this.db.article.deleteMany()
      await this.db.category.deleteMany()
      await this.db.user.deleteMany()
      await this.db.analytics.deleteMany()

      console.log('✅ Database reset successfully')
    } catch (error) {
      console.error('❌ Error resetting database:', error)
      throw error
    }
  }

  /**
   * Update article counts for categories
   */
  async updateCategoryArticleCounts() {
    try {
      console.log('📊 Updating category article counts...')

      const categories = await this.db.category.findMany()
      
      for (const category of categories) {
        const count = await this.db.article.count({
          where: { category: category.name }
        })

        await this.db.category.update({
          where: { id: category.id },
          data: { articleCount: count }
        })
      }

      console.log('✅ Category article counts updated')
    } catch (error) {
      console.error('❌ Error updating category counts:', error)
      throw error
    }
  }

  /**
   * Clean up old analytics data (keep last 90 days)
   */
  async cleanupAnalytics() {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - 90)

      const deleted = await this.db.analytics.deleteMany({
        where: {
          date: {
            lt: cutoffDate
          }
        }
      })

      console.log(`✅ Cleaned up ${deleted.count} old analytics records`)
    } catch (error) {
      console.error('❌ Error cleaning up analytics:', error)
      throw error
    }
  }

  /**
   * Backup database (export essential data)
   */
  async exportData() {
    try {
      console.log('📦 Exporting database data...')

      const data = {
        timestamp: new Date().toISOString(),
        categories: await this.db.category.findMany(),
        users: await this.db.user.findMany({
          select: {
            id: true,
            email: true,
            name: true,
            subscription: true,
            role: true,
            createdAt: true
          }
        }),
        articles: await this.db.article.findMany({
          include: {
            shorts: true,
            historicalComparisons: true
          }
        }),
        topicSuggestions: await this.db.topicSuggestion.findMany({
          include: {
            userVotes: true
          }
        })
      }

      return data
    } catch (error) {
      console.error('❌ Error exporting data:', error)
      throw error
    }
  }

  /**
   * Close database connection
   */
  async disconnect() {
    await this.db.$disconnect()
    console.log('✅ Database connection closed')
  }
}

export const dbManager = new DatabaseManager()