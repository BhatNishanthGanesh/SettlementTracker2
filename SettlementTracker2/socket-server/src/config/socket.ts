import { Server } from "socket.io";
import http from "http";

export function createSocket(server: http.Server) {
  return new Server(server, {
    path: "/api/socket",
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });
}