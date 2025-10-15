import { env } from './env';

export interface LLMConfig {
  models: {
    brainAgent: string;
    analystAgent: string;
    pmAgent: string;
    architectAgent: string;
    validatorAgent: string;
  };

  apiKeys: {
    openai: string;
    google: string;
    anthropic?: string;
  };
  settings: {
    temperature: number;
    maxTokens: number;
    timeout: number;
  };
}

export const llmConfig: LLMConfig = {
  models: {
    brainAgent: env.LLM_MODEL,
    analystAgent: env.LLM_MODEL,
    pmAgent: env.LLM_MODEL,
    architectAgent: env.LLM_MODEL,
    validatorAgent: env.LLM_MODEL,
  },
  
  apiKeys: {
    openai: env.OPENAI_API_KEY,
    google: env.GOOGLE_API_KEY || '',
    anthropic: env.ANTHROPIC_API_KEY || '',
  },

  settings: {
    temperature: 0.7,
    maxTokens: 4000,
    timeout: 30000,
  },
}

export const getModelForAgent = (agentType: keyof LLMConfig['models']): string => {
  return llmConfig.models[agentType];
};