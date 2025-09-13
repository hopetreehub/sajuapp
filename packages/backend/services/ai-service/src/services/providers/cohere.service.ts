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

export class CohereService {
  private client: AxiosInstance;
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
    
    if (!config.apiKey) {
      throw new Error('Cohere API key is required');
    }

    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SajuApp-AI-Service/1.0.0',
        'Cohere-Version': '2022-12-06'
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
      logger.info(`Sending request to Cohere with model: ${this.config.model}`);
      
      const response = await this.client.post('/generate', payload);
      const endTime = Date.now();
      
      return this.processResponse(request, response.data, endTime - startTime);
      
    } catch (error) {
      logger.error('Cohere request failed:', error);
      
      return {
        id: request.id,
        provider: AIProvider.COHERE,
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
    // Combine system and user prompts for Cohere
    const combinedPrompt = `${request.systemPrompt}\n\nUser: ${request.userPrompt}\n\nAssistant:`;
    
    return {
      model: this.config.model,
      prompt: combinedPrompt,
      max_tokens: request.maxTokens || this.config.maxTokens,
      temperature: request.temperature ?? this.config.temperature,
      k: 0,
      p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop_sequences: ['User:', 'Human:'],
      return_likelihoods: 'NONE',
      truncate: 'END'
    };
  }

  private processResponse(request: AIRequest, data: any, responseTime: number): AIResponse {
    if (!data.generations || !Array.isArray(data.generations) || data.generations.length === 0) {
      throw new Error('No response generations returned from Cohere');
    }

    const generation = data.generations[0];
    const content = generation.text?.trim() || '';
    
    // Cohere doesn't provide token usage in the response, so we estimate
    const estimatedPromptTokens = this.estimateTokens(request.userPrompt + request.systemPrompt);
    const estimatedCompletionTokens = this.estimateTokens(content);
    
    const tokenUsage = {
      promptTokens: estimatedPromptTokens,
      completionTokens: estimatedCompletionTokens,
      totalTokens: estimatedPromptTokens + estimatedCompletionTokens
    };

    const cost = this.calculateCost(tokenUsage);

    return {
      id: request.id,
      provider: AIProvider.COHERE,
      model: this.config.model,
      content,
      tokenUsage,
      cost,
      responseTime,
      success: true,
      metadata: {
        ...request.metadata,
        likelihood: generation.likelihood,
        finishReason: generation.finish_reason,
        cohereId: data.id
      }
    };
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English, 1-2 for Asian languages
    return Math.ceil(text.length / 3);
  }

  private calculateCost(tokenUsage: { promptTokens: number; completionTokens: number }): number {
    const costs = COST_PER_TOKEN[AIProvider.COHERE];
    return (tokenUsage.promptTokens * costs.input) + (tokenUsage.completionTokens * costs.output);
  }

  private handleApiError(error: AxiosError): void {
    const status = error.response?.status;
    const message = error.response?.data as any;
    
    switch (status) {
      case 429:
        throw new AIRateLimitError(AIProvider.COHERE);
      case 402:
      case 403:
        if (message?.message?.includes('quota') || message?.message?.includes('limit')) {
          throw new AIQuotaExceededError(AIProvider.COHERE);
        }
        throw new AIServiceError(
          'Forbidden: Check API permissions',
          AIProvider.COHERE,
          'FORBIDDEN',
          403
        );
      case 400:
        throw new AIServiceError(
          `Bad request: ${message?.message || error.message}`,
          AIProvider.COHERE,
          'BAD_REQUEST',
          400
        );
      case 401:
        throw new AIServiceError(
          'Unauthorized: Invalid API key',
          AIProvider.COHERE,
          'UNAUTHORIZED',
          401
        );
      case 500:
      case 502:
      case 503:
      case 504:
        throw new AIServiceError(
          `Server error: ${error.message}`,
          AIProvider.COHERE,
          'SERVER_ERROR',
          status
        );
      default:
        throw new AIServiceError(
          error.message,
          AIProvider.COHERE,
          'UNKNOWN_ERROR',
          status
        );
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const testPayload = {
        model: this.config.model,
        prompt: 'Hello, please respond with just "OK"',
        max_tokens: 10,
        temperature: 0
      };

      const response = await this.client.post('/generate', testPayload);
      return response.status === 200 && response.data?.generations?.length > 0;
    } catch (error) {
      logger.warn('Cohere health check failed:', error);
      return false;
    }
  }

  public getConfig(): AIServiceConfig {
    return { ...this.config };
  }
}