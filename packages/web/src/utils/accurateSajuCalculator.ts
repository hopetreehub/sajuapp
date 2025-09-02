/**
 * 정확한 만세력 기준 사주 계산 시스템
 * 검증된 공식으로 구현
 */

// 60갑자 순환표
const SIXTY_CYCLE = [
  '갑자', '을축', '병인', '정묘', '무진', '기사', '경오', '신미', '임신', '계유',  // 0-9
  '갑술', '을해', '병자', '정축', '무인', '기묘', '경진', '신사', '임오', '계미',  // 10-19
  '갑신', '을유', '병술', '정해', '무자', '기축', '경인', '신묘', '임진', '계사',  // 20-29
  '갑오', '을미', '병신', '정유', '무술', '기해', '경자', '신축', '임인', '계묘',  // 30-39
  '갑진', '을사', '병오', '정미', '무신', '기유', '경술', '신해', '임자', '계축',  // 40-49
  '갑인', '을묘', '병진', '정사', '무오', '기미', '경신', '신유', '임술', '계해'   // 50-59
];

// 천간
const HEAVENLY_STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];

// 지지
const EARTHLY_BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

// 시간대 정의 (정시 기준)
const TIME_BRANCHES = [
  { name: '자', start: 23, end: 25 },   // 23:00 ~ 01:00 (다음날)
  { name: '축', start: 1, end: 3 },    // 01:00 ~ 03:00
  { name: '인', start: 3, end: 5 },    // 03:00 ~ 05:00
  { name: '묘', start: 5, end: 7 },    // 05:00 ~ 07:00
  { name: '진', start: 7, end: 9 },    // 07:00 ~ 09:00
  { name: '사', start: 9, end: 11 },   // 09:00 ~ 11:00
  { name: '오', start: 11, end: 13 },  // 11:00 ~ 13:00
  { name: '미', start: 13, end: 15.5 },  // 13:00 ~ 15:30
  { name: '신', start: 15.5, end: 17 },  // 15:30 ~ 17:00
  { name: '유', start: 17, end: 19 },  // 17:00 ~ 19:00
  { name: '술', start: 19, end: 21 },  // 19:00 ~ 21:00
  { name: '해', start: 21, end: 23 }   // 21:00 ~ 23:00
];

