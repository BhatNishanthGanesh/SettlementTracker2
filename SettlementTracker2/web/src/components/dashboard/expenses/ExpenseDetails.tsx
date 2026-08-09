// components/dashboard/expenses/ExpenseDetails.tsx
'use client';

import { X, Plus, Eye, User, Calendar, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface ExpenseDetailsProps {
  selectedDate: string | null;
  selectedTrip: any;
  expensesByDate: Record<string, any[]>;
  onDateClear: () => void;
  onAddExpense: () => void;
  onViewTrip: (trip: any) => void;
  getTotalSpentOnDate: (date: string) => number;
  getPaidByName: (paidById: string) => string;
}

export function ExpenseDetails({
  selectedDate,
  selectedTrip,
  expensesByDate,
  onDateClear,
  onAddExpense,
  onViewTrip,
  getTotalSpentOnDate,
  getPaidByName,
}: ExpenseDetailsProps) {
  const expenses = selectedDate ? expensesByDate[selectedDate] || [] : [];
  const totalSpentOnDate = getTotalSpentOnDate(selectedDate || '');

  if (!selectedDate) {
    return (
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm p-6 sm:p-8 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-8 w-8 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">No date selected</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Click a date on the calendar to view expenses</p>
      </div>
    );
  }

  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200/50 dark:border-slate-700/50">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {expenses.length} expense{expenses.length !== 1 ? 's' : ''} • {formatCurrency(totalSpentOnDate)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDateClear}
          className="h-8 w-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Expenses List */}
      <div className="p-4 sm:p-5 max-h-[500px] overflow-y-auto">
        {expenses.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <Wallet className="h-6 w-6 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">No expenses on this day</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onAddExpense}
              className="mt-3 rounded-xl"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add one
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense: any) => (
              <div 
                key={expense.id}
                className="group flex items-start gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-700/30 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                        {expense.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/50 dark:bg-slate-600/50 text-slate-600 dark:text-slate-400">
                          {expense.category || 'other'}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <User className="h-3 w-3" />
                          <span>{getPaidByName(expense.paidBy)}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      ₹{formatCurrency(expense.amount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 sm:p-5 border-t border-slate-200/50 dark:border-slate-700/50 bg-slate-50/30 dark:bg-slate-700/20">
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {selectedTrip?.name && (
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {selectedTrip.name}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewTrip(selectedTrip)}
            className="text-xs rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
          >
            <Eye className="h-3 w-3 mr-1" />
            View Trip
          </Button>
        </div>
      </div>
    </div>
  );
}