import React from "react";
import { Calendar, Users } from "lucide-react";
import { TripData } from "@/types/trip.types";
import { StatusBadge } from "../ui/StatusBadge";
import { formatDate } from "@/utils/formatters";

export const TripTableRow = ({
  trip,
}: {
  trip: TripData;
}) => {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">

      {/* Trip */}
      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
        {trip.name}
      </td>

      {/* Expense */}
      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
        {trip.expense}
      </td>

      {/* Category / Destination */}
      <td className="px-4 py-3">
        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
          {trip.category || "General"}
        </span>
      </td>

      {/* MY SPENDING */}
      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
        ₹{trip.spent.toFixed(0)}
      </td>

      {/* I OWE */}
      <td className="px-4 py-3">
        {trip.balance < 0 ? (
          <span className="font-medium text-red-600 dark:text-red-400">
            ₹{Math.abs(trip.balance).toFixed(0)}
          </span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">
            ₹0
          </span>
        )}
      </td>

      {/* RECEIVED */}
      <td className="px-4 py-3">
        {trip.balance > 0 ? (
          <span className="font-medium text-green-600 dark:text-green-400">
            ₹{trip.balance.toFixed(0)}
          </span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">
            ₹0
          </span>
        )}
      </td>

      {/* Companions */}
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {trip.companions.map((companion, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full"
            >
              <Users className="w-3 h-3" />
              {companion}
            </span>
          ))}

          {trip.companions.length === 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              No companions
            </span>
          )}
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge status={trip.status} />
      </td>

      {/* Date */}
      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />

          {formatDate(trip.createdAt, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </td>

    </tr>
  );
};