import { createClient } from '@supabase/supabase-js';
import { 
  Game, Player, Class, Spell, Item, Lootbox, 
  AbilityScores, SavingThrows
} from './types';
import { snakeToCamelCase, camelToSnakeCase } from './utils';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

// Re-export the getAbilityModifier function
export { getAbilityModifier } from './types';

/**
 * Get all games
 * @param userId Optional user ID to determine if the user is a DM for each game
 */
export async function getGames(userId?: string): Promise<Game[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*');

  if (error) throw error;
  
  if (!data) return [];
  
  // Transform the data and add isDM flag if userId is provided
  const transformedGames = data.map(game => {
    const camelGame = snakeToCamelCase(game);
    
    // Add isDM property if userId is provided
    if (userId) {
      return {
        ...camelGame,
        isDM: game.dm_id === userId
      };
    }
    
    return camelGame;
  });
  
  return transformedGames;
}

/**
 * Get a specific game by ID
 * @param gameId The ID of the game to retrieve
 * @param userId Optional user ID to determine if the user is the DM
 */
export async function getGame(gameId: string, userId?: string): Promise<Game | null> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows returned"
  
  if (!data) return null;
  
  const camelGame = snakeToCamelCase(data);
  
  // Add isDM property if userId is provided
  if (userId) {
    return {
      ...camelGame,
      isDM: data.dm_id === userId
    };
  }
  
  return camelGame;
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
  
  // Transform the structure to match our frontend Player type
  if (data && data.length > 0) {
    const convertedPlayers = data.map(player => {
      const camelPlayer = snakeToCamelCase(player);
      
      // Create nested ability scores and saving throws objects
      const abilityScores: AbilityScores = {
        strength: player.strength,
        agility: player.agility,
        stamina: player.stamina,
        personality: player.personality,
        intelligence: player.intelligence,
        luck: player.luck
      };
      
      const savingThrows: SavingThrows = {
        fortitude: player.saving_throw_fortitude,
        reflex: player.saving_throw_reflex,
        willpower: player.saving_throw_willpower
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
      };
    });
    
    return convertedPlayers as Player[];
  }
  
  return [];
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

/**
 * Get spells for a player
 */
export async function getPlayerSpells(player: Player): Promise<Spell[]> {
  const { data, error } = await supabase
    .from('player_spells')
    .select('spells(*)')
    .eq('player_id', player.id);

  if (error) throw error;
  return data?.flatMap(item => snakeToCamelCase(item.spells)) || [];
}

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
 * Get items for a player
 */
export async function getPlayerItems(player: Player): Promise<Item[]> {
  const { data, error } = await supabase
    .from('player_items')
    .select('items(*)')
    .eq('player_id', player.id);

  if (error) throw error;
  return data?.map(item => snakeToCamelCase(item.items)).flat() || [];
}

/**
 * Get all lootboxes
 */
export async function getLootboxes(): Promise<Lootbox[]> {
  const { data, error } = await supabase
    .from('lootboxes')
    .select('*');

  if (error) throw error;
  return data ? snakeToCamelCase(data) : [];
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
  return data ? snakeToCamelCase(data) : null;
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
  return data?.flatMap(item => snakeToCamelCase(item.lootboxes)) || [];
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
  return data?.flatMap(item => snakeToCamelCase(item.items)) || [];
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
 * Assign class to player
 */
export async function assignClassToPlayer(playerId: string, classId: string): Promise<Player> {
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
