import { calculateCompleteSaju } from './packages/web/src/utils/accurateSajuCalculator.ts';

console.log('=== 정확한 사주 계산기 테스트 ===\n');

// 테스트 케이스 1: 1971년 11월 17일 04:00 (병오일로 알려진 날짜)
console.log('테스트 1: 1971년 11월 17일 04:00');
const test1 = calculateCompleteSaju(1971, 11, 17, 4, 0);
console.log('결과:', test1.fullSaju);
console.log('예상: 신해년 기해월 병오일 경인시');
console.log('일치:', test1.day === '병오' ? '✅ 일주 정확!' : '❌ 일주 불일치');
console.log('');

// 테스트 케이스 2: 2000년 1월 1일 00:00
console.log('테스트 2: 2000년 1월 1일 00:00');
const test2 = calculateCompleteSaju(2000, 1, 1, 0, 0);
console.log('결과:', test2.fullSaju);
console.log('예상: 기묘년 병자월 병진일 무자시');
console.log('일치:', test2.day === '병진' ? '✅ 일주 정확!' : '❌ 일주 불일치');
console.log('');

// 테스트 케이스 3: 2024년 1월 1일 12:00
console.log('테스트 3: 2024년 1월 1일 12:00');
const test3 = calculateCompleteSaju(2024, 1, 1, 12, 0);
console.log('결과:', test3.fullSaju);
console.log('예상: 계묘년 갑자월 임인일 병오시');
console.log('일치:', test3.day === '임인' ? '✅ 일주 정확!' : '❌ 일주 불일치');
console.log('');

// 테스트 케이스 4: 1900년 1월 1일 (기준일 갑술일)
console.log('테스트 4: 1900년 1월 1일 12:00');
const test4 = calculateCompleteSaju(1900, 1, 1, 12, 0);
console.log('결과:', test4.fullSaju);
console.log('예상 일주: 갑술');
console.log('일치:', test4.day === '갑술' ? '✅ 일주 정확!' : '❌ 일주 불일치');
console.log('');

console.log('=== 테스트 완료 ===');
