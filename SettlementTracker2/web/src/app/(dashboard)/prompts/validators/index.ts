// prompts/validators/index.ts
import { PROJECT_KEYWORDS, GREETING_KEYWORDS, GENERAL_QUESTION_PATTERNS } from './keywords';

export class QueryValidator {
  static isProjectRelated(message: string): boolean {
    const lowerMsg = message.toLowerCase();
    
    // Check if it's a greeting
    if (GREETING_KEYWORDS.some(g => lowerMsg.includes(g))) {
      return true;
    }

    // Check if it's a general question without project keywords
    const isGeneralQuestion = GENERAL_QUESTION_PATTERNS.some(pattern => 
      lowerMsg.includes(pattern)
    );

    if (isGeneralQuestion) {
      // Check if it has any project keywords
      const hasProjectKeyword = Object.values(PROJECT_KEYWORDS)
        .flat()
        .some(keyword => lowerMsg.includes(keyword));
      
      if (!hasProjectKeyword) {
        return false;
      }
    }

    // Check if message has any project keywords
    const hasKeyword = Object.values(PROJECT_KEYWORDS)
      .flat()
      .some(keyword => lowerMsg.includes(keyword));

    return hasKeyword || lowerMsg.length < 20;
  }

  static getQueryType(message: string): string {
    const lowerMsg = message.toLowerCase();
    
    if (this.matchesAny(lowerMsg, ['spent', 'expense', 'spending', 'total'])) {
      return 'expense';
    }
    if (this.matchesAny(lowerMsg, ['trip', 'travel', 'vacation', 'destination'])) {
      return 'trip';
    }
    if (this.matchesAny(lowerMsg, ['budget', 'alert', 'remaining', 'over budget'])) {
      return 'budget';
    }
    if (this.matchesAny(lowerMsg, ['category', 'where', 'spending on'])) {
      return 'category';
    }
    if (this.matchesAny(lowerMsg, ['tip', 'save', 'saving', 'advice', 'improve'])) {
      return 'tips';
    }
    
    return 'unknown';
  }

  private static matchesAny(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }
}