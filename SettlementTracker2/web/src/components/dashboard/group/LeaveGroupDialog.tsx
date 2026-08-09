'use client';

import {
  LogOut,
  Trash2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LeaveGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripName: string;
  isOnlyMember: boolean;
  remainingMembers: number;
  onConfirm: () => void;
  isLeaving: boolean;
}

export function LeaveGroupDialog({
  open,
  onOpenChange,
  tripName,
  isOnlyMember,
  remainingMembers,
  onConfirm,
  isLeaving,
}: LeaveGroupDialogProps) {
  const title = isOnlyMember
    ? 'Delete Group?'
    : 'Leave Group?';

  const description = isOnlyMember
    ? `You are the only member. Leaving will permanently delete "${tripName}" and all its data. This action cannot be undone.`
    : `Are you sure you want to leave "${tripName}"? ${remainingMembers} members will remain in the group.`;

  const variant = isOnlyMember
    ? 'destructive'
    : 'default';

  const buttonText = isOnlyMember
    ? 'Delete Group'
    : 'Leave Group';

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-md dark:bg-gray-900 bg-white">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'p-2 rounded-full',
                isOnlyMember
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : 'bg-yellow-100 dark:bg-yellow-900/30'
              )}
            >
              {isOnlyMember ? (
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              ) : (
                <LogOut className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              )}
            </div>

            <DialogTitle>{title}</DialogTitle>
          </div>

          <DialogDescription className="mt-3">
            {description}
          </DialogDescription>
        </DialogHeader>

        {isOnlyMember && (
          <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
            <p className="font-medium">
              This will permanently delete:
            </p>

            <ul className="list-disc list-inside mt-1 text-xs space-y-1">
              <li>All messages and conversations</li>
              <li>All expenses and financial data</li>
              <li>All member associations</li>
              <li>The group itself</li>
            </ul>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLeaving}
          >
            Cancel
          </Button>

          <Button
            variant={variant}
            onClick={onConfirm}
            disabled={isLeaving}
            className="min-w-[100px]"
          >
            {isLeaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {isOnlyMember ? (
                  <Trash2 className="h-4 w-4 mr-2" />
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                {buttonText}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}