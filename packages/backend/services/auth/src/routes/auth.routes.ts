import { Router } from 'express';
import {
  signUp,
  login,
  getCurrentUser,
  logout,
} from '@/controllers/auth.controller';
import { authenticateToken } from '@/middleware/auth.middleware';

const router = Router();

/**
 * Auth Routes
 */

// 회원가입 (공개)
router.post('/signup', signUp);

// 로그인 (공개)
router.post('/login', login);

// 현재 사용자 정보 조회 (인증 필요)
router.get('/me', authenticateToken, getCurrentUser);

// 로그아웃 (인증 필요)
router.post('/logout', authenticateToken, logout);

export default router;
