# Database Environment Setup

## Prerequisites
- PostgreSQL database (local or hosted)
- Node.js and npm/pnpm installed

## Environment Variables
Create a `.env` file in your project root with the following variables:

```env
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=dungeon_crawler
PG_USER=your_postgres_username
PG_PASSWORD=your_postgres_password
```

## Initial Setup Steps

1. **Install PostgreSQL**
   - Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/) or use a package manager
   - Create a new database for your application
   - Note down your connection details

2. **Database Initialization**
   - Connect to your PostgreSQL database using psql or a GUI tool
   - Run the migration script to set up your tables:
   ```bash
   # Using psql
   psql -U your_username -d your_database -f migrate.sql
   ```

3. **Local Development Setup**
   ```bash
   # Install dependencies
   pnpm install
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env with your PostgreSQL credentials
   ```

## Security Considerations

### Environment Variables
- Never commit `.env` files to version control
- Use different credentials for development and production
- Consider storing production credentials in a secure environment variable manager

### Access Control
- Set up proper user roles and permissions in PostgreSQL
- Use connection pooling for efficient database access
- Limit database access to necessary operations only

## Troubleshooting

### Common Issues

1. **Connection Issues**
   - Verify environment variables are set correctly
   - Check PostgreSQL service is running
   - Ensure network connectivity to the database server
   - Verify firewall settings allow the connection

2. **Authentication Problems**
   - Check user permissions in PostgreSQL
   - Verify password is correct
   - Ensure the database exists and user has access

3. **Migration Failures**
   - Check SQL syntax
   - Verify table dependencies
   - Review error messages from PostgreSQL

## Development Workflow

1. **Local Development**
   - Use a local PostgreSQL instance for development
   - Enable debug logging
   - Test all database operations locally

2. **Testing**
   - Create separate test database
   - Use dedicated test credentials
   - Reset database state between tests

3. **Deployment**
   - Use production database with secure configuration
   - Enable enhanced security features
   - Monitor database performance

## Monitoring and Maintenance

### Regular Tasks
- Monitor database size and usage
- Review access logs
- Backup data regularly
- Run VACUUM to optimize performance

### Performance Optimization
- Review and optimize queries
- Monitor slow queries with pg_stat_statements
- Maintain proper indexes
- Clean up unused data

## Additional Resources
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js PostgreSQL (node-postgres) Documentation](https://node-postgres.com/)
- [Next.js with PostgreSQL Guide](https://vercel.com/guides/nextjs-prisma-postgres)
- [Database Security Best Practices](https://www.postgresql.org/docs/current/auth-pg-hba-conf.html)