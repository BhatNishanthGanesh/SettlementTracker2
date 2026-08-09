// app/expenses/components/TripDetailsDialog.tsx
'use client';

import { Clock, MapPin, Users, Receipt, PieChart, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/utils/formatters';
import { getTripEmoji, formatDate } from '@/app/(dashboard)/dashboard/expenses/utils/expense.utils';
import { getCategoryIcon, getCategoryColor } from '@/constants/expense.constant';
import { cn } from '@/lib/utils';

interface TripDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: any;
  expenses: any[];
  getPaidByName: (id: string) => string;
  totalSpent: number;
}

export function TripDetailsDialog({
  open,
  onOpenChange,
  trip,
  expenses,
  getPaidByName,
  totalSpent,
}: TripDetailsDialogProps) {
  if (!trip) return null;

  const expensesByCategory = expenses.reduce((acc: Record<string, number>, exp: any) => {
    const category = exp.category || 'other';
    acc[category] = (acc[category] || 0) + exp.amount;
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-white/95 backdrop-blur-sm dark:bg-gray-800/95 border-0 shadow-2xl p-0">
        {/* Header with Cover */}
        <div className="relative h-48 w-full rounded-t-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
          {trip.image ? (
            <img 
              src={trip.image} 
              alt={trip.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-6xl">{getTripEmoji(trip.name)}</span>
            </div>
          )}
          <div className="absolute bottom-4 left-6 z-20">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{getTripEmoji(trip.name)}</span>
              <div>
                <h2 className="text-2xl font-bold text-white">{trip.name}</h2>
                <p className="text-white/80 text-sm flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {trip.destination || 'No destination set'}
                </p>
              </div>
            </div>
          </div>
          <Badge className="absolute top-4 right-4 z-20 text-white border-0 px-3 py-1 bg-blue-500">
            {trip.members?.length || 0} members
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-16 z-20 text-white hover:bg-white/20 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Trip Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400">Budget</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(trip.budget)}</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400">Spent</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{formatCurrency(trip.budget - totalSpent)}</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400">Expenses</p>
              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{expenses.length}</p>
            </div>
          </div>

          {/* Trip Dates */}
          {trip.startDate && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Start</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                    {formatDate(new Date(trip.startDate))}
                  </p>
                </div>
                {trip.endDate && (
                  <>
                    <div className="text-gray-400">→</div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">End</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                        {formatDate(new Date(trip.endDate))}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {Math.ceil((new Date(trip.endDate || trip.startDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
            </div>
          )}

          {/* Expenses by Category */}
          {Object.keys(expensesByCategory).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-4 flex items-center gap-2">
                <PieChart className="h-4 w-4 text-blue-500" />
                Spending by Category
              </h4>
              <div className="space-y-3">
                {Object.entries(expensesByCategory).map(([category, amount]) => {
                  const Icon = getCategoryIcon(category);
                  const color = getCategoryColor(category);
                  const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
                  return (
                    <div key={category} className="flex items-center gap-3">
                      <div className={cn("h-8 w-8 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg flex-shrink-0", color)}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-700 dark:text-gray-300 capitalize">{category}</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-50">
                            {formatCurrency(amount)}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-1000"
                            style={{ 
                              width: `${percentage}%`, 
                              background: `linear-gradient(to right, #3B82F6, #8B5CF6)` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Expenses */}
          {expenses.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-4 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-purple-500" />
                All Expenses ({expenses.length})
              </h4>
              <ScrollArea className="h-[200px] pr-2">
                <div className="space-y-2.5">
                  {expenses.map((expense: any) => {
                    const Icon = getCategoryIcon(expense.category);
                    const color = getCategoryColor(expense.category);
                    return (
                      <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                          <div className={cn("h-9 w-9 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg", color)}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                              {expense.title || expense.description}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                              <span>{formatDate(new Date(expense.createdAt))}</span>
                              <span>•</span>
                              <span className="capitalize">{expense.category || 'Other'}</span>
                              <span>•</span>
                              <span>👤 {getPaidByName(expense.paidBy)}</span>
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-50">
                          {formatCurrency(expense.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}