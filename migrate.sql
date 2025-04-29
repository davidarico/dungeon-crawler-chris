-- This script used to create the database and tables for the application
-- Drop tables if they already exist (order matters due to foreign key dependencies)
DROP TABLE IF EXISTS player_equipped_items;
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
DROP TABLE IF EXISTS armor;

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
  equip_slot TEXT,            -- New field: Which slot the item can be equipped to (null for non-equippable)
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
  dm_id TEXT                  -- References a user (create users table if needed)
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

-- Create table for players' equipped items
CREATE TABLE player_equipped_items (
  player_id TEXT REFERENCES players(id),
  item_id TEXT REFERENCES items(id),
  slot TEXT NOT NULL,         -- The slot where this item is equipped (weapon, shield, head, etc.)
  PRIMARY KEY (player_id, slot)
);

-- Create weapons table for weapon data
CREATE TABLE weapons (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  damage TEXT NOT NULL,
  range JSONB,        -- {"short":…, "medium":…, "long":…}
  cost INTEGER,
  special TEXT[],     -- e.g. ['Two-handed','Reload']
  categories TEXT[]   -- melee, thrown, ranged, firearm, etc.
);

-- Create armor table for armor data
CREATE TABLE armor (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  ac_bonus INTEGER NOT NULL,
  check_penalty TEXT,
  speed TEXT,
  fumble_die TEXT NOT NULL,
  cost INTEGER NOT NULL,
  categories TEXT[]   -- light / medium / heavy / shield / none
);

INSERT INTO armor (name, ac_bonus, check_penalty, speed, fumble_die, cost, categories) VALUES
  ('Unarmored',            0,   NULL,    NULL,   'd4',   0,     ARRAY['none']),
  ('Sexy Leather',         1,   NULL,    NULL,   'd4',   200,   ARRAY['light']),
  ('Armored Jacket',       1,   '-1',    NULL,   'd6',   40,    ARRAY['light']),
  ('Leather',              2,   '-1',    NULL,   'd8',   60,    ARRAY['light']),
  ('Halfling Leather',     2,   NULL,    NULL,   'd6',   200,   ARRAY['light']),
  ('Micromesh Clothing',   2,   '-1',    NULL,   'd6',   200,   ARRAY['light']),
  ('Composite Sport, Lg',  3,   '-1',    NULL,   'd8',   30,    ARRAY['light']),
  ('Hide',                 3,   '-4',   '-10′', 'd12',  20,    ARRAY['medium']),
  ('Micromesh',            3,   '-3',    NULL,   'd8',   850,   ARRAY['medium']),
  ('Sexy Chainmail',       3,   '-2',    NULL,   'd8',   1000,  ARRAY['medium']),
  ('MiniLynx, Light',      4,   '-2',    NULL,   'd8',   750,   ARRAY['light']),
  ('Chainmail Shirt',      4,   '-2',    NULL,   'd10',  100,   ARRAY['medium']),
  ('Composite Sport, Hv',  5,   '-4',   '-10′', 'd12',  300,   ARRAY['heavy']),
  ('Chainmail',            5,   '-5',    NULL,   'd12',  250,   ARRAY['heavy']),
  ('Titanium Chainmail',   5,   '-4',    NULL,   'd10',  750,   ARRAY['heavy']),
  ('Breastplate',          5,   '-1',   '-10′', 'd12',  400,   ARRAY['medium']),
  ('Titanium Breastplate', 5,   '-3',   '-10′', 'd10',  1200,  ARRAY['medium']),
  ('Sexy Half Plate',      5,   '-5',   '-10′', 'd12',  800,   ARRAY['medium']),
  ('Elfmake Chainmail',    5,   '-3',    NULL,   'd8',   0,     ARRAY['medium']),
  ('Banded Mail',          6,   '-6',   '-5′',  'd12',  300,   ARRAY['heavy']),
  ('MiniLynx',             6,   '-3',   '-5′',  'd10',  1300,  ARRAY['light']),
  ('Half Plate',           7,   '-7',   '-10′', 'd14',  600,   ARRAY['heavy']),
  ('Dwarvish Plate',       8,   '-5',   '-10′', 'd12',  5000,  ARRAY['heavy']),
  ('Plate Mail',           8,   '-8',   '-10′', 'd16',  2225,  ARRAY['heavy']),
  ('Titanium Plate Mail',  8,   '-6',   '-10′', 'd14',  7000,  ARRAY['heavy']),
  ('Shield',               1,   '-1',    NULL,   '-',    30,    ARRAY['shield']);

