// components/ExpensesTab.tsx
'use client';
import { Plus, Wallet, Receipt, User, Calendar, Tag, Trash2, MoreVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trip, Member, Expense } from '@/app/(dashboard)/dashboard/group/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';
import { AddExpenseDialog, ExpenseFormData } from './AddExpenseDialog';
import { ExpenseService } from '@/app/(dashboard)/dashboard/group/services/expense.service';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExpensesTabProps {
  trip: Trip;
  totalSpent: number;
  onAddExpense?: () => void;
  onExpenseAdded?: () => void;
  onExpenseDeleted?: () => void;
  currentUser?: Member;
  isAdmin?: boolean;
}

export function ExpensesTab({ 
  trip, 
  totalSpent, 
  onAddExpense,
  onExpenseAdded,
  onExpenseDeleted,
  currentUser,
  isAdmin = false,
}: ExpensesTabProps) {
  const remaining = (trip.budget || 0) - totalSpent;
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const expenseService = new ExpenseService();

  const getPaidByName = (paidById: string): string => {
    const member = trip.members?.find((m: Member) => m.id === paidById);
    return member?.name || 'Unknown';
  };

  const getMemberCount = (): number => {
    return trip.members?.length || 0;
  };

  const getPerPersonAmount = (amount: number): number => {
    const count = getMemberCount();
    return count > 0 ? amount / count : amount;
  };

  const getCategoryInfo = (category?: string | null) => {
    const categories: Record<string, { icon: string; color: string }> = {
      'food': { icon: '🍽️', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
      'transport': { icon: '🚗', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
      'accommodation': { icon: '🏨', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
      'entertainment': { icon: '🎭', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' },
      'shopping': { icon: '🛍️', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
      'utilities': { icon: '💡', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' },
      'health': { icon: '🏥', color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
      'other': { icon: '📌', color: 'bg-gray-100 dark:bg-gray-700/30 text-gray-600 dark:text-gray-400' },
    };
    
    const key = category?.toLowerCase() || 'other';
    return categories[key] || categories['other'];
  };

  const handleAddExpense = async (formData: ExpenseFormData) => {
    setIsSubmitting(true);
    try {
      const paidByMember = trip.members?.find(m => m.id === formData.paidBy);
      const splitMembers = formData.splitBetween
        .map(id => trip.members?.find(m => m.id === id))
        .filter(Boolean);

      const expense = await expenseService.createExpense(trip.id, {
        title: formData.title,
        description: formData.description,
        amount: formData.amount,
        category: formData.category,
        paidBy: formData.paidBy,
        splitBetween: formData.splitBetween,
      });

      await expenseService.createExpenseMessage(trip.id, {
        title: formData.title,
        amount: formData.amount,
        paidBy: paidByMember?.name || 'Someone',
        paidById: formData.paidBy,
        splitBetween: formData.splitBetween,
        splitBetweenNames: splitMembers.map(m => m?.name || 'Unknown'),
        category: formData.category,
        description: formData.description,
      });

      setIsDialogOpen(false);
      
      toast.success(
        `💰 "${formData.title}" added for ₹${formData.amount.toLocaleString()}!`,
        {
          description: `Paid by ${paidByMember?.name} • Split ${splitMembers.length} ways`,
          duration: 5000,
        }
      );
      
      if (onExpenseAdded) {
        await onExpenseAdded();
      }
      
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;
    
    setIsDeleting(true);
    try {
      const deletedByName = currentUser?.name || 'Someone';
      await expenseService.deleteExpense(trip.id, expenseToDelete.id);
      const paidByName = getPaidByName(expenseToDelete.paidBy);
      
      await expenseService.createExpenseDeletionMessage(trip.id, {
        title: expenseToDelete.title,
        amount: expenseToDelete.amount,
        paidBy: paidByName,
        deletedBy: deletedByName,
        deletedById: currentUser?.id || '',
      });
      toast.success(`Expense "${expenseToDelete.title}" deleted successfully`);
      if (onExpenseDeleted) {
        await onExpenseDeleted();
      }
      
      setExpenseToDelete(null);
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete expense');
    } finally {
      setIsDeleting(false);
    }
  };

  const canDeleteExpense = (expense: Expense): boolean => {
    console.log(expense.paidBy, currentUser?.id, isAdmin);
    const isOwn = expense.paidBy === currentUser?.id;
    return isOwn || isAdmin;
  };

  return (
    <>
      <div className="flex-1 p-4 overflow-y-auto min-h-0">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <CardContent className="p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Wallet className="h-3 w-3" />
                  Total Budget
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-50">
                  ₹{formatCurrency(trip.budget || 0)}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <CardContent className="p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Receipt className="h-3 w-3" />
                  Spent
                </p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  ₹{formatCurrency(totalSpent)}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <CardContent className="p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Wallet className="h-3 w-3" />
                  Remaining
                </p>
                <p className={cn(
                  "text-lg font-bold",
                  remaining >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}>
                  ₹{formatCurrency(remaining)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar */}
          {trip.budget && trip.budget > 0 && (
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Budget Usage</span>
                <span>{Math.min((totalSpent / trip.budget) * 100, 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    totalSpent / trip.budget > 0.8 ? "bg-red-500" : 
                    totalSpent / trip.budget > 0.6 ? "bg-yellow-500" : "bg-blue-500"
                  )}
                  style={{ width: `${Math.min((totalSpent / trip.budget) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Expenses List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 flex items-center gap-2">
                All Expenses 
                <Badge variant="secondary" className="text-xs">
                  {trip.expenses?.length || 0}
                </Badge>
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsDialogOpen(true)}
                className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Expense
              </Button>
            </div>

            <div className="space-y-2">
              {!trip.expenses || trip.expenses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                  <Wallet className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No expenses yet</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Add your first expense to start tracking</p>
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => setIsDialogOpen(true)}
                    className="mt-2"
                  >
                    Add Expense
                  </Button>
                </div>
              ) : (
                trip.expenses.map((expense) => (
                  <ExpenseItem
                    key={expense.id}
                    expense={expense}
                    paidByName={getPaidByName(expense.paidBy)}
                    memberCount={getMemberCount()}
                    getCategoryInfo={getCategoryInfo}
                    canDelete={canDeleteExpense(expense)}
                    onDelete={() => setExpenseToDelete(expense)}
                    isAdmin={isAdmin}
                    currentUserId={currentUser?.id}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Expense Dialog */}
      <AddExpenseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        trip={trip}
        currentUser={currentUser}
        onSubmit={handleAddExpense}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={!!expenseToDelete} 
        onOpenChange={() => setExpenseToDelete(null)}
      >
        <AlertDialogContent className="dark:bg-gray-900 bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
            <AlertDialogDescription>
              {isAdmin && expenseToDelete?.paidBy !== currentUser?.id ? (
                <>You are about to delete <strong>"{expenseToDelete?.title}"</strong> added by <strong>{getPaidByName(expenseToDelete?.paidBy || '')}</strong>. This action cannot be undone.</>
              ) : (
                <>You are about to delete <strong>"{expenseToDelete?.title}"</strong>. This action cannot be undone.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteExpense}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Deleting...
                </>
              ) : (
                'Delete Expense'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Expense Item Sub-component
interface ExpenseItemProps {
  expense: Expense;
  paidByName: string;
  memberCount: number;
  getCategoryInfo: (category?: string | null) => { icon: string; color: string };
  canDelete: boolean;
  onDelete: () => void;
  isAdmin: boolean;
  currentUserId?: string;
}

function ExpenseItem({ 
  expense, 
  paidByName, 
  memberCount, 
  getCategoryInfo,
  canDelete,
  onDelete,
  isAdmin,
  currentUserId,
}: ExpenseItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const categoryInfo = getCategoryInfo(expense.category);
  const perPersonAmount = memberCount > 0 ? expense.amount / memberCount : expense.amount;
  const isOwn = expense.paidBy === currentUserId;

  return (
    <div 
      className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between p-3">
        <div 
          className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
            categoryInfo.color
          )}>
            <span className="text-lg">{categoryInfo.icon}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
              {expense.title}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-0.5">
                <User className="h-3 w-3" />
                {paidByName}
                {isOwn && (
                  <span className="text-blue-500 ml-1">(you)</span>
                )}
              </span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className="flex items-center gap-0.5">
                <Calendar className="h-3 w-3" />
                {formatDate(expense.createdAt)}
              </span>
              {expense.category && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span className="flex items-center gap-0.5">
                    <Tag className="h-3 w-3" />
                    {expense.category}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-2 flex items-center gap-2">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              ₹{formatCurrency(expense.amount)}
            </p>
            <Badge variant="secondary" className="text-[10px]">
              ₹{formatCurrency(perPersonAmount)}/person
            </Badge>
          </div>
          
          {/* Delete button - only if user can delete */}
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && expense.description && (
        <div className="px-3 pb-3 pt-1 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {expense.description}
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
            <span>Split {memberCount} ways</span>
            <span>•</span>
            <span>Added on {new Date(expense.createdAt).toLocaleDateString()}</span>
            {isAdmin && !isOwn && (
              <span className="text-blue-500">• Admin can delete</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}