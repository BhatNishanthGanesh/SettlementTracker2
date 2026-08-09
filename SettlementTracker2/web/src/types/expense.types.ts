import { Trip, Member } from "./trip.types";

export interface CreateExpensePayload {
  title: string;
  description?: string;
  amount: number;
  category?: string;
  paidBy: string;
  splitBetween: string[];
  splits: Record<string, number>;
}

export interface ExpenseMessagePayload {
  title: string;
  amount: number;
  paidBy: string;
  paidById: string;
  splitBetween: string[];
  splitBetweenNames: string[];
  splits: Record<string, number>;
  category?: string;
  description?: string;
}

export interface ExpenseDeletionMessagePayload {
  title: string;
  amount: number;
  paidBy: string;
  deletedBy: string;
  deletedById: string;
}

export interface AddMemberPayload {
  name: string;
  email?: string;
}

export interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: Trip;
  currentUser: Member | undefined;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  isSubmitting: boolean;
}

export interface ExpenseFormData {
  title: string;
  description: string;
  amount: number;
  category: string;
  paidBy: string;
  splitBetween: string[];
  splits: Record<string, number>;
}

export interface Expense {
  id: string;
  tripId?: string;
  title: string;
  description?: string;
  amount: number;
  paidBy: string;
  category?: string;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
}