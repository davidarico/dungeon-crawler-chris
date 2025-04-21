import { supabase, snakeToCamelCase } from './utils';
import { Item } from '../types';

/**
 * Get all items
 */
export async function getItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items')
    .select('*');

  if (error) throw error;
  return data ? snakeToCamelCase(data) : [];
}

/**
 * Get a specific item by ID
 */
export async function getItem(itemId: string): Promise<Item | null> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', itemId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data ? snakeToCamelCase(data) : null;
}