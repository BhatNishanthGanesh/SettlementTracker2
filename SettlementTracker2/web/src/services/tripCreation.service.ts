import { api } from "@/lib/api";
import { CreateTripPayload, SendInvitationsPayload } from "@/types/trip.types";


export const tripCreationService = {
  createTrip(data: CreateTripPayload) {
    return api.post("/trips", data);
  },

  sendInvitations(data: SendInvitationsPayload) {
    return api.post("/trips/invite", data);
  },
};