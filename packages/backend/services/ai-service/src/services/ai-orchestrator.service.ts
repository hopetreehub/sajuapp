import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import retry from 'async-retry';

import { 
  AIProvider, 
  AIRequest, 
  AIResponse, 
  AIServiceConfig,
  AIServiceStatus,
  AIServiceError,
  AIRateLimitError,
  AIQuotaExceededError,
  AIServiceUnavailableError
} from '@/types/ai.types';

import { AI_CONFIG, SERVICE_CONFIG, getProviderByPriority } from '@/config/ai.config';
import { DeepInfraService } from './providers/deepinfra.service';
import { OpenAIService } from './providers/openai.service';
import { GeminiService } from './providers/gemini.service';
import { ClaudeService } from './providers/claude.service';
import { CohereService } from './providers/cohere.service';
import { CacheService } from './cache.service';
import { MetricsService } from './metrics.service';
import { logger } from '@/utils/logger';

export class AIOrchestrator extends EventEmitter {
  private providers: Map<AIProvider, any>;
  private serviceStatus: Map<AIProvider, AIServiceStatus>;
  private cacheService: CacheService;
  private metricsService: MetricsService;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor() {
    super();
    this.providers = new Map();
    this.serviceStatus = new Map();
    this.cacheService = new CacheService(SERVICE_CONFIG.cache);
    this.metricsService = new MetricsService();
    
    this.initializeProviders();
    this.startHealthChecks();
  }

