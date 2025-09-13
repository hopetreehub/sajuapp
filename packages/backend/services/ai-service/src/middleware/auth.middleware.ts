import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export interface AuthRequest extends Request {
  userId?: string;
  apiKey?: string;
}

/**
 * API 키 검증 미들웨어
 * 개발 단계에서는 간단한 검증, 실제 운영에서는 더 강화된 인증 필요
 */
export const validateApiKey = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const apiKey = req.headers['x-api-key'] as string;
    
    // 헬스체크는 인증 생략
    if (req.path.startsWith('/health')) {
      return next();
    }
    
    // API 키 또는 Bearer 토큰 확인
    if (!authHeader && !apiKey) {
      res.status(401).json({
        success: false,
        error: 'Missing authentication credentials',
        message: 'API key or authorization header required'
      });
      return;
    }
    
    let userId = 'anonymous';
    let validatedApiKey = '';
    
    // Bearer 토큰 처리
    if (authHeader) {
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        // JWT 토큰 검증 로직 (실제 구현에서는 JWT 라이브러리 사용)
        if (token && token.length > 10) {
          userId = `user_${Buffer.from(token.substring(0, 10)).toString('base64')}`;
          validatedApiKey = token;
        } else {
          res.status(401).json({
            success: false,
            error: 'Invalid authorization token'
          });
          return;
        }
      } else {
        res.status(401).json({
          success: false,
          error: 'Invalid authorization format',
          message: 'Use Bearer token format'
        });
        return;
      }
    }
    
    // API 키 처리
    if (apiKey) {
      // 개발용 간단한 API 키 검증
      const validApiKeys = [
        'saju-dev-key-12345',
        'ai-service-key-67890',
        'fortune-api-key-abcde'
      ];
      
      if (!validApiKeys.includes(apiKey)) {
        res.status(401).json({
          success: false,
          error: 'Invalid API key'
        });
        return;
      }
      
      userId = `apikey_${apiKey.substring(-8)}`;
      validatedApiKey = apiKey;
    }
    
    // 요청 객체에 사용자 정보 추가
    req.userId = userId;
    req.apiKey = validatedApiKey;
    
    logger.debug(`Authentication successful for user: ${userId}`);
    next();
    
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication service error'
    });
  }
};

/**
 * 관리자 권한 확인 미들웨어
 */
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const adminKeys = ['saju-admin-key-xyz', 'ai-service-admin-key'];
  
  if (!req.apiKey || !adminKeys.includes(req.apiKey)) {
    res.status(403).json({
      success: false,
      error: 'Admin privileges required'
    });
    return;
  }
  
  next();
};

/**
 * 사용자별 요청 제한 미들웨어
 */
export const validateUserQuota = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // 실제 구현에서는 Redis 등을 사용한 사용자별 quota 관리
  // 현재는 개발용 간단 구현
  
  const userQuotas: Record<string, { daily: number; used: number }> = {
    'default': { daily: 1000, used: 0 }
  };
  
  const userId = req.userId || 'default';
  const userQuota = userQuotas[userId] || userQuotas['default'];
  
  if (userQuota.used >= userQuota.daily) {
    res.status(429).json({
      success: false,
      error: 'Daily quota exceeded',
      quota: {
        daily: userQuota.daily,
        used: userQuota.used,
        remaining: userQuota.daily - userQuota.used
      }
    });
    return;
  }
  
  // 사용량 증가 (실제로는 Redis 등에서 atomic 연산 필요)
  userQuota.used++;
  
  next();
};

/**
 * IP 기반 요청 제한 (추가 보안)
 */
export const validateIPRestriction = (req: Request, res: Response, next: NextFunction): void => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  
  // 허용된 IP 대역 (실제 운영에서는 환경변수로 관리)
  const allowedIPs = [
    '127.0.0.1',
    '::1',
    'localhost'
  ];
  
  const allowedNetworks = [
    /^10\..*/, // Private network
    /^192\.168\..*/, // Private network
    /^172\.(1[6-9]|2[0-9]|3[01])\..*/ // Private network
  ];
  
  const isAllowed = allowedIPs.includes(clientIP) || 
                   allowedNetworks.some(pattern => pattern.test(clientIP));
  
  if (!isAllowed) {
    logger.warn(`Request from unauthorized IP: ${clientIP}`);
    res.status(403).json({
      success: false,
      error: 'Access denied from this IP address'
    });
    return;
  }
  
  next();
};