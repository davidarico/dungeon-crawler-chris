// Export utility functions only
export { snakeToCamelCase, camelToSnakeCase } from '../utils';

// For server components, they should import from db.server.ts directly
// This file now only exports utilities that are safe to use on both client and server