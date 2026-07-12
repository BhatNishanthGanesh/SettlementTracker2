
import React, { useState } from "react";

interface BudgetTrackerProps {
  totalSpent: number;
  estimatedBudget: number;
}

export function BudgetTracker({ totalSpent, estimatedBudget }: BudgetTrackerProps) {
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
    <div style={{ 
      background: "rgba(255,255,255,0.03)", 
      border: "1px solid rgba(255,255,255,0.08)", 
      borderRadius: 16, 
      padding: "1.5rem",
      marginBottom: "1.5rem"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Trip Budget</div>
          {editing ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>₹</span>
              <input
                type="number"
                value={tempBudget}
                onChange={(e) => setTempBudget(Number(e.target.value))}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(124,58,237,0.3)",
                  borderRadius: 6,
                  padding: "4px 8px",
                  color: "#fff",
                  fontSize: 14,
                  width: 120,
                  outline: "none"
                }}
                autoFocus
              />
              <button
                onClick={handleSaveBudget}
                style={{
                  background: "#7C3AED",
                  border: "none",
                  color: "#fff",
                  padding: "4px 12px",
                  borderRadius: 6,
                  fontSize: 12,
                  cursor: "pointer"
                }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setTempBudget(budget);
                  setEditing(false);
                }}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.5)",
                  padding: "4px 12px",
                  borderRadius: 6,
                  fontSize: 12,
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 700 }}>₹{budget.toLocaleString("en-IN")}</span>
              <button
                onClick={() => setEditing(true)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.4)",
                  padding: "2px 10px",
                  borderRadius: 4,
                  fontSize: 11,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)";
                  e.currentTarget.style.color = "#A78BFA";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                }}
              >
                Edit
              </button>
            </div>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Remaining</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: isOverBudget ? "#EF4444" : "#34D399" }}>
            {isOverBudget ? "-" : "₹"}{isOverBudget ? (totalSpent - budget).toLocaleString("en-IN") : remaining.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      <div style={{ position: "relative", height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${Math.min(percentage, 100)}%`,
            background: isOverBudget 
              ? "linear-gradient(90deg, #EF4444, #DC2626)" 
              : percentage > 80 
                ? "linear-gradient(90deg, #F59E0B, #EF4444)"
                : "linear-gradient(90deg, #7C3AED, #A855F7)",
            borderRadius: 999,
            transition: "width 0.5s ease",
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
        <span>₹0</span>
        <span>{isOverBudget ? "Over budget!" : `${Math.round(percentage)}% used`}</span>
        <span>₹{budget.toLocaleString("en-IN")}</span>
      </div>

      {isOverBudget && (
        <div style={{ 
          marginTop: 12, 
          padding: "8px 12px", 
          background: "rgba(239,68,68,0.1)", 
          border: "1px solid rgba(239,68,68,0.2)", 
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <span style={{ fontSize: 16 }}>⚠️</span>
          <span style={{ fontSize: 13, color: "#FCA5A5" }}>
            You've exceeded your budget by ₹{(totalSpent - budget).toLocaleString("en-IN")}
          </span>
        </div>
      )}
    </div>
  );
}