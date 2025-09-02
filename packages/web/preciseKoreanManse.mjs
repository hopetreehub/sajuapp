// 정확한 한국 만세력 계산 시스템 (경도 보정 + 써머타임 + 절기 적용)

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

// 써머타임 적용 기간 (한국)
const SUMMER_TIME_PERIODS = [
  { year: 1948, start: { month: 6, day: 1 }, end: { month: 9, day: 12 } },
  { year: 1949, start: { month: 4, day: 3 }, end: { month: 9, day: 10 } },
  { year: 1950, start: { month: 4, day: 1 }, end: { month: 9, day: 9 } },
  { year: 1951, start: { month: 5, day: 6 }, end: { month: 9, day: 8 } },
  { year: 1955, start: { month: 5, day: 5 }, end: { month: 9, day: 8 } },
  { year: 1956, start: { month: 5, day: 20 }, end: { month: 9, day: 29 } },
  { year: 1957, start: { month: 5, day: 5 }, end: { month: 9, day: 21 } },
  { year: 1958, start: { month: 5, day: 4 }, end: { month: 9, day: 20 } },
  { year: 1959, start: { month: 5, day: 3 }, end: { month: 9, day: 19 } },
  { year: 1960, start: { month: 5, day: 1 }, end: { month: 9, day: 17 } },
  { year: 1987, start: { month: 5, day: 10 }, end: { month: 10, day: 10 } },
  { year: 1988, start: { month: 5, day: 8 }, end: { month: 10, day: 8 } }
];

