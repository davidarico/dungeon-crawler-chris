import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { PlayerUpdateEvent } from "./use-websocket";

export function useDMWebSocket(gameId?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<PlayerUpdateEvent | null>(null);
  const [playerUpdates, setPlayerUpdates] = useState<
    Record<string, PlayerUpdateEvent>
  >({});

  // Initialize socket connection
  useEffect(() => {
    // Only create the socket on the client side
    if (typeof window === "undefined") return;

    console.log("Initializing DM WebSocket connection...");

    // Create socket connection with more robust options
    const socketInstance = io(window.location.origin, {
      path: "/socket.io", // Updated to match the path in server.js
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 60000, // Increase timeout to 60 seconds
      autoConnect: true,
      transports: ["polling", "websocket"], // Try polling first, then websocket
      forceNew: true, // Force a new connection
    });

    // Log connection attempts
    console.log("Attempting to connect to DM WebSocket server...");

    // Set up event handlers
    socketInstance.on("connect", () => {
      console.log("DM WebSocket connected with ID:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("DM WebSocket disconnected:", reason);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("DM WebSocket connection error:", error);
      setIsConnected(false);
    });

    socketInstance.on("reconnect", (attemptNumber) => {
      console.log(`DM WebSocket reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);

      // Re-subscribe to game updates if needed
      if (gameId) {
        socketInstance.emit("subscribe_game", gameId);
      }
    });

    socketInstance.on("reconnect_attempt", (attemptNumber) => {
      console.log(`DM WebSocket reconnection attempt ${attemptNumber}`);
    });

    socketInstance.on("reconnect_error", (error) => {
      console.error("DM WebSocket reconnection error:", error);
    });

    socketInstance.on("reconnect_failed", () => {
      console.error("DM WebSocket reconnection failed");
      // Try to manually reconnect after a delay
      setTimeout(() => {
        socketInstance.connect();
      }, 5000);
    });

    // Listen for debug updates
    socketInstance.on("debug_update", (data) => {
      console.log("DM Debug update received:", data);
    });

    // Store the socket instance
    setSocket(socketInstance);

    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Subscribe to game updates when gameId changes
  useEffect(() => {
    if (!socket || !gameId) return;

    // Subscribe to all player updates for this game
    socket.emit("subscribe_game", gameId);
    console.log(`DM subscribed to updates for game ${gameId}`);

    // Set up event handler for player updates
    const handlePlayerUpdate = (data: PlayerUpdateEvent) => {
      console.log("DM received player update:", data);
      setLastUpdate(data);

      // Store the update by player ID
      setPlayerUpdates((prev) => ({
        ...prev,
        [data.playerId]: data,
      }));
    };

    socket.on("player_updated", handlePlayerUpdate);

    // Clean up on unmount or when gameId changes
    return () => {
      socket.off("player_updated", handlePlayerUpdate);
      socket.emit("unsubscribe_game", gameId);
      console.log(`DM unsubscribed from updates for game ${gameId}`);
    };
  }, [socket, gameId]);

  // Function to manually send a message
  const sendMessage = useCallback(
    (event: string, data: any) => {
      if (socket && isConnected) {
        socket.emit(event, data);
      }
    },
    [socket, isConnected]
  );

  return {
    socket,
    isConnected,
    lastUpdate,
    playerUpdates,
    sendMessage,
  };
}
