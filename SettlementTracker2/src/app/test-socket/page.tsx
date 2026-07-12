// app/test-socket/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { socketService } from '@/app/(dashboard)/dashboard/group/services/socket.service';

export default function TestSocketPage() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [socketId, setSocketId] = useState<string>('');
  const [connectionError, setConnectionError] = useState<string>('');

  useEffect(() => {
    console.log('🔌 Test page mounted, connecting...');
    
    // Connect to socket
    socketService.connect('test-room');

    // Handle connection status
    const statusHandler = (status: any) => {
      console.log('📡 Connection status:', status);
      setConnected(status.connected);
      if (status.error) {
        setConnectionError(status.error);
      }
    };

    // Handle incoming messages
    const messageHandler = (msg: any) => {
      console.log('📩 Received message:', msg);
      setMessages(prev => [...prev, `📥 ${JSON.stringify(msg)}`]);
    };

    // Handle room join
    const roomHandler = (data: any) => {
      console.log('🏠 Room joined:', data);
      if (data.success) {
        setMessages(prev => [...prev, `✅ Joined room: ${data.tripId}`]);
      }
    };

    // Register listeners
    socketService.on('connection-status', statusHandler);
    socketService.on('message', messageHandler);
    socketService.on('room-joined', roomHandler);

    // Check connection after 2 seconds
    setTimeout(() => {
      const isConnected = socketService.isConnected();
      const id = (socketService as any).socket?.id;
      setConnected(isConnected);
      setSocketId(id || '');
      console.log('🔌 Manual check - Connected:', isConnected, 'ID:', id);
      
      if (!isConnected) {
        setConnectionError('Failed to connect. Make sure socket server is running on port 3002');
        setMessages(prev => [...prev, '❌ Not connected to socket server!']);
      } else {
        setMessages(prev => [...prev, '✅ Connected to socket server!']);
      }
    }, 2000);

    return () => {
      socketService.off('connection-status', statusHandler);
      socketService.off('message', messageHandler);
      socketService.off('room-joined', roomHandler);
      socketService.disconnect();
    };
  }, []);

  const sendTestMessage = () => {
    if (!socketService.isConnected()) {
      alert('Not connected to socket server!');
      return;
    }

    const testMsg = {
      id: `test-${Date.now()}`,
      text: `Hello from test! ${new Date().toLocaleTimeString()}`,
      sender: 'Test User',
      timestamp: new Date().toLocaleTimeString(),
      isOwn: true,
      type: 'text'
    };
    
    console.log('📤 Sending test message:', testMsg);
    socketService.sendMessage('test-room', testMsg);
    setMessages(prev => [...prev, `📤 Sent: ${testMsg.text}`]);
  };

  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002';

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧪 WebSocket Test</h1>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4 space-y-2">
        <p><strong>Socket URL:</strong> {socketUrl}</p>
        <p><strong>Status:</strong> {connected ? '✅ Connected' : '❌ Disconnected'}</p>
        {socketId && <p><strong>Socket ID:</strong> {socketId}</p>}
        {connectionError && (
          <p className="text-red-500"><strong>Error:</strong> {connectionError}</p>
        )}
      </div>

      <button
        onClick={sendTestMessage}
        disabled={!connected}
        className={`px-4 py-2 rounded-lg mb-4 ${
          connected 
            ? 'bg-blue-500 hover:bg-blue-600 text-white' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Send Test Message {!connected && '(Not Connected)'}
      </button>

      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">Messages ({messages.length}):</h2>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-gray-500">No messages yet</p>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className="text-sm border-b border-gray-300 dark:border-gray-700 py-1">
                {msg}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <h3 className="font-semibold text-yellow-700 dark:text-yellow-300">Troubleshooting:</h3>
        <ul className="text-sm text-yellow-600 dark:text-yellow-400 list-disc pl-4 mt-1 space-y-1">
          <li>Make sure socket server is running: <code>npm run socket</code></li>
          <li>Check <code>.env.local</code> has: <code>NEXT_PUBLIC_SOCKET_URL=http://localhost:3002</code></li>
          <li>Restart Next.js dev server after updating .env.local</li>
          <li>Check browser console for errors (F12)</li>
        </ul>
      </div>
    </div>
  );
}