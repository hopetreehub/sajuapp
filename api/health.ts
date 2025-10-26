import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 환경 변수 확인
    const hasDbUrl = !!process.env.DATABASE_URL;
    const hasPostgresUrl = !!process.env.POSTGRES_URL;

    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        hasDbUrl,
        hasPostgresUrl,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      status: 'error',
      error: errorMessage,
    });
  }
}
