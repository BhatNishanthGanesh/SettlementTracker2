// services/trip.service.ts
import { Trip, Member, Expense, Message } from '../types';
import { API_ENDPOINTS,getFullUrl } from '../constants';

export class TripService {
  async getUserTrips(): Promise<Trip[]> {
    try {
       const url = getFullUrl(API_ENDPOINTS.TRIPS);
      console.log('📡 Fetching trips from:', url);
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
        throw new Error('Failed to fetch trips');
      }
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching trips:', error);
      return [];
    }
  }

  async getTrip(id: string): Promise<Trip> {
    const response = await fetch(`${API_ENDPOINTS.TRIPS}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch trip');
    const data = await response.json();
    return data.data;
  }

  async createTrip(data: {
    name: string;
    destination?: string;
    startDate: string;
    endDate?: string;
    budget: number;
    description?: string;
    members?: Array<{ name: string; email?: string; isCreator?: boolean }>;
    image?: string;
  }): Promise<Trip> {
    const response = await fetch(API_ENDPOINTS.TRIPS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create trip');
    }
    const result = await response.json();
    return result.data;
  }

  async updateTrip(id: string, data: Partial<Trip>): Promise<Trip> {
    const response = await fetch(`${API_ENDPOINTS.TRIPS}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update trip');
    }
    const result = await response.json();
    return result.data;
  }

  async deleteTrip(id: string): Promise<void> {
    const response = await fetch(`${API_ENDPOINTS.TRIPS}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete trip');
    }
  }

  // ✅ Add this method
  async createExpense(tripId: string, data: {
    title: string;
    amount: number;
    category?: string;
    paidBy: string;
    description?: string;
    splitBetween?: string[];
  }): Promise<Expense> {
    const response = await fetch(`${API_ENDPOINTS.TRIPS}/${tripId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: data.title,
        amount: data.amount,
        category: data.category,
        paidBy: data.paidBy,
        description: data.description,
        splitBetween: data.splitBetween,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create expense');
    }
    const result = await response.json();
    return result.data;
  }

  // ✅ Add this method to get expenses
  async getExpenses(tripId: string): Promise<Expense[]> {
    const response = await fetch(`${API_ENDPOINTS.TRIPS}/${tripId}/expenses`);
    if (!response.ok) {
      throw new Error('Failed to fetch expenses');
    }
    const data = await response.json();
    return data.data || [];
  }

  // ✅ Add this method to delete an expense
  async deleteExpense(tripId: string, expenseId: string): Promise<void> {
    const response = await fetch(`${API_ENDPOINTS.TRIPS}/${tripId}/expenses?expenseId=${expenseId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete expense');
    }
  }

  async addMember(tripId: string, name: string, email?: string): Promise<Trip> {
    const response = await fetch(`${API_ENDPOINTS.TRIPS}/${tripId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add member');
    }
    const data = await response.json();
    return data.data;
  }

  async removeMember(tripId: string, memberId: string): Promise<Trip> {
    const response = await fetch(`${API_ENDPOINTS.TRIPS}/${tripId}/members/${memberId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove member');
    }
    const data = await response.json();
    return data.data;
  }

  async getInviteInfo(inviteCode: string): Promise<{ trip: Trip; membersCount: number }> {
    const response = await fetch(`${API_ENDPOINTS.TRIPS}/invite/${inviteCode}`);
    if (!response.ok) {
      throw new Error('Invalid invite code');
    }
    const data = await response.json();
    return data.data;
  }

  async joinTrip(inviteCode: string, name: string): Promise<Trip> {
    const response = await fetch(`${API_ENDPOINTS.TRIPS}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteCode, name }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to join trip');
    }
    const data = await response.json();
    return data.data;
  }

  async leaveTrip(tripId: string): Promise<void> {
    const response = await fetch(`${API_ENDPOINTS.TRIPS}/${tripId}/leave`, {
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to leave trip');
    }
  }
}