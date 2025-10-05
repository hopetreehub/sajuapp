/**
 * 사주 계산 테스트
 */

import { calculateSaju } from './unifiedSajuCalculator';
import { SajuBirthInfo } from '@/types/saju';

export function testSajuCalculations() {

  // 테스트 케이스 1: 1971년 11월 17일 04:00
  const testCase1: SajuBirthInfo = {
    year: 1971,
    month: 11,
    day: 17,
    hour: 4,
    minute: 0,
    isLunar: false,
    name: '테스트1',
    gender: 'male',
  };
  
  // 테스트 케이스 2: 1995년 9월 2일 04:00
  const testCase2: SajuBirthInfo = {
    year: 1995,
    month: 9,
    day: 2,
    hour: 4,
    minute: 0,
    isLunar: false,
    name: '테스트2',
    gender: 'male',
  };


  const result1 = calculateSaju(testCase1);


  const result2 = calculateSaju(testCase2);


  // 요약 비교


  return { result1, result2 };
}

// 테스트 실행
if (typeof window !== 'undefined') {
  // 브라우저 환경에서 실행
  (window as any).testSaju = testSajuCalculations;

}

// 바로 실행
testSajuCalculations();