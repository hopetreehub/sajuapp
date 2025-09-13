import { Request, Response, NextFunction } from 'express';
import { 
  AIServiceError, 
  AIRateLimitError, 
  AIQuotaExceededError, 
  AIServiceUnavailableError,
  AIProvider 
} from '@/types/ai.types';
import { logger } from '@/utils/logger';
import { ZodError } from 'zod';

export interface ErrorRequest extends Request {
  requestId?: string;
  userId?: string;
}

/**
 * 글로벌 에러 핸들러
 */
export const globalErrorHandler = (
  error: Error, 
  req: ErrorRequest, 
  res: Response, 
  next: NextFunction
): void => {
  const requestId = req.requestId || 'unknown';
  const userId = req.userId || 'anonymous';
  
  // 기본 에러 정보
  const baseErrorInfo = {
    requestId,
    userId,
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
    errorName: error.name,
    errorMessage: error.message
  };

  // AI 서비스 관련 에러 처리
  if (error instanceof AIServiceError) {
    handleAIServiceError(error, req, res, baseErrorInfo);
    return;
  }

  // Zod 유효성 검증 에러
  if (error instanceof ZodError) {
    handleValidationError(error, req, res, baseErrorInfo);
    return;
  }

  // SyntaxError (JSON 파싱 에러 등)
  if (error instanceof SyntaxError && 'body' in error) {
    handleSyntaxError(error, req, res, baseErrorInfo);
    return;
  }

  // 기본 HTTP 에러
  if ('status' in error || 'statusCode' in error) {
    handleHttpError(error as any, req, res, baseErrorInfo);
    return;
  }

  // 예상치 못한 에러
  handleUnknownError(error, req, res, baseErrorInfo);
};

/**
 * AI 서비스 에러 처리
 */
function handleAIServiceError(
  error: AIServiceError, 
  req: ErrorRequest, 
  res: Response, 
  baseInfo: any
): void {
  const errorInfo = {
    ...baseInfo,
    errorType: 'AI_SERVICE_ERROR',
    provider: error.provider,
    code: error.code,
    statusCode: error.statusCode
  };

  if (error instanceof AIRateLimitError) {
    logger.warn('AI Rate limit exceeded', errorInfo);
    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      message: `Too many requests to ${error.provider}. Please try again later.`,
      provider: error.provider,
      retryAfter: 60,
      requestId: req.requestId
    });
    return;
  }

  if (error instanceof AIQuotaExceededError) {
    logger.warn('AI Quota exceeded', errorInfo);
    res.status(402).json({
      success: false,
      error: 'Quota exceeded',
      message: `Daily quota exceeded for ${error.provider}. Please upgrade your plan.`,
      provider: error.provider,
      requestId: req.requestId
    });
    return;
  }

  if (error instanceof AIServiceUnavailableError) {
    logger.error('AI Service unavailable', errorInfo);
    res.status(503).json({
      success: false,
      error: 'Service unavailable',
      message: 'AI service is temporarily unavailable. Please try again later.',
      provider: error.provider,
      requestId: req.requestId
    });
    return;
  }

  // 일반 AI 서비스 에러
  logger.error('AI Service error', errorInfo);
  res.status(error.statusCode || 500).json({
    success: false,
    error: 'AI service error',
    message: error.message,
    provider: error.provider,
    code: error.code,
    requestId: req.requestId
  });
}

/**
 * 유효성 검증 에러 처리
 */
function handleValidationError(
  error: ZodError, 
  req: ErrorRequest, 
  res: Response, 
  baseInfo: any
): void {
  const errorInfo = {
    ...baseInfo,
    errorType: 'VALIDATION_ERROR',
    validationErrors: error.errors
  };

  logger.warn('Validation error', errorInfo);

  res.status(400).json({
    success: false,
    error: 'Validation failed',
    message: 'Request data is invalid',
    details: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      received: err.received
    })),
    requestId: req.requestId
  });
}

/**
 * JSON 파싱 에러 처리
 */
function handleSyntaxError(
  error: SyntaxError, 
  req: ErrorRequest, 
  res: Response, 
  baseInfo: any
): void {
  const errorInfo = {
    ...baseInfo,
    errorType: 'SYNTAX_ERROR',
    body: error.body
  };

  logger.warn('JSON syntax error', errorInfo);

  res.status(400).json({
    success: false,
    error: 'Invalid JSON',
    message: 'Request body contains invalid JSON',
    requestId: req.requestId
  });
}

/**
 * HTTP 에러 처리
 */
function handleHttpError(
  error: { status?: number; statusCode?: number; message: string }, 
  req: ErrorRequest, 
  res: Response, 
  baseInfo: any
): void {
  const statusCode = error.status || error.statusCode || 500;
  
  const errorInfo = {
    ...baseInfo,
    errorType: 'HTTP_ERROR',
    statusCode
  };

  if (statusCode >= 500) {
    logger.error('Server error', errorInfo);
  } else {
    logger.warn('Client error', errorInfo);
  }

  res.status(statusCode).json({
    success: false,
    error: statusCode >= 500 ? 'Internal server error' : 'Bad request',
    message: error.message,
    requestId: req.requestId
  });
}

/**
 * 예상치 못한 에러 처리
 */
function handleUnknownError(
  error: Error, 
  req: ErrorRequest, 
  res: Response, 
  baseInfo: any
): void {
  const errorInfo = {
    ...baseInfo,
    errorType: 'UNKNOWN_ERROR',
    stack: error.stack
  };

  logger.error('Unknown error', errorInfo);

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'An unexpected error occurred',
    requestId: req.requestId
  });
}

/**
 * 404 처리 미들웨어
 */
export const notFoundHandler = (req: ErrorRequest, res: Response, next: NextFunction): void => {
  logger.warn('Route not found', {
    requestId: req.requestId || 'unknown',
    userId: req.userId || 'anonymous',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });

  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
    requestId: req.requestId
  });
};

/**
 * 비동기 에러 캐치 래퍼
 */
export const asyncErrorHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 에러 리포팅 미들웨어 (외부 서비스 연동)
 */
export class ErrorReporter {
  private errorCounts: Map<string, number> = new Map();
  private resetInterval: NodeJS.Timeout;

  constructor() {
    // 에러 카운트 1시간마다 리셋
    this.resetInterval = setInterval(() => {
      this.errorCounts.clear();
    }, 60 * 60 * 1000);
  }

  public reportError(error: Error, context: Record<string, any>): void {
    const errorKey = `${error.name}:${error.message}`;
    const count = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, count + 1);

    // 동일한 에러가 너무 자주 발생하면 알림
    if (count > 10) {
      this.sendAlert('HIGH_ERROR_FREQUENCY', {
        error: errorKey,
        count: count + 1,
        context
      });
    }

    // 여기에 외부 모니터링 서비스 연동 (예: Sentry, Rollbar 등)
    // sentry.captureException(error, { extra: context });
    
    logger.error('Error reported', {
      errorKey,
      count: count + 1,
      context,
      timestamp: new Date().toISOString()
    });
  }

  private sendAlert(type: string, data: any): void {
    // Slack, Discord, 이메일 등으로 긴급 알림 발송
    logger.error('ALERT: ' + type, data);
    
    // 실제 구현 예시:
    // await slackWebhook.send({
    //   text: `🚨 ${type}: ${data.error}`,
    //   attachments: [{ color: 'danger', text: JSON.stringify(data, null, 2) }]
    // });
  }

  public getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorCounts);
  }

  public shutdown(): void {
    if (this.resetInterval) {
      clearInterval(this.resetInterval);
    }
  }
}

export const errorReporter = new ErrorReporter();