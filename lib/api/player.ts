import { db, snakeToCamelCase, camelToSnakeCase } from './db.server';
import {
  Player, PlayerWithRelations, AbilityScores, SavingThrows,
  Spell, Item, Lootbox, EquipSlot
} from '../types';

/**
 * Get a specific player by ID
 */
export async function getPlayer(playerId: string): Promise<Player | null> {
  try {
    const result = await db.query('SELECT * FROM players WHERE id = $1', [playerId]);
    
    if (!result.rows || result.rows.length === 0) return null;
    
    const data = result.rows[0];
    
    // Transform the structure to match our frontend Player type
    const camelPlayer = snakeToCamelCase(data);
    
    // Create nested ability scores and saving throws objects
    const abilityScores: AbilityScores = {
      strength: data.strength,
      agility: data.agility,
      stamina: data.stamina,
      personality: data.personality,
      intelligence: data.intelligence,
      luck: data.luck
    };
    
    const savingThrows: SavingThrows = {
      fortitude: data.saving_throw_fortitude,
      reflex: data.saving_throw_reflex,
      willpower: data.saving_throw_willpower
    };
    
    return {
      ...camelPlayer,
      abilityScores,
      savingThrows,
      // Remove these properties as they're now in nested objects
      strength: undefined,
      agility: undefined,
      stamina: undefined,
      personality: undefined,
      intelligence: undefined,
      luck: undefined,
      savingThrowFortitude: undefined,
      savingThrowReflex: undefined,
      savingThrowWillpower: undefined
    } as Player;
  } catch (error) {
    console.error('Error getting player:', error);
    throw error;
  }
}

/**
 * Get a player by game ID and user ID
 */
export async function getPlayerByGameAndUser(gameId: string, userId: string): Promise<Player | null> {
  try {
    const result = await db.query(
      'SELECT * FROM players WHERE game_id = $1 AND user_id = $2', 
      [gameId, userId]
    );
    
    if (!result.rows || result.rows.length === 0) return null;
    return snakeToCamelCase(result.rows[0]);
  } catch (error) {
    console.error('Error getting player by game and user:', error);
    throw error;
  }
}

/**
 * Update a player
 */
export async function updatePlayer(playerId: string, playerData: Partial<Player>): Promise<Player> {
  try {
    const snakeData = camelToSnakeCase(playerData);
    
    // Build the SET part of the query dynamically
    const entries = Object.entries(snakeData).filter(([_, v]) => v !== undefined);
    if (entries.length === 0) {
      // If no valid fields to update, just return the current player
      const player = await getPlayer(playerId);
      if (!player) throw new Error(`Player with ID ${playerId} not found`);
      return player;
    }
    
    const fields = entries.map(([k], i) => `${k} = $${i + 2}`).join(', ');
    const values = entries.map(([_, v]) => v);
    
    const query = `
      UPDATE players 
      SET ${fields} 
      WHERE id = $1 
      RETURNING *
    `;
    
    const result = await db.query(query, [playerId, ...values]);
    
    if (!result.rows || result.rows.length === 0) {
      throw new Error(`Player with ID ${playerId} not found`);
    }
    
    return snakeToCamelCase(result.rows[0]);
  } catch (error) {
    console.error('Error updating player:', error);
    throw error;
  }
}

/**
 * Get spells for a player
 */
export async function getPlayerSpells(player: Player | PlayerWithRelations | null | undefined): Promise<Spell[]> {
  // Return empty array if player is null or undefined
  if (!player) return [];
  
  // If the player already has spells property (it's a PlayerWithRelations)
  if ('spells' in player && Array.isArray(player.spells)) {
    // If spells contains Spell objects, return them
    if (player.spells.length > 0 && typeof player.spells[0] === 'object') {
      return player.spells as Spell[];
    }
    
    // If spells contains just IDs, fetch the full spell objects
    const spellIds = player.spells as unknown as string[];
    if (spellIds.length === 0) return [];
    
    const placeholders = spellIds.map((_, i) => `$${i + 1}`).join(',');
    const query = `SELECT * FROM spells WHERE id IN (${placeholders})`;
    const result = await db.query(query, spellIds);
    
    return result.rows ? snakeToCamelCase(result.rows) : [];
  }
  
  // Original implementation for when player doesn't have spells property
  const query = `
    SELECT s.* 
    FROM player_spells ps
    JOIN spells s ON ps.spell_id = s.id
    WHERE ps.player_id = $1
  `;
  
  const result = await db.query(query, [player.id]);
  return result.rows ? snakeToCamelCase(result.rows) : [];
}

