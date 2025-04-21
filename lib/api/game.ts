import { supabase, snakeToCamelCase } from './utils';
import { Game, PlayerWithRelations, AbilityScores, SavingThrows } from '../types';

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
 * Create a new game
 * @param name The name of the game
 * @param dmId The user ID of the Dungeon Master
 */
export async function createGame(name: string, dmId: string): Promise<Game> {
  try {
    console.log(`Creating game with name: ${name}, DM ID: ${dmId}`);
    
    // Generate a UUID for the new game
    const gameId = crypto.randomUUID();
    
    const { data, error } = await supabase
      .from('games')
      .insert({ id: gameId, name, dm_id: dmId })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating game:', error);
      throw error;
    }
    
    if (!data) {
      console.error('No data returned when creating game');
      throw new Error('Failed to create game - no data returned');
    }
    
    console.log('Game created successfully:', data);
    
    // Return the game with isDM set to true since the creator is the DM
    const camelGame = snakeToCamelCase(data);
    return {
      ...camelGame,
      isDM: true
    };
  } catch (error) {
    console.error('Error in createGame function:', error);
    throw error;
  }
}

/**
 * Get players for a specific game
 */
export async function getGamePlayers(gameId: string): Promise<PlayerWithRelations[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('game_id', gameId);

  if (error) throw error;
  
  // Transform the structure to match our frontend Player type
  if (data && data.length > 0) {
    const convertedPlayers = await Promise.all(data.map(async player => {
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
      
      // Fetch player's spells
      const spellsResponse = await supabase
        .from('player_spells')
        .select('spell_id')
        .eq('player_id', player.id);
      
      const spellIds = spellsResponse.error ? [] : spellsResponse.data.map(s => s.spell_id);
      
      // Fetch player's items
      const itemsResponse = await supabase
        .from('player_items')
        .select('item_id')
        .eq('player_id', player.id);
      
      const itemIds = itemsResponse.error ? [] : itemsResponse.data.map(i => i.item_id);
      
      // Fetch player's lootboxes
      const lootboxesResponse = await supabase
        .from('player_lootboxes')
        .select('lootbox_id')
        .eq('player_id', player.id);
      
      const lootboxIds = lootboxesResponse.error ? [] : lootboxesResponse.data.map(l => l.lootbox_id);
      
      return {
        ...camelPlayer,
        abilityScores,
        savingThrows,
        // Add relations arrays
        spells: spellIds,
        items: itemIds,
        lootboxes: lootboxIds,
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
    }));
    
    return convertedPlayers as PlayerWithRelations[];
  }
  
  return [];
}