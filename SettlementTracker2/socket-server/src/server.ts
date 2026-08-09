import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import http from "http";

import healthRouter from "./routes/health";
import { createSocket } from "./config/socket";
import { registerSocketHandlers } from "./handlers/socketHandler";
import { createBroadcastRouter } from "./routes/broadcast";

const app = express();
dotenv.config();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use("/", healthRouter);

const server = http.createServer(app);

const io = createSocket(server);

registerSocketHandlers(io);

app.use(
  "/broadcast",
  createBroadcastRouter(io)
);

const PORT = process.env.PORT || 3002;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket path: /api/socket`);
  console.log(`📍 Health check: http://localhost:${PORT}/`);
  console.log(`📡 WebSocket: ws://localhost:${PORT}/api/socket`);
});

// Handle server errors
server.on("error", (error) => {
  console.error("❌ Server error:", error);
});

export default server;