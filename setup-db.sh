#!/bin/bash

# EchoNow Database Setup Script
echo "🚀 Setting up EchoNow database..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your database credentials before continuing."
    echo "💡 For local development, you can use: postgresql://username:password@localhost:5432/echonow"
    echo "💡 For Supabase, get your connection string from the Supabase dashboard."
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "^DATABASE_URL=" .env.local || grep -q "^DATABASE_URL=\"postgresql://username:password@localhost:5432/echonow\"" .env.local; then
    echo "⚠️  Please set your DATABASE_URL in .env.local before running this script."
    exit 1
fi

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Create and apply migrations
echo "🗃️  Setting up database schema..."
npx prisma db push

# Seed the database
echo "🌱 Seeding database with initial data..."
npm run db:seed

echo "✅ Database setup completed!"
echo ""
echo "📊 You can now:"
echo "   - Run the development server: npm run dev"
echo "   - View the database: npm run db:studio"
echo "   - Reset database: npm run db:reset"
echo ""
echo "🎉 EchoNow is ready to go!"