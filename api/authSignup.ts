import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * SignUp API
 * POST /api/auth/signup
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
    const { email, username, password, phone, birth_date, birth_time, lunar_solar, referral_code } = req.body;

    // 입력 검증
    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        error: '이메일, 사용자명, 비밀번호는 필수 입력 항목입니다.',
      });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: '올바른 이메일 형식이 아닙니다.',
      });
    }

    // 비밀번호 강도 검증
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: '비밀번호는 최소 8자 이상이어야 합니다.',
      });
    }

    // TODO: 데이터베이스 연결 필요
    // 임시로 성공 응답
    return res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다. 관리자 승인 후 로그인이 가능합니다.',
      user: {
        id: Math.floor(Math.random() * 1000),
        email,
        username,
        approval_status: 'pending',
      },
    });
  } catch (error: any) {
    console.error('SignUp error:', error);
    return res.status(500).json({
      success: false,
      error: '회원가입 처리 중 오류가 발생했습니다.',
      details: error.message,
    });
  }
}
