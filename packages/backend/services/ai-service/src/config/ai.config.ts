import { AIProvider, AIServiceConfig } from '@/types/ai.types';
import dotenv from 'dotenv';

dotenv.config();

export const AI_CONFIG: Record<AIProvider, AIServiceConfig> = {
  [AIProvider.DEEPINFRA]: {
    provider: AIProvider.DEEPINFRA,
    apiKey: process.env.DEEPINFRA_API_KEY || '',
    baseURL: process.env.DEEPINFRA_BASE_URL || 'https://api.deepinfra.com/v1/openai',
    model: process.env.DEEPINFRA_DEFAULT_MODEL || 'Qwen/Qwen2.5-32B-Instruct',
    maxTokens: parseInt(process.env.DEEPINFRA_MAX_TOKENS || '4000'),
    temperature: parseFloat(process.env.DEEPINFRA_TEMPERATURE || '0.7'),
    timeout: parseInt(process.env.DEEPINFRA_TIMEOUT || '30000'),
    priority: 2,
    cost: 'low',
    enabled: true
  },

  [AIProvider.OPENAI]: {
    provider: AIProvider.OPENAI,
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
    temperature: 0.7,
    timeout: 30000,
    priority: 1,
    cost: 'medium',
    dailyLimit: 100,
    enabled: !!process.env.OPENAI_API_KEY
  },

  [AIProvider.GOOGLE_GEMINI]: {
    provider: AIProvider.GOOGLE_GEMINI,
    apiKey: process.env.GOOGLE_AI_API_KEY || '',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    model: process.env.GOOGLE_MODEL || 'gemini-pro',
    maxTokens: 2000,
    temperature: 0.7,
    timeout: 30000,
    priority: 3,
    cost: 'free',
    dailyLimit: 500,
    enabled: !!process.env.GOOGLE_AI_API_KEY
  },

  [AIProvider.ANTHROPIC_CLAUDE]: {
    provider: AIProvider.ANTHROPIC_CLAUDE,
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    baseURL: 'https://api.anthropic.com/v1',
    model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
    maxTokens: 2000,
    temperature: 0.7,
    timeout: 30000,
    priority: 4,
    cost: 'low',
    dailyLimit: 200,
    enabled: !!process.env.ANTHROPIC_API_KEY
  },

  [AIProvider.COHERE]: {
    provider: AIProvider.COHERE,
    apiKey: process.env.COHERE_API_KEY || '',
    baseURL: 'https://api.cohere.ai/v1',
    model: process.env.COHERE_MODEL || 'command-light',
    maxTokens: 2000,
    temperature: 0.7,
    timeout: 30000,
    priority: 5,
    cost: 'free',
    dailyLimit: 300,
    enabled: !!process.env.COHERE_API_KEY
  }
};

export const SERVICE_CONFIG = {
  port: parseInt(process.env.PORT || '5003'),
  nodeEnv: process.env.NODE_ENV || 'development',
  serviceName: process.env.SERVICE_NAME || 'ai-service',
  version: process.env.SERVICE_VERSION || '1.0.0',
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    tokensPerMinute: parseInt(process.env.RATE_LIMIT_TOKENS_PER_MINUTE || '100000')
  },

  cache: {
    ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '3600'),
    maxKeys: parseInt(process.env.CACHE_MAX_KEYS || '1000')
  },

  costOptimization: {
    enabled: process.env.COST_OPTIMIZATION_ENABLED === 'true',
    dailyTokenLimit: parseInt(process.env.DAILY_TOKEN_LIMIT || '1000000'),
    costThresholdUSD: parseFloat(process.env.COST_THRESHOLD_USD || '10.00')
  },

  monitoring: {
    logLevel: process.env.LOG_LEVEL || 'info',
    metricsEnabled: process.env.METRICS_ENABLED === 'true',
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000')
  }
};

// Cost per token estimates (USD)
export const COST_PER_TOKEN: Record<AIProvider, { input: number; output: number }> = {
  [AIProvider.DEEPINFRA]: { input: 0.00000027, output: 0.00000027 },
  [AIProvider.OPENAI]: { input: 0.0000015, output: 0.000002 },
  [AIProvider.GOOGLE_GEMINI]: { input: 0, output: 0 }, // Free tier
  [AIProvider.ANTHROPIC_CLAUDE]: { input: 0.00000025, output: 0.00000125 },
  [AIProvider.COHERE]: { input: 0, output: 0 } // Free tier
};

export function getEnabledProviders(): AIProvider[] {
  return Object.values(AIProvider).filter(provider => 
    AI_CONFIG[provider].enabled && AI_CONFIG[provider].apiKey
  );
}

export function getProviderByPriority(): AIProvider[] {
  return getEnabledProviders().sort((a, b) => 
    AI_CONFIG[a].priority - AI_CONFIG[b].priority
  );
}