import { db, snakeToCamelCase } from './db.server';
import { Lootbox, Item } from '../types';

/**
 * Get all lootboxes
 */
export async function getLootboxes(): Promise<Lootbox[]> {
  try {
    const result = await db.query('SELECT * FROM lootboxes');
    return result.rows ? snakeToCamelCase(result.rows) : [];
  } catch (error) {
    console.error('Error getting lootboxes:', error);
    throw error;
  }
}

/**
 * Get a specific lootbox by ID
 */
export async function getLootbox(lootboxId: string): Promise<Lootbox | null> {
  try {
    const result = await db.query('SELECT * FROM lootboxes WHERE id = $1', [lootboxId]);
    if (!result.rows || result.rows.length === 0) return null;
    return snakeToCamelCase(result.rows[0]);
  } catch (error) {
    console.error('Error getting lootbox:', error);
    throw error;
  }
}

/**
 * Get items in a lootbox
 */
export async function getLootboxItems(lootbox: Lootbox): Promise<Item[]> {
  try {
    const query = `
      SELECT i.* 
      FROM lootbox_possible_items lpi
      JOIN items i ON lpi.item_id = i.id
      WHERE lpi.lootbox_id = $1
    `;
    
    const result = await db.query(query, [lootbox.id]);
    return result.rows ? snakeToCamelCase(result.rows) : [];
  } catch (error) {
    console.error('Error getting lootbox items:', error);
    throw error;
  }
}