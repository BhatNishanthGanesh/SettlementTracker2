// components/DeleteConfirmation.tsx
import React from 'react';
import { AlertCircle } from 'react-feather';

interface DeleteConfirmationProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  isOpen,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete trip?</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button 
            onClick={onConfirm} 
            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl transition-colors"
          >
            Delete
          </button>
          <button 
            onClick={onCancel} 
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-6 py-2.5 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};