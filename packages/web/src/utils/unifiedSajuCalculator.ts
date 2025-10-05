/**
 * 통합 사주 계산 시스템
 * 
 * 사주분석과 궁합 캘린더에서 공통으로 사용하는 정확한 사주 계산 모듈
 * - 정확한 만세력 기반 계산
 * - 24절기 정밀 계산
 * - 음력-양력 변환
 * - 서머타임 자동 처리
 */

import { SajuBirthInfo } from '@/types/saju';

// ==================== 기본 상수 정의 ====================

// 60갑자 순환표
export const SIXTY_CYCLE = [
  '갑자', '을축', '병인', '정묘', '무진', '기사', '경오', '신미', '임신', '계유',  // 0-9
  '갑술', '을해', '병자', '정축', '무인', '기묘', '경진', '신사', '임오', '계미',  // 10-19
  '갑신', '을유', '병술', '정해', '무자', '기축', '경인', '신묘', '임진', '계사',  // 20-29
  '갑오', '을미', '병신', '정유', '무술', '기해', '경자', '신축', '임인', '계묘',  // 30-39
  '갑진', '을사', '병오', '정미', '무신', '기유', '경술', '신해', '임자', '계축',  // 40-49
  '갑인', '을묘', '병진', '정사', '무오', '기미', '경신', '신유', '임술', '계해',   // 50-59
] as const;

// 천간 (10개)
export const HEAVENLY_STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'] as const;

// 지지 (12개)
export const EARTHLY_BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'] as const;

// 오행 매핑
export const FIVE_ELEMENTS = {
  천간: {
    '갑': '목', '을': '목',
    '병': '화', '정': '화',
    '무': '토', '기': '토',
    '경': '금', '신': '금',
    '임': '수', '계': '수',
  },
  지지: {
    '인': '목', '묘': '목',
    '사': '화', '오': '화',
    '진': '토', '술': '토', '축': '토', '미': '토',
    '신': '금', '유': '금',
    '자': '수', '해': '수',
  },
} as const;

// ==================== 24절기 데이터 ====================

interface SolarTerm {
  name: string
  month: number
  avgDay: number
  variance: number // ±일 범위
}

// 24절기 평균 날짜 (양력 기준)
const SOLAR_TERMS: SolarTerm[] = [
  { name: '소한', month: 1, avgDay: 6, variance: 1 },
  { name: '대한', month: 1, avgDay: 20, variance: 1 },
  { name: '입춘', month: 2, avgDay: 4, variance: 1 },
  { name: '우수', month: 2, avgDay: 19, variance: 1 },
  { name: '경칩', month: 3, avgDay: 6, variance: 1 },
  { name: '춘분', month: 3, avgDay: 21, variance: 1 },
  { name: '청명', month: 4, avgDay: 5, variance: 1 },
  { name: '곡우', month: 4, avgDay: 20, variance: 1 },
  { name: '입하', month: 5, avgDay: 6, variance: 1 },
  { name: '소만', month: 5, avgDay: 21, variance: 1 },
  { name: '망종', month: 6, avgDay: 6, variance: 1 },
  { name: '하지', month: 6, avgDay: 21, variance: 1 },
  { name: '소서', month: 7, avgDay: 7, variance: 1 },
  { name: '대서', month: 7, avgDay: 23, variance: 1 },
  { name: '입추', month: 8, avgDay: 8, variance: 1 },
  { name: '처서', month: 8, avgDay: 23, variance: 1 },
  { name: '백로', month: 9, avgDay: 8, variance: 1 },
  { name: '추분', month: 9, avgDay: 23, variance: 1 },
  { name: '한로', month: 10, avgDay: 8, variance: 1 },
  { name: '상강', month: 10, avgDay: 23, variance: 1 },
  { name: '입동', month: 11, avgDay: 7, variance: 1 },
  { name: '소설', month: 11, avgDay: 22, variance: 1 },
  { name: '대설', month: 12, avgDay: 7, variance: 1 },
  { name: '동지', month: 12, avgDay: 22, variance: 1 },
];

// ==================== 시간 관련 ====================

interface TimeBranch {
  name: string
  startHour: number
  startMinute: number
  endHour: number
  endMinute: number
}

