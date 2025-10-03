import { VercelRequest, VercelResponse } from '@vercel/node';

// Diary Entry interface
export interface DiaryEntry {
  id?: string;
  user_id?: string;
  date: string; // YYYY-MM-DD
  content: string;
  mood?: string;
  weather?: string;
  tags?: string[];
  images?: string[]; // Base64 encoded images
  created_at?: string;
  updated_at?: string;
}

// 임시 다이어리 데이터 (메모리에 저장)
const diaries: DiaryEntry[] = [
  {
    id: '1',
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    date: '2024-12-30',
    content: '오늘은 새로운 프로젝트를 시작했다. 기대가 된다.',
    mood: '😊',
    weather: '☀️',
    tags: ['프로젝트', '시작'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    date: '2024-12-29',
    content: '친구들과 즐거운 시간을 보냈다.',
    mood: '😄',
    weather: '⛅',
    tags: ['친구', '즐거움'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
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
        return handleGetDiaries(req, res, userId);
      case 'POST':
        return handleCreateDiary(req, res, userId);
      case 'PUT':
        return handleUpdateDiary(req, res, userId);
      case 'DELETE':
        return handleDeleteDiary(req, res, userId);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Diary API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

function handleGetDiaries(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id, date, startDate, endDate, month, page = '1', limit = '10' } = req.query;

  let filteredDiaries = diaries.filter(diary => diary.user_id === userId);

  // ID로 특정 다이어리 조회
  if (id) {
    const diary = filteredDiaries.find(d => d.id === id);
    if (!diary) {
      return res.status(404).json({ error: 'Diary not found' });
    }
    return res.status(200).json(diary);
  }

  // 날짜로 특정 다이어리 조회
  if (date) {
    const diary = filteredDiaries.find(d => d.date === date);
    if (!diary) {
      return res.status(404).json({ error: 'Diary not found for this date' });
    }
    return res.status(200).json(diary);
  }

  // 날짜 범위로 필터링
  if (startDate && endDate) {
    filteredDiaries = filteredDiaries.filter(diary =>
      diary.date >= startDate && diary.date <= endDate,
    );
  }

  // 월별 필터링
  if (month) {
    filteredDiaries = filteredDiaries.filter(diary =>
      diary.date.startsWith(month),
    );
  }

  // 페이지네이션
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;

  const paginatedDiaries = filteredDiaries
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(startIndex, endIndex);

  return res.status(200).json(paginatedDiaries);
}

function handleCreateDiary(req: VercelRequest, res: VercelResponse, userId: string) {
  const { date, content, mood, weather, tags, images } = req.body;

  if (!date || !content) {
    return res.status(400).json({
      error: 'Date and content are required',
    });
  }

  const newDiary: DiaryEntry = {
    id: Date.now().toString(),
    user_id: userId,
    date,
    content,
    mood: mood || '',
    weather: weather || '',
    tags: tags || [],
    images: images || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  diaries.push(newDiary);

  return res.status(201).json(newDiary);
}

function handleUpdateDiary(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id } = req.query;
  const updates = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Diary ID is required' });
  }

  const diaryIndex = diaries.findIndex(diary =>
    diary.id === id && diary.user_id === userId,
  );

  if (diaryIndex === -1) {
    return res.status(404).json({ error: 'Diary not found' });
  }

  diaries[diaryIndex] = {
    ...diaries[diaryIndex],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  return res.status(200).json(diaries[diaryIndex]);
}

function handleDeleteDiary(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Diary ID is required' });
  }

  const diaryIndex = diaries.findIndex(diary =>
    diary.id === id && diary.user_id === userId,
  );

  if (diaryIndex === -1) {
    return res.status(404).json({ error: 'Diary not found' });
  }

  const deletedDiary = diaries.splice(diaryIndex, 1)[0];

  return res.status(200).json({
    success: true,
    data: deletedDiary,
  });
}