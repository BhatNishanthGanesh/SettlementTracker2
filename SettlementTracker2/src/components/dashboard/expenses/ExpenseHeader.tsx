// components/dashboard/expenses/ExpenseHeader.tsx
'use client';

import { Plus, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ExpenseHeaderProps {
  trips: any[];
  selectedTrip: any;
  onSelectTrip: (tripId: string) => void;
  onAddExpense: () => void;
}

export function ExpenseHeader({ trips, selectedTrip, onSelectTrip, onAddExpense }: ExpenseHeaderProps) {
  return (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Expenses
            </h1>
          </div>
          
          <Select
            value={selectedTrip?.id}
            onValueChange={onSelectTrip}
          >
            <SelectTrigger className="w-[160px] sm:w-[200px] bg-white/80 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
              <SelectValue placeholder="Select a trip" />
            </SelectTrigger>
            <SelectContent className='dark:bg-gray-900 bg-white'>
              {trips.map((trip) => (
                <SelectItem key={trip.id} value={trip.id}>
                  <div className="flex items-center gap-2">
                    <span>{trip.name}</span>
                    {trip.expenses && trip.expenses.length > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                        {trip.expenses.length}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={onAddExpense} 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>
    </div>
  );
}