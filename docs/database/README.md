# Database Documentation

## Overview
Dungeon Crawler Chris uses PostgreSQL as its database management system. The application implements a relational database structure to manage game data, players, items, and other game-related entities.

## Database Configuration
The application connects to PostgreSQL using environment variables:
- `PG_HOST`: The hostname of your PostgreSQL server
- `PG_PORT`: The port number (default: 5432)
- `PG_DATABASE`: The name of your database
- `PG_USER`: The PostgreSQL username
- `PG_PASSWORD`: The PostgreSQL password

## Database Schema

### Core Tables

#### Users
Stores authentication and user information
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,          -- Auth provider ID (Google user ID)
  email TEXT UNIQUE NOT NULL,   -- User's email address
  name TEXT,                    -- User's display name
  image TEXT,                   -- URL to user's profile image
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Games
Manages game sessions
```sql
CREATE TABLE games (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  dm_id TEXT                    -- References the DM's user ID
);
```

#### Players
Stores player character information
```sql
CREATE TABLE players (
  id TEXT PRIMARY KEY,
  game_id TEXT REFERENCES games(id),
  user_id TEXT,
  name TEXT NOT NULL,
  level INTEGER,
  health INTEGER,
  max_health INTEGER,
  class_id TEXT REFERENCES classes(id),
  
  -- Ability Scores
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
```

### Equipment and Items

#### Items
```sql
CREATE TABLE items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  flavor_text TEXT,
  equip_slot TEXT,            -- Slot where item can be equipped
  categories TEXT[],          -- Array of category tags
  damage TEXT,               -- Damage notation (e.g., '1d8')
  range JSONB,               -- Range specifications
  cost INTEGER,
  special TEXT[]             -- Special attributes/effects
);
```

#### Player Equipment
```sql
CREATE TABLE player_equipped_items (
  player_id TEXT REFERENCES players(id),
  item_id TEXT REFERENCES items(id),
  slot TEXT NOT NULL,
  PRIMARY KEY (player_id, slot)
);
```

### Inventory Management

#### Player Items
```sql
CREATE TABLE player_items (
  player_id TEXT REFERENCES players(id),
  item_id TEXT REFERENCES items(id),
  PRIMARY KEY (player_id, item_id)
);
```

#### Lootboxes
```sql
CREATE TABLE lootboxes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL
);
```

#### Lootbox Items
```sql
CREATE TABLE lootbox_possible_items (
  lootbox_id TEXT REFERENCES lootboxes(id),
  item_id TEXT REFERENCES items(id),
  PRIMARY KEY (lootbox_id, item_id)
);
```

### Character Progression

#### Classes
```sql
CREATE TABLE classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);
```

#### Spells
```sql
CREATE TABLE spells (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);
```

#### Class Default Spells
```sql
CREATE TABLE class_default_spells (
  class_id TEXT REFERENCES classes(id),
  spell_id TEXT REFERENCES spells(id),
  PRIMARY KEY (class_id, spell_id)
);
```

## Database Relationships

### Player Relationships
- Each player belongs to one game (game_id)
- Players can have multiple items (player_items)
- Players can have equipped items (player_equipped_items)
- Players belong to a character class (class_id)
- Players can have multiple spells (player_spells)

### Item Relationships
- Items can be in multiple lootboxes (lootbox_possible_items)
- Items can be equipped by multiple players (player_equipped_items)
- Items can be in multiple player inventories (player_items)

### Class Relationships
- Classes can have multiple default spells (class_default_spells)
- Classes can be assigned to multiple players (players table)

## Database Access
The application uses the node-postgres library for database access. The database connection is initialized in `lib/api/db.server.ts`:

```typescript
import { Pool, QueryResult } from 'pg';
import format from 'pg-format';

// Initialize PostgreSQL client
const pool = new Pool({
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT || '5432'),
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
});

// Export the database interface
export const db = {
  query: (text: string, params?: any[]): Promise<QueryResult> => pool.query(text, params),
  format: format
};
```

## Best Practices
1. Always use the provided database utility functions for consistent error handling
2. Use TypeScript interfaces for type safety when working with database records
3. Implement proper error handling for database operations
4. Use transactions for operations that modify multiple tables
5. Keep sensitive operations server-side in API routes
6. Follow Next.js server/client separation patterns when accessing the database