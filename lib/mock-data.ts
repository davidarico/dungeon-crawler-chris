// Mock data for development

// Game data
export const mockGames = [
  {
    id: "game-1",
    name: "The Dungeon of Doom",
    dmId: "user-1",
    isDM: true,
  },
  {
    id: "game-2",
    name: "Caverns of Chaos",
    dmId: "user-2",
    isDM: false,
  },
  {
    id: "game-3",
    name: "Realm of Shadows",
    dmId: "user-1",
    isDM: true,
  },
]

// Classes with default spells
export const mockClasses = [
  {
    id: "class-1",
    name: "Warrior",
    defaultSpells: ["spell-1", "spell-2"],
  },
  {
    id: "class-2",
    name: "Mage",
    defaultSpells: ["spell-3", "spell-4", "spell-5"],
  },
  {
    id: "class-3",
    name: "Rogue",
    defaultSpells: ["spell-6", "spell-7"],
  },
  {
    id: "class-4",
    name: "Cleric",
    defaultSpells: ["spell-8", "spell-9", "spell-10"],
  },
]

// Spells
export const mockSpells = [
  {
    id: "spell-1",
    name: "Mighty Swing",
    description: "A powerful attack that deals extra damage",
  },
  {
    id: "spell-2",
    name: "Shield Wall",
    description: "Increases defense for 3 turns",
  },
  {
    id: "spell-3",
    name: "Fireball",
    description: "Launches a ball of fire that explodes on impact",
  },
  {
    id: "spell-4",
    name: "Ice Shard",
    description: "Fires a shard of ice that slows enemies",
  },
  {
    id: "spell-5",
    name: "Arcane Missile",
    description: "Fires multiple homing arcane projectiles",
  },
  {
    id: "spell-6",
    name: "Backstab",
    description: "Deals massive damage when attacking from behind",
  },
  {
    id: "spell-7",
    name: "Smoke Bomb",
    description: "Creates a cloud of smoke for escape",
  },
  {
    id: "spell-8",
    name: "Heal",
    description: "Restores health to a target",
  },
  {
    id: "spell-9",
    name: "Divine Shield",
    description: "Creates a protective barrier around an ally",
  },
  {
    id: "spell-10",
    name: "Smite",
    description: "Calls down divine energy to damage enemies",
  },
]

// Items
export const mockItems = [
  {
    id: "item-1",
    name: "Longsword",
    description: "A well-crafted longsword with a sharp edge",
    flavorText: "The previous owner's name is etched on the hilt",
    categories: ["Weapon", "Sharp", "Metal"],
    damage: "1d8",
    range: null,
    cost: 15,
    special: [],
  },
  {
    id: "item-2",
    name: "Potion of Healing",
    description: "Restores 20 health when consumed",
    flavorText: "Tastes like cherry cough syrup",
    categories: ["Consumable", "Magical", "Healing"],
  },
  {
    id: "item-3",
    name: "Dagger",
    description: "A small but deadly blade",
    flavorText: "Small enough to hide in your boot",
    categories: ["Weapon", "Sharp", "Metal"],
    damage: "1d4",
    range: {
      short: 10,
      medium: 20,
      long: 30,
    },
    cost: 2,
    special: ["Concealable"],
  },
  {
    id: "item-4",
    name: "Great Axe",
    description: "A massive axe that requires two hands to wield",
    flavorText: "The blade gleams with a thirst for blood",
    categories: ["Weapon", "Sharp", "Metal"],
    damage: "1d12",
    range: null,
    cost: 10,
    special: ["Two-handed"],
  },
  {
    id: "item-5",
    name: "Short Bow",
    description: "A compact bow ideal for hunting",
    flavorText: "The string is made from elven hair",
    categories: ["Weapon", "Ranged", "Wooden"],
    damage: "1d6",
    range: {
      short: 50,
      medium: 100,
      long: 150,
    },
    cost: 25,
    special: ["Reload"],
  },
  {
    id: "item-6",
    name: "Boots of Speed",
    description: "Increases movement speed by 30%",
    flavorText: "Laces always come untied at the worst moment",
    categories: ["Wearable", "Magical", "Movement"],
  },
  {
    id: "item-7",
    name: "Cheese Wheel",
    description: "Restores 5 health when consumed",
    flavorText: "Has a Strong Cheese Odor",
    categories: ["Consumable", "Food", "Smelly"],
  },
  {
    id: "item-8",
    name: "Rapier",
    description: "A slender, sharply pointed sword",
    flavorText: "The blade whistles as it cuts through the air",
    categories: ["Weapon", "Sharp", "Metal"],
    damage: "1d6",
    range: null,
    cost: 15,
    special: ["Agility"],
  },
  {
    id: "item-9",
    name: "Crossbow, Hand",
    description: "A compact crossbow that can be fired with one hand",
    flavorText: "Small but packs a punch",
    categories: ["Weapon", "Ranged", "Wooden"],
    damage: "1d6",
    range: {
      short: 40,
      medium: 80,
      long: 120,
    },
    cost: 50,
    special: ["Reload"],
  },
  {
    id: "item-10",
    name: "Whip",
    description: "A flexible weapon with extended reach",
    flavorText: "Cracks like thunder when used properly",
    categories: ["Weapon", "Flexible", "Leather"],
    damage: "1d8",
    range: null,
    cost: 25,
    special: ["Agility", "Stretch"],
  },
]

