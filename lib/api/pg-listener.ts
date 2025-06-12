// PostgreSQL notification listener for real-time updates
import createPostgresListener from "pg-listen";
import { Pool } from "pg";

// Ensure this is only used on the server
if (typeof window !== "undefined") {
  throw new Error("This module can only be used on the server side");
}

// Initialize PostgreSQL listener
const listener = createPostgresListener({
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT || "5432"),
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
});

// Connect to the database
async function connect() {
  try {
    await listener.connect();
    await listener.listenTo("player_changes");
    console.log("PostgreSQL notification listener connected successfully");

    // Test the connection with a direct query
    const pool = new Pool({
      host: process.env.PG_HOST,
      port: parseInt(process.env.PG_PORT || "5432"),
      database: process.env.PG_DATABASE,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
    });

    // Execute a test query
    const result = await pool.query("SELECT 1 as test");
    console.log("PostgreSQL connection test successful:", result.rows[0]);

    // Set up a heartbeat to keep the connection alive
    setInterval(async () => {
      try {
        await pool.query("SELECT 1");
        console.log("PostgreSQL heartbeat successful");
      } catch (error) {
        console.error("PostgreSQL heartbeat failed:", error);
        // Try to reconnect
        reconnect();
      }
    }, 30000); // Every 30 seconds
  } catch (error) {
    console.error("Failed to connect to PostgreSQL:", error);
    // Try to reconnect
    setTimeout(reconnect, 5000);
  }
}

// Reconnect to the database
async function reconnect() {
  console.log("Attempting to reconnect to PostgreSQL...");

  // Create a new connection instead of trying to disconnect
  try {
    await connect();
    console.log("Successfully reconnected to PostgreSQL");
  } catch (error) {
    console.error("Failed to reconnect to PostgreSQL:", error);
    setTimeout(reconnect, 5000);
  }
}

// Handle connection errors
listener.events.on("error", (error: Error) => {
  console.error("PostgreSQL notification error:", error);
  // Try to reconnect on error
  setTimeout(reconnect, 5000);
});

// Handle notifications
listener.notifications.on("player_changes", (payload) => {
  // Ensure payload has a timestamp for deduplication
  if (payload && !payload.timestamp) {
    payload.timestamp = new Date().toISOString();
    console.log("Added timestamp to notification:", payload);
  }
  console.log("Received player_changes notification:", payload);
});

// Export the listener
export const pgListener = {
  listener,
  connect,
  getListener: () => listener,
};

// Initialize the connection when this module is imported
connect().catch((error) => {
  console.error("Failed to connect to PostgreSQL for notifications:", error);
});
