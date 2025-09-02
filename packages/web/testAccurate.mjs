// 정확한 사주 계산 직접 테스트

// 60갑자 순환표
const SIXTY_CYCLE = [
  '갑자', '을축', '병인', '정묘', '무진', '기사', '경오', '신미', '임신', '계유',  // 0-9
  '갑술', '을해', '병자', '정축', '무인', '기묘', '경진', '신사', '임오', '계미',  // 10-19
  '갑신', '을유', '병술', '정해', '무자', '기축', '경인', '신묘', '임진', '계사',  // 20-29
  '갑오', '을미', '병신', '정유', '무술', '기해', '경자', '신축', '임인', '계묘',  // 30-39
  '갑진', '을사', '병오', '정미', '무신', '기유', '경술', '신해', '임자', '계축',  // 40-49
  '갑인', '을묘', '병진', '정사', '무오', '기미', '경신', '신유', '임술', '계해'   // 50-59
];

// 윤년 확인
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// 월별 일수
function getDaysInMonth(year, month) {
  const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return monthDays[month - 1];
}

// 일주 계산 (1900년 1월 31일 = 갑자일 기준)
function calculateDayPillar(year, month, day) {
  const baseYear = 1900;
  const baseMonth = 1;
  const baseDay = 31;
  
  let totalDays = 0;
  
  // 년도 차이 계산
  for (let y = baseYear; y < year; y++) {
    totalDays += isLeapYear(y) ? 366 : 365;
  }
  
  // 월 차이 계산  
  for (let m = 1; m < month; m++) {
    totalDays += getDaysInMonth(year, m);
  }
  
  // 일 차이 계산
  totalDays += (day - baseDay);
  
  // 60갑자 순환
  let cycleIndex = totalDays % 60;
  if (cycleIndex < 0) cycleIndex += 60;
  
  return SIXTY_CYCLE[cycleIndex];
}

// 시주 계산
function calculateHourPillar(dayStem, hour) {
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
  
  const HOUR_BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
  
  // 30분 보정 후 시간대 계산
  let adjustedHour = hour - 0.5;  // 30분 보정
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

console.log('=== 정확한 사주 계산 테스트 ===\n');

// 기준일 테스트
console.log('기준일 테스트:');
const base = calculateDayPillar(1900, 1, 31);
console.log('1900년 1월 31일 일주:', base, base === '갑자' ? '✅' : '❌');

// 1971년 11월 17일 04시 테스트
console.log('\n1971년 11월 17일 04시 계산:');

const year = 1971, month = 11, day = 17, hour = 4;

// 각 주 계산
const yearPillar = '신해';  // 이미 확인됨
const monthPillar = '기해'; // 이미 확인됨
const dayPillar = calculateDayPillar(year, month, day);
const hourPillar = calculateHourPillar(dayPillar[0], hour);

console.log('년주:', yearPillar);
console.log('월주:', monthPillar);
console.log('일주:', dayPillar);
console.log('시주:', hourPillar);
console.log('완전한 사주:', `${yearPillar} ${monthPillar} ${dayPillar} ${hourPillar}`);

// 중간 계산 과정 확인
console.log('\n계산 과정:');
console.log('- 1900년 1월 31일부터 1971년 11월 17일까지의 일수 계산');

let totalDays = 0;
for (let y = 1900; y < 1971; y++) {
  totalDays += isLeapYear(y) ? 366 : 365;
}
console.log('  년수:', 1971 - 1900, '년');
console.log('  총 일수 (년):', totalDays);

for (let m = 1; m < 11; m++) {
  totalDays += getDaysInMonth(1971, m);
}
console.log('  1971년 1월~10월 일수:', totalDays);

totalDays += (17 - 31);
console.log('  최종 총 일수:', totalDays);
console.log('  60으로 나눈 나머지:', totalDays % 60);
console.log('  해당 갑자:', SIXTY_CYCLE[totalDays % 60]);

// 시간 계산 과정
console.log('\n시간 계산 과정:');
console.log('- 04시 - 30분 보정 = 03:30');
console.log('- 03:30은 인시 (03:30~05:30) 범위');
console.log('- 일간:', dayPillar[0]);
console.log('- 인시 천간 계산 결과:', hourPillar[0]);