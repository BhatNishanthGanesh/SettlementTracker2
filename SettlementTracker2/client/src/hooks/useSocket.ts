// hooks/useSocket.ts
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

export function useSocket(tripId: string) {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!tripId) return;

    // Initialize socket connection
    const socket = io({
      path: '/api/socket',
      addTrailingSlash: false,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      // Join the room for this trip
      socket.emit('join-room', tripId);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-room', tripId);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
    };
  }, [tripId]);

  // Send message function
  const sendMessage = (message: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send-message', {
        tripId,
        message: {
          ...message,
          sender: session?.user?.name || 'Unknown',
          timestamp: new Date().toISOString(),
        },
      });
    }
  };

  // Typing indicator
  const sendTyping = (isTyping: boolean) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing', {
        tripId,
        user: session?.user?.name || 'Unknown',
        isTyping,
      });
    }
  };

  // Listen for incoming messages
  const onReceiveMessage = (callback: (message: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('receive-message', callback);
      return () => {
        socketRef.current?.off('receive-message', callback);
      };
    }
    return () => {};
  };

  // Listen for typing indicators
  const onUserTyping = (callback: (data: { user: string; isTyping: boolean }) => void) => {
    if (socketRef.current) {
      socketRef.current.on('user-typing', callback);
      return () => {
        socketRef.current?.off('user-typing', callback);
      };
    }
    return () => {};
  };

  return {
    isConnected,
    sendMessage,
    sendTyping,
    onReceiveMessage,
    onUserTyping,
    socket: socketRef.current,
  };
}