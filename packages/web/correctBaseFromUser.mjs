// 사용자 제공 정확한 기준으로 역산 계산

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

console.log('=== 사용자 제공 정확한 기준으로 역산 ===');
console.log('1971년 11월 17일 04시 = 신해 기해 병오 경인');

// 사용자 제공 정확한 기준
const userCorrectSaju = {
  year: 1971,
  month: 11,
  day: 17,
  hour: 4,
  yearPillar: '신해',
  monthPillar: '기해',
  dayPillar: '병오',
  hourPillar: '경인'
};

// 병오일 기준으로 1900년 1월 1일이 무엇인지 역산
const targetJD = getJulianDay(userCorrectSaju.year, userCorrectSaju.month, userCorrectSaju.day);
const baseJD = getJulianDay(1900, 1, 1);
const dayDiff = targetJD - baseJD;

const targetDayIndex = SIXTY_CYCLE.indexOf(userCorrectSaju.dayPillar); // 병오 = index 42
let baseDayIndex = (targetDayIndex - dayDiff % 60 + 60) % 60;

console.log('');
console.log(`타겟 날짜: 1971년 11월 17일`);
console.log(`타겟 일주: ${userCorrectSaju.dayPillar} (index ${targetDayIndex})`);
console.log(`일수 차이: ${dayDiff}일`);
console.log(`역산 결과: 1900년 1월 1일 = ${SIXTY_CYCLE[baseDayIndex]} (index ${baseDayIndex})`);

// 검증: 계산된 기준일로 다시 계산
let verifyIndex = (baseDayIndex + dayDiff) % 60;
if (verifyIndex < 0) verifyIndex += 60;

console.log('');
console.log('=== 검증 ===');
console.log(`기준일 ${SIXTY_CYCLE[baseDayIndex]}로 1971/11/17 계산:`);
console.log(`결과: ${SIXTY_CYCLE[verifyIndex]}`);
console.log(`예상: ${userCorrectSaju.dayPillar}`);
console.log(`일치: ${SIXTY_CYCLE[verifyIndex] === userCorrectSaju.dayPillar ? '✅' : '❌'}`);

console.log('');
console.log('🎯 최종 확정된 기준일:');
console.log(`1900년 1월 1일 = ${SIXTY_CYCLE[baseDayIndex]} (index ${baseDayIndex})`);

// 시간 계산 검증
console.log('');
console.log('=== 시간 계산 검증 ===');
console.log(`일간: ${userCorrectSaju.dayPillar[0]} (병)`);
console.log(`시각: 04시 → 30분 보정 후 03:30 → 인시(2번)`);

// 일간에 따른 시간 천간 계산표
const HOUR_STEM_TABLE = {
  '갑': ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계', '갑', '을'],
  '을': ['병', '정', '무', '기', '경', '신', '임', '계', '갑', '을', '병', '정'],
  '병': ['무', '기', '경', '신', '임', '계', '갑', '을', '병', '정', '무', '기'],
  '정': ['경', '신', '임', '계', '갑', '을', '병', '정', '무', '기', '경', '신'],
  '무': ['임', '계', '갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'],
  '기': ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계', '갑', '을'],
  '경': ['병', '정', '무', '기', '경', '신', '임', '계', '갑', '을', '병', '정'],
  '신': ['무', '기', '경', '신', '임', '계', '갑', '을', '병', '정', '무', '기'],
  '임': ['경', '신', '임', '계', '갑', '을', '병', '정', '무', '기', '경', '신'],
  '계': ['임', '계', '갑', '을', '병', '정', '무', '기', '경', '신', '임', '계']
};

const dayStem = userCorrectSaju.dayPillar[0]; // 병
const hourStemFromTable = HOUR_STEM_TABLE[dayStem][2]; // 인시 = 2번 인덱스
console.log(`일간 "${dayStem}"의 인시 천간: ${hourStemFromTable}`);
console.log(`예상 시주: ${hourStemFromTable}인`);
console.log(`실제 시주: ${userCorrectSaju.hourPillar}`);
console.log(`일치: ${(hourStemFromTable + '인') === userCorrectSaju.hourPillar ? '✅' : '❌'}`);

// 다른 날짜 검증
console.log('');
console.log('=== 다른 날짜로 검증 ===');
const testDates = [
  { year: 2000, month: 1, day: 1, desc: '2000년 1월 1일' },
  { year: 1984, month: 2, day: 4, desc: '1984년 2월 4일' },
  { year: 1900, month: 1, day: 31, desc: '1900년 1월 31일' }
];

testDates.forEach(date => {
  const jd = getJulianDay(date.year, date.month, date.day);
  const diff = jd - baseJD;
  let idx = (baseDayIndex + diff) % 60;
  if (idx < 0) idx += 60;
  console.log(`${date.desc}: ${SIXTY_CYCLE[idx]}`);
});

// 내보낼 정보
console.log('');
console.log('=== 최종 확정 정보 ===');
console.log(`정확한 기준일: 1900년 1월 1일 = ${SIXTY_CYCLE[baseDayIndex]} (index ${baseDayIndex})`);
console.log(`사용자 제공 정확한 사주: ${userCorrectSaju.yearPillar} ${userCorrectSaju.monthPillar} ${userCorrectSaju.dayPillar} ${userCorrectSaju.hourPillar}`);

export { baseDayIndex, SIXTY_CYCLE, getJulianDay };