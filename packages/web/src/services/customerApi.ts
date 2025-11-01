// 고객 관리 API 서비스 - LocalStorage 기반 (개발 환경)

import {
  loadCustomersFromLocalStorage,
  addCustomerToLocalStorage,
  updateCustomerInLocalStorage,
  deleteCustomerFromLocalStorage,
} from '@/data/mockCustomerData';
import { calculateSajuData } from '@/utils/sajuDataCalculator';

// 개발 환경에서는 LocalStorage 사용
const USE_LOCAL_STORAGE = import.meta.env.DEV;

// API Base URL 설정
const API_BASE_URL = '/api/customers';

// 초기화 로깅
if (typeof window !== 'undefined') {
  console.log('[Customer API] 초기화:', USE_LOCAL_STORAGE ? 'LocalStorage 모드' : 'API 모드');
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
  // 개발 환경: LocalStorage 사용
  if (USE_LOCAL_STORAGE) {
    try {
      let customers = loadCustomersFromLocalStorage();

      // 검색어가 있으면 필터링
      if (search.trim()) {
        const searchLower = search.toLowerCase();
        customers = customers.filter(
          (c) =>
            c.name.toLowerCase().includes(searchLower) ||
            c.phone?.includes(searchLower) ||
            c.memo?.toLowerCase().includes(searchLower),
        );
      }

      // 페이지네이션
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedCustomers = customers.slice(startIndex, endIndex);

      return {
        success: true,
        data: paginatedCustomers,
        total: customers.length,
        page,
        totalPages: Math.ceil(customers.length / limit),
      };
    } catch (error) {
      console.error('[Customer API] LocalStorage 조회 실패:', error);
      return {
        success: false,
        data: [],
        total: 0,
        page,
        totalPages: 0,
      };
    }
  }

  // 프로덕션 환경: API 사용
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search,
  });

  const url = `${API_BASE_URL}?${params}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Customer API] 응답 에러:', errorText);
      throw new Error(`고객 목록을 불러오는데 실패했습니다 (${response.status})`);
    }

    const result = await response.json();

    // API 응답을 CustomerListResponse 형식으로 변환
    return {
      success: result.success,
      data: result.data || [],
      total: result.total || result.data?.length || 0,
      page,
      totalPages: Math.ceil((result.total || result.data?.length || 0) / limit),
    };
  } catch (error) {
    console.error('[Customer API] 요청 실패:', error);
    throw error;
  }
}

// 고객 상세 조회
export async function getCustomerById(id: number): Promise<CustomerResponse> {
  // 개발 환경: LocalStorage 사용
  if (USE_LOCAL_STORAGE) {
    try {
      const customers = loadCustomersFromLocalStorage();
      const customer = customers.find((c) => c.id === id);

      if (!customer) {
        throw new Error('고객을 찾을 수 없습니다');
      }

      return {
        success: true,
        data: customer,
      };
    } catch (error) {
      console.error('[Customer API] LocalStorage 조회 실패:', error);
      throw new Error('고객 정보를 불러오는데 실패했습니다');
    }
  }

  // 프로덕션 환경: API 사용
  const url = `${API_BASE_URL}?id=${id}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('고객 정보를 불러오는데 실패했습니다');
  }

  return response.json();
}

