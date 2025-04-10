import {
  mockGames,
  mockPlayers,
  mockClasses,
  mockSpells,
  mockItems,
  mockLootboxes,
  getAbilityModifier as calculateAbilityModifier,
} from "./mock-data"

// Simulate API latency
const SIMULATE_LATENCY = false
const LATENCY_MS = 500

/**
 * Helper function to simulate API latency
 */
async function delay(ms: number): Promise<void> {
  if (SIMULATE_LATENCY) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
  return Promise.resolve()
}

/**
 * Get all games
 */
export async function getGames(): Promise<any[]> {
  await delay(LATENCY_MS)
  return [...mockGames]
}

/**
 * Get a specific game by ID
 */
export async function getGame(gameId: string): Promise<any | null> {
  await delay(LATENCY_MS)
  return mockGames.find((game) => game.id === gameId) || null
}

/**
 * Get players for a specific game
 */
export async function getGamePlayers(gameId: string): Promise<any[]> {
  await delay(LATENCY_MS)
  return mockPlayers.filter((player) => player.gameId === gameId)
}

/**
 * Get a specific player by ID
 */
export async function getPlayer(playerId: string): Promise<any | null> {
  await delay(LATENCY_MS)
  return mockPlayers.find((player) => player.id === playerId) || null
}

/**
 * Get a player by game ID and user ID
 */
export async function getPlayerByGameAndUser(gameId: string, userId: string): Promise<any | null> {
  await delay(LATENCY_MS)
  return mockPlayers.find((player) => player.gameId === gameId && player.userId === userId) || null
}

/**
 * Update a player
 */
export async function updatePlayer(playerId: string, playerData: Partial<any>): Promise<any> {
  await delay(LATENCY_MS)
  const playerIndex = mockPlayers.findIndex((player) => player.id === playerId)
  if (playerIndex === -1) {
    throw new Error(`Player with ID ${playerId} not found`)
  }

  // In a real API, this would update the database
  const updatedPlayer = { ...mockPlayers[playerIndex], ...playerData }
  mockPlayers[playerIndex] = updatedPlayer

  return updatedPlayer
}

/**
 * Get all classes
 */
export async function getClasses(): Promise<any[]> {
  await delay(LATENCY_MS)
  return [...mockClasses]
}

/**
 * Get a specific class by ID
 */
export async function getClass(classId: string): Promise<any | null> {
  await delay(LATENCY_MS)
  return mockClasses.find((cls) => cls.id === classId) || null
}

/**
 * Get all spells
 */
export async function getSpells(): Promise<any[]> {
  await delay(LATENCY_MS)
  return [...mockSpells]
}

/**
 * Get a specific spell by ID
 */
export async function getSpell(spellId: string): Promise<any | null> {
  await delay(LATENCY_MS)
  return mockSpells.find((spell) => spell.id === spellId) || null
}

/**
 * Get spells for a player
 */
export async function getPlayerSpells(player: any): Promise<any[]> {
  await delay(LATENCY_MS)
  return Promise.all(player.spells.map((spellId: string) => getSpell(spellId))).then((spells) => spells.filter(Boolean))
}

/**
 * Get all items
 */
export async function getItems(): Promise<any[]> {
  await delay(LATENCY_MS)
  return [...mockItems]
}

/**
 * Get a specific item by ID
 */
export async function getItem(itemId: string): Promise<any | null> {
  await delay(LATENCY_MS)
  return mockItems.find((item) => item.id === itemId) || null
}

/**
 * Get items for a player
 */
export async function getPlayerItems(player: any): Promise<any[]> {
  await delay(LATENCY_MS)
  return Promise.all(player.items.map((itemId: string) => getItem(itemId))).then((items) => items.filter(Boolean))
}

/**
 * Get all lootboxes
 */
export async function getLootboxes(): Promise<any[]> {
  await delay(LATENCY_MS)
  return [...mockLootboxes]
}

/**
 * Get a specific lootbox by ID
 */
export async function getLootbox(lootboxId: string): Promise<any | null> {
  await delay(LATENCY_MS)
  return mockLootboxes.find((lootbox) => lootbox.id === lootboxId) || null
}

