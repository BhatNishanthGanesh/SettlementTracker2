import { Server, Socket } from "socket.io";
import { SendMessageData, TypingData } from "../types/socket";

export function registerSocketHandlers(io: Server) {
  io.engine.on("connection_error", (err) => {
    console.error("Connection error:", err);
  });

  io.on("connection", (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);
    console.log(`Client address: ${socket.handshake.address}`);

    socket.emit("connection-confirmed", {
      id: socket.id,
      timestamp: new Date().toISOString(),
    });

    // Join room
    socket.on("join-room", (tripId: string) => {
      socket.join(tripId);

      console.log(`Socket ${socket.id} joined room: ${tripId}`);

      socket.emit("room-joined", {
        tripId,
        success: true,
      });
    });

    // Leave room
    socket.on("leave-room", (tripId: string) => {
      socket.leave(tripId);

      console.log(`Socket ${socket.id} left room: ${tripId}`);
    });

    // Send message
    socket.on("send-message", ({ tripId, message }: SendMessageData) => {
      console.log(`💬 Message to room ${tripId}:`, message);

      io.to(tripId).emit("receive-message", {
        ...(message as object),
        _serverTimestamp: new Date().toISOString(),
      });

      console.log(`✅ Message broadcast to room ${tripId}`);
    });

    // Typing indicator
    socket.on("typing", ({ tripId, user, isTyping }: TypingData) => {
      socket.to(tripId).emit("user-typing", {
        user,
        isTyping,
      });
    });

    // Disconnect
    socket.on("disconnect", (reason) => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
      console.log(`Reason: ${reason}`);
    });

    // Socket error
    socket.on("error", (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });
}