import axios, { AxiosInstance, AxiosError } from 'axios';
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

export class ClaudeService {
  private client: AxiosInstance;
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
    
    if (!config.apiKey) {
      throw new Error('Anthropic API key is required');
    }

    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'User-Agent': 'SajuApp-AI-Service/1.0.0'
      }
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  public async processRequest(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const payload = this.buildRequestPayload(request);
      logger.info(`Sending request to Anthropic Claude with model: ${this.config.model}`);
      
      const response = await this.client.post('/messages', payload);
      const endTime = Date.now();
      
      return this.processResponse(request, response.data, endTime - startTime);
      
    } catch (error) {
      logger.error('Claude request failed:', error);
      
      return {
        id: request.id,
        provider: AIProvider.ANTHROPIC_CLAUDE,
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

  private buildRequestPayload(request: AIRequest): any {
    return {
      model: this.config.model,
      max_tokens: request.maxTokens || this.config.maxTokens,
      temperature: request.temperature ?? this.config.temperature,
      system: request.systemPrompt,
      messages: [
        {
          role: 'user',
          content: request.userPrompt
        }
      ],
      stop_sequences: []
    };
  }

  private processResponse(request: AIRequest, data: any, responseTime: number): AIResponse {
    if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
      throw new Error('No response content returned from Claude');
    }

    const content = data.content[0]?.text || '';
    const usage = data.usage || {};
    
    const tokenUsage = {
      promptTokens: usage.input_tokens || 0,
      completionTokens: usage.output_tokens || 0,
      totalTokens: (usage.input_tokens || 0) + (usage.output_tokens || 0)
    };

    const cost = this.calculateCost(tokenUsage);

    return {
      id: request.id,
      provider: AIProvider.ANTHROPIC_CLAUDE,
      model: this.config.model,
      content,
      tokenUsage,
      cost,
      responseTime,
      success: true,
      metadata: {
        ...request.metadata,
        stopReason: data.stop_reason,
        stopSequence: data.stop_sequence,
        claudeId: data.id,
        role: data.role,
        type: data.type
      }
    };
  }

  private calculateCost(tokenUsage: { promptTokens: number; completionTokens: number }): number {
    const costs = COST_PER_TOKEN[AIProvider.ANTHROPIC_CLAUDE];
    return (tokenUsage.promptTokens * costs.input) + (tokenUsage.completionTokens * costs.output);
  }

  private handleApiError(error: AxiosError): void {
    const status = error.response?.status;
    const message = error.response?.data as any;
    
    switch (status) {
      case 429:
        throw new AIRateLimitError(AIProvider.ANTHROPIC_CLAUDE);
      case 402:
        throw new AIQuotaExceededError(AIProvider.ANTHROPIC_CLAUDE);
      case 400:
        throw new AIServiceError(
          `Bad request: ${message?.error?.message || error.message}`,
          AIProvider.ANTHROPIC_CLAUDE,
          'BAD_REQUEST',
          400
        );
      case 401:
        throw new AIServiceError(
          'Unauthorized: Invalid API key',
          AIProvider.ANTHROPIC_CLAUDE,
          'UNAUTHORIZED',
          401
        );
      case 403:
        throw new AIServiceError(
          'Forbidden: Check API permissions',
          AIProvider.ANTHROPIC_CLAUDE,
          'FORBIDDEN',
          403
        );
      case 500:
      case 502:
      case 503:
      case 504:
        throw new AIServiceError(
          `Server error: ${error.message}`,
          AIProvider.ANTHROPIC_CLAUDE,
          'SERVER_ERROR',
          status
        );
      default:
        throw new AIServiceError(
          error.message,
          AIProvider.ANTHROPIC_CLAUDE,
          'UNKNOWN_ERROR',
          status
        );
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const testPayload = {
        model: this.config.model,
        max_tokens: 10,
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: 'Hello, please respond with just "OK"'
          }
        ]
      };

      const response = await this.client.post('/messages', testPayload);
      return response.status === 200 && response.data?.content?.length > 0;
    } catch (error) {
      logger.warn('Claude health check failed:', error);
      return false;
    }
  }

  public getConfig(): AIServiceConfig {
    return { ...this.config };
  }
}