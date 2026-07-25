// components/dashboard/group/settings/RemoveMemberDialog.tsx
'use client';
import React from 'react';
import { UserMinus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Member } from '@/app/(dashboard)/dashboard/group/types';

interface RemoveMemberDialogProps {
  member: Member | null;
  isRemoving: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function RemoveMemberDialog({ member, isRemoving, onClose, onConfirm }: RemoveMemberDialogProps) {
  return (
    <Dialog open={!!member} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
              <UserMinus className="h-6 w-6 text-red-500" />
            </div>
            <DialogTitle className="text-lg">Remove Member</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Are you sure you want to remove {member?.name} from the group? They will lose access to all group data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isRemoving} className="flex-1">
            {isRemoving ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Removing...</>
            ) : (
              <><UserMinus className="h-4 w-4 mr-2" /> Remove Member</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}   