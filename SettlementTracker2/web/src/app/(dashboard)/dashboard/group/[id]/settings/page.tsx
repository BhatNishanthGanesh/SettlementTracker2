// app/dashboard/group/[id]/settings/page.tsx
'use client';
import React, { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, ExternalLink, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Components
import { SettingsForm } from '@/components/dashboard/group/settings/SettingsForm';
import { MembersList } from '@/components/dashboard/group/settings/MembersList';
import { DangerZone } from '@/components/dashboard/group/settings/DangerZone';

import { TripFormData } from '@/types/trip.types';

// Layout Context
import { GroupContext } from '@/context/GroupTripContext';

export default function GroupSettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const context = useContext(GroupContext);
  if (!context) throw new Error('GroupSettingsPage must be used within GroupLayout');

  const {
    trip,
    loading,
    canEdit,
    editForm,
    setEditForm,
    imagePreview,
    isSaving,
    isUploading,
    fileInputRef,
    handleImageSelect,
    handleImageRemove,
    handleSaveGroup,
    setShowAddMemberDialog,
    setMemberToRemove,
    setShowDeleteDialog,
    setShowLeaveDialog,
  } = context;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
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
    <>
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
            onImageRemove={handleImageRemove}
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
    </>
  );
}