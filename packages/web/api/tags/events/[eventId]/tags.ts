import { VercelRequest, VercelResponse } from '@vercel/node';

// Tag interface
interface Tag {
  id: string;
  name: string;
  color: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

// 임시 태그 데이터 (실제로는 tags.ts와 공유해야 함)
const tags: Tag[] = [
  {
    id: '1',
    name: '업무',
    color: '#FF6B6B',
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: '개인',
    color: '#4ECDC4',
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: '운동',
    color: '#45B7D1',
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// 이벤트-태그 관계 (임시 데이터)
let eventTags: { eventId: string; tagId: string }[] = [
  { eventId: '1', tagId: '1' },
  { eventId: '2', tagId: '2' },
];

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, query } = req;
  const eventId = query.eventId as string;
  const userId = req.headers['x-user-id'] as string || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  if (!eventId) {
    return res.status(400).json({ error: 'Event ID is required' });
  }

  try {
    switch (method) {
      case 'GET':
        return handleGetEventTags(req, res, eventId, userId);
      case 'POST':
        return handleAddTagsToEvent(req, res, eventId, userId);
      case 'DELETE':
        return handleRemoveTagFromEvent(req, res, eventId, userId);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Event Tag API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

function handleGetEventTags(req: VercelRequest, res: VercelResponse, eventId: string, userId: string) {
  // 해당 이벤트의 태그 ID들 찾기
  const tagIds = eventTags
    .filter(et => et.eventId === eventId)
    .map(et => et.tagId);

  // 태그 정보 가져오기
  const eventTagsData = tags.filter(tag =>
    tagIds.includes(tag.id) && tag.user_id === userId,
  );

  return res.status(200).json(eventTagsData);
}

function handleAddTagsToEvent(req: VercelRequest, res: VercelResponse, eventId: string, userId: string) {
  const { tagIds } = req.body;

  if (!tagIds || !Array.isArray(tagIds)) {
    return res.status(400).json({
      error: 'tagIds array is required',
    });
  }

  // 유효한 태그들인지 확인
  const validTagIds = tags
    .filter(tag => tag.user_id === userId && tagIds.includes(tag.id))
    .map(tag => tag.id);

  if (validTagIds.length === 0) {
    return res.status(400).json({
      error: 'No valid tags found',
    });
  }

  // 기존 관계 제거 (중복 방지)
  eventTags = eventTags.filter(et => et.eventId !== eventId);

  // 새로운 관계 추가
  const newEventTags = validTagIds.map(tagId => ({
    eventId,
    tagId,
  }));

  eventTags.push(...newEventTags);

  // 추가된 태그 정보 반환
  const addedTags = tags.filter(tag => validTagIds.includes(tag.id));

  return res.status(200).json(addedTags);
}

function handleRemoveTagFromEvent(req: VercelRequest, res: VercelResponse, eventId: string, userId: string) {
  const { tagId } = req.query;

  if (!tagId) {
    return res.status(400).json({ error: 'Tag ID is required' });
  }

  // 태그가 해당 사용자의 것인지 확인
  const tag = tags.find(t => t.id === tagId && t.user_id === userId);
  if (!tag) {
    return res.status(404).json({ error: 'Tag not found' });
  }

  // 이벤트-태그 관계 제거
  const initialLength = eventTags.length;
  eventTags = eventTags.filter(et =>
    !(et.eventId === eventId && et.tagId === tagId),
  );

  if (eventTags.length === initialLength) {
    return res.status(404).json({ error: 'Event-tag relationship not found' });
  }

  return res.status(200).json({
    success: true,
    message: 'Tag removed from event',
  });
}