INSERT INTO weapons (name, damage, range, cost, special, categories) VALUES
  ('Battleaxe',       '1d10',   NULL,                           20,   ARRAY['Two-handed'],           ARRAY['melee']),
  ('Club',            '1d4',    NULL,                            3,   ARRAY['Two-handed'],           ARRAY['melee']),
  ('Crossbow',        '1d6',    '{"short":80,"medium":160,"long":240}', 600, ARRAY['Two-handed','Reload'], ARRAY['ranged']),
  ('Crossbow, Hand',  '1d4',    '{"short":20,"medium":40,"long":60}',    250, ARRAY['Reload'],             ARRAY['ranged']),
  ('Crossbow, Rept.', '1d6',    '{"short":80,"medium":160,"long":240}', 600, ARRAY['Two-handed'],           ARRAY['ranged']),
  ('Dagger',          '1d4/1d10','{"short":10,"medium":20,"long":30}', 10,  ARRAY['Backstab','Hurl'],     ARRAY['melee','thrown']),
  ('Flail',           '1d6',    NULL,                           25,   ARRAY[]::TEXT[],                ARRAY['melee']),
  ('Javelin',         '1d6',    '{"short":30,"medium":60,"long":90}',  10,   ARRAY['Hurl'],                ARRAY['melee','thrown']),
  ('Handaxe',         '1d6',    '{"short":10,"medium":20,"long":30}',   5,   ARRAY['Hurl'],                ARRAY['melee','thrown']),
  ('Lance',           '1d12',   NULL,                           40,   ARRAY['Mounted'],               ARRAY['melee']),
  ('Longbow',         '1d6',    '{"short":70,"medium":140,"long":210}',150, ARRAY['Two-handed'],           ARRAY['ranged']),
  ('Longsword',       '1d8',    NULL,                           50,   ARRAY['Two-handed'],           ARRAY['melee']),
  ('Mace',            '1d6',    NULL,                           35,   ARRAY[]::TEXT[],                ARRAY['melee']),
  ('Nunchaku',        '1d5',    NULL,                           20,   ARRAY[]::TEXT[],                ARRAY['melee']),
  ('Polearm',         '1d10',   NULL,                           35,   ARRAY['Two-handed'],           ARRAY['melee']),
  ('Pick, Military',  '1d10',   NULL,                           40,   ARRAY['Two-handed'],           ARRAY['melee']),
  ('Quarterstaff',    '1d4',    NULL,                            5,   ARRAY[]::TEXT[],                ARRAY['melee']),
  ('Rapier',          '1d5',    NULL,                          125,   ARRAY['Agility'],              ARRAY['melee']),
  ('Scimitar',        '1d6',    NULL,                           80,   ARRAY[]::TEXT[],                ARRAY['melee']),
  ('Shield',          '1d3',    NULL,                           30,   ARRAY[]::TEXT[],                ARRAY['shield']),
  ('Sling',           '1d4',    '{"short":40,"medium":80,"long":120}', 10, ARRAY[]::TEXT[],                ARRAY['ranged']),
  ('Shortbow',        '1d6',    '{"short":50,"medium":100,"long":150}',55,  ARRAY['Two-handed'],           ARRAY['ranged']),
  ('Shortsword',      '1d6',    NULL,                           35,   ARRAY[]::TEXT[],                ARRAY['melee']),
  ('Spear',           '1d8',    NULL,                           10,   ARRAY['Two-handed'],           ARRAY['melee']),
  ('Stiletto',        '1d3',    '{"short":10,"medium":15,"long":20}', 10, ARRAY['Concealable'],          ARRAY['melee','thrown']),
  ('Scythe',          '1d10',   NULL,                           50,   ARRAY['Two-handed'],           ARRAY['melee']),
  ('Trident',         '1d8',    NULL,                           60,   ARRAY['Two-handed'],           ARRAY['melee']),
  ('Two-Handed Sword','1d10',   NULL,                           80,   ARRAY['Two-handed'],           ARRAY['melee']),
  ('Warhammer',       '1d8',    NULL,                           70,   ARRAY[]::TEXT[],                ARRAY['melee']),
  ('Whip',            '1d4',    NULL,                           25,   ARRAY['Agility','Stretch'],    ARRAY['melee']);

INSERT INTO weapons (name, damage, range, cost, special, categories) VALUES
  ('Rifle',         '2d8',   '{"short":100,"medium":200,"long":300}',150, ARRAY['10-shot clip','Min STR 9'],  ARRAY['firearm','ranged']),
  ('Pistol, .25',   '1d8',   '{"short":30,"medium":60,"long":90}',   100, ARRAY['8-shot clip','Min STR 10'], ARRAY['firearm','ranged']),
  ('Pistol, .45',   '2d6',   '{"short":30,"medium":60,"long":90}',   175, ARRAY['10-shot clip','Min STR 11'], ARRAY['firearm','ranged']),
  ('Revolver, .38', '1d12',  '{"short":30,"medium":60,"long":90}',   125, ARRAY['6-in cylinder','Min STR 12'],ARRAY['firearm','ranged']),
  ('Shotgun',       '2d6',   '{"short":10,"medium":20,"long":30}',    100, ARRAY['6-integral','Min STR 13'], ARRAY['firearm','ranged']);