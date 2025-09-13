import { Router, Request, Response } from 'express';
import { aiOrchestrator } from '@/services/ai-orchestrator.service';
import { SERVICE_CONFIG } from '@/config/ai.config';
import { logger } from '@/utils/logger';

const router = Router();

/**
 * 기본 헬스 체크
 * GET /api/v1/health
 */
router.get('/', (req: Request, res: Response) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: SERVICE_CONFIG.serviceName,
    version: SERVICE_CONFIG.version,
    uptime: Math.floor(uptime),
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      rss: Math.round(memoryUsage.rss / 1024 / 1024)
    },
    environment: SERVICE_CONFIG.nodeEnv
  });
});

/**
 * 상세 헬스 체크 (AI 서비스 상태 포함)
 * GET /api/v1/health/detailed
 */
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    const serviceStatus = aiOrchestrator.getServiceStatus();
    const metrics = aiOrchestrator.getMetrics();
    const healthCheck = metrics.getHealthCheck();
    
    const detailedStatus = {
      status: healthCheck.isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      service: {
        name: SERVICE_CONFIG.serviceName,
        version: SERVICE_CONFIG.version,
        uptime: Math.floor(process.uptime()),
        environment: SERVICE_CONFIG.nodeEnv
      },
      ai_providers: Object.fromEntries(
        Array.from(serviceStatus.entries()).map(([provider, status]) => [
          provider,
          {
            healthy: status.isHealthy,
            last_check: status.lastCheck,
            response_time: status.responseTime,
            success_rate: status.successRate,
            tokens_used_today: status.tokensUsedToday,
            cost_today: status.costToday,
            error_count: status.errorCount
          }
        ])
      ),
      performance: {
        success_rate: healthCheck.successRate,
        average_response_time: healthCheck.averageResponseTime,
        error_rate: healthCheck.errorRate
      },
      system: {
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
        },
        cpu_usage: process.cpuUsage()
      }
    };
    
    const statusCode = healthCheck.isHealthy ? 200 : 503;
    res.status(statusCode).json(detailedStatus);
    
  } catch (error) {
    logger.error('Detailed health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      service: SERVICE_CONFIG.serviceName
    });
  }
});

/**
 * AI 서비스별 상태 확인
 * GET /api/v1/health/providers
 */
router.get('/providers', async (req: Request, res: Response) => {
  try {
    const serviceStatus = aiOrchestrator.getServiceStatus();
    
    const providerStatus = Object.fromEntries(
      Array.from(serviceStatus.entries()).map(([provider, status]) => [
        provider,
        {
          provider,
          healthy: status.isHealthy,
          last_check: status.lastCheck,
          response_time: status.responseTime,
          success_rate: status.successRate,
          tokens_used_today: status.tokensUsedToday,
          cost_today: status.costToday,
          error_count: status.errorCount,
          remaining_quota: status.remainingQuota
        }
      ])
    );
    
    res.json({
      timestamp: new Date().toISOString(),
      providers: providerStatus,
      total_providers: Object.keys(providerStatus).length,
      healthy_providers: Object.values(providerStatus).filter(p => p.healthy).length
    });
    
  } catch (error) {
    logger.error('Provider status check failed:', error);
    res.status(500).json({
      error: 'Failed to retrieve provider status',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 메트릭스 정보
 * GET /api/v1/health/metrics
 */
router.get('/metrics', (req: Request, res: Response) => {
  try {
    const metrics = aiOrchestrator.getMetrics();
    
    res.json({
      timestamp: new Date().toISOString(),
      metrics: metrics.getMetrics(),
      service: SERVICE_CONFIG.serviceName
    });
    
  } catch (error) {
    logger.error('Metrics retrieval failed:', error);
    res.status(500).json({
      error: 'Failed to retrieve metrics',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 준비 상태 확인 (Kubernetes 등에서 사용)
 * GET /api/v1/health/ready
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    const serviceStatus = aiOrchestrator.getServiceStatus();
    const healthyProviders = Array.from(serviceStatus.values()).filter(s => s.isHealthy);
    
    if (healthyProviders.length === 0) {
      res.status(503).json({
        ready: false,
        message: 'No healthy AI providers available',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    res.json({
      ready: true,
      healthy_providers: healthyProviders.length,
      total_providers: serviceStatus.size,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      ready: false,
      error: 'Readiness check failed',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 라이브 상태 확인 (Kubernetes 등에서 사용)
 * GET /api/v1/health/live
 */
router.get('/live', (req: Request, res: Response) => {
  res.json({
    live: true,
    timestamp: new Date().toISOString(),
    service: SERVICE_CONFIG.serviceName,
    version: SERVICE_CONFIG.version
  });
});

export default router;