// 고객 등록
export async function createCustomer(customer: Customer): Promise<CustomerResponse> {
  // 🎯 완전한 사주 데이터 자동 생성 (프로덕션 환경용)
  let enrichedCustomer = customer;

  if (!customer.saju_data && customer.birth_date && customer.birth_time) {
    try {
      console.log('🔮 [Customer API] 완전한 사주 데이터 자동 생성 시작');
      const birthDate = new Date(customer.birth_date);
      const [hour, minute] = customer.birth_time.split(':').map(Number);

      const fullSajuData = calculateSajuData({
        year: birthDate.getFullYear(),
        month: birthDate.getMonth() + 1,
        day: birthDate.getDate(),
        hour: hour || 0,
        minute: minute || 0,
        isLunar: customer.lunar_solar === 'lunar',
        gender: customer.gender,
        useTrueSolarTime: true,
      });

      // 차트용 형식으로 변환
      const sajuData = {
        year: { gan: fullSajuData.fourPillars.year.heavenly, ji: fullSajuData.fourPillars.year.earthly },
        month: { gan: fullSajuData.fourPillars.month.heavenly, ji: fullSajuData.fourPillars.month.earthly },
        day: { gan: fullSajuData.fourPillars.day.heavenly, ji: fullSajuData.fourPillars.day.earthly },
        time: { gan: fullSajuData.fourPillars.hour.heavenly, ji: fullSajuData.fourPillars.hour.earthly },
        ohHaengBalance: {
          목: fullSajuData.fiveElements.wood,
          화: fullSajuData.fiveElements.fire,
          토: fullSajuData.fiveElements.earth,
          금: fullSajuData.fiveElements.metal,
          수: fullSajuData.fiveElements.water,
        },
        sipSungBalance: {
          비겁: fullSajuData.tenGods.bijeon,
          식상: fullSajuData.tenGods.siksin,
          재성: fullSajuData.tenGods.jeongjae + fullSajuData.tenGods.pyeonjae,
          관성: fullSajuData.tenGods.jeonggwan + fullSajuData.tenGods.pyeongwan,
          인성: fullSajuData.tenGods.jeongin + fullSajuData.tenGods.pyeongin,
        },
        fullSaju: `${fullSajuData.fourPillars.year.heavenly}${fullSajuData.fourPillars.year.earthly} ${fullSajuData.fourPillars.month.heavenly}${fullSajuData.fourPillars.month.earthly} ${fullSajuData.fourPillars.day.heavenly}${fullSajuData.fourPillars.day.earthly} ${fullSajuData.fourPillars.hour.heavenly}${fullSajuData.fourPillars.hour.earthly}`,
        _isMinimal: false,
      };

      enrichedCustomer = {
        ...customer,
        saju_data: sajuData,
      };

      console.log('✅ [Customer API] 완전한 사주 데이터 생성 완료:', sajuData.fullSaju);
    } catch (error) {
      console.error('❌ [Customer API] 사주 데이터 생성 실패:', error);
      // 실패 시에도 고객 등록은 진행 (사주 데이터 없이)
    }
  }

  // 개발 환경: LocalStorage 사용
  if (USE_LOCAL_STORAGE) {
    try {
      const newCustomer = addCustomerToLocalStorage(enrichedCustomer);
      return {
        success: true,
        data: newCustomer,
      };
    } catch (error) {
      console.error('[Customer API] LocalStorage 생성 실패:', error);
      throw new Error('고객 등록에 실패했습니다');
    }
  }

  // 프로덕션 환경: API 사용
  const url = API_BASE_URL;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(enrichedCustomer),
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
  // 개발 환경: LocalStorage 사용
  if (USE_LOCAL_STORAGE) {
    try {
      const updatedCustomer = updateCustomerInLocalStorage(id, customer);

      if (!updatedCustomer) {
        throw new Error('고객을 찾을 수 없습니다');
      }

      return {
        success: true,
        data: updatedCustomer,
      };
    } catch (error) {
      console.error('[Customer API] LocalStorage 수정 실패:', error);
      throw new Error('고객 정보 수정에 실패했습니다');
    }
  }

  // 프로덕션 환경: API 사용
  const url = `${API_BASE_URL}?id=${id}`;

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
  // 개발 환경: LocalStorage 사용
  if (USE_LOCAL_STORAGE) {
    try {
      const success = deleteCustomerFromLocalStorage(id);

      if (!success) {
        throw new Error('고객을 찾을 수 없습니다');
      }

      return {
        success: true,
        message: '고객이 삭제되었습니다',
      };
    } catch (error) {
      console.error('[Customer API] LocalStorage 삭제 실패:', error);
      throw new Error('고객 삭제에 실패했습니다');
    }
  }

  // 프로덕션 환경: API 사용
  const url = `${API_BASE_URL}?id=${id}`;

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