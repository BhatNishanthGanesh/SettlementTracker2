"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Receipt } from "lucide-react";
import { ExpenseFormData,AddExpenseDialogProps } from "@/types/expense.types";
import { categories } from "@/constants/expense.constant";


export function AddExpenseDialog({
  open,
  onOpenChange,
  trip,
  currentUser,
  onSubmit,
  isSubmitting,
}: AddExpenseDialogProps) {
  const [formData, setFormData] =
    useState<ExpenseFormData>({
      title: "",
      description: "",
      amount: 0,
      category: "other",
      paidBy: currentUser?.id || "",
      splitBetween: [],
      splits: {},
    });

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;

    const members =
      trip.members
        ?.map(member => member.id)
        .filter(
          (id): id is string => Boolean(id)
        ) ?? [];

    setFormData({
      title: "",
      description: "",
      amount: 0,
      category: "other",
      paidBy: currentUser?.id || "",
      splitBetween: members,
      splits: Object.fromEntries(
        members.map(id => [id, 0])
      ),
    });

    setErrors({});
  }, [
    open,
    trip.members,
    currentUser?.id,
  ]);

  const handleChange = (
    field: keyof ExpenseFormData,
    value:
      | string
      | number
      | string[]
      | Record<string, number>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    setErrors(prev => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleSplitToggle = (
    memberId: string
  ) => {
    setFormData(prev => {
      const exists =
        prev.splitBetween.includes(memberId);

      if (exists) {
        const splits = {
          ...prev.splits,
        };

        delete splits[memberId];

        return {
          ...prev,
          splitBetween:
            prev.splitBetween.filter(
              id => id !== memberId
            ),
          splits,
        };
      }

      return {
        ...prev,
        splitBetween: [
          ...prev.splitBetween,
          memberId,
        ],
        splits: {
          ...prev.splits,
          [memberId]: 0,
        },
      };
    });

    setErrors(prev => ({
      ...prev,
      splitBetween: "",
    }));
  };

  const handleSplitChange = (
    memberId: string,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      splits: {
        ...prev.splits,
        [memberId]:
          value === ""
            ? 0
            : Number(value),
      },
    }));

    setErrors(prev => ({
      ...prev,
      splits: "",
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<
      string,
      string
    > = {};

    if (!formData.title.trim()) {
      newErrors.title =
        "Title is required";
    }

    if (formData.amount <= 0) {
      newErrors.amount =
        "Amount must be greater than 0";
    }

    if (!formData.paidBy) {
      newErrors.paidBy =
        "Please select who paid";
    }

    if (
      formData.splitBetween.length === 0
    ) {
      newErrors.splitBetween =
        "Select at least one person";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onSubmit(formData);
  };

  const resetForm = () => {
    const members =
      trip.members
        ?.map(member => member.id)
        .filter(
          (id): id is string => Boolean(id)
        ) ?? [];

    setFormData({
      title: "",
      description: "",
      amount: 0,
      category: "other",
      paidBy: currentUser?.id || "",
      splitBetween: members,
      splits: Object.fromEntries(
        members.map(id => [id, 0])
      ),
    });

    setErrors({});
  };

  const handleOpenChange = (
    value: boolean
  ) => {
    if (!value) {
      resetForm();
    }

    onOpenChange(value);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] dark:bg-gray-900 bg-white overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Receipt className="h-5 w-5 text-blue-500" />
            Add Expense
          </DialogTitle>

          <DialogDescription>
            Add an expense and enter each
            person's exact share.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title{" "}
              <span className="text-red-500">
                *
              </span>
            </Label>

            <Input
              id="title"
              placeholder="e.g., Dinner at Pizza Place"
              value={formData.title}
              onChange={e =>
                handleChange(
                  "title",
                  e.target.value
                )
              }
              className={
                errors.title
                  ? "border-red-500"
                  : ""
              }
            />

            {errors.title && (
              <p className="text-xs text-red-500">
                {errors.title}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              Total Amount{" "}
              <span className="text-red-500">
                *
              </span>
            </Label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                ₹
              </span>

              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={
                  formData.amount || ""
                }
                onChange={e =>
                  handleChange(
                    "amount",
                    Number(e.target.value) || 0
                  )
                }
                className={`pl-8 ${
                  errors.amount
                    ? "border-red-500"
                    : ""
                }`}
              />
            </div>

            {errors.amount && (
              <p className="text-xs text-red-500">
                {errors.amount}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Category</Label>

            <Select
              value={formData.category}
              onValueChange={value =>
                handleChange(
                  "category",
                  value
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>

              <SelectContent className="dark:bg-gray-900 bg-white">
                {categories.map(category => (
                  <SelectItem
                    key={category.value}
                    value={category.value}
                  >
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Paid By{" "}
              <span className="text-red-500">
                *
              </span>
            </Label>

            <Select
              value={formData.paidBy}
              onValueChange={value =>
                handleChange(
                  "paidBy",
                  value
                )
              }
            >
              <SelectTrigger
                className={
                  errors.paidBy
                    ? "border-red-500"
                    : ""
                }
              >
                <SelectValue placeholder="Who paid?" />
              </SelectTrigger>

              <SelectContent className="dark:bg-gray-900 bg-white">
                {trip.members?.map(
                  member =>
                    member.id && (
                      <SelectItem
                        key={member.id}
                        value={member.id}
                      >
                        {member.name}
                        {member.id ===
                          currentUser?.id &&
                          " (you)"}
                      </SelectItem>
                    )
                )}
              </SelectContent>
            </Select>

            {errors.paidBy && (
              <p className="text-xs text-red-500">
                {errors.paidBy}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Split Between{" "}
              <span className="text-red-500">
                *
              </span>
            </Label>

            <div className="space-y-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3">
              {trip.members?.map(member => {
                if (!member.id) return null;

                const selected =
                  formData.splitBetween.includes(
                    member.id
                  );

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3"
                  >
                    <Checkbox
                      id={`split-${member.id}`}
                      checked={selected}
                      onCheckedChange={() =>
                        handleSplitToggle(
                          member.id!
                        )
                      }
                    />

                    <Label
                      htmlFor={`split-${member.id}`}
                      className="flex-1 cursor-pointer text-sm"
                    >
                      {member.name}

                      {member.id ===
                        currentUser?.id && (
                        <span className="ml-1 text-xs text-gray-400">
                          (you)
                        </span>
                      )}
                    </Label>

                    {selected && (
                      <div className="relative w-28">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          ₹
                        </span>

                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0"
                          value={
                            formData.splits[
                              member.id
                            ] || ""
                          }
                          onChange={e =>
                            handleSplitChange(
                              member.id!,
                              e.target.value
                            )
                          }
                          className="h-9 pl-6"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {errors.splitBetween && (
              <p className="text-xs text-red-500">
                {errors.splitBetween}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description (Optional)
            </Label>

            <Textarea
              id="description"
              placeholder="Add any additional details..."
              value={formData.description}
              onChange={e =>
                handleChange(
                  "description",
                  e.target.value
                )
              }
              className="min-h-[80px] resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() =>
              handleOpenChange(false)
            }
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