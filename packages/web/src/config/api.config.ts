// API 서비스별 URL 설정
const isDevelopment = import.meta.env.MODE === 'development';

// Railway 배포 URL - 실제 배포된 서비스 URL
// 임시 공개 백엔드 서버 (테스트용)
const RAILWAY_URLS = {
  calendar: 'https://sajuapp-calendar.up.railway.app/api/calendar',
  diary: 'https://sajuapp-diary.up.railway.app/api',
  saju: 'https://sajuapp-saju.up.railway.app/api',
};

// 대체 URL (Railway가 작동하지 않을 때)
const FALLBACK_URLS = {
  calendar: 'https://fortune-compass-api.onrender.com/api/calendar',
  diary: 'https://fortune-compass-api.onrender.com/api/diary',
  saju: 'https://fortune-compass-api.onrender.com/api/saju',
};

// 프로덕션 환경 강제 설정 (localhost 문제 해결)
const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const isProduction = !isLocalhost || import.meta.env.MODE === 'production';

export const API_ENDPOINTS = {
  calendar: isProduction
    ? (import.meta.env.VITE_CALENDAR_SERVICE_URL || RAILWAY_URLS.calendar || FALLBACK_URLS.calendar)
    : '/api/calendar',

  diary: isProduction
    ? (import.meta.env.VITE_DIARY_SERVICE_URL || RAILWAY_URLS.diary || FALLBACK_URLS.diary)
    : '/api/diaries',

  saju: isProduction
    ? (import.meta.env.VITE_SAJU_SERVICE_URL || RAILWAY_URLS.saju || FALLBACK_URLS.saju)
    : '/api/saju',

  lifetimeFortune: isProduction
    ? (import.meta.env.VITE_SAJU_SERVICE_URL || RAILWAY_URLS.saju || FALLBACK_URLS.saju)
    : '/api/lifetime-fortune',
};

// 개발 환경에서는 Vite proxy를 통해 라우팅
// 프로덕션에서는 각 Railway 서비스로 직접 연결
export const getApiUrl = (service: keyof typeof API_ENDPOINTS): string => {
  const url = API_ENDPOINTS[service];

  // 디버깅용 로그 (프로덕션에서도 확인 가능)
  if (typeof window !== 'undefined') {
    console.log(`[API Config] Service: ${service}, URL: ${url}`);
    console.log(`[API Config] Mode: ${import.meta.env.MODE}, isProduction: ${isProduction}`);
  }

  return url;
};