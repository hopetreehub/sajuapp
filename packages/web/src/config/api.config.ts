// API 서비스별 URL 설정
const isDevelopment = import.meta.env.MODE === 'development';

export const API_ENDPOINTS = {
  calendar: isDevelopment
    ? '/api/calendar'
    : (import.meta.env.VITE_CALENDAR_SERVICE_URL || 'https://fortune-calendar.up.railway.app/api'),

  diary: isDevelopment
    ? '/api/diaries'
    : (import.meta.env.VITE_DIARY_SERVICE_URL || 'https://fortune-diary.up.railway.app/api'),

  saju: isDevelopment
    ? '/api/saju'
    : (import.meta.env.VITE_SAJU_SERVICE_URL || 'https://fortune-saju.up.railway.app/api'),

  lifetimeFortune: isDevelopment
    ? '/api/lifetime-fortune'
    : (import.meta.env.VITE_SAJU_SERVICE_URL || 'https://fortune-saju.up.railway.app/api'),
};

// 개발 환경에서는 Vite proxy를 통해 라우팅
// 프로덕션에서는 각 Railway 서비스로 직접 연결
export const getApiUrl = (service: keyof typeof API_ENDPOINTS): string => {
  return API_ENDPOINTS[service];
};