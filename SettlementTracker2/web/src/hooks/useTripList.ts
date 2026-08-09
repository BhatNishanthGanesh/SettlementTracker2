import { useState, useEffect } from "react";
import { toast } from "sonner";

import { tripService } from "@/services/trip.service";
import { Trip } from "@/types/trip.types";

export function useTripList() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);

      const response =
        await tripService.getUserTrips();

      setTrips(response.data.data ?? []);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load trips";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return {
    trips,
    loading,
    error,
    refresh: fetchTrips,
  };
}