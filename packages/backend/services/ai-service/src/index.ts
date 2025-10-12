import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { SERVICE_CONFIG } from '@/config/ai.config';
import { logger } from '@/utils/logger';

// Routes
import fortuneRoutes from '@/routes/fortune.routes';
import diaryRoutes from '@/routes/diary.routes';
import healthRoutes from '@/routes/health.routes';
import qimenRoutes from '@/routes/qimen.routes';

// Middleware
import { requestLogger } from '@/middleware/request-logger.middleware';
import { globalErrorHandler, notFoundHandler } from '@/middleware/error-handler.middleware';
import { skipRateLimitForHealth } from '@/middleware/rate-limit.middleware';

// Services
import { aiOrchestrator } from '@/services/ai-orchestrator.service';

class AIServiceApplication {
  private app: Application;
  private server?: any;

  constructor() {
    this.app = express();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }));

    // CORS configuration
    this.app.use(cors({
      origin: (origin, callback) => {
        // 개발 환경에서는 모든 origin 허용
        if (SERVICE_CONFIG.nodeEnv === 'development') {
          callback(null, true);
          return;
        }

        // 운영 환경에서는 허용된 도메인만
        const allowedOrigins = [
          'http://localhost:4000',
          'http://localhost:3000',
          'https://sajuapp.com',
          'https://www.sajuapp.com'
        ];

        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-ID']
    }));

    // Body parsing
    this.app.use(express.json({ 
      limit: '10mb',
      strict: true
    }));
    this.app.use(express.urlencoded({ 
      extended: true, 
      limit: '10mb' 
    }));

    // Compression
    this.app.use(compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
      threshold: 1024,
      level: 6
    }));

    // Trust proxy (for load balancer)
    this.app.set('trust proxy', 1);

    // Request logging
    this.app.use(requestLogger);

    // Rate limiting (skip for health checks)
    this.app.use(skipRateLimitForHealth);
  }

  private initializeRoutes(): void {
    // API version prefix
    const API_PREFIX = '/api/v1';

    // Health check routes (no auth required)
    this.app.use(`${API_PREFIX}/health`, healthRoutes);

    // Main API routes
    this.app.use(`${API_PREFIX}/fortune`, fortuneRoutes);
    this.app.use(`${API_PREFIX}/diary`, diaryRoutes);
    this.app.use(`${API_PREFIX}/qimen`, qimenRoutes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        service: SERVICE_CONFIG.serviceName,
        version: SERVICE_CONFIG.version,
        status: 'running',
        timestamp: new Date().toISOString(),
        endpoints: {
          health: `${API_PREFIX}/health`,
          fortune: `${API_PREFIX}/fortune`,
          diary: `${API_PREFIX}/diary`
        }
      });
    });

    // API documentation endpoint
    this.app.get(`${API_PREFIX}/docs`, (req, res) => {
      res.json({
        service: 'AI Fortune Interpretation Service',
        version: SERVICE_CONFIG.version,
        endpoints: [
          {
            path: `${API_PREFIX}/fortune/daily`,
            method: 'POST',
            description: 'Get daily fortune interpretation',
            authentication: 'API Key or Bearer Token required'
          },
          {
            path: `${API_PREFIX}/fortune/weekly`,
            method: 'POST',
            description: 'Get weekly fortune interpretation'
          },
          {
            path: `${API_PREFIX}/fortune/monthly`,
            method: 'POST',
            description: 'Get monthly fortune interpretation'
          },
          {
            path: `${API_PREFIX}/diary/insights`,
            method: 'POST',
            description: 'Get diary content insights based on Saju analysis'
          },
          {
            path: `${API_PREFIX}/diary/advice`,
            method: 'POST',
            description: 'Get personalized advice based on diary content'
          },
          {
            path: `${API_PREFIX}/health`,
            method: 'GET',
            description: 'Service health check'
          }
        ],
        authentication: {
          methods: ['Bearer Token', 'X-API-Key header'],
          note: 'Contact administrator for API access'
        },
        rateLimit: {
          requests: `${SERVICE_CONFIG.rateLimit.maxRequests} requests per minute`,
          tokens: `${SERVICE_CONFIG.rateLimit.tokensPerMinute} tokens per minute`
        }
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler (must be after all routes)
    this.app.use(notFoundHandler);

    // Global error handler (must be last)
    this.app.use(globalErrorHandler);
  }

  private async initializeServices(): Promise<void> {
    try {
      logger.info('Initializing AI services...');
      // AI Orchestrator는 이미 constructor에서 초기화됨
      logger.info('AI services initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize AI services:', error);
      throw error;
    }
  }

  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, starting graceful shutdown...`);

      // HTTP 서버 종료
      if (this.server) {
        this.server.close(() => {
          logger.info('HTTP server closed');
        });
      }

      try {
        // AI Orchestrator 종료
        await aiOrchestrator.shutdown();
        logger.info('AI services shut down successfully');

        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    // Graceful shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled promise rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });
  }

  public async start(): Promise<void> {
    try {
      // Initialize services first
      await this.initializeServices();

      // Start HTTP server
      this.server = this.app.listen(SERVICE_CONFIG.port, () => {
        logger.info(`🚀 AI Service started successfully!`);
        logger.info(`📡 Server running on port ${SERVICE_CONFIG.port}`);
        logger.info(`🌍 Environment: ${SERVICE_CONFIG.nodeEnv}`);
        logger.info(`📋 Service: ${SERVICE_CONFIG.serviceName} v${SERVICE_CONFIG.version}`);
        logger.info(`🔗 Health check: http://localhost:${SERVICE_CONFIG.port}/api/v1/health`);
        logger.info(`📖 Documentation: http://localhost:${SERVICE_CONFIG.port}/api/v1/docs`);
      });

      // Setup graceful shutdown
      this.setupGracefulShutdown();

      // Log service configuration
      logger.info('Service configuration:', {
        port: SERVICE_CONFIG.port,
        environment: SERVICE_CONFIG.nodeEnv,
        rateLimit: SERVICE_CONFIG.rateLimit,
        cacheConfig: SERVICE_CONFIG.cache,
        costOptimization: SERVICE_CONFIG.costOptimization
      });

    } catch (error) {
      logger.error('Failed to start AI service:', error);
      process.exit(1);
    }
  }

  public getApp(): Application {
    return this.app;
  }
}

// Start the application
if (require.main === module) {
  const app = new AIServiceApplication();
  app.start();
}

export default AIServiceApplication;