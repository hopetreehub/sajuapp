import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import nodemailer from 'nodemailer';

/**
 * 이메일 구독 신청 API
 * POST /api/subscribe - 구독 신청 및 이메일 알림 전송
 *
 * @author Claude Code
 * @version 1.0.0
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
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
    return await handleSubscribe(req, res);
  } catch (error: any) {
    console.error('Subscribe API error:', error);
    return res.status(500).json({
      success: false,
      error: '구독 처리 중 오류가 발생했습니다.',
      details: error.message,
    });
  }
}

/**
 * 구독 신청 처리
 */
async function handleSubscribe(req: VercelRequest, res: VercelResponse) {
  try {
    const { email, name, phone, message } = req.body;

    // 필수 값 검증
    if (!email) {
      return res.status(400).json({
        success: false,
        error: '이메일 주소가 필요합니다.',
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

    // subscribers 테이블 초기화
    await initializeSubscribersTable();

    // 중복 구독 확인
    const existingSubscriber = await sql`
      SELECT id, status
      FROM subscribers
      WHERE email = ${email}
      LIMIT 1
    `;

    if (existingSubscriber.rows.length > 0) {
      const subscriber = existingSubscriber.rows[0];

      if (subscriber.status === 'active') {
        return res.status(400).json({
          success: false,
          error: '이미 구독 중인 이메일 주소입니다.',
        });
      } else if (subscriber.status === 'unsubscribed') {
        // 재구독
        await sql`
          UPDATE subscribers
          SET status = 'active',
              name = ${name || null},
              phone = ${phone || null},
              message = ${message || null},
              subscribed_at = NOW(),
              unsubscribed_at = NULL
          WHERE id = ${subscriber.id}
        `;
      }
    } else {
      // 새 구독자 추가
      await sql`
        INSERT INTO subscribers (email, name, phone, message, status, subscribed_at)
        VALUES (${email}, ${name || null}, ${phone || null}, ${message || null}, 'active', NOW())
      `;
    }

    // 관리자에게 이메일 알림 전송
    try {
      await sendSubscriptionNotification({
        email,
        name,
        phone,
        message,
      });
      console.log('✅ 구독 알림 이메일 전송 완료');
    } catch (emailError: any) {
      console.error('❌ 이메일 전송 실패:', emailError);
      // 이메일 전송 실패해도 구독은 성공으로 처리
    }

    return res.status(200).json({
      success: true,
      message: '구독 신청이 완료되었습니다!',
      data: {
        email,
        subscribed_at: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Failed to process subscription:', error);
    return res.status(500).json({
      success: false,
      error: '구독 신청 처리에 실패했습니다.',
      details: error.message,
    });
  }
}

/**
 * subscribers 테이블 초기화
 */
async function initializeSubscribersTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(100),
        phone VARCHAR(20),
        message TEXT,
        status VARCHAR(20) DEFAULT 'active',
        subscribed_at TIMESTAMP DEFAULT NOW(),
        unsubscribed_at TIMESTAMP
      )
    `;
    console.log('✅ subscribers 테이블 확인/생성 완료');
  } catch (error: any) {
    console.error('Failed to initialize subscribers table:', error);
    throw error;
  }
}

/**
 * 관리자에게 구독 알림 이메일 전송
 */
async function sendSubscriptionNotification(data: {
  email: string;
  name?: string;
  phone?: string;
  message?: string;
}) {
  try {
    // 관리자 이메일 주소 조회
    const settingsResult = await sql`
      SELECT setting_value
      FROM system_settings
      WHERE setting_key = 'subscription_email'
      LIMIT 1
    `;

    if (settingsResult.rows.length === 0) {
      console.warn('⚠️ 구독 알림 수신 이메일이 설정되지 않았습니다.');
      return;
    }

    const adminEmail = settingsResult.rows[0].setting_value;

    if (!adminEmail) {
      console.warn('⚠️ 구독 알림 수신 이메일이 비어있습니다.');
      return;
    }

    // 환경 변수 확인
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      console.warn('⚠️ SMTP 설정이 없습니다. 이메일을 전송할 수 없습니다.');
      console.warn('환경 변수: SMTP_USER, SMTP_PASS를 설정해주세요.');
      return;
    }

    // Nodemailer transporter 생성
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false, // STARTTLS 사용
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // 이메일 내용 작성
    const mailOptions = {
      from: `"운명나침반" <${smtpUser}>`,
      to: adminEmail,
      subject: `🔔 새로운 이메일 구독 신청 - ${data.email}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4F46E5; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">
            📧 새로운 이메일 구독 신청
          </h2>

          <div style="margin-top: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; background-color: #f3f4f6; font-weight: bold; width: 120px;">이메일</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${data.email}</td>
              </tr>
              ${data.name ? `
              <tr>
                <td style="padding: 10px; background-color: #f3f4f6; font-weight: bold;">이름</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${data.name}</td>
              </tr>
              ` : ''}
              ${data.phone ? `
              <tr>
                <td style="padding: 10px; background-color: #f3f4f6; font-weight: bold;">연락처</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${data.phone}</td>
              </tr>
              ` : ''}
              ${data.message ? `
              <tr>
                <td style="padding: 10px; background-color: #f3f4f6; font-weight: bold; vertical-align: top;">메시지</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${data.message}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 10px; background-color: #f3f4f6; font-weight: bold;">신청일시</td>
                <td style="padding: 10px;">${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</td>
              </tr>
            </table>
          </div>

          <div style="margin-top: 30px; padding: 15px; background-color: #EEF2FF; border-left: 4px solid #4F46E5; border-radius: 5px;">
            <p style="margin: 0; color: #4338CA;">
              <strong>💡 다음 단계:</strong><br>
              구독자와 개별적으로 연락하여 서비스 정보를 제공해주세요.
            </p>
          </div>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #6b7280; font-size: 12px;">
            <p>이 이메일은 운명나침반 웹사이트의 자동 알림 시스템에서 발송되었습니다.</p>
            <p>문의: ${smtpUser}</p>
          </div>
        </div>
      `,
    };

    // 이메일 전송
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ 이메일 전송 성공:', info.messageId);
  } catch (error: any) {
    console.error('❌ 이메일 전송 실패:', error);
    throw error;
  }
}
