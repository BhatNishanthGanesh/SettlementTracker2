import { useState } from "react";
import { toast } from "sonner";
import { memberService } from "@/services/member.service";

export function useMembers(
  tripId: string,
  onRefresh?: () => Promise<void>
) {
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const addMember = async (
    name: string,
    email?: string
  ) => {
    if (!name.trim()) {
      toast.error("Member name is required");
      return false;
    }

    setIsAdding(true);

    try {
      await memberService.addMember(tripId, {
        name: name.trim(),
        email: email?.trim(),
      });

      await onRefresh?.();

      toast.success(`${name} joined the group! 🎉`);
      return true;
    } catch {
      toast.error("Failed to add member");
      return false;
    } finally {
      setIsAdding(false);
    }
  };

  const removeMember = async (
    memberId: string,
    memberName: string
  ) => {
    setIsRemoving(true);

    try {
      await memberService.removeMember(
        tripId,
        memberId
      );

      await onRefresh?.();

      toast.success(
        `${memberName} removed from group`
      );

      return true;
    } catch {
      toast.error("Failed to remove member");
      return false;
    } finally {
      setIsRemoving(false);
    }
  };

  return {
    addMember,
    removeMember,
    isAdding,
    isRemoving,
  };
}