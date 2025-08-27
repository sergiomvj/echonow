@echo off
setlocal EnableDelayedExpansion

:: EchoNow PostgreSQL Database Setup Script for Windows
:: This script sets up a PostgreSQL database for the EchoNow application

echo.
echo  🐘 EchoNow PostgreSQL Setup
echo ==================================

:: Default database configuration
set "DB_NAME=echonow_dev"
set "DB_USER=postgres"
set "DB_PASSWORD=password"
set "DB_HOST=localhost"
set "DB_PORT=5432"

:: Check if PostgreSQL is installed
echo Checking PostgreSQL installation...
where psql >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL is not installed or not in PATH
    echo Please install PostgreSQL first:
    echo   Download from: https://www.postgresql.org/download/windows/
    echo   Make sure to add PostgreSQL to your PATH
    pause
    exit /b 1
)
echo ✅ PostgreSQL is installed

:: Check if PostgreSQL service is running
echo Checking PostgreSQL service...
pg_isready -h %DB_HOST% -p %DB_PORT% >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  PostgreSQL service is not running
    echo Starting PostgreSQL service...
    net start postgresql-x64-14 >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Could not start PostgreSQL service
        echo Please start it manually from Services or using:
        echo   net start postgresql-x64-XX (replace XX with your version)
        pause
        exit /b 1
    )
)
echo ✅ PostgreSQL service is running

:: Create database
echo.
echo 📦 Setting up database: %DB_NAME%

:: Check if database exists
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -lqt | findstr %DB_NAME% >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Database %DB_NAME% already exists
    set /p "recreate=Do you want to recreate it? (y/N): "
    if /i "!recreate!"=="y" (
        dropdb -h %DB_HOST% -p %DB_PORT% -U %DB_USER% %DB_NAME%
        if %errorlevel% equ 0 (
            echo ✅ Database %DB_NAME% dropped
        )
    ) else (
        echo ℹ️  Using existing database
        goto :setup_env
    )
)

:: Create the database
createdb -h %DB_HOST% -p %DB_PORT% -U %DB_USER% %DB_NAME%
if %errorlevel% equ 0 (
    echo ✅ Database %DB_NAME% created successfully
) else (
    echo ❌ Failed to create database. Please check your PostgreSQL credentials.
    pause
    exit /b 1
)

:setup_env
:: Setup environment variables
echo.
echo 🔧 Setting up environment variables

set "DATABASE_URL=postgresql://%DB_USER%:%DB_PASSWORD%@%DB_HOST%:%DB_PORT%/%DB_NAME%"

:: Update .env.local if it exists
if exist .env.local (
    echo Backing up existing .env.local...
    copy .env.local .env.local.backup >nul
    
    :: Create a temporary file with updated DATABASE_URL
    (
        for /f "tokens=*" %%a in (.env.local) do (
            echo %%a | findstr /i "DATABASE_URL=" >nul
            if !errorlevel! equ 0 (
                echo DATABASE_URL=!DATABASE_URL!
            ) else (
                echo %%a
            )
        )
    ) > .env.local.tmp
    
    move .env.local.tmp .env.local >nul
    echo ✅ Updated .env.local with database configuration
) else (
    echo ⚠️  .env.local not found. Creating it...
    echo DATABASE_URL=!DATABASE_URL! > .env.local
    echo NODE_ENV=development >> .env.local
    echo NEXTAUTH_URL=http://localhost:3000 >> .env.local
    echo NEXTAUTH_SECRET=your-secret-key-here >> .env.local
    echo ✅ Created .env.local with basic configuration
)

:: Install dependencies if needed
echo.
echo 📦 Checking dependencies...
if not exist node_modules (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

:: Run Prisma migrations
echo.
echo 🚀 Setting up database schema...

echo Generating Prisma client...
npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)

echo Pushing database schema...
npx prisma db push
if %errorlevel% neq 0 (
    echo ❌ Failed to push database schema
    pause
    exit /b 1
)
echo ✅ Database schema created successfully

:: Seed database
echo.
echo 🌱 Seeding database with initial data...
if exist prisma\seed.ts (
    npm run db:seed
    if %errorlevel% equ 0 (
        echo ✅ Database seeded successfully
    ) else (
        echo ⚠️  Seeding completed with warnings
    )
) else (
    echo ⚠️  No seed file found, skipping seeding
)

:: Success message
echo.
echo 🎉 PostgreSQL setup completed successfully!
echo.
echo Next steps:
echo 1. Verify your .env.local file has the correct DATABASE_URL
echo 2. Run 'npm run dev' to start the development server
echo 3. Use 'npm run db:studio' to view your database
echo.
echo Database Information:
echo   Host: %DB_HOST%
echo   Port: %DB_PORT%
echo   Database: %DB_NAME%
echo   User: %DB_USER%
echo   Connection URL: postgresql://%DB_USER%:***@%DB_HOST%:%DB_PORT%/%DB_NAME%
echo.
pause