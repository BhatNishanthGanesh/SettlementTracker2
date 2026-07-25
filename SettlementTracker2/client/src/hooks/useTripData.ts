// hooks/useTripData.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { TripData, DashboardStats, ChartData, GroupChartData } from '@/app/(dashboard)/types';
import { TripService as ApiTripService } from '@/app/(dashboard)/dashboard/group/services/trip.service';
import { ChartService } from '@/app/(dashboard)/services/ChartService';
import { TripService } from '@/app/(dashboard)/services/TripService';

const apiService = new ApiTripService();

export function useTripData() {
  const [data, setData] = useState<TripData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tripService] = useState(() => new TripService([]));
  const [chartService] = useState(() => new ChartService());

  const transformTrip = useCallback((trip: any): TripData => {
    const totalSpent = trip.expenses?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0;
    
    // Calculate received based on split between
    let totalReceived = 0;
    if (trip.expenses) {
      totalReceived = trip.expenses.reduce((sum: number, e: any) => {
        let splitCount = 1;
        if (e.metadata) {
          try {
            const metadata = typeof e.metadata === 'string' ? JSON.parse(e.metadata) : e.metadata;
            if (metadata.splitBetween) {
              splitCount = metadata.splitBetween.length;
            }
          } catch (err) {
            // If metadata is not JSON, use default
          }
        }
        return sum + (e.amount / splitCount);
      }, 0);
    }

    const balance = totalSpent - totalReceived;
    let status: 'settled' | 'pending' | 'overdue' = 'settled';
    if (balance > 0) status = 'pending';
    else if (balance < 0) status = 'overdue';

    return {
      id: trip.id,
      name: trip.name,
      expense: trip.description || 'Trip expenses',
      spent: totalSpent,
      recieved: totalReceived,
      status,
      category: trip.destination || 'General',
      companions: trip.members?.map((m: any) => m.name) || [],
      createdAt: trip.createdAt,
      image: trip.image,
      budget: trip.budget,
      destination: trip.destination,
    };
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const trips = await apiService.getUserTrips();
      const transformedData = trips.map(transformTrip);
      
      // Use the setData method instead of direct assignment
      tripService.setData(transformedData);
      setData(transformedData);
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load trips';
      setError(message);
      console.error('Error fetching trips:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [tripService, transformTrip]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addTrip = useCallback((trip: TripData) => {
    tripService.add(trip);
    setData(tripService.getAll());
  }, [tripService]);

  const updateTrip = useCallback((id: string, updatedTrip: Partial<TripData>) => {
    tripService.update(id, updatedTrip);
    setData(tripService.getAll());
  }, [tripService]);

  const deleteTrip = useCallback((id: string) => {
    tripService.delete(id);
    setData(tripService.getAll());
  }, [tripService]);

  const deleteTrips = useCallback((ids: string[]) => {
    tripService.deleteMultiple(ids);
    setData(tripService.getAll());
  }, [tripService]);

  const filterTrips = useCallback((options: { search?: string; status?: string }) => {
    return tripService.filter(options);
  }, [tripService]);

  const stats: DashboardStats = useMemo(() => tripService.getStats(), [data, tripService]);
  const chartData: ChartData = useMemo(() => chartService.generateSpendingChart(data), [data, chartService]);
  const groupData: GroupChartData = useMemo(() => chartService.generateGroupChart(data), [data, chartService]);

  return {
    data,
    loading,
    error,
    addTrip,
    updateTrip,
    deleteTrip,
    deleteTrips,
    filterTrips,
    getStats: useCallback(() => stats, [stats]),
    getChartData: useCallback(() => chartData, [chartData]),
    getGroupData: useCallback(() => groupData, [groupData]),
    refresh: fetchData
  };
}