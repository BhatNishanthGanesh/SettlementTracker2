// app/expenses/components/AddExpenseDialog.tsx
'use client';

import { useState } from 'react';
import { Plus, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { TripService } from '@/app/(dashboard)/dashboard/group/services/trip.service';
import { getCategoryIcon } from '@/app/(dashboard)/dashboard/expenses/constants/category.constants';

const tripService = new TripService();

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: any;
  onSuccess: () => void;
}

export function AddExpenseDialog({ open, onOpenChange, trip, onSuccess }: AddExpenseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'other',
    paidBy: '',
    description: '',
  });

  const categories = [
    'food', 'transport', 'accommodation', 'entertainment', 
    'shopping', 'travel', 'activities', 'tickets', 'other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip) return;

    if (!formData.title.trim() || !formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await tripService.createExpense(trip.id, {
        title: formData.title,
        amount: parseFloat(formData.amount),
        category: formData.category,
        paidBy: formData.paidBy || trip.members?.[0]?.id,
        description: formData.description,
      });

      toast.success('Expense added successfully! 🎉');
      setFormData({ title: '', amount: '', category: 'other', paidBy: '', description: '' });
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-sm dark:bg-gray-800/95 border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
              <Plus className="h-4 w-4 text-white" />
            </div>
            Add New Expense
          </DialogTitle>
          <DialogDescription>
            Record a new expense for {trip?.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title *</label>
              <Input 
                placeholder="e.g., Lunch at restaurant" 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount (₹) *</label>
              <Input 
                type="number" 
                placeholder="1500" 
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between focus:ring-2 focus:ring-blue-500">
                      <span className="flex items-center gap-2">
                        {formData.category && getCategoryIcon(formData.category) && (
                          <span>{formData.category.charAt(0).toUpperCase() + formData.category.slice(1)}</span>
                        )}
                        {!formData.category && 'Select category'}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {categories.map((cat) => {
                      const Icon = getCategoryIcon(cat);
                      return (
                        <DropdownMenuItem 
                          key={cat} 
                          className="flex items-center gap-2"
                          onClick={() => setFormData({ ...formData, category: cat })}
                        >
                          <Icon className="h-4 w-4" />
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Paid by</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between focus:ring-2 focus:ring-blue-500">
                      {formData.paidBy 
                        ? trip?.members?.find((m: any) => m.id === formData.paidBy)?.name || 'Select member'
                        : 'Select member'}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {trip?.members?.map((member: any) => (
                      <DropdownMenuItem 
                        key={member.id} 
                        className="flex items-center gap-2"
                        onClick={() => setFormData({ ...formData, paidBy: member.id })}
                      >
                        {member.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description (Optional)</label>
              <Input 
                placeholder="Add any details..." 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}