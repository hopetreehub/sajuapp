// Quick test for saju calculation without complex imports

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

// Modified getSolarMonth function (corrected version)
function getSolarMonth(year, month, day) {
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
  
  const solarMonth = getSolarMonth(year, month, day);
  
  const monthStemArray = YEAR_STEM_TO_MONTH_STEM[yearStem];
  const monthStem = monthStemArray[solarMonth - 1];
  
  const monthBranches = ['인', '묘', '진', '사', '오', '미', '신', '유', '술', '해', '자', '축'];
  const monthBranch = monthBranches[solarMonth - 1];
  
  return monthStem + monthBranch;
}

console.log('=== 수정된 사주 계산기 테스트 ===');

// Test 1: 1971년 11월 17일
console.log('\n1. 1971년 11월 17일 테스트');
console.log('정답: 신해 기해 병오 경인');

const year1 = calculateYearPillar(1971, 11, 17);
const month1 = calculateMonthPillar(1971, 11, 17);
console.log(`년주: ${year1}`);
console.log(`월주: ${month1}`);
console.log(`solarMonth for 1971.11.17: ${getSolarMonth(1971, 11, 17)}`);

// Test 2: 1995년 9월 2일
console.log('\n2. 1995년 9월 2일 테스트');
console.log('정답: 을해 갑신 병신 경인');

const year2 = calculateYearPillar(1995, 9, 2);
const month2 = calculateMonthPillar(1995, 9, 2);
console.log(`년주: ${year2}`);
console.log(`월주: ${month2}`);
console.log(`solarMonth for 1995.09.02: ${getSolarMonth(1995, 9, 2)}`);

console.log('\n=== 분석 ===');
console.log('1971.11.17:')
console.log(`  11월 17일 → 입동 이후? ${17 >= 7 ? '예' : '아니오'} → ${17 >= 7 ? '해월(10월)' : '술월(9월)'}`);
console.log(`  신년의 해월 → 신: [경,신,임,계,갑,을,병,정,무,기,경,신] → 10번째(index 9) → 기`);

console.log('1995.09.02:')
console.log(`  9월 2일 → 백로 이후? ${2 >= 8 ? '예' : '아니오'} → ${2 >= 8 ? '유월(8월)' : '신월(7월)'}`);
console.log(`  을년의 신월 → 을: [무,기,경,신,임,계,갑,을,병,정,무,기] → 7번째(index 6) → 갑`);