import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility functions for type conversions

/**
 * Converts a string from snake_case to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/(_\w)/g, match => match[1].toUpperCase());
}

/**
 * Converts a string from camelCase to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, match => `_${match.toLowerCase()}`);
}

/**
 * Recursively converts object keys from snake_case to camelCase
 */
export function snakeToCamelCase<T extends object>(obj: T): any {
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamelCase);
  }
  
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        snakeToCamel(key),
        value !== null && typeof value === 'object' ? snakeToCamelCase(value) : value
      ])
    );
  }
  
  return obj;
}

/**
 * Recursively converts object keys from camelCase to snake_case
 */
export function camelToSnakeCase<T extends object>(obj: T): any {
  if (Array.isArray(obj)) {
    return obj.map(camelToSnakeCase);
  }
  
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        camelToSnake(key),
        value !== null && typeof value === 'object' ? camelToSnakeCase(value) : value
      ])
    );
  }
  
  return obj;
}
