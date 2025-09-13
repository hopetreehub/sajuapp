import { EventEmitter } from 'events';
import { AIProvider, AIResponse, AIRequestType } from '@/types/ai.types';
import { logger } from '@/utils/logger';

export interface MetricsData {
  requests: {
    total: number;
    successful: number;
    failed: number;
    byProvider: Record<AIProvider, number>;
    byType: Record<AIRequestType, number>;
  };
  performance: {
    averageResponseTime: number;
    responseTimesByProvider: Record<AIProvider, number>;
  };
  costs: {
    totalCostToday: number;
    costsByProvider: Record<AIProvider, number>;
  };
  tokens: {
    totalTokensToday: number;
    tokensByProvider: Record<AIProvider, number>;
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  errors: {
    rateLimits: number;
    quotaExceeded: number;
    serverErrors: number;
    unknownErrors: number;
  };
  uptime: {
    startTime: Date;
    uptimeSeconds: number;
  };
}

export class MetricsService extends EventEmitter {
  private metrics: MetricsData;
  private startTime: Date;

  constructor() {
    super();
    this.startTime = new Date();
    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        byProvider: {} as Record<AIProvider, number>,
        byType: {} as Record<AIRequestType, number>
      },
      performance: {
        averageResponseTime: 0,
        responseTimesByProvider: {} as Record<AIProvider, number>
      },
      costs: {
        totalCostToday: 0,
        costsByProvider: {} as Record<AIProvider, number>
      },
      tokens: {
        totalTokensToday: 0,
        tokensByProvider: {} as Record<AIProvider, number>
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0
      },
      errors: {
        rateLimits: 0,
        quotaExceeded: 0,
        serverErrors: 0,
        unknownErrors: 0
      },
      uptime: {
        startTime: this.startTime,
        uptimeSeconds: 0
      }
    };

    // Initialize provider and type counters
    Object.values(AIProvider).forEach(provider => {
      this.metrics.requests.byProvider[provider] = 0;
      this.metrics.performance.responseTimesByProvider[provider] = 0;
      this.metrics.costs.costsByProvider[provider] = 0;
      this.metrics.tokens.tokensByProvider[provider] = 0;
    });

