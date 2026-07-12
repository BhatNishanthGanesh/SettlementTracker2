// components/dashboard/group/LeaveGroupDialog.tsx
'use client';
import { LogOut, Trash2, AlertCircle, Loader2 } from 'lucide-react';
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
    isCreator: boolean;
    isOnlyMember: boolean;
    remainingMembers: number;
    onConfirm: () => void;
    isLeaving: boolean;
}

export function LeaveGroupDialog({
    open,
    onOpenChange,
    tripName,
    isCreator,
    isOnlyMember,
    remainingMembers,
    onConfirm,
    isLeaving,
}: LeaveGroupDialogProps) {
    let title = 'Leave Group?';
    let description = `Are you sure you want to leave "${tripName}"?`;
    let variant: 'default' | 'destructive' = 'default';
    let buttonText = 'Leave Group';
    let icon = <LogOut className="h-4 w-4 mr-2" />;

    if (isCreator && isOnlyMember) {
        title = 'Delete Group?';
        description = `You are the only member. Leaving will permanently delete "${tripName}" and all its data. This action cannot be undone.`;
        variant = 'destructive';
        buttonText = 'Delete Group';
        icon = <Trash2 className="h-4 w-4 mr-2" />;
    } else if (isCreator) {
        title = 'Transfer Ownership?';
        description = `You are the creator. Leaving will transfer ownership to another member. ${remainingMembers} members will remain in the group.`;
        variant = 'default';
        buttonText = 'Leave & Transfer';
        icon = <LogOut className="h-4 w-4 mr-2" />;
    } else if (isCreator && remainingMembers === 0) {
        title = 'Delete Group?';
        description = `You are the only member. Leaving will permanently delete "${tripName}" and all its data.`;
        variant = 'destructive';
        buttonText = 'Delete Group';
        icon = <Trash2 className="h-4 w-4 mr-2" />;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md dark:bg-gray-900 bg-white">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-full",
                            variant === 'destructive' 
                                ? "bg-red-100 dark:bg-red-900/30" 
                                : "bg-yellow-100 dark:bg-yellow-900/30"
                        )}>
                            {variant === 'destructive' ? (
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

                {isCreator && remainingMembers > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-300">
                        <p className="font-medium">What happens next:</p>
                        <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                            <li>Ownership will be transferred to another admin or member</li>
                            <li>You will lose access to all group data</li>
                            <li>Other members can continue using the group</li>
                        </ul>
                    </div>
                )}

                {isCreator && isOnlyMember && (
                    <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
                        <p className="font-medium">This will permanently delete:</p>
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
                                {icon}
                                {buttonText}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}