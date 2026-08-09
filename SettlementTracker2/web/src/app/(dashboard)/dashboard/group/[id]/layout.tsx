// app/dashboard/group/[id]/layout.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Hooks
import { useTrip } from '@/hooks/useTrip';
import { useMembers } from '@/hooks/useMembers';
import { imageService } from '@/services/image.service';

// Components
import { GroupDialogs } from '@/components/dashboard/group/GroupDialogs';
import { LeaveGroupDialog } from '@/components/dashboard/group/LeaveGroupDialog';
import { RemoveMemberDialog } from '@/components/dashboard/group/settings/RemoveMemberDialog';
import { ImageCropper } from '@/components/dashboard/ImageCropper';

// Types
import { TripFormData, Member } from '@/types/trip.types';
import { GroupContext } from '@/context/GroupTripContext';

interface GroupLayoutProps {
  children: React.ReactNode;
  params: { id: string };
}


export default function GroupLayout({ children, params }: GroupLayoutProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const groupId = params?.id as string;

  // State - All the shared state from both pages
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [tempImagePreview, setTempImagePreview] = useState<string | null>(null);
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const [editForm, setEditForm] = useState<TripFormData>({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    description: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const { trip, loading, updateTrip, deleteTrip, refresh, leaveTrip, isLeaving } = useTrip(groupId);
  const { addMember, isAdding, removeMember, isRemoving } = useMembers(groupId, refresh);

  const currentUser = trip?.members?.find(
  member => member.email === session?.user?.email
);
const isAdmin = currentUser?.isAdmin ?? false;
const canEdit = isAdmin;
const isOnlyMember = trip?.members?.length === 1;

  // Init form
  useEffect(() => {
    if (trip) {
      setEditForm({
        name: trip.name,
        destination: trip.destination || '',
        startDate: trip.startDate ? new Date(trip.startDate).toISOString().split('T')[0] : '',
        endDate: trip.endDate ? new Date(trip.endDate).toISOString().split('T')[0] : '',
        budget: trip.budget?.toString() || '',
        description: trip.description || '',
      });
      setImagePreview(trip.image);
    }
  }, [trip]);

  // Shared handlers
  const handleImageSelect = async (file: File) => {
    const validation = imageService.validateImage(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    const preview = await imageService.getImagePreview(file);
    setTempImagePreview(preview);
    setTempImageFile(file);
    setShowCropper(true);
  };

  const handleCropComplete = async (croppedFile: File) => {
    setImageFile(croppedFile);
    const preview = await imageService.getImagePreview(croppedFile);
    setImagePreview(preview);
    toast.success('Image cropped successfully!');
    setShowCropper(false);
  };

  const handleImageRemove = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveGroup = async () => {
    if (!trip) return;
    setIsSaving(true);
    try {
      let imageUrl = trip.image;
      if (imageFile) {
        const uploaded = await imageService.uploadImage(imageFile);
        imageUrl = uploaded.url;
      }
      await updateTrip({
        name: editForm.name,
        destination: editForm.destination || null,
        startDate: editForm.startDate || null,
        endDate: editForm.endDate || null,
        budget: parseFloat(editForm.budget) || 0,
        description: editForm.description || null,
        image: imageUrl,
      });
      toast.success('Group updated successfully!');
      setShowEditDialog(false);
      router.refresh();
    } catch (error) {
      toast.error('Failed to update group');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMember = async () => {
    const success = await addMember(newMemberName, newMemberEmail);
    if (success) {
      setShowAddMemberDialog(false);
      setNewMemberName('');
      setNewMemberEmail('');
    }
  };

  const handleDeleteGroup = async () => {
    const success = await deleteTrip();
    if (success) {
      setShowDeleteDialog(false);
      router.push('/dashboard/group');
    }
  };

  const handleLeaveGroup = async () => {
    const success = await leaveTrip();
    if (success) {
      setShowLeaveDialog(false);
      router.push('/dashboard/group');
    }
  };

  const handleRemoveMember = async (member: Member) => {
    if (!member.id) {
      toast.error("Invalid member");
      return;
    }
    await removeMember(member.id, member.name);
    setMemberToRemove(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading group...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-screen text-center p-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Group not found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            The group you're looking for doesn't exist or you don't have access.
          </p>
          <Button
            className="mt-6"
            onClick={() => router.push('/dashboard/group')}
          >
            Back to Groups
          </Button>
        </div>
      </div>
    );
  }

  const contextValue = {
    trip,
    loading,
    refresh,
    updateTrip,
    deleteTrip,
    addMember,
    removeMember,
    leaveGroup: leaveTrip,
    currentUser,
    isAdmin,
    canEdit,
    isOnlyMember,
    // Dialogs
    showEditDialog,
    setShowEditDialog,
    showDeleteDialog,
    setShowDeleteDialog,
    showLeaveDialog,
    setShowLeaveDialog,
    showAddMemberDialog,
    setShowAddMemberDialog,
    showCropper,
    setShowCropper,
    // Form state
    editForm,
    setEditForm,
    imagePreview,
    setImagePreview,
    imageFile,
    setImageFile,
    isSaving,
    setIsSaving,
    isUploading,
    setIsUploading,
    fileInputRef,
    // Handlers
    handleImageSelect,
    handleImageRemove,
    handleSaveGroup,
    handleAddMember,
    handleDeleteGroup,
    handleLeaveGroup,
    handleRemoveMember,
    handleCropComplete,
    // Member removal
    memberToRemove,
    setMemberToRemove,
    isRemoving,
    // New member form
    newMemberName,
    setNewMemberName,
    newMemberEmail,
    setNewMemberEmail,
    isAdding,
    // Cropper
    tempImagePreview,
    tempImageFile,
    // Leaving state
    isLeaving,
  };

  return (
    <GroupContext.Provider value={contextValue}>
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        {children}
      </div>

      {/* Shared Dialogs - Rendered at layout level */}
      <GroupDialogs
        showEdit={showEditDialog}
        onEditClose={() => setShowEditDialog(false)}
        editForm={editForm}
        onEditFormChange={(field: keyof TripFormData, value: string) =>
          setEditForm(prev => ({ ...prev, [field]: value }))
        }
        onEditSubmit={handleSaveGroup}
        isSaving={isSaving}
        imagePreview={imagePreview}
        onImageUpload={handleImageSelect}
        onImageRemove={handleImageRemove}
        isUploading={isUploading}
        fileInputRef={fileInputRef}
        showDelete={showDeleteDialog}
        onDeleteClose={() => setShowDeleteDialog(false)}
        onDeleteSubmit={handleDeleteGroup}
        tripName={trip.name}
        showAddMember={showAddMemberDialog}
        onAddMemberClose={() => setShowAddMemberDialog(false)}
        onAddMemberSubmit={handleAddMember}
        newMemberName={newMemberName}
        onNewMemberNameChange={setNewMemberName}
        newMemberEmail={newMemberEmail}
        onNewMemberEmailChange={setNewMemberEmail}
        isAddingMember={isAdding}
      />

      <LeaveGroupDialog
        open={showLeaveDialog}
        onOpenChange={setShowLeaveDialog}
        tripName={trip.name}
        isOnlyMember={isOnlyMember}
        remainingMembers={trip.members?.filter((m: any) => m.email !== session?.user?.email).length || 0}
        onConfirm={handleLeaveGroup}
        isLeaving={isLeaving}
      />

      <RemoveMemberDialog
        member={memberToRemove}
        isRemoving={isRemoving}
        onClose={() => setMemberToRemove(null)}
        onConfirm={async () => {
          if (!memberToRemove) return;
          await handleRemoveMember(memberToRemove);
        }}
      />

      <ImageCropper
        open={showCropper}
        onClose={() => {
          setShowCropper(false);
          setTempImagePreview(null);
          setTempImageFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }}
        imageSrc={tempImagePreview || ''}
        onCropComplete={handleCropComplete}
        aspectRatio={1}
        circularCrop={true}
        minDimension={400}
        cropShape="round"
      />
    </GroupContext.Provider>
  );
}