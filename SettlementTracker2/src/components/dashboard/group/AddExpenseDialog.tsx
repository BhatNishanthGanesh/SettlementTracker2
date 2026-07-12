// components/dashboard/group/AddExpenseDialog.tsx
'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Checkbox,
} from '@/components/ui/checkbox';
import { Member, Trip } from '@/app/(dashboard)/dashboard/group/types';
import { Loader2, Plus, Receipt } from 'lucide-react';
import { toast } from 'sonner';

interface AddExpenseDialogProps {
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
}

const categories = [
  { value: 'food', label: '🍽️ Food & Dining' },
  { value: 'transport', label: '🚗 Transport' },
  { value: 'accommodation', label: '🏨 Accommodation' },
  { value: 'entertainment', label: '🎭 Entertainment' },
  { value: 'shopping', label: '🛍️ Shopping' },
  { value: 'utilities', label: '💡 Utilities' },
  { value: 'health', label: '🏥 Health' },
  { value: 'other', label: '📌 Other' },
];

export function AddExpenseDialog({
  open,
  onOpenChange,
  trip,
  currentUser,
  onSubmit,
  isSubmitting,
}: AddExpenseDialogProps) {
  const [formData, setFormData] = useState<ExpenseFormData>({
    title: '',
    description: '',
    amount: 0,
    category: 'other',
    paidBy: currentUser?.id || '',
    splitBetween: trip.members?.map(m => m.id) || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof ExpenseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSplitToggle = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      splitBetween: prev.splitBetween.includes(memberId)
        ? prev.splitBetween.filter(id => id !== memberId)
        : [...prev.splitBetween, memberId],
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.paidBy) {
      newErrors.paidBy = 'Please select who paid';
    }
    if (formData.splitBetween.length === 0) {
      newErrors.splitBetween = 'Select at least one person to split with';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit(formData);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      amount: 0,
      category: 'other',
      paidBy: currentUser?.id || '',
      splitBetween: trip.members?.map(m => m.id) || [],
    });
    setErrors({});
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] dark:bg-gray-900 bg-white overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Receipt className="h-5 w-5 text-blue-500" />
            Add Expense
          </DialogTitle>
          <DialogDescription>
            Add a new expense to split with the group.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Dinner at Pizza Place"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Amount <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                className={`pl-8 ${errors.amount ? 'border-red-500' : ''}`}
                value={formData.amount || ''}
                onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-red-500">{errors.amount}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className='dark:bg-gray-900 bg-white'>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Paid By */}
          <div className="space-y-2">
            <Label htmlFor="paidBy" className="text-sm font-medium">
              Paid By <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.paidBy}
              onValueChange={(value) => handleChange('paidBy', value)}
            >
              <SelectTrigger className={errors.paidBy ? 'border-red-500' : ''}>
                <SelectValue placeholder="Who paid?" />
              </SelectTrigger>
              <SelectContent className='dark:bg-gray-900 bg-white'>
                {trip.members?.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.paidBy && (
              <p className="text-xs text-red-500">{errors.paidBy}</p>
            )}
          </div>

          {/* Split Between */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Split Between <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              {trip.members?.map((member) => (
                <div key={member.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`split-${member.id}`}
                    checked={formData.splitBetween.includes(member.id)}
                    onCheckedChange={() => handleSplitToggle(member.id)}
                  />
                  <Label htmlFor={`split-${member.id}`} className="text-sm cursor-pointer">
                    {member.name}
                    {member.id === currentUser?.id && (
                      <span className="text-xs text-gray-400 ml-1">(you)</span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
            {errors.splitBetween && (
              <p className="text-xs text-red-500">{errors.splitBetween}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Add any additional details..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add Expense
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}