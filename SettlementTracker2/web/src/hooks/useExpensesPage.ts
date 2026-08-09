import { useState, useMemo, useEffect } from "react";
import { useTripList } from "@/hooks/useTripList";
import {
  calculateTripTotals,
  groupExpensesByCategory,
  getExpensesByDate,
} from "@/app/(dashboard)/dashboard/expenses/utils/expense.utils";
import { Trip } from "@/types/trip.types";

export function useExpensesPage() {
  const { trips, loading, refresh } = useTripList();

  const [selectedTripId, setSelectedTripId] =
    useState<string | null>(null);

  const [currentDate, setCurrentDate] =
    useState(new Date());

  const [selectedDate, setSelectedDate] =
    useState<string | null>(null);

  const [showAddExpense, setShowAddExpense] =
    useState(false);

  const [showTripDetails, setShowTripDetails] =
    useState(false);

  const [selectedTrip, setSelectedTrip] =
    useState<Trip | null>(null);

  // Auto-select first trip with expenses
  useEffect(() => {
    if (trips.length > 0 && !selectedTripId) {
      const tripWithExpenses = trips.find(
        (trip) =>
          trip.expenses &&
          trip.expenses.length > 0
      );

      const tripToSelect =
        tripWithExpenses || trips[0];

      setSelectedTripId(tripToSelect.id);
    }
  }, [trips, selectedTripId]);

  // Selected trip
  const selectedTripData = useMemo(() => {
    return (
      trips.find(
        (trip) => trip.id === selectedTripId
      ) ||
      trips[0] ||
      null
    );
  }, [trips, selectedTripId]);

  const expenses =
    selectedTripData?.expenses ?? [];

  const { totalSpent } =
    calculateTripTotals(expenses);

  const totalBudget =
    selectedTripData?.budget ?? 0;

  const remaining =
    totalBudget - totalSpent;

  const dailyAverage =
    expenses.length > 0
      ? totalSpent / expenses.length
      : 0;

  const expensesByCategory =
    groupExpensesByCategory(expenses);

  const expensesByDate =
    getExpensesByDate(expenses);

  const getExpensesForDate = (
    date: string
  ) => {
    return expensesByDate[date] || [];
  };

  const getTotalSpentOnDate = (
    date: string
  ) => {
    return getExpensesForDate(date).reduce(
      (sum, expense) =>
        sum + expense.amount,
      0
    );
  };

  const getPaidByName = (
    paidById: string
  ) => {
    const member =
      selectedTripData?.members?.find(
        (member) =>
          member.id === paidById
      );

    return member?.name || "Unknown";
  };

  const navigateMonth = (
    direction: number
  ) => {
    const newDate =
      new Date(currentDate);

    newDate.setMonth(
      newDate.getMonth() + direction
    );

    setCurrentDate(newDate);
  };

  const handleDateClick = (
    date: string
  ) => {
    setSelectedDate(date);
  };

  const handleViewTrip = (
    trip: Trip
  ) => {
    setSelectedTrip(trip);
    setShowTripDetails(true);
  };

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
    refresh,
  };
}