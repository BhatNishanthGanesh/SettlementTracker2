// app/(dashboard)/services/ChartService.ts
import { TripData } from '@/app/(dashboard)/types';

export class ChartService {
  generateSpendingChart(data: TripData[]) {
    const sortedData = [...data].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    return {
      labels: sortedData.map(item => item.name.length > 15 ? item.name.slice(0, 15) + '...' : item.name),
      datasets: [
        {
          label: 'Spent',
          data: sortedData.map(item => item.spent),
          backgroundColor: 'rgba(99, 102, 241, 0.6)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 2,
        },
        {
          label: 'Received',
          data: sortedData.map(item => item.recieved),
          backgroundColor: 'rgba(52, 211, 153, 0.6)',
          borderColor: 'rgba(52, 211, 153, 1)',
          borderWidth: 2,
        },
      ],
    };
  }

  generateGroupChart(data: TripData[]) {
    const categories: Record<string, number> = {};
    data.forEach(item => {
      const category = item.category || 'Other';
      categories[category] = (categories[category] || 0) + item.spent;
    });

    const colors = [
      'rgba(99, 102, 241, 0.8)',
      'rgba(52, 211, 153, 0.8)',
      'rgba(251, 191, 36, 0.8)',
      'rgba(244, 63, 94, 0.8)',
      'rgba(56, 189, 248, 0.8)',
      'rgba(168, 85, 247, 0.8)',
      'rgba(236, 72, 153, 0.8)',
      'rgba(251, 146, 60, 0.8)',
    ];

    return {
      labels: Object.keys(categories),
      datasets: [
        {
          data: Object.values(categories),
          backgroundColor: colors.slice(0, Object.keys(categories).length),
          borderColor: 'rgba(255, 255, 255, 1)',
          borderWidth: 2,
        },
      ],
    };
  }
}