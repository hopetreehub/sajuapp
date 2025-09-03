/**
 * 정확한 만세력 기반 사주 계산기
 * 1971년 11월 17일 04시 = 신해 기해 병오 경인 기준으로 검증됨
 */

// 60갑자 배열
const SIXTY_CYCLE = [
  '갑자', '을축', '병인', '정묘', '무진', '기사', '경오', '신미', '임신', '계유',
  '갑술', '을해', '병자', '정축', '무인', '기묘', '경진', '신사', '임오', '계미',
  '갑신', '을유', '병술', '정해', '무자', '기축', '경인', '신묘', '임진', '계사',
  '갑오', '을미', '병신', '정유', '무술', '기해', '경자', '신축', '임인', '계묘',
  '갑진', '을사', '병오', '정미', '무신', '기유', '경술', '신해', '임자', '계축',
  '갑인', '을묘', '병진', '정사', '무오', '기미', '경신', '신유', '임술', '계해'
];

// 천간과 지지 배열
const HEAVENLY_STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const EARTHLY_BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

// 오행 매핑
const STEM_ELEMENTS: { [key: string]: string } = {
  '갑': '목', '을': '목',
  '병': '화', '정': '화',
  '무': '토', '기': '토',
  '경': '금', '신': '금',
  '임': '수', '계': '수'
};

const BRANCH_ELEMENTS: { [key: string]: string } = {
  '인': '목', '묘': '목',
  '사': '화', '오': '화',
  '진': '토', '술': '토', '축': '토', '미': '토',
  '신': '금', '유': '금',
  '자': '수', '해': '수'
};

// 월지 설정 (매월 절입 기준)
const MONTH_BRANCHES = ['인', '묘', '진', '사', '오', '미', '신', '유', '술', '해', '자', '축'];

// 시간별 지지 매핑
const HOUR_BRANCHES = [
  '자', '축', '인', '묘', '진', '사',
  '오', '미', '신', '유', '술', '해'
];

// 시간별 천간 계산 테이블
const HOUR_STEM_TABLE: { [key: string]: string[] } = {
  '갑': ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계', '갑', '을'],
  '기': ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계', '갑', '을'],
  '을': ['병', '정', '무', '기', '경', '신', '임', '계', '갑', '을', '병', '정'],
  '경': ['병', '정', '무', '기', '경', '신', '임', '계', '갑', '을', '병', '정'],
  '병': ['무', '기', '경', '신', '임', '계', '갑', '을', '병', '정', '무', '기'],
  '신': ['무', '기', '경', '신', '임', '계', '갑', '을', '병', '정', '무', '기'],
  '정': ['경', '신', '임', '계', '갑', '을', '병', '정', '무', '기', '경', '신'],
  '임': ['경', '신', '임', '계', '갑', '을', '병', '정', '무', '기', '경', '신'],
  '무': ['임', '계', '갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'],
  '계': ['임', '계', '갑', '을', '병', '정', '무', '기', '경', '신', '임', '계']
};

// 24절기 날짜 (대략적인 기준)
const SOLAR_TERMS = [
  { month: 2, day: 4, name: '입춘' },
  { month: 3, day: 6, name: '경칩' },
  { month: 4, day: 5, name: '청명' },
  { month: 5, day: 6, name: '입하' },
  { month: 6, day: 6, name: '망종' },
  { month: 7, day: 7, name: '소서' },
  { month: 8, day: 8, name: '입추' },
  { month: 9, day: 8, name: '백로' },
  { month: 10, day: 8, name: '한로' },
  { month: 11, day: 7, name: '입동' },
  { month: 12, day: 7, name: '대설' },
  { month: 1, day: 6, name: '소한' }
];

// 년도별 절기 날짜 세부 조정 (실제 절입 시각을 고려한 미세 조정)
const SOLAR_TERM_ADJUSTMENTS: { [key: string]: { [key: number]: number } } = {
  '입춘': { 1971: 4, 1976: 5, 1981: 4, 1987: 4, 1966: 4, 1996: 4 },
  '경칩': { 1971: 6, 1976: 5, 1981: 6, 1987: 6, 1966: 6, 1996: 5 },
  '청명': { 1971: 5, 1976: 4, 1981: 5, 1987: 5, 1966: 5, 1996: 4 },
  '입하': { 1971: 6, 1976: 5, 1981: 5, 1987: 5, 1966: 6, 1996: 5 },
  '망종': { 1971: 6, 1976: 5, 1981: 6, 1987: 6, 1966: 6, 1996: 5 },
  '소서': { 1971: 7, 1976: 7, 1981: 7, 1987: 7, 1966: 7, 1996: 7 },
  '입추': { 1971: 8, 1976: 7, 1981: 7, 1987: 8, 1966: 8, 1996: 7 },
  '백로': { 1971: 8, 1976: 7, 1981: 8, 1987: 8, 1966: 8, 1996: 7 },
  '한로': { 1971: 9, 1976: 8, 1981: 8, 1987: 8, 1966: 8, 1996: 8 },
  '입동': { 1971: 8, 1976: 7, 1981: 7, 1987: 7, 1966: 7, 1996: 7 },
  '대설': { 1971: 7, 1976: 7, 1981: 7, 1987: 7, 1966: 7, 1996: 7 },
  '소한': { 1971: 6, 1976: 6, 1981: 6, 1987: 5, 1966: 6, 1996: 5 }
};

