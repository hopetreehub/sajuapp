// 사주 계산 엔진
// 천간 (10개)
const CHEONGAN = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];

// 지지 (12개)
const JIJI = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

// 천간의 오행
const CHEONGAN_OHHAENG = {
  '갑': '목', '을': '목',
  '병': '화', '정': '화',
  '무': '토', '기': '토',
  '경': '금', '신': '금',
  '임': '수', '계': '수'
};

// 지지의 오행
const JIJI_OHHAENG = {
  '인': '목', '묘': '목',
  '사': '화', '오': '화',
  '진': '토', '술': '토', '축': '토', '미': '토',
  '신': '금', '유': '금',
  '자': '수', '해': '수'
};

// 시간별 지지 매핑
const TIME_TO_JIJI = {
  '23-01': '자', '01-03': '축', '03-05': '인', '05-07': '묘',
  '07-09': '진', '09-11': '사', '11-13': '오', '13-15': '미',
  '15-17': '신', '17-19': '유', '19-21': '술', '21-23': '해'
};

// 음력 변환 (간단한 버전 - 실제로는 더 복잡한 계산 필요)
function convertToSolarDate(lunarDate, isLunar) {
  if (!isLunar) return lunarDate;
  
  // 음력->양력 변환은 복잡하므로 일단 그대로 반환
  // 실제로는 음력 변환 라이브러리 사용 필요
  return lunarDate;
}

// 년주 계산
function calculateYearPillar(date) {
  const year = date.getFullYear();
  
  // 60갑자 계산
  const baseYear = 1984; // 갑자년
  const diff = year - baseYear;
  const ganIndex = ((diff % 10) + 10) % 10;
  const jiIndex = ((diff % 12) + 12) % 12;
  
  return {
    gan: CHEONGAN[ganIndex],
    ji: JIJI[jiIndex]
  };
}

// 월주 계산 (간단한 버전)
function calculateMonthPillar(date, yearGan) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // 절기 보정 (대략적인 계산)
  let adjustedMonth = month;
  if (day < 5) {
    adjustedMonth = month - 1;
    if (adjustedMonth < 1) adjustedMonth = 12;
  }
  
  // 월지
  const monthJiMap = ['', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해', '자', '축'];
  const ji = monthJiMap[adjustedMonth] || '인';
  
  // 월간 계산 (년간에 따라 결정)
  const yearGanIndex = CHEONGAN.indexOf(yearGan);
  const monthGanStart = (yearGanIndex * 2 + 2) % 10;
  const monthGanIndex = (monthGanStart + adjustedMonth - 1) % 10;
  const gan = CHEONGAN[monthGanIndex];
  
  return { gan, ji };
}

// 일주 계산
function calculateDayPillar(date) {
  // 1900년 1월 1일을 기준으로 계산 (갑자일)
  const baseDate = new Date(1900, 0, 1);
  const diffDays = Math.floor((date - baseDate) / (1000 * 60 * 60 * 24));
  
  const ganIndex = diffDays % 10;
  const jiIndex = diffDays % 12;
  
  return {
    gan: CHEONGAN[ganIndex],
    ji: JIJI[jiIndex]
  };
}

// 시주 계산
function calculateTimePillar(birthTime, dayGan) {
  const [hour, minute] = birthTime.split(':').map(Number);
  
  // 시지 결정
  let ji = '자'; // 기본값
  for (const [timeRange, jiValue] of Object.entries(TIME_TO_JIJI)) {
    const [startHour, endHour] = timeRange.split('-').map(Number);
    if ((startHour <= hour && hour < endHour) || 
        (startHour > endHour && (hour >= startHour || hour < endHour))) {
      ji = jiValue;
      break;
    }
  }
  
  // 시간 결정 (일간에 따라)
  const dayGanIndex = CHEONGAN.indexOf(dayGan);
  const jiIndex = JIJI.indexOf(ji);
  const timeGanIndex = (dayGanIndex * 2 + jiIndex) % 10;
  const gan = CHEONGAN[timeGanIndex];
  
  return { gan, ji };
}

