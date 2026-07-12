// hooks/useMessages.ts
import { useState, useCallback, useEffect } from 'react';
import { MessageService } from '@/app/(dashboard)/dashboard/group/services/message.service';
import { Message, Attachment } from '@/app/(dashboard)/dashboard/group/types';
import { toast } from 'sonner';
import { socketService } from '@/app/(dashboard)/dashboard/group/services/socket.service';
import { useSession } from 'next-auth/react';

const messageService = new MessageService();

export function useMessages(tripId: string, tripName?: string) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const fetchedMessages = await messageService.getMessages(tripId);
        
        if (fetchedMessages && fetchedMessages.length > 0) {
          const mappedMessages: Message[] = fetchedMessages.map((msg: any) => ({
            id: msg.id,
            sender: msg.sender || 'Unknown',
            senderId: msg.senderId,
            senderImage: msg.senderImage || session?.user?.image || null,
            text: msg.text,
            timestamp: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString(),
            isOwn: msg.senderId === session?.user?.id || msg.sender === session?.user?.name,
            type: msg.type || 'text',
            createdAt: msg.createdAt,
            updatedAt: msg.updatedAt,
            edited: msg.edited || false,
            editedAt: msg.editedAt,
            deleted: msg.deleted || false,
            metadata: msg.metadata || null,
            attachments: msg.metadata?.attachments || msg.attachments || undefined,
          }));
          setMessages(mappedMessages);
        } else {
          setMessages([
            {
              id: 'welcome',
              sender: 'System',
              text: `Welcome to "${tripName || 'the group'}"! Start planning your trip! 🎉`,
              timestamp: new Date().toLocaleTimeString(),
              isOwn: false,
              type: 'text',
              senderImage: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              edited: false,
              deleted: false,
              metadata: null,
            },
          ]);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        setMessages([
          {
            id: 'welcome',
            sender: 'System',
            text: `Welcome to "${tripName || 'the group'}"! Start planning your trip! 🎉`,
            timestamp: new Date().toLocaleTimeString(),
            isOwn: false,
            type: 'text',
            senderImage: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            edited: false,
            deleted: false,
            metadata: null,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    if (tripId) {
      loadMessages();
    }
  }, [tripId, tripName, session]);

  // Setup WebSocket connection
  useEffect(() => {
    if (!tripId) return;

    console.log('🔌 Setting up WebSocket connection for trip:', tripId);
    
    socketService.connect(tripId);
    setIsConnected(socketService.isConnected());

    const messageHandler = (newMessage: any) => {
      console.log('📩 New message received via socket:', newMessage);
      
      setMessages((prev: Message[]) => {
        const exists = prev.some(msg => msg.id === newMessage.id);
        if (exists) return prev;
        
        const message: Message = {
          id: newMessage.id || `temp-${Date.now()}`,
          sender: newMessage.sender || 'Unknown',
          senderId: newMessage.senderId,
          senderImage: newMessage.senderImage || session?.user?.image || null,
          text: newMessage.text || '',
          timestamp: newMessage.timestamp || new Date().toLocaleTimeString(),
          isOwn: newMessage.senderId === session?.user?.id || newMessage.sender === session?.user?.name,
          type: newMessage.type || 'text',
          createdAt: newMessage.createdAt,
          updatedAt: newMessage.updatedAt,
          edited: newMessage.edited || false,
          editedAt: newMessage.editedAt,
          deleted: newMessage.deleted || false,
          metadata: newMessage.metadata || null,
          attachments: newMessage.metadata?.attachments || newMessage.attachments || undefined,
        };
        
        return [...prev, message];
      });
    };

    // Listen for edited messages
    const editHandler = (editedMessage: any) => {
      console.log('✏️ Message edited via socket:', editedMessage);
      setMessages((prev: Message[]) =>
        prev.map((msg: Message) =>
          msg.id === editedMessage.id
            ? { 
                ...msg, 
                text: editedMessage.text, 
                edited: true, 
                editedAt: editedMessage.editedAt || new Date().toISOString(),
                metadata: editedMessage.metadata || msg.metadata || null,
              }
            : msg
        )
      );
    };

    // Listen for deleted messages
    const deleteHandler = (data: { messageId: string }) => {
      console.log('🗑️ Message deleted via socket:', data);
      setMessages((prev: Message[]) =>
        prev.map((msg: Message) =>
          msg.id === data.messageId
            ? { ...msg, text: 'This message was deleted', deleted: true }
            : msg
        )
      );
    };

    const typingHandler = (data: { user: string; isTyping: boolean }) => {
      setTypingUsers((prev: Set<string>) => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.user);
        } else {
          newSet.delete(data.user);
        }
        return newSet;
      });
    };

    const connectionHandler = (status: { connected: boolean; error?: string }) => {
      console.log('🔌 Connection status changed:', status);
      setIsConnected(status.connected);
      
      if (status.error) {
        toast.warning('Chat connection lost. Reconnecting...');
      }
    };

    socketService.on('message', messageHandler);
    socketService.on('edit-message', editHandler);
    socketService.on('delete-message', deleteHandler);
    socketService.on('typing', typingHandler);
    socketService.on('connection-status', connectionHandler);

    return () => {
      socketService.off('message', messageHandler);
      socketService.off('edit-message', editHandler);
      socketService.off('delete-message', deleteHandler);
      socketService.off('typing', typingHandler);
      socketService.off('connection-status', connectionHandler);
      socketService.disconnect();
    };
  }, [tripId, session]);

  // ✅ FIXED: sendMessage with correct parameters
  const sendMessage = useCallback(async (text: string, senderName: string, attachments?: Attachment[]) => {
    if (!text.trim() && (!attachments || attachments.length === 0)) return;

    setIsSending(true);
    
    try {
      const message = await messageService.sendMessage(
        tripId,
        text.trim() || '📎 Image',
        attachments || [],
        attachments && attachments.length > 0 ? { attachments } : undefined
      );
      
      const newMessage: Message = {
        id: message.id || `temp-${Date.now()}`,
        sender: senderName,
        senderId: session?.user?.id,
        senderImage: session?.user?.image || null,
        text: message.text || text || '📎 Image',
        timestamp: new Date().toLocaleTimeString(),
        isOwn: true,
        type: message.type || (attachments && attachments.length > 0 ? 'image' : 'text'),
        createdAt: message.createdAt || new Date().toISOString(),
        updatedAt: message.updatedAt || new Date().toISOString(),
        edited: false,
        deleted: false,
        metadata: message.metadata || undefined,
        attachments: attachments && attachments.length > 0 ? attachments : undefined,
      };
      
      setMessages((prev: Message[]) => [...prev, newMessage]);
      
      if (socketService.isConnected()) {
        socketService.sendMessage(tripId, newMessage);
      }
      
      return newMessage;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      toast.error('Failed to send message');
      throw error;
    } finally {
      setIsSending(false);
    }
  }, [tripId, session]);

  // Edit message function
  const editMessage = useCallback(async (messageId: string, newText: string) => {
    try {
      // Optimistic update
      setMessages((prev: Message[]) =>
        prev.map((msg: Message) =>
          msg.id === messageId
            ? { ...msg, text: newText.trim(), edited: true, editedAt: new Date().toISOString() }
            : msg
        )
      );

      const editedMessage = await messageService.editMessage(tripId, messageId, newText.trim());
      
      // Update with server response
      setMessages((prev: Message[]) =>
        prev.map((msg: Message) =>
          msg.id === messageId
            ? { ...msg, text: editedMessage.text, edited: true, editedAt: editedMessage.editedAt || new Date().toISOString() }
            : msg
        )
      );

      toast.success('Message edited');
    } catch (error) {
      console.error('Error editing message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to edit message');
      // Refetch messages to revert optimistic update
      const fetchedMessages = await messageService.getMessages(tripId);
      if (fetchedMessages) {
        setMessages(fetchedMessages.map((msg: any) => ({
          id: msg.id,
          sender: msg.sender || 'Unknown',
          senderId: msg.senderId,
          senderImage: msg.senderImage || session?.user?.image || null,
          text: msg.text,
          timestamp: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString(),
          isOwn: msg.senderId === session?.user?.id || msg.sender === session?.user?.name,
          type: msg.type || 'text',
          createdAt: msg.createdAt,
          updatedAt: msg.updatedAt,
          edited: msg.edited || false,
          editedAt: msg.editedAt,
          deleted: msg.deleted || false,
          metadata: msg.metadata || null,
          attachments: msg.metadata?.attachments || msg.attachments || undefined,
        })));
      }
    }
  }, [tripId, session]);

  // Delete message function
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      // Optimistic update
      setMessages((prev: Message[]) =>
        prev.map((msg: Message) =>
          msg.id === messageId
            ? { ...msg, text: 'This message was deleted', deleted: true }
            : msg
        )
      );

      await messageService.deleteMessage(tripId, messageId);
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete message');
      // Refetch messages to revert optimistic update
      const fetchedMessages = await messageService.getMessages(tripId);
      if (fetchedMessages) {
        setMessages(fetchedMessages.map((msg: any) => ({
          id: msg.id,
          sender: msg.sender || 'Unknown',
          senderId: msg.senderId,
          senderImage: msg.senderImage || session?.user?.image || null,
          text: msg.text,
          timestamp: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString(),
          isOwn: msg.senderId === session?.user?.id || msg.sender === session?.user?.name,
          type: msg.type || 'text',
          createdAt: msg.createdAt,
          updatedAt: msg.updatedAt,
          edited: msg.edited || false,
          editedAt: msg.editedAt,
          deleted: msg.deleted || false,
          metadata: msg.metadata || null,
          attachments: msg.metadata?.attachments || msg.attachments || undefined,
        })));
      }
    }
  }, [tripId, session]);

  const sendTyping = useCallback((isTyping: boolean, userName: string) => {
    if (socketService.isConnected()) {
      socketService.sendTyping(tripId, userName, isTyping);
    }
  }, [tripId]);

  const addSystemMessage = useCallback((text: string) => {
    const systemMessage: Message = {
      id: `system-${Date.now()}`,
      sender: 'System',
      text,
      timestamp: new Date().toLocaleTimeString(),
      isOwn: false,
      type: 'system',
      senderImage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      edited: false,
      deleted: false,
      metadata: null,
    };
    setMessages((prev: Message[]) => [...prev, systemMessage]);
    
    if (socketService.isConnected()) {
      socketService.sendMessage(tripId, systemMessage);
    }
  }, [tripId]);

  const addExpenseMessage = useCallback((text: string, senderName: string) => {
    const expenseMessage: Message = {
      id: `expense-${Date.now()}`,
      sender: senderName,
      text,
      timestamp: new Date().toLocaleTimeString(),
      isOwn: false,
      type: 'expense',
      senderImage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      edited: false,
      deleted: false,
      metadata: null,
    };
    setMessages((prev: Message[]) => [...prev, expenseMessage]);
    
    if (socketService.isConnected()) {
      socketService.sendMessage(tripId, expenseMessage);
    }
  }, [tripId]);

  return {
    messages,
    isSending,
    isLoading,
    isConnected,
    typingUsers,
    sendMessage,
    editMessage,
    deleteMessage,
    sendTyping,
    addSystemMessage,
    addExpenseMessage,
  };
}