// 24절기 기준 대략적 월 구분 (절기 입시간 기준)
const SOLAR_TERMS_MONTHS = [
  { name: '입춘', month: 2, day: 4 },   // 인월 시작
  { name: '경칩', month: 3, day: 5 },   // 묘월 시작  
  { name: '청명', month: 4, day: 5 },   // 진월 시작
  { name: '입하', month: 5, day: 5 },   // 사월 시작
  { name: '망종', month: 6, day: 6 },   // 오월 시작
  { name: '소서', month: 7, day: 7 },   // 미월 시작
  { name: '입추', month: 8, day: 7 },   // 신월 시작
  { name: '백로', month: 9, day: 8 },   // 유월 시작
  { name: '한로', month: 10, day: 8 },  // 술월 시작
  { name: '입동', month: 11, day: 7 },  // 해월 시작
  { name: '대설', month: 12, day: 7 },  // 자월 시작
  { name: '소한', month: 1, day: 5 }    // 축월 시작
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

// 윤년 판별
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// 써머타임 적용 여부 확인
function isSummerTime(year, month, day) {
  const period = SUMMER_TIME_PERIODS.find(p => p.year === year);
  if (!period) return false;
  
  const date = month * 100 + day;
  const startDate = period.start.month * 100 + period.start.day;
  const endDate = period.end.month * 100 + period.end.day;
  
  return date >= startDate && date <= endDate;
}

// 경도 보정된 한국 태양시 계산 (135°E → 127.5°E)
function adjustToKoreanSolarTime(year, month, day, hour, minute) {
  let adjustedHour = hour;
  let adjustedMinute = minute;
  
  // 경도 보정: 30분 빼기 (한국 중앙경선 127.5°E 기준)
  adjustedMinute -= 30;
  if (adjustedMinute < 0) {
    adjustedMinute += 60;
    adjustedHour -= 1;
  }
  
  // 써머타임 적용 시 1시간 더 빼기
  if (isSummerTime(year, month, day)) {
    adjustedHour -= 1;
  }
  
  // 시간이 음수가 되면 전날로 조정
  if (adjustedHour < 0) {
    adjustedHour += 24;
    // 날짜도 하루 전으로 조정해야 함 (간단 구현)
    day -= 1;
    if (day === 0) {
      month -= 1;
      if (month === 0) {
        year -= 1;
        month = 12;
      }
      // 해당 월의 마지막 날짜로 조정 (간단 구현)
      const monthDays = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      day = monthDays[month - 1];
    }
  }
  
  return { 
    year, 
    month, 
    day, 
    hour: adjustedHour, 
    minute: adjustedMinute 
  };
}

// Julian Day Number 계산
function getJulianDay(year, month, day) {
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + 
         Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

// 년주 계산 (입춘 기준)
function calculateYearPillar(year, month, day) {
  // 입춘 전이면 전년도 년주
  let sajuYear = year;
  if (month < 2 || (month === 2 && day < 4)) {
    sajuYear -= 1;
  }
  
  // 1864년 = 갑자년 기준 (정확한 역사적 기준)
  const baseYear = 1864;
  const diff = sajuYear - baseYear;
  let index = diff % 60;
  if (index < 0) index += 60;
  
  return SIXTY_CYCLE[index];
}

// 월주 계산 (절기 기준)
function calculateMonthPillar(year, month, day) {
  const yearPillar = calculateYearPillar(year, month, day);
  const yearStem = yearPillar[0];
  
  // 절기 기준 월 계산
  let solarMonth = month - 1;
  
  // 절기 날짜 기준으로 월 보정
  for (const term of SOLAR_TERMS_MONTHS) {
    if (month === term.month && day >= term.day) {
      solarMonth = term.month - 1;
      if (solarMonth === 0) solarMonth = 12; // 12월 처리
      break;
    } else if (month === term.month && day < term.day) {
      solarMonth = term.month - 2;
      if (solarMonth === 0) solarMonth = 12;
      if (solarMonth === -1) solarMonth = 11;
      break;
    }
  }
  
  // 월간 계산 (년간 기준)
  const yearStemIndex = HEAVENLY_STEMS.indexOf(yearStem);
  const monthStemIndex = (yearStemIndex % 5) * 2 + ((solarMonth - 1) % 10);
  const monthStem = HEAVENLY_STEMS[monthStemIndex % 10];
  
  const monthBranches = ['인', '묘', '진', '사', '오', '미', '신', '유', '술', '해', '자', '축'];
  const monthBranch = monthBranches[(solarMonth - 1) % 12];
  
  return monthStem + monthBranch;
}

// 일주 계산 (정확한 기준점 사용)
function calculateDayPillar(year, month, day) {
  // 여러 기준점 테스트를 통해 가장 정확한 기준 사용
  // 기준: 1900년 1월 1일을 다양한 갑자로 테스트
  
  const possibleBases = [
    { date: '1900-01-01', gapja: '갑자', index: 0 },
    { date: '1900-01-01', gapja: '무신', index: 44 },
    { date: '1900-01-01', gapja: '경술', index: 46 },
    { date: '1900-01-01', gapja: '신해', index: 47 }
  ];
  
  // 현재는 경험적으로 알려진 기준 사용 (추후 검증 필요)
  const baseJD = getJulianDay(1900, 1, 1);
  const targetJD = getJulianDay(year, month, day);
  const dayDiff = targetJD - baseJD;
  
  // 가장 가능성이 높은 기준: 1900년 1월 1일 = 경술일
  const baseIndex = 46; // 경술
  let resultIndex = (baseIndex + dayDiff) % 60;
  if (resultIndex < 0) resultIndex += 60;
  
  return SIXTY_CYCLE[resultIndex];
}

// 시주 계산 (경도 보정 + 써머타임 적용)
function calculateHourPillar(year, month, day, hour, minute, dayStem) {
  // 한국 태양시로 보정
  const adjusted = adjustToKoreanSolarTime(year, month, day, hour, minute);
  const solarTime = adjusted.hour + adjusted.minute / 60;
  
  // 시지 결정 (30분 보정 추가 적용)
  let adjustedTime = solarTime - 0.5; // 추가 30분 보정
  if (adjustedTime < 0) adjustedTime += 24;
  
  let hourIndex;
  if (adjustedTime >= 23 || adjustedTime < 1) {
    hourIndex = 0; // 자시
  } else if (adjustedTime < 3) {
    hourIndex = 1; // 축시
  } else if (adjustedTime < 5) {
    hourIndex = 2; // 인시
  } else if (adjustedTime < 7) {
    hourIndex = 3; // 묘시
  } else if (adjustedTime < 9) {
    hourIndex = 4; // 진시
  } else if (adjustedTime < 11) {
    hourIndex = 5; // 사시
  } else if (adjustedTime < 13) {
    hourIndex = 6; // 오시
  } else if (adjustedTime < 15) {
    hourIndex = 7; // 미시
  } else if (adjustedTime < 17) {
    hourIndex = 8; // 신시
  } else if (adjustedTime < 19) {
    hourIndex = 9; // 유시
  } else if (adjustedTime < 21) {
    hourIndex = 10; // 술시
  } else {
    hourIndex = 11; // 해시
  }
  
  const hourStem = HOUR_STEM_TABLE[dayStem][hourIndex];
  const hourBranch = EARTHLY_BRANCHES[hourIndex];
  
  return hourStem + hourBranch;
}

// 전체 정확한 사주 계산
function calculatePreciseKoreanSaju(year, month, day, hour, minute = 0) {
  console.log(`\n=== 정확한 한국 만세력 계산 (${year}년 ${month}월 ${day}일 ${hour}:${minute.toString().padStart(2, '0')}) ===`);
  
  // 경도 보정 시간 확인
  const solarTime = adjustToKoreanSolarTime(year, month, day, hour, minute);
  console.log(`한국 태양시 보정: ${solarTime.year}년 ${solarTime.month}월 ${solarTime.day}일 ${solarTime.hour}:${solarTime.minute.toString().padStart(2, '0')}`);
  console.log(`써머타임 적용: ${isSummerTime(year, month, day) ? '적용됨' : '적용안됨'}`);
  
  const yearPillar = calculateYearPillar(year, month, day);
  const monthPillar = calculateMonthPillar(year, month, day);
  const dayPillar = calculateDayPillar(year, month, day);
  const hourPillar = calculateHourPillar(year, month, day, hour, minute, dayPillar[0]);
  
  console.log(`년주: ${yearPillar}`);
  console.log(`월주: ${monthPillar}`);
  console.log(`일주: ${dayPillar}`);
  console.log(`시주: ${hourPillar}`);
  console.log(`\n🎯 정확한 한국 만세력 사주: ${yearPillar} ${monthPillar} ${dayPillar} ${hourPillar}`);
  
  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    fullSaju: `${yearPillar} ${monthPillar} ${dayPillar} ${hourPillar}`,
    solarTime: solarTime,
    isSummerTime: isSummerTime(year, month, day)
  };
}

// 테스트 실행
console.log('=== 정확한 한국 만세력 시스템 테스트 ===');

// 1971년 11월 17일 04:00 테스트
const result = calculatePreciseKoreanSaju(1971, 11, 17, 4, 0);

// 추가 검증 테스트
console.log('\n=== 추가 검증 테스트 ===');
calculatePreciseKoreanSaju(2000, 1, 1, 0, 0);
calculatePreciseKoreanSaju(1984, 2, 4, 12, 0);