/**
 * Diaries API - PostgreSQL 기반
 *
 * @see packages/web/api/database/schema.sql
 * @author Claude Code
 * @version 2.0.0
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applySecurityMiddleware } from './_security';
import {
  getAllDiaries,
  getDiaryById,
  getDiaryByDate,
  getDiariesByTag,
  createDiary,
  updateDiary,
  deleteDiary,
  type Diary,
} from './_db';

/**
 * API 핸들러
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 보안 미들웨어 적용
  const middlewareResult = applySecurityMiddleware(req, res);
  if (middlewareResult) return middlewareResult;

  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGetDiaries(req, res);
      case 'POST':
        return await handleCreateDiary(req, res);
      case 'PUT':
        return await handleUpdateDiary(req, res);
      case 'DELETE':
        return await handleDeleteDiary(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/diaries - 일기 조회
 * Query params:
 * - date: 특정 날짜 (YYYY-MM-DD)
 * - tag: 태그로 필터링
 * - userId: 사용자 ID (기본값: 'default-user')
 * - id: 특정 일기 ID
 * - startDate: 검색 시작 날짜 (YYYY-MM-DD)
 * - endDate: 검색 종료 날짜 (YYYY-MM-DD)
 */
async function handleGetDiaries(req: VercelRequest, res: VercelResponse) {
  const { date, tag, userId = 'default-user', id, startDate, endDate } = req.query;

  let diaries: Diary[] | Diary | null;

  // 특정 ID로 조회
  if (id) {
    const diaryId = parseInt(id as string, 10);
    if (isNaN(diaryId)) {
      return res.status(400).json({ error: 'Invalid diary ID' });
    }
    diaries = await getDiaryById(diaryId);
    if (!diaries) {
      return res.status(404).json({ error: 'Diary not found' });
    }
    return res.status(200).json({
      success: true,
      data: { ...diaries, id: diaries.id.toString() },
    });
  }

  // 날짜로 조회
  if (date) {
    diaries = await getDiaryByDate(date as string, userId as string);
    if (!diaries) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }
    return res.status(200).json({
      success: true,
      data: { ...diaries, id: diaries.id.toString() },
    });
  }

  // 날짜 범위로 검색
  if (startDate && endDate) {
    const allDiaries = await getAllDiaries(userId as string);
    const filteredDiaries = allDiaries.filter(diary => {
      return diary.date >= startDate && diary.date <= endDate;
    });
    const formattedDiaries = filteredDiaries.map(diary => ({
      ...diary,
      id: diary.id.toString(),
    }));
    return res.status(200).json({
      success: true,
      data: formattedDiaries,
      total: formattedDiaries.length,
    });
  }

  // 태그로 조회
  if (tag) {
    diaries = await getDiariesByTag(tag as string, userId as string);
  } else {
    diaries = await getAllDiaries(userId as string);
  }

  // API 응답 형식 변환 (id를 string으로)
  const formattedDiaries = Array.isArray(diaries)
    ? diaries.map(diary => ({
        ...diary,
        id: diary.id.toString(),
      }))
    : [];

  return res.status(200).json({
    success: true,
    data: formattedDiaries,
    total: formattedDiaries.length,
  });
}

/**
 * POST /api/diaries - 일기 생성
 * Body:
 * - date: string (필수, YYYY-MM-DD)
 * - content: string (필수)
 * - mood?: string (이모지)
 * - weather?: string (이모지)
 * - tags?: string[]
 * - images?: string[]
 */
async function handleCreateDiary(req: VercelRequest, res: VercelResponse) {
  const {
    date,
    content,
    mood,
    weather,
    tags = [],
    images = [],
    user_id = 'default-user',
  } = req.body;

  // 필수 필드 검증
  if (!date || !content) {
    return res.status(400).json({
      error: 'Date and content are required',
    });
  }

  // 날짜 형식 검증
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(date)) {
    return res.status(400).json({
      error: 'Invalid date format. Use YYYY-MM-DD format.',
    });
  }

  // 배열 타입 검증
  if (!Array.isArray(tags) || !Array.isArray(images)) {
    return res.status(400).json({
      error: 'Tags and images must be arrays',
    });
  }

  // 중복 체크 (하루에 하나의 일기만 허용)
  const existing = await getDiaryByDate(date, user_id);
  if (existing) {
    return res.status(409).json({
      error: 'Diary for this date already exists. Use PUT to update.',
    });
  }

  // 일기 생성
  const newDiary = await createDiary({
    user_id: user_id || 'default-user',
    date,
    content,
    mood,
    weather,
    tags,
    images,
  });

  // API 응답 형식 변환
  const formattedDiary = {
    ...newDiary,
    id: newDiary.id.toString(),
  };

  return res.status(201).json({
    success: true,
    data: formattedDiary,
  });
}

/**
 * PUT /api/diaries?id={id} - 일기 수정
 * Query params:
 * - id: number (필수)
 * Body: Partial<Diary>
 */
async function handleUpdateDiary(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const updates = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Diary ID is required' });
  }

  const diaryId = parseInt(id as string, 10);

  if (isNaN(diaryId)) {
    return res.status(400).json({ error: 'Invalid diary ID' });
  }

  // 날짜 형식 검증 (업데이트하는 경우)
  if (updates.date) {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(updates.date)) {
      return res.status(400).json({
        error: 'Invalid date format. Use YYYY-MM-DD format.',
      });
    }
  }

  // 배열 타입 검증
  if (updates.tags && !Array.isArray(updates.tags)) {
    return res.status(400).json({ error: 'Tags must be an array' });
  }
  if (updates.images && !Array.isArray(updates.images)) {
    return res.status(400).json({ error: 'Images must be an array' });
  }

  // 일기 업데이트
  const updatedDiary = await updateDiary(diaryId, updates);

  if (!updatedDiary) {
    return res.status(404).json({ error: 'Diary not found' });
  }

  // API 응답 형식 변환
  const formattedDiary = {
    ...updatedDiary,
    id: updatedDiary.id.toString(),
  };

  return res.status(200).json({
    success: true,
    data: formattedDiary,
  });
}

/**
 * DELETE /api/diaries?id={id} - 일기 삭제
 * Query params:
 * - id: number (필수)
 */
async function handleDeleteDiary(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Diary ID is required' });
  }

  const diaryId = parseInt(id as string, 10);

  if (isNaN(diaryId)) {
    return res.status(400).json({ error: 'Invalid diary ID' });
  }

  // 일기 삭제
  const deletedDiary = await deleteDiary(diaryId);

  if (!deletedDiary) {
    return res.status(404).json({ error: 'Diary not found' });
  }

  // API 응답 형식 변환
  const formattedDiary = {
    ...deletedDiary,
    id: deletedDiary.id.toString(),
  };

  return res.status(200).json({
    success: true,
    data: formattedDiary,
  });
}
