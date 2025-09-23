import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import logger from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import diariesRouter from './routes/diaries';
import { initDatabase } from './database/connection';

dotenv.config();

const app: Application = express();
const PORT = process.env.DIARY_SERVICE_PORT || process.env.PORT || 4004;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4000',
  credentials: true
}));
// Increase payload size limit to 50MB for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(requestLogger);

// Routes
app.use('/health', (_req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'diary-service',
    timestamp: new Date().toISOString()
  });
});
app.use('/api/diaries', diariesRouter);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`
  });
});

const server = createServer(app);

const startServer = async () => {
  try {
    // Initialize database connection
    await initDatabase();
    
    server.listen(PORT, () => {
      logger.info(`Diary Service is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

startServer();