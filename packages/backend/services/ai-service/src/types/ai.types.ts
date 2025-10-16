import { z } from 'zod';

// AI Service Provider Types
export enum AIProvider {
  DEEPINFRA = 'deepinfra',
  OPENAI = 'openai',
  GOOGLE_GEMINI = 'google-gemini',
  ANTHROPIC_CLAUDE = 'anthropic-claude',
  COHERE = 'cohere'
}

export interface AIServiceConfig {
  provider: AIProvider;
  apiKey: string;
  baseURL?: string;
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
  priority: number;
  cost: 'free' | 'low' | 'medium' | 'high';
  dailyLimit?: number;
  enabled: boolean;
}

export interface AIRequest {
  id: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  metadata?: Record<string, any>;
  userId?: string;
  requestType: AIRequestType;
}

export enum AIRequestType {
  FORTUNE_INTERPRETATION = 'fortune_interpretation',
  DIARY_INSIGHTS = 'diary_insights',
  DAILY_ADVICE = 'daily_advice',
  COMPATIBILITY_ANALYSIS = 'compatibility_analysis',
  CAREER_GUIDANCE = 'career_guidance',
  HEALTH_ADVICE = 'health_advice',
  TAROT = 'tarot'
}

export interface AIResponse {
  id: string;
  provider: AIProvider;
  model: string;
  content: string;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: number;
  responseTime: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface AIServiceStatus {
  provider: AIProvider;
  isHealthy: boolean;
  lastCheck: Date;
  responseTime: number;
  errorCount: number;
  successRate: number;
  tokensUsedToday: number;
  costToday: number;
  remainingQuota?: number;
}

// Saju-specific Types for AI Processing
export interface SajuData {
  fourPillars: {
    year: { stem: string; branch: string; };
    month: { stem: string; branch: string; };
    day: { stem: string; branch: string; };
    hour: { stem: string; branch: string; };
  };
  tenGods: string[];
  spiritGods: Array<{ name: string; type: 'auspicious' | 'inauspicious'; }>;
  elements: {
    primary: string;
    secondary: string;
    weakness: string;
    strength: string;
  };
  currentAge: number;
  gender: 'male' | 'female';
}

export interface FortuneInterpretationRequest extends AIRequest {
  sajuData: SajuData;
  targetDate: string;
  interpretationType: 'daily' | 'weekly' | 'monthly' | 'yearly';
  profession?: string;
  focusAreas?: string[];
}

export interface DiaryInsightRequest extends AIRequest {
  diaryContent: string;
  mood: number; // 1-5 scale
  sajuData: SajuData;
  previousInsights?: string[];
}

// Validation Schemas
export const SajuDataSchema = z.object({
  fourPillars: z.object({
    year: z.object({ stem: z.string(), branch: z.string() }),
    month: z.object({ stem: z.string(), branch: z.string() }),
    day: z.object({ stem: z.string(), branch: z.string() }),
    hour: z.object({ stem: z.string(), branch: z.string() })
  }),
  tenGods: z.array(z.string()),
  spiritGods: z.array(z.object({
    name: z.string(),
    type: z.enum(['auspicious', 'inauspicious'])
  })),
  elements: z.object({
    primary: z.string(),
    secondary: z.string(),
    weakness: z.string(),
    strength: z.string()
  }),
  currentAge: z.number().min(1).max(120),
  gender: z.enum(['male', 'female'])
});

export const AIRequestSchema = z.object({
  systemPrompt: z.string().min(1).max(2000),
  userPrompt: z.string().min(1).max(5000),
  maxTokens: z.number().min(100).max(8000).optional(),
  temperature: z.number().min(0).max(2).optional(),
  metadata: z.record(z.any()).optional(),
  userId: z.string().optional(),
  requestType: z.nativeEnum(AIRequestType)
});

export const FortuneInterpretationSchema = AIRequestSchema.extend({
  sajuData: SajuDataSchema,
  targetDate: z.string().datetime(),
  interpretationType: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  profession: z.string().optional(),
  focusAreas: z.array(z.string()).optional()
});

export const DiaryInsightSchema = AIRequestSchema.extend({
  diaryContent: z.string().min(1).max(10000),
  mood: z.number().min(1).max(5),
  sajuData: SajuDataSchema,
  previousInsights: z.array(z.string()).optional()
});

// Error Types
export class AIServiceError extends Error {
  constructor(
    message: string,
    public provider: AIProvider,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

export class AIRateLimitError extends AIServiceError {
  constructor(provider: AIProvider, resetTime?: Date) {
    super(`Rate limit exceeded for ${provider}`, provider, 'RATE_LIMIT_EXCEEDED', 429);
    this.name = 'AIRateLimitError';
  }
}

export class AIQuotaExceededError extends AIServiceError {
  constructor(provider: AIProvider) {
    super(`Quota exceeded for ${provider}`, provider, 'QUOTA_EXCEEDED', 402);
    this.name = 'AIQuotaExceededError';
  }
}

export class AIServiceUnavailableError extends AIServiceError {
  constructor(provider: AIProvider) {
    super(`Service unavailable: ${provider}`, provider, 'SERVICE_UNAVAILABLE', 503);
    this.name = 'AIServiceUnavailableError';
  }
}