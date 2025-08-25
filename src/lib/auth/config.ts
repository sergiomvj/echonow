import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { compare } from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'exemplo@echonow.com'
        },
        password: {
          label: 'Senha',
          type: 'password'
        }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios')
        }

        // Find user in database
        const user = await db.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          throw new Error('Credenciais inválidas')
        }

        // Verify password
        const isValid = await compare(credentials.password, user.password)
        
        if (!isValid) {
          throw new Error('Credenciais inválidas')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          subscription: user.subscription,
          role: user.role
        }
      }
    })
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          subscription: user.subscription,
          role: user.role
        }
      }

      // Return previous token if the access token has not expired yet
      return token
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          subscription: token.subscription,
          role: token.role
        }
      }
    },

    async signIn({ user, account, profile }) {
      // Allow OAuth sign-ins
      if (account?.provider !== 'credentials') {
        return true
      }

      // For credentials provider, user is already validated in authorize
      return true
    }
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      // Track sign-in events
      console.log(`User ${user.email} signed in with ${account?.provider}`)
      
      // Update user data if needed
      if (isNewUser && account?.provider !== 'credentials') {
        await db.user.update({
          where: { id: user.id },
          data: {
            subscription: 'free',
            role: 'user'
          }
        })
      }
    },

    async createUser({ user }) {
      console.log(`New user created: ${user.email}`)
      
      // Send welcome email or perform other actions
      // await sendWelcomeEmail(user.email)
    }
  },

  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
  
  debug: process.env.NODE_ENV === 'development',
}

// Type declarations for enhanced session
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      subscription: 'free' | 'premium' | 'pro'
      role: 'user' | 'creator' | 'admin'
    }
  }

  interface User {
    subscription: 'free' | 'premium' | 'pro'
    role: 'user' | 'creator' | 'admin'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    subscription: 'free' | 'premium' | 'pro'
    role: 'user' | 'creator' | 'admin'
  }
}