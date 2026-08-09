import { FadeInUp } from "../animations/FadeInUp";
import {getInsights} from "@/components/landing/data/demo-data";

interface AIInsightProps {
  totalSpent: number;
  budget: number;
  expenseCount: number;
  peopleCount: number;
}

export function AIInsights({
  totalSpent,
  expenseCount,
  peopleCount,
}: AIInsightProps) {
  const avgPerPerson = totalSpent / peopleCount;
  const avgPerExpense = totalSpent / expenseCount;

  const insights=getInsights(avgPerPerson, avgPerExpense, expenseCount);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-violet-500/15 bg-violet-500/5 p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-xl">
          🤖
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">
            AI Spending Assistant
          </h3>
          <p className="text-xs text-white/40">
            Smart insights for your trip
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {insights.map((insight, i) => (
          <FadeInUp key={i} delay={i * 80}>
            <div className="rounded-md border-l-2 border-violet-500/30 bg-white/5 px-3 py-2 text-xs text-white/80">
              {insight}
            </div>
          </FadeInUp>
        ))}

        <div className="mt-auto rounded-md bg-violet-500/10 px-3 py-2 text-[10px] italic text-white/40">
          💡 AI-powered recommendations based on your spending patterns
        </div>
      </div>
    </div>
  );
}