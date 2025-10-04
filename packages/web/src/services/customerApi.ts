// 고객 관리 API 서비스 - Vercel 풀스택 버전

// API Base URL 설정
const API_BASE_URL = '/api/customers';

// 초기화 로깅
if (typeof window !== 'undefined') {
  console.log('[Customer API] Vercel 풀스택 모드');
  console.log('[Customer API] Base URL:', API_BASE_URL);
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
  search: string = '',
): Promise<CustomerListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search,
  });

  const url = `${API_BASE_URL}?${params}`;
  console.log('[Customer API] 고객 목록 조회:', url);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Customer API] 응답 에러:', errorText);
      throw new Error(`고객 목록을 불러오는데 실패했습니다 (${response.status})`);
    }

    const result = await response.json();
    console.log('[Customer API] 응답 데이터:', result);

    // API 응답을 CustomerListResponse 형식으로 변환
    return {
      success: result.success,
      data: result.data || [],
      total: result.total || result.data?.length || 0,
      page: page,
      totalPages: Math.ceil((result.total || result.data?.length || 0) / limit),
    };
  } catch (error) {
    console.error('[Customer API] 요청 실패:', error);
    throw error;
  }
}

// 고객 상세 조회
export async function getCustomerById(id: number): Promise<CustomerResponse> {
  const url = `${API_BASE_URL}?id=${id}`;
  console.log('[Customer API] 고객 상세 조회:', url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('고객 정보를 불러오는데 실패했습니다');
  }

  return response.json();
}

// 고객 등록
export async function createCustomer(customer: Customer): Promise<CustomerResponse> {
  const url = API_BASE_URL;

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
  customer: Customer,
): Promise<CustomerResponse> {
  const url = `${API_BASE_URL}?id=${id}`;
  console.log('[Customer API] 고객 수정:', url);

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
  const url = `${API_BASE_URL}?id=${id}`;
  console.log('[Customer API] 고객 삭제:', url);

  const response = await fetch(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '고객 삭제에 실패했습니다');
  }

  return response.json();
}

// 고객 검색
export async function searchCustomers(query: string): Promise<Customer[]> {
  const params = new URLSearchParams({ q: query });
  const url = `${API_BASE_URL}/search?${params}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('고객 검색에 실패했습니다');
  }

  const result = await response.json();
  return result.data;
}

// 사주 계산
export async function calculateSaju(
  birth_date: string,
  birth_time: string,
  lunar_solar: 'lunar' | 'solar' = 'solar',
): Promise<any> {
  const url = import.meta.env.DEV ? `${API_BASE_URL}/saju/calculate` : '/api/saju/calculate';

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