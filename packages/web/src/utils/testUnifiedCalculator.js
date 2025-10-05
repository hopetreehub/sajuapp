// Test the unified saju calculator specifically

// Import the unified calculator
import { calculateSaju } from './unifiedSajuCalculator.ts';

console.log('=== 통합 사주 계산기 테스트 ===');

// Test case 1: 1971년 11월 17일 04:00
const testCase1 = {
  year: 1971,
  month: 11,
  day: 17,
  hour: 4,
  minute: 0,
  isLunar: false,
  name: '테스트1',
  gender: 'male',
};

// Test case 2: 1995년 9월 2일 04:00
const testCase2 = {
  year: 1995,
  month: 9,
  day: 2,
  hour: 4,
  minute: 0,
  isLunar: false,
  name: '테스트2',
  gender: 'male',
};

console.log('\n1. 1971년 11월 17일 04:00 테스트');
console.log('정답: 신해 기해 병오 경인');
const result1 = calculateSaju(testCase1);
const saju1 = `${result1.fourPillars.year} ${result1.fourPillars.month} ${result1.fourPillars.day} ${result1.fourPillars.hour}`;
console.log(`계산: ${saju1}`);
console.log(`일치: ${saju1 === '신해 기해 병오 경인' ? '✓' : '✗'}`);

console.log('\n2. 1995년 9월 2일 04:00 테스트');
console.log('정답: 을해 갑신 병신 경인');
const result2 = calculateSaju(testCase2);
const saju2 = `${result2.fourPillars.year} ${result2.fourPillars.month} ${result2.fourPillars.day} ${result2.fourPillars.hour}`;
console.log(`계산: ${saju2}`);
console.log(`일치: ${saju2 === '을해 갑신 병신 경인' ? '✓' : '✗'}`);

console.log('\n=== 요약 ===');
console.log(`1971.11.17 04:00 → ${saju1}`);
console.log(`1995.09.02 04:00 → ${saju2}`);