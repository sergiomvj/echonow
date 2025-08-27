#!/bin/bash

# EchoNow PostgreSQL Database Setup Script
# This script sets up a PostgreSQL database for the EchoNow application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default database configuration
DB_NAME="${DB_NAME:-echonow_dev}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-password}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

echo -e "${BLUE}🐘 EchoNow PostgreSQL Setup${NC}"
echo "=================================="

# Function to check if PostgreSQL is installed
check_postgresql() {
    if command -v psql &> /dev/null; then
        echo -e "${GREEN}✅ PostgreSQL is installed${NC}"
        return 0
    else
        echo -e "${RED}❌ PostgreSQL is not installed${NC}"
        echo "Please install PostgreSQL first:"
        echo "  - Windows: Download from https://www.postgresql.org/download/windows/"
        echo "  - macOS: brew install postgresql"
        echo "  - Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
        return 1
    fi
}

# Function to check if PostgreSQL service is running
check_postgresql_service() {
    if pg_isready -h $DB_HOST -p $DB_PORT &> /dev/null; then
        echo -e "${GREEN}✅ PostgreSQL service is running${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  PostgreSQL service is not running${NC}"
        echo "Please start PostgreSQL service:"
        echo "  - Windows: net start postgresql-x64-14 (or your version)"
        echo "  - macOS: brew services start postgresql"
        echo "  - Ubuntu/Debian: sudo systemctl start postgresql"
        return 1
    fi
}

# Function to create database
create_database() {
    echo -e "${BLUE}📦 Creating database: $DB_NAME${NC}"
    
    # Check if database exists
    if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
        echo -e "${YELLOW}⚠️  Database $DB_NAME already exists${NC}"
        read -p "Do you want to recreate it? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            dropdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME
            echo -e "${GREEN}✅ Database $DB_NAME dropped${NC}"
        else
            echo -e "${BLUE}ℹ️  Using existing database${NC}"
            return 0
        fi
    fi
    
    createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME
    echo -e "${GREEN}✅ Database $DB_NAME created successfully${NC}"
}

# Function to setup environment variables
setup_env() {
    echo -e "${BLUE}🔧 Setting up environment variables${NC}"
    
    DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
    
    # Update .env.local if it exists
    if [ -f .env.local ]; then
        # Backup existing .env.local
        cp .env.local .env.local.backup
        
        # Update DATABASE_URL
        if grep -q "DATABASE_URL=" .env.local; then
            sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|g" .env.local
        else
            echo "DATABASE_URL=$DATABASE_URL" >> .env.local
        fi
        
        echo -e "${GREEN}✅ Updated .env.local with database configuration${NC}"
    else
        echo -e "${YELLOW}⚠️  .env.local not found. Please create it with:${NC}"
        echo "DATABASE_URL=$DATABASE_URL"
    fi
}

# Function to run Prisma migrations
run_migrations() {
    echo -e "${BLUE}🚀 Running Prisma migrations${NC}"
    
    # Generate Prisma client
    npx prisma generate
    
    # Push database schema
    npx prisma db push
    
    echo -e "${GREEN}✅ Database schema created successfully${NC}"
}

# Function to seed database
seed_database() {
    echo -e "${BLUE}🌱 Seeding database with initial data${NC}"
    
    if [ -f prisma/seed.ts ]; then
        npm run db:seed
        echo -e "${GREEN}✅ Database seeded successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  No seed file found, skipping seeding${NC}"
    fi
}

# Main setup process
main() {
    echo -e "${BLUE}Starting PostgreSQL setup for EchoNow...${NC}\n"
    
    # Check prerequisites
    if ! check_postgresql; then
        exit 1
    fi
    
    if ! check_postgresql_service; then
        echo -e "${RED}Please start PostgreSQL service and run this script again${NC}"
        exit 1
    fi
    
    # Setup process
    create_database
    setup_env
    run_migrations
    seed_database
    
    echo -e "\n${GREEN}🎉 PostgreSQL setup completed successfully!${NC}"
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Verify your .env.local file has the correct DATABASE_URL"
    echo "2. Run 'npm run dev' to start the development server"
    echo "3. Use 'npm run db:studio' to view your database"
    
    echo -e "\n${BLUE}Database Information:${NC}"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
    echo "  Database: $DB_NAME"
    echo "  User: $DB_USER"
    echo "  Connection URL: postgresql://$DB_USER:***@$DB_HOST:$DB_PORT/$DB_NAME"
}

# Run main function
main "$@"