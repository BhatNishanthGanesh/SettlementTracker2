// components/TripModal.tsx
import React from 'react';
import { X, Users, UserPlus } from 'react-feather';
import { EditFormData } from '@/app/(dashboard)/types';

interface TripModalProps {
  isOpen: boolean;
  formData: EditFormData;
  onClose: () => void;
  onSave: () => void;
  onFormChange: (data: Partial<EditFormData>) => void;
  onAddCompanion: () => void;
  onRemoveCompanion: (name: string) => void;
}

export const TripModal: React.FC<TripModalProps> = ({
  isOpen,
  formData,
  onClose,
  onSave,
  onFormChange,
  onAddCompanion,
  onRemoveCompanion
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl my-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Edit Trip</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Trip name"
            value={formData.name}
            onChange={(e) => onFormChange({ name: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            placeholder="Expense description"
            value={formData.expense}
            onChange={(e) => onFormChange({ expense: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            placeholder="Category (e.g. Travel, Food)"
            value={formData.category}
            onChange={(e) => onFormChange({ category: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Spent"
              value={formData.spent}
              onChange={(e) => onFormChange({ spent: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              placeholder="Received"
              value={formData.recieved}
              onChange={(e) => onFormChange({ recieved: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Companions
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add companion name"
                value={formData.companionInput}
                onChange={(e) => onFormChange({ companionInput: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onAddCompanion();
                  }
                }}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={onAddCompanion}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
              >
                <UserPlus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.companions.map((companion, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm"
                >
                  <Users className="w-3 h-3" />
                  {companion}
                  <button
                    onClick={() => onRemoveCompanion(companion)}
                    className="ml-1 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {formData.companions.length === 0 && (
                <span className="text-sm text-gray-400 dark:text-gray-500">No companions added</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button 
            onClick={onSave} 
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl transition-colors"
          >
            Save
          </button>
          <button 
            onClick={onClose} 
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-6 py-2.5 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};