/**
 * Get items for a player
 */
export async function getPlayerItems(player: Player | PlayerWithRelations | null | undefined): Promise<Item[]> {
  // Return empty array if player is null or undefined
  if (!player) return [];
  
  // If the player already has items property (it's a PlayerWithRelations)
  if ('items' in player && Array.isArray(player.items)) {
    // If items contains Item objects, return them
    if (player.items.length > 0 && typeof player.items[0] === 'object') {
      return player.items as Item[];
    }
    
    // If items contains just IDs, fetch the full item objects
    const itemIds = player.items as unknown as string[];
    if (itemIds.length === 0) return [];
    
    const placeholders = itemIds.map((_, i) => `$${i + 1}`).join(',');
    const query = `SELECT * FROM items WHERE id IN (${placeholders})`;
    const result = await db.query(query, itemIds);
    
    return result.rows ? snakeToCamelCase(result.rows) : [];
  }
  
  // Original implementation for when player doesn't have items property
  const query = `
    SELECT i.* 
    FROM player_items pi
    JOIN items i ON pi.item_id = i.id
    WHERE pi.player_id = $1
  `;
  
  const result = await db.query(query, [player.id]);
  return result.rows ? snakeToCamelCase(result.rows) : [];
}

/**
 * Get lootboxes for a player
 */
export async function getPlayerLootboxes(player: Player | PlayerWithRelations | null | undefined): Promise<Lootbox[]> {
  // Return empty array if player is null or undefined
  if (!player) return [];
  
  // If the player already has lootboxes property (it's a PlayerWithRelations)
  if ('lootboxes' in player && Array.isArray(player.lootboxes)) {
    // If lootboxes contains Lootbox objects, return them
    if (player.lootboxes.length > 0 && typeof player.lootboxes[0] === 'object') {
      return player.lootboxes as Lootbox[];
    }
    
    // If lootboxes contains just IDs, fetch the full lootbox objects
    const lootboxIds = player.lootboxes as unknown as string[];
    if (lootboxIds.length === 0) return [];
    
    const placeholders = lootboxIds.map((_, i) => `$${i + 1}`).join(',');
    const query = `SELECT * FROM lootboxes WHERE id IN (${placeholders})`;
    const result = await db.query(query, lootboxIds);
    
    return result.rows ? snakeToCamelCase(result.rows) : [];
  }
  
  // Original implementation for when player doesn't have lootboxes property
  const query = `
    SELECT l.* 
    FROM player_lootboxes pl
    JOIN lootboxes l ON pl.lootbox_id = l.id
    WHERE pl.player_id = $1
  `;
  
  const result = await db.query(query, [player.id]);
  return result.rows ? snakeToCamelCase(result.rows) : [];
}

/**
 * Add item to player
 */
export async function addItemToPlayer(playerId: string, itemId: string): Promise<Player> {
  try {
    const player = await getPlayer(playerId);
    if (!player) {
      throw new Error(`Player with ID ${playerId} not found`);
    }

    await db.query(
      'INSERT INTO player_items (player_id, item_id) VALUES ($1, $2)',
      [playerId, itemId]
    );

    return player;
  } catch (error) {
    console.error('Error adding item to player:', error);
    throw error;
  }
}

/**
 * Remove item from player
 */
export async function removeItemFromPlayer(playerId: string, itemId: string): Promise<Player> {
  try {
    const player = await getPlayer(playerId);
    if (!player) {
      throw new Error(`Player with ID ${playerId} not found`);
    }

    await db.query(
      'DELETE FROM player_items WHERE player_id = $1 AND item_id = $2',
      [playerId, itemId]
    );

    return player;
  } catch (error) {
    console.error('Error removing item from player:', error);
    throw error;
  }
}