// 오행 균형 계산
function calculateOhHaengBalance(yearPillar, monthPillar, dayPillar, timePillar) {
  const ohHaengCount = {
    '목': 0,
    '화': 0,
    '토': 0,
    '금': 0,
    '수': 0
  };
  
  // 천간 오행 계산
  [yearPillar.gan, monthPillar.gan, dayPillar.gan, timePillar.gan].forEach(gan => {
    const ohHaeng = CHEONGAN_OHHAENG[gan];
    if (ohHaeng) ohHaengCount[ohHaeng] += 1;
  });
  
  // 지지 오행 계산
  [yearPillar.ji, monthPillar.ji, dayPillar.ji, timePillar.ji].forEach(ji => {
    const ohHaeng = JIJI_OHHAENG[ji];
    if (ohHaeng) ohHaengCount[ohHaeng] += 1;
  });
  
  // 백분율로 변환
  const total = Object.values(ohHaengCount).reduce((sum, count) => sum + count, 0);
  const ohHaengBalance = {};
  
  for (const [key, count] of Object.entries(ohHaengCount)) {
    ohHaengBalance[key] = Math.round((count / total) * 100);
  }
  
  return ohHaengBalance;
}

// 메인 사주 계산 함수
export function calculateSaju(birthDate, birthTime, isLunar = false) {
  // 날짜 파싱
  const dateParts = birthDate.split('-');
  const date = new Date(
    parseInt(dateParts[0]),
    parseInt(dateParts[1]) - 1,
    parseInt(dateParts[2])
  );
  
  // 음력 변환 (필요시)
  const solarDate = convertToSolarDate(date, isLunar);
  
  // 사주 팔자 계산
  const yearPillar = calculateYearPillar(solarDate);
  const monthPillar = calculateMonthPillar(solarDate, yearPillar.gan);
  const dayPillar = calculateDayPillar(solarDate);
  const timePillar = calculateTimePillar(birthTime, dayPillar.gan);
  
  // 오행 균형 계산
  const ohHaengBalance = calculateOhHaengBalance(
    yearPillar,
    monthPillar,
    dayPillar,
    timePillar
  );
  
  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    time: timePillar,
    ohHaengBalance,
    
    // 사주 문자열 표현
    sajuText: {
      year: `${yearPillar.gan}${yearPillar.ji}년`,
      month: `${monthPillar.gan}${monthPillar.ji}월`,
      day: `${dayPillar.gan}${dayPillar.ji}일`,
      time: `${timePillar.gan}${timePillar.ji}시`
    },
    
    // 전체 사주
    fullSaju: `${yearPillar.gan}${yearPillar.ji} ${monthPillar.gan}${monthPillar.ji} ${dayPillar.gan}${dayPillar.ji} ${timePillar.gan}${timePillar.ji}`
  };
}

// 대운 계산 (10년 주기)
export function calculateDaeun(sajuData, currentYear) {
  const birthYear = parseInt(sajuData.sajuText.year.match(/\d+/)?.[0] || '2000');
  const age = currentYear - birthYear + 1;
  const daeunCycle = Math.floor((age - 1) / 10);
  
  // 대운 천간지지 계산 (간단한 버전)
  const monthGanIndex = CHEONGAN.indexOf(sajuData.month.gan);
  const monthJiIndex = JIJI.indexOf(sajuData.month.ji);
  
  const daeunGanIndex = (monthGanIndex + daeunCycle) % 10;
  const daeunJiIndex = (monthJiIndex + daeunCycle) % 12;
  
  return {
    cycle: daeunCycle + 1,
    gan: CHEONGAN[daeunGanIndex],
    ji: JIJI[daeunJiIndex],
    startAge: daeunCycle * 10 + 1,
    endAge: (daeunCycle + 1) * 10
  };
}

// 세운 계산 (년운)
export function calculateSaeun(currentYear) {
  const yearPillar = calculateYearPillar(new Date(currentYear, 0, 1));
  return {
    year: currentYear,
    gan: yearPillar.gan,
    ji: yearPillar.ji,
    ohHaeng: CHEONGAN_OHHAENG[yearPillar.gan]
  };
}