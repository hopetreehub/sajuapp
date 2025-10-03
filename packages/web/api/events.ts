import { VercelRequest, VercelResponse } from '@vercel/node';

// 임시 메모리 기반 이벤트 저장소 (프로덕션에서는 Vercel KV 또는 외부 DB 사용)
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  location?: string;
  type?: string;
  color?: string;
  reminder_minutes?: number;
  created_at: string;
  updated_at: string;
}

// 임시 이벤트 데이터 (메모리에 저장)
const events: CalendarEvent[] = [
  {
    id: '1',
    title: '운명나침반 데모 이벤트',
    description: 'Vercel Functions로 구현된 첫 번째 이벤트',
    start_time: '2025-01-01T09:00:00Z',
    end_time: '2025-01-01T10:00:00Z',
    all_day: false,
    location: '온라인',
    type: 'meeting',
    color: '#3B82F6',
    reminder_minutes: 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: '사주 상담',
    description: '개인 사주 운세 상담',
    start_time: '2025-01-02T14:00:00Z',
    end_time: '2025-01-02T15:00:00Z',
    all_day: false,
    location: '상담실',
    type: 'consultation',
    color: '#10B981',
    reminder_minutes: 30,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function handler(req: VercelRequest, res: VercelResponse) {
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
        return handleGetEvents(req, res);
      case 'POST':
        return handleCreateEvent(req, res);
      case 'PUT':
        return handleUpdateEvent(req, res);
      case 'DELETE':
        return handleDeleteEvent(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

function handleGetEvents(req: VercelRequest, res: VercelResponse) {
  const { start, end } = req.query;

  let filteredEvents = events;

  // 날짜 범위 필터링
  if (start && end) {
    const startDate = new Date(start as string);
    const endDate = new Date(end as string);

    filteredEvents = events.filter(event => {
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);

      return (
        (eventStart >= startDate && eventStart <= endDate) ||
        (eventEnd >= startDate && eventEnd <= endDate) ||
        (eventStart <= startDate && eventEnd >= endDate)
      );
    });
  }

  return res.status(200).json({
    success: true,
    data: filteredEvents,
    total: filteredEvents.length,
  });
}

function handleCreateEvent(req: VercelRequest, res: VercelResponse) {
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
  } = req.body;

  if (!title || !start_time || !end_time) {
    return res.status(400).json({
      error: 'Title, start_time, and end_time are required',
    });
  }

  const newEvent: CalendarEvent = {
    id: Date.now().toString(), // 간단한 ID 생성
    title,
    description: description || '',
    start_time,
    end_time,
    all_day: all_day || false,
    location: location || '',
    type: type || 'event',
    color: color || '#3B82F6',
    reminder_minutes: reminder_minutes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  events.push(newEvent);

  return res.status(201).json({
    success: true,
    data: newEvent,
  });
}

function handleUpdateEvent(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const updates = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Event ID is required' });
  }

  const eventIndex = events.findIndex(event => event.id === id);

  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }

  events[eventIndex] = {
    ...events[eventIndex],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  return res.status(200).json({
    success: true,
    data: events[eventIndex],
  });
}

function handleDeleteEvent(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Event ID is required' });
  }

  const eventIndex = events.findIndex(event => event.id === id);

  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const deletedEvent = events.splice(eventIndex, 1)[0];

  return res.status(200).json({
    success: true,
    data: deletedEvent,
  });
}