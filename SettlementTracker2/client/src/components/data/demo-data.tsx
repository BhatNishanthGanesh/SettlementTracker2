
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