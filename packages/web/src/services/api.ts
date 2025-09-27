import axios from 'axios';

// 프로덕션 URL 직접 설정 (localhost 문제 해결)
const baseURL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? '/api/calendar'  // 로컬 개발 환경
  : 'https://calendar-4out3wduo-johns-projects-bf5e60f3.vercel.app/api/calendar';  // Vercel 프로덕션 환경

// 디버깅용 로그
if (typeof window !== 'undefined') {
  console.log('[Calendar API] Using URL:', baseURL);
  console.log('[Calendar API] Current hostname:', window.location.hostname);
}

// 캘린더 서비스용 axios 인스턴스
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  location?: string;
  type?: 'personal' | 'work' | 'holiday' | 'other';
  color?: string;
  reminder_minutes?: number;
  tags?: Tag[];
  created_at?: string;
  updated_at?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const eventService = {
  // Get all events
  getEvents: async (params?: {
    start_date?: string;
    end_date?: string;
    type?: string;
  }): Promise<CalendarEvent[]> => {
    const response = await api.get('/events', { params });
    return response.data.data || [];
  },

  // Get single event
  getEvent: async (id: string): Promise<CalendarEvent> => {
    const response = await api.get(`/events/${id}`);
    return response.data.data;
  },

  // Create event
  createEvent: async (event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>): Promise<CalendarEvent> => {
    const response = await api.post('/events', event);
    return response.data.data;
  },

  // Update event
  updateEvent: async (id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    const response = await api.put(`/events/${id}`, event);
    return response.data.data;
  },

  // Delete event
  deleteEvent: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  },
};

// Tag service
export const tagService = {
  // Get all tags
  getTags: async (): Promise<Tag[]> => {
    const response = await api.get('/tags');
    return response.data;
  },

  // Get single tag
  getTag: async (id: string): Promise<Tag> => {
    const response = await api.get(`/tags/${id}`);
    return response.data;
  },

  // Create tag
  createTag: async (tag: Omit<Tag, 'id' | 'created_at' | 'updated_at'>): Promise<Tag> => {
    const response = await api.post('/tags', tag);
    return response.data;
  },

  // Update tag
  updateTag: async (id: string, tag: Partial<Tag>): Promise<Tag> => {
    const response = await api.put(`/tags/${id}`, tag);
    return response.data;
  },

  // Delete tag
  deleteTag: async (id: string): Promise<void> => {
    await api.delete(`/tags/${id}`);
  },

  // Add tags to event
  addTagsToEvent: async (eventId: string, tagIds: string[]): Promise<Tag[]> => {
    const response = await api.post(`/tags/events/${eventId}/tags`, { tagIds });
    return response.data;
  },

  // Get event tags
  getEventTags: async (eventId: string): Promise<Tag[]> => {
    const response = await api.get(`/tags/events/${eventId}/tags`);
    return response.data;
  },

  // Remove tag from event
  removeTagFromEvent: async (eventId: string, tagId: string): Promise<void> => {
    await api.delete(`/tags/events/${eventId}/tags/${tagId}`);
  },
};

// 사주 해석 관련 타입
export interface InterpretationResponse {
  basic?: {
    dayMaster: string;
    dayMasterStrength: string;
    yongshin: string;
    gyeokguk: string;
    summary: string;
  };
  johoo?: {
    season: string;
    seasonalCharacteristics: string[];
    johooNeeds: any;
    monthlyDetails: any;
    recommendations: string[];
    careerGuidance: string[];
  };
  spiritual?: {
    beneficialSpirits: string[];
    harmfulSpirits: string[];
    dominantInfluence: string;
    mitigation: string[];
    activation: string[];
  };
  philosophy?: {
    cosmicHarmony: any;
    yinYangBalance: any;
    fiveElementsWisdom: string;
    lifePhilosophy: string;
    paradoxicalWisdom: string;
  };
  personality?: {
    dominantTraits: any;
    strengths: string[];
    weaknesses: string[];
    developmentAreas: string[];
    recommendations: string[];
  };
  fortune?: {
    currentYear: any;
    monthlyTrends: any[];
    luckyElements: string[];
    cautionPeriods: string[];
  };
  career?: {
    suitableCareers: string[];
    avoidCareers: string[];
    careerTiming: string;
    successFactors: string[];
    workEnvironment: string;
  };
  relationship?: {
    marriageCompatibility: any;
    relationshipPattern: string;
    challenges: string[];
    advice: string[];
    timing: string;
  };
  health?: {
    constitution: any;
    vulnerabilities: string[];
    preventiveCare: string[];
    seasonalCare: any;
    lifestyle: string[];
  };
}

