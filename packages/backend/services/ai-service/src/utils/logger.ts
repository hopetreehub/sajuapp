import winston from 'winston';
import { SERVICE_CONFIG } from '@/config/ai.config';

const { combine, timestamp, colorize, printf, json } = winston.format;

// Custom log format
const customFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  return msg;
});

// Create logger instance
export const logger = winston.createLogger({
  level: SERVICE_CONFIG.monitoring.logLevel,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    SERVICE_CONFIG.nodeEnv === 'production' ? json() : customFormat
  ),
  defaultMeta: {
    service: SERVICE_CONFIG.serviceName,
    version: SERVICE_CONFIG.version
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: combine(
        colorize(),
        customFormat
      )
    }),
    
    // File transports
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    })
  ],
  
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ]
});

// Create logs directory if it doesn't exist
import { mkdirSync, existsSync } from 'fs';
if (!existsSync('logs')) {
  mkdirSync('logs', { recursive: true });
}

// Production-specific configuration
if (SERVICE_CONFIG.nodeEnv === 'production') {
  const consoleTransport = logger.transports.find(t => t.constructor.name === 'Console');
  if (consoleTransport) {
    logger.remove(consoleTransport);
  }

  // Add production transports (e.g., external logging services)
  // logger.add(new winston.transports.Http({
  //   host: 'logging-service',
  //   port: 80,
  //   path: '/logs'
  // }));
}

// Add request logging helper
export const logRequest = (method: string, url: string, body?: any, userId?: string) => {
  logger.info('API Request', {
    method,
    url,
    userId,
    bodySize: body ? JSON.stringify(body).length : 0,
    timestamp: new Date().toISOString()
  });
};

export const logResponse = (
  method: string, 
  url: string, 
  statusCode: number, 
  responseTime: number, 
  userId?: string
) => {
  logger.info('API Response', {
    method,
    url,
    statusCode,
    responseTime,
    userId,
    timestamp: new Date().toISOString()
  });
};

export const logAIRequest = (
  provider: string,
  model: string,
  tokenCount: number,
  cost: number,
  success: boolean
) => {
  logger.info('AI Request', {
    provider,
    model,
    tokenCount,
    cost,
    success,
    timestamp: new Date().toISOString()
  });
};

export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error('Error occurred', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...context,
    timestamp: new Date().toISOString()
  });
};

export default logger;