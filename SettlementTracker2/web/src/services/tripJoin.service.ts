// services/tripJoin.service.ts

import { api } from "@/lib/api";

export const tripJoinService = {
  joinTrip(inviteCode: string) {
    return api.post(
      `/trips/join/${inviteCode}`
    );
  },
};