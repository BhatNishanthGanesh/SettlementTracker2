import { DashboardStats } from "@/types/trip.types";
import { StatCard } from "@/components/dashboard/ui/StatCard";
import {
  DollarSign,
  Users,
  AlertCircle,
  UserX,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

export const StatsSection = ({
  stats,
}: {
  stats: DashboardStats;
}) => {
  return (
    <div className="grid grid-cols-1 mb-4 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={DollarSign}
        label="Total Spent"
        value={formatCurrency(stats.totalSpent)}
        subtitle={`Avg. ${formatCurrency(stats.averageSpent)} per trip`}
        color="bg-indigo-500"
      />

      <StatCard
        icon={Users}
        label="Total Trips"
        value={stats.totalTrips}
        subtitle={`${stats.settledCount} settled · ${stats.pendingCount} pending`}
        color="bg-blue-500"
      />

      <StatCard
        icon={AlertCircle}
        label="I Owe"
        value={formatCurrency(stats.pendingBalance)}
        subtitle={`${stats.pendingCount} unsettled trips`}
        color="bg-amber-500"
      />

      <StatCard
        icon={UserX}
        label="Trips I Owe On"
        value={stats.pendingCount}
        subtitle={`${stats.settledCount} trips settled`}
        color="bg-rose-500"
      />
    </div>
  );
};