// 웹 검색 결과를 바탕으로 정확한 기준일 역산

const SIXTY_CYCLE = [
  '갑자', '을축', '병인', '정묘', '무진', '기사', '경오', '신미', '임신', '계유',  // 0-9
  '갑술', '을해', '병자', '정축', '무인', '기묘', '경진', '신사', '임오', '계미',  // 10-19
  '갑신', '을유', '병술', '정해', '무자', '기축', '경인', '신묘', '임진', '계사',  // 20-29
  '갑오', '을미', '병신', '정유', '무술', '기해', '경자', '신축', '임인', '계묘',  // 30-39
  '갑진', '을사', '병오', '정미', '무신', '기유', '경술', '신해', '임자', '계축',  // 40-49
  '갑인', '을묘', '병진', '정사', '무오', '기미', '경신', '신유', '임술', '계해'   // 50-59
];

function getJulianDay(year, month, day) {
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + 
         Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

// 웹 검색 결과: 1971년 11월 17일 = 무인일
const targetDate = { year: 1971, month: 11, day: 17, gapja: '무인' };
const baseDate = { year: 1900, month: 1, day: 1 };

// 1971/11/17이 무인일이라면, 1900/1/1은 무엇이어야 하는가?
const targetJD = getJulianDay(targetDate.year, targetDate.month, targetDate.day);
const baseJD = getJulianDay(baseDate.year, baseDate.month, baseDate.day);
const dayDiff = targetJD - baseJD;

const targetIndex = SIXTY_CYCLE.indexOf(targetDate.gapja); // 무인 = index 14
let baseIndex = (targetIndex - dayDiff % 60 + 60) % 60;

console.log('=== 정확한 기준일 역산 ===');
console.log(`타겟 날짜: ${targetDate.year}년 ${targetDate.month}월 ${targetDate.day}일`);
console.log(`타겟 갑자: ${targetDate.gapja} (index ${targetIndex})`);
console.log(`기준 날짜: ${baseDate.year}년 ${baseDate.month}월 ${baseDate.day}일`);
console.log('');
console.log(`Julian Day 계산:`);
console.log(`  1900/1/1: ${baseJD}`);
console.log(`  1971/11/17: ${targetJD}`);
console.log(`  일수 차이: ${dayDiff}`);
console.log('');
console.log(`역산 계산:`);
console.log(`  ${targetIndex} - ${dayDiff} = ${targetIndex - dayDiff}`);
console.log(`  (${targetIndex - dayDiff}) % 60 = ${(targetIndex - dayDiff) % 60}`);
console.log(`  조정 후: ${baseIndex}`);
console.log('');
console.log(`🎯 결론: 1900년 1월 1일 = ${SIXTY_CYCLE[baseIndex]} (index ${baseIndex})`);

// 검증: 계산된 기준일로 1971/11/17을 다시 계산해보기
let verifyIndex = (baseIndex + dayDiff) % 60;
if (verifyIndex < 0) verifyIndex += 60;

console.log('');
console.log('=== 검증 ===');
console.log(`기준일 ${SIXTY_CYCLE[baseIndex]}로 1971/11/17 계산:`);
console.log(`  ${baseIndex} + ${dayDiff} = ${baseIndex + dayDiff}`);
console.log(`  (${baseIndex + dayDiff}) % 60 = ${verifyIndex}`);
console.log(`  결과: ${SIXTY_CYCLE[verifyIndex]}`);
console.log(`  예상: ${targetDate.gapja}`);
console.log(`  일치: ${SIXTY_CYCLE[verifyIndex] === targetDate.gapja ? '✅' : '❌'}`);

// 다른 검증 날짜들도 테스트
console.log('');
console.log('=== 다른 날짜 검증 ===');
const testDates = [
  { year: 2000, month: 1, day: 1, desc: '2000년 1월 1일' },
  { year: 1984, month: 2, day: 4, desc: '1984년 2월 4일' },
  { year: 1900, month: 1, day: 31, desc: '1900년 1월 31일' }
];

testDates.forEach(date => {
  const jd = getJulianDay(date.year, date.month, date.day);
  const diff = jd - baseJD;
  let idx = (baseIndex + diff) % 60;
  if (idx < 0) idx += 60;
  console.log(`${date.desc}: ${SIXTY_CYCLE[idx]}`);
});