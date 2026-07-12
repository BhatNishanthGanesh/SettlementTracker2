'use client';
import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function GroupIndexPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
        <MessageCircle className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-50">Select a trip group</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Choose a group from the list to start chatting and tracking expenses
      </p>
    </div>
  );
}