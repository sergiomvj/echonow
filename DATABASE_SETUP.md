# PostgreSQL Setup Guide for EchoNow

This guide will help you set up PostgreSQL database for the EchoNow project.

## 🐘 PostgreSQL Installation

### Windows
1. Download PostgreSQL from [official website](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Make sure to add PostgreSQL to your system PATH
5. Default port is usually `5432`

### macOS
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## 🚀 Quick Setup

### Automated Setup (Recommended)
Run the setup script to automatically configure everything:

**Windows:**
```cmd
setup-postgres.bat
```

**Linux/macOS:**
```bash
chmod +x setup-postgres.sh
./setup-postgres.sh
```

### Manual Setup

1. **Create Database:**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE echonow_dev;
   
   # Exit
   \q
   ```

2. **Configure Environment:**
   Update your `.env.local` file:
   ```env
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/echonow_dev
   ```

3. **Setup Database Schema:**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed with initial data
   npm run db:seed
   ```

## 📋 Database Management Commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema changes to DB |
| `npm run db:pull` | Pull schema from DB to Prisma |
| `npm run db:migrate` | Create and run migrations |
| `npm run db:seed` | Seed database with initial data |
| `npm run db:studio` | Open Prisma Studio (DB browser) |
| `npm run db:reset` | Reset database (DEV only) |
| `npm run db:setup` | Full database setup |
| `npm run postgres:setup` | Run PostgreSQL setup script |

## 🔍 Database Schema

The EchoNow database includes these main tables:

- **users** - User accounts and subscriptions
- **articles** - Generated articles and content
- **shorts** - Short-form video content
- **categories** - Content categories
- **historical_comparisons** - Historical context data
- **topic_suggestions** - User-suggested topics
- **votes** - User voting on suggestions
- **reactions** - User interactions (likes, shares)
- **ai_prompts** - Custom AI prompts
- **analytics** - Usage analytics

## 🛠️ Troubleshooting

### Connection Issues
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Start PostgreSQL service (Windows)
net start postgresql-x64-14

# Start PostgreSQL service (Linux)
sudo systemctl start postgresql
```

### Permission Issues
```bash
# Connect as postgres user
sudo -u postgres psql

# Grant privileges to your user
GRANT ALL PRIVILEGES ON DATABASE echonow_dev TO your_username;
```

### Reset Everything
```bash
# Drop and recreate database
dropdb -U postgres echonow_dev
createdb -U postgres echonow_dev

# Restart setup
npm run db:setup
```

## 🔐 Security Considerations

1. **Change default password** - Don't use 'password' in production
2. **Limit connections** - Configure `pg_hba.conf` for security
3. **Use SSL** - Enable SSL in production environments
4. **Regular backups** - Set up automated database backups
5. **Monitor access** - Log and monitor database connections

## 📊 Performance Optimization

1. **Indexes** - The schema includes performance indexes
2. **Connection pooling** - Prisma handles connection pooling
3. **Query optimization** - Use `EXPLAIN` to analyze slow queries
4. **Regular maintenance** - Run `VACUUM` and `ANALYZE` periodically

## 🔗 Useful Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Database Design Best Practices](https://www.postgresql.org/docs/current/ddl-best-practices.html)

## 🆘 Getting Help

If you encounter issues:

1. Check the logs: `tail -f /var/log/postgresql/postgresql-*.log`
2. Verify environment variables in `.env.local`
3. Test database connection: `npm run db:generate`
4. Check PostgreSQL service status
5. Review this guide and try the troubleshooting steps

---

For more help, check the main README.md or create an issue in the repository.