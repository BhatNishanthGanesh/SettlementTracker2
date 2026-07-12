// components/dashboard/group/settings/SettingsForm.tsx
'use client';
import React, { RefObject } from 'react';
import { Settings, Save, Loader2, MapPin, Wallet, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ImageUpload } from './ImageUpload';
import { TripFormData, Trip } from '@/app/(dashboard)/dashboard/group/types';

interface SettingsFormProps {
  trip: Trip;
  editForm: TripFormData;
  imagePreview: string | null;
  isSaving: boolean;
  isUploading: boolean;
  canEdit: boolean;
  fileInputRef: RefObject<HTMLInputElement>;
  onEditFormChange: (field: keyof TripFormData, value: string) => void;
  onImageUpload: (file: File) => Promise<void>;
  onImageRemove: () => void;
  onSaveGroup: () => Promise<void>;
}

export function SettingsForm({
  trip,
  editForm,
  imagePreview,
  isSaving,
  isUploading,
  canEdit,
  fileInputRef,
  onEditFormChange,
  onImageUpload,
  onImageRemove,
  onSaveGroup,
}: SettingsFormProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <Settings className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Group Information</h2>
            <p className="text-sm text-gray-500">Manage your group's details and preferences</p>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-6">
        <div className="flex items-start gap-6">
          <ImageUpload
            imagePreview={imagePreview}
            isUploading={isUploading}
            canEdit={canEdit}
            fileInputRef={fileInputRef}
            onUpload={onImageUpload}
            onRemove={onImageRemove}
          />
          <div className="flex-1 space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Group Name *</label>
              <Input
                value={editForm.name}
                onChange={(e) => onEditFormChange('name', e.target.value)}
                placeholder="Enter group name"
                className="mt-1 border-gray-200 dark:border-gray-700 focus:ring-blue-500"
                disabled={!canEdit}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <Textarea
                value={editForm.description}
                onChange={(e) => onEditFormChange('description', e.target.value)}
                placeholder="Describe your trip..."
                rows={2}
                className="mt-1 resize-none border-gray-200 dark:border-gray-700 focus:ring-blue-500"
                disabled={!canEdit}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Destination
            </label>
            <Input
              value={editForm.destination}
              onChange={(e) => onEditFormChange('destination', e.target.value)}
              placeholder="e.g., Goa, India"
              className="mt-1 border-gray-200 dark:border-gray-700 focus:ring-blue-500"
              disabled={!canEdit}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Budget (₹)
            </label>
            <Input
              type="number"
              value={editForm.budget}
              onChange={(e) => onEditFormChange('budget', e.target.value)}
              placeholder="Enter budget amount"
              className="mt-1 border-gray-200 dark:border-gray-700 focus:ring-blue-500"
              disabled={!canEdit}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <CalendarDays className="h-4 w-4" /> Start Date
            </label>
            <Input
              type="date"
              value={editForm.startDate}
              onChange={(e) => onEditFormChange('startDate', e.target.value)}
              className="mt-1 border-gray-200 dark:border-gray-700 focus:ring-blue-500"
              disabled={!canEdit}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <CalendarDays className="h-4 w-4" /> End Date
            </label>
            <Input
              type="date"
              value={editForm.endDate}
              onChange={(e) => onEditFormChange('endDate', e.target.value)}
              className="mt-1 border-gray-200 dark:border-gray-700 focus:ring-blue-500"
              disabled={!canEdit}
            />
          </div>
        </div>

        {canEdit && (
          <Button 
            onClick={onSaveGroup} 
            disabled={isSaving || isUploading || !editForm.name.trim()} 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30"
          >
            {isSaving || isUploading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {isUploading ? 'Uploading...' : 'Saving...'}</>
            ) : (
              <><Save className="h-4 w-4 mr-2" /> Save Changes</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}