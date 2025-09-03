const { calculateCompleteSaju } = require('./dist/utils/accurateSajuCalculator.js');

console.log('='.repeat(80));
console.log('1951년 2월 5일 21:00 사주 정확성 검증');
console.log('='.repeat(80));

console.log('\n📅 검증 대상');
console.log('   날짜: 1951년 2월 5일 21시 0분 (양력)');
console.log('   기대 사주: 신묘 경인 병자 무술');

// 21시는 술시(戌時: 19-21시) 또는 해시(亥時: 21-23시) 경계
// 정확히 21시면 해시의 시작
console.log('\n⏰ 시간대별 계산');

// 20:00 계산 (술시 중간)
console.log('\n1) 20:00 (술시 戌時)');
const result20 = calculateCompleteSaju(1951, 2, 5, 20, 0, false);
console.log('   사주: ' + result20.fullSaju);

// 20:30 계산
console.log('\n2) 20:30 (술시 戌時)');
const result2030 = calculateCompleteSaju(1951, 2, 5, 20, 30, false);
console.log('   사주: ' + result2030.fullSaju);

// 21:00 계산
console.log('\n3) 21:00 (해시 亥時 시작)');
const result21 = calculateCompleteSaju(1951, 2, 5, 21, 0, false);
console.log('   사주: ' + result21.fullSaju);

// 21:30 계산
console.log('\n4) 21:30 (해시 亥時)');
const result2130 = calculateCompleteSaju(1951, 2, 5, 21, 30, false);
console.log('   사주: ' + result2130.fullSaju);

// 22:00 계산
console.log('\n5) 22:00 (해시 亥時)');
const result22 = calculateCompleteSaju(1951, 2, 5, 22, 0, false);
console.log('   사주: ' + result22.fullSaju);

console.log('\n' + '='.repeat(80));
console.log('📊 검증 결과:');
console.log('   기대값: 신묘 경인 병자 무술');
console.log('   21:00 계산값: ' + result21.fullSaju);

if (result21.fullSaju === '신묘 경인 병자 무술') {
  console.log('   ✅ 일치! 계산이 정확합니다.');
} else {
  console.log('   ❌ 불일치. 시주 계산 로직을 확인해야 합니다.');
  console.log('\n   💡 무술 시주가 나오려면:');
  console.log('   - 병자일의 무술시는 19:00-21:00 (술시)');
  console.log('   - 현재 21:00은 해시로 계산되어 "기해"가 나옴');
  
  // 20시 계산 결과 확인
  if (result20.fullSaju === '신묘 경인 병자 무술' || result2030.fullSaju === '신묘 경인 병자 무술') {
    console.log('\n   ℹ️  20:00-20:59 시간대가 무술 시주입니다.');
  }
}

console.log('\n' + '='.repeat(80));

// 시주 대조표 출력
console.log('\n📋 병자일(丙子日)의 시주 대조표:');
console.log('   23:00-01:00 → 무자(戊子)');
console.log('   01:00-03:00 → 기축(己丑)');  
console.log('   03:00-05:00 → 경인(庚寅)');
console.log('   05:00-07:00 → 신묘(辛卯)');
console.log('   07:00-09:00 → 임진(壬辰)');
console.log('   09:00-11:00 → 계사(癸巳)');
console.log('   11:00-13:00 → 갑오(甲午)');
console.log('   13:00-15:00 → 을미(乙未)');
console.log('   15:00-17:00 → 병신(丙申)');
console.log('   17:00-19:00 → 정유(丁酉)');
console.log('   19:00-21:00 → 무술(戊戌)'); 
console.log('   21:00-23:00 → 기해(己亥)');

console.log('\n' + '='.repeat(80));