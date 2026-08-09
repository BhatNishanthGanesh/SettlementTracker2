import { api } from "@/lib/api";
import {
  Trip,
  CreateTripPayload,
} from "@/types/trip.types";

import {Expense,AddMemberPayload,CreateExpensePayload} from "@/types/expense.types"

export const tripService = {
  getUserTrips() {
    return api.get("/trips");
  },

  getTrip(id: string) {
    return api.get(`/trips/${id}`);
  },

  createTrip(data: CreateTripPayload) {
    return api.post("/trips", data);
  },

  updateTrip(id: string, data: Partial<Trip>) {
    return api.put(`/trips/${id}`, data);
  },

  deleteTrip(id: string) {
    return api.delete(`/trips/${id}`);
  },


  leaveTrip(tripId: string) {
    return api.post(`/trips/${tripId}/leave`);
  },

  getExpenses(tripId: string) {
    return api.get(`/trips/${tripId}/expenses`);
  },


  getInviteInfo(inviteCode: string) {
    return api.get(`/join/${inviteCode}`);
  },

  joinTrip(inviteCode: string) {
    return api.post(`/join/${inviteCode}`);
  },

  async getLastReadTimestamps(
    tripIds: string[]
  ): Promise<Record<string, Date>> {
    if (!tripIds.length) return {};

    const result: Record<string, Date> = {};

    await Promise.all(
      tripIds.map(async (tripId) => {
        try {
          const response = await api.get(
            `/trips/${tripId}/unread-count`
          );

          if (response.data.lastReadAt) {
            result[tripId] = new Date(
              response.data.lastReadAt
            );
          }
        } catch (error) {
          console.error(
            `Failed to get lastRead for ${tripId}:`,
            error
          );
        }
      })
    );

    return result;
  },

  async updateLastRead(tripId: string): Promise<void> {
    await api.post(
      `/trips/${tripId}/unread-count`
    );
  },

  async getLastReadForTrip(
    tripId: string
  ): Promise<Date | null> {
    const response = await api.get(
      `/trips/${tripId}/unread-count`
    );

    return response.data.lastReadAt
      ? new Date(response.data.lastReadAt)
      : null;
  },

  async getUnreadCount(
    tripId: string
  ): Promise<number> {
    const response = await api.get(
      `/trips/${tripId}/unread-count`
    );

    return response.data.count ?? 0;
  },

  async markAllAsRead(
    tripId: string
  ): Promise<void> {
    await this.updateLastRead(tripId);
  },
};