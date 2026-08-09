// hooks/useLeaveGroup.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useGroups } from '@/context/GroupContext';

export function useLeaveGroup(tripId: string) {
    const router = useRouter();
    const { removeGroup } = useGroups();
    const [isLeaving, setIsLeaving] = useState(false);

    const leaveGroup = async () => {
        setIsLeaving(true);
        try {
            const response = await fetch(`/api/trips/${tripId}/leave`, {
                method: 'POST',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to leave group');
            }

            const result = await response.json();

            if (result.deleted) {
                // Remove from context immediately
                removeGroup(tripId);
                toast.success('Group deleted successfully');
            } else if (result.transferred) {
                toast.success(result.message);
            } else {
                toast.success('Left group successfully');
            }

            router.push('/dashboard/group');
            return true;

        } catch (error) {
            console.error('Error leaving group:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to leave group');
            return false;
        } finally {
            setIsLeaving(false);
        }
    };

    return {
        leaveGroup,
        isLeaving,
    };
}