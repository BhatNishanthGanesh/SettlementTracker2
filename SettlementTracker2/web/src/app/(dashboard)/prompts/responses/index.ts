// prompts/responses/index.ts
import { RESPONSE_TEMPLATES, QUICK_REPLY_TEMPLATES } from '../system/templates';
import { QueryValidator } from '../validators';

export class ResponseGenerator {
  static generateUnrelatedResponse(): string {
    return RESPONSE_TEMPLATES.UNRELATED_QUERY;
  }

  static generateQuickReplies(message: string): string[] {
    const queryType = QueryValidator.getQueryType(message);
    
    switch (queryType) {
      case 'expense':
        return QUICK_REPLY_TEMPLATES.EXPENSE;
      case 'trip':
        return QUICK_REPLY_TEMPLATES.TRIP;
      case 'budget':
        return QUICK_REPLY_TEMPLATES.BUDGET;
      case 'category':
        return QUICK_REPLY_TEMPLATES.CATEGORY;
      default:
        return QUICK_REPLY_TEMPLATES.DEFAULT;
    }
  }

  static formatExpenseSummary(data: any): string {
    const categories = data.categories
      .slice(0, 3)
      .map(([cat, amount]: [string, number]) => `• ${cat}: ₹${amount.toLocaleString()}`)
      .join('\n');

    return RESPONSE_TEMPLATES.EXPENSE_SUMMARY
      .replace('{{totalSpent}}', data.totalSpent.toLocaleString())
      .replace('{{totalExpenses}}', data.totalExpenses)
      .replace('{{totalTrips}}', data.totalTrips)
      .replace('{{categories}}', categories || 'No categories yet')
      .replace('{{insight}}', data.insight || 'Keep tracking your expenses for better insights!');
  }

  static formatBudgetAnalysis(data: any): string {
    return RESPONSE_TEMPLATES.BUDGET_ANALYSIS
      .replace('{{alert}}', data.alert || 'ℹ️ Budget Status')
      .replace('{{budget}}', data.budget.toLocaleString())
      .replace('{{spent}}', data.spent.toLocaleString())
      .replace('{{remaining}}', data.remaining.toLocaleString())
      .replace('{{percent}}', data.percent?.toString() || '0')
      .replace('{{recommendation}}', data.recommendation || '');
  }

  static formatTripSummary(data: any): string {
    return RESPONSE_TEMPLATES.TRIP_SUMMARY
      .replace('{{tripName}}', data.name)
      .replace('{{destination}}', data.destination || '')
      .replace('{{startDate}}', data.startDate || 'N/A')
      .replace('{{endDate}}', data.endDate || 'N/A')
      .replace('{{budget}}', data.budget?.toLocaleString() || '0')
      .replace('{{spent}}', data.spent?.toLocaleString() || '0')
      .replace('{{members}}', data.members?.join(', ') || 'None')
      .replace('{{expenseCount}}', data.expenseCount || '0')
      .replace('{{details}}', data.details || '');
  }
}