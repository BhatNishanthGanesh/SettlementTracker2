  import { api } from "@/lib/api";
  import {
    AddMemberPayload,
  } from "@/types/expense.types";

  export const memberService = {
    addMember(
      tripId: string,
      data: AddMemberPayload
    ) {
      return api.post(
        `/trips/${tripId}/members`,
        data
      );
    },

    removeMember(
      tripId: string,
      memberId: string
    ) {
      return api.delete(
        `/trips/${tripId}/members/${memberId}`
      );
    },

    updateMemberRole(
      tripId: string,
      memberId: string,
      data: { isAdmin: boolean;}
    ) {
      return api.put(
        `/trips/${tripId}/members/${memberId}`,
        data
      );
    },
  };