// app/dashboard/group/[id]/page.tsx
'use client';
import React, { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, MessageCircle, Receipt, HandCoins, Users, Settings, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

// Hooks
import { useTrip } from '@/hooks/useTrip';
import { useMessages } from '@/hooks/useMessages';
import { useMembers } from '@/hooks/useMembers';
import { useLeaveGroup } from '@/hooks/useLeaveGroup';
import { ImageService } from '@/app/(dashboard)/dashboard/group/services/image.service';

// Components
import { GroupHeader } from '@/components/dashboard/group/GroupHeader';
import { ChatTab } from '@/components/dashboard/group/ChatTab';
import { ExpensesTab } from '@/components/dashboard/group/ExpensesTab';
import { SettleTab } from '@/components/dashboard/group/SettleTab';
import { GroupDialogs } from '@/components/dashboard/group/GroupDialogs';
import { LeaveGroupDialog } from '@/components/dashboard/group/LeaveGroupDialog';

// Types
import { TripFormData } from '../types';

const imageService = new ImageService();

const tabConfigs = {
  chat: { icon: MessageCircle, label: 'Chat' },
  expenses: { icon: Receipt, label: 'Expenses' },
  settle: { icon: HandCoins, label: 'Settle Up' },
};

export default function GroupPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const groupId = params?.id as string;

  // State
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<TripFormData>({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    description: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const { trip, loading, updateTrip, deleteTrip, refresh } = useTrip(groupId);
  const {
    messages,
    isSending,
    isLoading,
    isConnected,
    typingUsers,
    sendMessage,
    sendTyping,
    addSystemMessage,
    editMessage,
    deleteMessage,
  } = useMessages(groupId, trip?.name);
  const { addMember, isAdding } = useMembers(groupId, refresh);
  const { leaveGroup, isLeaving } = useLeaveGroup(groupId);

  // Computed values
  const currentUser = trip?.members?.find(m => m.email === session?.user?.email);
  const isAdmin = currentUser?.isAdmin || false;
  const isCreator = trip?.createdBy?.email === session?.user?.email;
  const isOnlyMember = trip?.members?.length === 1;
  const totalSpent = trip?.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;

  // Handlers
  const handleEditGroup = () => {
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
      setShowEditDialog(true);
    }
  };

  const handleEditFormChange = (field: keyof TripFormData, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (file: File) => {
    const validation = imageService.validateImage(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setIsUploading(true);
    try {
      const preview = await imageService.getImagePreview(file);
      setImagePreview(preview);
    } catch {
      toast.error('Failed to load image preview');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageRemove = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

 
const handleSendMessage = (text: string, attachments?: any[]) => {
  if (attachments && attachments.length > 0) {
    const attachmentText = attachments.map((att: any) => `📎 ${att.name}`).join(' ');
    const fullText = text ? `${text}\n${attachmentText}` : attachmentText;
    sendMessage(fullText, session?.user?.name || 'You', attachments);
  } else {
    sendMessage(text, session?.user?.name || 'You');
  }
};

  const handleTyping = (isTyping: boolean) => {
    sendTyping(isTyping, session?.user?.name || 'You');
  };

  const handleSaveGroup = async () => {
    if (!trip) return;
    setIsSaving(true);

    try {
      let imageUrl = trip.image;
      if (fileInputRef.current?.files?.[0]) {
        const file = fileInputRef.current.files[0];
        const uploaded = await imageService.uploadImage(file);
        if (uploaded) {
          imageUrl = uploaded;
        }
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

      setShowEditDialog(false);
    } catch {
      // Error handled in hook
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
      addSystemMessage(`${newMemberName} joined the group! 🎉`);
    }
  };

  const handleDeleteGroup = async () => {
    const success = await deleteTrip();
    if (success) {
      setShowDeleteDialog(false);
    }
  };

  const handleLeaveGroup = async () => {
    const success = await leaveGroup();
    if (success) {
      setShowLeaveDialog(false);
    }
  };

  const handleExpenseAdded = async () => {
  // Refresh trip data
  await refresh();
  toast.success('Expense added successfully! 💰', {
    description: 'Check the chat for details.',
    duration: 3000,
  });
};

const handleExpenseDeleted = async () => {
  await refresh();
  toast.success('Expenses updated');
};

  // Loading state
  if (loading || isLoading) {
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
            <Users className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Group not found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            The group you're looking for doesn't exist or you don't have access.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 flex-shrink-0">
        <GroupHeader
          trip={trip}
          isAdmin={isAdmin}
          isCreator={isCreator}
          isOnlyMember={isOnlyMember}
          onEdit={handleEditGroup}
          onAddMember={() => setShowAddMemberDialog(true)}
          onDelete={() => setShowDeleteDialog(true)}
          onLeave={() => setShowLeaveDialog(true)}
        />
      </div>

      {/* Tabs Section */}
      <div className="flex-1 min-h-0 flex flex-col">
        <Tabs defaultValue="chat" className="h-full flex flex-col">
          {/* Modern Tab Navigation */}
          <div className="flex-shrink-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/70 dark:border-gray-700/70">
            <div className="max-w-6xl mx-auto px-4">
              <TabsList className="h-14 w-full bg-transparent p-0 gap-1">
                {Object.entries(tabConfigs).map(([value, config]) => {
                  const Icon = config.icon;
                  const isActive = value === 'chat';
                  return (
                    <TabsTrigger
                      key={value}
                      value={value}
                      className={`
                        relative h-14 px-6 flex-1 sm:flex-none gap-2.5
                        data-[state=active]:bg-transparent
                        data-[state=active]:shadow-none
                        data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400
                        text-gray-500 dark:text-gray-400
                        hover:text-gray-700 dark:hover:text-gray-200
                        transition-all duration-200
                        rounded-none
                        font-medium text-sm
                        border-b-2 border-transparent
                        data-[state=active]:border-blue-500
                        hover:border-gray-300 dark:hover:border-gray-600
                        group
                      `}
                    >
                      <Icon className={`
                        h-4 w-4 transition-transform duration-200
                        group-hover:scale-110
                        data-[state=active]:text-blue-500
                      `} />
                      <span className="hidden sm:inline">{config.label}</span>
                      {/* Active indicator dot for mobile */}
                      <span className="sm:hidden absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500 opacity-0 data-[state=active]:opacity-100 transition-opacity" />
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-h-0 relative">
            <TabsContent 
              value="chat" 
              className="absolute inset-0 m-0 data-[state=active]:flex-1 h-full overflow-hidden"
            >
              <ChatTab
                messages={messages}
                isSending={isSending}
                isLoading={isLoading}
                isConnected={isConnected}
                typingUsers={typingUsers}
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                onEditMessage={editMessage}
                onDeleteMessage={deleteMessage}
              />
            </TabsContent>

            <TabsContent 
              value="expenses" 
              className="absolute inset-0 m-0 data-[state=active]:flex-1 h-full overflow-y-auto"
            >
              <ExpensesTab
                trip={trip}
                totalSpent={totalSpent}
                onExpenseAdded={handleExpenseAdded}
                onExpenseDeleted={handleExpenseDeleted}
                currentUser={currentUser}
                isAdmin={isAdmin}
              />
            </TabsContent>

            <TabsContent 
              value="settle" 
              className="absolute inset-0 m-0 data-[state=active]:flex-1 h-full overflow-y-auto"
            >
              <SettleTab
                trip={trip}
                currentUserId={currentUser?.id || ''}
                onSettleUp={(memberId) => {
                  const member = trip.members.find(m => m.id === memberId);
                  toast.info(`Settle up with ${member?.name} - Feature coming soon!`);
                }}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Dialogs */}
      <GroupDialogs
        showEdit={showEditDialog}
        onEditClose={() => setShowEditDialog(false)}
        editForm={editForm}
        onEditFormChange={handleEditFormChange}
        onEditSubmit={handleSaveGroup}
        isSaving={isSaving}
        imagePreview={imagePreview}
        onImageUpload={handleImageUpload}
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

      {/* Leave Group Dialog */}
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
    </div>
  );
}