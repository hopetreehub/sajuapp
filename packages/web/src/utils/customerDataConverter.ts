/**
 * 고객 데이터 변환 유틸리티
 * Customer 타입과 LifetimeFortuneRequest 타입 간 변환
 */

import { Customer } from '@/services/customerApi';
import { LifetimeFortuneRequest } from '@/services/lifetimeFortuneApi';
import { UserProfile } from '@/types/user';
import { SajuBirthInfo } from '@/types/saju';

/**
 * Customer 객체를 LifetimeFortuneRequest로 변환
 */
export function convertCustomerToLifetimeRequest(
  customer: Customer
): LifetimeFortuneRequest {
  const birthDate = new Date(customer.birth_date);
  const [hour] = customer.birth_time.split(':').map(Number);
  
  return {
    year: birthDate.getFullYear(),
    month: birthDate.getMonth() + 1, // JavaScript Date는 0부터 시작
    day: birthDate.getDate(),
    hour: hour,
    isLunar: customer.lunar_solar === 'lunar',
    gender: customer.gender
  };
}

/**
 * UserProfile 객체를 LifetimeFortuneRequest로 변환
 */
export function convertUserToLifetimeRequest(
  user: UserProfile | { birthInfo: SajuBirthInfo; gender?: 'male' | 'female' }
): LifetimeFortuneRequest {
  const birthInfo = user.birthInfo;
  
  return {
    year: birthInfo.year,
    month: birthInfo.month,
    day: birthInfo.day,
    hour: birthInfo.hour,
    isLunar: birthInfo.isLunar || false,
    gender: ('gender' in user && user.gender) || birthInfo.gender || 'male'
  };
}

/**
 * Customer 또는 UserProfile을 LifetimeFortuneRequest로 변환
 */
export function convertToLifetimeRequest(
  data: Customer | UserProfile | { birthInfo: SajuBirthInfo }
): LifetimeFortuneRequest {
  if ('birth_date' in data) {
    // Customer 타입
    return convertCustomerToLifetimeRequest(data);
  } else if ('birthInfo' in data) {
    // UserProfile 또는 birthInfo를 가진 객체
    return convertUserToLifetimeRequest(data as UserProfile);
  }
  
  throw new Error('Invalid data type for conversion');
}

/**
 * 캐시 키 생성 (고객 데이터 기반)
 */
export function getCacheKey(
  data: Customer | UserProfile | { birthInfo: SajuBirthInfo }
): string {
  if ('birth_date' in data) {
    // Customer 타입
    return `${data.birth_date}-${data.birth_time}-${data.gender}-${data.lunar_solar}`;
  } else if ('birthInfo' in data) {
    // UserProfile 타입
    const info = data.birthInfo;
    return `${info.year}-${info.month}-${info.day}-${info.hour}-${info.gender}-${info.isLunar}`;
  }
  
  return '';
}

/**
 * 고객 정보로부터 이름 추출
 */
export function getCustomerName(
  data: Customer | UserProfile | null
): string {
  if (!data) return '미선택';
  
  if ('name' in data) {
    return data.name;
  }
  
  return '사용자';
}

/**
 * 고객 정보로부터 생년월일 문자열 생성
 */
export function getCustomerBirthDateString(
  data: Customer | UserProfile | null
): string {
  if (!data) return '';
  
  if ('birth_date' in data) {
    // Customer 타입
    const date = new Date(data.birth_date);
    const lunar = data.lunar_solar === 'lunar' ? '(음력)' : '';
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${data.birth_time} ${lunar}`;
  } else if ('birthInfo' in data) {
    // UserProfile 타입
    const info = data.birthInfo;
    const lunar = info.isLunar ? '(음력)' : '';
    return `${info.year}년 ${info.month}월 ${info.day}일 ${info.hour}시 ${lunar}`;
  }
  
  return '';
}