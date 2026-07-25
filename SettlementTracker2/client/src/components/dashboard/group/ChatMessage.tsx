// components/dashboard/group/ChatMessage.tsx
import { Message } from '@/app/(dashboard)/dashboard/group/types';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { 
  MoreVertical, Edit, Trash2, X, Check, Receipt, User, Users, 
  Image as ImageIcon, Download, Eye, File, FileText 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/utils/formatters';

interface ChatMessageProps {
  message: Message;
  onEdit?: (id: string, newText: string) => void;
  onDelete?: (id: string) => void;
}

export function ChatMessage({ message, onEdit, onDelete }: ChatMessageProps) {
  const [imageError, setImageError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  console.log('ChatMessage:', {
    id: message.id,
    text: message.text,
    attachments: message.attachments,
    hasAttachments: !!(message.attachments && message.attachments.length > 0),
    metadata: message.metadata,
  });

  const isSystem = message.sender === 'System' || message.type === 'system';
  const isExpense = message.type === 'expense';
  const isOwn = message.isOwn;

  // ✅ Use message.attachments directly (not inside metadata)
  const hasAttachments = !!(message.attachments && message.attachments.length > 0);

  // Check if message is older than 5 minutes
  const isOlderThan5Min = () => {
    const messageTime = new Date(message.createdAt || message.timestamp).getTime();
    const now = Date.now();
    const diffInMinutes = (now - messageTime) / (1000 * 60);
    return diffInMinutes > 5;
  };

  const canEditOrDelete = isOwn && !isSystem && !isExpense && !isOlderThan5Min();

  const handleEdit = () => {
    setIsEditing(true);
    setEditText(message.text);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(editText.length, editText.length);
    }, 100);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== message.text) {
      onEdit?.(message.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(message.text);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    setIsDeleting(true);
    onDelete?.(message.id);
    setShowDeleteDialog(false);
    setIsDeleting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  useEffect(() => {
    if (textareaRef.current && isEditing) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [editText, isEditing]);

  const isImageUrl = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(url) || 
           url.startsWith('data:image/') ||
           (url.includes('cloudinary.com') && url.includes('image'));
  };

  const ImagePreviewModal = () => {
    if (!selectedImage) return null;
    return (
      <div
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200"
        onClick={() => setSelectedImage(null)}
      >
        <div className="relative max-w-4xl max-h-[90vh]">
          <img
            src={selectedImage}
            alt="Preview"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onError={() => console.error('Failed to load image')}
          />
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(selectedImage, '_blank');
            }}
            className="absolute top-4 right-16 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
          >
            <Download className="h-6 w-6" />
          </button>
        </div>
      </div>
    );
  };

const renderAttachments = () => {
  if (!hasAttachments) return null;
  
  return (
    <div className="mt-2 space-y-2">
      {message.attachments!.map((att) => {
        const isImage = isImageUrl(att.url);
        
        return (
          <div key={att.id} className="relative group">
            {isImage ? (
              <div className="relative inline-block max-w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
                <img
                  src={att.url}
                  alt={att.name || 'Image'}
                  className="max-w-full max-h-[260px] w-auto h-auto object-contain cursor-pointer transition-opacity duration-200 hover:opacity-95"
                  onClick={() => setSelectedImage(att.url)}
                  onError={(e) => {
                    console.error('Failed to load image:', att.url);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {/* Hover overlay with actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(att.url);
                    }}
                    className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all duration-200 hover:scale-110"
                    title="View full size"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(att.url, '_blank');
                    }}
                    className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all duration-200 hover:scale-110"
                    title="Download image"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
                {/* Filename badge */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded text-[10px] text-white/90 max-w-[180px] truncate">
                  {att.name || 'Image'}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 group cursor-default">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <File className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                    {att.name || 'File'}
                  </p>
                  {att.size && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {(att.size / 1024).toFixed(0)} KB
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(att.url, '_blank');
                  }}
                  className="p-1.5 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
                  title="Download file"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

  // System message
  if (isSystem) {
    return (
      <>
        <div className="flex justify-center">
          <div className="bg-gray-200/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-sm px-4 py-2 rounded-full max-w-[80%]">
            {message.text}
          </div>
        </div>
        <ImagePreviewModal />
      </>
    );
  }

  // Expense deleted message
  if (isSystem && message.metadata?.type === 'expense_deleted') {
    const metadata = message.metadata;
    return (
      <>
        <div className="flex flex-col items-start w-full">
          <div className="flex items-start gap-2 group max-w-[90%]">
            <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Trash2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="relative px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 rounded-bl-none border border-gray-200 dark:border-gray-700">
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.text}
              </p>
              {metadata.amount && metadata.paidBy && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Originally ₹{metadata.amount.toLocaleString()} paid by {metadata.paidBy}
                </p>
              )}
            </div>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 px-1 ml-10">
            {message.timestamp || new Date().toLocaleTimeString()}
          </span>
        </div>
        <ImagePreviewModal />
      </>
    );
  }

  // Expense message
  if (isExpense && message.metadata) {
    const metadata = message.metadata;
    const perPersonAmount = metadata.perPersonAmount || (metadata.amount ? metadata.amount / (metadata.splitBetween?.length || 1) : 0);
    const amount = metadata.amount || 0;
    const paidBy = metadata.paidBy || 'Unknown';
    const splitBetween = metadata.splitBetween || [];
    const category = metadata.category || 'other';
    const description = metadata.description || '';
    
    return (
      <>
        <div className="flex flex-col items-start w-full">
          <div className="flex items-end gap-2 group max-w-[90%]">
            <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
              <Receipt className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div className="relative px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-gray-900 dark:text-gray-100 rounded-bl-none border border-emerald-200 dark:border-emerald-800 max-w-full">
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Expense Added
                </span>
                {category && category !== 'other' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                )}
              </div>
              
              <p className="text-sm whitespace-pre-wrap break-words font-medium">
                {message.text}
              </p>

              <div className="mt-3 rounded-lg p-3 bg-white/80 dark:bg-gray-800/80 border border-emerald-100 dark:border-emerald-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Amount</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{formatCurrency(amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-emerald-200/30 dark:border-emerald-700/30 pt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Paid by
                  </span>
                  <span className="text-sm font-medium">
                    {paidBy}
                  </span>
                </div>

                {splitBetween.length > 0 && (
                  <div className="border-t border-emerald-200/30 dark:border-emerald-700/30 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Split between
                      </span>
                      <span className="text-sm font-medium">
                        {splitBetween.length} people
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {splitBetween.map((name: string, index: number) => (
                        <span 
                          key={index}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Per person</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        ₹{formatCurrency(perPersonAmount)}
                      </span>
                    </div>
                  </div>
                )}

                {description && (
                  <div className="border-t border-emerald-200/30 dark:border-emerald-700/30 pt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Note</span>
                    <p className="text-xs mt-0.5 italic text-gray-600 dark:text-gray-300">
                      {description}
                    </p>
                  </div>
                )}

                <div className="border-t border-emerald-200/30 dark:border-emerald-700/30 pt-2">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    {new Date(metadata.timestamp || message.createdAt || Date.now()).toLocaleString()}
                  </span>
                </div>
              </div>

              {message.edited && (
                <span className="text-[10px] opacity-60 ml-1">
                  (edited)
                </span>
              )}
            </div>
          </div>

          <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 px-1 ml-10">
            {message.timestamp || new Date().toLocaleTimeString()}
          </span>
        </div>
        <ImagePreviewModal />
      </>
    );
  }

  // Edit mode
  if (isEditing) {
    return (
      <div className={cn(
        "flex flex-col w-full max-w-[80%]",
        isOwn ? "items-end ml-auto" : "items-start"
      )}>
        <div className={cn(
          "w-full bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-lg",
          isOwn ? "rounded-br-none border-2 border-blue-500" : "rounded-bl-none"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <Edit className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Editing message</span>
          </div>
          <Textarea
            ref={textareaRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[60px] resize-none border-0 focus-visible:ring-2 focus-visible:ring-blue-500 bg-gray-50 dark:bg-gray-700/50"
            placeholder="Edit your message..."
          />
          <div className="flex items-center justify-end gap-2 mt-2">
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              Enter to save • Escape to cancel
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancelEdit}
              className="h-8 px-3"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEdit}
              disabled={!editText.trim() || editText === message.text}
              className="h-8 px-4 bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn(
        "flex flex-col",
        isOwn ? "items-end" : "items-start"
      )}>
        <div className="flex items-end gap-2 group ">
          {!isOwn && (
            <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden">
              {message.senderImage && !imageError ? (
                <img
                  src={message.senderImage}
                  alt={message.sender}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                  {message.sender?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
            </div>
          )}

          <div className={cn(
            "relative px-4 py-2 rounded-2xl ",
            isOwn
              ? "bg-blue-500 text-white rounded-br-none"
              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none shadow-sm"
          )}>
            {!isOwn && (
              <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                {message.sender}
              </div>
            )}

            {message.deleted ? (
              <p className="text-sm italic text-gray-500 dark:text-gray-400">
                This message was deleted
              </p>
            ) : (
              <>
                {message.text && (
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.text}
                  </p>
                )}
                {renderAttachments()}

                {message.edited && (
                  <span className="text-[10px] opacity-60 ml-1">
                    (edited)
                  </span>
                )}
              </>
            )}
          </div>

          {isOwn && (
            <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden">
              {message.senderImage && !imageError ? (
                <img
                  src={message.senderImage}
                  alt={message.sender}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-blue-500 flex items-center justify-center text-xs font-medium text-white">
                  {message.sender?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
            </div>
          )}

          {canEditOrDelete && !hasAttachments && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "h-7 w-7 rounded-full",
                      isOwn ? "text-white hover:bg-white/20" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 dark:bg-gray-900 bg-white border dark:border-gray-700">
                  <DropdownMenuItem onClick={handleEdit} className="gap-2">
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="gap-2 text-red-600 dark:text-red-400 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 px-1">
          {message.timestamp || new Date().toLocaleTimeString()}
        </span>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="dark:bg-gray-900 bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message?</AlertDialogTitle>
            <AlertDialogDescription>
              This message will be permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ImagePreviewModal />
    </>
  );
}