/**
 * Add spell to player
 */
export async function addSpellToPlayer(playerId: string, spellId: string): Promise<Player> {
  try {
    const player = await getPlayer(playerId);
    if (!player) {
      throw new Error(`Player with ID ${playerId} not found`);
    }

    await db.query(
      'INSERT INTO player_spells (player_id, spell_id) VALUES ($1, $2)',
      [playerId, spellId]
    );

    return player;
  } catch (error) {
    console.error('Error adding spell to player:', error);
    throw error;
  }
}

/**
 * Remove lootbox from player
 */
export async function removeLootboxFromPlayer(playerId: string, lootboxId: string): Promise<Player> {
  try {
    const player = await getPlayer(playerId);
    if (!player) {
      throw new Error(`Player with ID ${playerId} not found`);
    }

    await db.query(
      'DELETE FROM player_lootboxes WHERE player_id = $1 AND lootbox_id = $2',
      [playerId, lootboxId]
    );

    return player;
  } catch (error) {
    console.error('Error removing lootbox from player:', error);
    throw error;
  }
}

/**
 * Update player health
 */
export async function updatePlayerHealth(playerId: string, health: number): Promise<Player> {
  try {
    const player = await getPlayer(playerId);
    if (!player) {
      throw new Error(`Player with ID ${playerId} not found`);
    }

    const newHealth = Math.min(Math.max(health, 0), player.maxHealth);

    const result = await db.query(
      'UPDATE players SET health = $1 WHERE id = $2 RETURNING *',
      [newHealth, playerId]
    );

    if (!result.rows || result.rows.length === 0) {
      throw new Error(`Player with ID ${playerId} not found`);
    }

    return snakeToCamelCase(result.rows[0]);
  } catch (error) {
    console.error('Error updating player health:', error);
    throw error;
  }
}

/**
 * Update player gold
 */
export async function updatePlayerGold(playerId: string, gold: number): Promise<Player> {
  try {
    const newGold = Math.max(gold, 0);

    const result = await db.query(
      'UPDATE players SET gold = $1 WHERE id = $2 RETURNING *',
      [newGold, playerId]
    );

    if (!result.rows || result.rows.length === 0) {
      throw new Error(`Player with ID ${playerId} not found`);
    }

    return snakeToCamelCase(result.rows[0]);
  } catch (error) {
    console.error('Error updating player gold:', error);
    throw error;
  }
}

/**
 * Update player followers
 */
export async function updatePlayerFollowers(
  playerId: string,
  followers: number,
  trendingFollowers: number,
): Promise<Player> {
  try {
    const newFollowers = Math.max(followers, 0);
    const newTrendingFollowers = Math.max(trendingFollowers, 0);

    const result = await db.query(
      'UPDATE players SET followers = $1, trending_followers = $2 WHERE id = $3 RETURNING *',
      [newFollowers, newTrendingFollowers, playerId]
    );

    if (!result.rows || result.rows.length === 0) {
      throw new Error(`Player with ID ${playerId} not found`);
    }

    return snakeToCamelCase(result.rows[0]);
  } catch (error) {
    console.error('Error updating player followers:', error);
    throw error;
  }
}

/**
 * Update player ability scores
 */
export async function updatePlayerAbilityScores(playerId: string, abilityScores: Partial<AbilityScores>): Promise<Player> {
  try {
    const snakeScores = camelToSnakeCase(abilityScores);
    
    // Build the SET part of the query dynamically
    const entries = Object.entries(snakeScores).filter(([_, v]) => v !== undefined);
    if (entries.length === 0) {
      // If no valid fields to update, just return the current player
      const player = await getPlayer(playerId);
      if (!player) throw new Error(`Player with ID ${playerId} not found`);
      return player;
    }
    
    const fields = entries.map(([k], i) => `${k} = $${i + 2}`).join(', ');
    const values = entries.map(([_, v]) => v);
    
    const query = `
      UPDATE players 
      SET ${fields} 
      WHERE id = $1 
      RETURNING *
    `;
    
    const result = await db.query(query, [playerId, ...values]);
    
    if (!result.rows || result.rows.length === 0) {
      throw new Error(`Player with ID ${playerId} not found`);
    }
    
    return snakeToCamelCase(result.rows[0]);
  } catch (error) {
    console.error('Error updating player ability scores:', error);
    throw error;
  }
}

