import { useCallback, useEffect, useState } from "react";
import {
  Trip,
  TripData,
  DashboardStats,
  ChartData,
  GroupChartData,
} from "@/types/trip.types";
import { tripService } from "@/services/trip.service";
import {
  generateSpendingChart,
  generateGroupChart,
} from "@/helpers/chart";
import { calculateMultipleTripsStats } from "@/utils/tripStats";
import { useSession } from "next-auth/react";

export function useDashboardData() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data:session } = useSession()
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await tripService.getUserTrips();
      setTrips(response.data.data ?? []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load trips"
      );
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const refreshOnSettlement = () => fetchData();
    const refreshOnFocus = () => fetchData();

    window.addEventListener("settlement-updated", refreshOnSettlement);
    window.addEventListener("focus", refreshOnFocus);

    return () => {
      window.removeEventListener("settlement-updated", refreshOnSettlement);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, [fetchData]);

  const multipleStats = calculateMultipleTripsStats(trips,session?.user?.id);

  const stats: DashboardStats = multipleStats.dashboardStats;
const data: TripData[] = trips.map((trip, index) => {
  const tripStats = multipleStats.stats[index];

  return {
    id: trip.id,
    name: trip.name,
    expense: trip.description ?? "Trip expenses",

    // What I personally paid
    spent: tripStats.totalSpent,

    // What others owe me
    owedToMe: tripStats.owedToMe,

    balance: tripStats.currentUserBalance,
    status:
      tripStats.currentUserBalance === 0
        ? "settled"
        : "pending",

    category: trip.destination ?? "General",

    companions:
      trip.members?.map(
        (member) => member.name
      ) ?? [],

    createdAt: trip.createdAt,
    image: trip.image ?? undefined,
    budget: trip.budget,
    destination: trip.destination ?? undefined,
  };
});

  const filterTrips = (options: {
    search?: string;
    status?: string;
  }) => {
    const search = options.search?.toLowerCase();

    return data.filter(trip => {
      const matchesSearch =
        !search ||
        trip.name.toLowerCase().includes(search) ||
        trip.expense.toLowerCase().includes(search) ||
        trip.companions.some(member =>
          member.toLowerCase().includes(search)
        );

      const matchesStatus =
        !options.status ||
        options.status === "all" ||
        trip.status === options.status;

      return matchesSearch && matchesStatus;
    });
  };

  const chartData: ChartData =
    generateSpendingChart(data);

  const groupData: GroupChartData =
    generateGroupChart(data);

  return {
    data,
    loading,
    error,
    stats,
    chartData,
    groupData,
    filterTrips,
    refresh: fetchData,
  };
}