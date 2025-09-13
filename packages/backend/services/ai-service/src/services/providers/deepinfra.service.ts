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

export class DeepInfraService {
  private client: AxiosInstance;
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SajuApp-AI-Service/1.0.0'
      }
    });

    // Request interceptor for logging
    this.client.interceptors.request.use((config) => {
      logger.debug(`DeepInfra request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // Response interceptor for error handling
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
      logger.info(`Sending request to DeepInfra with model: ${this.config.model}`);
      
      const response = await this.client.post('/chat/completions', payload);
      const endTime = Date.now();
      
      return this.processResponse(request, response.data, endTime - startTime);
      
    } catch (error) {
      logger.error('DeepInfra request failed:', error);
      
      return {
        id: request.id,
        provider: AIProvider.DEEPINFRA,
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
      presence_penalty: 0,
      stream: false,
      stop: null
    };
  }

  private processResponse(request: AIRequest, data: any, responseTime: number): AIResponse {
    const choice = data.choices?.[0];
    const usage = data.usage || {};
    
    if (!choice) {
      throw new Error('No response choices returned from DeepInfra');
    }

    const tokenUsage = {
      promptTokens: usage.prompt_tokens || 0,
      completionTokens: usage.completion_tokens || 0,
      totalTokens: usage.total_tokens || 0
    };

    const cost = this.calculateCost(tokenUsage);

    return {
      id: request.id,
      provider: AIProvider.DEEPINFRA,
      model: this.config.model,
      content: choice.message?.content || '',
      tokenUsage,
      cost,
      responseTime,
      success: true,
      metadata: {
        ...request.metadata,
        finishReason: choice.finish_reason,
        model: data.model,
        created: data.created
      }
    };
  }

  private calculateCost(tokenUsage: { promptTokens: number; completionTokens: number }): number {
    const costs = COST_PER_TOKEN[AIProvider.DEEPINFRA];
    return (tokenUsage.promptTokens * costs.input) + (tokenUsage.completionTokens * costs.output);
  }

  private handleApiError(error: AxiosError): void {
    const status = error.response?.status;
    const message = error.response?.data as any;
    
    switch (status) {
      case 429:
        throw new AIRateLimitError(AIProvider.DEEPINFRA);
      case 402:
      case 403:
        throw new AIQuotaExceededError(AIProvider.DEEPINFRA);
      case 400:
        throw new AIServiceError(
          `Bad request: ${message?.error?.message || error.message}`,
          AIProvider.DEEPINFRA,
          'BAD_REQUEST',
          400
        );
      case 401:
        throw new AIServiceError(
          'Unauthorized: Invalid API key',
          AIProvider.DEEPINFRA,
          'UNAUTHORIZED',
          401
        );
      case 500:
      case 502:
      case 503:
      case 504:
        throw new AIServiceError(
          `Server error: ${error.message}`,
          AIProvider.DEEPINFRA,
          'SERVER_ERROR',
          status
        );
      default:
        throw new AIServiceError(
          error.message,
          AIProvider.DEEPINFRA,
          'UNKNOWN_ERROR',
          status
        );
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const testPayload = {
        model: this.config.model,
        messages: [
          { role: 'user', content: 'Hello, please respond with just "OK"' }
        ],
        max_tokens: 10,
        temperature: 0
      };

      const response = await this.client.post('/chat/completions', testPayload);
      return response.status === 200 && response.data?.choices?.length > 0;
    } catch (error) {
      logger.warn('DeepInfra health check failed:', error);
      return false;
    }
  }

  public getConfig(): AIServiceConfig {
    return { ...this.config };
  }
}