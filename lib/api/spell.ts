import { supabase, snakeToCamelCase } from './utils';
import { Spell } from '../types';

/**
 * Get all spells
 */
export async function getSpells(): Promise<Spell[]> {
  const { data, error } = await supabase
    .from('spells')
    .select('*');

  if (error) throw error;
  return data ? snakeToCamelCase(data) : [];
}

/**
 * Get a specific spell by ID
 */
export async function getSpell(spellId: string): Promise<Spell | null> {
  const { data, error } = await supabase
    .from('spells')
    .select('*')
    .eq('id', spellId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data ? snakeToCamelCase(data) : null;
}