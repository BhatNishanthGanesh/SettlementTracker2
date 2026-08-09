import React from 'react';

export const TableSkeleton: React.FC = () => (
  <>
    {Array.from({ length: 5 }).map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></td>
        <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></td>
        <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div></td>
        <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div></td>
        <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></td>
        <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></td>
        <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></td>
        <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4"></div></td>
      </tr>
    ))}
  </>
);