// 사주 해석 서비스
export const interpretationService = {
  // 종합 해석 가져오기
  getComprehensiveInterpretation: async (sajuData: any): Promise<InterpretationResponse> => {
    const response = await api.post('/api/interpretation/comprehensive', sajuData);
    return response.data.data;
  },

  // 기본 분석 가져오기
  getBasicAnalysis: async (sajuData: any): Promise<InterpretationResponse['basic']> => {
    const response = await api.post('/api/interpretation/basic', sajuData);
    return response.data.data;
  },

  // 조후 분석 가져오기
  getJohooAnalysis: async (sajuData: any): Promise<InterpretationResponse['johoo']> => {
    const response = await api.post('/api/interpretation/johoo', sajuData);
    return response.data.data;
  },

  // 신살 분석 가져오기
  getSpiritualAnalysis: async (sajuData: any): Promise<InterpretationResponse['spiritual']> => {
    const response = await api.post('/api/interpretation/spiritual', sajuData);
    return response.data.data;
  },

  // 성격 분석 가져오기
  getPersonalityAnalysis: async (sajuData: any): Promise<InterpretationResponse['personality']> => {
    const response = await api.post('/api/interpretation/personality', sajuData);
    return response.data.data;
  },

  // 운세 분석 가져오기
  getFortuneAnalysis: async (sajuData: any): Promise<InterpretationResponse['fortune']> => {
    const response = await api.post('/api/interpretation/fortune', sajuData);
    return response.data.data;
  },

  // 직업 지도 가져오기
  getCareerGuidance: async (sajuData: any): Promise<InterpretationResponse['career']> => {
    const response = await api.post('/api/interpretation/career', sajuData);
    return response.data.data;
  },

  // 관계 분석 가져오기
  getRelationshipAnalysis: async (sajuData: any): Promise<InterpretationResponse['relationship']> => {
    const response = await api.post('/api/interpretation/relationship', sajuData);
    return response.data.data;
  },

  // 건강 지도 가져오기
  getHealthGuidance: async (sajuData: any): Promise<InterpretationResponse['health']> => {
    const response = await api.post('/api/interpretation/health', sajuData);
    return response.data.data;
  },
};

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

// Diary service
export const diaryService = {
  // Get all diary entries (with pagination)
  getDiaries: async (params?: {
    page?: number;
    limit?: number;
    month?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<DiaryEntry[]> => {
    const response = await axios.get('http://localhost:5002/api/diaries', {
      params,
      headers: { 'x-user-id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
    });
    return response.data;
  },

  // Get diaries for date range (for calendar views)
  getDiariesForDateRange: async (startDate: string, endDate: string): Promise<DiaryEntry[]> => {
    // Use searchDiaries endpoint which supports date range
    const response = await axios.get('http://localhost:5002/api/diaries/search', {
      params: { startDate, endDate },
      headers: { 'x-user-id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
    });
    return response.data;
  },

  // Get diary entry by date
  getDiaryByDate: async (date: string): Promise<DiaryEntry> => {
    const response = await axios.get(`http://localhost:5002/api/diaries/${date}`, {
      headers: { 'x-user-id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
    });
    return response.data;
  },

  // Create diary entry
  createDiary: async (diary: Omit<DiaryEntry, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<DiaryEntry> => {
    const response = await axios.post('http://localhost:5002/api/diaries', diary, {
      headers: { 'x-user-id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
    });
    return response.data;
  },

  // Update diary entry
  updateDiary: async (id: string, diary: Partial<DiaryEntry>): Promise<DiaryEntry> => {
    const response = await axios.put(`http://localhost:5002/api/diaries/${id}`, diary, {
      headers: { 'x-user-id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
    });
    return response.data;
  },

  // Delete diary entry
  deleteDiary: async (id: string): Promise<void> => {
    await axios.delete(`http://localhost:5002/api/diaries/${id}`, {
      headers: { 'x-user-id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
    });
  },

  // Search diary entries
  searchDiaries: async (params: {
    q?: string;
    mood?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<DiaryEntry[]> => {
    const response = await axios.get('http://localhost:5002/api/diaries/search', {
      params,
      headers: { 'x-user-id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
    });
    return response.data;
  },
};

export default api;