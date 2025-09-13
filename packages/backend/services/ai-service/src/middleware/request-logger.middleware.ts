import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';

export interface LoggedRequest extends Request {
  requestId: string;
  startTime: number;
}

/**
 * 요청 로깅 미들웨어
 */
export const requestLogger = (req: LoggedRequest, res: Response, next: NextFunction): void => {
  // 요청 ID 생성 및 시작 시간 기록
  req.requestId = uuidv4();
  req.startTime = Date.now();
  
  // 요청 정보 로깅
  const requestInfo = {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    path: req.path,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
    clientIP: req.ip || req.connection.remoteAddress,
    userId: (req as any).userId || 'anonymous',
    timestamp: new Date().toISOString()
  };
  
  // 헬스체크는 debug 레벨로 로깅
  if (req.path.startsWith('/health')) {
    logger.debug('Health check request', requestInfo);
  } else {
    logger.info('Incoming request', requestInfo);
  }
  
  // 응답 완료 시 로깅
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - req.startTime;
    
    const responseInfo = {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      contentLength: Buffer.byteLength(data || ''),
      userId: (req as any).userId || 'anonymous',
      timestamp: new Date().toISOString()
    };
    
    // 상태코드에 따른 로그 레벨 결정
    if (res.statusCode >= 500) {
      logger.error('Request completed with server error', responseInfo);
    } else if (res.statusCode >= 400) {
      logger.warn('Request completed with client error', responseInfo);
    } else if (req.path.startsWith('/health')) {
      logger.debug('Health check completed', responseInfo);
    } else {
      logger.info('Request completed successfully', responseInfo);
    }
    
    // 성능 경고 (5초 이상 소요시)
    if (responseTime > 5000) {
      logger.warn('Slow request detected', {
        ...responseInfo,
        warningType: 'SLOW_REQUEST',
        threshold: '5s'
      });
    }
    
    return originalSend.call(this, data);
  };
  
  // 에러 발생 시 로깅
  res.on('error', (error) => {
    logger.error('Response error occurred', {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      error: error.message,
      stack: error.stack,
      userId: (req as any).userId || 'anonymous',
      timestamp: new Date().toISOString()
    });
  });
  
  // 요청 헤더에 request ID 추가 (디버깅용)
  res.setHeader('X-Request-ID', req.requestId);
  
  next();
};

/**
 * API 별 상세 로깅 미들웨어
 */
export const detailedApiLogger = (req: LoggedRequest, res: Response, next: NextFunction): void => {
  // AI 서비스 요청은 더 상세하게 로깅
  if (req.path.includes('/fortune/') || req.path.includes('/diary/')) {
    const requestDetails = {
      requestId: req.requestId,
      apiEndpoint: req.path,
      requestBody: {
        hasContent: !!req.body,
        bodySize: req.body ? JSON.stringify(req.body).length : 0,
        hasSajuData: !!(req.body && req.body.sajuData),
        hasDiaryContent: !!(req.body && req.body.diaryContent),
        requestType: req.body?.requestType || 'unknown'
      },
      userId: (req as any).userId,
      estimatedTokens: (req as any).estimatedTokens || 0,
      timestamp: new Date().toISOString()
    };
    
    logger.info('AI API request details', requestDetails);
  }
  
  next();
};

/**
 * 에러 처리 로깅 미들웨어
 */
export const errorLogger = (error: Error, req: LoggedRequest, res: Response, next: NextFunction): void => {
  const errorInfo = {
    requestId: req.requestId || 'unknown',
    method: req.method,
    url: req.url,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    userId: (req as any).userId || 'anonymous',
    timestamp: new Date().toISOString()
  };
  
  logger.error('Request error occurred', errorInfo);
  
  // 에러 응답 전송
  if (!res.headersSent) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
  
  next(error);
};

/**
 * 보안 헤더 로깅
 */
export const securityLogger = (req: Request, res: Response, next: NextFunction): void => {
  const securityInfo = {
    requestId: (req as LoggedRequest).requestId || 'unknown',
    headers: {
      origin: req.get('Origin'),
      referer: req.get('Referer'),
      xForwardedFor: req.get('X-Forwarded-For'),
      xRealIp: req.get('X-Real-IP'),
      authorization: req.get('Authorization') ? '[PRESENT]' : '[MISSING]',
      apiKey: req.get('X-API-Key') ? '[PRESENT]' : '[MISSING]'
    },
    suspicious: false
  };
  
  // 의심스러운 요청 패턴 감지
  const suspiciousPatterns = [
    /script/i,
    /eval/i,
    /union.*select/i,
    /drop.*table/i,
    /<script>/i
  ];
  
  const requestData = JSON.stringify(req.body || '');
  securityInfo.suspicious = suspiciousPatterns.some(pattern => pattern.test(requestData));
  
  if (securityInfo.suspicious) {
    logger.warn('Suspicious request detected', {
      ...securityInfo,
      warningType: 'SUSPICIOUS_REQUEST'
    });
  } else {
    logger.debug('Security check passed', securityInfo);
  }
  
  next();
};