// 고객 관리 API 서비스 - v6 FINAL

// Vercel 백엔드 URL (절대 경로)
const VERCEL_API_URL = 'https://calendar-j3vjlsr7q-johns-projects-bf5e60f3.vercel.app/api/calendar';

// API Base URL 결정 함수
function getApiBaseUrl(): string {
  // 브라우저 환경이 아닌 경우 (SSR 등)
  if (typeof window === 'undefined') {
    return VERCEL_API_URL;
  }

  const hostname = window.location.hostname;

  // 로컬 개발 환경
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('[Customer API v6] 로컬 개발 모드 - 프록시 사용');
    return '/api/calendar';
  }

  // 프로덕션 환경 (Cloudflare Pages, Vercel, 기타 모든 배포)
  console.log('[Customer API v6] 프로덕션 모드 - Vercel API 사용');
  console.log('[Customer API v6] URL:', VERCEL_API_URL);
  return VERCEL_API_URL;
}

// API URL 설정
const API_BASE_URL = getApiBaseUrl();

// 초기화 시 로깅
if (typeof window !== 'undefined') {
  console.log('====================================');
  console.log('[Customer API v6] 초기화 완료');
  console.log('  현재 호스트:', window.location.hostname);
  console.log('  사용 URL:', API_BASE_URL);
  console.log('  Vercel API:', VERCEL_API_URL);
  console.log('====================================');
}

// 타입 정의
export interface Customer {
  id?: number;
  name: string;
  birth_date: string;
  birth_time: string;
  phone: string;
  lunar_solar: 'lunar' | 'solar';
  gender: 'male' | 'female';
  memo?: string;
  saju_data?: any;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerListResponse {
  success: boolean;
  data: Customer[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CustomerResponse {
  success: boolean;
  data: Customer;
  daeun?: any;
  saeun?: any;
}

// 고객 목록 조회
export async function getCustomers(
  page: number = 1,
  limit: number = 20,
  search: string = ''
): Promise<CustomerListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search,
  });

  const url = `${API_BASE_URL}/customers?${params}`;

  console.log('[Customer API v6] 고객 목록 조회');
  console.log('  요청 URL:', url);
  console.log('  Vercel API 사용:', url.includes('vercel.app'));

  try {
    const response = await fetch(url);

    console.log('[Customer API v6] 응답 상태:', response.status);
    console.log('[Customer API v6] Content-Type:', response.headers.get('content-type'));

    if (!response.ok) {
      const text = await response.text();
      console.error('[Customer API v6] 에러 응답:', text.substring(0, 300));
      throw new Error(`고객 목록을 불러오는데 실패했습니다 (${response.status})`);
    }

    const data = await response.json();
    console.log('[Customer API v6] 성공적으로 데이터 수신');
    return data;

  } catch (error) {
    console.error('[Customer API v6] 요청 실패:', error);
    throw error;
  }
}

// 고객 상세 조회
export async function getCustomerById(id: number): Promise<CustomerResponse> {
  const url = `${API_BASE_URL}/customers/${id}`;
  console.log('[Customer API v6] 고객 상세 조회:', url);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('고객 정보를 불러오는데 실패했습니다');
  }

  return response.json();
}

// 고객 등록
export async function createCustomer(customer: Customer): Promise<CustomerResponse> {
  const url = `${API_BASE_URL}/customers`;
  console.log('[Customer API v6] 고객 등록:', url);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(customer),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '고객 등록에 실패했습니다');
  }

  return response.json();
}

// 고객 수정
export async function updateCustomer(
  id: number,
  customer: Customer
): Promise<CustomerResponse> {
  const url = `${API_BASE_URL}/customers/${id}`;
  console.log('[Customer API v6] 고객 수정:', url);

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(customer),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '고객 정보 수정에 실패했습니다');
  }

  return response.json();
}

// 고객 삭제
export async function deleteCustomer(id: number): Promise<{ success: boolean; message: string }> {
  const url = `${API_BASE_URL}/customers/${id}`;
  console.log('[Customer API v6] 고객 삭제:', url);

  const response = await fetch(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '고객 삭제에 실패했습니다');
  }

  return response.json();
}

// 고객 검색 (자동완성용)
export async function searchCustomers(query: string): Promise<Customer[]> {
  const params = new URLSearchParams({ q: query });
  const url = `${API_BASE_URL}/customers/search?${params}`;
  console.log('[Customer API v6] 고객 검색:', url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('고객 검색에 실패했습니다');
  }

  const result = await response.json();
  return result.data;
}

// 사주 계산 (저장 없이)
export async function calculateSaju(
  birth_date: string,
  birth_time: string,
  lunar_solar: 'lunar' | 'solar' = 'solar'
): Promise<any> {
  const url = `${API_BASE_URL}/saju/calculate`;
  console.log('[Customer API v6] 사주 계산:', url);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ birth_date, birth_time, lunar_solar }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '사주 계산에 실패했습니다');
  }

  return response.json();
}