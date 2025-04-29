import { supabase, snakeToCamelCase, camelToSnakeCase } from './utils';
import {
  Player, PlayerWithRelations, AbilityScores, SavingThrows,
  Spell, Item, Lootbox, EquipSlot
} from '../types';

/**
 * Get a specific player by ID
 */
export async function getPlayer(playerId: string): Promise<Player | null> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', playerId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  
  if (!data) return null;
  
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
}

/**
 * Get a player by game ID and user ID
 */
export async function getPlayerByGameAndUser(gameId: string, userId: string): Promise<Player | null> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('game_id', gameId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data ? snakeToCamelCase(data) : null;
}

/**
 * Update a player
 */
export async function updatePlayer(playerId: string, playerData: Partial<Player>): Promise<Player> {
  const snakeData = camelToSnakeCase(playerData);
  const { data, error } = await supabase
    .from('players')
    .update(snakeData)
    .eq('id', playerId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error(`Player with ID ${playerId} not found`);
  return snakeToCamelCase(data);
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
    
    const { data, error } = await supabase
      .from('spells')
      .select('*')
      .in('id', spellIds);
      
    if (error) throw error;
    return data ? snakeToCamelCase(data) : [];
  }
  
  // Original implementation for when player doesn't have spells property
  const { data, error } = await supabase
    .from('player_spells')
    .select('spells(*)')
    .eq('player_id', player.id);

  if (error) throw error;
  return data?.flatMap(item => snakeToCamelCase(item.spells)) || [];
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
    
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .in('id', itemIds);
      
    if (error) throw error;
    return data ? snakeToCamelCase(data) : [];
  }
  
  // Original implementation for when player doesn't have items property
  const { data, error } = await supabase
    .from('player_items')
    .select('items(*)')
    .eq('player_id', player.id);

  if (error) throw error;
  return data?.map(item => snakeToCamelCase(item.items)).flat() || [];
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
    
    const { data, error } = await supabase
      .from('lootboxes')
      .select('*')
      .in('id', lootboxIds);
      
    if (error) throw error;
    return data ? snakeToCamelCase(data) : [];
  }
  
  // Original implementation for when player doesn't have lootboxes property
  const { data, error } = await supabase
    .from('player_lootboxes')
    .select('lootboxes(*)')
    .eq('player_id', player.id);

  if (error) throw error;
  return data?.flatMap(item => snakeToCamelCase(item.lootboxes)) || [];
}

/**
 * Add item to player
 */
export async function addItemToPlayer(playerId: string, itemId: string): Promise<Player> {
  const player = await getPlayer(playerId);
  if (!player) {
    throw new Error(`Player with ID ${playerId} not found`);
  }

  const { error } = await supabase
    .from('player_items')
    .insert({ player_id: playerId, item_id: itemId });

  if (error) throw error;

  return player;
}

/**
 * Remove item from player
 */
export async function removeItemFromPlayer(playerId: string, itemId: string): Promise<Player> {
  const player = await getPlayer(playerId);
  if (!player) {
    throw new Error(`Player with ID ${playerId} not found`);
  }

  const { error } = await supabase
    .from('player_items')
    .delete()
    .eq('player_id', playerId)
    .eq('item_id', itemId);

  if (error) throw error;

  return player;
}

/**
 * Add spell to player
 */
export async function addSpellToPlayer(playerId: string, spellId: string): Promise<Player> {
  const player = await getPlayer(playerId);
  if (!player) {
    throw new Error(`Player with ID ${playerId} not found`);
  }

  const { error } = await supabase
    .from('player_spells')
    .insert({ player_id: playerId, spell_id: spellId });

  if (error) throw error;

  return player;
}

/**
 * Remove lootbox from player
 */
export async function removeLootboxFromPlayer(playerId: string, lootboxId: string): Promise<Player> {
  const player = await getPlayer(playerId);
  if (!player) {
    throw new Error(`Player with ID ${playerId} not found`);
  }

  const { error } = await supabase
    .from('player_lootboxes')
    .delete()
    .eq('player_id', playerId)
    .eq('lootbox_id', lootboxId);

  if (error) throw error;

  return player;
}

/**
 * Update player health
 */
