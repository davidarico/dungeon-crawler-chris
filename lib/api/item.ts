import { db, snakeToCamelCase } from './db.server';
import { Item } from '../types';

/**
 * Get all items
 */
export async function getItems(): Promise<Item[]> {
  try {
    const result = await db.query('SELECT * FROM items');
    return result.rows ? snakeToCamelCase(result.rows) : [];
  } catch (error) {
    console.error('Error getting items:', error);
    throw error;
  }
}

/**
 * Get a specific item by ID
 */
export async function getItem(itemId: string | number): Promise<Item | null> {
  try {
    // Convert string ID to number if it's a string that contains only digits
    const parsedId = typeof itemId === 'string' && /^\d+$/.test(itemId) ? parseInt(itemId, 10) : itemId;
    
    const result = await db.query('SELECT * FROM items WHERE id = $1', [parsedId]);
    if (!result.rows || result.rows.length === 0) return null;
    return snakeToCamelCase(result.rows[0]);
  } catch (error) {
    console.error('Error getting item:', error);
    throw error;
  }
}

/**
 * Create a new item in the database
 */
export async function createItem(item: Omit<Item, 'id'>): Promise<Item> {
  try {
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

    // Build the query dynamically
    const fields = Object.keys(snakeCaseItem).join(', ');
    const placeholders = Object.keys(snakeCaseItem).map((_, i) => `$${i + 1}`).join(', ');
    const values = Object.values(snakeCaseItem);

    const query = `
      INSERT INTO items (${fields})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await db.query(query, values);
    if (!result.rows || result.rows.length === 0) {
      throw new Error('Failed to create item');
    }
    
    return snakeToCamelCase(result.rows[0]);
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
}

/**
 * Create multiple items in the database
 */
export async function createItems(items: Omit<Item, 'id'>[]): Promise<Item[]> {
  try {
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
    
    if (snakeCaseItems.length === 0) {
      return [];
    }
    
    // For bulk inserts, we'll use a different approach with pg-format
    // First, get the fields from the first item
    const firstItem = snakeCaseItems[0];
    const fields = Object.keys(firstItem);
    
    // Then prepare values for all items
    const values = snakeCaseItems.map(item => 
      fields.map(field => (item as Record<string, any>)[field])
    );
    
    // Use the format function to safely create the query
    const formattedQuery = db.format(
      `INSERT INTO items (${fields.join(', ')})
       VALUES %L
       RETURNING *`,
      [values]
    );
    
    const result = await db.query(formattedQuery);
    return result.rows ? snakeToCamelCase(result.rows) : [];
  } catch (error) {
    console.error('Error creating multiple items:', error);
    throw error;
  }
}