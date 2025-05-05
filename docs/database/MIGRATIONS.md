# Database Migrations

## Overview
This document explains how database migrations work in the Dungeon Crawler Chris application. Migrations are used to version control the database schema and make changes in a controlled manner.

## Migration Files
The main migration file is located at `/migrate.sql` in the root directory. This file contains the complete database schema and is used for initial setup and reset operations.

## Running Migrations
Migrations are typically run through Supabase's interface or CLI tools. The process involves:

1. Connecting to your Supabase project
2. Applying the migration SQL file
3. Verifying the changes

## Migration Best Practices
1. Always backup the database before running migrations
2. Test migrations in a development environment first
3. Include both "up" and "down" migrations for reversibility
4. Document all schema changes in the migration files
5. Keep migrations atomic and focused on specific changes

## Common Migration Tasks

### Adding a New Table
```sql
-- 1. Create the new table
CREATE TABLE new_table (
  id TEXT PRIMARY KEY,
  ...other fields
);

-- 2. Add any necessary indexes
CREATE INDEX idx_new_table_field ON new_table(field_name);

-- 3. Set up foreign key relationships
ALTER TABLE new_table
  ADD CONSTRAINT fk_related_table
  FOREIGN KEY (related_id)
  REFERENCES related_table(id);
```

### Modifying Existing Tables
```sql
-- Adding a new column
ALTER TABLE existing_table ADD COLUMN new_column TEXT;

-- Modifying a column
ALTER TABLE existing_table ALTER COLUMN existing_column TYPE INTEGER;

-- Adding constraints
ALTER TABLE existing_table ADD CONSTRAINT constraint_name UNIQUE (column_name);
```

## Rollback Procedures
In case of migration failures:

1. Use the Supabase dashboard to review the migration status
2. Apply the corresponding rollback SQL if available
3. Restore from backup if necessary

## Environment-Specific Considerations

### Development
- Use a separate development database
- Reset the database frequently with fresh migrations
- Use seed data for testing

### Production
- Always backup before migrating
- Schedule migrations during low-traffic periods
- Test migrations thoroughly in staging first