/**
 * 보안 미들웨어
 *
 * Rate Limiting, CORS, XSS, CSRF 방지 등
 * @author Claude Code
 * @version 1.0.0
 */

import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * CORS 헤더 설정
 */
export function setCORSHeaders(res: VercelResponse, allowedOrigins?: string[]) {
  const defaultOrigins = [
    'https://sajuapp.vercel.app',
    'https://sajuapp-prod.vercel.app',
    'http://localhost:4000',
  ];

  const origins = allowedOrigins || defaultOrigins;
  const origin = origins.join(',');

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24시간
}

/**
 * 보안 헤더 설정 (Helmet.js 스타일)
 */
export function setSecurityHeaders(res: VercelResponse) {
  // XSS 방지
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // DENY에서 SAMEORIGIN으로 완화
  res.setHeader('X-XSS-Protection', '0'); // 최신 브라우저에서는 사용 안 함

  // CSP (Content Security Policy) - 더 엄격하게 설정
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "img-src 'self' data: https: blob:; " +
      "font-src 'self' data: https://fonts.gstatic.com; " +
      "connect-src 'self' https: wss:; " +
      "frame-src 'none'; " +
      "object-src 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self'; " +
      'upgrade-insecure-requests;',
  );

  // Strict Transport Security (HTTPS 강제)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy (Feature Policy)
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=()',
  );

  // Content-Type 강제
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Download Options (IE only)
  res.setHeader('X-Download-Options', 'noopen');

  // DNS Prefetch Control
  res.setHeader('X-DNS-Prefetch-Control', 'off');
}

/**
 * Rate Limiter (메모리 기반 - 간단한 구현)
 * 프로덕션에서는 Redis 또는 Vercel KV 사용 권장
 */
class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }>;
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 60, windowMs: number = 60000) {
    this.requests = new Map();
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Rate limit 체크
   */
  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = this.requests.get(identifier);

    // 레코드가 없거나 윈도우가 만료된 경우
    if (!record || now > record.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs,
      };
    }

    // 제한 초과
    if (record.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
      };
    }

    // 카운트 증가
    record.count++;
    this.requests.set(identifier, record);

    return {
      allowed: true,
      remaining: this.maxRequests - record.count,
      resetTime: record.resetTime,
    };
  }

  /**
   * 주기적으로 만료된 레코드 정리
   */
  cleanup() {
    const now = Date.now();
    for (const [identifier, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(identifier);
      }
    }
  }
}

// 전역 Rate Limiter 인스턴스
const globalRateLimiter = new RateLimiter(60, 60000); // 60 requests per minute

// Note: Vercel Serverless Functions는 stateless이므로 setInterval 사용 불가
// 프로덕션에서는 Vercel KV 또는 Redis 사용 권장
// setInterval(() => globalRateLimiter.cleanup(), 60000);

/**
 * Rate Limiting 미들웨어
 */
export function rateLimit(req: VercelRequest, res: VercelResponse): boolean {
  // IP 주소 또는 User ID로 식별
  const identifier =
    req.headers['x-forwarded-for']?.toString().split(',')[0] ||
    req.socket.remoteAddress ||
    'unknown';

  const result = globalRateLimiter.check(identifier);

  // Rate limit 헤더 설정
  res.setHeader('X-RateLimit-Limit', '60');
  res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
  res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

  if (!result.allowed) {
    res.status(429).json({
      error: 'Too Many Requests',
      message: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
      retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
    });
    return false;
  }

  return true;
}

/**
 * XSS 방지 - 입력 값 검증
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * SQL Injection 방지 체크 (추가 검증)
 * 참고: @vercel/postgres는 Parameterized Queries를 사용하므로 기본적으로 안전
 */
export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\bUNION\b.*\bSELECT\b)/i,
    /(\bDROP\b.*\bTABLE\b)/i,
    /(\bINSERT\b.*\bINTO\b)/i,
    /(\bDELETE\b.*\bFROM\b)/i,
    /(\bUPDATE\b.*\bSET\b)/i,
    /(\bEXEC\b|\bEXECUTE\b)/i,
    /(--|#|\/\*|\*\/)/,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * CSRF 토큰 생성 (간단한 구현)
 * 프로덕션에서는 더 강력한 CSRF 라이브러리 사용 권장
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * CSRF 토큰 검증
 */
export function verifyCSRFToken(req: VercelRequest, expectedToken: string): boolean {
  const token = req.headers['x-csrf-token'] as string;
  return token === expectedToken;
}

/**
 * 통합 보안 미들웨어
 */
export function applySecurity(req: VercelRequest, res: VercelResponse): boolean {
  // 1. CORS 헤더 설정
  setCORSHeaders(res);

  // 2. 보안 헤더 설정
  setSecurityHeaders(res);

  // 3. OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return false; // 더 이상 처리하지 않음
  }

  // 4. Rate Limiting
  if (!rateLimit(req, res)) {
    return false;
  }

  return true;
}

/**
 * 입력 검증 (종합)
 */
export function validateInput(input: unknown, fieldName: string): {
  valid: boolean;
  error?: string;
  sanitized?: string;
} {
  // null/undefined 체크
  if (input === null || input === undefined) {
    return { valid: false, error: `${fieldName}은(는) 필수 입력값입니다.` };
  }

  // 문자열 타입 체크
  if (typeof input !== 'string') {
    return { valid: false, error: `${fieldName}은(는) 문자열이어야 합니다.` };
  }

  // SQL Injection 체크
  if (detectSQLInjection(input)) {
    return { valid: false, error: `${fieldName}에 허용되지 않는 문자가 포함되어 있습니다.` };
  }

  // XSS 방지
  const sanitized = sanitizeInput(input);

  return { valid: true, sanitized };
}

/**
 * 통합 보안 미들웨어 (main export)
 *
 * @param req - Vercel Request
 * @param res - Vercel Response
 * @param options - 보안 옵션
 * @returns void | Response (false인 경우 요청 중단)
 */
export function applySecurityMiddleware(
  req: VercelRequest,
  res: VercelResponse,
  options: {
    enableCSRF?: boolean;
    csrfToken?: string;
  } = {},
): void | VercelResponse {
  // 1. CORS 헤더 설정
  setCORSHeaders(res);

  // 2. 보안 헤더 설정
  setSecurityHeaders(res);

  // 3. OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 4. Rate Limiting
  if (!rateLimit(req, res)) {
    return; // 이미 응답 전송됨
  }

  // 5. CSRF 검증 (POST/PUT/DELETE 메소드에만 적용)
  if (options.enableCSRF && ['POST', 'PUT', 'DELETE'].includes(req.method || '')) {
    if (!options.csrfToken) {
      return res.status(400).json({
        error: 'CSRF token is required',
        message: 'CSRF 토큰이 필요합니다.',
      });
    }

    if (!verifyCSRFToken(req, options.csrfToken)) {
      return res.status(403).json({
        error: 'Invalid CSRF token',
        message: '유효하지 않은 CSRF 토큰입니다.',
      });
    }
  }
}
