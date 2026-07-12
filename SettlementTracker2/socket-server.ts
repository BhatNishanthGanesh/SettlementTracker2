// socket-server.ts
import { createServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

interface SendMessageData {
  tripId: string;
  message: any;
}

interface TypingData {
  tripId: string;
  user: string;
  isTyping: boolean;
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    // Log all requests to the socket server
    console.log(`📡 ${req.method} ${req.url}`);
    
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
      });
      res.end();
      return;
    }
    
    handle(req, res);
  });

  const io = new SocketServer(server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    allowUpgrades: true,
    cookie: false,
  });

  io.engine.on('connection_error', (err: any) => {
    console.log('❌ Connection error:', err);
  });

  io.on('connection', (socket: Socket) => {
    console.log(`✅ Client connected: ${socket.id}`);
    console.log(`📍 Client address: ${socket.handshake.address}`);

    // Send immediate connection confirmation
    socket.emit('connection-confirmed', { 
      id: socket.id, 
      timestamp: new Date().toISOString() 
    });

    socket.on('join-room', (tripId: string) => {
      socket.join(tripId);
      console.log(`📍 Socket ${socket.id} joined room: ${tripId}`);
      socket.emit('room-joined', { tripId, success: true });
    });

    socket.on('leave-room', (tripId: string) => {
      socket.leave(tripId);
      console.log(`📍 Socket ${socket.id} left room: ${tripId}`);
    });

    socket.on('send-message', (data: SendMessageData) => {
      const { tripId, message } = data;
      console.log(`💬 Message to room ${tripId}:`, message);
      
      io.to(tripId).emit('receive-message', {
        ...message,
        _serverTimestamp: new Date().toISOString()
      });
      
      console.log(`✅ Message broadcast to room ${tripId}`);
    });

    socket.on('typing', (data: TypingData) => {
      const { tripId, user, isTyping } = data;
      socket.to(tripId).emit('user-typing', { user, isTyping });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });

    socket.on('error', (error) => {
      console.error(`❌ Socket error for ${socket.id}:`, error);
    });
  });

  const PORT = process.env.SOCKET_PORT || 3002;
  server.listen(PORT, () => {
    console.log(`✅ Socket.io server running on port ${PORT}`);
    console.log(`✅ Next.js app running on http://localhost:3000`);
    console.log(`📡 Socket endpoint: http://localhost:${PORT}/api/socket`);
  });
});