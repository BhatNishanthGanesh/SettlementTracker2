// app/expenses/components/AddExpenseDialog.tsx
"use client";

import { useState } from "react";
import { Plus, ChevronDown, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { toast } from "sonner";

import { expenseService } from "@/services/expense.service";

import {
  categories,
  getCategoryIcon,
} from "@/constants/expense.constant";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: any;
  onSuccess: () => void;
}

export function AddExpenseDialog({
  open,
  onOpenChange,
  trip,
  onSuccess,
}: AddExpenseDialogProps) {
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "other",
    paidBy: "",
    description: "",
    splits: {} as Record<string, number>,
  });

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!trip) return;

    if (
      !formData.title.trim() ||
      !formData.amount ||
      parseFloat(formData.amount) <= 0
    ) {
      toast.error(
        "Please fill in all required fields"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await expenseService.createExpense(trip.id, {
        title: formData.title.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        paidBy:
          formData.paidBy ||
          trip.members?.[0]?.id,
        description:
          formData.description.trim(),
        splitBetween:
          trip.members?.map(
            (member: any) => member.id
          ) ?? [],
          splits: formData.splits,
      });

      toast.success(
        "Expense added successfully! 🎉"
      );

      setFormData({
        title: "",
        amount: "",
        category: "other",
        paidBy: "",
        description: "",
         splits: {} as Record<string, number>,
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to add expense"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory =
    categories.find(
      (category) =>
        category.value === formData.category
    );

  const selectedMember =
    trip?.members?.find(
      (member: any) =>
        member.id === formData.paidBy
    );

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Add New Expense
          </DialogTitle>

          <DialogDescription>
            Record a new expense for{" "}
            {trip?.name}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Title *
            </label>

            <Input
              placeholder="e.g., Lunch at restaurant"
              value={formData.title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: e.target.value,
                })
              }
              className="focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Amount (₹) *
            </label>

            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="1500"
              value={formData.amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amount: e.target.value,
                })
              }
              className="focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Category
            </label>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between"
                >
                  <div className="flex items-center gap-2">
                    {selectedCategory &&
                      getCategoryIcon(
                        selectedCategory.value
                      )}

                    <span>
                      {selectedCategory?.label ||
                        "Select category"}
                    </span>
                  </div>

                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-[450px]">
                {categories.map(
                  (category) => (
                    <DropdownMenuItem
                      key={category.value}
                      className="flex items-center gap-2"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          category:
                            category.value,
                        })
                      }
                    >
                      {getCategoryIcon(
                        category.value
                      )}

                      <span>
                        {category.label}
                      </span>
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Paid By */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Paid by
            </label>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between"
                >
                  <span>
                    {selectedMember?.name ||
                      "Select member"}
                  </span>

                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-[450px]">
                {trip?.members?.map(
                  (member: any) => (
                    <DropdownMenuItem
                      key={member.id}
                      className="flex items-center gap-2"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          paidBy: member.id,
                        })
                      }
                    >
                      {member.name}
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Description (Optional)
            </label>

            <Input
              placeholder="Add any details..."
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description:
                    e.target.value,
                })
              }
              className="focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Footer */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onOpenChange(false)
              }
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
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