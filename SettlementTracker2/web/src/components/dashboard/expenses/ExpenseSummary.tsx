// components/dashboard/expenses/ExpenseSummary.tsx
'use client';

import { TrendingUp, TrendingDown, Wallet, Calendar, PieChart } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface ExpenseSummaryProps {
  totalSpent: number;
  remaining: number;
  dailyAverage: number;
  totalBudget: number;
}

export function ExpenseSummary({
  totalSpent,
  remaining,
  dailyAverage,
  totalBudget,
}: ExpenseSummaryProps) {
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const isOverBudget = remaining < 0;

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Spent</span>
            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
            {formatCurrency(totalSpent)}
          </p>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Remaining</span>
            <div className={`p-1.5 ${isOverBudget ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'} rounded-lg`}>
              {isOverBudget ? (
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              ) : (
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              )}
            </div>
          </div>
          <p className={`text-xl sm:text-2xl font-bold mt-1.5 ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {formatCurrency(Math.abs(remaining))}
            {isOverBudget && <span className="text-sm font-normal text-red-400 ml-1">over</span>}
          </p>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Daily Avg</span>
            <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
            {formatCurrency(dailyAverage)}
          </p>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Budget</span>
            <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <PieChart className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
            {formatCurrency(totalBudget)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600 dark:text-slate-300">Budget Used</span>
          <span className={`font-medium ${spentPercentage > 80 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'}`}>
            {spentPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              spentPercentage > 80 
                ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                : spentPercentage > 50 
                ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500'
            }`}
            style={{ width: `${Math.min(spentPercentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}