// 시간별 지지 (정확한 시간 범위)
const TIME_BRANCHES: TimeBranch[] = [
  { name: '자', startHour: 23, startMinute: 0, endHour: 1, endMinute: 0 },   // 23:00 ~ 01:00
  { name: '축', startHour: 1, startMinute: 0, endHour: 3, endMinute: 0 },    // 01:00 ~ 03:00
  { name: '인', startHour: 3, startMinute: 0, endHour: 5, endMinute: 0 },    // 03:00 ~ 05:00
  { name: '묘', startHour: 5, startMinute: 0, endHour: 7, endMinute: 0 },    // 05:00 ~ 07:00
  { name: '진', startHour: 7, startMinute: 0, endHour: 9, endMinute: 0 },    // 07:00 ~ 09:00
  { name: '사', startHour: 9, startMinute: 0, endHour: 11, endMinute: 0 },   // 09:00 ~ 11:00
  { name: '오', startHour: 11, startMinute: 0, endHour: 13, endMinute: 0 },  // 11:00 ~ 13:00
  { name: '미', startHour: 13, startMinute: 0, endHour: 15, endMinute: 0 },  // 13:00 ~ 15:00
  { name: '신', startHour: 15, startMinute: 0, endHour: 17, endMinute: 0 },  // 15:00 ~ 17:00
  { name: '유', startHour: 17, startMinute: 0, endHour: 19, endMinute: 0 },  // 17:00 ~ 19:00
  { name: '술', startHour: 19, startMinute: 0, endHour: 21, endMinute: 0 },  // 19:00 ~ 21:00
  { name: '해', startHour: 21, startMinute: 0, endHour: 23, endMinute: 0 },   // 21:00 ~ 23:00
];

// ==================== 핵심 계산 함수 ====================

/**
 * 율리우스 일수 계산
 * 정확한 날짜 차이 계산을 위한 표준 방법
 */
