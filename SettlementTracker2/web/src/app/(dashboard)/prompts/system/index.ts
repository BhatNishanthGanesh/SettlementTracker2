// prompts/system/index.ts
import { SystemPromptConfig, PromptTemplate, PromptContext } from '../types';
import { PROMPT_CONTEXTS } from './contexts';

export const SYSTEM_PROMPTS: Record<string, SystemPromptConfig> = {
  DEFAULT: {
    name: 'default',
    version: '1.0.0',
    content: PROMPT_CONTEXTS.DEFAULT.systemPrompt,
  },
  EXPERT: {
    name: 'expert',
    version: '1.0.0',
    content: PROMPT_CONTEXTS.EXPERT.systemPrompt,
  },
  CONCISE: {
    name: 'concise',
    version: '1.0.0',
    content: PROMPT_CONTEXTS.CONCISE.systemPrompt,
  },
  FRIENDLY: {
    name: 'friendly',
    version: '1.0.0',
    content: PROMPT_CONTEXTS.FRIENDLY.systemPrompt,
  },
  TECHNICAL: {
    name: 'technical',
    version: '1.0.0',
    content: PROMPT_CONTEXTS.TECHNICAL.systemPrompt,
  },
  ONBOARDING: {
    name: 'onboarding',
    version: '1.0.0',
    content: PROMPT_CONTEXTS.ONBOARDING.systemPrompt,
  },
  TRAVEL: {
    name: 'travel',
    version: '1.0.0',
    content: PROMPT_CONTEXTS.TRAVEL.systemPrompt,
  },
  ANALYTICS: {
    name: 'analytics',
    version: '1.0.0',
    content: PROMPT_CONTEXTS.ANALYTICS.systemPrompt,
  },
};

// Export contexts for use in the API
export { PROMPT_CONTEXTS };