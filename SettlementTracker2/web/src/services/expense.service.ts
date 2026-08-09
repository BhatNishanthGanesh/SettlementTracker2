import { api } from "@/lib/api";
import {
  CreateExpensePayload,
  ExpenseMessagePayload,
  ExpenseDeletionMessagePayload,
} from "@/types/expense.types";

import {Expense} from "@/types/expense.types";
export const expenseService = {
  getExpenses(tripId: string) {
    return api.get(`/trips/${tripId}/expenses`);
  },

  createExpense(
    tripId: string,
    data: CreateExpensePayload
  ) {
    return api.post(
      `/trips/${tripId}/expenses`,
      data
    );
  },

  updateExpense(
    tripId: string,
    expenseId: string,
    data: Partial<Expense>
  ) {
    return api.put(
      `/trips/${tripId}/expenses/${expenseId}`,
      data
    );
  },

  deleteExpense(
    tripId: string,
    expenseId: string
  ) {
    return api.delete(
      `/trips/${tripId}/expenses`,
      {
        params: {
          expenseId,
        },
      }
    );
  },

  createExpenseMessage(
  tripId: string,
  expense: ExpenseMessagePayload
) {
  return api.post(
    `/trips/${tripId}/messages`,
    {
      text: `💰 ${expense.paidBy} added an expense: "${expense.title}"`,
      type: "expense",
      metadata: {
        title: expense.title,
        amount: expense.amount,

        paidBy: expense.paidBy,
        paidById: expense.paidById,

        // Names
        splitBetween: expense.splitBetweenNames,

        // IDs
        splitBetweenIds: expense.splitBetween,

        // EXACT AMOUNT EACH PERSON OWES
        splits: expense.splits,

        category: expense.category ?? "other",
        description: expense.description ?? "",
        timestamp: new Date().toISOString(),
      },
    }
  );
},

  createExpenseDeletionMessage(
    tripId: string,
    expense: ExpenseDeletionMessagePayload
  ) {
    return api.post(
      `/trips/${tripId}/messages`,
      {
        text: `${expense.deletedBy} deleted the expense: "${expense.title}" (₹${expense.amount.toLocaleString()})`,
        type: "system",
        metadata: {
          type: "expense_deleted",
          title: expense.title,
          amount: expense.amount,
          paidBy: expense.paidBy,
          deletedBy: expense.deletedBy,
          deletedById:
            expense.deletedById,
          timestamp:
            new Date().toISOString(),
        },
      }
    );
  },
};