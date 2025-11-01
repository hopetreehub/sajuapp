import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

/**
 * 이메일 구독 설정 API
 * GET /api/subscriptionSettings - 설정 조회
 * POST /api/subscriptionSettings - 설정 저장
 *
 * @author Claude Code
 * @version 1.0.0
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      return await handleGet(req, res);
    } else if (req.method === 'POST') {
      return await handlePost(req, res);
    } else {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
      });
    }
  } catch (error: any) {
    console.error('SubscriptionSettings API error:', error);
    return res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다.',
      details: error.message,
    });
  }
}

/**
 * 구독 설정 조회
 */
async function handleGet(req: VercelRequest, res: VercelResponse) {
  try {
    // system_settings 테이블이 없으면 생성
    await initializeSettingsTable();

    // 구독 이메일 설정 조회
    const result = await sql`
      SELECT setting_value
      FROM system_settings
      WHERE setting_key = 'subscription_email'
      LIMIT 1
    `;

    if (result.rows.length > 0) {
      return res.status(200).json({
        success: true,
        data: {
          subscription_email: result.rows[0].setting_value,
        },
      });
    } else {
      // 설정이 없으면 빈 값 반환
      return res.status(200).json({
        success: true,
        data: {
          subscription_email: '',
        },
      });
    }
  } catch (error: any) {
    console.error('Failed to get subscription settings:', error);
    return res.status(500).json({
      success: false,
      error: '설정을 불러오는데 실패했습니다.',
      details: error.message,
    });
  }
}

/**
 * 구독 설정 저장
 */
async function handlePost(req: VercelRequest, res: VercelResponse) {
  try {
    const { subscription_email } = req.body;

    if (!subscription_email) {
      return res.status(400).json({
        success: false,
        error: '이메일 주소가 필요합니다.',
      });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(subscription_email)) {
      return res.status(400).json({
        success: false,
        error: '올바른 이메일 형식이 아닙니다.',
      });
    }

    // system_settings 테이블이 없으면 생성
    await initializeSettingsTable();

    // UPSERT: 이미 있으면 업데이트, 없으면 삽입
    await sql`
      INSERT INTO system_settings (setting_key, setting_value, updated_at)
      VALUES ('subscription_email', ${subscription_email}, NOW())
      ON CONFLICT (setting_key)
      DO UPDATE SET
        setting_value = EXCLUDED.setting_value,
        updated_at = NOW()
    `;

    return res.status(200).json({
      success: true,
      message: '이메일 설정이 저장되었습니다.',
      data: {
        subscription_email,
      },
    });
  } catch (error: any) {
    console.error('Failed to save subscription settings:', error);
    return res.status(500).json({
      success: false,
      error: '설정 저장에 실패했습니다.',
      details: error.message,
    });
  }
}

/**
 * system_settings 테이블 초기화
 */
async function initializeSettingsTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS system_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(255) UNIQUE NOT NULL,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ system_settings 테이블 확인/생성 완료');
  } catch (error: any) {
    console.error('Failed to initialize system_settings table:', error);
    throw error;
  }
}
