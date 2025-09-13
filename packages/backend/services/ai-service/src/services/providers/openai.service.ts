import OpenAI from 'openai';
import { 
  AIProvider, 
  AIRequest, 
  AIResponse, 
  AIServiceConfig,
  AIServiceError,
  AIRateLimitError,
  AIQuotaExceededError 
} from '@/types/ai.types';
import { COST_PER_TOKEN } from '@/config/ai.config';
import { logger } from '@/utils/logger';

export class OpenAIService {
  private client: OpenAI;
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
    
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.client = new OpenAI({
      apiKey: config.apiKey,
      timeout: config.timeout
    });
  }

  public async processRequest(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      logger.info(`Sending request to OpenAI with model: ${this.config.model}`);
      
      const completion = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: request.systemPrompt
          },
          {
            role: 'user',
            content: request.userPrompt
          }
        ],
        max_tokens: request.maxTokens || this.config.maxTokens,
        temperature: request.temperature ?? this.config.temperature,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      });

      const endTime = Date.now();
      return this.processResponse(request, completion, endTime - startTime);
      
    } catch (error) {
      logger.error('OpenAI request failed:', error);
      this.handleApiError(error);
      
      return {
        id: request.id,
        provider: AIProvider.OPENAI,
        model: this.config.model,
        content: '',
        tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        cost: 0,
        responseTime: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: request.metadata
      };
    }
  }

  private processResponse(
    request: AIRequest, 
    completion: OpenAI.Chat.Completions.ChatCompletion, 
    responseTime: number
  ): AIResponse {
    const choice = completion.choices[0];
    const usage = completion.usage;
    
    if (!choice || !choice.message) {
      throw new Error('No response content returned from OpenAI');
    }

    const tokenUsage = {
      promptTokens: usage?.prompt_tokens || 0,
      completionTokens: usage?.completion_tokens || 0,
      totalTokens: usage?.total_tokens || 0
    };

    const cost = this.calculateCost(tokenUsage);

    return {
      id: request.id,
      provider: AIProvider.OPENAI,
      model: this.config.model,
      content: choice.message.content || '',
      tokenUsage,
      cost,
      responseTime,
      success: true,
      metadata: {
        ...request.metadata,
        finishReason: choice.finish_reason,
        model: completion.model,
        created: completion.created
      }
    };
  }

  private calculateCost(tokenUsage: { promptTokens: number; completionTokens: number }): number {
    const costs = COST_PER_TOKEN[AIProvider.OPENAI];
    return (tokenUsage.promptTokens * costs.input) + (tokenUsage.completionTokens * costs.output);
  }

  private handleApiError(error: any): void {
    if (error instanceof OpenAI.APIError) {
      switch (error.status) {
        case 429:
          throw new AIRateLimitError(AIProvider.OPENAI);
        case 402:
        case 403:
          throw new AIQuotaExceededError(AIProvider.OPENAI);
        case 400:
          throw new AIServiceError(
            `Bad request: ${error.message}`,
            AIProvider.OPENAI,
            'BAD_REQUEST',
            400
          );
        case 401:
          throw new AIServiceError(
            'Unauthorized: Invalid API key',
            AIProvider.OPENAI,
            'UNAUTHORIZED',
            401
          );
        default:
          throw new AIServiceError(
            error.message,
            AIProvider.OPENAI,
            'API_ERROR',
            error.status
          );
      }
    } else {
      throw new AIServiceError(
        error.message,
        AIProvider.OPENAI,
        'UNKNOWN_ERROR'
      );
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [{ role: 'user', content: 'Hello, please respond with just "OK"' }],
        max_tokens: 10,
        temperature: 0
      });

      return completion.choices.length > 0 && completion.choices[0].message?.content;
    } catch (error) {
      logger.warn('OpenAI health check failed:', error);
      return false;
    }
  }

  public getConfig(): AIServiceConfig {
    return { ...this.config };
  }
}