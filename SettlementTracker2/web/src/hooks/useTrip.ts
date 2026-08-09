// hooks/useTrip.ts
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { tripService } from "@/services/trip.service";
import { useGroups } from "@/context/GroupContext";
import { Trip, TripState } from "@/types/trip.types";

export function useTrip(tripId: string) {
  const [state, setState] = useState<TripState>({
    trip: null,
    loading: true,
    error: null as string | null,
  });
  const [isLeaving, setIsLeaving] = useState(false);

  const { fetchGroups } = useGroups();

  const fetchTrip = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
      }));

      const response = await tripService.getTrip(tripId);

      setState({
        trip: response.data.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        trip: null,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load trip",
      });

      toast.error("Failed to load trip");
    }
  }, [tripId]);

  useEffect(() => {
    if (tripId) fetchTrip();
  }, [tripId, fetchTrip]);

  const updateTrip = async (data: Partial<Trip>) => {
    if (!state.trip) return;

    try {
      const response = await tripService.updateTrip(
        state.trip.id,
        data
      );

      setState(prev => ({
        ...prev,
        trip: response.data.data,
      }));

      await fetchGroups();
      toast.success("Trip updated successfully");

      return response.data.data;
    } catch {
      toast.error("Failed to update trip");
      throw new Error("Failed to update trip");
    }
  };

  const deleteTrip = async () => {
    if (!state.trip) return false;

    try {
      await tripService.deleteTrip(state.trip.id);
      await fetchGroups();

      toast.success("Trip deleted successfully");
      return true;
    } catch {
      toast.error("Failed to delete trip");
      return false;
    }
  };

  const leaveTrip = async () => {
    if (!state.trip) return false;
    
    setIsLeaving(true);
    try {
      await tripService.leaveTrip(tripId);
      await fetchGroups();

      toast.success("You left the group");
      return true;
    } catch {
      toast.error("Failed to leave group");
      return false;
    } finally {
      setIsLeaving(false);
    }
  };

  return {
    trip: state.trip,
    loading: state.loading,
    error: state.error,
    updateTrip,
    deleteTrip,
    leaveTrip,
    isLeaving,
    refresh: fetchTrip,
  };
}