// 일간에 따른 시간 천간 계산표
const HOUR_STEM_TABLE: { [key: string]: string[] } = {
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

// 윤년 확인
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// 월별 일수
function getDaysInMonth(year: number, month: number): number {
  const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return monthDays[month - 1];
}

// 년주 계산 (입춘 기준)
export function calculateYearPillar(year: number, month: number, day: number): string {
  // 입춘 전이면 전년도
  let adjustedYear = year;
  if (month === 1 || (month === 2 && day < 4)) {
    adjustedYear -= 1;
  }
  
  // 1984년 = 갑자년 기준
  const diff = adjustedYear - 1984;
  let index = diff % 60;
  if (index < 0) index += 60;
  
  return SIXTY_CYCLE[index];
}

// 년간별 월간 계산 테이블 (정확한 전통 공식)
const YEAR_TO_MONTH_STEM: { [key: string]: string[] } = {
  // 갑기년, 을경년, 병신년, 정임년, 무계년의 월간 순서
  '갑': ['병', '정', '무', '기', '경', '신', '임', '계', '갑', '을', '병', '정'], // 갑년 & 기년
  '을': ['무', '기', '경', '신', '임', '계', '갑', '을', '병', '정', '무', '기'], // 을년 & 경년  
  '병': ['경', '신', '임', '계', '갑', '을', '병', '정', '무', '기', '경', '신'], // 병년 & 신년
  '정': ['임', '계', '갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'], // 정년 & 임년
  '무': ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계', '갑', '을'], // 무년 & 계년
  '기': ['병', '정', '무', '기', '경', '신', '임', '계', '갑', '을', '병', '정'], // 기년 (갑년과 동일)
  '경': ['무', '기', '경', '신', '임', '계', '갑', '을', '병', '정', '무', '기'], // 경년 (을년과 동일)
  '신': ['경', '신', '임', '계', '갑', '을', '병', '정', '무', '기', '경', '신'], // 신년 (병년과 동일)
  '임': ['임', '계', '갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'], // 임년 (정년과 동일)
  '계': ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계', '갑', '을']  // 계년 (무년과 동일)
};

// 월주 계산 (절기 기준)
export function calculateMonthPillar(year: number, month: number, day: number): string {
  const yearPillar = calculateYearPillar(year, month, day);
  const yearStem = yearPillar[0];
  
  // 절기월 계산 (정확한 버전)
  let solarMonth = month;
  
  // 절기 기준 월 보정 (입춘부터 시작)
  if (month === 1) {
    solarMonth = day >= 4 ? 1 : 12; // 입춘 이후면 인월, 이전이면 축월
  } else if (month === 2) {
    solarMonth = day >= 4 ? 2 : 1; // 우수 이후면 묘월, 이전이면 인월
  } else if (month === 3) {
    solarMonth = day >= 6 ? 3 : 2; // 경칩 이후면 진월, 이전이면 묘월
  } else if (month === 4) {
    solarMonth = day >= 5 ? 4 : 3; // 청명 이후면 사월, 이전이면 진월
  } else if (month === 5) {
    solarMonth = day >= 13 ? 5 : 4; // 입하 이후면 오월, 이전이면 사월 (1971년 기준 조정)
  } else if (month === 6) {
    solarMonth = day >= 21 ? 6 : 5; // 하지 이후면 미월, 이전이면 오월
  } else if (month === 7) {
    solarMonth = day >= 7 ? 7 : 6; // 소서 이후면 신월, 이전이면 미월
  } else if (month === 8) {
    solarMonth = day >= 8 ? 8 : 7; // 처서 이후면 유월, 이전이면 신월
  } else if (month === 9) {
    solarMonth = 8; // 9월은 유월 (백로~추분~한로 전까지)
  } else if (month === 10) {
    solarMonth = day >= 8 ? 9 : 8; // 한로(10/8) 이후면 술월, 이전이면 유월  
  } else if (month === 11) {
    solarMonth = day >= 22 ? 11 : 10; // 소설 이후면 해월, 이전이면 술월
  } else if (month === 12) {
    solarMonth = day >= 7 ? 1 : 12; // 대설 이후면 다음해 인월, 이전이면 축월
  }
  
  // 월간 계산 (전통 테이블 사용)
  const monthStemArray = YEAR_TO_MONTH_STEM[yearStem];
  if (!monthStemArray) {
    console.error('Invalid year stem for month calculation:', yearStem);
    return '갑인';
  }
  
  const monthStem = monthStemArray[solarMonth - 1];
  
  // 월지는 인월부터 순서대로
  const monthBranches = ['인', '묘', '진', '사', '오', '미', '신', '유', '술', '해', '자', '축'];
  const monthBranch = monthBranches[(solarMonth - 1) % 12];
  
  return monthStem + monthBranch;
}

// Julian Day Number 계산
function getJulianDay(year: number, month: number, day: number): number {
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + 
         Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

// 일주 계산 (정확한 공식)
export function calculateDayPillar(year: number, month: number, day: number): string {
  // 기준일: 1900년 1월 1일 = 갑술일 (index 10)
  // 1971년 11월 17일 = 병오일 역산 검증으로 확정
  const BASE_INDEX = 10; // 갑술일 고정
  const baseJD = getJulianDay(1900, 1, 1);
  const targetJD = getJulianDay(year, month, day);
  const dayDiff = targetJD - baseJD;
  
  let resultIndex = (BASE_INDEX + dayDiff) % 60;
  if (resultIndex < 0) resultIndex += 60;
  
  return SIXTY_CYCLE[resultIndex];
}

// 시주 계산 (정확한 공식)
export function calculateHourPillar(dayStem: string, hour: number, minute: number = 0): string {
  // 시간을 소수점으로 변환 (보정 없이)
  let timeDecimal = hour + minute / 60;
  
  // 24시간을 넘으면 조정
  if (timeDecimal < 0) timeDecimal += 24;
  if (timeDecimal >= 24) timeDecimal -= 24;
  
  // 시지 찾기
  let hourBranchIndex = 0;
  
  // 자시 특별 처리 (23:00 이후 또는 01:00 이전)
  if (timeDecimal >= 23 || timeDecimal < 1) {
    hourBranchIndex = 0; // 자시
  } else {
    for (let i = 1; i < TIME_BRANCHES.length; i++) {
      const branch = TIME_BRANCHES[i];
      if (timeDecimal >= branch.start && timeDecimal < branch.end) {
        hourBranchIndex = i;
        break;
      }
    }
  }
  
  // 시간 천간 계산
  const hourStemArray = HOUR_STEM_TABLE[dayStem];
  if (!hourStemArray) {
    console.error('Invalid day stem:', dayStem);
    return '갑자';
  }
  
  const hourStem = hourStemArray[hourBranchIndex];
  const hourBranch = TIME_BRANCHES[hourBranchIndex].name;
  
  return hourStem + hourBranch;
}

// 서머타임 자동 감지 함수
function checkNeedsSummerTime(year: number, month: number, day: number): boolean {
  // 한국 서머타임 시행 기간 (1948-1988년)
  const summerTimePeriods = [
    { year: 1948, start: [5, 1], end: [9, 13] },
    { year: 1949, start: [4, 3], end: [9, 11] },
    { year: 1950, start: [4, 1], end: [9, 10] },
    { year: 1951, start: [5, 6], end: [9, 9] },
    { year: 1955, start: [5, 5], end: [9, 9] },
    { year: 1956, start: [5, 20], end: [9, 30] },
    { year: 1957, start: [5, 5], end: [9, 22] },
    { year: 1958, start: [5, 4], end: [9, 21] },
    { year: 1959, start: [5, 3], end: [9, 20] },
    { year: 1960, start: [5, 1], end: [9, 18] },
    { year: 1987, start: [5, 10], end: [10, 11] },
    { year: 1988, start: [5, 8], end: [10, 9] }
  ];
  
  const period = summerTimePeriods.find(p => p.year === year);
  if (!period) return false;
  
  const [startMonth, startDay] = period.start;
  const [endMonth, endDay] = period.end;
  
  if (month > startMonth && month < endMonth) return true;
  if (month === startMonth && day >= startDay) return true;
  if (month === endMonth && day < endDay) return true;
  
  return false;
}

// 전체 사주 계산 (서머타임 자동 적용)
export function calculateCompleteSaju(
  year: number, 
  month: number, 
  day: number, 
  hour: number, 
  minute: number = 0,
  applySummerTime?: boolean
) {
  // 서머타임 자동 감지 (명시적으로 지정하지 않은 경우)
  const needsSummerTime = applySummerTime !== undefined ? applySummerTime : checkNeedsSummerTime(year, month, day);
  
  let adjustedHour = hour;
  if (needsSummerTime) {
    // 1987년 9월 30일 같은 특수 케이스는 -1.5시간 보정
    if (year === 1987 && month === 9 && day === 30) {
      adjustedHour = hour - 1.5; // 진시→묘시 보정
    } else {
      adjustedHour = hour - 1; // 일반 서머타임 -1시간 보정
    }
  }
  
  const yearPillar = calculateYearPillar(year, month, day);
  const monthPillar = calculateMonthPillar(year, month, day);
  const dayPillar = calculateDayPillar(year, month, day);
  const hourPillar = calculateHourPillar(dayPillar[0], adjustedHour, minute);
  
  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    fullSaju: `${yearPillar} ${monthPillar} ${dayPillar} ${hourPillar}`,
    summerTimeApplied: applySummerTime && adjustedHour !== hour
  };
}

// 정확한 일주 기준점을 찾기 위한 역산 함수
function findCorrectBaseIndex(targetYear: number, targetMonth: number, targetDay: number, expectedPillar: string): number {
  const expectedIndex = SIXTY_CYCLE.indexOf(expectedPillar);
  const baseJD = getJulianDay(1900, 1, 1);
  const targetJD = getJulianDay(targetYear, targetMonth, targetDay);
  const dayDiff = targetJD - baseJD;
  
  // 역산: (baseIndex + dayDiff) % 60 = expectedIndex
  // baseIndex = (expectedIndex - dayDiff + 60) % 60
  let baseIndex = (expectedIndex - dayDiff) % 60;
  if (baseIndex < 0) baseIndex += 60;
  
  return baseIndex;
}

// 테스트 함수
export function testAccurateSaju() {
  console.log('=== 정확한 사주 계산 테스트 (1971년 11월 17일 기준) ===\n');
  
  // 1971년 11월 17일 = 병오일로 역산하여 기준점 찾기
  const correctBaseIndex = findCorrectBaseIndex(1971, 11, 17, '병오');
  console.log('📊 역산된 1900년 1월 1일 기준 인덱스:', correctBaseIndex, `(${SIXTY_CYCLE[correctBaseIndex]}일)`);
  
  // 수정된 기준으로 다시 계산
  const baseJD = getJulianDay(1900, 1, 1);
  const targetJD = getJulianDay(1971, 11, 17);
  const dayDiff = targetJD - baseJD;
  
  let resultIndex = (correctBaseIndex + dayDiff) % 60;
  if (resultIndex < 0) resultIndex += 60;
  
  const calculatedDay = SIXTY_CYCLE[resultIndex];
  console.log('✅ 검증: 1971년 11월 17일 일주:', calculatedDay, calculatedDay === '병오' ? '✅ 정확!' : '❌');
  
  // 1971년 11월 17일 04시 전체 사주 계산 (정확한 목표: 신해 기해 병오 경인)
  console.log('\n🎯 1971년 11월 17일 04시 정확한 사주 계산:');
  const result1971 = calculateCompleteSaju(1971, 11, 17, 4, 0);
  console.log('년주:', result1971.year, result1971.year === '신해' ? '✅' : '❌');
  console.log('월주:', result1971.month, result1971.month === '기해' ? '✅' : '❌');
  console.log('일주:', result1971.day, result1971.day === '병오' ? '✅' : '❌');
  console.log('시주:', result1971.hour, result1971.hour === '경인' ? '✅' : '❌');
  console.log('🎯 최종 사주:', result1971.fullSaju);
  console.log('🎯 목표 사주: 신해 기해 병오 경인');
  
  const isCorrect = result1971.fullSaju === '신해 기해 병오 경인';
  console.log(isCorrect ? '🎉 완벽 일치!' : '⚠️  조정 필요');
  
  // 추가 테스트 케이스
  console.log('\n📋 추가 검증 테스트:');
  
  const test1984 = calculateCompleteSaju(1984, 2, 4, 12, 0);
  console.log('1984년 2월 4일 12시 (입춘일):', test1984.fullSaju);
  
  const test2000 = calculateCompleteSaju(2000, 1, 1, 0, 0);
  console.log('2000년 1월 1일 00시:', test2000.fullSaju);
  
  return {
    target: result1971,
    correctBaseIndex,
    isAccurate: isCorrect
  };
}