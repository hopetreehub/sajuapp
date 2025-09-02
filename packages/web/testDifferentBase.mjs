// 다른 기준일로 사주 계산 테스트

const SIXTY_CYCLE = [
  '갑자', '을축', '병인', '정묘', '무진', '기사', '경오', '신미', '임신', '계유',  // 0-9
  '갑술', '을해', '병자', '정축', '무인', '기묘', '경진', '신사', '임오', '계미',  // 10-19
  '갑신', '을유', '병술', '정해', '무자', '기축', '경인', '신묘', '임진', '계사',  // 20-29
  '갑오', '을미', '병신', '정유', '무술', '기해', '경자', '신축', '임인', '계묘',  // 30-39
  '갑진', '을사', '병오', '정미', '무신', '기유', '경술', '신해', '임자', '계축',  // 40-49
  '갑인', '을묘', '병진', '정사', '무오', '기미', '경신', '신유', '임술', '계해'   // 50-59
];

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function getDaysInMonth(year, month) {
  const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear(year)) return 29;
  return monthDays[month - 1];
}

function calculateDayPillarWithBase(year, month, day, baseGapja) {
  const baseYear = 1900, baseMonth = 1, baseDay = 1;
  const baseIndex = SIXTY_CYCLE.indexOf(baseGapja);
  
  let totalDays = 0;
  
  // 년도 차이
  for (let y = baseYear; y < year; y++) {
    totalDays += isLeapYear(y) ? 366 : 365;
  }
  
  // 월 차이
  for (let m = baseMonth; m < month; m++) {
    totalDays += getDaysInMonth(year, m);
  }
  
  // 일 차이
  totalDays += (day - baseDay);
  
  let cycleIndex = (baseIndex + totalDays) % 60;
  if (cycleIndex < 0) cycleIndex += 60;
  
  return SIXTY_CYCLE[cycleIndex];
}

console.log('=== 다른 기준일로 계산 테스트 ===\n');

// 가능한 기준일들 테스트
const possibleBases = [
  { base: '갑자', name: '갑자일' },
  { base: '갑진', name: '갑진일' },
  { base: '무오', name: '무오일' },
  { base: '정미', name: '정미일' },
  { base: '경자', name: '경자일' }
];

console.log('1971년 11월 17일 계산 (다양한 기준일):');

possibleBases.forEach(({base, name}) => {
  const result = calculateDayPillarWithBase(1971, 11, 17, base);
  console.log(`1900/1/1 = ${name} 기준 → 1971/11/17 = ${result}`);
});

console.log('\n=== 역산 검증 ===');

// 만약 1971/11/17이 특정 갑자라면, 1900/1/1은 무엇이어야 하는가?
function reverseCalculate(targetYear, targetMonth, targetDay, targetGapja) {
  const targetIndex = SIXTY_CYCLE.indexOf(targetGapja);
  const baseYear = 1900, baseMonth = 1, baseDay = 1;
  
  let totalDays = 0;
  for (let y = baseYear; y < targetYear; y++) {
    totalDays += isLeapYear(y) ? 366 : 365;
  }
  for (let m = baseMonth; m < targetMonth; m++) {
    totalDays += getDaysInMonth(targetYear, m);
  }
  totalDays += (targetDay - baseDay);
  
  let baseIndex = (targetIndex - totalDays % 60 + 60) % 60;
  return SIXTY_CYCLE[baseIndex];
}

// 1971/11/17이 여러 갑자일 경우의 1900/1/1 기준일
const testTargets = ['을미', '병인', '정묘', '무진', '기사'];

testTargets.forEach(target => {
  const calculatedBase = reverseCalculate(1971, 11, 17, target);
  console.log(`1971/11/17 = ${target}라면 → 1900/1/1 = ${calculatedBase}`);
  
  // 검증
  const verify = calculateDayPillarWithBase(1971, 11, 17, calculatedBase);
  console.log(`  검증: ${calculatedBase} 기준으로 계산 → ${verify} ${verify === target ? '✅' : '❌'}`);
});

console.log('\n=== 기준일 검증용 다른 날짜들 ===');

// 알려진 다른 날짜로 검증
const knownDates = [
  { year: 2000, month: 1, day: 1, desc: '2000년 1월 1일 (토요일)' },
  { year: 1984, month: 2, day: 4, desc: '1984년 2월 4일 (갑자년 입춘)' }
];

possibleBases.forEach(({base, name}) => {
  console.log(`\n1900/1/1 = ${name} 기준:`);
  knownDates.forEach(({year, month, day, desc}) => {
    const result = calculateDayPillarWithBase(year, month, day, base);
    console.log(`  ${desc} → ${result}`);
  });
});

console.log('\n=== Julian Day Number 방식 비교 ===');

// Julian Day Number 계산
function getJulianDay(year, month, day) {
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + 
         Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

const jd1900 = getJulianDay(1900, 1, 1);
const jd1971 = getJulianDay(1971, 11, 17);
const dayDiff = jd1971 - jd1900;

console.log(`1900/1/1 Julian Day: ${jd1900}`);
console.log(`1971/11/17 Julian Day: ${jd1971}`);
console.log(`일수 차이: ${dayDiff}`);
console.log(`60으로 나눈 나머지: ${dayDiff % 60}`);

// 여러 기준 인덱스로 계산
[0, 10, 20, 30, 40, 50].forEach(baseIdx => {
  const resultIdx = (baseIdx + dayDiff) % 60;
  console.log(`기준 index ${baseIdx}(${SIXTY_CYCLE[baseIdx]}) → result index ${resultIdx}(${SIXTY_CYCLE[resultIdx]})`);
});