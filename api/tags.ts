/**
 * Tags API - PostgreSQL 기반
 *
 * @see packages/web/api/database/schema.sql
 * @author Claude Code
 * @version 2.0.0
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applySecurityMiddleware } from './_security';
import {
  getAllTags,
  getTagById,
  getTagByName,
  createTag,
  updateTag,
  deleteTag,
  addTagToEvent,
  removeTagFromEvent,
  getTagsForEvent,
  getEventsForTag as _getEventsForTag,
  type Tag as _Tag,
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
        return await handleGetTags(req, res);
      case 'POST':
        return await handleCreateTag(req, res);
      case 'PUT':
        return await handleUpdateTag(req, res);
      case 'DELETE':
        return await handleDeleteTag(req, res);
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
 * GET /api/tags - 태그 조회
 * Query params:
 * - id: 특정 태그 ID
 * - name: 태그 이름으로 검색
 * - eventId: 특정 이벤트의 태그 조회
 * - userId: 사용자 ID (기본값: 'default-user')
 */
async function handleGetTags(req: VercelRequest, res: VercelResponse) {
  const { id, name, eventId, userId = 'default-user' } = req.query;

  // 특정 ID로 조회
  if (id) {
    const tagId = parseInt(id as string, 10);
    if (isNaN(tagId)) {
      return res.status(400).json({ error: 'Invalid tag ID' });
    }
    const tag = await getTagById(tagId);
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    return res.status(200).json({
      success: true,
      data: { ...tag, id: tag.id.toString() },
    });
  }

  // 이름으로 조회
  if (name) {
    const tag = await getTagByName(name as string, userId as string);
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    return res.status(200).json({
      success: true,
      data: { ...tag, id: tag.id.toString() },
    });
  }

  // 특정 이벤트의 태그 조회
  if (eventId) {
    const eventIdNum = parseInt(eventId as string, 10);
    if (isNaN(eventIdNum)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    const tags = await getTagsForEvent(eventIdNum);
    return res.status(200).json({
      success: true,
      data: tags.map(tag => ({ ...tag, id: tag.id.toString() })),
      total: tags.length,
    });
  }

  // 모든 태그 조회
  const tags = await getAllTags(userId as string);

  // API 응답 형식 변환 (id를 string으로)
  const formattedTags = tags.map(tag => ({
    ...tag,
    id: tag.id.toString(),
  }));

  return res.status(200).json({
    success: true,
    data: formattedTags,
    total: formattedTags.length,
  });
}

/**
 * POST /api/tags - 태그 생성 및 이벤트 연결
 * Body:
 * - name: string (필수)
 * - color: string (필수)
 * - eventId?: number (이벤트 연결)
 */
async function handleCreateTag(req: VercelRequest, res: VercelResponse) {
  const {
    name,
    color,
    user_id = 'default-user',
    eventId,
  } = req.body;

  // 필수 필드 검증
  if (!name || !color) {
    return res.status(400).json({
      error: 'Name and color are required',
    });
  }

  // 색상 형식 검증 (hex)
  const colorPattern = /^#[0-9A-Fa-f]{6}$/;
  if (!colorPattern.test(color)) {
    return res.status(400).json({
      error: 'Invalid color format. Use hex format (#RRGGBB)',
    });
  }

  // 태그 생성 (중복 시 업데이트)
  const newTag = await createTag({
    user_id: user_id || 'default-user',
    name,
    color,
  });

  // 이벤트에 태그 연결
  if (eventId) {
    const eventIdNum = parseInt(eventId, 10);
    if (!isNaN(eventIdNum)) {
      await addTagToEvent(eventIdNum, newTag.id);
    }
  }

  // API 응답 형식 변환
  const formattedTag = {
    ...newTag,
    id: newTag.id.toString(),
  };

  return res.status(201).json({
    success: true,
    data: formattedTag,
  });
}

/**
 * PUT /api/tags?id={id} - 태그 수정
 * Query params:
 * - id: number (필수)
 * Body: Partial<Tag>
 *
 * Special actions:
 * - action=addToEvent&eventId={eventId}: 이벤트에 태그 추가
 * - action=removeFromEvent&eventId={eventId}: 이벤트에서 태그 제거
 */
async function handleUpdateTag(req: VercelRequest, res: VercelResponse) {
  const { id, action, eventId } = req.query;
  const updates = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Tag ID is required' });
  }

  const tagId = parseInt(id as string, 10);

  if (isNaN(tagId)) {
    return res.status(400).json({ error: 'Invalid tag ID' });
  }

  // 특수 액션: 이벤트에 태그 추가
  if (action === 'addToEvent' && eventId) {
    const eventIdNum = parseInt(eventId as string, 10);
    if (isNaN(eventIdNum)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    await addTagToEvent(eventIdNum, tagId);
    return res.status(200).json({
      success: true,
      message: 'Tag added to event',
    });
  }

  // 특수 액션: 이벤트에서 태그 제거
  if (action === 'removeFromEvent' && eventId) {
    const eventIdNum = parseInt(eventId as string, 10);
    if (isNaN(eventIdNum)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    await removeTagFromEvent(eventIdNum, tagId);
    return res.status(200).json({
      success: true,
      message: 'Tag removed from event',
    });
  }

  // 색상 형식 검증 (업데이트하는 경우)
  if (updates.color) {
    const colorPattern = /^#[0-9A-Fa-f]{6}$/;
    if (!colorPattern.test(updates.color)) {
      return res.status(400).json({
        error: 'Invalid color format. Use hex format (#RRGGBB)',
      });
    }
  }

  // 태그 업데이트
  const updatedTag = await updateTag(tagId, updates);

  if (!updatedTag) {
    return res.status(404).json({ error: 'Tag not found' });
  }

  // API 응답 형식 변환
  const formattedTag = {
    ...updatedTag,
    id: updatedTag.id.toString(),
  };

  return res.status(200).json({
    success: true,
    data: formattedTag,
  });
}

/**
 * DELETE /api/tags?id={id} - 태그 삭제
 * Query params:
 * - id: number (필수)
 *
 * Note: CASCADE 삭제로 event_tags 관계도 함께 삭제됨
 */
async function handleDeleteTag(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Tag ID is required' });
  }

  const tagId = parseInt(id as string, 10);

  if (isNaN(tagId)) {
    return res.status(400).json({ error: 'Invalid tag ID' });
  }

  // 태그 삭제
  const deletedTag = await deleteTag(tagId);

  if (!deletedTag) {
    return res.status(404).json({ error: 'Tag not found' });
  }

  // API 응답 형식 변환
  const formattedTag = {
    ...deletedTag,
    id: deletedTag.id.toString(),
  };

  return res.status(200).json({
    success: true,
    data: formattedTag,
  });
}
