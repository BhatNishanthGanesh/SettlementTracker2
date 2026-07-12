// components/dashboard/group/ChatTab.tsx
'use client';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Loader2, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Message } from '@/app/(dashboard)/dashboard/group/types';
import { ChatMessage } from './ChatMessage';
import { MessageInput } from './MessageInput';
import { ImageService } from '@/app/(dashboard)/dashboard/group/services/image.service';
import { toast } from 'sonner';

const imageService = new ImageService();

interface ChatTabProps {
  messages: Message[];
  isSending: boolean;
  isLoading?: boolean;
  isConnected?: boolean;
  typingUsers?: Set<string>;
  onSendMessage: (text: string, attachments?: any[]) => void; 
  onTyping?: (isTyping: boolean) => void;
  onEditMessage?: (id: string, newText: string) => void;
  onDeleteMessage?: (id: string) => void;
}

export function ChatTab({ 
  messages, 
  isSending, 
  isLoading = false,
  isConnected = false,
  typingUsers = new Set(),
  onSendMessage,
  onTyping,
  onEditMessage,
  onDeleteMessage
}: ChatTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const prevMessagesLength = useRef(messages.length);

  // ✅ Handle sending with file uploads
  const handleSend = async (text: string, files?: File[]) => {
    if (!text.trim() && (!files || files.length === 0)) return;

    let uploadedAttachments: any[] = [];

    // Upload files if any
    if (files && files.length > 0) {
      setIsUploading(true);
      const loadingToast = toast.loading(`Uploading ${files.length} image(s)...`);

      try {
        for (const file of files) {
          const validation = imageService.validateImage(file);
          if (!validation.valid) {
            toast.error(validation.error);
            continue;
          }

          const url = await imageService.uploadImage(file);
          if (url) {
            uploadedAttachments.push({
              id: crypto.randomUUID(),
              url: url,
              type: file.type,
              name: file.name,
              size: file.size,
            });
          }
        }

        toast.dismiss(loadingToast);

        if (uploadedAttachments.length === 0 && files.length > 0) {
          toast.error('Failed to upload images');
          setIsUploading(false);
          return;
        }

        if (uploadedAttachments.length > 0) {
          toast.success(`Uploaded ${uploadedAttachments.length} image(s)`);
        }
      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error('Failed to upload images');
        setIsUploading(false);
        return;
      }
    }

    setIsUploading(false);

    // ✅ Send message with uploaded attachments (URLs, not Files)
    onSendMessage(text, uploadedAttachments);
  };

  // Keyboard shortcuts for edit/delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        const lastOwnMessage = [...messages]
          .reverse()
          .find(m => m.isOwn && !m.type?.includes('system'));
        
        if (lastOwnMessage) {
          const messageTime = new Date(lastOwnMessage.timestamp).getTime();
          const diffInMinutes = (Date.now() - messageTime) / (1000 * 60);
          
          if (diffInMinutes <= 5) {
            e.preventDefault();
            const messageElement = document.getElementById(`msg-${lastOwnMessage.id}`);
            messageElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [messages]);

  // Check if user is at bottom
  const checkIfAtBottom = useCallback(() => {
    if (!containerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const threshold = 100;
    return scrollHeight - scrollTop - clientHeight < threshold;
  }, []);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const atBottom = checkIfAtBottom();
    setIsAtBottom(atBottom);
    setShowScrollButton(!atBottom && messages.length > 0);
    
    if (!atBottom) {
      setIsAutoScrollEnabled(false);
    } else {
      setIsAutoScrollEnabled(true);
    }
  }, [checkIfAtBottom, messages.length]);

  const scrollToBottom = useCallback((behavior: 'smooth' | 'instant' = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior, 
        block: 'end' 
      });
    }
  }, []);

  // Handle new messages - smart scrolling
  useEffect(() => {
    if (messages.length === 0) return;

    const newMessageCount = messages.length - prevMessagesLength.current;
    const isNewMessage = newMessageCount > 0;

    if (!initialLoadComplete) {
      const savedScrollTop = sessionStorage.getItem('chat-scroll');
      
      if (savedScrollTop && containerRef.current) {
        containerRef.current.scrollTop = parseInt(savedScrollTop, 10);
        setInitialLoadComplete(true);
        setTimeout(() => {
          const atBottom = checkIfAtBottom();
          setIsAtBottom(atBottom);
          setIsAutoScrollEnabled(atBottom);
          setShowScrollButton(!atBottom);
        }, 100);
      } else {
        scrollToBottom('instant');
        setInitialLoadComplete(true);
        setIsAutoScrollEnabled(true);
        setIsAtBottom(true);
        setShowScrollButton(false);
      }
      
      prevMessagesLength.current = messages.length;
      return;
    }

    if (isNewMessage) {
      const lastMessage = messages[messages.length - 1];
      const isUserMessage = lastMessage?.isOwn || false;
      const isSystemMessage = lastMessage?.type === 'system' || lastMessage?.sender === 'System';

      const shouldAutoScroll = isAutoScrollEnabled || 
                              isUserMessage || 
                              isSystemMessage ||
                              isAtBottom;

      if (shouldAutoScroll) {
        const behavior = isUserMessage ? 'smooth' : 'instant';
        scrollToBottom(behavior);
        setIsAutoScrollEnabled(true);
        setIsAtBottom(true);
        setShowScrollButton(false);
      } else {
        setShowScrollButton(true);
      }
    }

    prevMessagesLength.current = messages.length;
  }, [messages, initialLoadComplete, isAutoScrollEnabled, scrollToBottom, checkIfAtBottom, isAtBottom]);

  // Save scroll position
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (containerRef.current && messages.length > 0) {
        sessionStorage.setItem('chat-scroll', containerRef.current.scrollTop.toString());
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && containerRef.current && messages.length > 0) {
        sessionStorage.setItem('chat-scroll', containerRef.current.scrollTop.toString());
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [messages]);

  // Reset auto-scroll when user manually scrolls to bottom
  useEffect(() => {
    if (isAtBottom && !isAutoScrollEnabled) {
      setIsAutoScrollEnabled(true);
      setShowScrollButton(false);
    }
  }, [isAtBottom, isAutoScrollEnabled]);

  const handleJumpToBottom = () => {
    scrollToBottom('smooth');
    setIsAutoScrollEnabled(true);
    setIsAtBottom(true);
    setShowScrollButton(false);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full relative">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/50"
      >
        <div className="space-y-3 max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation! 💬</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} id={`msg-${message.id}`}>
                <ChatMessage 
                  message={message} 
                  onEdit={onEditMessage}
                  onDelete={onDeleteMessage}
                />
              </div>
            ))
          )}
          
          {typingUsers.size > 0 && (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span>{Array.from(typingUsers).join(', ')} is typing...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {showScrollButton && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 animate-bounce-in">
          <Button
            size="sm"
            className="shadow-lg rounded-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white gap-2"
            onClick={handleJumpToBottom}
          >
            <ArrowDown className="h-4 w-4" />
            Jump to latest
          </Button>
        </div>
      )}

      <MessageInput
        onSend={handleSend} 
        isSending={isSending || isUploading}
        placeholder={isConnected ? "Type a message..." : "Connecting..."}
        onTyping={onTyping}
      />
    </div>
  );
}