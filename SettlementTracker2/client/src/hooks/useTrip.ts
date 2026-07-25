// hooks/useTrip.ts
import { useState, useEffect, useCallback } from 'react';
import { TripService } from '@/app/(dashboard)/dashboard/group/services/trip.service';
import { Trip, TripState } from '@/app/(dashboard)/dashboard/group/types';
import { toast } from 'sonner';
import { useGroups } from '@/app/(dashboard)/dashboard/group/context/GroupContext';

const tripService = new TripService();

export function useTrip(tripId: string) {
  const [state, setState] = useState<TripState>({
    trip: null,
    loading: true,
    error: null,
  });
  const { fetchGroups } = useGroups();

  const fetchTrip = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const trip = await tripService.getTrip(tripId);
      setState({ trip, loading: false, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load trip';
      setState({ trip: null, loading: false, error: message });
      toast.error('Failed to load trip data');
    }
  }, [tripId]);

  useEffect(() => {
    if (tripId) {
      fetchTrip();
    }
  }, [tripId, fetchTrip]);

  const updateTrip = useCallback(async (data: Partial<Trip>) => {
    if (!state.trip) return;
    try {
      const updated = await tripService.updateTrip(state.trip.id, data);
      setState(prev => ({ ...prev, trip: updated }));
      
      // Refresh the sidebar groups after updating
      await fetchGroups();
      
      toast.success('Trip updated successfully!');
      return updated;
    } catch (error) {
      toast.error('Failed to update trip');
      throw error;
    }
  }, [state.trip, fetchGroups]);

  const deleteTrip = useCallback(async () => {
    if (!state.trip) return false;
    try {
      await tripService.deleteTrip(state.trip.id);
      
      // Refresh the sidebar groups after deleting
      await fetchGroups();
      
      toast.success('Trip deleted successfully');
      return true;
    } catch (error) {
      toast.error('Failed to delete trip');
      return false;
    }
  }, [state.trip, fetchGroups]);

  const refresh = useCallback(async () => {
    await fetchTrip();
  }, [fetchTrip]);

  return {
    trip: state.trip,
    loading: state.loading,
    error: state.error,
    updateTrip,
    deleteTrip,
    refresh,
  };
}