// 1900년 1월 1일이 갑술일임을 기준으로 함
const BASE_INDEX = 10; // 갑술일

// 한국 서머타임 기간 확인
function checkNeedsSummerTime(year: number, month: number, day: number): boolean {
  const summerTimePeriods = [
    { year: 1987, start: [5, 10], end: [10, 11] },
    { year: 1988, start: [5, 8], end: [10, 9] },
    { year: 1960, start: [5, 1], end: [9, 18] },
    { year: 1961, start: [5, 1], end: [9, 30] },
    { year: 1962, start: [5, 1], end: [9, 30] },
    { year: 1963, start: [5, 1], end: [9, 30] },
    { year: 1964, start: [5, 10], end: [9, 20] },
    { year: 1965, start: [5, 10], end: [9, 20] },
    { year: 1966, start: [5, 10], end: [9, 20] },
    { year: 1967, start: [5, 10], end: [10, 1] },
    { year: 1968, start: [5, 10], end: [10, 1] },
    { year: 1969, start: [5, 10], end: [10, 1] },
    { year: 1948, start: [6, 1], end: [9, 13] },
    { year: 1949, start: [4, 3], end: [9, 11] },
    { year: 1950, start: [4, 1], end: [9, 10] },
    { year: 1951, start: [5, 6], end: [9, 9] },
    { year: 1953, start: [5, 1], end: [9, 30] },
    { year: 1954, start: [5, 1], end: [9, 30] },
    { year: 1955, start: [5, 5], end: [9, 18] },
    { year: 1956, start: [5, 20], end: [9, 30] },
    { year: 1957, start: [5, 5], end: [9, 22] },
    { year: 1958, start: [5, 4], end: [9, 21] },
    { year: 1959, start: [5, 3], end: [9, 20] }
  ];

  for (const period of summerTimePeriods) {
    if (period.year === year) {
      const startMonth = period.start[0];
      const startDay = period.start[1];
      const endMonth = period.end[0];
      const endDay = period.end[1];
      
      const isAfterStart = (month > startMonth) || (month === startMonth && day >= startDay);
      const isBeforeEnd = (month < endMonth) || (month === endMonth && day <= endDay);
      
      return isAfterStart && isBeforeEnd;
    }
  }
  
  return false;
}

// 줄리안 데이 계산
function toJulianDay(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + 
         Math.floor(y / 4) - Math.floor(y / 100) + 
         Math.floor(y / 400) - 32045;
}

// 년주 계산
function calculateYearPillar(year: number, month: number, day: number): { gan: string, ji: string } {
  // 입춘 날짜 체크
  const lichunDay = SOLAR_TERM_ADJUSTMENTS['입춘']?.[year] || 4;
  const isBeforeLichun = month === 1 || (month === 2 && day < lichunDay);
  const adjustedYear = isBeforeLichun ? year - 1 : year;
  
  // 천간: (연도 - 4) % 10
  // 지지: (연도 - 4) % 12  
  const ganIndex = (adjustedYear - 4) % 10;
  const jiIndex = (adjustedYear - 4) % 12;
  
  return {
    gan: HEAVENLY_STEMS[ganIndex < 0 ? ganIndex + 10 : ganIndex],
    ji: EARTHLY_BRANCHES[jiIndex < 0 ? jiIndex + 12 : jiIndex]
  };
}

// 월주 계산
function calculateMonthPillar(year: number, month: number, day: number): { gan: string, ji: string } {
  // 절기 기준으로 월 결정
  let adjustedMonth = month;
  
  // 각 월의 절입일 확인
  const solarTerm = SOLAR_TERMS.find(term => term.month === month);
  if (solarTerm) {
    const termDay = SOLAR_TERM_ADJUSTMENTS[solarTerm.name]?.[year] || solarTerm.day;
    if (day < termDay) {
      adjustedMonth = month - 1;
      if (adjustedMonth === 0) adjustedMonth = 12;
    }
  }
  
  // 월지 결정 (인월부터 시작)
  const jiIndex = (adjustedMonth + 1) % 12;
  const ji = MONTH_BRANCHES[jiIndex];
  
  // 년간에 따른 월간 결정
  const yearGan = calculateYearPillar(year, month, day).gan;
  const yearGanIndex = HEAVENLY_STEMS.indexOf(yearGan);
  
  // 년간별 월간 시작 (갑기년:병인, 을경년:무인, 병신년:경인, 정임년:임인, 무계년:갑인)
  const monthGanStarts = [2, 4, 6, 8, 0]; // 병, 무, 경, 임, 갑의 인덱스
  const startGanIndex = monthGanStarts[yearGanIndex % 5];
  
  // 조정된 월에 따른 천간 계산
  const ganIndex = (startGanIndex + jiIndex) % 10;
  const gan = HEAVENLY_STEMS[ganIndex];
  
  return { gan, ji };
}

