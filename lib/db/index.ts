// Re-export from our server file when used in a server context
export { db } from '../api/db.server';

// Add our own query helper that matches the signature expected elsewhere
export const query = async (sql: string, params: any[] = []) => {
  const { db } = await import('../api/db.server');
  try {
    const result = await db.query(sql, params);
    return { rows: result.rows };
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

// Error handling for client-side imports
if (typeof window !== 'undefined') {
  console.error(
    'Warning: Attempted to import database utilities on the client side. ' +
    'This module should only be used in server components or API routes.'
  );
}