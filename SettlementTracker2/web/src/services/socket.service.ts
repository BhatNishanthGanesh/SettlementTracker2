import { io, Socket } from 'socket.io-client';


const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 5;
  private isConnecting: boolean = false;
  private currentTripId: string | null = null;

  connect(tripId: string): void {
    if (this.isConnecting) return;

    if (this.socket?.connected) {
      this.socket.emit('join-room', tripId);
      this.currentTripId = tripId;
      return;
    }

    this.isConnecting = true;
    this.currentTripId = tripId;

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.socket = io(SOCKET_URL, {
      path: '/api/socket',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      forceNew: true,
      withCredentials: true,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected successfully');
      this.reconnectAttempts = 0;
      this.isConnecting = false;

      if (this.currentTripId) {
        this.socket?.emit('join-room', this.currentTripId);
      }

      this.emitEvent('connection-status', { connected: true });
    });

    this.socket.on('connection-confirmed', (data: any) => {
      console.log('Connection confirmed:', data);
    });

    this.socket.on('room-joined', (data: { tripId: string; success: boolean }) => {
      console.log(`Successfully joined room: ${data.tripId}`);
      this.emitEvent('room-joined', data);
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error.message);
      this.reconnectAttempts++;
      this.isConnecting = false;

      this.emitEvent('connection-status', {
        connected: false,
        error: `Failed to connect: ${error.message}`
      });
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log(`🔌 Socket disconnected: ${reason}`);
      this.isConnecting = false;
      this.emitEvent('connection-status', { connected: false });
    });

    this.socket.on('message', (message: any) => {
      console.log('Received message via socket:', message);
      this.emitEvent('message', message);
    });

    this.socket.on('edit-message', (message: any) => {
      console.log('✏️ Received edited message via socket:', message);
      this.emitEvent('edit-message', message);
    });

    this.socket.on('delete-message', (data: any) => {
      console.log('🗑️ Received deleted message via socket:', data);
      this.emitEvent('delete-message', data);
    });

    this.socket.on('user-typing', (data: { user: string; isTyping: boolean }) => {
      this.emitEvent('typing', data);
    });

    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      this.isConnecting = false;
      if (this.currentTripId) {
        this.socket?.emit('join-room', this.currentTripId);
      }
      this.emitEvent('connection-status', { connected: true });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
      this.currentTripId = null;
    }
  }


  sendTyping(tripId: string, user: string, isTyping: boolean): void {
    if (this.socket?.connected) {
      this.socket.emit('typing', { tripId, user, isTyping });
    }
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  off(event: string, callback: Function): void {
    this.listeners.get(event)?.delete(callback);
  }

  private emitEvent(event: string, data: any): void {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

export const socketService = new SocketService();