// Lootboxes
export const mockLootboxes = [
  {
    id: "lootbox-1",
    name: "Warrior's Cache",
    tier: "Bronze",
    possibleItems: ["item-1", "item-4"],
  },
  {
    id: "lootbox-2",
    name: "Mage's Mystery Box",
    tier: "Silver",
    possibleItems: ["item-3", "item-5"],
  },
  {
    id: "lootbox-3",
    name: "Adventurer's Treasure",
    tier: "Gold",
    possibleItems: ["item-2", "item-6", "item-7"],
  },
  {
    id: "lootbox-4",
    name: "Dragon's Hoard",
    tier: "Platinum",
    possibleItems: ["item-1", "item-3", "item-5"],
  },
  {
    id: "lootbox-5",
    name: "Ancient Artifact",
    tier: "Legendary",
    possibleItems: ["item-1", "item-5"],
  },
]

// Players
export const mockPlayers = [
  {
    id: "player-1",
    gameId: "game-1",
    userId: "user-2",
    name: "Thorgar",
    level: 5,
    health: 45,
    maxHealth: 50,
    classId: "class-1",
    spells: ["spell-1", "spell-2"],
    items: ["item-1", "item-4"],
    lootboxes: ["lootbox-1"],
    abilityScores: {
      strength: 16,
      agility: 12,
      stamina: 15,
      personality: 8,
      intelligence: 10,
      luck: 14,
    },
    savingThrows: {
      fortitude: 2,
      reflex: 1,
      willpower: 0,
    },
    followers: 25000,
    trendingFollowers: 1200,
    gold: 150,
  },
  {
    id: "player-2",
    gameId: "game-1",
    userId: "user-3",
    name: "Elindra",
    level: 4,
    health: 30,
    maxHealth: 30,
    classId: "class-2",
    spells: ["spell-3", "spell-4", "spell-5"],
    items: ["item-5"],
    lootboxes: ["lootbox-2"],
    abilityScores: {
      strength: 8,
      agility: 14,
      stamina: 10,
      personality: 12,
      intelligence: 17,
      luck: 11,
    },
    savingThrows: {
      fortitude: 0,
      reflex: 2,
      willpower: 1,
    },
    followers: 42000,
    trendingFollowers: 3500,
    gold: 275,
  },
  {
    id: "player-3",
    gameId: "game-1",
    userId: "user-4",
    name: "Darvin",
    level: 3,
    health: 25,
    maxHealth: 35,
    classId: "class-3",
    spells: ["spell-6", "spell-7"],
    items: ["item-3", "item-6"],
    lootboxes: [],
    abilityScores: {
      strength: 10,
      agility: 16,
      stamina: 12,
      personality: 14,
      intelligence: 13,
      luck: 9,
    },
    savingThrows: {
      fortitude: 1,
      reflex: 3,
      willpower: 2,
    },
    followers: 15000,
    trendingFollowers: 800,
    gold: 95,
  },
  {
    id: "player-4",
    gameId: "game-3",
    userId: "user-2",
    name: "Seraphina",
    level: 6,
    health: 40,
    maxHealth: 40,
    classId: "class-4",
    spells: ["spell-8", "spell-9", "spell-10"],
    items: ["item-2"],
    lootboxes: ["lootbox-3"],
    abilityScores: {
      strength: 9,
      agility: 11,
      stamina: 13,
      personality: 18,
      intelligence: 15,
      luck: 12,
    },
    savingThrows: {
      fortitude: 1,
      reflex: 0,
      willpower: 4,
    },
    followers: 75000,
    trendingFollowers: 8000,
    gold: 320,
  },
  {
    id: "player-5",
    gameId: "game-2",
    userId: "user-1",
    name: "Grimtooth",
    level: 2,
    health: 20,
    maxHealth: 25,
    classId: "class-1",
    spells: ["spell-1", "spell-2"],
    items: ["item-7", "item-8", "item-9", "item-10"],
    lootboxes: ["lootbox-1"],
    abilityScores: {
      strength: 15,
      agility: 10,
      stamina: 14,
      personality: 7,
      intelligence: 9,
      luck: 13,
    },
    savingThrows: {
      fortitude: 2,
      reflex: 0,
      willpower: -1,
    },
    followers: 5000,
    trendingFollowers: 250,
    gold: 50,
  },
]

