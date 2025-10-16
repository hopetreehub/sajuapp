import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initializeDatabase } from '@/database/database';
import authRoutes from '@/routes/auth.routes';
import adminRoutes from '@/routes/admin.routes';
import { logger } from '@/utils/logger.util';

// 환경변수 로드
dotenv.config();

const PORT = parseInt(process.env.PORT || '4018');
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Express 앱 초기화
 */
const app = express();

/**
 * 미들웨어 설정
 */

// 보안 헤더
app.use(helmet());

// CORS 설정
app.use(
  cors({
    origin:
      NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGINS?.split(',') || []
        : '*',
    credentials: true,
  })
);

// JSON 파싱
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP 요청 로깅
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

/**
 * Health Check
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'auth-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

/**
 * 라우트 등록
 */
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

/**
 * 404 핸들러
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
  });
});

/**
 * 글로벌 에러 핸들러
 */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);

  res.status(err.status || 500).json({
    success: false,
    error:
      NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message || 'Unknown error',
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
});

/**
 * 서버 시작 (비동기)
 */
async function startServer() {
  try {
    // 데이터베이스 초기화
    await initializeDatabase();
    logger.info('Database initialized successfully');

    // 서버 시작
    app.listen(PORT, () => {
      logger.info(`🚀 Auth Service running on port ${PORT}`);
      logger.info(`📊 Environment: ${NODE_ENV}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
      logger.info(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
      logger.info(`👥 Admin API: http://localhost:${PORT}/api/admin`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// 서버 시작
startServer();

/**
 * Graceful shutdown
 */
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
