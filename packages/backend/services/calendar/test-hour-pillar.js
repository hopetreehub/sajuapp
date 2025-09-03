const { calculateCompleteSaju } = require('./dist/utils/accurateSajuCalculator.js');

console.log('='.repeat(80));
console.log('시주 계산 로직 분석 - 1951년 2월 5일 병자일');
console.log('='.repeat(80));

console.log('\n📊 시간별 시주 계산 (19:00 ~ 22:00)');
console.log('─'.repeat(60));

// 19시부터 22시까지 30분 단위로 계산
for (let hour = 19; hour <= 22; hour++) {
  for (let minute of [0, 30, 59]) {
    if (hour === 22 && minute === 59) continue; // 22:59는 건너뜀
    
    const result = calculateCompleteSaju(1951, 2, 5, hour, minute, false);
    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    
    console.log(`   ${timeStr} → ${result.time.gan}${result.time.ji} (${getShichen(hour, minute)})`);
  }
}

// 전통 시진 구분
function getShichen(hour, minute) {
  const shichens = [
    '자시(子時)', '축시(丑時)', '인시(寅時)', '묘시(卯時)',
    '진시(辰時)', '사시(巳時)', '오시(午時)', '미시(未時)',
    '신시(申時)', '유시(酉時)', '술시(戌時)', '해시(亥時)'
  ];
  
  let index;
  if (hour === 23 || hour === 0) {
    index = 0; // 자시
  } else if (hour === 1 || hour === 2) {
    index = 1; // 축시
  } else {
    // 전통적 계산: 홀수 시각에서 시진 변경
    index = Math.floor((hour + 1) / 2);
  }
  
  return shichens[index] || '?';
}

console.log('\n' + '='.repeat(80));
console.log('\n💡 분석 결과:');
console.log('   - 현재 로직: 21:00부터 해시(亥時)로 계산 → 기해');
console.log('   - 기대 결과: 21:00까지 술시(戌時)로 계산 → 무술');
console.log('\n   ⚠️  시진 경계 해석의 차이:');
console.log('   - 일부 만세력: 19:00-20:59 술시, 21:00-22:59 해시');
console.log('   - 다른 만세력: 19:00-21:00 술시, 21:00-23:00 해시');
console.log('\n' + '='.repeat(80));