/**
 * CLIENT-SIDE UTILITIES
 * This file contains utilities for making API calls from client components.
 * Do NOT import any server-only modules in this file.
 */

import { Game, Player, Class, Spell, Item, Lootbox } from './types';

// GAMES
export async function fetchGames() {
  const response = await fetch('/api/games');
  if (!response.ok) {
    throw new Error('Failed to fetch games');
  }
  return response.json() as Promise<Game[]>;
}

export async function fetchGame(gameId: string, isInvite = false) {
  const url = isInvite 
    ? `/api/games/${gameId}?invite=true`
    : `/api/games/${gameId}`;
    
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch game with ID ${gameId}`);
  }
  return response.json() as Promise<Game>;
}

export async function fetchGamePlayers(gameId: string) {
  const response = await fetch(`/api/games/${gameId}/players`);
  if (!response.ok) {
    throw new Error(`Failed to fetch players for game with ID ${gameId}`);
  }
  return response.json() as Promise<Player[]>;
}

export async function createGame(name: string) {
  const response = await fetch('/api/games', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  
  if (!response.ok) {
    throw new Error('Failed to create game');
  }
  return response.json() as Promise<Game>;
}

// PLAYERS
export async function fetchPlayers() {
  const response = await fetch('/api/players');
  if (!response.ok) {
    throw new Error('Failed to fetch players');
  }
  return response.json();
}

export async function fetchPlayer(playerId: string) {
  const response = await fetch(`/api/players/${playerId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch player with ID ${playerId}`);
  }
  return response.json();
}

// PLAYER DATA
export async function fetchPlayerByGameAndUser(gameId: string) {
  const response = await fetch(`/api/players/game-user/${gameId}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch player for game ${gameId}`);
  }
  return response.json();
}

export async function fetchPlayerEquipment(playerId: string) {
  const response = await fetch(`/api/players/${playerId}/equipment`);
  if (!response.ok) {
    throw new Error(`Failed to fetch equipment for player ${playerId}`);
  }
  return response.json();
}

export async function fetchPlayerItems(playerId: string) {
  const response = await fetch(`/api/players/${playerId}/items`);
  if (!response.ok) {
    throw new Error(`Failed to fetch items for player ${playerId}`);
  }
  return response.json();
}

export async function fetchPlayerSpells(playerId: string) {
  const response = await fetch(`/api/players/${playerId}/spells`);
  if (!response.ok) {
    throw new Error(`Failed to fetch spells for player ${playerId}`);
  }
  return response.json();
}

export async function fetchPlayerLootboxes(playerId: string) {
  const response = await fetch(`/api/players/${playerId}/lootboxes`);
  if (!response.ok) {
    throw new Error(`Failed to fetch lootboxes for player ${playerId}`);
  }
  return response.json();
}

export async function removeItemFromPlayer(playerId: string, itemId: string) {
  const response = await fetch(`/api/players/${playerId}/items?itemId=${itemId}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error(`Failed to remove item ${itemId} from player ${playerId}`);
  }
  return response.json();
}

export async function addItemToPlayer(playerId: string, itemId: string) {
  const response = await fetch(`/api/players/${playerId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId })
  });
  if (!response.ok) {
    throw new Error(`Failed to add item ${itemId} to player ${playerId}`);
  }
  return response.json();
}

export async function removeLootboxFromPlayer(playerId: string, lootboxId: string) {
  const response = await fetch(`/api/players/${playerId}/lootboxes?lootboxId=${lootboxId}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error(`Failed to remove lootbox ${lootboxId} from player ${playerId}`);
  }
  return response.json();
}

export async function updatePlayerHealth(playerId: string, health: number) {
  const response = await fetch(`/api/players/${playerId}/health`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ health })
  });
  if (!response.ok) {
    throw new Error(`Failed to update health for player ${playerId}`);
  }
  return response.json();
}

export async function updatePlayerAbilityScores(playerId: string, abilityScores: any) {
  const response = await fetch(`/api/players/${playerId}/ability-scores`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(abilityScores)
  });
  if (!response.ok) {
    throw new Error(`Failed to update ability scores for player ${playerId}`);
  }
  return response.json();
}

export async function updatePlayerSavingThrows(playerId: string, savingThrows: any) {
  const response = await fetch(`/api/players/${playerId}/saving-throws`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(savingThrows)
  });
  if (!response.ok) {
    throw new Error(`Failed to update saving throws for player ${playerId}`);
  }
  return response.json();
}