  private initializeProviders(): void {
    const enabledProviders = getProviderByPriority();
    
    enabledProviders.forEach(provider => {
      const config = AI_CONFIG[provider];
      
      try {
        switch (provider) {
          case AIProvider.DEEPINFRA:
            this.providers.set(provider, new DeepInfraService(config));
            break;
          case AIProvider.OPENAI:
            this.providers.set(provider, new OpenAIService(config));
            break;
          case AIProvider.GOOGLE_GEMINI:
            this.providers.set(provider, new GeminiService(config));
            break;
          case AIProvider.ANTHROPIC_CLAUDE:
            this.providers.set(provider, new ClaudeService(config));
            break;
          case AIProvider.COHERE:
            this.providers.set(provider, new CohereService(config));
            break;
        }

        this.serviceStatus.set(provider, {
          provider,
          isHealthy: true,
          lastCheck: new Date(),
          responseTime: 0,
          errorCount: 0,
          successRate: 100,
          tokensUsedToday: 0,
          costToday: 0
        });

        logger.info(`AI Provider initialized: ${provider}`);
      } catch (error) {
        logger.error(`Failed to initialize provider ${provider}:`, error);
        this.serviceStatus.set(provider, {
          provider,
          isHealthy: false,
          lastCheck: new Date(),
          responseTime: 0,
          errorCount: 1,
          successRate: 0,
          tokensUsedToday: 0,
          costToday: 0
        });
      }
    });
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, SERVICE_CONFIG.monitoring.healthCheckInterval);
  }

  private async performHealthChecks(): Promise<void> {
    const providers = Array.from(this.providers.keys());
    
    await Promise.allSettled(providers.map(async (provider) => {
      const startTime = Date.now();
      try {
        const service = this.providers.get(provider);
        const isHealthy = await service.healthCheck();
        
        const status = this.serviceStatus.get(provider)!;
        status.isHealthy = isHealthy;
        status.lastCheck = new Date();
        status.responseTime = Date.now() - startTime;
        
        if (isHealthy) {
          status.successRate = Math.min(100, status.successRate + 1);
        } else {
          status.errorCount += 1;
          status.successRate = Math.max(0, status.successRate - 5);
        }
        
        this.serviceStatus.set(provider, status);
        
      } catch (error) {
        logger.warn(`Health check failed for ${provider}:`, error);
        const status = this.serviceStatus.get(provider)!;
        status.isHealthy = false;
        status.lastCheck = new Date();
        status.errorCount += 1;
        status.successRate = Math.max(0, status.successRate - 10);
        this.serviceStatus.set(provider, status);
      }
    }));
  }

  public async processRequest(request: AIRequest): Promise<AIResponse> {
    const requestId = request.id || uuidv4();
    const startTime = Date.now();

    // Check cache first
    const cacheKey = this.generateCacheKey(request);
    const cachedResponse = this.cacheService.get(cacheKey);
    if (cachedResponse) {
      logger.info(`Cache hit for request ${requestId}`);
      this.metricsService.recordCacheHit(request.requestType);
      return cachedResponse;
    }

    // Smart provider selection
    const selectedProvider = await this.selectOptimalProvider(request);
    
    if (!selectedProvider) {
      throw new AIServiceUnavailableError(AIProvider.DEEPINFRA); // Fallback error
    }

    try {
      const response = await this.executeWithRetry(selectedProvider, request, requestId);
      
      // Cache successful responses
      if (response.success) {
        this.cacheService.set(cacheKey, response);
        this.updateServiceMetrics(selectedProvider, response, startTime);
      }
      
      this.emit('requestProcessed', { request, response, provider: selectedProvider });
      return response;
      
    } catch (error) {
      logger.error(`Request ${requestId} failed with all providers:`, error);
      throw error;
    }
  }

  private async selectOptimalProvider(request: AIRequest): Promise<AIProvider | null> {
    const enabledProviders = getProviderByPriority();
    
    // Cost optimization logic
    if (SERVICE_CONFIG.costOptimization.enabled) {
      const freeProviders = enabledProviders.filter(provider => 
        AI_CONFIG[provider].cost === 'free' && this.isProviderHealthy(provider)
      );
      
      if (freeProviders.length > 0) {
        return freeProviders[0];
      }
    }

    // Find first healthy provider
    for (const provider of enabledProviders) {
      if (this.isProviderHealthy(provider) && this.hasRemainingQuota(provider)) {
        return provider;
      }
    }

    return null;
  }

  private async executeWithRetry(
    provider: AIProvider,
    request: AIRequest,
    requestId: string
  ): Promise<AIResponse> {
    const service = this.providers.get(provider)!;
    const maxRetries = 3;
    
    return retry(async () => {
      try {
        logger.info(`Processing request ${requestId} with ${provider}`);
        const response = await service.processRequest(request);
        
        if (!response.success) {
          throw new AIServiceError(
            response.error || 'Unknown error',
            provider,
            'PROCESSING_FAILED'
          );
        }
        
        return response;
        
      } catch (error) {
        if (error instanceof AIRateLimitError || error instanceof AIQuotaExceededError) {
          // Try next provider instead of retrying
          const nextProvider = this.getNextHealthyProvider(provider);
          if (nextProvider) {
            logger.info(`Switching to ${nextProvider} due to ${error.constructor.name}`);
            return this.executeWithRetry(nextProvider, request, requestId);
          }
        }
        
        throw error;
      }
    }, {
      retries: maxRetries,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 5000,
      onRetry: (error, attempt) => {
        logger.warn(`Retry attempt ${attempt} for request ${requestId}:`, error.message);
      }
    });
  }

  private getNextHealthyProvider(currentProvider: AIProvider): AIProvider | null {
    const enabledProviders = getProviderByPriority();
    const currentIndex = enabledProviders.indexOf(currentProvider);
    
    for (let i = currentIndex + 1; i < enabledProviders.length; i++) {
      const provider = enabledProviders[i];
      if (this.isProviderHealthy(provider) && this.hasRemainingQuota(provider)) {
        return provider;
      }
    }
    
    return null;
  }

  private isProviderHealthy(provider: AIProvider): boolean {
    const status = this.serviceStatus.get(provider);
    return status ? status.isHealthy && status.successRate > 50 : false;
  }

  private hasRemainingQuota(provider: AIProvider): boolean {
    const status = this.serviceStatus.get(provider);
    const config = AI_CONFIG[provider];
    
    if (!status || !config.dailyLimit) return true;
    
    return status.tokensUsedToday < config.dailyLimit;
  }

  private updateServiceMetrics(
    provider: AIProvider,
    response: AIResponse,
    startTime: number
  ): void {
    const status = this.serviceStatus.get(provider)!;
    
    status.tokensUsedToday += response.tokenUsage.totalTokens;
    status.costToday += response.cost;
    status.responseTime = Date.now() - startTime;
    status.successRate = Math.min(100, status.successRate + 1);
    
    this.serviceStatus.set(provider, status);
    this.metricsService.recordRequest(provider, response, Date.now() - startTime);
  }

  private generateCacheKey(request: AIRequest): string {
    const keyData = {
      systemPrompt: request.systemPrompt,
      userPrompt: request.userPrompt,
      requestType: request.requestType,
      temperature: request.temperature || 0.7,
      maxTokens: request.maxTokens || 2000
    };
    
    return Buffer.from(JSON.stringify(keyData)).toString('base64');
  }

  public getServiceStatus(): Map<AIProvider, AIServiceStatus> {
    return new Map(this.serviceStatus);
  }

  public getMetrics(): any {
    return this.metricsService.getMetrics();
  }

  public async shutdown(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    // Gracefully shutdown all providers
    await Promise.allSettled(
      Array.from(this.providers.values()).map(service => 
        service.shutdown ? service.shutdown() : Promise.resolve()
      )
    );
    
    logger.info('AI Orchestrator shutdown complete');
  }
}

export const aiOrchestrator = new AIOrchestrator();