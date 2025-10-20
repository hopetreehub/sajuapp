import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import shareRoutes from './routes/share.routes';
import { initDatabase, closeDatabase } from './database/init';

// 환경 변수 로드
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4020;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'qimen-share-service',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api', shareRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// 서버 시작
async function startServer() {
  try {
    // 데이터베이스 초기화
    await initDatabase();

    // 서버 시작
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════╗
║   🔮 Qimen Share Service                          ║
║   📡 Server running on port ${PORT}                   ║
║   🌐 CORS enabled for ${process.env.CORS_ORIGIN || 'http://localhost:4000'}
║   📅 ${new Date().toLocaleString('ko-KR')}           ║
╚═══════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n📪 Shutting down gracefully...');
      await closeDatabase();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n📪 Shutting down gracefully...');
      await closeDatabase();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
