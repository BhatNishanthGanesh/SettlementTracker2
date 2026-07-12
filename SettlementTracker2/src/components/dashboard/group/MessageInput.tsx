// components/MessageInput.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Smile, Paperclip, Send, Loader2, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import EmojiPicker from 'emoji-picker-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';

interface MessageInputProps {
  onSend: (text: string, attachments?: File[]) => void;
  isSending: boolean;
  placeholder?: string;
  onTyping?: (isTyping: boolean) => void;
}

export function MessageInput({ 
  onSend, 
  isSending, 
  placeholder = 'Type a message...',
  onTyping 
}: MessageInputProps) {
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [text]);

  const handleTyping = (value: string) => {
    setText(value);
    
    if (onTyping) {
      if (value.length > 0 && !isTyping) {
        setIsTyping(true);
        onTyping(true);
      }
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      if (value.length > 0) {
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          onTyping(false);
        }, 2000);
      } else {
        setIsTyping(false);
        onTyping(false);
      }
    }
  };

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || isSending) return;
    onSend(text, attachments);
    setText('');
    setAttachments([]);
    setAttachmentPreviews([]);
    setIsTyping(false);
    if (onTyping) onTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setText(prev => prev + emoji.emoji);
    setIsEmojiPickerOpen(false);
    textareaRef.current?.focus();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    // Validate files
    const validFiles = fileArray.filter(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} has unsupported format. Only images allowed.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setAttachments(prev => [...prev, ...validFiles]);

    // Create previews for images
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachmentPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setAttachmentPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800 flex-shrink-0">
      {/* Attachment Previews */}
      {attachmentPreviews.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 max-w-4xl mx-auto">
          {attachmentPreviews.map((preview, index) => (
            <div key={index} className="relative group">
              <div className="relative">
                <img 
                  src={preview} 
                  alt={`Attachment ${index + 1}`}
                  className="h-16 w-16 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                />
                <button
                  onClick={() => removeAttachment(index)}
                  className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        {/* Emoji Picker */}
        <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
          <PopoverTrigger asChild>
            <button 
              className="h-5 w-5 ml-4 rounded-full flex-shrink-0 mb-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              type="button"
            >
              <Smile className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </PopoverTrigger>
          <PopoverContent 
            className="p-0 border-0 shadow-2xl w-full max-w-[320px] bg-transparent"
            side="top"
            align="start"
          >
            <EmojiPicker
              onEmojiClick={handleEmojiSelect}
              searchPlaceholder="Search emojis..."
              width="100%"
              height={400}
              previewConfig={{
                showPreview: false,
              }}
            />
          </PopoverContent>
        </Popover>

        {/* File Upload */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-5 w-5 ml-2 mr-3 rounded-full flex-shrink-0 mb-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          <Paperclip className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
          multiple
        />

        {/* Text Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            placeholder={placeholder}
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[40px] max-h-[120px] bg-gray-100 dark:bg-gray-700 border-0 rounded-2xl resize-none py-2 px-4 focus-visible:ring-1 text-sm leading-5"
            rows={1}
            disabled={isSending}
          />
          {attachments.length > 0 && (
            <div className="absolute bottom-1 right-2">
              <span className="text-xs text-blue-500 font-medium">
                📎 {attachments.length} file{attachments.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={(!text.trim() && attachments.length === 0) || isSending}
          className={cn(
            "h-10 w-10 rounded-full flex-shrink-0 p-0 transition-all duration-200",
            (text.trim() || attachments.length > 0) && !isSending
              ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30"
              : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
          )}
          type="button"
        >
          {isSending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
      
      <div className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-1">
        Press Enter to send, Shift+Enter for new line • Max 10MB per file
      </div>
    </div>
  );
}