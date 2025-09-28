// API 서비스별 URL 설정 - v6 FINAL
const VERCEL_API_BASE = 'https://calendar-j3vjlsr7q-johns-projects-bf5e60f3.vercel.app';

// Vercel 배포 URL (2025-09-28 확인)
const VERCEL_URLS = {
  calendar: `${VERCEL_API_BASE}/api/calendar`,
  diary: `${VERCEL_API_BASE}/api/diary`,
  saju: `${VERCEL_API_BASE}/api/saju`,
};

// 환경 판별
function isLocalEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

// API 엔드포인트 설정
export const API_ENDPOINTS = {
  calendar: isLocalEnvironment() ? '/api/calendar' : VERCEL_URLS.calendar,
  diary: isLocalEnvironment() ? '/api/diaries' : VERCEL_URLS.diary,
  saju: isLocalEnvironment() ? '/api/saju' : VERCEL_URLS.saju,
  lifetimeFortune: isLocalEnvironment() ? '/api/lifetime-fortune' : VERCEL_URLS.saju,
};

// API URL 가져오기
export const getApiUrl = (service: keyof typeof API_ENDPOINTS): string => {
  const url = API_ENDPOINTS[service];

  // 디버깅용 로그 - v6
  if (typeof window !== 'undefined') {
    console.log(`[API Config v6] Service: ${service}`);
    console.log(`[API Config v6] URL: ${url}`);
    console.log(`[API Config v6] Is Local: ${isLocalEnvironment()}`);
    console.log(`[API Config v6] Hostname: ${window.location.hostname}`);
  }

  return url;
};