
export const expenses = [
  { id: 1, name: "Hotel booking", by: "Arjun", initials: "AK", color: "#7C3AED", bg: "#EDE9FE", amount: 6200 },
  { id: 2, name: "Beach shack dinner", by: "Sara", initials: "SK", color: "#0D9488", bg: "#CCFBF1", amount: 3800 },
  { id: 3, name: "Taxi & fuel", by: "Priya", initials: "PR", color: "#DC2626", bg: "#FEE2E2", amount: 4100 },
  { id: 4, name: "Water sports", by: "Rahul", initials: "RV", color: "#D97706", bg: "#FEF3C7", amount: 4300 },
];

export const settlements = [
  { from: "AK", fromName: "Arjun", to: "SK", toName: "Sara", amount: 450, fromColor: "#7C3AED", fromBg: "#EDE9FE" },
  { from: "SK", fromName: "Sara", to: "PR", toName: "Priya", amount: 225, fromColor: "#0D9488", fromBg: "#CCFBF1" },
  { from: "RV", fromName: "Rahul", to: "AK", toName: "Arjun", amount: 680, fromColor: "#D97706", fromBg: "#FEF3C7" },
];

export const tripMembers = [
  {
    initials: "NB",
    gradient: "from-purple-500 to-indigo-500",
  },
  {
    initials: "AR",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    initials: "SK",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    initials: "VK",
    gradient: "from-blue-500 to-indigo-500",
  },
];

export const getInsights = ( 
  avgPerPerson: number,
  avgPerExpense: number,
  expenseCount: number) => [
    `💰 Average spend per person: ₹${Math.round(avgPerPerson).toLocaleString(
      "en-IN"
    )}`,
    `📊 Average per expense: ₹${Math.round(avgPerExpense).toLocaleString(
      "en-IN"
    )}`,
    `📝 You've logged ${expenseCount} expenses so far`,
  ];

  export const features = [
  {
    icon: "👥",
    title: "Group management",
    desc: "Create a group, invite people by link or email. Anyone can join and add expenses.",
    color: "violet",
  },
  {
    icon: "➕",
    title: "Add expenses instantly",
    desc: "Log what was spent, who paid, and who's included. Works for unequal splits too.",
    color: "teal",
  },
  {
    icon: "🧮",
    title: "Smart settlement",
    desc: "Our algorithm minimises total transactions. 6 debts can become just 3 payments.",
    color: "amber",
  },
  {
    icon: "📊",
    title: "Expense breakdown",
    desc: "See category-wise spending — food, travel, stay — so you know where money went.",
    color: "red",
  },
  {
    icon: "🤖",
    title: "AI Spending Assistant",
    desc: "Get smart insights on your spending pattern to stay on budget.",
    color: "violet",
  },
  {
    icon: "✅",
    title: "Mark as settled",
    desc: "Once paid, mark it done. The balance updates for everyone in real time.",
    color: "teal",
  },
];

export const cardStyles = {
  violet:
    "bg-violet-500/10 border border-violet-500/20",
  teal:
    "bg-teal-600/10 border border-teal-600/20",
  amber:
    "bg-amber-600/10 border border-amber-600/20",
  red:
    "bg-red-600/10 border border-red-600/20",
};

export const steps = [
  {
    step: "01",
    title: "Create a trip",
    desc: "Name your trip, pick dates. You get a shareable link instantly — no app download for members.",
  },
  {
    step: "02",
    title: "Set your budget",
    desc: "Enter your estimated trip budget. Our AI will track your spending and alert you if you're going over.",
  },
  {
    step: "03",
    title: "Log expenses as you go",
    desc: "Add expenses on the fly. Pick who paid, split equally or by custom amounts per person.",
  },
  {
    step: "04",
    title: "Get AI insights",
    desc: "Our AI analyzes your spending patterns and gives you smart recommendations to stay on track.",
  },
  {
    step: "05",
    title: "Pay and mark settled",
    desc: "Pay via any UPI app. Come back and mark it settled. Everyone sees the updated balance.",
  },
];

export const stats = [
  {
    num: 24000,
    suffix: "+",
    label: "Expenses tracked",
    prefix: "",
  },
  {
    num: 18,
    suffix: "Cr+",
    label: "Total amount split",
    prefix: "₹",
  },
  {
    num: 99,
    suffix: "%",
    label: "Settlement accuracy",
    prefix: "",
  },
];

export const useCases = [
  "Dorms",
  "Office Trips",
  "Weddings",
  "Backpacking",
  "Weekend Getaways",
  "Friend Circles",
];