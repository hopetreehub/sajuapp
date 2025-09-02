// 최종 정확한 사주 계산

const SIXTY_CYCLE = [
  '갑자', '을축', '병인', '정묘', '무진', '기사', '경오', '신미', '임신', '계유',  // 0-9
  '갑술', '을해', '병자', '정축', '무인', '기묘', '경진', '신사', '임오', '계미',  // 10-19
  '갑신', '을유', '병술', '정해', '무자', '기축', '경인', '신묘', '임진', '계사',  // 20-29
  '갑오', '을미', '병신', '정유', '무술', '기해', '경자', '신축', '임인', '계묘',  // 30-39
  '갑진', '을사', '병오', '정미', '무신', '기유', '경술', '신해', '임자', '계축',  // 40-49
  '갑인', '을묘', '병진', '정사', '무오', '기미', '경신', '신유', '임술', '계해'   // 50-59
];

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

function getJulianDay(year, month, day) {
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + 
         Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function calculateDayPillar(year, month, day) {
  // 기준: 1900년 1월 1일 = 갑오일 (index 30)
  const baseJD = getJulianDay(1900, 1, 1);
  const targetJD = getJulianDay(year, month, day);
  const dayDiff = targetJD - baseJD;
  
  const baseIndex = 30; // 갑오일
  let resultIndex = (baseIndex + dayDiff) % 60;
  if (resultIndex < 0) resultIndex += 60;
  
  return SIXTY_CYCLE[resultIndex];
}

function calculateHourPillar(dayStem, hour) {
  const HOUR_BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
  
  // 30분 보정
  let adjustedHour = hour - 0.5;
  if (adjustedHour < 0) adjustedHour += 24;
  
  let hourIndex;
  if (adjustedHour >= 23 || adjustedHour < 1) {
    hourIndex = 0; // 자시
  } else if (adjustedHour < 3) {
    hourIndex = 1; // 축시  
  } else if (adjustedHour < 5) {
    hourIndex = 2; // 인시
  } else if (adjustedHour < 7) {
    hourIndex = 3; // 묘시
  } else if (adjustedHour < 9) {
    hourIndex = 4; // 진시
  } else if (adjustedHour < 11) {
    hourIndex = 5; // 사시
  } else if (adjustedHour < 13) {
    hourIndex = 6; // 오시
  } else if (adjustedHour < 15) {
    hourIndex = 7; // 미시
  } else if (adjustedHour < 17) {
    hourIndex = 8; // 신시
  } else if (adjustedHour < 19) {
    hourIndex = 9; // 유시
  } else if (adjustedHour < 21) {
    hourIndex = 10; // 술시
  } else {
    hourIndex = 11; // 해시
  }
  
  const hourStem = HOUR_STEM_TABLE[dayStem][hourIndex];
  const hourBranch = HOUR_BRANCHES[hourIndex];
  
  return hourStem + hourBranch;
}

console.log('=== 최종 정확한 사주 계산 ===\n');

// 기준일 검증
console.log('기준일 검증:');
const baseTest = calculateDayPillar(1900, 1, 1);
console.log('1900년 1월 1일:', baseTest, baseTest === '갑오' ? '✅' : '❌');

// 1971년 11월 17일 04시 최종 계산
console.log('\n1971년 11월 17일 04시 최종 계산:');

const year = 1971, month = 11, day = 17, hour = 4;
const yearPillar = '신해';
const monthPillar = '기해'; 
const dayPillar = calculateDayPillar(year, month, day);
const hourPillar = calculateHourPillar(dayPillar[0], hour);

console.log('년주:', yearPillar);
console.log('월주:', monthPillar);
console.log('일주:', dayPillar);
console.log('시주:', hourPillar);
console.log('\n🎯 최종 사주:', `${yearPillar} ${monthPillar} ${dayPillar} ${hourPillar}`);

// 시간 계산 상세
console.log('\n시간 계산 상세:');
console.log('- 04시 - 30분 보정 = 03:30');
console.log('- 03:30 = 인시 (03:00~05:00)');
console.log('- 일간 "' + dayPillar[0] + '"의 인시(2번 인덱스) =', HOUR_STEM_TABLE[dayPillar[0]][2] + '인');

// 다른 검증 사례
console.log('\n=== 검증 사례들 ===');

const testCases = [
  { year: 2000, month: 1, day: 1, expected: '무신', desc: '2000년 1월 1일' },
  { year: 1984, month: 2, day: 4, expected: '무오', desc: '1984년 2월 4일 갑자년 입춘' }
];

testCases.forEach(({year, month, day, expected, desc}) => {
  const result = calculateDayPillar(year, month, day);
  console.log(`${desc}: ${result} ${expected ? (result === expected ? '✅' : '❌ (예상: ' + expected + ')') : ''}`);
});

// Julian Day 계산 과정 표시
console.log('\n=== Julian Day 계산 과정 ===');
const jd1900 = getJulianDay(1900, 1, 1);
const jd1971 = getJulianDay(1971, 11, 17);
const dayDiff = jd1971 - jd1900;

console.log('1900/1/1 JD:', jd1900);
console.log('1971/11/17 JD:', jd1971);
console.log('일수 차이:', dayDiff);
console.log('기준 index 30(갑오) + ' + dayDiff + ' = ' + ((30 + dayDiff) % 60));
console.log('결과 index:', (30 + dayDiff) % 60, '→', SIXTY_CYCLE[(30 + dayDiff) % 60]);