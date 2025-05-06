/**
 * WARNING: DO NOT IMPORT THIS FILE DIRECTLY IN CLIENT COMPONENTS
 * This file re-exports server-side API functions that use Node.js modules
 * and will cause errors if imported in client components.
 * 
 * For client components, use lib/client-utils.ts instead.
 */

// Re-export everything from the new API structure
// This file is maintained for backward compatibility
export * from './api/index';