/**
 * Get lootboxes for a player
 */
export async function getPlayerLootboxes(player: any): Promise<any[]> {
  await delay(LATENCY_MS)
  return Promise.all(player.lootboxes.map((lootboxId: string) => getLootbox(lootboxId))).then((lootboxes) =>
    lootboxes.filter(Boolean),
  )
}

/**
 * Get items in a lootbox
 */
export async function getLootboxItems(lootbox: any): Promise<any[]> {
  await delay(LATENCY_MS)
  return Promise.all(lootbox.possibleItems.map((itemId: string) => getItem(itemId))).then((items) =>
    items.filter(Boolean),
  )
}

/**
 * Calculate ability score modifier
 */
export function getAbilityModifier(score: number): number {
  return calculateAbilityModifier(score)
}

/**
 * Calculate saving throws based on ability scores and level
 */
export function calculateSavingThrows(player: any) {
  const baseValue = Math.floor(player.level / 2)

  return {
    fortitude: baseValue + getAbilityModifier(player.abilityScores.stamina),
    reflex: baseValue + getAbilityModifier(player.abilityScores.agility),
    willpower: baseValue + getAbilityModifier(player.abilityScores.personality),
  }
}

/**
 * Add item to player
 */
export async function addItemToPlayer(playerId: string, itemId: string): Promise<any> {
  await delay(LATENCY_MS)
  const playerIndex = mockPlayers.findIndex((player) => player.id === playerId)
  if (playerIndex === -1) {
    throw new Error(`Player with ID ${playerId} not found`)
  }

  // In a real API, this would update the database
  const updatedPlayer = {
    ...mockPlayers[playerIndex],
    items: [...mockPlayers[playerIndex].items, itemId],
  }
  mockPlayers[playerIndex] = updatedPlayer

  return updatedPlayer
}

/**
 * Remove item from player
 */
export async function removeItemFromPlayer(playerId: string, itemId: string): Promise<any> {
  await delay(LATENCY_MS)
  const playerIndex = mockPlayers.findIndex((player) => player.id === playerId)
  if (playerIndex === -1) {
    throw new Error(`Player with ID ${playerId} not found`)
  }

  // In a real API, this would update the database
  const updatedPlayer = {
    ...mockPlayers[playerIndex],
    items: mockPlayers[playerIndex].items.filter((id: string) => id !== itemId),
  }
  mockPlayers[playerIndex] = updatedPlayer

  return updatedPlayer
}

/**
 * Add spell to player
 */
export async function addSpellToPlayer(playerId: string, spellId: string): Promise<any> {
  await delay(LATENCY_MS)
  const playerIndex = mockPlayers.findIndex((player) => player.id === playerId)
  if (playerIndex === -1) {
    throw new Error(`Player with ID ${playerId} not found`)
  }

  // In a real API, this would update the database
  const updatedPlayer = {
    ...mockPlayers[playerIndex],
    spells: [...mockPlayers[playerIndex].spells, spellId],
  }
  mockPlayers[playerIndex] = updatedPlayer

  return updatedPlayer
}

/**
 * Remove lootbox from player
 */
export async function removeLootboxFromPlayer(playerId: string, lootboxId: string): Promise<any> {
  await delay(LATENCY_MS)
  const playerIndex = mockPlayers.findIndex((player) => player.id === playerId)
  if (playerIndex === -1) {
    throw new Error(`Player with ID ${playerId} not found`)
  }

  // In a real API, this would update the database
  const updatedPlayer = {
    ...mockPlayers[playerIndex],
    lootboxes: mockPlayers[playerIndex].lootboxes.filter((id: string) => id !== lootboxId),
  }
  mockPlayers[playerIndex] = updatedPlayer

  return updatedPlayer
}

/**
 * Update player health
 */
