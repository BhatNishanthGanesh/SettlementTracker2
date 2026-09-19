import { FadeInUp } from "../animations/FadeInUp";
import { ScaleIn } from "../animations/ScaleIn";
import { AnimatedCounter } from "../animations/AnimatedCounter";
import { expenses, settlements } from "./data/demo-data";
import { BudgetTracker } from "./BudgetTracker";
import { AIInsights } from "./AIInsights";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { tripMembers } from "./data/demo-data";

export default function Hero() {
    const [activeExpense, setActiveExpense] = useState<number | null>(null);

    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalPeople = 4;
    const estimatedBudget = 25000;

    return (
        <>
            <section className="max-w-[1300px] mx-auto px-8 py-[60px] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <FadeInUp delay={0}>
                    <div>
                        <h1 className="text-[clamp(36px,5vw,56px)] font-bold leading-[1.1] tracking-[-0.03em] mb-5">
                            Split trips.<br />
                            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                Not friendships.
                            </span>
                        </h1>
                        <p className="text-[17px] text-white/50 leading-relaxed mb-8 max-w-[420px]">
                            Track every shared expense on your trip. Settlement Tracker calculates who owes what and minimises the number of transactions to settle up.
                        </p>
                        <div className="flex gap-3 flex-wrap">
                            <a
                                href="https://drive.google.com/file/d/1NzFQlzzIDkeCvkbyHtEKBpbI9ZzOPEpg/view?usp=drive_link"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-purple-600 hover:bg-purple-500 border-none text-white px-6 py-3 rounded-xl text-[15px] font-semibold cursor-pointer flex items-center gap-2 transition-colors"
                            >
                                See a demo →
                            </a>
                        </div>
                    </div>
                </FadeInUp>

                {/* ── LIVE CARD ── */}
                <ScaleIn delay={200}>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl max-w-[560px] mx-auto">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2.5">
                                <div className="text-xl">🏖️</div>
                                <div>
                                    <div className="font-semibold text-sm">Goa Trip</div>
                                    <div className="text-xs text-white/40">4 people · Jun 14–18</div>
                                </div>
                            </div>
                            <div className="bg-purple-500/25 text-purple-400 text-xs font-medium px-2.5 py-1 rounded-full">
                                ₹<AnimatedCounter end={totalSpent} duration={1500} />
                            </div>
                        </div>

                        {/* Budget Tracker */}
                        <BudgetTracker totalSpent={totalSpent} estimatedBudget={estimatedBudget} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <AIInsights
                                totalSpent={totalSpent}
                                budget={estimatedBudget}
                                expenseCount={expenses.length}
                                peopleCount={totalPeople}
                            />
                            <div>
                                <div className="flex flex-col gap-0.5 mb-3">
                                    {expenses.map(exp => (
                                        <div
                                            key={exp.id}
                                            onClick={() => setActiveExpense(activeExpense === exp.id ? null : exp.id)}
                                            className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${activeExpense === exp.id ? "bg-white/10" : "bg-transparent hover:bg-white/5"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-6.5 h-6.5 rounded-full flex items-center justify-center text-[9px] font-semibold"
                                                    style={{
                                                        background: exp.bg + "22",
                                                        border: `1px solid ${exp.color}44`,
                                                        color: exp.color
                                                    }}
                                                >
                                                    {exp.initials}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-medium">{exp.name}</div>
                                                    <div className="text-[10px] text-white/35">paid by {exp.by}</div>
                                                </div>
                                            </div>
                                            <div className="font-semibold text-[13px]">₹{exp.amount.toLocaleString("en-IN")}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-white/10 pt-3">
                                    <div className="text-[10px] text-white/35 uppercase tracking-[0.08em] mb-1.5">Settle up</div>
                                    {settlements.map((s, i) => (
                                        <div key={i} className="flex items-center gap-1.5 mb-1">
                                            <div
                                                className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-semibold"
                                                style={{
                                                    background: s.fromBg + "22",
                                                    border: `1px solid ${s.fromColor}44`,
                                                    color: s.fromColor
                                                }}
                                            >
                                                {s.from}
                                            </div>
                                            <span className="text-[11px] text-white/55">{s.fromName}</span>
                                            <span className="text-white/20 text-[10px]">owes</span>
                                            <span className="text-[11px] text-white/55">{s.toName}</span>
                                            <div className="ml-auto font-semibold text-xs text-purple-400">₹{s.amount}</div>
                                            <div className="bg-purple-500/20 border border-purple-500/30 text-purple-400 text-[10px] px-2 py-0.5 rounded-full cursor-pointer hover:bg-purple-500/30 transition-colors">
                                                Pay
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </ScaleIn>
            </section>
        </>
    );
}