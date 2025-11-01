/**
 * Mock Customer Data
 * 개발 환경에서 사용할 임시 고객 데이터
 * TODO: 추후 실제 데이터베이스로 전환
 */

import { Customer } from '@/services/customerApi';
import { calculateSajuData } from '@/utils/sajuDataCalculator';

export const mockCustomers: Customer[] = [
  {
    id: 1,
    name: '박준수',
    birth_date: '1990-05-15',
    birth_time: '14:30',
    phone: '010-1234-5678',
    gender: 'male',
    lunar_solar: 'solar',
    memo: '사주 상담 고객',
    saju_data: {
      year: { gan: '경', ji: '오' },
      month: { gan: '신', ji: '사' },
      day: { gan: '갑', ji: '자' },
      time: { gan: '신', ji: '미' },
      ohHaengBalance: {
        목: 25,
        화: 30,
        토: 15,
        금: 20,
        수: 10,
      },
      sipSungBalance: {
        비겁: 12,
        식상: 18,
        재성: 15,
        관성: 10,
        인성: 8,
      },
      fullSaju: '경오 신사 갑자 신미',
      _isMinimal: false,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: '이정미',
    birth_date: '1988-11-22',
    birth_time: '09:15',
    phone: '010-9876-5432',
    gender: 'female',
    lunar_solar: 'lunar',
    memo: '궁합 상담 고객',
    saju_data: {
      year: { gan: '무', ji: '진' },
      month: { gan: '계', ji: '해' },
      day: { gan: '을', ji: '사' },
      time: { gan: '신', ji: '사' },
      ohHaengBalance: {
        목: 18,
        화: 22,
        토: 20,
        금: 25,
        수: 15,
      },
      sipSungBalance: {
        비겁: 14,
        식상: 16,
        재성: 18,
        관성: 9,
        인성: 6,
      },
      fullSaju: '무진 계해 을사 신사',
      _isMinimal: false,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: '최민호',
    birth_date: '1985-03-10',
    birth_time: '16:45',
    phone: '010-5555-1234',
    gender: 'male',
    lunar_solar: 'solar',
    memo: '귀문둔갑 상담',
    saju_data: {
      year: { gan: '을', ji: '축' },
      month: { gan: '기', ji: '묘' },
      day: { gan: '병', ji: '신' },
      time: { gan: '병', ji: '신' },
      ohHaengBalance: {
        목: 22,
        화: 28,
        토: 12,
        금: 28,
        수: 10,
      },
      sipSungBalance: {
        비겁: 16,
        식상: 20,
        재성: 14,
        관성: 7,
        인성: 5,
      },
      fullSaju: '을축 기묘 병신 병신',
      _isMinimal: false,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: '김영희',
    birth_date: '1992-07-20',
    birth_time: '08:30',
    phone: '010-2222-3333',
    gender: 'female',
    lunar_solar: 'solar',
    memo: '타로 상담',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    name: '이철수',
    birth_date: '1995-12-05',
    birth_time: '19:20',
    phone: '010-4444-5555',
    gender: 'male',
    lunar_solar: 'lunar',
    memo: '자미두수 상담',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 6,
    name: '김영수',
    birth_date: '1971-11-17',
    birth_time: '04:00',
    phone: '010-7171-1971',
    gender: 'male',
    lunar_solar: 'solar',
    memo: '1971년생 테스트 고객 (현재 만 53세, 한국나이 54세)',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// 로컬 스토리지 키
const STORAGE_KEY = 'sajuapp_customers';

/**
 * 로컬 스토리지에서 고객 목록 로드
 */
export function loadCustomersFromLocalStorage(): Customer[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('[LocalStorage] 고객 데이터 로드 실패:', error);
  }
  // 저장된 데이터가 없으면 mock 데이터 반환
  return [...mockCustomers];
}

/**
 * 로컬 스토리지에 고객 목록 저장
 */
export function saveCustomersToLocalStorage(customers: Customer[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  } catch (error) {
    console.error('[LocalStorage] 고객 데이터 저장 실패:', error);
  }
}

/**
 * 고객 추가
 */
export function addCustomerToLocalStorage(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Customer {
  const customers = loadCustomersFromLocalStorage();
  const maxId = customers.length > 0 ? Math.max(...customers.map(c => c.id!)) : 0;

  // 🎯 완전한 사주 데이터 자동 생성
  let sajuData = customer.saju_data;

  if (!sajuData && customer.birth_date && customer.birth_time) {
    try {
      console.log('🔮 [고객등록] 완전한 사주 데이터 자동 생성 시작');
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
      sajuData = {
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
      console.log('✅ [고객등록] 완전한 사주 데이터 생성 완료:', sajuData.fullSaju);
    } catch (error) {
      console.error('❌ [고객등록] 사주 데이터 생성 실패:', error);
    }
  }

  const newCustomer: Customer = {
    ...customer,
    id: maxId + 1,
    saju_data: sajuData, // 🎯 완전한 사주 데이터 저장
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  customers.push(newCustomer);
  saveCustomersToLocalStorage(customers);

  return newCustomer;
}

/**
 * 고객 수정
 */
export function updateCustomerInLocalStorage(id: number, updates: Partial<Customer>): Customer | null {
  const customers = loadCustomersFromLocalStorage();
  const index = customers.findIndex(c => c.id === id);

  if (index === -1) return null;

  customers[index] = {
    ...customers[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  saveCustomersToLocalStorage(customers);
  return customers[index];
}

/**
 * 고객 삭제
 */
export function deleteCustomerFromLocalStorage(id: number): boolean {
  const customers = loadCustomersFromLocalStorage();
  const filteredCustomers = customers.filter(c => c.id !== id);

  if (filteredCustomers.length === customers.length) return false;

  saveCustomersToLocalStorage(filteredCustomers);
  return true;
}
