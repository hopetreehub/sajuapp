import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { SERVICE_CONFIG } from '@/config/ai.config';
import { logger } from '@/utils/logger';

/**
 * 기본 API 요청 제한
 */
export const rateLimitMiddleware = rateLimit({
  windowMs: SERVICE_CONFIG.rateLimit.windowMs, // 1분
  max: SERVICE_CONFIG.rateLimit.maxRequests, // 요청 제한
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
    retryAfter: Math.ceil(SERVICE_CONFIG.rateLimit.windowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // IP + 사용자 ID 기반으로 키 생성
    const userId = (req as any).userId || 'anonymous';
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    return `${clientIP}:${userId}`;
  },
  onLimitReached: (req: Request, res: Response) => {
    const userId = (req as any).userId || 'anonymous';
    const clientIP = req.ip || 'unknown';
    logger.warn(`Rate limit exceeded for user ${userId} from IP ${clientIP}`);
  }
});

/**
 * AI 서비스 전용 고급 제한 (토큰 기반)
 */
export const aiServiceRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: async (req: Request) => {
    const userId = (req as any).userId || 'anonymous';
    
    // 사용자 등급별 제한 (실제로는 데이터베이스에서 조회)
    const userTiers: Record<string, number> = {
      'premium': 200,
      'pro': 100,
      'basic': 50,
      'anonymous': 20
    };
    
    // 사용자 등급 확인 (간단한 로직)
    let userTier = 'anonymous';
    if (userId.startsWith('user_') || userId.startsWith('apikey_')) {
      userTier = 'basic';
    }
    
    return userTiers[userTier] || userTiers['anonymous'];
  },
  message: (req: Request) => ({
    success: false,
    error: 'AI service rate limit exceeded',
    message: 'Too many AI requests. Please upgrade your plan or try again later.',
    userId: (req as any).userId,
    retryAfter: 60
  }),
  keyGenerator: (req: Request) => {
    const userId = (req as any).userId || 'anonymous';
    return `ai_service:${userId}`;
  },
  onLimitReached: (req: Request) => {
    const userId = (req as any).userId || 'anonymous';
    logger.warn(`AI service rate limit exceeded for user: ${userId}`);
  }
});

/**
 * 토큰 사용량 기반 제한
 */
export class TokenRateLimiter {
  private tokenUsage: Map<string, { tokens: number; resetTime: number }> = new Map();
  
  constructor(
    private tokensPerMinute: number = SERVICE_CONFIG.rateLimit.tokensPerMinute,
    private windowMs: number = 60 * 1000
  ) {}
  
  public middleware = (req: Request, res: Response, next: Function) => {
    const userId = (req as any).userId || 'anonymous';
    const now = Date.now();
    
    // 토큰 사용량 확인
    let usage = this.tokenUsage.get(userId);
    
    if (!usage || now > usage.resetTime) {
      // 새 윈도우 시작
      usage = { tokens: 0, resetTime: now + this.windowMs };
      this.tokenUsage.set(userId, usage);
    }
    
    // 예상 토큰 사용량 계산 (요청 내용 기반)
    const estimatedTokens = this.estimateTokenUsage(req.body);
    
    if (usage.tokens + estimatedTokens > this.tokensPerMinute) {
      res.status(429).json({
        success: false,
        error: 'Token usage limit exceeded',
        message: 'Monthly token quota exceeded. Please upgrade your plan.',
        usage: {
          current: usage.tokens,
          estimated: estimatedTokens,
          limit: this.tokensPerMinute,
          resetTime: new Date(usage.resetTime).toISOString()
        }
      });
      return;
    }
    
    // 토큰 사용량 예약
    usage.tokens += estimatedTokens;
    (req as any).estimatedTokens = estimatedTokens;
    
    next();
  };
  
  private estimateTokenUsage(body: any): number {
    if (!body) return 100; // 기본값
    
    let totalChars = 0;
    
    // 요청 내용에서 텍스트 길이 계산
    if (body.sajuData) {
      totalChars += JSON.stringify(body.sajuData).length;
    }
    if (body.diaryContent) {
      totalChars += body.diaryContent.length;
    }
    if (body.focusAreas) {
      totalChars += body.focusAreas.join('').length;
    }
    
    // 대략적인 토큰 수 계산 (영어: 4자당 1토큰, 한국어: 1-2자당 1토큰)
    const estimatedTokens = Math.ceil(totalChars / 2) + 200; // 응답 토큰 추가
    
    return Math.min(estimatedTokens, 4000); // 최대값 제한
  }
  
  public updateActualUsage(userId: string, actualTokens: number): void {
    const usage = this.tokenUsage.get(userId);
    if (usage) {
      // 실제 사용량으로 조정 (예상값과의 차이 반영)
      const estimated = (usage as any).estimated || 0;
      const difference = actualTokens - estimated;
      usage.tokens = Math.max(0, usage.tokens + difference);
    }
  }
}

export const tokenRateLimiter = new TokenRateLimiter();

/**
 * 헬스체크 제외 미들웨어
 */
export const skipRateLimitForHealth = (req: Request, res: Response, next: Function) => {
  if (req.path.startsWith('/health')) {
    return next();
  }
  return rateLimitMiddleware(req, res, next);
};