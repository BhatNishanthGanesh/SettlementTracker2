// app/(dashboard)/dashboard/group/services/expense.service.ts
import { API_ENDPOINTS } from '../constants';
import { Expense, Message } from '../types';

export class ExpenseService {
  async createExpense(tripId: string, data: {
    title: string;
    description?: string;
    amount: number;
    category?: string;
    paidBy: string;
    splitBetween: string[];
  }): Promise<Expense> {
    const response = await fetch(`${API_ENDPOINTS.TRIPS}/${tripId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create expense');
    }
    
    const result = await response.json();
    console.log("result",result.data)
    return result.data;
  }

  async getExpenses(tripId: string): Promise<Expense[]> {
    const response = await fetch(`${API_ENDPOINTS.TRIPS}/${tripId}/expenses`);
    if (!response.ok) {
      throw new Error('Failed to fetch expenses');
    }
    const data = await response.json();
    return data.data || [];
  }

  async deleteExpense(tripId: string, expenseId: string): Promise<void> {
    const response = await fetch(`${API_ENDPOINTS.TRIPS}/${tripId}/expenses?expenseId=${expenseId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete expense');
    }
  }

  // Add this new method to create deletion message
  async createExpenseDeletionMessage(
    tripId: string,
    expenseData: {
      title: string;
      amount: number;
      paidBy: string;
      deletedBy: string;
      deletedById: string;
    }
  ): Promise<Message> {
    const messageText = `🗑️ ${expenseData.deletedBy} deleted the expense: "${expenseData.title}" (₹${expenseData.amount.toLocaleString()})`;
    
    const metadata = {
      type: 'expense_deleted',
      title: expenseData.title,
      amount: expenseData.amount,
      paidBy: expenseData.paidBy,
      deletedBy: expenseData.deletedBy,
      deletedById: expenseData.deletedById,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(`${API_ENDPOINTS.TRIPS}/${tripId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: messageText,
        type: 'system',
        metadata: metadata,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create deletion message');
    }
    
    const result = await response.json();
    return result.data;
  }

  async updateExpense(tripId: string, expenseId: string, data: Partial<Expense>): Promise<Expense> {
    const response = await fetch(`${API_ENDPOINTS.TRIPS}/${tripId}/expenses/${expenseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update expense');
    }
    const result = await response.json();
    return result.data;
  }

  async createExpenseMessage(
    tripId: string, 
    expenseData: {
      title: string;
      amount: number;
      paidBy: string;
      paidById: string;
      splitBetween: string[];
      splitBetweenNames: string[];
      category?: string;
      description?: string;
    }
  ): Promise<Message> {
    const perPersonAmount = expenseData.amount / expenseData.splitBetween.length;
    const messageText = `💰 ${expenseData.paidBy} added an expense: "${expenseData.title}"`;
    
    const metadata = {
      title: expenseData.title,
      amount: expenseData.amount,
      paidBy: expenseData.paidBy,
      paidById: expenseData.paidById,
      splitBetween: expenseData.splitBetweenNames,
      splitBetweenIds: expenseData.splitBetween,
      perPersonAmount: perPersonAmount,
      category: expenseData.category || 'other',
      description: expenseData.description || '',
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(`${API_ENDPOINTS.TRIPS}/${tripId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: messageText,
        type: 'expense',
        metadata: metadata,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create expense message');
    }
    
    const result = await response.json();
    return result.data;
  }
}