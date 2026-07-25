// app/(dashboard)/services/TripService.ts
import { DashboardStats, TripData } from '../types';

export class TripService {
  private data: TripData[] = [];

  constructor(initialData: TripData[] = []) {
    this.data = initialData;
  }

  // Add this setter method
  setData(newData: TripData[]): void {
    this.data = newData;
  }

  getAll(): TripData[] {
    return this.data;
  }

  getById(id: string): TripData | undefined {
    return this.data.find(item => item.id === id);
  }

  add(trip: TripData): void {
    this.data.push(trip);
  }

  update(id: string, updatedTrip: Partial<TripData>): void {
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...updatedTrip };
    }
  }

  delete(id: string): void {
    this.data = this.data.filter(item => item.id !== id);
  }

  deleteMultiple(ids: string[]): void {
    this.data = this.data.filter(item => !ids.includes(item.id));
  }

  filter(options: { search?: string; status?: string }): TripData[] {
    let filtered = this.data;
    
    if (options.search) {
      const query = options.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.expense.toLowerCase().includes(query) ||
        item.companions.some(c => c.toLowerCase().includes(query))
      );
    }
    
    if (options.status && options.status !== 'all') {
      filtered = filtered.filter(item => item.status === options.status);
    }
    
    return filtered;
  }

  getStats(): DashboardStats {
    const totalTrips = this.data.length;
    const totalSpent = this.data.reduce((sum, item) => sum + item.spent, 0);
    const totalReceived = this.data.reduce((sum, item) => sum + item.recieved, 0);
    const pendingBalance = this.data.reduce((sum, item) => sum + (item.spent - item.recieved), 0);
    const pendingCount = this.data.filter(item => item.status === 'pending').length;
    const settledCount = this.data.filter(item => item.status === 'settled').length;
    const overdueCount = this.data.filter(item => item.status === 'overdue').length;
    const averageSpent = totalTrips ? totalSpent / totalTrips : 0;

    return {
      totalTrips,
      totalSpent,
      totalReceived,
      pendingBalance,
      pendingCount,
      settledCount,
      overdueCount,
      averageSpent
    };
  }
}