// Helper function to get players for a specific game
export const getGamePlayers = (gameId: string) => {
  return mockPlayers.filter((player) => player.gameId === gameId)
}

// Helper function to get a specific player
export const getPlayer = (playerId: string) => {
  return mockPlayers.find((player) => player.id === playerId)
}

// Helper function to get a specific game
export const getGame = (gameId: string) => {
  return mockGames.find((game) => game.id === gameId)
}

// Helper function to get a specific class
export const getClass = (classId: string) => {
  return mockClasses.find((cls) => cls.id === classId)
}

// Helper function to get a specific spell
export const getSpell = (spellId: string) => {
  return mockSpells.find((spell) => spell.id === spellId)
}

// Helper function to get a specific item
export const getItem = (itemId: string) => {
  return mockItems.find((item) => item.id === itemId)
}

// Helper function to get a specific lootbox
export const getLootbox = (lootboxId: string) => {
  return mockLootboxes.find((lootbox) => lootbox.id === lootboxId)
}

// Helper function to get player spells
export const getPlayerSpells = (player: any) => {
  return player.spells.map((spellId: string) => getSpell(spellId)).filter(Boolean)
}

// Helper function to get player items
export const getPlayerItems = (player: any) => {
  return player.items.map((itemId: string) => getItem(itemId)).filter(Boolean)
}

// Helper function to get player lootboxes
export const getPlayerLootboxes = (player: any) => {
  return player.lootboxes.map((lootboxId: string) => getLootbox(lootboxId)).filter(Boolean)
}

// Helper function to get lootbox items
export const getLootboxItems = (lootbox: any) => {
  return lootbox.possibleItems.map((itemId: string) => getItem(itemId)).filter(Boolean)
}

// Helper function to calculate ability score modifier
export const getAbilityModifier = (score: number): number => {
  return Math.floor((score - 10) / 2)
}

// Helper function to calculate saving throws based on ability scores and level
export const calculateSavingThrows = (player: any) => {
  const baseValue = Math.floor(player.level / 2)

  return {
    fortitude: baseValue + getAbilityModifier(player.abilityScores.stamina),
    reflex: baseValue + getAbilityModifier(player.abilityScores.agility),
    willpower: baseValue + getAbilityModifier(player.abilityScores.personality),
  }
}

