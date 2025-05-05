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

export async function fetchGame(gameId: string) {
  const response = await fetch(`/api/games/${gameId}`);
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
  const response = await fetch(`/api/items?id=${itemId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch item with ID ${itemId}`);
  }
  return response.json() as Promise<Item>;
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