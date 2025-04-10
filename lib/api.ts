import { createClient } from '@supabase/supabase-js';
import { getAbilityModifier as calculateAbilityModifier } from "./mock-data";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

// Type definitions based on database schema
type Game = {
  id: string;
  name: string;
  dm_id: string;
  is_dm: boolean;
};

type Player = {
  id: string;
  game_id: string;
  user_id: string;
  name: string;
  level: number;
  health: number;
  max_health: number;
  class_id: string;
  strength: number;
  agility: number;
  stamina: number;
  personality: number;
  intelligence: number;
  luck: number;
  saving_throw_fortitude: number;
  saving_throw_reflex: number;
  saving_throw_willpower: number;
  followers: number;
  trending_followers: number;
  gold: number;
};

type Class = {
  id: string;
  name: string;
};

type Spell = {
  id: string;
  name: string;
  description: string;
};

type Item = {
  id: string;
  name: string;
  description: string;
  flavor_text: string;
  categories: string[];
  damage: string;
  range: any;
  cost: number;
  special: string[];
};

type Lootbox = {
  id: string;
  name: string;
  tier: string;
};

/**
 * Get all games
 */
export async function getGames(): Promise<Game[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*');

  if (error) throw error;
  return data || [];
}

/**
 * Get a specific game by ID
 */
export async function getGame(gameId: string): Promise<Game | null> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows returned"
  return data;
}

/**
 * Get players for a specific game
 */
export async function getGamePlayers(gameId: string): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('game_id', gameId);

  if (error) throw error;
  return data || [];
}

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
  return data;
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
  return data;
}

/**
 * Update a player
 */
export async function updatePlayer(playerId: string, playerData: Partial<Player>): Promise<Player> {
  const { data, error } = await supabase
    .from('players')
    .update(playerData)
    .eq('id', playerId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error(`Player with ID ${playerId} not found`);
  return data;
}

/**
 * Get all classes
 */
export async function getClasses(): Promise<Class[]> {
  const { data, error } = await supabase
    .from('classes')
    .select('*');

  if (error) throw error;
  return data || [];
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
  return data;
}

/**
 * Get all spells
 */
export async function getSpells(): Promise<Spell[]> {
  const { data, error } = await supabase
    .from('spells')
    .select('*');

  if (error) throw error;
  return data || [];
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
  return data;
}

/**
 * Get spells for a player
 */
export async function getPlayerSpells(player: Player): Promise<Spell[]> {
  const { data, error } = await supabase
    .from('player_spells')
    .select('spells(*)')
    .eq('player_id', player.id);

  if (error) throw error;
  return data?.flatMap(item => item.spells) || [];
}

/**
 * Get all items
 */
export async function getItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items')
    .select('*');

  if (error) throw error;
  return data || [];
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
  return data;
}

/**
 * Get items for a player
 */
export async function getPlayerItems(player: Player): Promise<Item[]> {
  const { data, error } = await supabase
    .from('player_items')
    .select('items(*)')
    .eq('player_id', player.id);

  if (error) throw error;
  return data?.map(item => item.items).flat() || [];
}

/**
 * Get all lootboxes
 */
export async function getLootboxes(): Promise<Lootbox[]> {
  const { data, error } = await supabase
    .from('lootboxes')
    .select('*');

  if (error) throw error;
  return data || [];
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
  return data;
}

/**
 * Get lootboxes for a player
 */
export async function getPlayerLootboxes(player: Player): Promise<Lootbox[]> {
  const { data, error } = await supabase
    .from('player_lootboxes')
    .select('lootboxes(*)')
    .eq('player_id', player.id);

  if (error) throw error;
  return data?.flatMap(item => item.lootboxes) || [];
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
  return data?.flatMap(item => item.items) || [];
}

/**
 * Calculate ability score modifier
 */
export function getAbilityModifier(score: number): number {
  return calculateAbilityModifier(score);
}

/**
 * Calculate saving throws based on ability scores and level
 */
export function calculateSavingThrows(player: Player) {
  const baseValue = Math.floor(player.level / 2);

  return {
    fortitude: baseValue + getAbilityModifier(player.stamina),
    reflex: baseValue + getAbilityModifier(player.agility),
    willpower: baseValue + getAbilityModifier(player.personality),
  };
}

/**
 * Add item to player
 */
export async function addItemToPlayer(playerId: string, itemId: string): Promise<Player> {
  // First check if the player exists
  const player = await getPlayer(playerId);
  if (!player) {
    throw new Error(`Player with ID ${playerId} not found`);
  }

  // Insert into the join table
  const { error } = await supabase
    .from('player_items')
    .insert({ player_id: playerId, item_id: itemId });

  if (error) throw error;

  // Return the updated player
  return player;
}

/**
 * Remove item from player
 */
export async function removeItemFromPlayer(playerId: string, itemId: string): Promise<Player> {
  // First check if the player exists
  const player = await getPlayer(playerId);
  if (!player) {
    throw new Error(`Player with ID ${playerId} not found`);
  }

  // Delete from the join table
  const { error } = await supabase
    .from('player_items')
    .delete()
    .eq('player_id', playerId)
    .eq('item_id', itemId);

  if (error) throw error;

  // Return the updated player
  return player;
}

