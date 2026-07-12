import {FadeInUp} from "../animations/FadeInUp";

interface AIInsightProps {
  totalSpent: number;
  budget: number;
  expenseCount: number;
  peopleCount: number;
}

export function AIInsights({ totalSpent, budget, expenseCount, peopleCount }: AIInsightProps) {
  const avgPerPerson = totalSpent / peopleCount;
  const avgPerExpense = totalSpent / expenseCount;

  const insights = [
    `💰 Average spend per person: ₹${Math.round(avgPerPerson).toLocaleString("en-IN")}`,
    `📊 Average per expense: ₹${Math.round(avgPerExpense).toLocaleString("en-IN")}`,
    `📝 You've logged ${expenseCount} expenses so far`,
  ];


  return (
    <div style={{ 
      background: "rgba(124,58,237,0.06)", 
      border: "1px solid rgba(124,58,237,0.15)", 
      borderRadius: 16, 
      padding: "1.25rem",
      height: "100%",
      display: "flex",
      flexDirection: "column"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
        <div style={{ 
          width: 40, 
          height: 40, 
          borderRadius: "50%", 
          background: "linear-gradient(135deg, #7C3AED, #A855F7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20
        }}>
          🤖
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>AI Spending Assistant</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Smart insights for your trip</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        {insights.map((insight, i) => (
          <FadeInUp key={i} delay={i * 80}>
            <div style={{ 
              padding: "6px 10px", 
              background: "rgba(255,255,255,0.03)", 
              borderRadius: 6,
              fontSize: 12,
              color: "rgba(255,255,255,0.8)",
              borderLeft: "2px solid rgba(124,58,237,0.3)"
            }}>
              {insight}
            </div>
          </FadeInUp>
        ))}
        <div style={{ 
          marginTop: "auto",
          paddingTop: 8,
          padding: "6px 10px", 
          background: "rgba(124,58,237,0.08)", 
          borderRadius: 6,
          fontSize: 10,
          color: "rgba(255,255,255,0.4)",
          fontStyle: "italic"
        }}>
          💡 AI-powered recommendations based on your spending patterns
        </div>
      </div>
    </div>
  );
}