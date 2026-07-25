// components/GroupDialogs.tsx
'use client';
import React, { useRef } from 'react';
import { Loader2, Save, X, Upload, UserPlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Trip, TripFormData } from '@/app/(dashboard)/dashboard/group/types';

interface GroupDialogsProps {
  // Edit Dialog
  showEdit: boolean;
  onEditClose: () => void;
  editForm: TripFormData;
  onEditFormChange: (field: keyof TripFormData, value: string) => void;
  onEditSubmit: () => void;
  isSaving: boolean;
  imagePreview: string | null;
  onImageUpload: (file: File) => void;
  onImageRemove: () => void;
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;

  // Delete Dialog
  showDelete: boolean;
  onDeleteClose: () => void;
  onDeleteSubmit: () => void;
  tripName: string;

  // Add Member Dialog
  showAddMember: boolean;
  onAddMemberClose: () => void;
  onAddMemberSubmit: () => void;
  newMemberName: string;
  onNewMemberNameChange: (value: string) => void;
  newMemberEmail: string;
  onNewMemberEmailChange: (value: string) => void;
  isAddingMember: boolean;
}

export function GroupDialogs({
  // Edit
  showEdit,
  onEditClose,
  editForm,
  onEditFormChange,
  onEditSubmit,
  isSaving,
  imagePreview,
  onImageUpload,
  onImageRemove,
  isUploading,
  fileInputRef,

  // Delete
  showDelete,
  onDeleteClose,
  onDeleteSubmit,
  tripName,

  // Add Member
  showAddMember,
  onAddMemberClose,
  onAddMemberSubmit,
  newMemberName,
  onNewMemberNameChange,
  newMemberEmail,
  onNewMemberEmailChange,
  isAddingMember,
}: GroupDialogsProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  // Check if edit form is valid
  const isEditFormValid = () => {
    return (
      editForm.name.trim() !== '' &&
      editForm.destination.trim() !== '' &&
      editForm.startDate.trim() !== '' &&
      editForm.budget.trim() !== '' &&
      parseFloat(editForm.budget) > 0
      
    );
  };

  // Check if add member form is valid
  const isAddMemberFormValid = () => {
    return (
      newMemberName.trim() !== '' &&
      newMemberEmail.trim() !== '' &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newMemberEmail) // Basic email validation
    );
  };

  return (
    <>
      {/* Edit Group Dialog */}
      <Dialog open={showEdit} onOpenChange={onEditClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Group
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Group Icon
              </label>
              <div className="mt-2 flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Group icon"
                      className="h-24 w-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg"
                      onClick={onImageRemove}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-24 w-24 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-gray-50 dark:bg-gray-700"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <Upload className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                        <span className="text-xs text-gray-400 dark:text-gray-500">Upload</span>
                      </div>
                    )}
                  </Button>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Upload a group photo (JPG, PNG, WEBP)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Group Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={editForm.name}
                onChange={(e) => onEditFormChange('name', e.target.value)}
                placeholder="Enter group name"
                className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Destination <span className="text-red-500">*</span>
              </label>
              <Input
                value={editForm.destination}
                onChange={(e) => onEditFormChange('destination', e.target.value)}
                placeholder="e.g., Goa, India"
                className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={editForm.startDate}
                  onChange={(e) => onEditFormChange('startDate', e.target.value)}
                  className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  End Date <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                </label>
                <Input
                  type="date"
                  value={editForm.endDate}
                  onChange={(e) => onEditFormChange('endDate', e.target.value)}
                  className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Budget (₹) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={editForm.budget}
                onChange={(e) => onEditFormChange('budget', e.target.value)}
                placeholder="Enter budget amount"
                className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                min="1"
                step="1"
                required
              />
              {editForm.budget && parseFloat(editForm.budget) <= 0 && (
                <p className="text-xs text-red-500 mt-1">Budget must be greater than 0</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <Textarea
                value={editForm.description}
                onChange={(e) => onEditFormChange('description', e.target.value)}
                placeholder="Describe your trip..."
                rows={3}
                className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none"
              />
            </div>
          </div>
          <DialogFooter className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <Button 
              variant="outline" 
              onClick={onEditClose}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button 
              onClick={onEditSubmit} 
              disabled={isSaving || !isEditFormValid()}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Group Dialog */}
      <Dialog open={showDelete} onOpenChange={onDeleteClose}>
        <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              <Trash2 className="h-6 w-6" />
              Delete Group?
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300 text-base pt-2">
              Are you sure you want to delete "<span className="font-semibold text-gray-900 dark:text-white">{tripName}</span>"? 
              This action <span className="text-red-500 font-semibold">cannot be undone</span>.
              <br /><br />
              All expenses, messages, and member data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <Button 
              variant="outline" 
              onClick={onDeleteClose}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={onDeleteSubmit}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={showAddMember} onOpenChange={onAddMemberClose}>
        <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-blue-500" />
              Add Member
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400">
              Add a new member to the group <span className="text-red-500">*</span> indicates required fields
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={newMemberName}
                onChange={(e) => onNewMemberNameChange(e.target.value)}
                placeholder="Enter member name"
                className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={newMemberEmail}
                onChange={(e) => onNewMemberEmailChange(e.target.value)}
                placeholder="Enter email address"
                className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                required
              />
              {newMemberEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newMemberEmail) && (
                <p className="text-xs text-red-500 mt-1">Please enter a valid email address</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-blue-500"></span>
                Member will receive an invitation via email
              </p>
            </div>
          </div>
          <DialogFooter className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <Button 
              variant="outline" 
              onClick={onAddMemberClose}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button 
              onClick={onAddMemberSubmit} 
              disabled={isAddingMember || !isAddMemberFormValid()}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
            >
              {isAddingMember ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}