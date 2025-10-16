import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt.util';
import { getDatabase } from '@/database/database';
import { User, JWTPayload } from '@/types/user.types';
import { logger } from '@/utils/logger.util';

/**
 * Request 타입 확장 (user 속성 추가)
 */
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * JWT 토큰 검증 미들웨어
 * Authorization 헤더에서 토큰을 추출하고 검증
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        success: false,
        error: '인증 토큰이 필요합니다.',
      });
      return;
    }

    const payload = verifyToken(token);

    if (!payload) {
      res.status(401).json({
        success: false,
        error: '유효하지 않거나 만료된 토큰입니다.',
      });
      return;
    }

    // Request 객체에 사용자 정보 첨부
    req.user = payload;
    next();
  } catch (error: any) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      error: '인증 처리 중 오류가 발생했습니다.',
    });
  }
}

/**
 * 승인된 사용자만 접근 가능하도록 하는 미들웨어
 * authenticateToken 이후에 사용
 */
export async function requireApprovedUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: '로그인이 필요합니다.',
      });
      return;
    }

    const db = getDatabase();
    const user = await db.get<Pick<User, 'approval_status' | 'role'>>('SELECT approval_status, role FROM users WHERE id = ?', [userId]);

    if (!user) {
      res.status(401).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.',
      });
      return;
    }

    if (user.approval_status !== 'approved') {
      res.status(403).json({
        success: false,
        error: '관리자 승인이 필요합니다.',
        approval_status: user.approval_status,
      });
      return;
    }

    next();
  } catch (error: any) {
    logger.error('Approval check error:', error);
    res.status(500).json({
      success: false,
      error: '승인 상태 확인 중 오류가 발생했습니다.',
    });
  }
}

/**
 * 관리자 권한 확인 미들웨어
 * authenticateToken + requireApprovedUser 이후에 사용
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userRole = req.user?.role;

    if (!userRole || (userRole !== 'admin' && userRole !== 'super_admin')) {
      res.status(403).json({
        success: false,
        error: '관리자 권한이 필요합니다.',
      });
      return;
    }

    next();
  } catch (error: any) {
    logger.error('Admin check error:', error);
    res.status(500).json({
      success: false,
      error: '권한 확인 중 오류가 발생했습니다.',
    });
  }
}

/**
 * 슈퍼 관리자 권한 확인 미들웨어
 */
export async function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'super_admin') {
      res.status(403).json({
        success: false,
        error: '슈퍼 관리자 권한이 필요합니다.',
      });
      return;
    }

    next();
  } catch (error: any) {
    logger.error('Super admin check error:', error);
    res.status(500).json({
      success: false,
      error: '권한 확인 중 오류가 발생했습니다.',
    });
  }
}

export default {
  authenticateToken,
  requireApprovedUser,
  requireAdmin,
  requireSuperAdmin,
};
