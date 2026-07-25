// services/member.service.ts
import { Member, Trip } from '../types';
import { API_ENDPOINTS } from '../constants';

export class MemberService {
  async addMember(tripId: string, name: string, email?: string): Promise<Trip> {
    const response = await fetch(`${API_ENDPOINTS.TRIPS}/${tripId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    if (!response.ok) throw new Error('Failed to add member');
    const data = await response.json();
    return data.data;
  }

  async removeMember(tripId: string, memberId: string): Promise<Trip> {
    const response = await fetch(`${API_ENDPOINTS.TRIPS}/${tripId}/members/${memberId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to remove member');
    const data = await response.json();
    return data.data;
  }

  async updateMemberRole(tripId: string, memberId: string, isAdmin: boolean): Promise<Trip> {
    const response = await fetch(`${API_ENDPOINTS.TRIPS}/${tripId}/members/${memberId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAdmin }),
    });
    if (!response.ok) throw new Error('Failed to update member role');
    const data = await response.json();
    return data.data;
  }
}