/**
 * Update player saving throws
 */
export async function updatePlayerSavingThrows(playerId: string, savingThrows: Partial<SavingThrows>): Promise<Player> {
  try {
    const snakeThrows = camelToSnakeCase(savingThrows);
    
    // Build the SET part of the query dynamically
    const entries = Object.entries(snakeThrows).filter(([_, v]) => v !== undefined);
    if (entries.length === 0) {
      // If no valid fields to update, just return the current player
      const player = await getPlayer(playerId);
      if (!player) throw new Error(`Player with ID ${playerId} not found`);
      return player;
    }
    
    const fields = entries.map(([k], i) => `${k} = $${i + 2}`).join(', ');
    const values = entries.map(([_, v]) => v);
    
    const query = `
      UPDATE players 
      SET ${fields} 
      WHERE id = $1 
      RETURNING *
    `;
    
    const result = await db.query(query, [playerId, ...values]);
    
    if (!result.rows || result.rows.length === 0) {
      throw new Error(`Player with ID ${playerId} not found`);
    }
    
    return snakeToCamelCase(result.rows[0]);
  } catch (error) {
    console.error('Error updating player saving throws:', error);
    throw error;
  }
}

/**
 * Delete player
 */
export async function deletePlayer(playerId: string): Promise<void> {
  try {
    await db.query('DELETE FROM players WHERE id = $1', [playerId]);
  } catch (error) {
    console.error('Error deleting player:', error);
    throw error;
  }
}

/**
 * Create a new player for a game
 */
export async function createPlayer(gameId: string, userId: string, name: string): Promise<Player> {
  try {
    // Generate a UUID for the new player
    const playerId = crypto.randomUUID();
    
    // Default ability scores and saving throws
    const defaultAbilityScores = {
      strength: 10,
      agility: 10,
      stamina: 10,
      personality: 10,
      intelligence: 10,
      luck: 10
    };
    
    const defaultSavingThrows = {
      saving_throw_fortitude: 0,
      saving_throw_reflex: 0,
      saving_throw_willpower: 0
    };
    
    // Default player values
    const query = `
      INSERT INTO players (
        id, game_id, user_id, name, level, health, max_health, class_id, 
        followers, trending_followers, gold, strength, agility, stamina, 
        personality, intelligence, luck, saving_throw_fortitude, saving_throw_reflex,
        saving_throw_willpower
      ) 
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      )
      RETURNING *
    `;
    
    const values = [
      playerId, gameId, userId, name, 1, 10, 10, null, 0, 0, 0,
      defaultAbilityScores.strength, defaultAbilityScores.agility, defaultAbilityScores.stamina,
      defaultAbilityScores.personality, defaultAbilityScores.intelligence, defaultAbilityScores.luck,
      defaultSavingThrows.saving_throw_fortitude, defaultSavingThrows.saving_throw_reflex, defaultSavingThrows.saving_throw_willpower
    ];
    
    const result = await db.query(query, values);
    
    if (!result.rows || result.rows.length === 0) {
      throw new Error('No data returned when creating player');
    }
    
    const data = result.rows[0];
    
    // Transform the response to match our frontend Player type
    const camelPlayer = snakeToCamelCase(data);
    
    // Create nested ability scores and saving throws objects
    const abilityScores: AbilityScores = {
      strength: data.strength,
      agility: data.agility,
      stamina: data.stamina,
      personality: data.personality,
      intelligence: data.intelligence,
      luck: data.luck
    };
    
    const savingThrows: SavingThrows = {
      fortitude: data.saving_throw_fortitude,
      reflex: data.saving_throw_reflex,
      willpower: data.saving_throw_willpower
    };
    
    return {
      ...camelPlayer,
      abilityScores,
      savingThrows,
      // Remove these properties as they're now in nested objects
      strength: undefined,
      agility: undefined,
      stamina: undefined,
      personality: undefined,
      intelligence: undefined,
      luck: undefined,
      savingThrowFortitude: undefined,
      savingThrowReflex: undefined,
      savingThrowWillpower: undefined
    } as Player;
  } catch (error) {
    console.error('Error in createPlayer function:', error);
    throw error;
  }
}

