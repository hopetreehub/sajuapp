import { VercelRequest, VercelResponse } from '@vercel/node';

// 임시 사용자 데이터 (메모리 상에서 관리)
let users = [
  {
    id: 1,
    email: 'test@example.com',
    username: 'Test User',
    role: 'user',
    approval_status: 'approved',
    phone: '010-1234-5678',
    birth_date: '1990-01-01',
    birth_time: '12:00',
    lunar_solar: 'solar',
    referral_code: 'TEST123',
    created_at: '2025-01-01T00:00:00.000Z',
    last_login_at: '2025-10-26T00:00:00.000Z',
  },
  {
    id: 2,
    email: 'pending@example.com',
    username: 'Pending User',
    role: 'user',
    approval_status: 'pending',
    phone: '010-2345-6789',
    birth_date: '1992-05-15',
    birth_time: '14:30',
    lunar_solar: 'lunar',
    referral_code: 'PEND456',
    created_at: '2025-10-25T00:00:00.000Z',
    last_login_at: null,
  },
  {
    id: 3,
    email: 'pending2@example.com',
    username: 'Another Pending',
    role: 'user',
    approval_status: 'pending',
    phone: '010-3456-7890',
    birth_date: '1988-08-20',
    birth_time: '09:15',
    lunar_solar: 'solar',
    referral_code: 'PEND789',
    created_at: '2025-10-26T00:00:00.000Z',
    last_login_at: null,
  },
  {
    id: 999,
    email: 'admin@sajuapp.com',
    username: 'Administrator',
    role: 'admin',
    approval_status: 'approved',
    phone: null,
    birth_date: null,
    birth_time: null,
    lunar_solar: null,
    referral_code: 'ADMIN999',
    created_at: '2025-01-01T00:00:00.000Z',
    last_login_at: '2025-10-26T20:00:00.000Z',
  },
];

/**
 * Admin Users Management API
 * GET /api/adminUsers - 사용자 목록 조회
 * POST /api/adminUsers - 사용자 승인/거부/정지/역할변경
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 관리자 권한 체크
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다.',
    });
  }

  const token = authHeader.split(' ')[1];

  // 관리자 토큰 확인
  if (token !== 'admin-token-67890') {
    return res.status(403).json({
      success: false,
      error: '관리자 권한이 필요합니다.',
    });
  }

  try {
    if (req.method === 'GET') {
      return await handleGetUsers(req, res);
    } else if (req.method === 'POST' || req.method === 'PATCH') {
      return await handleUserAction(req, res);
    } else {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
      });
    }
  } catch (error: any) {
    console.error('AdminUsers API error:', error);
    return res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다.',
      details: error.message,
    });
  }
}

/**
 * 사용자 목록 조회
 */
async function handleGetUsers(req: VercelRequest, res: VercelResponse) {
  const { approval_status, search } = req.query;

  // 필터링
  let filteredUsers = [...users];

  if (approval_status && approval_status !== 'all') {
    filteredUsers = filteredUsers.filter(u => u.approval_status === approval_status);
  }

  if (search) {
    const searchLower = String(search).toLowerCase();
    filteredUsers = filteredUsers.filter(u =>
      u.email.toLowerCase().includes(searchLower) ||
      u.username.toLowerCase().includes(searchLower)
    );
  }

  return res.status(200).json({
    success: true,
    users: filteredUsers,
    pagination: {
      total: filteredUsers.length,
      limit: 100,
      offset: 0,
    },
  });
}

/**
 * 사용자 액션 처리 (승인/거부/정지/역할변경)
 */
async function handleUserAction(req: VercelRequest, res: VercelResponse) {
  const { action, userId, role, reason } = req.body;

  if (!action || !userId) {
    return res.status(400).json({
      success: false,
      error: 'action과 userId가 필요합니다.',
    });
  }

  // 사용자 찾기
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      error: '사용자를 찾을 수 없습니다.',
    });
  }

  let message = '';

  switch (action) {
    case 'approve':
      users[userIndex].approval_status = 'approved';
      users[userIndex].last_login_at = new Date().toISOString();
      message = '사용자가 승인되었습니다.';
      break;

    case 'reject':
      if (!reason) {
        return res.status(400).json({
          success: false,
          error: '거부 사유가 필요합니다.',
        });
      }
      users[userIndex].approval_status = 'rejected';
      message = `사용자가 거부되었습니다. (사유: ${reason})`;
      break;

    case 'suspend':
      users[userIndex].approval_status = 'suspended';
      message = '사용자가 정지되었습니다.';
      break;

    case 'change_role':
      if (!role) {
        return res.status(400).json({
          success: false,
          error: '변경할 역할이 필요합니다.',
        });
      }
      users[userIndex].role = role;
      message = `사용자의 역할이 ${role}(으)로 변경되었습니다.`;
      break;

    default:
      return res.status(400).json({
        success: false,
        error: '올바르지 않은 action입니다.',
      });
  }

  return res.status(200).json({
    success: true,
    message,
    user: users[userIndex],
  });
}