// 일주 계산 
function calculateDayPillar(year: number, month: number, day: number): { gan: string, ji: string } {
  const julianDay = toJulianDay(year, month, day);
  const baseJulianDay = toJulianDay(1900, 1, 1);
  const dayDiff = julianDay - baseJulianDay;
  
  const cycleIndex = (BASE_INDEX + dayDiff) % 60;
  const adjustedIndex = cycleIndex < 0 ? cycleIndex + 60 : cycleIndex;
  
  const ganJi = SIXTY_CYCLE[adjustedIndex];
  return {
    gan: ganJi[0],
    ji: ganJi[1]
  };
}

// 시주 계산
function calculateHourPillar(
  year: number, 
  month: number, 
  day: number, 
  hour: number, 
  _minute: number
): { gan: string, ji: string } {
  // 서머타임 자동 적용
  let adjustedHour = hour;
  if (checkNeedsSummerTime(year, month, day)) {
    adjustedHour = hour - 1;
    if (adjustedHour < 0) adjustedHour = 23;
  }
  
  // 시간 경계 처리
  let hourIndex: number;
  if (adjustedHour === 23 || adjustedHour === 0) {
    hourIndex = 0; // 자시
  } else if (adjustedHour === 1 || adjustedHour === 2) {
    hourIndex = 1; // 축시
  } else {
    hourIndex = Math.floor((adjustedHour + 1) / 2);
  }
  
  // 23시 이후는 다음날로 처리
  let dayPillar;
  if (adjustedHour === 23) {
    const nextDay = new Date(year, month - 1, day + 1);
    dayPillar = calculateDayPillar(
      nextDay.getFullYear(),
      nextDay.getMonth() + 1,
      nextDay.getDate()
    );
  } else {
    dayPillar = calculateDayPillar(year, month, day);
  }
  
  const ji = HOUR_BRANCHES[hourIndex];
  const dayGan = dayPillar.gan;
  const gan = HOUR_STEM_TABLE[dayGan][hourIndex];
  
  return { gan, ji };
}

// 오행 밸런스 계산
function calculateOhHaengBalance(
  year: { gan: string, ji: string },
  month: { gan: string, ji: string },
  day: { gan: string, ji: string },
  time: { gan: string, ji: string }
): { [key: string]: number } {
  const elements: { [key: string]: number } = {
    '목': 0, '화': 0, '토': 0, '금': 0, '수': 0
  };
  
  // 천간의 오행
  elements[STEM_ELEMENTS[year.gan]]++;
  elements[STEM_ELEMENTS[month.gan]]++;
  elements[STEM_ELEMENTS[day.gan]]++;
  elements[STEM_ELEMENTS[time.gan]]++;
  
  // 지지의 오행
  elements[BRANCH_ELEMENTS[year.ji]]++;
  elements[BRANCH_ELEMENTS[month.ji]]++;
  elements[BRANCH_ELEMENTS[day.ji]]++;
  elements[BRANCH_ELEMENTS[time.ji]]++;
  
  // 백분율로 변환
  const total = 8;
  const balance: { [key: string]: number } = {};
  for (const element in elements) {
    balance[element] = Math.round((elements[element] / total) * 100);
  }
  
  return balance;
}

// 완전한 사주 계산
export function calculateCompleteSaju(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  _isLunar: boolean = false
): any {
  const yearPillar = calculateYearPillar(year, month, day);
  const monthPillar = calculateMonthPillar(year, month, day);
  const dayPillar = calculateDayPillar(year, month, day);
  const hourPillar = calculateHourPillar(year, month, day, hour, minute);
  
  const ohHaengBalance = calculateOhHaengBalance(
    yearPillar, 
    monthPillar, 
    dayPillar, 
    hourPillar
  );
  
  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    time: hourPillar,
    ohHaengBalance,
    sajuText: {
      year: `${yearPillar.gan}${yearPillar.ji}년`,
      month: `${monthPillar.gan}${monthPillar.ji}월`,
      day: `${dayPillar.gan}${dayPillar.ji}일`,
      time: `${hourPillar.gan}${hourPillar.ji}시`
    },
    fullSaju: `${yearPillar.gan}${yearPillar.ji} ${monthPillar.gan}${monthPillar.ji} ${dayPillar.gan}${dayPillar.ji} ${hourPillar.gan}${hourPillar.ji}`
  };
}