// This file contains server-only database utilities
import { Pool, QueryResult } from 'pg';
import format from 'pg-format';
import { snakeToCamelCase, camelToSnakeCase } from '../utils';

// Ensure this is only used on the server
if (typeof window !== 'undefined') {
  throw new Error('This module can only be used on the server side');
}

// Initialize PostgreSQL client
const pool = new Pool({
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT || '5432'),
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
});

// Export the database interface
export const db = {
  query: (text: string, params?: any[]): Promise<QueryResult> => pool.query(text, params),
  format: format
};

// Re-export utility functions for convenience
export { snakeToCamelCase, camelToSnakeCase };