export async function updatePlayerHealth(playerId: string, health: number): Promise<Player> {
  const player = await getPlayer(playerId);
  if (!player) {
    throw new Error(`Player with ID ${playerId} not found`);
  }

  const newHealth = Math.min(Math.max(health, 0), player.maxHealth);

  const { data, error } = await supabase
    .from('players')
    .update({ health: newHealth })
    .eq('id', playerId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error(`Player with ID ${playerId} not found`);
  
  return snakeToCamelCase(data);
}

/**
 * Update player gold
 */
export async function updatePlayerGold(playerId: string, gold: number): Promise<Player> {
  const newGold = Math.max(gold, 0);

  const { data, error } = await supabase
    .from('players')
    .update({ gold: newGold })
    .eq('id', playerId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error(`Player with ID ${playerId} not found`);
  
  return snakeToCamelCase(data);
}

/**
 * Update player followers
 */
export async function updatePlayerFollowers(
  playerId: string,
  followers: number,
  trendingFollowers: number,
): Promise<Player> {
  const newFollowers = Math.max(followers, 0);
  const newTrendingFollowers = Math.max(trendingFollowers, 0);

  const { data, error } = await supabase
    .from('players')
    .update({ 
      followers: newFollowers, 
      trending_followers: newTrendingFollowers 
    })
    .eq('id', playerId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error(`Player with ID ${playerId} not found`);
  
  return snakeToCamelCase(data);
}

/**
 * Update player ability scores
 */
export async function updatePlayerAbilityScores(playerId: string, abilityScores: Partial<AbilityScores>): Promise<Player> {
  const snakeScores = camelToSnakeCase(abilityScores);
  const { data, error } = await supabase
    .from('players')
    .update(snakeScores)
    .eq('id', playerId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error(`Player with ID ${playerId} not found`);
  
  return snakeToCamelCase(data);
}

/**
 * Update player saving throws
 */
export async function updatePlayerSavingThrows(playerId: string, savingThrows: Partial<SavingThrows>): Promise<Player> {
  const snakeThrows = camelToSnakeCase(savingThrows);
  const { data, error } = await supabase
    .from('players')
    .update(snakeThrows)
    .eq('id', playerId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error(`Player with ID ${playerId} not found`);
  
  return snakeToCamelCase(data);
}

/**
 * Delete player
 */
export async function deletePlayer(playerId: string): Promise<void> {
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('id', playerId);

  if (error) throw error;
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
    const defaultPlayerData = {
      id: playerId,
      game_id: gameId,
      user_id: userId,
      name,
      level: 1,
      health: 10,
      max_health: 10,
      class_id: null,
      followers: 0,
      trending_followers: 0,
      gold: 0,
      ...defaultAbilityScores,
      ...defaultSavingThrows
    };
    
    const { data, error } = await supabase
      .from('players')
      .insert(defaultPlayerData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating player:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('No data returned when creating player');
    }
    
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
  const { data, error } = await supabase
    .from('player_equipped_items')
    .select('*, items(*)')
    .eq('player_id', playerId);

  if (error) throw error;

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
  if (data) {
    for (const row of data) {
      if (row.slot && row.items) {
        // Make sure the slot is a valid EquipSlot before assigning
        if (Object.keys(equippedItems).includes(row.slot)) {
          equippedItems[row.slot as EquipSlot] = snakeToCamelCase(row.items);
        }
      }
    }
  }

  return equippedItems;
}

/**
 * Equip an item to a specific slot
 */
export async function equipItem(playerId: string, itemId: string, slot: EquipSlot): Promise<void> {
  // First, check if the item is in the player's inventory
  const { data: itemCheck, error: itemCheckError } = await supabase
    .from('player_items')
    .select('*')
    .eq('player_id', playerId)
    .eq('item_id', itemId);

  if (itemCheckError) throw itemCheckError;
  if (!itemCheck || itemCheck.length === 0) {
    throw new Error(`Item ${itemId} not found in player's inventory`);
  }

  // Check if there's already an item in this slot
  const { data: currentlyEquipped, error: equippedError } = await supabase
    .from('player_equipped_items')
    .select('item_id')
    .eq('player_id', playerId)
    .eq('slot', slot)
    .single();

  if (equippedError && equippedError.code !== 'PGRST116') throw equippedError;

  // If there's an item already equipped, unequip it first
  if (currentlyEquipped) {
    // Move the currently equipped item back to inventory
    const { error: unequipError } = await supabase
      .from('player_equipped_items')
      .delete()
      .eq('player_id', playerId)
      .eq('slot', slot);

    if (unequipError) throw unequipError;
  }

  // Remove the item from inventory
  const { error: removeError } = await supabase
    .from('player_items')
    .delete()
    .eq('player_id', playerId)
    .eq('item_id', itemId);

  if (removeError) throw removeError;

  // Equip the new item
  const { error: equipError } = await supabase
    .from('player_equipped_items')
    .insert({
      player_id: playerId,
      item_id: itemId,
      slot
    });

  if (equipError) throw equipError;
}

/**
 * Unequip an item from a specific slot
 */
export async function unequipItem(playerId: string, slot: EquipSlot): Promise<void> {
  // Get the item currently in the slot
  const { data, error } = await supabase
    .from('player_equipped_items')
    .select('item_id')
    .eq('player_id', playerId)
    .eq('slot', slot)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No item equipped in this slot
      return;
    }
    throw error;
  }

  if (!data) return;

  // Add the item back to inventory
  const { error: addError } = await supabase
    .from('player_items')
    .insert({
      player_id: playerId,
      item_id: data.item_id
    });

  if (addError) throw addError;

  // Remove the item from equipped slot
  const { error: removeError } = await supabase
    .from('player_equipped_items')
    .delete()
    .eq('player_id', playerId)
    .eq('slot', slot);

  if (removeError) throw removeError;
}