/**
 * Get equipped items for a player
 */
export async function getPlayerEquippedItems(playerId: string): Promise<Record<EquipSlot, Item | null>> {
  try {
    const query = `
      SELECT pei.slot, i.*
      FROM player_equipped_items pei
      JOIN items i ON pei.item_id = i.id
      WHERE pei.player_id = $1
    `;
    
    const result = await db.query(query, [playerId]);

    // Initialize with all slots set to null
    const equippedItems: Record<EquipSlot, Item | null> = {
      weapon: null,
      shield: null,
      head: null,
      chest: null,
      legs: null,
      hands: null,
      feet: null,
      neck: null,
      ring: null
    };
    
    // Fill in the equipped items
    if (result.rows) {
      for (const row of result.rows) {
        if (row.slot) {
          // Make sure the slot is a valid EquipSlot before assigning
          if (Object.keys(equippedItems).includes(row.slot)) {
            const item = { ...row };
            delete item.slot; // Remove slot from the item object
            equippedItems[row.slot as EquipSlot] = snakeToCamelCase(item);
          }
        }
      }
    }

    return equippedItems;
  } catch (error) {
    console.error('Error getting player equipped items:', error);
    throw error;
  }
}

/**
 * Equip an item to a specific slot
 */
export async function equipItem(playerId: string, itemId: string, slot: EquipSlot): Promise<void> {
  try {
    // First, check if the item is in the player's inventory
    const itemCheckResult = await db.query(
      'SELECT * FROM player_items WHERE player_id = $1 AND item_id = $2',
      [playerId, itemId]
    );

    if (!itemCheckResult.rows || itemCheckResult.rows.length === 0) {
      throw new Error(`Item ${itemId} not found in player's inventory`);
    }

    // Check if there's already an item in this slot
    const equippedResult = await db.query(
      'SELECT item_id FROM player_equipped_items WHERE player_id = $1 AND slot = $2',
      [playerId, slot]
    );

    // If there's an item already equipped, unequip it first
    if (equippedResult.rows && equippedResult.rows.length > 0) {
      // Move the currently equipped item back to inventory
      await db.query(
        'DELETE FROM player_equipped_items WHERE player_id = $1 AND slot = $2',
        [playerId, slot]
      );
    }

    // Remove the item from inventory
    await db.query(
      'DELETE FROM player_items WHERE player_id = $1 AND item_id = $2',
      [playerId, itemId]
    );

    // Equip the new item
    await db.query(
      'INSERT INTO player_equipped_items (player_id, item_id, slot) VALUES ($1, $2, $3)',
      [playerId, itemId, slot]
    );
  } catch (error) {
    console.error('Error equipping item:', error);
    throw error;
  }
}

/**
 * Unequip an item from a specific slot
 */
export async function unequipItem(playerId: string, slot: EquipSlot): Promise<void> {
  try {
    // Get the item currently in the slot
    const result = await db.query(
      'SELECT item_id FROM player_equipped_items WHERE player_id = $1 AND slot = $2',
      [playerId, slot]
    );

    if (!result.rows || result.rows.length === 0) {
      // No item equipped in this slot
      return;
    }

    const itemId = result.rows[0].item_id;

    // Add the item back to inventory
    await db.query(
      'INSERT INTO player_items (player_id, item_id) VALUES ($1, $2)',
      [playerId, itemId]
    );

    // Remove the item from equipped slot
    await db.query(
      'DELETE FROM player_equipped_items WHERE player_id = $1 AND slot = $2',
      [playerId, slot]
    );
  } catch (error) {
    console.error('Error unequipping item:', error);
    throw error;
  }
}