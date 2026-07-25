// hooks/useExpensesPage.ts
import { useState, useMemo, useEffect } from 'react';
import { useTrips } from '@/hooks/useTrips';
import { calculateTripTotals, groupExpensesByCategory, getExpensesByDate } from '@/app/(dashboard)/dashboard/expenses/utils/expense.utils';

export function useExpensesPage() {
  const { trips, loading, refetch } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);

  // Auto-select first trip with expenses
  useEffect(() => {
    if (trips.length > 0 && !selectedTripId) {
      // Find first trip with expenses
      const tripWithExpenses = trips.find((t: any) => t.expenses && t.expenses.length > 0);
      
      // If no trip has expenses, use the first trip
      const tripToSelect = tripWithExpenses || trips[0];
      
      console.log('🔄 Auto-selecting trip:', {
        id: tripToSelect.id,
        name: tripToSelect.name,
        expensesCount: tripToSelect.expenses?.length || 0
      });
      
      setSelectedTripId(tripToSelect.id);
    }
  }, [trips, selectedTripId]);

  const selectedTripData = useMemo(() => {
    const trip = trips.find((t: any) => t.id === selectedTripId) || trips[0] || null;
    if (trip) {
      console.log('📊 Selected trip:', {
        id: trip.id,
        name: trip.name,
        expenses: trip.expenses?.length || 0
      });
    }
    return trip;
  }, [trips, selectedTripId]);

  const expenses = selectedTripData?.expenses || [];
  const { totalSpent } = calculateTripTotals(expenses);
  const totalBudget = selectedTripData?.budget || 0;
  const remaining = totalBudget - totalSpent;
  const dailyAverage = expenses.length > 0 ? totalSpent / expenses.length : 0;
  const expensesByCategory = groupExpensesByCategory(expenses);
  const expensesByDate = getExpensesByDate(expenses);

  // Log expenses by date
  useEffect(() => {
    console.log('📅 Expenses by date:', expensesByDate);
    console.log('📅 Date keys:', Object.keys(expensesByDate));
    
    Object.entries(expensesByDate).forEach(([date, exps]) => {
      console.log(`  ${date}: ${exps.length} expenses, total: ₹${exps.reduce((s, e) => s + e.amount, 0)}`);
    });
  }, [expensesByDate]);

  const getExpensesForDate = (date: string) => expensesByDate[date] || [];
  const getTotalSpentOnDate = (date: string) => {
    return getExpensesForDate(date).reduce((sum, e) => sum + e.amount, 0);
  };

  const getPaidByName = (paidById: string) => {
    const member = selectedTripData?.members?.find((m: any) => m.id === paidById);
    return member?.name || 'Unknown';
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleDateClick = (date: string) => setSelectedDate(date);
  const handleViewTrip = (trip: any) => {
    setSelectedTrip(trip);
    setShowTripDetails(true);
  };

  useEffect(() => {
    console.log("========== Expenses Page ==========");
    console.log("Trips:", trips);
    console.log("Loading:", loading);
    console.log("Selected Trip ID:", selectedTripId);
    console.log("Selected Trip Data:", selectedTripData);
    console.log("Expenses:", expenses);
    console.log("Total Spent:", totalSpent);
    console.log("Total Budget:", totalBudget);
    console.log("Remaining:", remaining);
    console.log("Daily Average:", dailyAverage);
    console.log("Expenses By Category:", expensesByCategory);
    console.log("Expenses By Date:", expensesByDate);
    console.log("Selected Date:", selectedDate);
    console.log("Current Date:", currentDate);
    console.log("Selected Trip:", selectedTrip);
    console.log("Show Add Expense:", showAddExpense);
    console.log("Show Trip Details:", showTripDetails);
    console.log("==================================");
  }, [
    trips,
    loading,
    selectedTripId,
    selectedTripData,
    expenses,
    totalSpent,
    totalBudget,
    remaining,
    dailyAverage,
    expensesByCategory,
    expensesByDate,
    selectedDate,
    currentDate,
    selectedTrip,
    showAddExpense,
    showTripDetails,
  ]);

  return {
    // Data
    trips,
    loading,
    selectedTripData,
    expenses,
    totalSpent,
    totalBudget,
    remaining,
    dailyAverage,
    expensesByCategory,
    expensesByDate, 
    selectedDate,
    currentDate,
    selectedTrip,
    showAddExpense,
    showTripDetails,
    // Functions
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
    refetch,
  };
}