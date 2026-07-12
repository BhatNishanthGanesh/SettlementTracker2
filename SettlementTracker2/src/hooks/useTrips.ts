// hooks/useTrips.ts
import { useState, useEffect, useCallback } from 'react';
import { TripService } from '@/app/(dashboard)/dashboard/group/services/trip.service';
import { Trip } from '@/app/(dashboard)/dashboard/group/types';
import { toast } from 'sonner';

const tripService = new TripService();

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tripService.getUserTrips();
      setTrips(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load trips';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const refetch = useCallback(() => {
    fetchTrips();
  }, [fetchTrips]);

  return {
    trips,
    loading,
    error,
    refetch,
  };
}