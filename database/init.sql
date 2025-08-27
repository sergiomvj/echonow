-- EchoNow PostgreSQL Database Initialization
-- This script creates the database structure for EchoNow application
-- Generated from Prisma schema

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password TEXT,
    avatar TEXT,
    subscription TEXT DEFAULT 'free' CHECK (subscription IN ('free', 'premium', 'pro')),
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'creator', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Stripe-related fields
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    subscription_status TEXT,
    subscription_current_period_end TIMESTAMP WITH TIME ZONE
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    article_count INTEGER DEFAULT 0
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    author TEXT NOT NULL,
    author_type TEXT NOT NULL CHECK (author_type IN ('ai', 'human')),
    bias_score REAL DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    source_url TEXT,
    image_url TEXT,
    read_time INTEGER NOT NULL, -- in minutes
    is_exclusive BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Relations
    author_id TEXT REFERENCES users(id) ON DELETE SET NULL
);

-- Create shorts table
CREATE TABLE IF NOT EXISTS shorts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    duration INTEGER NOT NULL, -- in seconds
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Relations
    article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE
);

-- Create historical_comparisons table
CREATE TABLE IF NOT EXISTS historical_comparisons (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    year INTEGER NOT NULL,
    relevance_score REAL NOT NULL,
    source_url TEXT,
    
    -- Relations
    article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE
);

-- Create topic_suggestions table
CREATE TABLE IF NOT EXISTS topic_suggestions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    votes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in-progress')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Relations
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    type TEXT NOT NULL CHECK (type IN ('up', 'down')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Relations
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    suggestion_id TEXT NOT NULL REFERENCES topic_suggestions(id) ON DELETE CASCADE,
    
    -- Ensure unique vote per user per suggestion
    UNIQUE(user_id, suggestion_id)
);

-- Create reactions table
CREATE TABLE IF NOT EXISTS reactions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    type TEXT NOT NULL CHECK (type IN ('like', 'share', 'save', 'bias-report')),
    content_type TEXT NOT NULL CHECK (content_type IN ('article', 'short')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Relations
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    article_id TEXT REFERENCES articles(id) ON DELETE CASCADE,
    short_id TEXT REFERENCES shorts(id) ON DELETE CASCADE,
    
    -- Ensure unique reaction per user per content
    UNIQUE(user_id, article_id, type),
    UNIQUE(user_id, short_id, type)
);

-- Create ai_prompts table
CREATE TABLE IF NOT EXISTS ai_prompts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('article', 'short', 'analysis')),
    is_public BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Relations
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_views INTEGER DEFAULT 0,
    total_shares INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    user_growth INTEGER DEFAULT 0,
    
    -- Ensure unique analytics per date
    UNIQUE(date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at);
CREATE INDEX IF NOT EXISTS idx_articles_view_count ON articles(view_count);
CREATE INDEX IF NOT EXISTS idx_articles_is_exclusive ON articles(is_exclusive);

CREATE INDEX IF NOT EXISTS idx_shorts_article_id ON shorts(article_id);
CREATE INDEX IF NOT EXISTS idx_shorts_category ON shorts(category);
CREATE INDEX IF NOT EXISTS idx_shorts_created_at ON shorts(created_at);

CREATE INDEX IF NOT EXISTS idx_historical_comparisons_article_id ON historical_comparisons(article_id);

CREATE INDEX IF NOT EXISTS idx_topic_suggestions_user_id ON topic_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_topic_suggestions_status ON topic_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_topic_suggestions_created_at ON topic_suggestions(created_at);

CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_suggestion_id ON votes(suggestion_id);

CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_article_id ON reactions(article_id);
CREATE INDEX IF NOT EXISTS idx_reactions_short_id ON reactions(short_id);

CREATE INDEX IF NOT EXISTS idx_ai_prompts_user_id ON ai_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_type ON ai_prompts(type);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_is_public ON ai_prompts(is_public);

-- Insert initial categories
INSERT INTO categories (name, slug, description, icon, color, article_count) VALUES
    ('Política', 'politica', 'Análises políticas nacionais e internacionais', '🏛️', '#FF6B6B', 0),
    ('Economia', 'economia', 'Mercados, finanças e análises econômicas', '📈', '#4ECDC4', 0),
    ('Tecnologia', 'tecnologia', 'Inovações e tendências tecnológicas', '🚀', '#45B7D1', 0),
    ('Meio Ambiente', 'meio-ambiente', 'Sustentabilidade e mudanças climáticas', '🌱', '#96CEB4', 0),
    ('Saúde', 'saude', 'Medicina, pesquisas e saúde pública', '🏥', '#FFEAA7', 0),
    ('Cultura', 'cultura', 'Arte, entretenimento e sociedade', '🎭', '#DDA0DD', 0)
ON CONFLICT (slug) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ EchoNow database initialized successfully!';
    RAISE NOTICE 'Tables created: users, categories, articles, shorts, historical_comparisons, topic_suggestions, votes, reactions, ai_prompts, analytics';
    RAISE NOTICE 'Indexes and triggers created for optimal performance';
END $$;