import { VercelRequest, VercelResponse } from '@vercel/node';

// Diary Entry interface
interface DiaryEntry {
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

// 임시 다이어리 데이터 (메모리에 저장) - 실제로는 데이터베이스에서 가져와야 함
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const userId = req.headers['x-user-id'] as string || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  try {
    return handleSearchDiaries(req, res, userId);
  } catch (error) {
    console.error('Diary Search API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

function handleSearchDiaries(req: VercelRequest, res: VercelResponse, userId: string) {
  const { q, mood, startDate, endDate } = req.query;

  let filteredDiaries = diaries.filter(diary => diary.user_id === userId);

  // 텍스트 검색 (제목이나 내용에서)
  if (q && typeof q === 'string') {
    const searchTerm = q.toLowerCase();
    filteredDiaries = filteredDiaries.filter(diary =>
      diary.content.toLowerCase().includes(searchTerm) ||
      (diary.tags && diary.tags.some(tag => tag.toLowerCase().includes(searchTerm))),
    );
  }

  // 기분으로 필터링
  if (mood && typeof mood === 'string') {
    filteredDiaries = filteredDiaries.filter(diary => diary.mood === mood);
  }

  // 날짜 범위로 필터링
  if (startDate && typeof startDate === 'string') {
    filteredDiaries = filteredDiaries.filter(diary => diary.date >= startDate);
  }

  if (endDate && typeof endDate === 'string') {
    filteredDiaries = filteredDiaries.filter(diary => diary.date <= endDate);
  }

  // 날짜순으로 정렬 (최신순)
  filteredDiaries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return res.status(200).json(filteredDiaries);
}