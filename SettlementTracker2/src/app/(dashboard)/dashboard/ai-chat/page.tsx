// app/(dashboard)/dashboard/ai-chat/page.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, ArrowLeft, Settings, User, Sparkles, MessageSquare, Clock, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

// Time Display Component - Fixes hydration mismatch
const TimeDisplay = ({ timestamp }: { timestamp: Date }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <span className="text-xs text-gray-400 dark:text-gray-500">...</span>;
  }
  
  return (
    <span className="text-xs text-gray-400 dark:text-gray-500">
      {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </span>
  );
};

// Chat Message Component with fixed hydration
const ChatMessage = ({ message, isUser, timestamp, quickReplies, onQuickReply, isFallback, isRestricted }: any) => (
  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
    <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
      <div className={`rounded-2xl px-4 py-3 ${
        isUser 
          ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
          : `bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md border 
             ${isRestricted ? 'border-amber-300 dark:border-amber-700' : 'border-gray-100 dark:border-gray-700'}`
      }`}>
        <div className="text-sm leading-relaxed whitespace-pre-wrap">{message}</div>
        {isRestricted && (
          <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <span>🔒</span> I can only answer expense-related questions
          </div>
        )}
        {isFallback && (
          <div className="mt-1 text-[10px] text-yellow-500 dark:text-yellow-400">
            ⚡ AI was busy, here's a quick response
          </div>
        )}
      </div>
      {!isUser && quickReplies && quickReplies.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {quickReplies.map((reply: string, index: number) => (
            <button
              key={index}
              onClick={() => onQuickReply(reply)}
              className="text-xs px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-200 dark:border-indigo-800"
            >
              {reply}
            </button>
          ))}
        </div>
      )}
      <div className={`flex items-center gap-1 mt-1 px-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
        <Clock className="w-3 h-3 text-gray-400" />
        <TimeDisplay timestamp={timestamp} />
      </div>
    </div>
    {!isUser && (
      <div className="order-0 mr-3">
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Bot className="w-5 h-5 text-white" />
        </div>
      </div>
    )}
  </div>
);

// Typing Indicator
const TypingIndicator = () => (
  <div className="flex items-start mb-4 animate-in fade-in duration-200">
    <div className="mr-3">
      <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20">
        <Bot className="w-5 h-5 text-white" />
      </div>
    </div>
    <div className="bg-white dark:bg-gray-800 rounded-2xl px-5 py-3 shadow-md border border-gray-100 dark:border-gray-700">
      <div className="flex space-x-1.5">
        <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  </div>
);

// Quick Suggestions
const QuickSuggestions = ({ onSuggestionClick }: any) => {
  const suggestions = [
    { icon: "💰", text: "How much have I spent?" },
    { icon: "📊", text: "Show my spending summary" },
    { icon: "⚠️", text: "Any budget alerts?" },
    { icon: "💡", text: "Tips to save money" },
    { icon: "✈️", text: "Show my trips" },
    { icon: "📂", text: "What are my top categories?" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-6">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSuggestionClick(suggestion.text)}
          className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md text-left flex items-center gap-3"
        >
          <span className="text-xl group-hover:scale-110 transition-transform duration-200">{suggestion.icon}</span>
          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-medium">
            {suggestion.text}
          </span>
        </button>
      ))}
    </div>
  );
};

export default function AiChatPage() {
  const { data: session } = useSession();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ 
    message: string; 
    isUser: boolean; 
    timestamp: Date;
    quickReplies?: string[];
    isFallback?: boolean;
    isRestricted?: boolean;
  }>>([
    {
      message: "👋 Hi! I'm your AI expense assistant for Settlement Tracker. I can help you track spending, analyze patterns, and provide money-saving tips. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
      quickReplies: ['How much have I spent?', 'Show my trips', 'Budget status', 'Saving tips']
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Set mounted state for hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  // Focus input on load
  useEffect(() => {
    if (mounted) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [mounted]);

  const handleSendMessage = async () => {
    if (!message.trim() || isTyping) return;
    
    const userMessage = message.trim();
    setMessage('');
    setChatHistory(prev => [...prev, {
      message: userMessage,
      isUser: true,
      timestamp: new Date()
    }]);
    setHasInteracted(true);
    setIsTyping(true);

    try {
      const response = await fetch('/api/aichat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setChatHistory(prev => [...prev, {
        message: data.response,
        isUser: false,
        timestamp: new Date(),
        quickReplies: data.quickReplies || [],
        isFallback: data.fallback || false,
        isRestricted: data.restricted || false,
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response. Please try again.');
      setChatHistory(prev => [...prev, {
        message: "😅 I'm having trouble connecting. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
        quickReplies: ['Try again', 'Help']
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleQuickReply = (reply: string) => {
    setMessage(reply);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  // Prevent hydration errors by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      {/* Header - same as before */}
      <header className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-4 py-4 sticky top-0 z-10 shadow-xl">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => window.history.back()}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 text-white backdrop-blur-sm"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative bg-white/10 backdrop-blur-sm p-2 rounded-xl">
                  <Bot className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Settlement Tracker AI</h1>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-xs text-white/80 font-medium">
                    {isTyping ? 'Thinking...' : 'Powered by Groq AI'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button 
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 text-white/80 hover:text-white backdrop-blur-sm"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button 
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 text-white/80 hover:text-white backdrop-blur-sm"
              aria-label="Profile"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Chat Messages Area */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <div 
          ref={chatContainerRef}
          className="h-[calc(100vh-220px)] overflow-y-auto scroll-smooth px-2"
        >
          <div className="max-w-3xl mx-auto">
            {chatHistory.map((chat, index) => (
              <ChatMessage
                key={index}
                message={chat.message}
                isUser={chat.isUser}
                timestamp={chat.timestamp}
                quickReplies={chat.quickReplies}
                onQuickReply={handleQuickReply}
                isFallback={chat.isFallback}
                isRestricted={chat.isRestricted}
              />
            ))}
            {isTyping && <TypingIndicator />}
            
            {/* Quick Suggestions */}
            {!hasInteracted && chatHistory.length === 1 && (
              <div className="max-w-3xl mx-auto mt-10">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-300 dark:to-gray-600"></div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Quick Start
                    </p>
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-300 dark:to-gray-600"></div>
                </div>
                <QuickSuggestions onSuggestionClick={handleSuggestionClick} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input Area - Sticky Bottom */}
      <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl sticky bottom-0">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-end space-x-3 max-w-3xl mx-auto">
            <div className="flex-1 relative">
              <div className="relative group">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your expenses..."
                  className="w-full px-5 py-3.5 pr-14 bg-gray-100/80 dark:bg-gray-700/80 border-2 border-transparent focus:border-indigo-500 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm"
                  disabled={isTyping}
                  maxLength={500}
                />
                {message && (
                  <span className="absolute right-4 bottom-3.5 text-xs text-gray-400 font-medium">
                    {message.length}/500
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || isTyping}
              className={`p-3.5 rounded-2xl transition-all duration-200 ${
                message.trim() && !isTyping
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              {isTyping ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-center gap-2 mt-3 max-w-3xl mx-auto">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              {session?.user?.name ? `Hi ${session.user.name}!` : ''} Powered by Groq AI · Expense Assistant
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}