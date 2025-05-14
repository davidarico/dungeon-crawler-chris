# Dungeon Crawler Chris
A TTRPG inspired by Dungeon Crawler Carl.
Created and maintained by Chris and David

---

## Project Overview

Dungeon Crawler Chris is a web-based tabletop roleplaying game (TTRPG) platform inspired by Dungeon Crawler Carl. It provides a digital environment for players and dungeon masters (DMs) to manage campaigns, characters, items, spells, lootboxes, and more. The application is built with Next.js (App Router), React, and TypeScript, and uses PostgreSQL as its primary database. Authentication is handled via NextAuth with Google OAuth support. The system is designed for extensibility, real-time updates, and a modern, user-friendly interface.

### Key Features
- **User Authentication:** Secure login via Google OAuth using NextAuth.
- **Game Management:** Create and manage multiple game sessions, each with its own DM and player roster.
- **Player Characters:** Players can create, customize, and manage their characters, including ability scores, equipment, spells, and inventory.
- **Classes & Spells:** Support for character classes, class-specific spells, and spell management.
- **Items & Equipment:** Robust item system with equipment slots, item categories, and item generation (including AI-powered item creation via OpenAI API).
- **Lootboxes:** DMs can create lootboxes with tiered rewards and assign them to players. Lootboxes can contain multiple items and are managed through a dedicated UI.
- **Inventory & Equipment Management:** Players can equip, unequip, and manage items in various slots (weapons, armor, accessories, etc.), with support for inventory filtering and categorization.
- **Real-Time Updates (Planned):** Future support for WebSocket-based updates so DMs and players see changes live.
- **Database Migrations:** Schema managed via SQL migration files for version control and reproducibility.

### Architecture & Moving Parts
- **Frontend:**
  - Built with Next.js (App Router) and React, using TypeScript for type safety.
  - UI components are organized in `/components` and leverage the shadcn/ui library for modern design.
  - Pages for DMs and players are separated under `/app/dm/[gameId]` and `/app/player/[gameId]` respectively.
  - Specialized pages for managing lootboxes, items, spells, and more.

- **API Layer:**
  - RESTful API routes under `/app/api/` handle all data operations (CRUD for games, players, items, lootboxes, etc.).
  - API routes interact with the database via a set of modular functions in `/lib/api/`.
  - Some endpoints (e.g., `/api/generate-items`) use the OpenAI API to generate new items dynamically.

- **Database:**
  - PostgreSQL schema defined in `migrate.sql` and documented in `/docs/database/README.md`.
  - Core tables: users, games, players, items, lootboxes, classes, spells, and join tables for relationships (e.g., player_items, lootbox_possible_items).
  - Relationships are designed for flexibility (e.g., players can have multiple items, spells, lootboxes; items can belong to multiple lootboxes).

- **Authentication:**
  - NextAuth handles user sessions and integrates with Google OAuth.
  - User data is stored in the `users` table, with support for profile images and metadata.

- **Business Logic:**
  - `/lib/api/` contains server-side logic for fetching, updating, and managing all game entities.
  - `/lib/client-utils.ts` provides client-side utilities for interacting with the API from React components.
  - Mock data and utility functions are available for development and testing.

- **Extensibility:**
  - The system is designed to support new features such as minigames, real-time chat, advanced inventory management, and more (see TODO list).
  - Modular code structure allows for easy addition of new entity types (e.g., new item categories, spells, classes).

- **Environment & Setup:**
  - Configuration via `.env.local` for database, authentication, and API keys.
  - Database migrations are run via `migrate.sql` (Actual migration framework in progress).
  - Development server started with `npm run dev`.

---

## Running the Project
1. Run `npm install --legacy-peer-deps`. This is because there is deprecated packages we are using as a part of shadcn. We possibly want to solve this but minor inconvience.
2. Ensure you have am .env.local files with the following params:
```
PG_HOST=host
PG_PORT=5432
PG_DATABASE=mydb
PG_USER=myuser
PG_PASSWORD=mypwd

# Authentication
NEXTAUTH_URL=url
NEXTAUTH_SECRET=secret

# Google OAuth
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret

# OpenAI API
OPENAI_API_KEY=open-ai-key
```
3. Ensure you have ran the migrate.sql file (full migration process coming soon)
4. `npm run dev`

## TODO

### High Priority
- [X] Add Google Login
- [X] Transition from Mock Data to Supabase
- [X] Add Item chat to create new items for the game
- [ ] Create Item Embedding System to Try and Feed Similar Items into Item Generation System
- [ ] Leverage Item Embedding for Lootbox Generation
- [X] Migrate Database off of Supabase
- [ ] WIP: Rework Inventory to have Separate Sections for:
    1. Weapons
	2. Sheilds
	3. Head
	4. Chest
	5. Legs
	6. Hands
	7. Feet
	8. Neck
	9. Rings (Maybe WoW rules of having 2)
	Then every other item is just in the regular item pool (your toasters, torches, food, potions, etc) 
- [ ] Stream Database Changes via WebSocket so the DM sees Player Sheet Changes and Vice Versa
- [ ] Add Classes to Database

### Medium Priority
- [X] Change Gold to Crawler Credit
- [ ] Add Fishing Minigame
- [ ] Implement a Migration Framework to Handle Database Changes
- [ ] Add Realtime Chat Allowing Users to see Other Lootboxes being Opened
- [ ] Change the Equipment Screen to Show all Equiped Items
- [ ] Refactor Item List to Better Display Item Details like AC and Damange Rolls
- [ ] Implement Automatic AC Calculation
- [ ] Implement Automatic Attack Rolls and Damage Roll Calculations
- [ ] Add Occupation (View Handbook)
- [ ] Add Notes Section to Player Screen
- [ ] Rework Lootbox Creation Screen to Handle Larger Lootboxes

### Low Priority
- [ ] Rework Item List Page to Allow for Multiple Filters
- [ ] Create Item Icons
- [ ] WIP: Add Visual Indication for Armor Slots (WoW Character Pane Inspiration) (No Icons Implemented ATM)
- [ ] Create Post Fight Loot Screen. A way for the DM to Assign Loot to Players Fast