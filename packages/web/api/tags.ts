import { VercelRequest, VercelResponse } from '@vercel/node';

// Tag interface
export interface Tag {
  id: string;
  name: string;
  color: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

// 임시 태그 데이터 (메모리에 저장)
let tags: Tag[] = [
  {
    id: '1',
    name: '업무',
    color: '#FF6B6B',
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: '개인',
    color: '#4ECDC4',
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: '운동',
    color: '#45B7D1',
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// 이벤트-태그 관계 (임시 데이터)
let eventTags: { eventId: string; tagId: string }[] = [
  { eventId: '1', tagId: '1' },
  { eventId: '2', tagId: '2' }
];

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method } = req;
  const userId = req.headers['x-user-id'] as string || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  try {
    switch (method) {
      case 'GET':
        return handleGetTags(req, res, userId);
      case 'POST':
        return handleCreateTag(req, res, userId);
      case 'PUT':
        return handleUpdateTag(req, res, userId);
      case 'DELETE':
        return handleDeleteTag(req, res, userId);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Tag API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

function handleGetTags(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id } = req.query;

  let filteredTags = tags.filter(tag => tag.user_id === userId);

  // 특정 태그 조회
  if (id) {
    const tag = filteredTags.find(t => t.id === id);
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    return res.status(200).json(tag);
  }

  // 모든 태그 조회
  return res.status(200).json(filteredTags);
}

function handleCreateTag(req: VercelRequest, res: VercelResponse, userId: string) {
  const { name, color } = req.body;

  if (!name || !color) {
    return res.status(400).json({
      error: 'Name and color are required'
    });
  }

  // 같은 이름의 태그가 이미 있는지 확인
  const existingTag = tags.find(tag =>
    tag.user_id === userId && tag.name === name
  );

  if (existingTag) {
    return res.status(400).json({
      error: 'Tag with this name already exists'
    });
  }

  const newTag: Tag = {
    id: Date.now().toString(),
    name,
    color,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  tags.push(newTag);

  return res.status(201).json(newTag);
}

function handleUpdateTag(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id } = req.query;
  const updates = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Tag ID is required' });
  }

  const tagIndex = tags.findIndex(tag =>
    tag.id === id && tag.user_id === userId
  );

  if (tagIndex === -1) {
    return res.status(404).json({ error: 'Tag not found' });
  }

  tags[tagIndex] = {
    ...tags[tagIndex],
    ...updates,
    updated_at: new Date().toISOString()
  };

  return res.status(200).json(tags[tagIndex]);
}

function handleDeleteTag(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Tag ID is required' });
  }

  const tagIndex = tags.findIndex(tag =>
    tag.id === id && tag.user_id === userId
  );

  if (tagIndex === -1) {
    return res.status(404).json({ error: 'Tag not found' });
  }

  const deletedTag = tags.splice(tagIndex, 1)[0];

  // 관련된 이벤트-태그 관계도 삭제
  eventTags = eventTags.filter(et => et.tagId !== id);

  return res.status(200).json({
    success: true,
    data: deletedTag
  });
}