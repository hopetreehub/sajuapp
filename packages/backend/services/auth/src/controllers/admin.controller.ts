import { Request, Response } from 'express';
import { getDatabase } from '@/database/database';
import { User, UserListFilter, sanitizeUsers } from '@/types/user.types';
import { logger } from '@/utils/logger.util';

/**
 * 사용자 목록 조회 (관리자용)
 * GET /api/admin/users
 */
export async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    const {
      approval_status,
      role,
      search,
      limit = '50',
      offset = '0',
    } = req.query as Partial<Record<keyof UserListFilter, string>>;

    const db = getDatabase();

    let query = 'SELECT * FROM users WHERE deleted_at IS NULL';
    const params: any[] = [];

    // 필터 적용
    if (approval_status) {
      query += ' AND approval_status = ?';
      params.push(approval_status);
    }

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    if (search) {
      query += ' AND (email LIKE ? OR username LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    // 정렬 및 페이징
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const users = await db.all<User>(query, params);

    // 전체 개수 조회
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL';
    const countParams: any[] = [];

    if (approval_status) {
      countQuery += ' AND approval_status = ?';
      countParams.push(approval_status);
    }

    if (role) {
      countQuery += ' AND role = ?';
      countParams.push(role);
    }

    if (search) {
      countQuery += ' AND (email LIKE ? OR username LIKE ?)';
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern);
    }

    const result = await db.get<{ total: number }>(countQuery, countParams);
    const total = result?.total || 0;

    res.json({
      success: true,
      users: sanitizeUsers(users),
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error: any) {
    logger.error('GetUsers error:', error);
    res.status(500).json({
      success: false,
      error: '사용자 목록 조회 중 오류가 발생했습니다.',
    });
  }
}

/**
 * 사용자 승인
 * POST /api/admin/users/:id/approve
 */
