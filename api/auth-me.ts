import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Get Current User API
 * GET /api/auth/me
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

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.',
      });
    }

    const token = authHeader.split(' ')[1];

    // TODO: JWT 토큰 검증 필요
    // 임시로 테스트 토큰 허용
    if (token === 'test-token-12345') {
      return res.status(200).json({
        success: true,
        user: {
          id: 1,
          email: 'test@example.com',
          username: 'Test User',
          role: 'user',
          approval_status: 'approved',
          phone: null,
          birth_date: null,
          birth_time: null,
          lunar_solar: null,
          referral_code: 'TEST123',
          created_at: new Date().toISOString(),
          last_login_at: new Date().toISOString(),
        },
      });
    }

    return res.status(401).json({
      success: false,
      error: '유효하지 않은 토큰입니다.',
    });
  } catch (error: any) {
    console.error('GetCurrentUser error:', error);
    return res.status(500).json({
      success: false,
      error: '사용자 정보 조회 중 오류가 발생했습니다.',
      details: error.message,
    });
  }
}
