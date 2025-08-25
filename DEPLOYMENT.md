# EchoNow Deployment Guide

This guide provides comprehensive instructions for deploying the EchoNow platform to various environments including Vercel, Railway, and Docker-based deployments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Database Setup](#database-setup)
4. [Vercel Deployment](#vercel-deployment)
5. [Railway Deployment](#railway-deployment)
6. [Docker Deployment](#docker-deployment)
7. [Local Development](#local-development)
8. [Post-Deployment Setup](#post-deployment-setup)
9. [Monitoring and Maintenance](#monitoring-and-maintenance)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Git repository setup
- Domain name (optional, for custom domains)

### Required Accounts
- [Vercel](https://vercel.com) or [Railway](https://railway.app) account
- [OpenAI API](https://platform.openai.com) account
- [ElevenLabs](https://elevenlabs.io) account
- [Stripe](https://stripe.com) account
- [Google OAuth](https://console.developers.google.com) (optional)
- [GitHub OAuth](https://github.com/settings/developers) (optional)

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/echonow"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# AI Services
OPENAI_API_KEY="sk-..."
ELEVENLABS_API_KEY="your-elevenlabs-key"

# Stripe Payment Processing
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Optional: Redis for caching
REDIS_URL="redis://localhost:6379"
```

### Environment Variable Descriptions

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js sessions | Yes |
| `NEXTAUTH_URL` | Base URL of your application | Yes |
| `OPENAI_API_KEY` | OpenAI API key for content generation | Yes |
| `ELEVENLABS_API_KEY` | ElevenLabs API key for voice synthesis | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key for payments | Yes |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook endpoint secret | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | No |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | No |

## Database Setup

### 1. Create Database

**Local PostgreSQL:**
```bash
createdb echonow
```

**Cloud PostgreSQL (Recommended):**
- [Supabase](https://supabase.com) (Free tier available)
- [Planet Scale](https://planetscale.com)
- [Neon](https://neon.tech)
- [Railway](https://railway.app) PostgreSQL

### 2. Run Migrations

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed the database (optional)
npx prisma db seed
```

## Vercel Deployment

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login and Configure

```bash
# Login to Vercel
vercel login

# Link your project
vercel link
```

### 3. Set Environment Variables

```bash
# Set all required environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add OPENAI_API_KEY
vercel env add ELEVENLABS_API_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_PUBLISHABLE_KEY
vercel env add STRIPE_WEBHOOK_SECRET

# Optional OAuth variables
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add GITHUB_CLIENT_ID
vercel env add GITHUB_CLIENT_SECRET
```

### 4. Deploy

```bash
# Deploy to production
vercel --prod
```

### 5. Configure Domain (Optional)

```bash
# Add custom domain
vercel domains add yourdomain.com
```

## Railway Deployment

### 1. Install Railway CLI

```bash
npm install -g @railway/cli
```

### 2. Login and Initialize

```bash
# Login to Railway
railway login

# Initialize project
railway init
```

### 3. Add PostgreSQL Service

```bash
# Add PostgreSQL database
railway add postgresql
```

### 4. Set Environment Variables

```bash
# Set environment variables
railway variables set NEXTAUTH_SECRET=your-secret-key
railway variables set OPENAI_API_KEY=sk-...
railway variables set ELEVENLABS_API_KEY=your-key
railway variables set STRIPE_SECRET_KEY=sk_test_...
railway variables set STRIPE_PUBLISHABLE_KEY=pk_test_...
railway variables set STRIPE_WEBHOOK_SECRET=whsec_...

# OAuth variables (optional)
railway variables set GOOGLE_CLIENT_ID=your-google-id
railway variables set GOOGLE_CLIENT_SECRET=your-google-secret
railway variables set GITHUB_CLIENT_ID=your-github-id
railway variables set GITHUB_CLIENT_SECRET=your-github-secret
```

### 5. Deploy

```bash
# Deploy to Railway
railway up
```

## Docker Deployment

### 1. Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f web

# Stop services
docker-compose down
```

### 2. Production Docker Deployment

```bash
# Build production image
docker build -t echonow:latest .

# Run with environment file
docker run -d \
  --name echonow \
  --env-file .env.production \
  -p 3000:3000 \
  echonow:latest
```

### 3. Kubernetes Deployment (Advanced)

Create Kubernetes manifests in `k8s/` directory:

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: echonow
spec:
  replicas: 3
  selector:
    matchLabels:
      app: echonow
  template:
    metadata:
      labels:
        app: echonow
    spec:
      containers:
      - name: echonow
        image: echonow:latest
        ports:
        - containerPort: 3000
        envFrom:
        - secretRef:
            name: echonow-secrets
```

## Local Development

### 1. Clone and Install

```bash
# Clone repository
git clone <your-repo-url>
cd echonow

# Install dependencies
npm install
```

### 2. Setup Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values
```

### 3. Setup Database

```bash
# Start local PostgreSQL (if using Docker)
docker-compose up -d db

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed
```

### 4. Start Development Server

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### 5. Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

## Post-Deployment Setup

### 1. Stripe Webhook Configuration

1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 2. OAuth Provider Configuration

**Google OAuth:**
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`

**GitHub OAuth:**
1. Go to GitHub Settings > Developer settings
2. Create OAuth App
3. Set callback URL: `https://yourdomain.com/api/auth/callback/github`

### 3. Domain and SSL Setup

- Configure DNS records to point to your deployment
- SSL certificates are automatically provided by Vercel/Railway
- For custom deployments, use Let's Encrypt or CloudFlare

## Monitoring and Maintenance

### 1. Application Monitoring

**Vercel:**
- Built-in analytics and error tracking
- Function logs and performance metrics

**Railway:**
- Application metrics and logs
- Resource usage monitoring

### 2. Database Monitoring

```bash
# Check database status
npx prisma migrate status

# View database in Prisma Studio
npx prisma studio
```

### 3. Health Checks

Create health check endpoints:

```typescript
// pages/api/health.ts
export default function handler(req: NextRequest) {
  return NextResponse.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
}
```

### 4. Backup Strategy

**Database Backups:**
```bash
# Create backup
pg_dump $DATABASE_URL > backup.sql

# Restore backup
psql $DATABASE_URL < backup.sql
```

## Troubleshooting

### Common Issues

**1. Database Connection Errors**
```bash
# Check database URL format
echo $DATABASE_URL

# Test connection
npx prisma db pull
```

**2. Build Failures**
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules && npm install

# Check TypeScript errors
npm run type-check
```

**3. Environment Variables Not Loading**
```bash
# Verify environment file exists
ls -la .env*

# Check variable names (no spaces)
cat .env.local
```

**4. Stripe Webhook Issues**
```bash
# Test webhook locally with Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**5. Authentication Problems**
```bash
# Verify NextAuth configuration
# Check NEXTAUTH_URL matches deployment URL
# Ensure NEXTAUTH_SECRET is set and consistent
```

### Performance Optimization

**1. Database Optimization**
```sql
-- Add database indexes
CREATE INDEX idx_articles_created_at ON "Article"("createdAt");
CREATE INDEX idx_articles_category ON "Article"("category");
```

**2. Caching Strategy**
```typescript
// Add Redis caching for frequently accessed data
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)
```

**3. Image Optimization**
- Use Next.js Image component
- Configure image domains in `next.config.js`
- Consider CDN for static assets

### Security Checklist

- [ ] All environment variables are properly secured
- [ ] Database uses SSL connections
- [ ] API routes have proper authentication
- [ ] CORS is properly configured
- [ ] Rate limiting is implemented
- [ ] Input validation is in place
- [ ] Dependencies are regularly updated

## Support

For deployment issues:
1. Check this documentation
2. Review application logs
3. Verify environment configuration
4. Test database connectivity
5. Check external service status (OpenAI, Stripe, etc.)

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)