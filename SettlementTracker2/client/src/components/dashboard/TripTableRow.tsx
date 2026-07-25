// components/TripTableRow.tsx
import React from 'react';
import { Edit, Trash2, Calendar, Users } from 'react-feather';
import { TripData } from '@/app/(dashboard)/types';
import { StatusBadge } from './StatusBadge';

interface TripTableRowProps {
  trip: TripData;
}

export const TripTableRow: React.FC<TripTableRowProps> = ({
  trip,
}) => {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{trip.name}</td>
      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{trip.expense}</td>
      <td className="px-4 py-3">
        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
          {trip.category || 'General'}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">₹{trip.spent.toFixed(0)}</td>
      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">₹{trip.recieved.toFixed(0)}</td>
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
            <span className="text-xs text-gray-400 dark:text-gray-500">No companions</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={trip.status} />
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(trip.createdAt)}
        </div>
      </td>
    </tr>
  );
};