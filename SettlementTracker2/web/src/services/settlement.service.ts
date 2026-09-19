import { api } from "@/lib/api";
import { Settlement } from "@/types/trip.types";

interface SettlementResponse {
  success: boolean;
  data: Settlement[] | Settlement;
  duplicate?: boolean;
  error?: string;
}

export const settlementService = {
  async list(tripId: string): Promise<Settlement[]> {
    const response = await api.get<SettlementResponse>(
      `/trips/${tripId}/settlements`
    );

    return Array.isArray(response.data.data)
      ? response.data.data
      : [];
  },

  async request(tripId: string, payerMemberId: string): Promise<Settlement> {
    const response = await api.post<SettlementResponse>(
      `/trips/${tripId}/settlements`,
      {
        action: "request",
        payerMemberId,
      }
    );

    return response.data.data as Settlement;
  },

  async pay(
    tripId: string,
    recipientMemberId: string,
    referenceId: string,
    settlementId?: string
  ): Promise<Settlement> {
    const response = await api.post<SettlementResponse>(
      `/trips/${tripId}/settlements`,
      {
        action: "pay",
        recipientMemberId,
        referenceId,
        settlementId,
      }
    );

    return response.data.data as Settlement;
  },
};
