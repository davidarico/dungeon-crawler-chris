import { db, snakeToCamelCase } from './db.server';
import { Game, PlayerWithRelations, AbilityScores, SavingThrows } from '../types';

/**
 * Get all games
 * @param userId Optional user ID to determine if the user is a DM for each game
 */
export async function getGames(userId?: string): Promise<Game[]> {
  try {
    if (!userId) {
      return [];
    }
    
    // First, get games where the user is a DM
    const dmResult = await db.query(
      'SELECT * FROM games WHERE dm_id = $1',
      [userId]
    );
    const dmGames = dmResult.rows || [];
    
    // Then, get games where the user is a player
    const playerGamesJoinResult = await db.query(
      'SELECT game_id FROM players WHERE user_id = $1',
      [userId]
    );
    
    const playerGamesJoin = playerGamesJoinResult.rows;
    
    // If there are player games, fetch those game details
    let playerGames: any[] = [];
    if (playerGamesJoin && playerGamesJoin.length > 0) {
      const gameIds = playerGamesJoin.map(record => record.game_id);
      
      // Create placeholders for the IN query
      const placeholders = gameIds.map((_, i) => `$${i + 1}`).join(',');
      
      const gamesResult = await db.query(
        `SELECT * FROM games WHERE id IN (${placeholders})`,
        gameIds
      );
      
      playerGames = gamesResult.rows || [];
    }
    
    // Combine both sets of games
    const allGames = [...dmGames, ...playerGames];
    
    // Remove duplicates (in case user is both a DM and player in same game)
    const uniqueGames = Array.from(
      new Map(allGames.map(game => [game.id, game])).values()
    );
    
    // Transform the data and add isDM flag
    return uniqueGames.map(game => {
      const camelGame = snakeToCamelCase(game);
      return {
        ...camelGame,
        isDM: game.dm_id === userId
      };
    });
  } catch (error) {
    console.error('Error getting games:', error);
    throw error;
  }
}

/**
 * Get a specific game by ID
 * @param gameId The ID of the game to retrieve
 * @param userId Optional user ID to determine if the user is the DM
 */
export async function getGame(gameId: string, userId?: string): Promise<Game | null> {
  try {
    const result = await db.query('SELECT * FROM games WHERE id = $1', [gameId]);
    
    if (!result.rows || result.rows.length === 0) return null;
    
    const data = result.rows[0];
    const camelGame = snakeToCamelCase(data);
    
    // Add isDM property if userId is provided
    if (userId) {
      return {
        ...camelGame,
        isDM: data.dm_id === userId
      };
    }
    
    return camelGame;
  } catch (error) {
    console.error('Error getting game:', error);
    throw error;
  }
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
    
    const result = await db.query(
      'INSERT INTO games (id, name, dm_id) VALUES ($1, $2, $3) RETURNING *',
      [gameId, name, dmId]
    );
    
    if (!result.rows || result.rows.length === 0) {
      console.error('No data returned when creating game');
      throw new Error('Failed to create game - no data returned');
    }
    
    const data = result.rows[0];
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
  try {
    const playersResult = await db.query(
      'SELECT * FROM players WHERE game_id = $1',
      [gameId]
    );
    
    const players = playersResult.rows;
    
    // Transform the structure to match our frontend Player type
    if (players && players.length > 0) {
      const convertedPlayers = await Promise.all(players.map(async player => {
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
        const spellsResponse = await db.query(
          'SELECT spell_id FROM player_spells WHERE player_id = $1',
          [player.id]
        );
        
        const spellIds = spellsResponse.rows?.map(s => s.spell_id) || [];
        
        // Fetch player's items (inventory)
        const itemsResponse = await db.query(
          'SELECT item_id FROM player_items WHERE player_id = $1',
          [player.id]
        );
        
        const itemIds = itemsResponse.rows?.map(i => i.item_id) || [];
        
        // Fetch player's equipped items with full item details
        const equippedItemsResponse = await db.query(
          `SELECT pei.slot, i.* 
           FROM player_equipped_items pei
           JOIN items i ON pei.item_id = i.id
           WHERE pei.player_id = $1`,
          [player.id]
        );
        
        // Create a map of slot to equipped item
        const equippedItems: Record<string, any> = {};
        if (equippedItemsResponse.rows) {
          for (const row of equippedItemsResponse.rows) {
            const { slot, ...item } = row;
            equippedItems[slot] = snakeToCamelCase(item);
          }
        }
        
        // Fetch player's lootboxes
        const lootboxesResponse = await db.query(
          'SELECT lootbox_id FROM player_lootboxes WHERE player_id = $1',
          [player.id]
        );
        
        const lootboxIds = lootboxesResponse.rows?.map(l => l.lootbox_id) || [];
        
        return {
          ...camelPlayer,
          abilityScores,
          savingThrows,
          // Add relations arrays
          spells: spellIds,
          items: itemIds,
          equippedItems,
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
  } catch (error) {
    console.error('Error getting game players:', error);
    throw error;
  }
}