export async function approveUser(req: Request, res: Response): Promise<void> {
  try {
    const userId = parseInt(req.params.id);
    const adminId = req.user?.userId;

    if (!adminId) {
      res.status(401).json({
        success: false,
        error: '관리자 인증이 필요합니다.',
      });
      return;
    }

    const db = getDatabase();

    // 사용자 존재 확인
    const user = await db.get<Pick<User, 'id' | 'email' | 'approval_status'>>('SELECT id, email, approval_status FROM users WHERE id = ?', [userId]);

    if (!user) {
      res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.',
      });
      return;
    }

    if (user.approval_status === 'approved') {
      res.status(400).json({
        success: false,
        error: '이미 승인된 사용자입니다.',
      });
      return;
    }

    // 승인 처리
    await db.run(`
      UPDATE users
      SET approval_status = 'approved',
          approved_by = ?,
          approved_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [adminId, userId]);

    // 감사 로그 기록
    await db.run(`
      INSERT INTO audit_logs (admin_id, target_user_id, action, details)
      VALUES (?, ?, 'approve_user', ?)
    `, [adminId, userId, `Approved user: ${user.email}`]);

    logger.info(`User approved: ${user.email} (ID: ${userId}) by admin ${adminId}`);

    res.json({
      success: true,
      message: '사용자가 승인되었습니다.',
    });
  } catch (error: any) {
    logger.error('ApproveUser error:', error);
    res.status(500).json({
      success: false,
      error: '사용자 승인 중 오류가 발생했습니다.',
    });
  }
}

/**
 * 사용자 거부
 * POST /api/admin/users/:id/reject
 */
export async function rejectUser(req: Request, res: Response): Promise<void> {
  try {
    const userId = parseInt(req.params.id);
    const adminId = req.user?.userId;
    const { reason } = req.body;

    if (!adminId) {
      res.status(401).json({
        success: false,
        error: '관리자 인증이 필요합니다.',
      });
      return;
    }

    if (!reason) {
      res.status(400).json({
        success: false,
        error: '거부 사유를 입력해주세요.',
      });
      return;
    }

    const db = getDatabase();

    // 사용자 존재 확인
    const user = await db.get<Pick<User, 'id' | 'email'>>('SELECT id, email FROM users WHERE id = ?', [userId]);

    if (!user) {
      res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.',
      });
      return;
    }

    // 거부 처리
    await db.run(`
      UPDATE users
      SET approval_status = 'rejected',
          rejection_reason = ?
      WHERE id = ?
    `, [reason, userId]);

    // 감사 로그 기록
    await db.run(`
      INSERT INTO audit_logs (admin_id, target_user_id, action, details)
      VALUES (?, ?, 'reject_user', ?)
    `, [adminId, userId, `Rejected user: ${user.email}, Reason: ${reason}`]);

    logger.info(`User rejected: ${user.email} (ID: ${userId}) by admin ${adminId}`);

    res.json({
      success: true,
      message: '사용자가 거부되었습니다.',
    });
  } catch (error: any) {
    logger.error('RejectUser error:', error);
    res.status(500).json({
      success: false,
      error: '사용자 거부 중 오류가 발생했습니다.',
    });
  }
}

/**
 * 사용자 정지
 * POST /api/admin/users/:id/suspend
 */
export async function suspendUser(req: Request, res: Response): Promise<void> {
  try {
    const userId = parseInt(req.params.id);
    const adminId = req.user?.userId;

    if (!adminId) {
      res.status(401).json({
        success: false,
        error: '관리자 인증이 필요합니다.',
      });
      return;
    }

    const db = getDatabase();

    // 사용자 존재 확인
    const user = await db.get<Pick<User, 'id' | 'email' | 'role'>>('SELECT id, email, role FROM users WHERE id = ?', [userId]);

    if (!user) {
      res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.',
      });
      return;
    }

    // 관리자는 정지할 수 없음
    if (user.role === 'admin' || user.role === 'super_admin') {
      res.status(403).json({
        success: false,
        error: '관리자 계정은 정지할 수 없습니다.',
      });
      return;
    }

    // 정지 처리
    await db.run(`
      UPDATE users
      SET approval_status = 'suspended'
      WHERE id = ?
    `, [userId]);

    // 감사 로그 기록
    await db.run(`
      INSERT INTO audit_logs (admin_id, target_user_id, action, details)
      VALUES (?, ?, 'suspend_user', ?)
    `, [adminId, userId, `Suspended user: ${user.email}`]);

    logger.info(`User suspended: ${user.email} (ID: ${userId}) by admin ${adminId}`);

    res.json({
      success: true,
      message: '사용자가 정지되었습니다.',
    });
  } catch (error: any) {
    logger.error('SuspendUser error:', error);
    res.status(500).json({
      success: false,
      error: '사용자 정지 중 오류가 발생했습니다.',
    });
  }
}

/**
 * 사용자 역할 변경
 * PATCH /api/admin/users/:id/role
 */
export async function updateUserRole(req: Request, res: Response): Promise<void> {
  try {
    const userId = parseInt(req.params.id);
    const adminId = req.user?.userId;
    const { role } = req.body;

    if (!adminId) {
      res.status(401).json({
        success: false,
        error: '관리자 인증이 필요합니다.',
      });
      return;
    }

    if (!role || !['user', 'admin', 'super_admin'].includes(role)) {
      res.status(400).json({
        success: false,
        error: '유효한 역할을 지정해주세요 (user, admin, super_admin).',
      });
      return;
    }

    const db = getDatabase();

    // 사용자 존재 확인
    const user = await db.get<Pick<User, 'id' | 'email'>>('SELECT id, email FROM users WHERE id = ?', [userId]);

    if (!user) {
      res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.',
      });
      return;
    }

    // 역할 변경
    await db.run('UPDATE users SET role = ? WHERE id = ?', [role, userId]);

    // 감사 로그 기록
    await db.run(`
      INSERT INTO audit_logs (admin_id, target_user_id, action, details)
      VALUES (?, ?, 'change_role', ?)
    `, [adminId, userId, `Changed role to: ${role} for user: ${user.email}`]);

    logger.info(`User role changed: ${user.email} (ID: ${userId}) to ${role} by admin ${adminId}`);

    res.json({
      success: true,
      message: '사용자 역할이 변경되었습니다.',
    });
  } catch (error: any) {
    logger.error('UpdateUserRole error:', error);
    res.status(500).json({
      success: false,
      error: '역할 변경 중 오류가 발생했습니다.',
    });
  }
}

export default {
  getUsers,
  approveUser,
  rejectUser,
  suspendUser,
  updateUserRole,
};
