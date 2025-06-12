import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

// Define the type for player update events
export interface PlayerUpdateEvent {
  playerId: string;
  changeType: "INSERT" | "UPDATE" | "DELETE";
  table?: string;
  itemId?: string;
  spellId?: string;
  lootboxId?: string;
  slot?: string;
  timestamp: string;
}

export function useWebSocket(playerId?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<PlayerUpdateEvent | null>(null);

  // Initialize socket connection
  useEffect(() => {
    // Only create the socket on the client side
    if (typeof window === "undefined") return;

    console.log("Initializing WebSocket connection...");

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
    console.log("Attempting to connect to WebSocket server...");

    // Set up event handlers
    socketInstance.on("connect", () => {
      console.log("WebSocket connected with ID:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      setIsConnected(false);
    });

    socketInstance.on("reconnect", (attemptNumber) => {
      console.log(`WebSocket reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);

      // Re-subscribe to player updates if needed
      if (playerId) {
        socketInstance.emit("subscribe_player", playerId);
      }
    });

    socketInstance.on("reconnect_attempt", (attemptNumber) => {
      console.log(`WebSocket reconnection attempt ${attemptNumber}`);
    });

    socketInstance.on("reconnect_error", (error) => {
      console.error("WebSocket reconnection error:", error);
    });

    socketInstance.on("reconnect_failed", () => {
      console.error("WebSocket reconnection failed");
      // Try to manually reconnect after a delay
      setTimeout(() => {
        socketInstance.connect();
      }, 5000);
    });

    // Listen for debug updates
    socketInstance.on("debug_update", (data) => {
      console.log("Debug update received:", data);
    });

    // Store the socket instance
    setSocket(socketInstance);

    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Subscribe to player updates when playerId changes
  useEffect(() => {
    if (!socket || !playerId) return;

    // Subscribe to player updates
    socket.emit("subscribe_player", playerId);
    console.log(`Subscribed to updates for player ${playerId}`);

    // Set up event handler for player updates
    const handlePlayerUpdate = (data: PlayerUpdateEvent) => {
      console.log("Player update received:", data);
      setLastUpdate(data);

      // Force a refresh of player data when an update is received
      if (data.playerId === playerId) {
        console.log("Refreshing player data due to update");
      }
    };

    socket.on("player_updated", handlePlayerUpdate);

    // Clean up on unmount or when playerId changes
    return () => {
      socket.off("player_updated", handlePlayerUpdate);
      socket.emit("unsubscribe_player", playerId);
      console.log(`Unsubscribed from updates for player ${playerId}`);
    };
  }, [socket, playerId]);

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
    sendMessage,
  };
}
