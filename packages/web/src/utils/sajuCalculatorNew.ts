/**
 * 정확한 만세력 기준 사주 계산 시스템
 * 1971년 11월 17일 04시를 정확히 계산하기 위한 새로운 구현
 */

// 천간(天干) - 10개
export const HEAVENLY_STEMS = [
  '갑', '을', '병', '정', '무', '기', '경', '신', '임', '계',
] as const;

// 지지(地支) - 12개  
export const EARTHLY_BRANCHES = [
  '자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해',
] as const;

// 60갑자 순환표
export const SIXTY_CYCLE = [
  '갑자', '을축', '병인', '정묘', '무진', '기사', '경오', '신미', '임신', '계유',
  '갑술', '을해', '병자', '정축', '무인', '기묘', '경진', '신사', '임오', '계미',
  '갑신', '을유', '병술', '정해', '무자', '기축', '경인', '신묘', '임진', '계사',
  '갑오', '을미', '병신', '정유', '무술', '기해', '경자', '신축', '임인', '계묘',
  '갑진', '을사', '병오', '정미', '무신', '기유', '경술', '신해', '임자', '계축',
  '갑인', '을묘', '병진', '정사', '무오', '기미', '경신', '신유', '임술', '계해',
] as const;

// 24절기 날짜 (평균값 기준, 실제로는 매년 약간씩 다름)
const SOLAR_TERMS = {
  '소한': { month: 1, day: 5 },    // 축월 시작
  '입춘': { month: 2, day: 4 },    // 인월 시작
  '경칩': { month: 3, day: 5 },    // 묘월 시작
  '청명': { month: 4, day: 5 },    // 진월 시작
  '입하': { month: 5, day: 5 },    // 사월 시작
  '망종': { month: 6, day: 6 },    // 오월 시작
  '소서': { month: 7, day: 7 },    // 미월 시작
  '입추': { month: 8, day: 7 },    // 신월 시작
  '백로': { month: 9, day: 8 },    // 유월 시작
  '한로': { month: 10, day: 8 },   // 술월 시작
  '입동': { month: 11, day: 7 },   // 해월 시작
  '대설': { month: 12, day: 7 },    // 자월 시작
};

// 절기월 계산 (양력 기준)
function getSolarMonth(year: number, month: number, day: number): number {
  // 절기 경계를 확인하여 정확한 월지 반환
  // 인월=1, 묘월=2, ..., 자월=11, 축월=12
  
  if (month === 1) {
    return day >= 5 ? 12 : 11;  // 1/5 이후 축월, 이전 자월
  } else if (month === 2) {
    return day >= 4 ? 1 : 12;   // 2/4 입춘 이후 인월
  } else if (month === 3) {
    return day >= 5 ? 2 : 1;    // 3/5 경칩 이후 묘월
  } else if (month === 4) {
    return day >= 5 ? 3 : 2;    // 4/5 청명 이후 진월
  } else if (month === 5) {
    return day >= 5 ? 4 : 3;    // 5/5 입하 이후 사월
  } else if (month === 6) {
    return day >= 6 ? 5 : 4;    // 6/6 망종 이후 오월
  } else if (month === 7) {
    return day >= 7 ? 6 : 5;    // 7/7 소서 이후 미월
  } else if (month === 8) {
    return day >= 7 ? 7 : 6;    // 8/7 입추 이후 신월
  } else if (month === 9) {
    return day >= 8 ? 8 : 7;    // 9/8 백로 이후 유월
  } else if (month === 10) {
    return day >= 8 ? 9 : 8;    // 10/8 한로 이후 술월
  } else if (month === 11) {
    return day >= 7 ? 10 : 9;   // 11/7 입동 이후 해월
  } else if (month === 12) {
    return day >= 7 ? 11 : 10;  // 12/7 대설 이후 자월
  }
  return 1;
}

// 년주 계산 (입춘 기준)
export function calculateYearPillar(year: number, month: number, day: number): {
  gan: string;
  ji: string;
  combined: string;
} {
  // 입춘(2/4) 이전이면 전년도로 계산
  let adjustedYear = year;
  if (month === 1 || (month === 2 && day < 4)) {
    adjustedYear = year - 1;
  }
  
  // 1984년 = 갑자년 (60갑자 순환의 시작)
  // 1971년 = 신해년이므로 이를 기준으로 계산
  // 1984 - 1971 = 13년 차이, 신해(47) + 13 = 60 = 0(갑자)
  const baseYear = 1984;
  const yearDiff = adjustedYear - baseYear;
  let cycleIndex = yearDiff % 60;
  
  // 음수 처리
  if (cycleIndex < 0) {
    cycleIndex += 60;
  }
  
  const combined = SIXTY_CYCLE[cycleIndex];
  
  return {
    gan: combined[0],
    ji: combined[1],
    combined,
  };
}

