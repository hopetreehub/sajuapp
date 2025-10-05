import axios from 'axios';

// API Base URL 결정 함수 - Vercel 풀스택
function getBaseUrl(): string {
  // Vercel Functions 경로 사용
  return '/api';
}

const baseURL = getBaseUrl();

// 디버깅용 로그
if (typeof window !== 'undefined') {
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

export interface Todo {
  id: string;
  customer_id: number;
  title: string;
  description?: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
  completed: number | boolean;
  created_at: string;
  updated_at: string;
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
    sajuString?: string;
    ohHaengBalance?: {
      wood: number;
      fire: number;
      earth: number;
      metal: number;
      water: number;
    };
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
  // 종합 해석 가져오기 (정확한 사주 계산 API 사용)
  getComprehensiveInterpretation: async (sajuData: any): Promise<InterpretationResponse> => {
    try {
      // 개발환경에서는 포트 4020 사용
      const isDev = process.env.NODE_ENV === 'development';
      const baseUrl = isDev ? 'http://localhost:4020' : '';

      const response = await fetch(`${baseUrl}/api/saju/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sajuData),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const { fourPillars, ohHaengBalance, interpretation, sajuString } = result.data;

        return {
          basic: {
            dayMaster: fourPillars.day.heaven,
            dayMasterStrength: '중화',
            yongshin: '화',
            gyeokguk: '정격',
            summary: interpretation,
            sajuString, // 추가: 완전한 사주 문자열
            ohHaengBalance, // 추가: 오행 균형
          },
        };
      } else {
        throw new Error('사주 계산 실패');
      }
    } catch (error) {
      console.error('사주 계산 오류:', error);
      // 실패 시 기본값 반환
      return {
        basic: {
          dayMaster: '계산중',
          dayMasterStrength: '분석중',
          yongshin: '분석중',
          gyeokguk: '분석중',
          summary: '사주 계산 중 오류가 발생했습니다.',
          sajuString: '계산 실패',
          ohHaengBalance: { wood: 20, fire: 20, earth: 20, metal: 20, water: 20 },
        },
      };
    }
  },

  // 기본 분석 가져오기
  getBasicAnalysis: async (sajuData: any): Promise<InterpretationResponse['basic']> => {
    const response = await api.post('/saju/calculate', sajuData);
    return {
      dayMaster: response.data.data.fourPillars.day.heaven,
      dayMasterStrength: '중화',
      yongshin: '화',
      gyeokguk: '정격',
      summary: response.data.data.interpretation,
    };
  },

  // 조후 분석 가져오기
  getJohooAnalysis: async (sajuData: any): Promise<InterpretationResponse['johoo']> => {
    return {
      season: '봄',
      seasonalCharacteristics: ['성장', '발전'],
      johooNeeds: { fire: 30, water: 20 },
      monthlyDetails: {},
      recommendations: ['적극적인 활동', '새로운 시작'],
      careerGuidance: ['창의적 분야', '리더십 발휘'],
    };
  },

  // 신살 분석 가져오기
  getSpiritualAnalysis: async (sajuData: any): Promise<InterpretationResponse['spiritual']> => {
    return {
      beneficialSpirits: ['천을귀인', '문창귀인'],
      harmfulSpirits: ['겁살', '망신살'],
      dominantInfluence: '길신이 우세',
      mitigation: ['선행 쌓기', '정직한 생활'],
      activation: ['학습과 연구', '예술 활동'],
    };
  },

  // 성격 분석 가져오기
  getPersonalityAnalysis: async (sajuData: any): Promise<InterpretationResponse['personality']> => {
    return {
      dominantTraits: { leadership: 80, creativity: 70 },
      strengths: ['리더십', '창의성', '추진력'],
      weaknesses: ['성급함', '완벽주의'],
      developmentAreas: ['인내심', '협력'],
      recommendations: ['팀워크 향상', '감정 조절'],
    };
  },

  // 운세 분석 가져오기
  getFortuneAnalysis: async (sajuData: any): Promise<InterpretationResponse['fortune']> => {
    return {
      currentYear: { overall: 75, career: 80, health: 70 },
      monthlyTrends: [],
      luckyElements: ['화', '토'],
      cautionPeriods: ['7월', '12월'],
    };
  },

  // 직업 지도 가져오기
  getCareerGuidance: async (sajuData: any): Promise<InterpretationResponse['career']> => {
    return {
      suitableCareers: ['경영', '교육', '예술', 'IT'],
      avoidCareers: ['반복 업무', '단순 노동'],
      careerTiming: '30대 중반 이후 큰 성과',
      successFactors: ['리더십', '창의성', '소통능력'],
      workEnvironment: '자율적이고 창의적인 환경',
    };
  },

  // 관계 분석 가져오기
  getRelationshipAnalysis: async (sajuData: any): Promise<InterpretationResponse['relationship']> => {
    return {
      marriageCompatibility: { overall: 80, communication: 75 },
      relationshipPattern: '적극적이고 주도적',
      challenges: ['성급함', '고집'],
      advice: ['상대방 배려', '소통 강화'],
      timing: '30대 초반이 길한 시기',
    };
  },

  // 건강 지도 가져오기
  getHealthGuidance: async (sajuData: any): Promise<InterpretationResponse['health']> => {
    return {
      constitution: { type: '화체질', strength: 70 },
      vulnerabilities: ['심장', '소화기'],
      preventiveCare: ['규칙적 운동', '스트레스 관리'],
      seasonalCare: { spring: '간 건강', summer: '심장 건강' },
      lifestyle: ['규칙적 생활', '균형 잡힌 식단'],
    };
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
    const response = await api.get('/diaries/search', {
      params: { startDate, endDate },
      headers: { 'x-user-id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
    });
    return response.data;
  },

  // Get diary entry by date
  getDiaryByDate: async (date: string): Promise<DiaryEntry> => {
    const response = await api.get(`/diaries?date=${date}`, {
      headers: { 'x-user-id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
    });
    return response.data;
  },

  // Create diary entry
  createDiary: async (diary: Omit<DiaryEntry, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<DiaryEntry> => {
    const response = await api.post('/diaries', diary, {
      headers: { 'x-user-id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
    });
    return response.data;
  },

  // Update diary entry
  updateDiary: async (id: string, diary: Partial<DiaryEntry>): Promise<DiaryEntry> => {
    const response = await api.put(`/diaries?id=${id}`, diary, {
      headers: { 'x-user-id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
    });
    return response.data;
  },

  // Delete diary entry
  deleteDiary: async (id: string): Promise<void> => {
    await api.delete(`/diaries?id=${id}`, {
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
    const response = await api.get('/diaries/search', {
      params,
      headers: { 'x-user-id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
    });
    return response.data;
  },
};

// Todo service for Calendar backend
export const todoService = {
  // Get all todos
  getTodos: async (): Promise<Todo[]> => {
    const response = await axios.get('http://localhost:4012/api/calendar/todos');
    return response.data;
  },

  // Get todos by date
  getTodosByDate: async (date: string): Promise<Todo[]> => {
    const response = await axios.get(`http://localhost:4012/api/calendar/todos/${date}`);
    return response.data;
  },

  // Create todo
  createTodo: async (todo: Omit<Todo, 'id' | 'created_at' | 'updated_at' | 'customer_id'>): Promise<Todo> => {
    const response = await axios.post('http://localhost:4012/api/calendar/todos', todo);
    return response.data;
  },

  // Update todo
  updateTodo: async (id: string, todo: Partial<Todo>): Promise<Todo> => {
    const response = await axios.put(`http://localhost:4012/api/calendar/todos/${id}`, todo);
    return response.data;
  },

  // Delete todo
  deleteTodo: async (id: string): Promise<void> => {
    await axios.delete(`http://localhost:4012/api/calendar/todos/${id}`);
  },

  // Toggle todo completion
  toggleTodo: async (id: string): Promise<Todo> => {
    const response = await axios.patch(`http://localhost:4012/api/calendar/todos/${id}/toggle`);
    return response.data;
  },
};

export default api;