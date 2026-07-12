// app/(dashboard)/dashboard/expenses/utils/expense.utils.ts
import { Trip, Expense } from '@/app/(dashboard)/dashboard/group/types';

export const getTripEmoji = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('beach') || lower.includes('goa')) return '🏖️';
  if (lower.includes('mountain') || lower.includes('himalaya') || lower.includes('trek')) return '🏔️';
  if (lower.includes('city') || lower.includes('europe') || lower.includes('paris')) return '🌆';
  if (lower.includes('temple')) return '🛕';
  if (lower.includes('forest')) return '🌲';
  if (lower.includes('desert')) return '🏜️';
  if (lower.includes('lake')) return '🏞️';
  return '✈️';
};

export const calculateTripTotals = (expenses: Expense[]) => {
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  return { totalSpent };
};

export const groupExpensesByCategory = (expenses: Expense[]) => {
  return expenses.reduce((acc: Record<string, number>, exp: Expense) => {
    const category = exp.category || 'other';
    acc[category] = (acc[category] || 0) + exp.amount;
    return acc;
  }, {});
};

export const getExpensesByDate = (expenses: Expense[]) => {
  const dates: Record<string, Expense[]> = {};
  expenses.forEach(exp => {
    const dateStr = exp.createdAt?.split('T')[0] || '';
    if (dateStr) {
      if (!dates[dateStr]) dates[dateStr] = [];
      dates[dateStr].push(exp);
    }
  });
  return dates;
};

export const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
export const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
export const getMonthName = (month: number) => new Date(2024, month).toLocaleString('default', { month: 'long' });
export const formatDate = (date: Date) => date.toISOString().split('T')[0];
export const isToday = (date: Date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};