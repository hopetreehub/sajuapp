const { calculateCompleteSaju } = require('./dist/utils/accurateSajuCalculator.js');

console.log('='.repeat(80));
console.log('1988년 9월 18일 서머타임 적용 테스트');
console.log('='.repeat(80));

console.log('\n📅 1988년 한국 서머타임 정보:');
console.log('   기간: 1988년 5월 8일 ~ 10월 9일');
console.log('   효과: 표준시보다 1시간 빠르게 (시계를 1시간 앞으로)');
console.log('');
console.log('   💡 서머타임 중 20:00 (서머타임) = 19:00 (표준시)');
console.log('   사주는 표준시 기준으로 계산해야 함');

console.log('\n' + '─'.repeat(60));
console.log('\n현재 계산 로직 확인:');

// 현재 로직으로 계산
const result20 = calculateCompleteSaju(1988, 9, 18, 20, 0, false);
console.log('\n1) 입력: 20:00 (서머타임)');
console.log('   현재 계산: ' + result20.fullSaju);
console.log('   시주: ' + result20.time.gan + result20.time.ji);

// 19시로 직접 계산 (표준시)
const result19 = calculateCompleteSaju(1988, 9, 18, 19, 0, false);
console.log('\n2) 입력: 19:00 (표준시로 직접 입력)');
console.log('   계산 결과: ' + result19.fullSaju);
console.log('   시주: ' + result19.time.gan + result19.time.ji);

// 18시 계산
const result18 = calculateCompleteSaju(1988, 9, 18, 18, 0, false);
console.log('\n3) 입력: 18:00');
console.log('   계산 결과: ' + result18.fullSaju);
console.log('   시주: ' + result18.time.gan + result18.time.ji);

console.log('\n' + '─'.repeat(60));
console.log('\n💡 분석:');
console.log('   기대값: 무진 신유 병자 정유');
console.log('');

if (result20.fullSaju === '무진 신유 병자 정유') {
  console.log('   ✅ 현재 서머타임 로직이 올바르게 작동하고 있습니다!');
} else if (result19.fullSaju === '무진 신유 병자 정유') {
  console.log('   ⚠️  서머타임 로직이 반대로 적용되고 있을 가능성');
  console.log('   현재: hour - 1 (20시 → 19시)');
  console.log('   수정 필요: hour + 1 또는 로직 재검토');
} else if (result18.fullSaju === '무진 신유 병자 정유') {
  console.log('   ⚠️  18:00이 정유 시주');
}

console.log('\n' + '─'.repeat(60));
console.log('\n📋 병자일의 시주표 (17-21시):');
console.log('   17:00-18:59 → 유시 → 정유 (丁酉)');
console.log('   19:00-20:59 → 술시 → 무술 (戊戌)');
console.log('   21:00-22:59 → 해시 → 기해 (己亥)');

console.log('\n' + '='.repeat(80));

// 서머타임 없이 계산하는 함수
function calculateWithoutSummerTime(year, month, day, hour, minute) {
  // 여기서는 직접 계산 로직을 구현해야 하지만,
  // 현재는 서머타임 기간 외의 날짜로 테스트
  const testDate = new Date(1988, 11, 1); // 12월 1일 (서머타임 종료 후)
  return calculateCompleteSaju(1988, 12, 1, hour, minute, false);
}

console.log('\n참고: 서머타임 종료 후 날짜로 시주 패턴 확인');
console.log('1988년 12월 1일 (서머타임 종료 후):');
const dec1 = calculateCompleteSaju(1988, 12, 1, 20, 0, false);
console.log('   20:00 → ' + dec1.time.gan + dec1.time.ji);