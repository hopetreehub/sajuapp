import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Login API
 * POST /api/auth/login
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

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { email, password } = req.body;

    // 입력 검증
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: '이메일과 비밀번호를 입력해주세요.',
      });
    }

    // TODO: 데이터베이스 연결 필요
    // 임시로 테스트 계정 하나 허용
    if (email === 'test@example.com' && password === 'test1234') {
      return res.status(200).json({
        success: true,
        message: '로그인 성공',
        token: 'test-token-12345',
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
      error: '이메일 또는 비밀번호가 올바르지 않습니다.',
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: '로그인 처리 중 오류가 발생했습니다.',
      details: error.message,
    });
  }
}
