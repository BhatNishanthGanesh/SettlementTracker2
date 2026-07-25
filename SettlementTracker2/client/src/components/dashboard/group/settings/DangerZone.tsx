// components/dashboard/group/settings/DangerZone.tsx
'use client';
import React from 'react';
import { AlertCircle, Trash2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DangerZoneProps {
  type: 'delete' | 'leave';
  onAction: () => void;
}

export function DangerZone({ type, onAction }: DangerZoneProps) {
  const isDelete = type === 'delete';
  const Icon = isDelete ? Trash2 : LogOut;
  const title = isDelete ? 'Delete Group' : 'Leave Group';
  const description = isDelete ? 'Permanently delete this group and all data' : 'You will lose access to this group';
  const buttonText = isDelete ? 'Delete' : 'Leave';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-red-200 dark:border-red-900/50 overflow-hidden">
      <div className="p-6 border-b border-red-200 dark:border-red-900/30">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
            <p className="text-sm text-gray-500">Actions that cannot be undone</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between p-4 bg-red-50/50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900/30">
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
          <Button variant="destructive" size="sm" onClick={onAction}>
            <Icon className="h-4 w-4 mr-1" /> {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}