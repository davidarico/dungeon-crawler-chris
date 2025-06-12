import { Server as SocketIOServer } from "socket.io";
import { NextRequest, NextResponse } from "next/server";
import { pgListener } from "@/lib/api/pg-listener";

// Store the Socket.IO server instance
let io: SocketIOServer | null = null;

export async function GET(req: NextRequest) {
  // This is a workaround for Next.js API routes with Socket.IO
  // We need to handle the WebSocket upgrade manually

  if (!io) {
    // Create a new Socket.IO server if it doesn't exist
    // @ts-ignore - Next.js doesn't expose the underlying server, but Socket.IO can adapt
    io = new SocketIOServer({
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
      path: "/api/socket",
      addTrailingSlash: false,
      transports: ["polling", "websocket"],
      connectTimeout: 60000,
      pingTimeout: 30000,
      pingInterval: 10000,
    });

    console.log("Socket.IO server initialized with configuration:", {
      path: "/api/socket",
      transports: ["polling", "websocket"],
    });

    // Set up event handlers
    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      // Handle client subscribing to player updates
      socket.on("subscribe_player", (playerId: string) => {
        console.log(`Client ${socket.id} subscribed to player ${playerId}`);
        socket.join(`player:${playerId}`);
      });

      // Handle client unsubscribing from player updates
      socket.on("unsubscribe_player", (playerId: string) => {
        console.log(`Client ${socket.id} unsubscribed from player ${playerId}`);
        socket.leave(`player:${playerId}`);
      });

      // Handle DM subscribing to game updates (all players in a game)
      socket.on("subscribe_game", (gameId: string) => {
        console.log(`DM ${socket.id} subscribed to game ${gameId}`);
        socket.join(`game:${gameId}`);
      });

      // Handle DM unsubscribing from game updates
      socket.on("unsubscribe_game", (gameId: string) => {
        console.log(`DM ${socket.id} unsubscribed from game ${gameId}`);
        socket.leave(`game:${gameId}`);
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });

    // Set up PostgreSQL notification listener
    pgListener.getListener().notifications.on("player_changes", (payload) => {
      console.log("PostgreSQL notification received:", payload);
      if (payload && payload.playerId) {
        // Broadcast the change to all clients subscribed to this player
        io?.to(`player:${payload.playerId}`).emit("player_updated", payload);

        // If the payload includes a gameId, broadcast to the game channel for DMs
        if (payload.gameId) {
          io?.to(`game:${payload.gameId}`).emit("player_updated", payload);
        }

        // Also broadcast to a general channel for debugging
        io?.emit("debug_update", {
          type: "player_update",
          payload,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Log connection status
    console.log("WebSocket server initialized");
  }

  // Return a response to indicate the WebSocket server is running
  return new NextResponse(
    JSON.stringify({ message: "WebSocket server is running" }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