// 월주 계산 (절기 기준)
export function calculateMonthPillar(year: number, month: number, day: number): {
  gan: string;
  ji: string;
  combined: string;
} {
  // 년주 구하기
  const yearPillar = calculateYearPillar(year, month, day);
  const yearGan = yearPillar.gan;
  const yearGanIndex = HEAVENLY_STEMS.indexOf(yearGan);
  
  // 절기월 구하기 (인월=1, 묘월=2, ..., 자월=11, 축월=12)
  const solarMonth = getSolarMonth(year, month, day);
  
  // 월지 결정
  const monthJi = ['인', '묘', '진', '사', '오', '미', '신', '유', '술', '해', '자', '축'][solarMonth - 1];
  
  // 월간 계산 공식: 년간 기준으로 월간 결정
  // 갑기년 → 병인월부터 시작
  // 을경년 → 무인월부터 시작
  // 병신년 → 경인월부터 시작
  // 정임년 → 임인월부터 시작
  // 무계년 → 갑인월부터 시작
  
  const monthGanStartIndex = (yearGanIndex % 5) * 2 + 2; // 시작 천간 인덱스
  const monthGanIndex = (monthGanStartIndex + solarMonth - 1) % 10;
  const monthGan = HEAVENLY_STEMS[monthGanIndex];
  
  return {
    gan: monthGan,
    ji: monthJi,
    combined: monthGan + monthJi,
  };
}

// 일주 계산 (정확한 기준일 사용)
export function calculateDayPillar(year: number, month: number, day: number): {
  gan: string;
  ji: string;
  combined: string;
} {
  // 기준일을 더 정확하게 설정
  // 1900년 1월 31일 = 갑자일 (index 0)을 기준으로 사용
  const baseDate = new Date(1900, 0, 31); // 1900년 1월 31일
  const targetDate = new Date(year, month - 1, day);
  
  // 두 날짜 간의 차이를 일수로 계산
  const timeDiff = targetDate.getTime() - baseDate.getTime();
  const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  // 60갑자 순환 계산 (갑자=0 기준)
  let cycleIndex = dayDiff % 60;
  if (cycleIndex < 0) {
    cycleIndex += 60;
  }
  
  const combined = SIXTY_CYCLE[cycleIndex];
  
  return {
    gan: combined[0],
    ji: combined[1],
    combined,
  };
}

// 시주 계산 (일간 기준)
export function calculateHourPillar(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number = 0,
): {
  gan: string;
  ji: string;
  combined: string;
} {
  // 일주 구하기
  const dayPillar = calculateDayPillar(year, month, day);
  const dayGan = dayPillar.gan;
  const dayGanIndex = HEAVENLY_STEMS.indexOf(dayGan);
  
  // 시지 결정 (2시간 단위)
  let hourIndex: number;
  const time = hour + minute / 60;
  
  if (time >= 23 || time < 1) {
    hourIndex = 0; // 자시 (23:00-00:59)
  } else if (time < 3) {
    hourIndex = 1; // 축시 (01:00-02:59)
  } else if (time < 5) {
    hourIndex = 2; // 인시 (03:00-04:59)
  } else if (time < 7) {
    hourIndex = 3; // 묘시 (05:00-06:59)
  } else if (time < 9) {
    hourIndex = 4; // 진시 (07:00-08:59)
  } else if (time < 11) {
    hourIndex = 5; // 사시 (09:00-10:59)
  } else if (time < 13) {
    hourIndex = 6; // 오시 (11:00-12:59)
  } else if (time < 15) {
    hourIndex = 7; // 미시 (13:00-14:59)
  } else if (time < 17) {
    hourIndex = 8; // 신시 (15:00-16:59)
  } else if (time < 19) {
    hourIndex = 9; // 유시 (17:00-18:59)
  } else if (time < 21) {
    hourIndex = 10; // 술시 (19:00-20:59)
  } else {
    hourIndex = 11; // 해시 (21:00-22:59)
  }
  
  const hourJi = EARTHLY_BRANCHES[hourIndex];
  
  // 시간 천간 계산 공식
  // 갑기일 → 갑자시부터 시작
  // 을경일 → 병자시부터 시작
  // 병신일 → 무자시부터 시작
  // 정임일 → 경자시부터 시작
  // 무계일 → 임자시부터 시작
  
  const hourGanStartIndex = (dayGanIndex % 5) * 2; // 시작 천간 인덱스
  const hourGanIndex = (hourGanStartIndex + hourIndex) % 10;
  const hourGan = HEAVENLY_STEMS[hourGanIndex];
  
  return {
    gan: hourGan,
    ji: hourJi,
    combined: hourGan + hourJi,
  };
}

