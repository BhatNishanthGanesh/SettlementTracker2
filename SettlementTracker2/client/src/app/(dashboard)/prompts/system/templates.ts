// prompts/system/templates.ts
export const RESPONSE_TEMPLATES = {
  EXPENSE_SUMMARY: `
📊 **Spending Overview**

💰 **Total Spent:** ₹{{totalSpent}}
📝 **Total Expenses:** {{totalExpenses}}
✈️ **Total Trips:** {{totalTrips}}

**Top Categories:**
{{categories}}

💡 **Insight:** {{insight}}
`,
  
  BUDGET_ANALYSIS: `
📋 **Budget Analysis**

{{alert}}

💰 **Budget:** ₹{{budget}}
💸 **Spent:** ₹{{spent}}
📊 **Remaining:** ₹{{remaining}}
📈 **Progress:** {{percent}}%

{{recommendation}}
`,
  
  TRIP_SUMMARY: `
✈️ **Trip Overview**

**{{tripName}}** {{destination}}
📅 {{startDate}} - {{endDate}}
💰 Budget: ₹{{budget}} | Spent: ₹{{spent}}
👥 Members: {{members}}
📝 Expenses: {{expenseCount}}

{{details}}
`,
  
  UNRELATED_QUERY: `
🤔 I'm your travel expense assistant, so I can only help with questions about your trips, expenses, and budgets. 

Feel free to ask me about:
• 💰 Your spending summary
• ✈️ Your trips and destinations
• 📊 Budget analysis
• 📂 Expense categories
• 💡 Saving tips based on your spending

What would you like to know about your expenses?
`,
  
  CATEGORY_BREAKDOWN: `
📊 **Category Breakdown**

{{categoryList}}

🏆 **Top Category:** {{topCategory}} (₹{{topAmount}})
📉 **Lowest:** {{lowestCategory}} (₹{{lowestAmount}})
`,
};

export const QUICK_REPLY_TEMPLATES = {
  EXPENSE: ['Show by category', 'Trip breakdown', 'Budget status'],
  TRIP: ['Trip details', 'Expense breakdown', 'Add trip'],
  BUDGET: ['Budget tips', 'Spending trends', 'Save money'],
  CATEGORY: ['Top categories', 'Spending breakdown', 'Monthly trends'],
  DEFAULT: ['How much have I spent?', 'Show my trips', 'Budget status', 'Category breakdown'],
};