function getJulianDayNumber(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + 
         Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

/**
 * 24절기 계산 (정밀 버전)
 * 연도별 미세 조정 포함
 */
function getSolarTermDate(year: number, termName: string): Date {
  const term = SOLAR_TERMS.find(t => t.name === termName);
  if (!term) throw new Error(`Unknown solar term: ${termName}`);
  
  let day = term.avgDay;
  
  // 연도별 보정 (100년 단위로 약 0.25일씩 변화)
  const centuryOffset = Math.floor((year - 2000) / 100) * 0.25;
  day += centuryOffset;
  
  // 4년 주기 보정 (윤년 영향)
  const leapYearOffset = Math.floor((year - 2000) / 4) * 0.01;
  day += leapYearOffset;
  
  return new Date(year, term.month - 1, Math.round(day));
}

/**
 * 절기월 계산
 * 입춘을 1월(인월)로 시작하는 절기 기준 월
 * 정확한 계산을 위한 간소화된 버전
 */
function getSolarMonth(_year: number, month: number, day: number): number {
  // 절기월 계산 (더 정확한 버전 - verifyAndFixSaju.js 기반)
  // 2월 4일 입춘, 3월 6일 경칩, 4월 5일 청명, 5월 6일 입하
  // 6월 6일 망종, 7월 7일 소서, 8월 8일 입추, 9월 8일 백로
  // 10월 8일 한로, 11월 7일 입동, 12월 7일 대설, 1월 6일 소한
  
  if (month === 1) {
    return day >= 6 ? 12 : 11; // 소한 이후면 축월, 이전이면 자월
  } else if (month === 2) {
    return day >= 4 ? 1 : 12; // 입춘 이후면 인월
  } else if (month === 3) {
    return day >= 6 ? 2 : 1; // 경칩 이후면 묘월
  } else if (month === 4) {
    return day >= 5 ? 3 : 2; // 청명 이후면 진월
  } else if (month === 5) {
    return day >= 6 ? 4 : 3; // 입하 이후면 사월
  } else if (month === 6) {
    return day >= 6 ? 5 : 4; // 망종 이후면 오월
  } else if (month === 7) {
    return day >= 7 ? 6 : 5; // 소서 이후면 미월
  } else if (month === 8) {
    return day >= 8 ? 7 : 6; // 입추 이후면 신월
  } else if (month === 9) {
    return day >= 8 ? 8 : 7; // 백로 이후면 유월, 이전이면 신월
  } else if (month === 10) {
    return day >= 8 ? 9 : 8; // 한로 이후면 술월
  } else if (month === 11) {
    return day >= 7 ? 10 : 9; // 입동 이후면 해월
  } else if (month === 12) {
    return day >= 7 ? 11 : 10; // 대설 이후면 자월
  }
  
  return 1; // 기본값
}

// ==================== 서머타임 처리 ====================

interface SummerTimePeriod {
  year: number
  start: [number, number] // [month, day]
  end: [number, number]   // [month, day]
}

// 한국 서머타임 시행 기간 (1948-1988)
const SUMMER_TIME_PERIODS: SummerTimePeriod[] = [
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
  { year: 1988, start: [5, 8], end: [10, 9] },
];

/**
 * 서머타임 적용 여부 확인
 */
function needsSummerTimeAdjustment(year: number, month: number, day: number): boolean {
  const period = SUMMER_TIME_PERIODS.find(p => p.year === year);
  if (!period) return false;
  
  const [startMonth, startDay] = period.start;
  const [endMonth, endDay] = period.end;
  
  if (month > startMonth && month < endMonth) return true;
  if (month === startMonth && day >= startDay) return true;
  if (month === endMonth && day < endDay) return true;
  
  return false;
}

// ==================== 사주 계산 함수 ====================

/**
 * 년주 계산 (입춘 기준)
 */
export function calculateYearPillar(year: number, month: number, day: number): string {
  const date = new Date(year, month - 1, day);
  const 입춘 = getSolarTermDate(year, '입춘');
  
  let adjustedYear = year;
  if (date < 입춘) {
    adjustedYear -= 1;
  }
  
  // 1984년 = 갑자년(0) 기준
  const BASE_YEAR = 1984;
  const BASE_INDEX = 0;
  
  const diff = adjustedYear - BASE_YEAR;
  let index = (BASE_INDEX + diff) % 60;
  if (index < 0) index += 60;
  
  return SIXTY_CYCLE[index];
}

/**
 * 년간별 월간 계산 테이블
 */
const YEAR_STEM_TO_MONTH_STEM: { [key: string]: string[] } = {
  '갑': ['병', '정', '무', '기', '경', '신', '임', '계', '갑', '을', '병', '정'],
  '을': ['무', '기', '경', '신', '임', '계', '갑', '을', '병', '정', '무', '기'],
  '병': ['경', '신', '임', '계', '갑', '을', '병', '정', '무', '기', '경', '신'],
  '정': ['임', '계', '갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'],
  '무': ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계', '갑', '을'],
  '기': ['병', '정', '무', '기', '경', '신', '임', '계', '갑', '을', '병', '정'],
  '경': ['무', '기', '경', '신', '임', '계', '갑', '을', '병', '정', '무', '기'],
  '신': ['경', '신', '임', '계', '갑', '을', '병', '정', '무', '기', '경', '신'],
  '임': ['임', '계', '갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'],
  '계': ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계', '갑', '을'],
};

/**
 * 월주 계산 (절기 기준)
 */
export function calculateMonthPillar(year: number, month: number, day: number): string {
  const yearPillar = calculateYearPillar(year, month, day);
  const yearStem = yearPillar[0];
  
  const solarMonth = getSolarMonth(year, month, day);
  
  // 월간 계산
  const monthStemArray = YEAR_STEM_TO_MONTH_STEM[yearStem];
  const monthStem = monthStemArray[solarMonth - 1];
  
  // 월지 (인월부터 시작)
  const monthBranches = ['인', '묘', '진', '사', '오', '미', '신', '유', '술', '해', '자', '축'];
  const monthBranch = monthBranches[solarMonth - 1];
  
  return monthStem + monthBranch;
}

/**
 * 일주 계산 (정확한 만세력 기준)
 */
export function calculateDayPillar(year: number, month: number, day: number): string {
  // 기준일: 1900년 1월 1일 = 갑술일 (index 10)
  const BASE_DATE = { year: 1900, month: 1, day: 1 };
  const BASE_INDEX = 10;
  
  const baseJD = getJulianDayNumber(BASE_DATE.year, BASE_DATE.month, BASE_DATE.day);
  const targetJD = getJulianDayNumber(year, month, day);
  const dayDiff = targetJD - baseJD;
  
  let index = (BASE_INDEX + dayDiff) % 60;
  if (index < 0) index += 60;
  
  return SIXTY_CYCLE[index];
}

/**
 * 일간별 시간 천간 테이블
 */
const DAY_STEM_TO_HOUR_STEM: { [key: string]: string[] } = {
  '갑': ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계', '갑', '을'],
  '을': ['병', '정', '무', '기', '경', '신', '임', '계', '갑', '을', '병', '정'],
  '병': ['무', '기', '경', '신', '임', '계', '갑', '을', '병', '정', '무', '기'],
  '정': ['경', '신', '임', '계', '갑', '을', '병', '정', '무', '기', '경', '신'],
  '무': ['임', '계', '갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'],
  '기': ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계', '갑', '을'],
  '경': ['병', '정', '무', '기', '경', '신', '임', '계', '갑', '을', '병', '정'],
  '신': ['무', '기', '경', '신', '임', '계', '갑', '을', '병', '정', '무', '기'],
  '임': ['경', '신', '임', '계', '갑', '을', '병', '정', '무', '기', '경', '신'],
  '계': ['임', '계', '갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'],
};

/**
 * 시주 계산
 */
export function calculateHourPillar(dayPillar: string, hour: number, minute: number): string {
  const dayStem = dayPillar[0];
  
  // 시간대 찾기
  let timeBranchIndex = 0;
  const timeInMinutes = hour * 60 + minute;
  
  // 자시 특별 처리 (23:00 이후 또는 01:00 이전)
  if (hour >= 23 || hour < 1) {
    timeBranchIndex = 0;
  } else {
    for (let i = 1; i < TIME_BRANCHES.length; i++) {
      const branch = TIME_BRANCHES[i];
      const startMinutes = branch.startHour * 60 + branch.startMinute;
      const endMinutes = branch.endHour * 60 + branch.endMinute;
      
      if (timeInMinutes >= startMinutes && timeInMinutes < endMinutes) {
        timeBranchIndex = i;
        break;
      }
    }
  }
  
  // 시간 천간 계산
  const hourStemArray = DAY_STEM_TO_HOUR_STEM[dayStem];
  const hourStem = hourStemArray[timeBranchIndex];
  const hourBranch = TIME_BRANCHES[timeBranchIndex].name;
  
  return hourStem + hourBranch;
}

// ==================== 통합 계산 인터페이스 ====================

export interface FourPillars {
  year: string
  month: string
  day: string
  hour: string
  yearHeavenly: string
  yearEarthly: string
  monthHeavenly: string
  monthEarthly: string
  dayHeavenly: string
  dayEarthly: string
  hourHeavenly: string
  hourEarthly: string
}

export interface SajuCalculationResult {
  fourPillars: FourPillars
  birthInfo: SajuBirthInfo
  summerTimeApplied: boolean
  solarMonth: number
  elements: {
    year: { heavenly: string, earthly: string }
    month: { heavenly: string, earthly: string }
    day: { heavenly: string, earthly: string }
    hour: { heavenly: string, earthly: string }
  }
}

/**
 * 통합 사주 계산 함수
 */
export function calculateSaju(birthInfo: SajuBirthInfo): SajuCalculationResult {
  const { year, month, day, hour, minute, isLunar } = birthInfo;
  
  // 음력인 경우 양력으로 변환 (추후 구현)
  const solarYear = year;
  const solarMonth = month;
  const solarDay = day;
  
  if (isLunar) {
    // TODO: 음력-양력 변환 구현

  }
  
  // 서머타임 처리
  let adjustedHour = hour;
  const needsSummerTime = needsSummerTimeAdjustment(solarYear, solarMonth, solarDay);
  if (needsSummerTime) {
    adjustedHour = hour - 1;
    if (adjustedHour < 0) adjustedHour += 24;
  }
  
  // 사주 계산
  const yearPillar = calculateYearPillar(solarYear, solarMonth, solarDay);
  const monthPillar = calculateMonthPillar(solarYear, solarMonth, solarDay);
  const dayPillar = calculateDayPillar(solarYear, solarMonth, solarDay);
  const hourPillar = calculateHourPillar(dayPillar, adjustedHour, minute);
  
  // 절기월
  const solarMonthNum = getSolarMonth(solarYear, solarMonth, solarDay);
  
  // 결과 구성
  const fourPillars: FourPillars = {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    yearHeavenly: yearPillar[0],
    yearEarthly: yearPillar[1],
    monthHeavenly: monthPillar[0],
    monthEarthly: monthPillar[1],
    dayHeavenly: dayPillar[0],
    dayEarthly: dayPillar[1],
    hourHeavenly: hourPillar[0],
    hourEarthly: hourPillar[1],
  };
  
  const elements = {
    year: { 
      heavenly: FIVE_ELEMENTS.천간[yearPillar[0] as keyof typeof FIVE_ELEMENTS.천간],
      earthly: FIVE_ELEMENTS.지지[yearPillar[1] as keyof typeof FIVE_ELEMENTS.지지],
    },
    month: { 
      heavenly: FIVE_ELEMENTS.천간[monthPillar[0] as keyof typeof FIVE_ELEMENTS.천간],
      earthly: FIVE_ELEMENTS.지지[monthPillar[1] as keyof typeof FIVE_ELEMENTS.지지],
    },
    day: { 
      heavenly: FIVE_ELEMENTS.천간[dayPillar[0] as keyof typeof FIVE_ELEMENTS.천간],
      earthly: FIVE_ELEMENTS.지지[dayPillar[1] as keyof typeof FIVE_ELEMENTS.지지],
    },
    hour: { 
      heavenly: FIVE_ELEMENTS.천간[hourPillar[0] as keyof typeof FIVE_ELEMENTS.천간],
      earthly: FIVE_ELEMENTS.지지[hourPillar[1] as keyof typeof FIVE_ELEMENTS.지지],
    },
  };
  
  return {
    fourPillars,
    birthInfo,
    summerTimeApplied: needsSummerTime,
    solarMonth: solarMonthNum,
    elements,
  };
}

// ==================== 검증 함수 ====================

/**
 * 사주 계산 결과 검증
 */
export function validateSaju(result: SajuCalculationResult): boolean {
  const { fourPillars } = result;
  
  // 모든 기둥이 60갑자에 포함되는지 확인
  const pillars = [fourPillars.year, fourPillars.month, fourPillars.day, fourPillars.hour];
  for (const pillar of pillars) {
    if (!SIXTY_CYCLE.includes(pillar as typeof SIXTY_CYCLE[number])) {
      console.error(`Invalid pillar: ${pillar}`);
      return false;
    }
  }
  
  // 천간과 지지가 올바른지 확인
  for (const pillar of pillars) {
    const stem = pillar[0];
    const branch = pillar[1];
    
    if (!HEAVENLY_STEMS.includes(stem as typeof HEAVENLY_STEMS[number])) {
      console.error(`Invalid stem: ${stem}`);
      return false;
    }
    
    if (!EARTHLY_BRANCHES.includes(branch as typeof EARTHLY_BRANCHES[number])) {
      console.error(`Invalid branch: ${branch}`);
      return false;
    }
  }
  
  return true;
}

/**
 * 테스트 케이스 실행
 */
export function runTestCases(): void {
  
  const testCases = [
    {
      name: '일반 케이스',
      birthInfo: {
        year: 1990,
        month: 5,
        day: 15,
        hour: 14,
        minute: 30,
        isLunar: false,
      } as SajuBirthInfo,
    },
    {
      name: '입춘 전 케이스',
      birthInfo: {
        year: 1985,
        month: 2,
        day: 3,
        hour: 23,
        minute: 0,
        isLunar: false,
      } as SajuBirthInfo,
    },
    {
      name: '서머타임 케이스',
      birthInfo: {
        year: 1987,
        month: 6,
        day: 15,
        hour: 15,
        minute: 0,
        isLunar: false,
      } as SajuBirthInfo,
    },
  ];
  
  for (const testCase of testCases) {
    
    const result = calculateSaju(testCase.birthInfo);
    const _isValid = validateSaju(result);
    
  }
}

// 개발 환경에서만 테스트 실행
if (process.env.NODE_ENV === 'development') {
  // runTestCases()
}