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

export class GeminiService {
  private client: AxiosInstance;
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
    
    if (!config.apiKey) {
      throw new Error('Google AI API key is required');
    }

    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      params: {
        key: config.apiKey
      },
      headers: {
        'Content-Type': 'application/json',
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
      logger.info(`Sending request to Google Gemini with model: ${this.config.model}`);
      
      const response = await this.client.post(
        `/models/${this.config.model}:generateContent`,
        payload
      );
      
      const endTime = Date.now();
      return this.processResponse(request, response.data, endTime - startTime);
      
    } catch (error) {
      logger.error('Gemini request failed:', error);
      
      return {
        id: request.id,
        provider: AIProvider.GOOGLE_GEMINI,
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
    // Combine system and user prompts for Gemini
    const combinedPrompt = `${request.systemPrompt}\n\nUser: ${request.userPrompt}`;
    
    return {
      contents: [{
        parts: [{
          text: combinedPrompt
        }]
      }],
      generationConfig: {
        temperature: request.temperature ?? this.config.temperature,
        maxOutputTokens: request.maxTokens || this.config.maxTokens,
        topP: 1,
        topK: 40
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    };
  }

  private processResponse(request: AIRequest, data: any, responseTime: number): AIResponse {
    const candidate = data.candidates?.[0];
    
    if (!candidate || !candidate.content || !candidate.content.parts) {
      throw new Error('No response content returned from Gemini');
    }

    const content = candidate.content.parts[0]?.text || '';
    
    // Gemini doesn't always return token usage, so we estimate
    const estimatedTokens = this.estimateTokens(request.userPrompt + content);
    const tokenUsage = {
      promptTokens: this.estimateTokens(request.userPrompt),
      completionTokens: this.estimateTokens(content),
      totalTokens: estimatedTokens
    };

    const cost = this.calculateCost(tokenUsage);

    return {
      id: request.id,
      provider: AIProvider.GOOGLE_GEMINI,
      model: this.config.model,
      content,
      tokenUsage,
      cost,
      responseTime,
      success: true,
      metadata: {
        ...request.metadata,
        finishReason: candidate.finishReason,
        safetyRatings: candidate.safetyRatings
      }
    };
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English, 1-2 for Asian languages
    return Math.ceil(text.length / 3);
  }

  private calculateCost(tokenUsage: { promptTokens: number; completionTokens: number }): number {
    const costs = COST_PER_TOKEN[AIProvider.GOOGLE_GEMINI];
    return (tokenUsage.promptTokens * costs.input) + (tokenUsage.completionTokens * costs.output);
  }

  private handleApiError(error: AxiosError): void {
    const status = error.response?.status;
    const message = error.response?.data as any;
    
    switch (status) {
      case 429:
        throw new AIRateLimitError(AIProvider.GOOGLE_GEMINI);
      case 403:
        if (message?.error?.message?.includes('quota')) {
          throw new AIQuotaExceededError(AIProvider.GOOGLE_GEMINI);
        }
        throw new AIServiceError(
          'Forbidden: Check API key permissions',
          AIProvider.GOOGLE_GEMINI,
          'FORBIDDEN',
          403
        );
      case 400:
        throw new AIServiceError(
          `Bad request: ${message?.error?.message || error.message}`,
          AIProvider.GOOGLE_GEMINI,
          'BAD_REQUEST',
          400
        );
      case 401:
        throw new AIServiceError(
          'Unauthorized: Invalid API key',
          AIProvider.GOOGLE_GEMINI,
          'UNAUTHORIZED',
          401
        );
      case 500:
      case 502:
      case 503:
      case 504:
        throw new AIServiceError(
          `Server error: ${error.message}`,
          AIProvider.GOOGLE_GEMINI,
          'SERVER_ERROR',
          status
        );
      default:
        throw new AIServiceError(
          error.message,
          AIProvider.GOOGLE_GEMINI,
          'UNKNOWN_ERROR',
          status
        );
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const testPayload = {
        contents: [{
          parts: [{
            text: 'Hello, please respond with just "OK"'
          }]
        }],
        generationConfig: {
          maxOutputTokens: 10,
          temperature: 0
        }
      };

      const response = await this.client.post(
        `/models/${this.config.model}:generateContent`,
        testPayload
      );

      return response.status === 200 && response.data?.candidates?.length > 0;
    } catch (error) {
      logger.warn('Gemini health check failed:', error);
      return false;
    }
  }

  public getConfig(): AIServiceConfig {
    return { ...this.config };
  }
}