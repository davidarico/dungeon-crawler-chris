// Load environment variables from .env file
require("dotenv").config();

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const { Client } = require("pg");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// PostgreSQL connection
const pgClient = new Client({
  host: process.env.PG_HOST || process.env.POSTGRES_HOST || "localhost",
  port: parseInt(process.env.PG_PORT || process.env.POSTGRES_PORT || "5432"),
  database:
    process.env.PG_DATABASE || process.env.POSTGRES_DATABASE || "postgres",
  user: process.env.PG_USER || process.env.POSTGRES_USER || "postgres",
  password: process.env.PG_PASSWORD || process.env.POSTGRES_PASSWORD || "",
});

console.log(
  "Attempting to connect to PostgreSQL with the following config (sensitive info redacted):",
  {
    host: pgClient.host,
    port: pgClient.port,
    database: pgClient.database,
    user: pgClient.user,
  }
);

// Connect to PostgreSQL and set up listener
async function setupPgListener() {
  try {
    await pgClient.connect();
    console.log("Connected to PostgreSQL for notifications");

    // Listen for player_changes notifications
    await pgClient.query("LISTEN player_changes");

    // Set up a heartbeat to keep the connection alive
    setInterval(async () => {
      try {
        await pgClient.query("SELECT 1");
        console.log("PostgreSQL heartbeat successful");
      } catch (error) {
        console.error("PostgreSQL heartbeat failed:", error);
        // Try to reconnect
        try {
          await pgClient.end();
          await pgClient.connect();
          await pgClient.query("LISTEN player_changes");
          console.log("Reconnected to PostgreSQL");
        } catch (reconnectError) {
          console.error("Failed to reconnect to PostgreSQL:", reconnectError);
        }
      }
    }, 30000); // Every 30 seconds

    return pgClient;
  } catch (error) {
    console.error("Failed to connect to PostgreSQL:", error);
    throw error;
  }
}

app.prepare().then(async () => {
  // Create HTTP server
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.IO
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/socket.io",
    transports: ["polling", "websocket"],
    connectTimeout: 60000,
    pingTimeout: 30000,
    pingInterval: 10000,
  });

  // Set up Socket.IO event handlers
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Handle client subscribing to player updates
    socket.on("subscribe_player", (playerId) => {
      console.log(`Client ${socket.id} subscribed to player ${playerId}`);
      socket.join(`player:${playerId}`);
    });

    // Handle client unsubscribing from player updates
    socket.on("unsubscribe_player", (playerId) => {
      console.log(`Client ${socket.id} unsubscribed from player ${playerId}`);
      socket.leave(`player:${playerId}`);
    });

    // Handle DM subscribing to game updates (all players in a game)
    socket.on("subscribe_game", (gameId) => {
      console.log(`DM ${socket.id} subscribed to game ${gameId}`);
      socket.join(`game:${gameId}`);
    });

    // Handle DM unsubscribing from game updates
    socket.on("unsubscribe_game", (gameId) => {
      console.log(`DM ${socket.id} unsubscribed from game ${gameId}`);
      socket.leave(`game:${gameId}`);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  // Set up PostgreSQL notification listener
  let pgListener = null;
  try {
    pgListener = await setupPgListener();
    console.log("PostgreSQL listener setup successful");

    pgListener.on("notification", (notification) => {
      try {
        const payload = JSON.parse(notification.payload);
        console.log("PostgreSQL notification received:", payload);

        if (payload && payload.playerId) {
          // Broadcast the change to all clients subscribed to this player
          io.to(`player:${payload.playerId}`).emit("player_updated", payload);

          // If the payload includes a gameId, broadcast to the game channel for DMs
          if (payload.gameId) {
            io.to(`game:${payload.gameId}`).emit("player_updated", payload);
          }

          // Also broadcast to a general channel for debugging
          io.emit("debug_update", {
            type: "player_update",
            payload,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("Error processing notification:", error);
      }
    });
  } catch (error) {
    console.error("Failed to set up PostgreSQL listener:", error);
    console.log("WebSocket server will run without PostgreSQL notifications");
    console.log(
      "You can still use the application, but real-time updates will not work"
    );
    console.log(
      "To fix this, ensure PostgreSQL is running and the connection details are correct"
    );
  }

  // Start the server
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
    console.log("> WebSocket server is running");
  });
});
