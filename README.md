# Dungeon Crawler Chris
A TTRPG inspired by Dungeon Crawler Carl.
Created and maintained by Chris and David

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
- [ ] WIP: Add Visual Indication for Armor Slots (WoW Character Pane Inspiration) (No Icons Implemented ATM)
- [ ] Stream Database Changes via WebSocket so the DM sees Player Sheet Changes and Vice Versa
- [ ] Add Classes to Database

### Medium Priority
- [ ] Change Gold to Crawler Credit
- [ ] Add Fishing Minigame
- [ ] Implement a Migration Framework to Handle Database Changes
- [ ] Create Item Icons
- [ ] Add Realtime Chat Allowing Users to see Other Lootboxes being Opened
- [ ] Refactor Item List to Better Display Item Details like AC and Damange Rolls
- [ ] Implement Automatic AC Calculation

### Low Priority
- [ ] Rework Item List Page to Allow for Multiple Filters