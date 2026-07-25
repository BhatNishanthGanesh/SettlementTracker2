// services/message.service.ts
import { Message } from '../types';
import { API_ENDPOINTS, getFullUrl } from '../constants';

export class MessageService {
  // ✅ Updated to accept attachments and metadata
  async sendMessage(
    tripId: string, 
    text: string, 
    attachments?: any[], 
    metadata?: any
  ): Promise<Message> {
    try {
      const url = getFullUrl(`${API_ENDPOINTS.TRIPS}/${tripId}/messages`);
      
      // ✅ Prepare the payload
      const payload: any = { 
        text: text || '📎 Image',
        type: attachments && attachments.length > 0 ? 'image' : 'text',
      };

      // ✅ Add attachments if present
      if (attachments && attachments.length > 0) {
        payload.attachments = attachments;
      }

      // ✅ Add metadata if present
      if (metadata) {
        payload.metadata = metadata;
      }

      console.log('📤 Sending message payload:', payload);

      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async getMessages(tripId: string): Promise<Message[]> {
    try {
      const url = getFullUrl(`${API_ENDPOINTS.TRIPS}/${tripId}/messages`);
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      
      // ✅ Ensure messages have attachments properly mapped
      const messages = data.data || [];
      return messages.map((msg: any) => ({
        ...msg,
        // ✅ Extract attachments from metadata if not present directly
        attachments: msg.attachments || msg.metadata?.attachments || undefined,
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  // Edit a message
  async editMessage(tripId: string, messageId: string, text: string): Promise<Message> {
    const url = getFullUrl(`${API_ENDPOINTS.TRIPS}/${tripId}/messages/${messageId}`);
    const response = await fetch(url, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to edit message');
    }
    
    const data = await response.json();
    return data.data;
  }

  // Delete a message
  async deleteMessage(tripId: string, messageId: string): Promise<void> {
    const url = getFullUrl(`${API_ENDPOINTS.TRIPS}/${tripId}/messages/${messageId}`);
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete message');
    }
  }

  // Check if a message is editable (within 5 minutes)
  isMessageEditable(timestamp: string): boolean {
    const messageTime = new Date(timestamp).getTime();
    const now = Date.now();
    const diffInMinutes = (now - messageTime) / (1000 * 60);
    return diffInMinutes <= 5;
  }

  // Check if a message is deletable (within 5 minutes)
  isMessageDeletable(timestamp: string): boolean {
    return this.isMessageEditable(timestamp);
  }
}