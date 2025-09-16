// Customer와 SajuBirthInfo 간 변환 유틸리티

import { Customer } from '@/services/customerApi';
import { SajuBirthInfo } from '@/types/saju';

/**
 * Customer 데이터를 SajuBirthInfo로 변환
 */
export function customerToSajuBirthInfo(customer: Customer): SajuBirthInfo {
  // birth_date는 "YYYY-MM-DD" 형식으로 저장됨
  const [year, month, day] = customer.birth_date.split('-').map(Number);

  // birth_time은 "HH:MM" 형식으로 저장됨
  const [hour, minute] = customer.birth_time.split(':').map(Number);

  return {
    year,
    month,
    day,
    hour,
    minute: minute || 0,
    isLunar: customer.lunar_solar === 'lunar',
    name: customer.name,
    gender: customer.gender,
  };
}

/**
 * SajuBirthInfo를 Customer 형식으로 변환 (부분적)
 */
export function sajuBirthInfoToCustomerPartial(
  birthInfo: SajuBirthInfo,
  phone: string = '',
): Partial<Customer> {
  // 날짜를 "YYYY-MM-DD" 형식으로 변환
  const birth_date = `${birthInfo.year}-${String(birthInfo.month).padStart(2, '0')}-${String(birthInfo.day).padStart(2, '0')}`;

  // 시간을 "HH:MM" 형식으로 변환
  const birth_time = `${String(birthInfo.hour).padStart(2, '0')}:${String(birthInfo.minute || 0).padStart(2, '0')}`;

  return {
    name: birthInfo.name || '',
    birth_date,
    birth_time,
    phone,
    lunar_solar: birthInfo.isLunar ? 'lunar' : 'solar',
    gender: birthInfo.gender || 'male',
  };
}

/**
 * 생년월일 문자열을 포맷팅
 */
export function formatCustomerBirthDate(customer: Customer): string {
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const [year, month, day] = customer.birth_date.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const weekday = weekdays[date.getDay()];

  const [hour, minute] = customer.birth_time.split(':').map(Number);

  return `${year}년 ${month}월 ${day}일 ${hour}시 ${minute || 0}분 (${weekday}요일) ${customer.lunar_solar === 'lunar' ? '음력' : '양력'}`;
}

/**
 * Customer 객체가 유효한지 검증
 */
export function validateCustomer(
  customer: Partial<Customer>,
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!customer.name?.trim()) {
    errors.push('이름은 필수입니다');
  }

  if (!customer.birth_date) {
    errors.push('생년월일은 필수입니다');
  } else {
    // 날짜 형식 검증
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(customer.birth_date)) {
      errors.push('생년월일 형식이 올바르지 않습니다 (YYYY-MM-DD)');
    }
  }

  if (!customer.birth_time) {
    errors.push('출생시간은 필수입니다');
  } else {
    // 시간 형식 검증
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(customer.birth_time)) {
      errors.push('출생시간 형식이 올바르지 않습니다 (HH:MM)');
    }
  }

  if (!customer.phone?.trim()) {
    errors.push('전화번호는 필수입니다');
  }

  if (!customer.lunar_solar ||
      !['lunar', 'solar'].includes(customer.lunar_solar)) {
    errors.push('음력/양력 선택은 필수입니다');
  }

  if (!customer.gender || !['male', 'female'].includes(customer.gender)) {
    errors.push('성별 선택은 필수입니다');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}