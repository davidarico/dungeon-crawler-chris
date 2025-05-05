import { db, snakeToCamelCase } from './db.server';
import { Class } from '../types';
import { getPlayer } from './player';

/**
 * Get all classes
 */
export async function getClasses(): Promise<Class[]> {
  try {
    const result = await db.query('SELECT * FROM classes');
    return result.rows ? snakeToCamelCase(result.rows) : [];
  } catch (error) {
    console.error('Error getting classes:', error);
    throw error;
  }
}

/**
 * Get a specific class by ID
 */
export async function getClass(classId: string): Promise<Class | null> {
  try {
    const result = await db.query('SELECT * FROM classes WHERE id = $1', [classId]);
    if (!result.rows || result.rows.length === 0) return null;
    return snakeToCamelCase(result.rows[0]);
  } catch (error) {
    console.error('Error getting class:', error);
    throw error;
  }
}

/**
 * Assign class to player
 */
export async function assignClassToPlayer(playerId: string, classId: string): Promise<any> {
  try {
    const player = await getPlayer(playerId);
    if (!player) {
      throw new Error(`Player with ID ${playerId} not found`);
    }

    const playerClass = await getClass(classId);
    if (!playerClass) {
      throw new Error(`Class with ID ${classId} not found`);
    }

    // Update player's class
    const updateResult = await db.query(
      'UPDATE players SET class_id = $1 WHERE id = $2 RETURNING *',
      [classId, playerId]
    );

    if (!updateResult.rows || updateResult.rows.length === 0) {
      throw new Error(`Failed to update player with ID ${playerId}`);
    }

    // Get default spells for the class
    const spellsResult = await db.query(
      'SELECT spell_id FROM class_default_spells WHERE class_id = $1',
      [classId]
    );

    const defaultSpells = spellsResult.rows;

    if (defaultSpells && defaultSpells.length > 0) {
      // Delete existing player spells
      await db.query(
        'DELETE FROM player_spells WHERE player_id = $1',
        [playerId]
      );

      // Insert default class spells for the player
      const spellValues = defaultSpells.map(spell => 
        `('${playerId}', '${spell.spell_id}')`
      ).join(', ');

      await db.query(`
        INSERT INTO player_spells (player_id, spell_id)
        VALUES ${spellValues}
      `);
    }

    return snakeToCamelCase(updateResult.rows[0]);
  } catch (error) {
    console.error('Error assigning class to player:', error);
    throw error;
  }
}