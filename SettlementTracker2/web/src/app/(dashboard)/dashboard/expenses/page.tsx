// app/expenses/page.tsx
'use client';

import { Loader2, Compass, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExpensesPage } from '@/hooks/useExpensesPage';
import { ExpenseHeader } from '@/components/dashboard/expenses/ExpenseHeader';
import { ExpenseSummary } from '@/components/dashboard/expenses/ExpenseSummary';
import { ExpenseCalendar } from '@/components/dashboard/expenses/ExpenseCalendar';
import { ExpenseDetails } from '@/components/dashboard/expenses/ExpenseDetails';
import { AddExpenseDialog } from '@/components/dashboard/expenses/AddExpenseDialog';
import { TripDetailsDialog } from '@/components/dashboard/expenses/TripDetailsDialog';

export default function ExpensesPage() {
  const {
    trips,
    loading,
    selectedTripData,
    totalSpent,
    totalBudget,
    remaining,
    dailyAverage,
    expensesByCategory,
    selectedDate,
    currentDate,
    selectedTrip,
    showAddExpense,
    showTripDetails,
    setSelectedTripId,
    setSelectedDate,
    setShowAddExpense,
    setShowTripDetails,
    getExpensesForDate,
    getTotalSpentOnDate,
    getPaidByName,
    navigateMonth,
    handleDateClick,
    handleViewTrip,
    refresh,
    expensesByDate,
  } = useExpensesPage();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Loading your trips...</p>
        </div>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Compass className="h-10 w-10 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">No trips yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Create your first trip to start tracking expenses</p>
          <Button className="mt-4" onClick={() => window.location.href = '/dashboard/create-trip'}>
            <Plus className="h-4 w-4 mr-2" />
            Create Trip
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20 dark:from-slate-900 dark:to-slate-800">
      <ExpenseHeader
        trips={trips}
        selectedTrip={selectedTripData}
        onSelectTrip={setSelectedTripId}
        onAddExpense={() => setShowAddExpense(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <ExpenseSummary
              totalSpent={totalSpent}
              remaining={remaining}
              dailyAverage={dailyAverage}
              totalBudget={totalBudget}
            />

            <ExpenseCalendar
              currentDate={currentDate}
              selectedDate={selectedDate}
              expensesByDate={expensesByDate}
              onNavigate={navigateMonth}
              onDateClick={handleDateClick}
            />
          </div>

          <div className="lg:col-span-1">
            <ExpenseDetails
              selectedDate={selectedDate}
              selectedTrip={selectedTripData}
              expensesByDate={expensesByDate}
              onDateClear={() => setSelectedDate(null)}
              onAddExpense={() => setShowAddExpense(true)}
              onViewTrip={handleViewTrip}
              getTotalSpentOnDate={getTotalSpentOnDate}
              getPaidByName={getPaidByName}
            />
          </div>
        </div>
      </div>

      <AddExpenseDialog
        open={showAddExpense}
        onOpenChange={setShowAddExpense}
        trip={selectedTripData}
        onSuccess={refresh}
      />

      <TripDetailsDialog
        open={showTripDetails}
        onOpenChange={setShowTripDetails}
        trip={selectedTrip}
        expenses={selectedTrip?.expenses || []}
        getPaidByName={getPaidByName}
        totalSpent={totalSpent}
      />
    </div>
  );
}