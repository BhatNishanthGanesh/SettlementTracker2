// prompts/types.ts
export interface SystemPromptConfig {
  name: string;
  version: string;
  content: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
}

export interface PromptExample {
  user: string;
  assistant: string;
}

export interface PromptContext {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  examples: PromptExample[];
}

export interface ResponseContext {
  user: {
    name: string;
    email: string;
  };
  summary: {
    totalTrips: number;
    totalExpenses: number;
    totalSpent: number;
    categories: [string, number][];
    avgPerTrip: number;
  };
  trips: any[];
  query: string;
  queryType: string;
  contextType?: string; // Which context to use
}