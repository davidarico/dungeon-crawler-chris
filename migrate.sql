-- This script used to create the database and tables for the application
-- Drop tables if they already exist (order matters due to foreign key dependencies)
DROP TABLE IF EXISTS player_lootboxes;
DROP TABLE IF EXISTS player_items;
DROP TABLE IF EXISTS player_spells;
DROP TABLE IF EXISTS lootbox_possible_items;
DROP TABLE IF EXISTS class_default_spells;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS lootboxes;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS spells;
DROP TABLE IF EXISTS weapons;
DROP TABLE IF EXISTS users;

-- Create users table for authentication
CREATE TABLE users (
  id TEXT PRIMARY KEY,               -- Auth provider ID (Google user ID)
  email TEXT UNIQUE NOT NULL,        -- User's email address
  name TEXT,                         -- User's display name
  image TEXT,                        -- URL to user's profile image
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spells table
CREATE TABLE spells (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

-- Create classes table
CREATE TABLE classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

-- Create items table
CREATE TABLE items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  flavor_text TEXT,
  categories TEXT[],          -- Array of text values
  damage TEXT,                -- Storing damage as a dice string (e.g., '1d8')
  range JSONB,                -- JSON structure for range values (nullable)
  cost INTEGER,               -- Cost in appropriate unit (nullable)
  special TEXT[]              -- Array of special attributes
);

-- Create lootboxes table
CREATE TABLE lootboxes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL
);

-- Create games table
CREATE TABLE games (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  dm_id TEXT,                 -- References a user (create users table if needed)
  is_dm BOOLEAN NOT NULL
);

-- Create players table
CREATE TABLE players (
  id TEXT PRIMARY KEY,
  game_id TEXT REFERENCES games(id),
  user_id TEXT,               -- References a user (create users table if needed)
  name TEXT NOT NULL,
  level INTEGER,
  health INTEGER,
  max_health INTEGER,
  class_id TEXT REFERENCES classes(id),
  
  -- Ability scores
  strength INTEGER,
  agility INTEGER,
  stamina INTEGER,
  personality INTEGER,
  intelligence INTEGER,
  luck INTEGER,
  
  -- Saving Throws
  saving_throw_fortitude INTEGER,
  saving_throw_reflex INTEGER,
  saving_throw_willpower INTEGER,
  
  followers INTEGER,
  trending_followers INTEGER,
  gold INTEGER
);

-- Create join table for classes' default spells
CREATE TABLE class_default_spells (
  class_id TEXT REFERENCES classes(id),
  spell_id TEXT REFERENCES spells(id),
  PRIMARY KEY (class_id, spell_id)
);

-- Create join table for lootbox to possible items relationships
CREATE TABLE lootbox_possible_items (
  lootbox_id TEXT REFERENCES lootboxes(id),
  item_id TEXT REFERENCES items(id),
  PRIMARY KEY (lootbox_id, item_id)
);

-- Create join table for players' spells
CREATE TABLE player_spells (
  player_id TEXT REFERENCES players(id),
  spell_id TEXT REFERENCES spells(id),
  PRIMARY KEY (player_id, spell_id)
);

-- Create join table for players' items
CREATE TABLE player_items (
  player_id TEXT REFERENCES players(id),
  item_id TEXT REFERENCES items(id),
  PRIMARY KEY (player_id, item_id)
);

-- Create join table for players' lootboxes
CREATE TABLE player_lootboxes (
  player_id TEXT REFERENCES players(id),
  lootbox_id TEXT REFERENCES lootboxes(id),
  PRIMARY KEY (player_id, lootbox_id)
);

-- Create weapons table for weapon data
CREATE TABLE weapons (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  damage TEXT NOT NULL,
  range JSONB,                -- JSON structure (e.g., {"short": 70, "medium": 140, "long": 210})
  cost INTEGER,
  special TEXT[]              -- Array of special properties
);