// Weapon data
export const weaponData = [
  { name: "Battleaxe", damage: "1d10", range: null, cost: 10, special: ["Two-handed"] },
  { name: "Battlestaff", damage: "1d10", range: null, cost: 20, special: [] },
  {
    name: "Bow (Composite)",
    damage: "1d8",
    range: { short: 70, medium: 140, long: 210 },
    cost: 75,
    special: ["Reload"],
  },
  { name: "Bow (Long)", damage: "1d8", range: { short: 70, medium: 140, long: 210 }, cost: 40, special: ["Reload"] },
  { name: "Bow (Short)", damage: "1d6", range: { short: 50, medium: 100, long: 150 }, cost: 25, special: ["Reload"] },
  { name: "Club", damage: "1d4", range: null, cost: 3, special: [] },
  { name: "Crossbow", damage: "1d8", range: { short: 80, medium: 160, long: 240 }, cost: 30, special: ["Reload"] },
  { name: "Crossbow, Hand", damage: "1d6", range: { short: 40, medium: 80, long: 120 }, cost: 50, special: ["Reload"] },
  {
    name: "Crossbow, Repeating",
    damage: "1d8",
    range: { short: 20, medium: 40, long: 60 },
    cost: 50,
    special: ["Reload"],
  },
  { name: "Dagger", damage: "1d4", range: { short: 10, medium: 20, long: 30 }, cost: 2, special: ["Concealable"] },
  { name: "Dart", damage: "1d3", range: { short: 20, medium: 40, long: 60 }, cost: 1, special: ["Thrown"] },
  { name: "Falchion", damage: "1d8", range: null, cost: 8, special: ["Two-handed"] },
  { name: "Flail", damage: "1d8", range: null, cost: 10, special: ["Two-handed"] },
  { name: "Garrote", damage: "1d6", range: null, cost: 5, special: [] },
  { name: "Glaive", damage: "1d10", range: null, cost: 8, special: ["Two-handed"] },
  { name: "Great Axe", damage: "1d12", range: null, cost: 10, special: ["Two-handed"] },
  { name: "Halberd", damage: "1d10", range: null, cost: 8, special: ["Two-handed"] },
  { name: "Hand Axe", damage: "1d6", range: { short: 10, medium: 20, long: 30 }, cost: 4, special: ["Thrown"] },
  { name: "Hatchet", damage: "1d4", range: { short: 10, medium: 20, long: 30 }, cost: 2, special: ["Thrown"] },
  { name: "Lance", damage: "1d12", range: null, cost: 5, special: ["Mounted"] },
  { name: "Longsword", damage: "1d8", range: null, cost: 15, special: [] },
  { name: "Mace", damage: "1d6", range: null, cost: 5, special: [] },
  { name: "Maul", damage: "1d10", range: null, cost: 10, special: ["Two-handed"] },
  { name: "Morningstar", damage: "1d8", range: null, cost: 8, special: [] },
  { name: "Polearm", damage: "1d10", range: null, cost: 7, special: ["Two-handed"] },
  { name: "Quarterstaff", damage: "1d4", range: null, cost: 1, special: ["Two-handed"] },
  { name: "Rapier", damage: "1d6", range: null, cost: 15, special: ["Agility"] },
  { name: "Scimitar", damage: "1d8", range: null, cost: 10, special: [] },
  { name: "Short Bow", damage: "1d6", range: { short: 50, medium: 100, long: 150 }, cost: 25, special: ["Reload"] },
  { name: "Short Sword", damage: "1d6", range: null, cost: 10, special: ["Agility"] },
  { name: "Sling", damage: "1d4", range: { short: 40, medium: 80, long: 160 }, cost: 1, special: [] },
  { name: "Spear", damage: "1d6", range: { short: 20, medium: 40, long: 60 }, cost: 3, special: ["Thrown"] },
  { name: "Staff", damage: "1d4", range: null, cost: 1, special: [] },
  { name: "Sword", damage: "1d8", range: null, cost: 10, special: [] },
  { name: "Two-handed Sword", damage: "1d10", range: null, cost: 25, special: ["Two-handed"] },
  { name: "Warhammer", damage: "1d8", range: null, cost: 8, special: [] },
  { name: "Whip", damage: "1d8", range: null, cost: 25, special: ["Agility", "Stretch"] },
]
