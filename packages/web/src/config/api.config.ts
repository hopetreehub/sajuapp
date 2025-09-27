// API 서비스별 URL 설정
const isDevelopment = import.meta.env.MODE === 'development';

// Railway 배포 URL - 실제 배포된 서비스 URL로 업데이트 필요
// Railway 대시보드에서 각 서비스의 실제 URL 확인 필요
const RAILWAY_URLS = {
  calendar: 'https://sajuapp-production-4012.up.railway.app/api/calendar',
  diary: 'https://sajuapp-production-4004.up.railway.app/api',
  saju: 'https://sajuapp-production-4015.up.railway.app/api',
};

export const API_ENDPOINTS = {
  calendar: isDevelopment
    ? '/api/calendar'
    : (import.meta.env.VITE_CALENDAR_SERVICE_URL || RAILWAY_URLS.calendar),

  diary: isDevelopment
    ? '/api/diaries'
    : (import.meta.env.VITE_DIARY_SERVICE_URL || RAILWAY_URLS.diary),

  saju: isDevelopment
    ? '/api/saju'
    : (import.meta.env.VITE_SAJU_SERVICE_URL || RAILWAY_URLS.saju),

  lifetimeFortune: isDevelopment
    ? '/api/lifetime-fortune'
    : (import.meta.env.VITE_SAJU_SERVICE_URL || RAILWAY_URLS.saju),
};

// 개발 환경에서는 Vite proxy를 통해 라우팅
// 프로덕션에서는 각 Railway 서비스로 직접 연결
export const getApiUrl = (service: keyof typeof API_ENDPOINTS): string => {
  return API_ENDPOINTS[service];
};