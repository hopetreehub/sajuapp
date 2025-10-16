import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { getDatabase } from '@/database/database';
import {
  User,
  SignUpRequest,
  LoginRequest,
  LoginResponse,
  sanitizeUser
} from '@/types/user.types';
import { generateToken } from '@/utils/jwt.util';
import { logger } from '@/utils/logger.util';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');

/**
 * 회원가입
 * POST /api/auth/signup
 */
export async function signUp(req: Request, res: Response): Promise<void> {
  try {
    const signUpData: SignUpRequest = req.body;

    // 입력 검증
    if (!signUpData.email || !signUpData.username || !signUpData.password) {
      res.status(400).json({
        success: false,
        error: '이메일, 사용자명, 비밀번호는 필수 입력 항목입니다.',
      });
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signUpData.email)) {
      res.status(400).json({
        success: false,
        error: '올바른 이메일 형식이 아닙니다.',
      });
      return;
    }

    // 비밀번호 강도 검증 (최소 8자, 영문+숫자 포함)
    if (signUpData.password.length < 8) {
      res.status(400).json({
        success: false,
        error: '비밀번호는 최소 8자 이상이어야 합니다.',
      });
      return;
    }

    const db = getDatabase();

    // 이메일 중복 확인
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [signUpData.email]);
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: '이미 사용 중인 이메일입니다.',
      });
      return;
    }

    // 추천 코드 검증 (선택사항)
    let referrerId = null;
    if (signUpData.referral_code) {
      const referrer = await db.get<{ id: number }>('SELECT id FROM users WHERE referral_code = ?', [signUpData.referral_code]);
      if (!referrer) {
        res.status(400).json({
          success: false,
          error: '유효하지 않은 추천 코드입니다.',
        });
        return;
      }
      referrerId = referrer.id;
    }

    // 비밀번호 해시 생성
    const passwordHash = await bcrypt.hash(signUpData.password, SALT_ROUNDS);

    // 사용자 추천 코드 생성
    const referralCode = generateReferralCode();

    // 사용자 생성
    const result = await db.run(`
      INSERT INTO users (
        email, username, password_hash, phone, birth_date, birth_time, lunar_solar,
        referral_code, referred_by, role, approval_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'user', 'pending', CURRENT_TIMESTAMP)
    `, [
      signUpData.email,
      signUpData.username,
      passwordHash,
      signUpData.phone || null,
      signUpData.birth_date || null,
      signUpData.birth_time || null,
      signUpData.lunar_solar || null,
      referralCode,
      referrerId
    ]);

    logger.info(`New user registered: ${signUpData.email} (ID: ${result.lastID})`);

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다. 관리자 승인 후 로그인이 가능합니다.',
      user: {
        id: result.lastID,
        email: signUpData.email,
        username: signUpData.username,
        approval_status: 'pending',
      },
    });
  } catch (error: any) {
    logger.error('SignUp error:', error);
    res.status(500).json({
      success: false,
      error: '회원가입 처리 중 오류가 발생했습니다.',
      details: error.message,
    });
  }
}

/**
 * 로그인
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const loginData: LoginRequest = req.body;

    // 입력 검증
    if (!loginData.email || !loginData.password) {
      res.status(400).json({
        success: false,
        error: '이메일과 비밀번호를 입력해주세요.',
      });
      return;
    }

    const db = getDatabase();

    // 사용자 조회
    const user = await db.get<User>('SELECT * FROM users WHERE email = ? AND deleted_at IS NULL', [loginData.email]);

    if (!user) {
      res.status(401).json({
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다.',
      });
      return;
    }

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(loginData.password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다.',
      });
      return;
    }

    // 승인 상태 확인
    if (user.approval_status === 'pending') {
      res.status(403).json({
        success: false,
        error: '관리자 승인 대기 중입니다. 승인되면 이메일로 알림을 드립니다.',
        approval_status: 'pending',
      });
      return;
    }

    if (user.approval_status === 'rejected') {
      res.status(403).json({
        success: false,
        error: `계정이 거부되었습니다. 사유: ${user.rejection_reason || '관리자에게 문의하세요'}`,
        approval_status: 'rejected',
      });
      return;
    }

    if (user.approval_status === 'suspended') {
      res.status(403).json({
        success: false,
        error: '계정이 정지되었습니다. 관리자에게 문의하세요.',
        approval_status: 'suspended',
      });
      return;
    }

    // JWT 토큰 생성 (승인된 사용자만)
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      approval_status: user.approval_status,
    });

    // 마지막 로그인 시간 업데이트
    await db.run('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    logger.info(`User logged in: ${user.email} (ID: ${user.id})`);

    const response: LoginResponse = {
      success: true,
      message: '로그인 성공',
      token,
      user: sanitizeUser(user),
    };

    res.json(response);
  } catch (error: any) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: '로그인 처리 중 오류가 발생했습니다.',
      details: error.message,
    });
  }
}

/**
 * 현재 사용자 정보 조회
 * GET /api/auth/me
 */
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: '인증이 필요합니다.',
      });
      return;
    }

    const db = getDatabase();
    const user = await db.get<User>('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL', [userId]);

    if (!user) {
      res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.',
      });
      return;
    }

    res.json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    logger.error('GetCurrentUser error:', error);
    res.status(500).json({
      success: false,
      error: '사용자 정보 조회 중 오류가 발생했습니다.',
    });
  }
}

/**
 * 로그아웃 (선택적 - 클라이언트에서 토큰 삭제로 처리 가능)
 * POST /api/auth/logout
 */
export async function logout(req: Request, res: Response): Promise<void> {
  try {
    // JWT는 stateless이므로 서버에서 특별히 할 일은 없음
    // 필요하다면 sessions 테이블에 토큰 블랙리스트 추가 가능

    logger.info('User logged out');

    res.json({
      success: true,
      message: '로그아웃되었습니다.',
    });
  } catch (error: any) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: '로그아웃 처리 중 오류가 발생했습니다.',
    });
  }
}

/**
 * 추천 코드 생성 헬퍼 함수
 */
function generateReferralCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

export default {
  signUp,
  login,
  getCurrentUser,
  logout,
};
