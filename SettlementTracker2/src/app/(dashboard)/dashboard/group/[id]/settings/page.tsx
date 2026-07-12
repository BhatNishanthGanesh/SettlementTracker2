// app/dashboard/group/[id]/settings/page.tsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Loader2, Settings, ExternalLink, Upload,X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Hooks
import { useTrip } from '@/hooks/useTrip';
import { useMembers } from '@/hooks/useMembers';
import { useLeaveGroup } from '@/hooks/useLeaveGroup';
import { ImageService } from '@/app/(dashboard)/dashboard/group/services/image.service';

// Components
import { GroupDialogs } from '@/components/dashboard/group/GroupDialogs';
import { LeaveGroupDialog } from '@/components/dashboard/group/LeaveGroupDialog';
import { SettingsForm } from '@/components/dashboard/group/settings/SettingsForm';
import { MembersList } from '@/components/dashboard/group/settings/MembersList';
import { DangerZone } from '@/components/dashboard/group/settings/DangerZone';
import { RemoveMemberDialog } from '@/components/dashboard/group/settings/RemoveMemberDialog';
import { ImageCropper } from '@/components/dashboard/ImageCropper';

// Types
import { TripFormData, Member } from '../../types';

const imageService = new ImageService();

export default function GroupSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const groupId = params?.id as string;

  // State
  const [editForm, setEditForm] = useState<TripFormData>({ 
    name: '', 
    destination: '', 
    startDate: '', 
    endDate: '', 
    budget: '', 
    description: '' 
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const [tempImagePreview, setTempImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const { trip, loading, updateTrip, deleteTrip, refresh } = useTrip(groupId);
  const { addMember, isAdding, removeMember, isRemoving } = useMembers(groupId, refresh);
  const { leaveGroup, isLeaving } = useLeaveGroup(groupId);

  console.log(trip)

  // Computed
  const currentUser = trip?.members?.find(m => m.email === session?.user?.email);
  const isAdmin = currentUser?.isAdmin || false;
  const isCreator = trip?.createdBy?.email === session?.user?.email;
  const canEdit = isAdmin || isCreator;
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

  // Handlers
  const handleImageSelect = async (file: File) => {
    const validation = imageService.validateImage(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // Show cropper with the selected image
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
  };

  const handleSaveGroup = async () => {
    if (!trip) return;
    setIsSaving(true);
    try {
      let imageUrl = trip.image;
      if (imageFile) {
        const uploaded = await imageService.uploadImage(imageFile);
        if (uploaded) imageUrl = uploaded;
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
      toast.success('Group updated!');
      setShowEditDialog(false);
      router.refresh();
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
    if (await deleteTrip()) {
      setShowDeleteDialog(false);
      router.push('/dashboard/group');
    }
  };

  const handleLeaveGroup = async () => {
    if (await leaveGroup()) {
      setShowLeaveDialog(false);
      router.push('/dashboard/group');
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    await removeMember(memberToRemove.id, memberToRemove.name);
    setMemberToRemove(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-screen text-center p-8">
        <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
          <Settings className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium">Group not found</h3>
        <Button className="mt-4" onClick={() => router.push('/dashboard/group')}>
          Back to Groups
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b dark:border-black bg-white dark:bg-gray-800 flex-shrink-0 sticky top-0 z-10">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push(`/dashboard/group/${trip.id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xl font-bold text-white shadow-lg overflow-hidden">
            {trip.image ? (
              <img src={trip.image} alt={trip.name} className="h-full w-full object-cover" />
            ) : (
              trip.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold">Settings</h1>
            <p className="text-sm text-gray-500">{trip.members?.length || 0} members • {trip._count?.expenses || 0} expenses</p>
          </div>
        </div>
        <div className="ml-auto">
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => router.push(`/dashboard/group/${trip.id}`)}>
            <ExternalLink className="h-4 w-4 mr-1" />
            View Group
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6 space-y-8 pb-20">
          <SettingsForm
            trip={trip}
            editForm={editForm}
            imagePreview={imagePreview}
            isSaving={isSaving}
            isUploading={isUploading}
            canEdit={canEdit}
            fileInputRef={fileInputRef}
            onEditFormChange={(field: keyof TripFormData, value: string) => 
              setEditForm(prev => ({ ...prev, [field]: value }))
            }
            onImageUpload={handleImageSelect}
            onImageRemove={() => {
              setImagePreview(null);
              setImageFile(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            onSaveGroup={handleSaveGroup}
          />

          <MembersList
            members={trip.members || []}
            canEdit={canEdit}
            currentUserEmail={session?.user?.email || ''}
            onAddMember={() => setShowAddMemberDialog(true)}
            onRemoveMember={setMemberToRemove}
          />

          {canEdit ? (
            <DangerZone type="delete" onAction={() => setShowDeleteDialog(true)} />
          ) : (
            <DangerZone type="leave" onAction={() => setShowLeaveDialog(true)} />
          )}
        </div>
      </div>

      {/* Dialogs */}
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
        onImageUpload={() => {}}
        onImageRemove={() => {
          setImagePreview(null);
          setImageFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }}
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
        isCreator={isCreator}
        isOnlyMember={isOnlyMember}
        remainingMembers={trip.members?.filter(m => m.email !== session?.user?.email).length || 0}
        onConfirm={handleLeaveGroup}
        isLeaving={isLeaving}
      />

      <RemoveMemberDialog
        member={memberToRemove}
        isRemoving={isRemoving}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
      />

      {/* Image Cropper */}
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
    </div>
  );
}