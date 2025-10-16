import { Router } from 'express';
import {
  getUsers,
  approveUser,
  rejectUser,
  suspendUser,
  updateUserRole,
} from '@/controllers/admin.controller';
import {
  authenticateToken,
  requireAdmin,
} from '@/middleware/auth.middleware';

const router = Router();

/**
 * Admin Routes
 * 모든 admin 라우트는 authenticateToken + requireAdmin 미들웨어 필요
 */

// 사용자 목록 조회
router.get('/users', authenticateToken, requireAdmin, getUsers);

// 사용자 승인
router.post('/users/:id/approve', authenticateToken, requireAdmin, approveUser);

// 사용자 거부
router.post('/users/:id/reject', authenticateToken, requireAdmin, rejectUser);

// 사용자 정지
router.post('/users/:id/suspend', authenticateToken, requireAdmin, suspendUser);

// 사용자 역할 변경
router.patch('/users/:id/role', authenticateToken, requireAdmin, updateUserRole);

export default router;
