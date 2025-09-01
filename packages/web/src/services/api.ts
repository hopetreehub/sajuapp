import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001';

const api = axios.create({
  baseURL: API_URL,
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
    const response = await api.get('/api/calendar/events', { params });
    return response.data.data || [];
  },

  // Get single event
  getEvent: async (id: string): Promise<CalendarEvent> => {
    const response = await api.get(`/api/calendar/events/${id}`);
    return response.data.data;
  },

  // Create event
  createEvent: async (event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>): Promise<CalendarEvent> => {
    const response = await api.post('/api/calendar/events', event);
    return response.data.data;
  },

  // Update event
  updateEvent: async (id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    const response = await api.put(`/api/calendar/events/${id}`, event);
    return response.data.data;
  },

  // Delete event
  deleteEvent: async (id: string): Promise<void> => {
    await api.delete(`/api/calendar/events/${id}`);
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

export default api;