    Object.values(AIRequestType).forEach(type => {
      this.metrics.requests.byType[type] = 0;
    });
  }

  public recordRequest(
    provider: AIProvider, 
    response: AIResponse, 
    responseTime: number
  ): void {
    // Update request counts
    this.metrics.requests.total++;
    this.metrics.requests.byProvider[provider]++;
    
    if (response.success) {
      this.metrics.requests.successful++;
    } else {
      this.metrics.requests.failed++;
    }

    // Update performance metrics
    this.updateAverageResponseTime(responseTime);
    this.metrics.performance.responseTimesByProvider[provider] = 
      this.updateProviderAverageResponseTime(provider, responseTime);

    // Update cost and token usage
    this.metrics.costs.totalCostToday += response.cost;
    this.metrics.costs.costsByProvider[provider] += response.cost;
    
    this.metrics.tokens.totalTokensToday += response.tokenUsage.totalTokens;
    this.metrics.tokens.tokensByProvider[provider] += response.tokenUsage.totalTokens;

    // Emit metrics update event
    this.emit('metricsUpdated', {
      provider,
      response,
      responseTime,
      totalRequests: this.metrics.requests.total
    });

    logger.debug(`Recorded metrics for ${provider}: ${response.success ? 'SUCCESS' : 'FAILED'}`);
  }

  public recordRequestType(type: AIRequestType): void {
    this.metrics.requests.byType[type]++;
  }

  public recordCacheHit(type: AIRequestType): void {
    this.metrics.cache.hits++;
    this.updateCacheHitRate();
    this.recordRequestType(type);
  }

  public recordCacheMiss(): void {
    this.metrics.cache.misses++;
    this.updateCacheHitRate();
  }

  public recordError(errorType: 'rateLimits' | 'quotaExceeded' | 'serverErrors' | 'unknownErrors'): void {
    this.metrics.errors[errorType]++;
    logger.debug(`Recorded error: ${errorType}`);
  }

  private updateAverageResponseTime(newTime: number): void {
    const total = this.metrics.requests.total;
    const currentAvg = this.metrics.performance.averageResponseTime;
    
    this.metrics.performance.averageResponseTime = 
      ((currentAvg * (total - 1)) + newTime) / total;
  }

  private updateProviderAverageResponseTime(provider: AIProvider, newTime: number): number {
    const providerRequests = this.metrics.requests.byProvider[provider];
    const currentAvg = this.metrics.performance.responseTimesByProvider[provider];
    
    return ((currentAvg * (providerRequests - 1)) + newTime) / providerRequests;
  }

  private updateCacheHitRate(): void {
    const totalCacheRequests = this.metrics.cache.hits + this.metrics.cache.misses;
    this.metrics.cache.hitRate = totalCacheRequests > 0 
      ? (this.metrics.cache.hits / totalCacheRequests) * 100 
      : 0;
  }

  public getMetrics(): MetricsData {
    // Update uptime
    this.metrics.uptime.uptimeSeconds = Math.floor(
      (Date.now() - this.startTime.getTime()) / 1000
    );

    return { ...this.metrics };
  }

  public getProviderMetrics(provider: AIProvider): {
    requests: number;
    averageResponseTime: number;
    totalCost: number;
    totalTokens: number;
    successRate: number;
  } {
    const totalRequests = this.metrics.requests.byProvider[provider];
    const successfulRequests = totalRequests - (this.getProviderFailures(provider));
    
    return {
      requests: totalRequests,
      averageResponseTime: this.metrics.performance.responseTimesByProvider[provider],
      totalCost: this.metrics.costs.costsByProvider[provider],
      totalTokens: this.metrics.tokens.tokensByProvider[provider],
      successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0
    };
  }

  private getProviderFailures(provider: AIProvider): number {
    // This is a simplified calculation - in a real implementation,
    // you'd track failures per provider more precisely
    const totalProviderRequests = this.metrics.requests.byProvider[provider];
    const totalRequests = this.metrics.requests.total;
    const totalFailures = this.metrics.requests.failed;
    
    return totalRequests > 0 
      ? Math.round((totalProviderRequests / totalRequests) * totalFailures)
      : 0;
  }

  public resetDailyMetrics(): void {
    this.metrics.costs.totalCostToday = 0;
    this.metrics.tokens.totalTokensToday = 0;
    
    Object.values(AIProvider).forEach(provider => {
      this.metrics.costs.costsByProvider[provider] = 0;
      this.metrics.tokens.tokensByProvider[provider] = 0;
    });

    logger.info('Daily metrics reset');
  }

  public getHealthCheck(): {
    isHealthy: boolean;
    successRate: number;
    averageResponseTime: number;
    errorRate: number;
  } {
    const total = this.metrics.requests.total;
    const successful = this.metrics.requests.successful;
    const totalErrors = Object.values(this.metrics.errors).reduce((sum, count) => sum + count, 0);
    
    const successRate = total > 0 ? (successful / total) * 100 : 100;
    const errorRate = total > 0 ? (totalErrors / total) * 100 : 0;
    const avgResponseTime = this.metrics.performance.averageResponseTime;
    
    const isHealthy = successRate >= 95 && avgResponseTime < 5000 && errorRate < 5;

    return {
      isHealthy,
      successRate,
      averageResponseTime: avgResponseTime,
      errorRate
    };
  }

  public exportMetrics(): string {
    const metrics = this.getMetrics();
    return JSON.stringify(metrics, null, 2);
  }

  public reset(): void {
    this.initializeMetrics();
    this.startTime = new Date();
    logger.info('Metrics service reset');
  }
}