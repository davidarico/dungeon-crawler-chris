import { db, snakeToCamelCase } from './db.server';
import { Spell } from '../types';

/**
 * Get all spells
 */
export async function getSpells(): Promise<Spell[]> {
  try {
    const result = await db.query('SELECT * FROM spells');
    return result.rows ? snakeToCamelCase(result.rows) : [];
  } catch (error) {
    console.error('Error getting spells:', error);
    throw error;
  }
}

/**
 * Get a specific spell by ID
 */
export async function getSpell(spellId: string): Promise<Spell | null> {
  try {
    const result = await db.query('SELECT * FROM spells WHERE id = $1', [spellId]);
    if (!result.rows || result.rows.length === 0) return null;
    return snakeToCamelCase(result.rows[0]);
  } catch (error) {
    console.error('Error getting spell:', error);
    throw error;
  }
}