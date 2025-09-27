// 고객 관리 API 서비스

// 프로덕션 URL 직접 설정 (localhost 문제 해결)
const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? '/api/calendar'  // 로컬 개발 환경
  : 'https://calendar-j3vjlsr7q-johns-projects-bf5e60f3.vercel.app/api/calendar';  // Vercel 프로덕션 환경

// 디버깅용 로그
if (typeof window !== 'undefined') {
  console.log('[Customer API] Using URL:', API_BASE_URL);
  console.log('[Customer API] Current hostname:', window.location.hostname);
}

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
  search: string = '',
): Promise<CustomerListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search,
  });
  
  const response = await fetch(`${API_BASE_URL}/customers?${params}`);
  if (!response.ok) {
    throw new Error('고객 목록을 불러오는데 실패했습니다');
  }
  
  return response.json();
}

// 고객 상세 조회
export async function getCustomerById(id: number): Promise<CustomerResponse> {
  const response = await fetch(`${API_BASE_URL}/customers/${id}`);
  if (!response.ok) {
    throw new Error('고객 정보를 불러오는데 실패했습니다');
  }
  
  return response.json();
}

// 고객 등록
export async function createCustomer(customer: Customer): Promise<CustomerResponse> {
  const response = await fetch(`${API_BASE_URL}/customers`, {
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
  customer: Customer,
): Promise<CustomerResponse> {
  const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
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
  const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
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
  const response = await fetch(`${API_BASE_URL}/customers/search?${params}`);
  
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
  lunar_solar: 'lunar' | 'solar' = 'solar',
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/saju/calculate`, {
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