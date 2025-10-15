/**
 * Mock Customer Data
 * 개발 환경에서 사용할 임시 고객 데이터
 * TODO: 추후 실제 데이터베이스로 전환
 */

import { Customer } from '@/services/customerApi';

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

  const newCustomer: Customer = {
    ...customer,
    id: maxId + 1,
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
