import { Router, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { getDatabase } from '../database/init';

const router = Router();

/**
 * POST /api/share
 * 귀문둔갑 차트 공유 생성
 */
router.post('/share', async (req: Request, res: Response) => {
  try {
    const {
      chart_data,
      date_time,
      customer_name,
      customer_birth_date,
      context,
      note,
      tags,
    } = req.body;

    // 필수 필드 검증
    if (!chart_data || !date_time || !context) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: chart_data, date_time, context',
      });
    }

    // UUID 생성 (10자리 짧은 ID)
    const uuid = nanoid(10);

    // 데이터베이스에 저장
    const db = await getDatabase();

    const result = await db.run(
      `INSERT INTO qimen_shares
       (uuid, chart_data, date_time, customer_name, customer_birth_date, context, note, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuid,
        JSON.stringify(chart_data),
        date_time,
        customer_name || null,
        customer_birth_date || null,
        context,
        note || null,
        tags ? JSON.stringify(tags) : null,
      ]
    );

    // 공유 URL 생성
    const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
    const shareUrl = `${baseUrl}/qimen/share/${uuid}`;

    res.status(201).json({
      success: true,
      data: {
        id: result.lastID,
        uuid,
        share_url: shareUrl,
        short_url: shareUrl, // TODO: 단축 URL 서비스 연동
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Share creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create share',
    });
  }
});

/**
 * GET /api/share/:uuid
 * 공유된 귀문둔갑 차트 조회
 */
router.get('/share/:uuid', async (req: Request, res: Response) => {
  try {
    const { uuid } = req.params;

    const db = await getDatabase();

    // 조회수 증가
    await db.run(
      'UPDATE qimen_shares SET view_count = view_count + 1 WHERE uuid = ? AND is_active = 1',
      [uuid]
    );

    // 데이터 조회
    const share = await db.get(
      `SELECT
        uuid,
        chart_data,
        date_time,
        customer_name,
        customer_birth_date,
        context,
        note,
        tags,
        created_at,
        view_count
       FROM qimen_shares
       WHERE uuid = ? AND is_active = 1`,
      [uuid]
    );

    if (!share) {
      return res.status(404).json({
        success: false,
        error: 'Share not found or has been deleted',
      });
    }

    // JSON 파싱
    const data = {
      ...share,
      chart_data: JSON.parse(share.chart_data),
      tags: share.tags ? JSON.parse(share.tags) : [],
    };

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Share retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve share',
    });
  }
});

/**
 * DELETE /api/share/:uuid
 * 공유 삭제 (소프트 삭제)
 */
router.delete('/share/:uuid', async (req: Request, res: Response) => {
  try {
    const { uuid } = req.params;

    const db = await getDatabase();

    const result = await db.run(
      'UPDATE qimen_shares SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE uuid = ?',
      [uuid]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Share not found',
      });
    }

    res.json({
      success: true,
      message: 'Share deleted successfully',
    });
  } catch (error) {
    console.error('Share deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete share',
    });
  }
});

/**
 * GET /api/shares/stats
 * 공유 통계
 */
router.get('/shares/stats', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();

    const stats = await db.get(`
      SELECT
        COUNT(*) as total_shares,
        SUM(view_count) as total_views,
        AVG(view_count) as avg_views_per_share
      FROM qimen_shares
      WHERE is_active = 1
    `);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Stats retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve stats',
    });
  }
});

export default router;
