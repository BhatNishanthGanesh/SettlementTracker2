import { api } from "@/lib/api";
import {
  SendMessagePayload,
  EditMessagePayload,
} from "@/types/trip.types";

export const messageService = {
  sendMessage(
    tripId: string,
    data: SendMessagePayload
  ) {
    return api.post(
      `/trips/${tripId}/messages`,
      {
        ...data,
        text: data.text || "Image",
        type:
          data.attachments?.length
            ? "image"
            : "text",
      }
    );
  },

  getMessages(tripId: string) {
    return api.get(
      `/trips/${tripId}/messages`
    );
  },

  editMessage(
    tripId: string,
    messageId: string,
    data: EditMessagePayload
  ) {
    return api.put(
      `/trips/${tripId}/messages/${messageId}`,
      data
    );
  },

  deleteMessage(
    tripId: string,
    messageId: string
  ) {
    return api.delete(
      `/trips/${tripId}/messages/${messageId}`
    );
  },

  isMessageEditable(
    timestamp: string
  ) {
    const diff =
      (Date.now() -
        new Date(timestamp).getTime()) /
      (1000 * 60);

    return diff <= 5;
  },

  isMessageDeletable(
    timestamp: string
  ) {
    return messageService.isMessageEditable(
      timestamp
    );
  },
};