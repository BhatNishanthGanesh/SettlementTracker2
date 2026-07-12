// hooks/useMembers.ts
import { useState, useCallback } from 'react';
import { MemberService } from '@/app/(dashboard)/dashboard/group/services/member.service';
import { toast } from 'sonner';

const memberService = new MemberService();

export function useMembers(tripId: string, onRefresh?: () => void) {
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const addMember = useCallback(async (name: string, email?: string) => {
    if (!name.trim()) {
      toast.error('Member name is required');
      return;
    }

    setIsAdding(true);
    try {
      await memberService.addMember(tripId, name.trim(), email?.trim());
      toast.success(`${name} added to group`);
      onRefresh?.();
      return true;
    } catch (error) {
      toast.error('Failed to add member');
      return false;
    } finally {
      setIsAdding(false);
    }
  }, [tripId, onRefresh]);

  const removeMember = useCallback(async (memberId: string, memberName: string) => {
    setIsRemoving(true);
    try {
      await memberService.removeMember(tripId, memberId);
      toast.success(`${memberName} removed from group`);
      onRefresh?.();
      return true;
    } catch (error) {
      toast.error('Failed to remove member');
      return false;
    } finally {
      setIsRemoving(false);
    }
  }, [tripId, onRefresh]);

  return {
    addMember,
    removeMember,
    isAdding,
    isRemoving,
  };
}