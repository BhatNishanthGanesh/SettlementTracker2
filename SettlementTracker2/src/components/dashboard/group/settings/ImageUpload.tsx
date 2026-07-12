// components/dashboard/group/settings/ImageUpload.tsx
'use client';
import React, { RefObject } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  imagePreview: string | null;
  isUploading: boolean;
  canEdit: boolean;
  fileInputRef: RefObject<HTMLInputElement>;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
}

export function ImageUpload({ 
  imagePreview, 
  isUploading, 
  canEdit, 
  fileInputRef, 
  onUpload, 
  onRemove 
}: ImageUploadProps) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Group Icon</label>
      <div className="mt-2 relative">
        {imagePreview ? (
          <div className="relative inline-block group">
            <img 
              src={imagePreview} 
              alt="Group icon" 
              className="h-28 w-28 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg" 
            />
            {canEdit && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="icon" 
                  className="h-8 w-8 rounded-full" 
                  onClick={onRemove}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-28 w-28 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-1 hover:border-blue-500 hover:bg-blue-50/50 transition-all"
            disabled={!canEdit || isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-xs text-gray-400">Upload</span>
              </>
            )}
          </button>
        )}
        <input 
          ref={fileInputRef} 
          type="file" 
          accept="image/jpeg,image/png,image/webp" 
          onChange={(e) => { 
            const file = e.target.files?.[0]; 
            if (file) onUpload(file); 
          }} 
          className="hidden" 
          disabled={!canEdit} 
        />
      </div>
      {!canEdit && (
        <p className="text-xs text-gray-500 mt-2">Only admins can change the group icon</p>
      )}
    </div>
  );
}