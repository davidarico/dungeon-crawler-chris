import { supabase, snakeToCamelCase } from './utils';
import { Lootbox, Item } from '../types';

/**
 * Get all lootboxes
 */
export async function getLootboxes(): Promise<Lootbox[]> {
  const { data, error } = await supabase
    .from('lootboxes')
    .select('*');

  if (error) throw error;
  return data ? snakeToCamelCase(data) : [];
}

/**
 * Get a specific lootbox by ID
 */
export async function getLootbox(lootboxId: string): Promise<Lootbox | null> {
  const { data, error } = await supabase
    .from('lootboxes')
    .select('*')
    .eq('id', lootboxId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data ? snakeToCamelCase(data) : null;
}

/**
 * Get items in a lootbox
 */
export async function getLootboxItems(lootbox: Lootbox): Promise<Item[]> {
  const { data, error } = await supabase
    .from('lootbox_possible_items')
    .select('items(*)')
    .eq('lootbox_id', lootbox.id);

  if (error) throw error;
  return data?.flatMap(item => snakeToCamelCase(item.items)) || [];
}