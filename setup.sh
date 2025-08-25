#!/bin/bash

echo "🚀 Setting up EchoNow project..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Download from: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env.local from example
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from example..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your actual environment variables"
fi

echo "🎉 Setup complete!"
echo ""
echo "🚀 To start the development server:"
echo "   npm run dev"
echo ""
echo "📖 Then open http://localhost:3000 in your browser"
echo ""
echo "⚙️  Don't forget to:"
echo "   1. Update .env.local with your API keys"
echo "   2. Set up your Supabase database"
echo "   3. Configure your AI service keys"