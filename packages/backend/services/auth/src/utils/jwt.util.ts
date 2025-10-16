import jwt from 'jsonwebtoken';
import { JWTPayload, UserRole, ApprovalStatus } from '@/types/user.types';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '7d';

/**
 * JWT 토큰 생성
 */
export function generateToken(payload: {
  userId: number;
  email: string;
  role: UserRole;
  approval_status: ApprovalStatus;
}): string {
  const jwtPayload: JWTPayload = {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    approval_status: payload.approval_status,
  };

  return jwt.sign(jwtPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });
}

/**
 * JWT 토큰 검증
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * JWT 토큰에서 사용자 ID 추출
 */
export function getUserIdFromToken(token: string): number | null {
  const payload = verifyToken(token);
  return payload ? payload.userId : null;
}

/**
 * Authorization 헤더에서 토큰 추출
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * 토큰 만료 시간 확인
 */
export function isTokenExpired(token: string): boolean {
  const payload = verifyToken(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

export default {
  generateToken,
  verifyToken,
  getUserIdFromToken,
  extractTokenFromHeader,
  isTokenExpired,
};
