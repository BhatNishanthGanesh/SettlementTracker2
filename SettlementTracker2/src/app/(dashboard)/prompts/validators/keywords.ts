// prompts/validators/keywords.ts
export const PROJECT_KEYWORDS = {
  // General
  general: [
    'trip', 'expense', 'budget', 'spent', 'spending', 'money', 'cost', 'price',
    'track', 'tracking', 'settle', 'settlement', 'payment', 'paid', 'pay',
    'balance', 'due', 'owe', 'debt', 'credit', 'bill',
  ],
  
  // Categories
  categories: [
    'food', 'transport', 'shopping', 'entertainment', 'accommodation', 'travel',
    'dining', 'hotel', 'flight', 'train', 'bus', 'taxi', 'rental', 'fuel',
    'grocery', 'restaurant', 'cafe', 'bar', 'movie', 'concert',
  ],
  
  // Actions
  actions: [
    'create', 'edit', 'delete', 'add', 'remove', 'update', 'manage', 'track',
    'view', 'show', 'list', 'find', 'search', 'filter', 'sort',
  ],
  
  // Status
  status: [
    'pending', 'overdue', 'settled', 'complete', 'finished', 'open', 'closed',
    'active', 'inactive', 'paid', 'unpaid', 'cleared',
  ],
  
  // Analytics
  analytics: [
    'average', 'total', 'summary', 'overview', 'breakdown', 'category',
    'analysis', 'trend', 'pattern', 'insight', 'report', 'chart', 'graph',
  ],
  
  // Trip related
  trip: [
    'destination', 'vacation', 'holiday', 'journey', 'tour', 'travel',
    'flight', 'hotel', 'resort', 'adventure', 'explore', 'visit',
  ],
  
  // People
  people: [
    'member', 'friend', 'group', 'companion', 'guest', 'partner',
    'participant', 'colleague', 'family',
  ],
  
  // Money
  money: [
    'currency', 'rupee', '₹', 'dollar', '$', 'euro', '€', 'amount', 'value',
    'worth', 'price', 'cost', 'fee', 'charge', 'expense',
  ],
};

export const GREETING_KEYWORDS = ['hello', 'hi', 'hey', 'greetings', 'sup', 'yo'];

export const GENERAL_QUESTION_PATTERNS = [
  'what is', 'who is', 'when is', 'where is', 'why is', 'how is',
  'tell me about', 'explain', 'define', 'describe',
  'what are', 'who are', 'when are', 'where are', 'why are', 'how are',
];