/**
 * Add spell to player
 */
export async function addSpellToPlayer(playerId: string, spellId: string): Promise<Player> {
  // First check if the player exists
  const player = await getPlayer(playerId);
  if (!player) {
    throw new Error(`Player with ID ${playerId} not found`);
  }

  // Insert into the join table
  const { error } = await supabase
    .from('player_spells')
    .insert({ player_id: playerId, spell_id: spellId });

  if (error) throw error;

  // Return the updated player
  return player;
}

/**
 * Remove lootbox from player
 */
export async function removeLootboxFromPlayer(playerId: string, lootboxId: string): Promise<Player> {
  // First check if the player exists
  const player = await getPlayer(playerId);
  if (!player) {
    throw new Error(`Player with ID ${playerId} not found`);
  }

  // Delete from the join table
  const { error } = await supabase
    .from('player_lootboxes')
    .delete()
    .eq('player_id', playerId)
    .eq('lootbox_id', lootboxId);

  if (error) throw error;

  // Return the updated player
  return player;
}

/**
 * Update player health
 */
export async function updatePlayerHealth(playerId: string, health: number): Promise<Player> {
  // Get the player to check maxHealth
  const player = await getPlayer(playerId);
  if (!player) {
    throw new Error(`Player with ID ${playerId} not found`);
  }

  // Calculate the new health value within bounds
  const newHealth = Math.min(Math.max(health, 0), player.max_health);

  // Update the player
  const { data, error } = await supabase
    .from('players')
    .update({ health: newHealth })
    .eq('id', playerId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error(`Player with ID ${playerId} not found`);
  
  return data;
}

/**
 * Update player gold
 */
export async function updatePlayerGold(playerId: string, gold: number): Promise<Player> {
  // Ensure gold is not negative
  const newGold = Math.max(gold, 0);

  // Update the player
  const { data, error } = await supabase
    .from('players')
    .update({ gold: newGold })
    .eq('id', playerId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error(`Player with ID ${playerId} not found`);
  
  return data;
}

/**
 * Update player followers
 */
export async function updatePlayerFollowers(
  playerId: string,
  followers: number,
  trendingFollowers: number,
): Promise<Player> {
  // Ensure values are not negative
  const newFollowers = Math.max(followers, 0);
  const newTrendingFollowers = Math.max(trendingFollowers, 0);

  // Update the player
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
  
  return data;
}

/**
 * Assign class to player
 */
export async function assignClassToPlayer(playerId: string, classId: string): Promise<Player> {
  // Check if player exists
  const player = await getPlayer(playerId);
  if (!player) {
    throw new Error(`Player with ID ${playerId} not found`);
  }

  // Check if class exists
  const playerClass = await getClass(classId);
  if (!playerClass) {
    throw new Error(`Class with ID ${classId} not found`);
  }

  // Start a transaction to update the player and add default spells
  // First, update the player's class
  const { data, error } = await supabase
    .from('players')
    .update({ class_id: classId })
    .eq('id', playerId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error(`Failed to update player with ID ${playerId}`);

  // Get default spells for this class
  const { data: defaultSpells, error: spellsError } = await supabase
    .from('class_default_spells')
    .select('spell_id')
    .eq('class_id', classId);

  if (spellsError) throw spellsError;

  // If there are default spells, add them to the player
  if (defaultSpells && defaultSpells.length > 0) {
    // First, remove existing spells
    await supabase
      .from('player_spells')
      .delete()
      .eq('player_id', playerId);

    // Then add default spells
    const spellInserts = defaultSpells.map(spell => ({
      player_id: playerId,
      spell_id: spell.spell_id
    }));

    const { error: insertError } = await supabase
      .from('player_spells')
      .insert(spellInserts);

    if (insertError) throw insertError;
  }

  return data;
}

/**
 * Update player ability scores
 */
export async function updatePlayerAbilityScores(playerId: string, abilityScores: Partial<{
  strength: number;
  agility: number;
  stamina: number;
  personality: number;
  intelligence: number;
  luck: number;
}>): Promise<Player> {
  // Update the player
  const { data, error } = await supabase
    .from('players')
    .update(abilityScores)
    .eq('id', playerId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error(`Player with ID ${playerId} not found`);
  
  return data;
}

/**
 * Update player saving throws
 */
export async function updatePlayerSavingThrows(playerId: string, savingThrows: Partial<{
  saving_throw_fortitude: number;
  saving_throw_reflex: number;
  saving_throw_willpower: number;
}>): Promise<Player> {
  // Update the player
  const { data, error } = await supabase
    .from('players')
    .update(savingThrows)
    .eq('id', playerId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error(`Player with ID ${playerId} not found`);
  
  return data;
}

/**
 * Delete player
 */
export async function deletePlayer(playerId: string): Promise<void> {
  // Delete the player
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('id', playerId);

  if (error) throw error;
}
