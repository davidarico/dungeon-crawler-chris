// WebSocket Test Script
// This script demonstrates how to test the real-time updates for both player and DM pages

// 1. Start the server
// Run: npm run dev

// 2. Open two browser windows:
//    - Player page: http://localhost:3000/player/[gameId]
//    - DM page: http://localhost:3000/dm/[gameId]

// 3. Connect to PostgreSQL and run the following SQL to update a player:
/*
-- Example: Update a player's health
UPDATE players SET health = 11 WHERE id = 'player-id-here';

-- Example: Update gold/crawler credit
UPDATE players SET "crawlerCredit" = 500 WHERE id = 'player-id-here';

-- Example: Update ability scores
UPDATE players SET "abilityScores" = jsonb_set("abilityScores", '{strength}', '15') WHERE id = 'player-id-here';
*/

// 4. Observe both windows:
//    - Both the player page and DM page should update automatically
//    - Look for the "Live" indicator in the top-right corner of both pages
//    - Check the console logs for WebSocket messages

// Troubleshooting:
// - If updates aren't appearing, check the server logs for PostgreSQL notifications
// - Verify that the gameId is included in the notification payload
// - Check browser console for any WebSocket connection errors
// - Ensure the database triggers were properly applied

// Example of how to manually test the notification system:
/*
SELECT pg_notify('player_changes', '{"playerId": "your-player-id", "gameId": "your-game-id", "changeType": "UPDATE", "timestamp": "2025-06-11T23:42:00Z"}');
*/

// Expected behavior:
// 1. When a player's data is updated in the database, both the player page and DM page should refresh
// 2. The "Live" indicator should be green when connected
// 3. The "Last update" timestamp should update when new data is received
