// components/dashboard/expenses/ExpenseCalendar.tsx
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Eye, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatters';

interface ExpenseCalendarProps {
  currentDate: Date;
  selectedDate: string | null;
  expensesByDate: Record<string, any[]>;
  onNavigate: (direction: number) => void;
  onDateClick: (date: string) => void;
}

export function ExpenseCalendar({
  currentDate,
  selectedDate,
  expensesByDate,
  onNavigate,
  onDateClick,
}: ExpenseCalendarProps) {
  const [isHovering, setIsHovering] = useState<string | null>(null);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getMonthName = (month: number) => {
    return new Date(2024, month).toLocaleString('default', { month: 'long' });
  };

  const formatDate = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isDateInTripRange = (date: string) => {
    return !!expensesByDate[date] && expensesByDate[date].length > 0;
  };

  const getTotalSpentOnDate = (date: string) => {
    const expenses = expensesByDate[date] || [];
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  };

  const getExpenseCountOnDate = (date: string) => {
    return expensesByDate[date]?.length || 0;
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate(-1)}
            className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5">
            <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 min-w-[120px] text-center">
              {getMonthName(month)} {year}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate(1)}
            className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-slate-400 dark:text-slate-500 py-2 tracking-wider">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(year, month, day);
            const dateStr = formatDate(date);
            const hasExpense = isDateInTripRange(dateStr);
            const totalSpentOnDate = getTotalSpentOnDate(dateStr);
            const expenseCount = getExpenseCountOnDate(dateStr);
            const isSelected = selectedDate === dateStr;

            return (
              <div
                key={day}
                onClick={() => hasExpense && onDateClick(dateStr)}
                onMouseEnter={() => hasExpense && setIsHovering(dateStr)}
                onMouseLeave={() => setIsHovering(null)}
                className={cn(
                  "aspect-square p-1.5 rounded-xl cursor-pointer transition-all duration-200 relative group",
                  hasExpense 
                    ? "hover:scale-105 hover:shadow-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/20" 
                    : "opacity-40 cursor-default",
                  isSelected && "ring-2 ring-blue-500 ring-offset-2 bg-blue-50/50 dark:bg-blue-900/20",
                  isToday(date) && !isSelected && "ring-2 ring-blue-200 ring-offset-2"
                )}
              >
                <div className="flex flex-col h-full">
                  <span className={cn(
                    "text-sm font-medium",
                    isToday(date) ? "text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"
                  )}>
                    {day}
                  </span>
                  
                  {hasExpense && (
                    <div className="mt-auto">
                      <div className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 truncate">
                        {formatCurrency(totalSpentOnDate)}
                      </div>
                      <div className="flex gap-0.5 mt-0.5">
                        {expenseCount > 0 && (
                          <div className="flex gap-0.5">
                            {Array.from({ length: Math.min(expenseCount, 3) }).map((_, idx) => (
                              <div key={idx} className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            ))}
                            {expenseCount > 3 && (
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {isHovering === dateStr && hasExpense && (
                  <div className="absolute -top-2 -right-2">
                    <div className="h-5 w-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center shadow-lg">
                      <Eye className="h-3 w-3" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {Object.keys(expensesByDate).length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>{Object.keys(expensesByDate).length} days</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>Total:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {formatCurrency(
                    Object.values(expensesByDate).reduce(
                      (sum, expenses) => sum + expenses.reduce((s, e) => s + e.amount, 0),
                      0
                    )
                  )}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span>💰 {Object.values(expensesByDate).reduce((sum, exps) => sum + exps.length, 0)} expenses</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}