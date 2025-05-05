# Database Environment Setup

## Prerequisites
- Supabase account
- Access to the project dashboard
- Node.js and npm/pnpm installed

## Environment Variables
Create a `.env` file in your project root with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Initial Setup Steps

1. **Create Supabase Project**
   - Go to [Supabase Dashboard](https://app.supabase.io)
   - Create a new project
   - Note down the project URL and anon key

2. **Database Initialization**
   - Navigate to the SQL editor in your Supabase dashboard
   - Copy the contents of `/migrate.sql`
   - Execute the SQL to create all necessary tables

3. **Local Development Setup**
   ```bash
   # Install dependencies
   pnpm install
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

## Security Considerations

### Environment Variables
- Never commit `.env` files to version control
- Use different keys for development and production
- Rotate keys periodically for security

### Access Control
- Set up Row Level Security (RLS) policies in Supabase
- Configure proper authentication rules
- Limit database access to necessary operations only

## Troubleshooting

### Common Issues

1. **Connection Issues**
   - Verify environment variables are set correctly
   - Check Supabase project status
   - Ensure proper network access

2. **Authentication Problems**
   - Verify API keys are current
   - Check user permissions in Supabase
   - Review RLS policies

3. **Migration Failures**
   - Check SQL syntax
   - Verify table dependencies
   - Review error logs in Supabase dashboard

## Development Workflow

1. **Local Development**
   - Use development database
   - Enable debug logging
   - Test all database operations locally

2. **Testing**
   - Create test database
   - Use separate credentials
   - Reset database state between tests

3. **Deployment**
   - Use production database
   - Enable enhanced security
   - Monitor database performance

## Monitoring and Maintenance

### Regular Tasks
- Monitor database size and usage
- Review access logs
- Backup data regularly
- Update security policies

### Performance Optimization
- Review and optimize queries
- Monitor slow queries
- Maintain proper indexes
- Clean up unused data

## Additional Resources
- [Supabase Documentation](https://supabase.io/docs)
- [Next.js with Supabase Guide](https://supabase.io/docs/guides/with-nextjs)
- [Database Security Best Practices](https://supabase.io/docs/guides/auth)