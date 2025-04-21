import { supabase, snakeToCamelCase } from './utils';
import { Class } from '../types';
import { getPlayer } from './player';

/**
 * Get all classes
 */
export async function getClasses(): Promise<Class[]> {
  const { data, error } = await supabase
    .from('classes')
    .select('*');

  if (error) throw error;
  return data ? snakeToCamelCase(data) : [];
}

/**
 * Get a specific class by ID
 */
export async function getClass(classId: string): Promise<Class | null> {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('id', classId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data ? snakeToCamelCase(data) : null;
}

/**
 * Assign class to player
 */
export async function assignClassToPlayer(playerId: string, classId: string): Promise<any> {
  const player = await getPlayer(playerId);
  if (!player) {
    throw new Error(`Player with ID ${playerId} not found`);
  }

  const playerClass = await getClass(classId);
  if (!playerClass) {
    throw new Error(`Class with ID ${classId} not found`);
  }

  const { data, error } = await supabase
    .from('players')
    .update({ class_id: classId })
    .eq('id', playerId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error(`Failed to update player with ID ${playerId}`);

  const { data: defaultSpells, error: spellsError } = await supabase
    .from('class_default_spells')
    .select('spell_id')
    .eq('class_id', classId);

  if (spellsError) throw spellsError;

  if (defaultSpells && defaultSpells.length > 0) {
    await supabase
      .from('player_spells')
      .delete()
      .eq('player_id', playerId);

    const spellInserts = defaultSpells.map(spell => ({
      player_id: playerId,
      spell_id: spell.spell_id
    }));

    const { error: insertError } = await supabase
      .from('player_spells')
      .insert(spellInserts);

    if (insertError) throw insertError;
  }

  return snakeToCamelCase(data);
}