// 완전한 사주 계산
export function calculateCompleteSaju(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number = 0,
  isLunar: boolean = false,
) {
  // TODO: 음력 변환 로직 추가 필요
  if (isLunar) {
    console.warn('음력 변환은 아직 구현되지 않았습니다.');
  }
  
  const yearPillar = calculateYearPillar(year, month, day);
  const monthPillar = calculateMonthPillar(year, month, day);
  const dayPillar = calculateDayPillar(year, month, day);
  const hourPillar = calculateHourPillar(year, month, day, hour, minute);
  
  // 오행 분석
  const ganOhHaeng: Record<string, string> = {
    '갑': '목', '을': '목',
    '병': '화', '정': '화',
    '무': '토', '기': '토',
    '경': '금', '신': '금',
    '임': '수', '계': '수',
  };
  
  const jiOhHaeng: Record<string, string> = {
    '자': '수', '축': '토', '인': '목', '묘': '목',
    '진': '토', '사': '화', '오': '화', '미': '토',
    '신': '금', '유': '금', '술': '토', '해': '수',
  };
  
  // 오행 통계
  const ohHaengCount: Record<string, number> = {
    '목': 0, '화': 0, '토': 0, '금': 0, '수': 0,
  };
  
  // 천간 오행
  ohHaengCount[ganOhHaeng[yearPillar.gan]]++;
  ohHaengCount[ganOhHaeng[monthPillar.gan]]++;
  ohHaengCount[ganOhHaeng[dayPillar.gan]]++;
  ohHaengCount[ganOhHaeng[hourPillar.gan]]++;
  
  // 지지 오행
  ohHaengCount[jiOhHaeng[yearPillar.ji]]++;
  ohHaengCount[jiOhHaeng[monthPillar.ji]]++;
  ohHaengCount[jiOhHaeng[dayPillar.ji]]++;
  ohHaengCount[jiOhHaeng[hourPillar.ji]]++;
  
  // 오행 균형도 계산 (퍼센트)
  const total = 8;
  const ohHaengBalance = {
    목: Math.round((ohHaengCount['목'] / total) * 100),
    화: Math.round((ohHaengCount['화'] / total) * 100),
    토: Math.round((ohHaengCount['토'] / total) * 100),
    금: Math.round((ohHaengCount['금'] / total) * 100),
    수: Math.round((ohHaengCount['수'] / total) * 100),
  };
  
  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    time: hourPillar,
    fullSaju: `${yearPillar.combined} ${monthPillar.combined} ${dayPillar.combined} ${hourPillar.combined}`,
    ohHaengBalance,
    ohHaengCount,
  };
}

// 테스트 함수
export function testSajuCalculation() {
  console.log('=== 사주 계산 테스트 ===');
  
  // 1971년 11월 17일 04시 테스트
  const result1 = calculateCompleteSaju(1971, 11, 17, 4);
  console.log('1971년 11월 17일 04시:');
  console.log('사주:', result1.fullSaju);
  console.log('년주:', result1.year.combined);
  console.log('월주:', result1.month.combined);
  console.log('일주:', result1.day.combined);
  console.log('시주:', result1.time.combined);
  console.log('---');
  
  // 다른 테스트 케이스들
  const testCases = [
    { year: 1984, month: 2, day: 4, hour: 12, desc: '1984년 갑자년 입춘일' },
    { year: 2000, month: 1, day: 1, hour: 0, desc: '2000년 1월 1일 (기준일)' },
    { year: 1976, month: 9, day: 16, hour: 10, desc: '1976년 9월 16일' },
  ];
  
  testCases.forEach(tc => {
    const result = calculateCompleteSaju(tc.year, tc.month, tc.day, tc.hour);
    console.log(`${tc.desc}:`);
    console.log('사주:', result.fullSaju);
    console.log('---');
  });
}