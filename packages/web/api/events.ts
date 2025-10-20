/**
 * Events API - PostgreSQL 기반
 *
 * @see packages/web/api/database/schema.sql
 * @author Claude Code
 * @version 2.0.0
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applySecurityMiddleware } from '../lib/security';
import {
  getAllEvents,
  getEventById,
  getEventsByDateRange,
  createEvent,
  updateEvent,
  deleteEvent,
  type Event,
} from './database/db';

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
        return await handleGetEvents(req, res);
      case 'POST':
        return await handleCreateEvent(req, res);
      case 'PUT':
        return await handleUpdateEvent(req, res);
      case 'DELETE':
        return await handleDeleteEvent(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * GET /api/events - 이벤트 조회
 * Query params:
 * - start: 시작 날짜 (ISO 8601)
 * - end: 종료 날짜 (ISO 8601)
 * - userId: 사용자 ID (기본값: 'default-user')
 */
async function handleGetEvents(req: VercelRequest, res: VercelResponse) {
  const { start, end, userId = 'default-user' } = req.query;

  let events: Event[];

  // 날짜 범위 필터링
  if (start && end) {
    events = await getEventsByDateRange(
      start as string,
      end as string,
      userId as string
    );
  } else {
    events = await getAllEvents(userId as string);
  }

  // API 응답 형식 변환 (id를 string으로)
  const formattedEvents = events.map(event => ({
    ...event,
    id: event.id.toString(),
  }));

  return res.status(200).json({
    success: true,
    data: formattedEvents,
    total: formattedEvents.length,
  });
}

/**
 * POST /api/events - 이벤트 생성
 * Body:
 * - title: string (필수)
 * - start_time: string (필수, ISO 8601)
 * - end_time: string (필수, ISO 8601)
 * - description?: string
 * - all_day?: boolean
 * - location?: string
 * - type?: string
 * - color?: string
 * - reminder_minutes?: number
 */
async function handleCreateEvent(req: VercelRequest, res: VercelResponse) {
  const {
    title,
    description,
    start_time,
    end_time,
    all_day,
    location,
    type,
    color,
    reminder_minutes,
    user_id = 'default-user',
  } = req.body;

  // 필수 필드 검증
  if (!title || !start_time || !end_time) {
    return res.status(400).json({
      error: 'Title, start_time, and end_time are required',
    });
  }

  // 날짜 유효성 검증
  const startDate = new Date(start_time);
  const endDate = new Date(end_time);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return res.status(400).json({
      error: 'Invalid date format. Use ISO 8601 format.',
    });
  }

  if (endDate <= startDate) {
    return res.status(400).json({
      error: 'end_time must be after start_time',
    });
  }

  // 이벤트 생성
  const newEvent = await createEvent({
    user_id: user_id || 'default-user',
    title,
    description,
    start_time,
    end_time,
    all_day: all_day || false,
    location,
    type: type || 'event',
    color: color || '#3B82F6',
    reminder_minutes,
  });

  // API 응답 형식 변환
  const formattedEvent = {
    ...newEvent,
    id: newEvent.id.toString(),
  };

  return res.status(201).json({
    success: true,
    data: formattedEvent,
  });
}

/**
 * PUT /api/events?id={id} - 이벤트 수정
 * Query params:
 * - id: number (필수)
 * Body: Partial<Event>
 */
async function handleUpdateEvent(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const updates = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Event ID is required' });
  }

  const eventId = parseInt(id as string, 10);

  if (isNaN(eventId)) {
    return res.status(400).json({ error: 'Invalid event ID' });
  }

  // 날짜 유효성 검증 (업데이트하는 경우)
  if (updates.start_time && updates.end_time) {
    const startDate = new Date(updates.start_time);
    const endDate = new Date(updates.end_time);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format. Use ISO 8601 format.',
      });
    }

    if (endDate <= startDate) {
      return res.status(400).json({
        error: 'end_time must be after start_time',
      });
    }
  }

  // 이벤트 업데이트
  const updatedEvent = await updateEvent(eventId, updates);

  if (!updatedEvent) {
    return res.status(404).json({ error: 'Event not found' });
  }

  // API 응답 형식 변환
  const formattedEvent = {
    ...updatedEvent,
    id: updatedEvent.id.toString(),
  };

  return res.status(200).json({
    success: true,
    data: formattedEvent,
  });
}

/**
 * DELETE /api/events?id={id} - 이벤트 삭제
 * Query params:
 * - id: number (필수)
 */
async function handleDeleteEvent(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Event ID is required' });
  }

  const eventId = parseInt(id as string, 10);

  if (isNaN(eventId)) {
    return res.status(400).json({ error: 'Invalid event ID' });
  }

  // 이벤트 삭제
  const deletedEvent = await deleteEvent(eventId);

  if (!deletedEvent) {
    return res.status(404).json({ error: 'Event not found' });
  }

  // API 응답 형식 변환
  const formattedEvent = {
    ...deletedEvent,
    id: deletedEvent.id.toString(),
  };

  return res.status(200).json({
    success: true,
    data: formattedEvent,
  });
}
