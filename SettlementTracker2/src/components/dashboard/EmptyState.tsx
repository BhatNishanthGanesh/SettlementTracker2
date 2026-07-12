// components/EmptyState.tsx
import React from 'react';
import { Users, Plus } from 'react-feather';

interface EmptyStateProps {
  onAction: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onAction }) => (
  <div className="text-center py-16">
    <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
      <Users className="w-12 h-12 text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No trips recorded yet</h3>
    <p className="text-gray-500 dark:text-gray-400 mb-6">Start tracking your group expenses and settlements</p>
    <button 
      onClick={onAction} 
      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25"
    >
      <Plus className="w-5 h-5" /> Create your first trip
    </button>
  </div>
);