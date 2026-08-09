import React, { useState } from "react";

interface BudgetTrackerProps {
  totalSpent: number;
  estimatedBudget: number;
}

export function BudgetTracker({
  totalSpent,
  estimatedBudget,
}: BudgetTrackerProps) {
  const [budget, setBudget] = useState(estimatedBudget);
  const [editing, setEditing] = useState(false);
  const [tempBudget, setTempBudget] = useState(estimatedBudget);

  const percentage = Math.min((totalSpent / budget) * 100, 100);
  const remaining = Math.max(budget - totalSpent, 0);
  const isOverBudget = totalSpent > budget;

  const handleSaveBudget = () => {
    setBudget(tempBudget);
    setEditing(false);
  };

  return (
    <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="mb-1 text-xs text-white/50">Trip Budget</p>

          {editing ? (
            <div className="flex items-center gap-2">
              <span className="text-white/40">₹</span>

              <input
                type="number"
                value={tempBudget}
                onChange={(e) => setTempBudget(Number(e.target.value))}
                autoFocus
                className="w-32 rounded-md border border-violet-500/30 bg-white/5 px-2 py-1 text-sm text-white outline-none transition focus:border-violet-500"
              />

              <button
                onClick={handleSaveBudget}
                className="rounded-md bg-violet-600 px-3 py-1 text-xs text-white transition hover:bg-violet-500"
              >
                Save
              </button>

              <button
                onClick={() => {
                  setTempBudget(budget);
                  setEditing(false);
                }}
                className="rounded-md border border-white/10 px-3 py-1 text-xs text-white/50 transition hover:border-white/20 hover:text-white/80"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                ₹{budget.toLocaleString("en-IN")}
              </span>

              <button
                onClick={() => setEditing(true)}
                className="rounded border border-white/10 px-2.5 py-1 text-[11px] text-white/40 transition hover:border-violet-500/40 hover:text-violet-300"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        <div className="text-right">
          <p className="text-xs text-white/50">Remaining</p>

          <p
            className={`text-xl font-bold ${
              isOverBudget ? "text-red-500" : "text-emerald-400"
            }`}
          >
            {isOverBudget ? "-" : "₹"}
            {isOverBudget
              ? (totalSpent - budget).toLocaleString("en-IN")
              : remaining.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isOverBudget
              ? "bg-gradient-to-r from-red-500 to-red-600"
              : percentage > 80
              ? "bg-gradient-to-r from-amber-500 to-red-500"
              : "bg-gradient-to-r from-violet-600 to-fuchsia-500"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="mt-1.5 flex justify-between text-[11px] text-white/35">
        <span>₹0</span>
        <span>
          {isOverBudget
            ? "Over budget!"
            : `${Math.round(percentage)}% used`}
        </span>
        <span>₹{budget.toLocaleString("en-IN")}</span>
      </div>

      {isOverBudget && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2">
          <span className="text-base">⚠️</span>

          <span className="text-sm text-red-300">
            You've exceeded your budget by ₹
            {(totalSpent - budget).toLocaleString("en-IN")}
          </span>
        </div>
      )}
    </div>
  );
}