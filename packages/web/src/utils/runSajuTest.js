// 사주 계산 테스트 실행 스크립트

// 필요한 상수들 직접 정의
const SIXTY_CYCLE = [
  '갑자', '을축', '병인', '정묘', '무진', '기사', '경오', '신미', '임신', '계유',
  '갑술', '을해', '병자', '정축', '무인', '기묘', '경진', '신사', '임오', '계미',
  '갑신', '을유', '병술', '정해', '무자', '기축', '경인', '신묘', '임진', '계사',
  '갑오', '을미', '병신', '정유', '무술', '기해', '경자', '신축', '임인', '계묘',
  '갑진', '을사', '병오', '정미', '무신', '기유', '경술', '신해', '임자', '계축',
  '갑인', '을묘', '병진', '정사', '무오', '기미', '경신', '신유', '임술', '계해'
];

const YEAR_STEM_TO_MONTH_STEM = {
  '갑': ['병', '정', '무', '기', '경', '신', '임', '계', '갑', '을', '병', '정'],
  '을': ['무', '기', '경', '신', '임', '계', '갑', '을', '병', '정', '무', '기'],
  '병': ['경', '신', '임', '계', '갑', '을', '병', '정', '무', '기', '경', '신'],
  '정': ['임', '계', '갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'],
  '무': ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계', '갑', '을'],
  '기': ['병', '정', '무', '기', '경', '신', '임', '계', '갑', '을', '병', '정'],
  '경': ['무', '기', '경', '신', '임', '계', '갑', '을', '병', '정', '무', '기'],
  '신': ['경', '신', '임', '계', '갑', '을', '병', '정', '무', '기', '경', '신'],
  '임': ['임', '계', '갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'],
  '계': ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계', '갑', '을']
};

const DAY_STEM_TO_HOUR_STEM = {
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

// 간단한 계산 함수들
function getJulianDayNumber(year, month, day) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + 
         Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function calculateYearPillar(year, month, day) {
  let adjustedYear = year;
  if (month === 1 || (month === 2 && day < 4)) {
    adjustedYear -= 1;
  }
  
  const BASE_YEAR = 1984;
  const BASE_INDEX = 0;
  
  const diff = adjustedYear - BASE_YEAR;
  let index = (BASE_INDEX + diff) % 60;
  if (index < 0) index += 60;
  
  return SIXTY_CYCLE[index];
}

function calculateMonthPillar(year, month, day) {
  const yearPillar = calculateYearPillar(year, month, day);
  const yearStem = yearPillar[0];
  
  // 간단한 절기월 계산
  let solarMonth = month;
  if (month === 1 && day < 4) solarMonth = 12;
  else if (month === 2 && day < 4) solarMonth = 1;
  else if (month === 3 && day < 6) solarMonth = 2;
  else if (month === 4 && day < 5) solarMonth = 3;
  else if (month === 5 && day < 6) solarMonth = 4;
  else if (month === 6 && day < 6) solarMonth = 5;
  else if (month === 7 && day < 7) solarMonth = 6;
  else if (month === 8 && day < 8) solarMonth = 7;
  else if (month === 9 && day < 8) solarMonth = 8;
  else if (month === 10 && day < 8) solarMonth = 9;
  else if (month === 11 && day < 7) solarMonth = 10;
  else if (month === 12 && day < 7) solarMonth = 11;
  
  const monthStemArray = YEAR_STEM_TO_MONTH_STEM[yearStem];
  const monthStem = monthStemArray[solarMonth - 1];
  
  const monthBranches = ['인', '묘', '진', '사', '오', '미', '신', '유', '술', '해', '자', '축'];
  const monthBranch = monthBranches[solarMonth - 1];
  
  return monthStem + monthBranch;
}

function calculateDayPillar(year, month, day) {
  const BASE_DATE = { year: 1900, month: 1, day: 1 };
  const BASE_INDEX = 10; // 갑술
  
  const baseJD = getJulianDayNumber(BASE_DATE.year, BASE_DATE.month, BASE_DATE.day);
  const targetJD = getJulianDayNumber(year, month, day);
  const dayDiff = targetJD - baseJD;
  
  let index = (BASE_INDEX + dayDiff) % 60;
  if (index < 0) index += 60;
  
  return SIXTY_CYCLE[index];
}

function calculateHourPillar(dayPillar, hour) {
  const dayStem = dayPillar[0];
  
  // 시간대 인덱스
  let hourBranchIndex = 0;
  if (hour >= 23 || hour < 1) hourBranchIndex = 0; // 자시
  else if (hour >= 1 && hour < 3) hourBranchIndex = 1; // 축시
  else if (hour >= 3 && hour < 5) hourBranchIndex = 2; // 인시
  else if (hour >= 5 && hour < 7) hourBranchIndex = 3; // 묘시
  else if (hour >= 7 && hour < 9) hourBranchIndex = 4; // 진시
  else if (hour >= 9 && hour < 11) hourBranchIndex = 5; // 사시
  else if (hour >= 11 && hour < 13) hourBranchIndex = 6; // 오시
  else if (hour >= 13 && hour < 15) hourBranchIndex = 7; // 미시
  else if (hour >= 15 && hour < 17) hourBranchIndex = 8; // 신시
  else if (hour >= 17 && hour < 19) hourBranchIndex = 9; // 유시
  else if (hour >= 19 && hour < 21) hourBranchIndex = 10; // 술시
  else if (hour >= 21 && hour < 23) hourBranchIndex = 11; // 해시
  
  const hourStemArray = DAY_STEM_TO_HOUR_STEM[dayStem];
  const hourStem = hourStemArray[hourBranchIndex];
  
  const hourBranches = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
  const hourBranch = hourBranches[hourBranchIndex];
  
  return hourStem + hourBranch;
}

// 테스트 실행
console.log('=== 사주 계산 테스트 결과 ===\n');

// 테스트 1: 1971년 11월 17일 04:00
console.log('1. 1971년 11월 17일 04:00 (양력)');
console.log('----------------------------------------');

const year1 = calculateYearPillar(1971, 11, 17);
const month1 = calculateMonthPillar(1971, 11, 17);
const day1 = calculateDayPillar(1971, 11, 17);
const hour1 = calculateHourPillar(day1, 4);

console.log(`년주: ${year1}`);
console.log(`월주: ${month1}`);
console.log(`일주: ${day1}`);
console.log(`시주: ${hour1}`);
console.log(`사주: ${year1} ${month1} ${day1} ${hour1}\n`);

// 테스트 2: 1995년 9월 2일 04:00
console.log('2. 1995년 9월 2일 04:00 (양력)');
console.log('----------------------------------------');

const year2 = calculateYearPillar(1995, 9, 2);
const month2 = calculateMonthPillar(1995, 9, 2);
const day2 = calculateDayPillar(1995, 9, 2);
const hour2 = calculateHourPillar(day2, 4);

console.log(`년주: ${year2}`);
console.log(`월주: ${month2}`);
console.log(`일주: ${day2}`);
console.log(`시주: ${hour2}`);
console.log(`사주: ${year2} ${month2} ${day2} ${hour2}\n`);

console.log('========================================');
console.log('요약:');
console.log(`1971.11.17 04:00 → ${year1} ${month1} ${day1} ${hour1}`);
console.log(`1995.09.02 04:00 → ${year2} ${month2} ${day2} ${hour2}`);