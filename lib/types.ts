// Types for the database models

export interface User {
  id: string
  name: string
  email: string
}

export interface Game {
  id: string
  name: string
  dmId: string // User ID of the Dungeon Master
  isDM?: boolean // Flag to indicate if the current user is the DM
}

export interface AbilityScores {
  strength: number
  agility: number
  stamina: number
  personality: number
  intelligence: number
  luck: number
}

export interface SavingThrows {
  fortitude: number
  reflex: number
  willpower: number
}

export interface Player {
  id: string
  gameId: string
  userId: string
  name: string
  level: number
  health: number
  maxHealth: number
  classId: string | null
  abilityScores: AbilityScores
  savingThrows: SavingThrows
  followers: number
  trendingFollowers: number
  gold: number
}

export interface Class {
  id: string
  name: string
  defaultSpells: string[] // Array of spell IDs
}

export interface Spell {
  id: string
  name: string
  description: string
}

export interface SpellPlayer {
  id: string
  playerId: string
  spellId: string
}

export interface WeaponRange {
  short?: number
  medium?: number
  long?: number
}

export interface Item {
  id: string
  name: string
  description: string
  flavorText: string
  categories: string[] // Array of category names
  // Weapon specific properties
  damage?: string
  range?: WeaponRange
  cost?: number
  special?: string[]
}

export interface ItemPlayer {
  id: string
  playerId: string
  itemId: string
}

export interface Lootbox {
  id: string
  name: string
  tier: "Bronze" | "Silver" | "Gold" | "Platinum" | "Legendary" | "Celestial"
  possibleItems: string[] // Array of item IDs
}

export interface LootboxPlayer {
  id: string
  playerId: string
  lootboxId: string
}

// Helper types for API responses
export interface PlayerWithRelations extends Player {
  class?: Class
  spells: Spell[] | string[]
  items: Item[] | string[]
  lootboxes: Lootbox[] | string[]
}

export interface GameWithPlayers extends Game {
  players: PlayerWithRelations[]
}

// Helper function to calculate ability score modifier
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}