export async function updatePlayerHealth(playerId: string, health: number): Promise<any> {
  await delay(LATENCY_MS)
  const playerIndex = mockPlayers.findIndex((player) => player.id === playerId)
  if (playerIndex === -1) {
    throw new Error(`Player with ID ${playerId} not found`)
  }

  // In a real API, this would update the database
  const updatedPlayer = {
    ...mockPlayers[playerIndex],
    health: Math.min(Math.max(health, 0), mockPlayers[playerIndex].maxHealth),
  }
  mockPlayers[playerIndex] = updatedPlayer

  return updatedPlayer
}

/**
 * Update player gold
 */
export async function updatePlayerGold(playerId: string, gold: number): Promise<any> {
  await delay(LATENCY_MS)
  const playerIndex = mockPlayers.findIndex((player) => player.id === playerId)
  if (playerIndex === -1) {
    throw new Error(`Player with ID ${playerId} not found`)
  }

  // In a real API, this would update the database
  const updatedPlayer = {
    ...mockPlayers[playerIndex],
    gold: Math.max(gold, 0),
  }
  mockPlayers[playerIndex] = updatedPlayer

  return updatedPlayer
}

/**
 * Update player followers
 */
export async function updatePlayerFollowers(
  playerId: string,
  followers: number,
  trendingFollowers: number,
): Promise<any> {
  await delay(LATENCY_MS)
  const playerIndex = mockPlayers.findIndex((player) => player.id === playerId)
  if (playerIndex === -1) {
    throw new Error(`Player with ID ${playerId} not found`)
  }

  // In a real API, this would update the database
  const updatedPlayer = {
    ...mockPlayers[playerIndex],
    followers: Math.max(followers, 0),
    trendingFollowers: Math.max(trendingFollowers, 0),
  }
  mockPlayers[playerIndex] = updatedPlayer

  return updatedPlayer
}

/**
 * Assign class to player
 */
export async function assignClassToPlayer(playerId: string, classId: string): Promise<any> {
  await delay(LATENCY_MS)
  const playerIndex = mockPlayers.findIndex((player) => player.id === playerId)
  if (playerIndex === -1) {
    throw new Error(`Player with ID ${playerId} not found`)
  }

  const playerClass = await getClass(classId)
  if (!playerClass) {
    throw new Error(`Class with ID ${classId} not found`)
  }

  // In a real API, this would update the database
  const updatedPlayer = {
    ...mockPlayers[playerIndex],
    classId,
    spells: [...playerClass.defaultSpells],
  }
  mockPlayers[playerIndex] = updatedPlayer

  return updatedPlayer
}

/**
 * Update player ability scores
 */
export async function updatePlayerAbilityScores(playerId: string, abilityScores: any): Promise<any> {
  await delay(LATENCY_MS)
  const playerIndex = mockPlayers.findIndex((player) => player.id === playerId)
  if (playerIndex === -1) {
    throw new Error(`Player with ID ${playerId} not found`)
  }

  // In a real API, this would update the database
  const updatedPlayer = {
    ...mockPlayers[playerIndex],
    abilityScores: {
      ...mockPlayers[playerIndex].abilityScores,
      ...abilityScores,
    },
  }
  mockPlayers[playerIndex] = updatedPlayer

  return updatedPlayer
}

/**
 * Update player saving throws
 */
export async function updatePlayerSavingThrows(playerId: string, savingThrows: any): Promise<any> {
  await delay(LATENCY_MS)
  const playerIndex = mockPlayers.findIndex((player) => player.id === playerId)
  if (playerIndex === -1) {
    throw new Error(`Player with ID ${playerId} not found`)
  }

  // In a real API, this would update the database
  const updatedPlayer = {
    ...mockPlayers[playerIndex],
    savingThrows: {
      ...mockPlayers[playerIndex].savingThrows,
      ...savingThrows,
    },
  }
  mockPlayers[playerIndex] = updatedPlayer

  return updatedPlayer
}

/**
 * Delete player
 */
export async function deletePlayer(playerId: string): Promise<void> {
  await delay(LATENCY_MS)
  const playerIndex = mockPlayers.findIndex((player) => player.id === playerId)
  if (playerIndex === -1) {
    throw new Error(`Player with ID ${playerId} not found`)
  }

  // In a real API, this would update the database
  mockPlayers.splice(playerIndex, 1)

  return Promise.resolve()
}
