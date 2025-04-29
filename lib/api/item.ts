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

/**
 * Create a new item in the database
 */
export async function createItem(item: Omit<Item, 'id'>): Promise<Item> {
  // Convert to snake_case for the database
  const snakeCaseItem = {
    name: item.name,
    description: item.description,
    flavor_text: item.flavorText,
    categories: item.categories,
    equip_slot: item.equipSlot || null,
    value: item.value || 0,
    weight: item.weight || 0,
    ...(item.damage && { damage: item.damage }),
    ...(item.armorClass && { armor_class: item.armorClass }),
  };

  const { data, error } = await supabase
    .from('items')
    .insert(snakeCaseItem)
    .select()
    .single();

  if (error) throw error;
  return snakeToCamelCase(data);
}

/**
 * Create multiple items in the database
 */
export async function createItems(items: Omit<Item, 'id'>[]): Promise<Item[]> {
  // Convert each item to snake_case for the database
  const snakeCaseItems = items.map(item => ({
    name: item.name,
    description: item.description,
    flavor_text: item.flavorText,
    categories: item.categories,
    equip_slot: item.equipSlot || null,
    value: item.value || 0,
    weight: item.weight || 0,
    ...(item.damage && { damage: item.damage }),
    ...(item.armorClass && { armor_class: item.armorClass }),
  }));

  const { data, error } = await supabase
    .from('items')
    .insert(snakeCaseItems)
    .select();

  if (error) throw error;
  return data ? snakeToCamelCase(data) : [];
}