export async function updatePlayerFollowers(playerId: string, followers: number, trending: number) {
  const response = await fetch(`/api/players/${playerId}/followers`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ followers, trending })
  });
  if (!response.ok) {
    throw new Error(`Failed to update followers for player ${playerId}`);
  }
  return response.json();
}

export async function updatePlayerGold(playerId: string, crawlerCredit: number) {
  const response = await fetch(`/api/players/${playerId}/gold`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gold: crawlerCredit })
  });
  if (!response.ok) {
    throw new Error(`Failed to update crawler credit for player ${playerId}`);
  }
  return response.json();
}

export async function equipItem(playerId: string, itemId: string, slot: string) {
  const response = await fetch(`/api/players/${playerId}/equipment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId, slot })
  });
  if (!response.ok) {
    throw new Error(`Failed to equip item ${itemId} for player ${playerId}`);
  }
  return response.json();
}

export async function unequipItem(playerId: string, slot: string) {
  const response = await fetch(`/api/players/${playerId}/equipment?slot=${slot}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error(`Failed to unequip item from slot ${slot} for player ${playerId}`);
  }
  return response.json();
}

export async function getLootboxItems(lootbox: any) {
  const response = await fetch(`/api/lootboxes/${lootbox.id}/items`);
  if (!response.ok) {
    throw new Error(`Failed to fetch items for lootbox ${lootbox.id}`);
  }
  return response.json();
}

// CLASSES
export async function fetchClasses() {
  const response = await fetch('/api/classes');
  if (!response.ok) {
    throw new Error('Failed to fetch classes');
  }
  return response.json() as Promise<Class[]>;
}

export async function fetchClass(classId: string) {
  const response = await fetch(`/api/classes/${classId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch class with ID ${classId}`);
  }
  return response.json() as Promise<Class>;
}

export async function assignClassToPlayer(playerId: string, classId: string) {
  const response = await fetch(`/api/players/${playerId}/class`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ classId })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to assign class ${classId} to player ${playerId}`);
  }
  return response.json();
}

// SPELLS
export async function fetchSpells() {
  const response = await fetch('/api/spells');
  if (!response.ok) {
    throw new Error('Failed to fetch spells');
  }
  return response.json() as Promise<Spell[]>;
}

export async function fetchSpell(spellId: string) {
  const response = await fetch(`/api/spells/${spellId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch spell with ID ${spellId}`);
  }
  return response.json() as Promise<Spell>;
}

// ITEMS
export async function fetchItems() {
  const response = await fetch('/api/items');
  if (!response.ok) {
    throw new Error('Failed to fetch items');
  }
  return response.json() as Promise<Item[]>;
}

export async function fetchItem(itemId: string) {
  const response = await fetch(`/api/items/${itemId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch item with ID ${itemId}`);
  }
  return response.json() as Promise<Item>;
}

// Add these new functions for item generation
export async function generateItems(prompt: string, category: string, equipmentSlot?: string) {
  const response = await fetch('/api/generate-items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, category, equipmentSlot }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate items');
  }
  
  return response.json();
}

export async function createItems(items: Omit<Item, 'id'>[]) {
  const response = await fetch('/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create items');
  }
  
  return response.json();
}

// LOOTBOXES
export async function fetchLootboxes() {
  const response = await fetch('/api/lootboxes');
  if (!response.ok) {
    throw new Error('Failed to fetch lootboxes');
  }
  return response.json() as Promise<Lootbox[]>;
}

export async function fetchLootbox(lootboxId: string) {
  const response = await fetch(`/api/lootboxes/${lootboxId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch lootbox with ID ${lootboxId}`);
  }
  return response.json() as Promise<Lootbox>;
}

// PLAYER-GAME RELATIONSHIP
export async function checkPlayerInGame(gameId: string) {
  const response = await fetch(`/api/players/game-user?gameId=${gameId}`);
  if (!response.ok) {
    // Return null if there's an error or unauthorized (we'll handle this in the UI)
    if (response.status === 401) return null;
    throw new Error(`Failed to check player in game ${gameId}`);
  }
  return response.json();
}

export async function createPlayerForGame(gameId: string, name: string) {
  const response = await fetch('/api/players/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId, name })
  });
  
  if (!response.ok) {
    throw new Error('Failed to create player');
  }
  return response.json();
}

/**
 * Get the modifier value for an ability score
 * This is a client-safe version of the function that can be used in components
 */
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}