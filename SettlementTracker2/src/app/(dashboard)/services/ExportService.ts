// services/ExportService.ts
import { TripData } from '../types';

export class ExportService {
  exportToCSV(trips: TripData[]): void {
    const headers = ['Name', 'Expense', 'Category', 'Spent', 'Received', 'Status', 'Date', 'Companions'];
    const rows = trips.map(item => [
      item.name,
      item.expense,
      item.category || '',
      item.spent,
      item.recieved,
      item.status,
      new Date(item.createdAt).toLocaleDateString(),
      item.companions.join(', ')
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trips_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}