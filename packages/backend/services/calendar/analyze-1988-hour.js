const { calculateCompleteSaju } = require('./dist/utils/accurateSajuCalculator.js');

console.log('='.repeat(80));
console.log('1988년 9월 18일 시주 불일치 분석');
console.log('='.repeat(80));

console.log('\n📅 검증 대상');
console.log('   날짜: 1988년 9월 18일 20:00 (양력)');
console.log('   현재 계산: 무진 신유 병자 무술');
console.log('   기대 결과: 무진 신유 병자 정유');
console.log('   차이점: 시주가 무술(戊戌) → 정유(丁酉) 여야 함');

console.log('\n' + '─'.repeat(60));
console.log('\n📊 시간대별 시주 확인 (17:00 ~ 22:00)');

for (let hour = 17; hour <= 22; hour++) {
  const result = calculateCompleteSaju(1988, 9, 18, hour, 0, false);
  console.log(`   ${String(hour).padStart(2, '0')}:00 → ${result.time.gan}${result.time.ji}`);
}

console.log('\n' + '─'.repeat(60));
console.log('\n📋 병자일(丙子日)의 정확한 시주 대조표:');
console.log('   일간이 丙(병화)일 때 시주 계산:');
console.log('');
console.log('   시간        시지     일간+시지 → 시간');
console.log('   ─────────────────────────────────');
console.log('   23-01시 → 자(子) → 병+자 = 무자(戊子)');
console.log('   01-03시 → 축(丑) → 병+축 = 기축(己丑)');
console.log('   03-05시 → 인(寅) → 병+인 = 경인(庚寅)');
console.log('   05-07시 → 묘(卯) → 병+묘 = 신묘(辛卯)');
console.log('   07-09시 → 진(辰) → 병+진 = 임진(壬辰)');
console.log('   09-11시 → 사(巳) → 병+사 = 계사(癸巳)');
console.log('   11-13시 → 오(午) → 병+오 = 갑오(甲午)');
console.log('   13-15시 → 미(未) → 병+미 = 을미(乙未)');
console.log('   15-17시 → 신(申) → 병+신 = 병신(丙申)');
console.log('   17-19시 → 유(酉) → 병+유 = 정유(丁酉) ← 기대값!');
console.log('   19-21시 → 술(戌) → 병+술 = 무술(戊戌) ← 현재 계산');
console.log('   21-23시 → 해(亥) → 병+해 = 기해(己亥)');

console.log('\n' + '─'.repeat(60));
console.log('\n💡 분석 결과:');
console.log('   문제: 20:00는 술시(19-21시)로 "무술"이 맞음');
console.log('   "정유"가 나오려면: 17:00-18:59 사이여야 함');
console.log('');
console.log('   가능한 원인:');
console.log('   1. 실제 시간이 18시였을 가능성');
console.log('   2. 서머타임 적용 문제');
console.log('   3. 다른 시주 계산 방식 사용');

// 서머타임 확인
console.log('\n' + '─'.repeat(60));
console.log('\n🕐 서머타임 검증:');

// 1988년 한국은 서머타임 적용 (5월 8일 ~ 10월 9일)
const summerTimeStart = new Date(1988, 4, 8); // 5월 8일
const summerTimeEnd = new Date(1988, 9, 9);   // 10월 9일
const targetDate = new Date(1988, 8, 18);      // 9월 18일

if (targetDate >= summerTimeStart && targetDate <= summerTimeEnd) {
  console.log('   ✅ 1988년 9월 18일은 서머타임 기간입니다!');
  console.log('   서머타임 적용 시: 20:00 → 19:00로 계산');
  
  // 19시로 재계산
  const result19 = calculateCompleteSaju(1988, 9, 18, 19, 0, false);
  console.log('   19:00 계산 결과: ' + result19.fullSaju);
  
  // 18시로도 계산
  const result18 = calculateCompleteSaju(1988, 9, 18, 18, 0, false);
  console.log('   18:00 계산 결과: ' + result18.fullSaju);
} else {
  console.log('   ❌ 서머타임 기간이 아닙니다.');
}

console.log('\n' + '='.repeat(80));