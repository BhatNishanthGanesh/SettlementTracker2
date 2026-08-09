// components/StatusBadge.tsx
import React from 'react';
import { CheckCircle, AlertCircle, XCircle } from 'react-feather';

interface StatusBadgeProps {
  status: 'settled' | 'pending' | 'overdue';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = {
    settled: { 
      icon: CheckCircle, 
      text: 'Settled', 
      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
    },
    pending: { 
      icon: AlertCircle, 
      text: 'Pending', 
      className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' 
    },
    overdue: { 
      icon: XCircle, 
      text: 'Overdue', 
      className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
    },
  };
  
  const { icon: Icon, text, className } = config[status];
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${className}`}>
      <Icon className="w-3 h-3" /> {text}
    </span>
  );
};