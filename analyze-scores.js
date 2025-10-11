/**
 * 레이더 차트 점수 계산 분석 스크립트
 * 실제 계산 로직을 로드하여 점수 분포를 분석
 */

// TypeScript 파일을 직접 import하기 위해 ts-node 필요
// 대신 계산 로직을 여기서 재구현하여 테스트

// 샘플 사주 데이터
const testSaju = {
  year: { gan: '갑', ji: '자' },
  month: { gan: '병', ji: '인' },
  day: { gan: '무', ji: '진' },
  time: { gan: '경', ji: '신' },
  ohHaengBalance: {
    목: 30,
    화: 25,
    토: 20,
    금: 15,
    수: 10,
  },
  fullSaju: '갑자 병인 무진 경신',
};

const birthYear = 1971;
const targetDate = new Date();

console.log('=== 📊 레이더 차트 점수 계산 분석 ===\n');
console.log('테스트 사주:', testSaju.fullSaju);
console.log('생년:', birthYear);
console.log('분석 날짜:', targetDate.toISOString().split('T')[0]);
console.log('\n--- 분석 목적 ---');
console.log('1. 기본 점수 범위 확인 (20-55로 조정됨)');
console.log('2. 시간대 보너스 범위 확인 (-20 ~ +20)');
console.log('3. 최종 점수 분포 확인 (20-75 예상)');
console.log('4. 시간대 점수가 기본 점수보다 높은 비율 확인\n');

// 간단한 점수 시뮬레이션
console.log('=== 🎲 점수 시뮬레이션 ===\n');

const systems = [
  { name: '순환계', base: 35 },
  { name: '호흡계', base: 42 },
  { name: '소화계', base: 28 },
  { name: '신경계', base: 51 },
  { name: '내분비계', base: 38 },
];

// 시간대 보너스 범위 테스트
const bonusMin = -20;
const bonusMax = +20;

console.log('시스템별 점수 분포 (시뮬레이션):');
console.log('─'.repeat(80));

let higherThanBaseCount = 0;
let totalScores = 0;

systems.forEach(system => {
  // 랜덤 보너스 생성 (-20 ~ +20)
  const todayBonus = Math.floor(Math.random() * (bonusMax - bonusMin + 1)) + bonusMin;
  const monthBonus = Math.floor(Math.random() * (bonusMax - bonusMin + 1)) + bonusMin;
  const yearBonus = Math.floor(Math.random() * (bonusMax - bonusMin + 1)) + bonusMin;

  const todayScore = Math.max(20, Math.min(90, system.base + todayBonus));
  const monthScore = Math.max(20, Math.min(90, system.base + monthBonus));
  const yearScore = Math.max(20, Math.min(90, system.base + yearBonus));

  console.log(`\n${system.name}:`);
  console.log(`  기본: ${system.base}점`);
  console.log(`  오늘: ${todayScore}점 (보너스 ${todayBonus >= 0 ? '+' : ''}${todayBonus}) ${todayScore > system.base ? '✅ 상승' : todayScore < system.base ? '📉 하락' : '➡️ 동일'}`);
  console.log(`  이달: ${monthScore}점 (보너스 ${monthBonus >= 0 ? '+' : ''}${monthBonus}) ${monthScore > system.base ? '✅ 상승' : monthScore < system.base ? '📉 하락' : '➡️ 동일'}`);
  console.log(`  올해: ${yearScore}점 (보너스 ${yearBonus >= 0 ? '+' : ''}${yearBonus}) ${yearScore > system.base ? '✅ 상승' : yearScore < system.base ? '📉 하락' : '➡️ 동일'}`);

  // 통계 수집
  totalScores += 3; // 오늘, 이달, 올해
  if (todayScore > system.base) higherThanBaseCount++;
  if (monthScore > system.base) higherThanBaseCount++;
  if (yearScore > system.base) higherThanBaseCount++;
});

console.log('\n' + '─'.repeat(80));
console.log('\n=== 📈 통계 분석 ===\n');
console.log(`시간대 점수가 기본보다 높은 경우: ${higherThanBaseCount} / ${totalScores} (${(higherThanBaseCount / totalScores * 100).toFixed(1)}%)`);
console.log(`예상 비율: ~50% (보너스가 -20~+20 범위로 균등 분포 시)`);

if (higherThanBaseCount / totalScores < 0.3) {
  console.log('\n⚠️ 경고: 시간대 점수 상승 비율이 30% 미만!');
  console.log('   원인 가능성:');
  console.log('   1. 기본 점수가 여전히 너무 높음 (현재 상한: 55)');
  console.log('   2. 시간대 보너스 범위가 너무 작음 (현재: -20~+20)');
  console.log('   3. 보너스 계산 로직에 문제가 있음');
} else if (higherThanBaseCount / totalScores > 0.7) {
  console.log('\n✅ 양호: 시간대 점수 상승 비율이 70% 이상!');
  console.log('   대부분의 시간대 점수가 기본보다 높게 표시됨');
} else {
  console.log('\n🔄 보통: 시간대 점수 상승 비율이 30-70%');
  console.log('   일부 시간대에서 기본보다 높은 점수 표시');
}

console.log('\n=== 🎯 실제 코드 분석 권장사항 ===\n');
console.log('1. 브라우저 콘솔에서 실제 점수 차이 확인');
console.log('2. calculateTimeBonus() 함수의 반환값 로그 추가');
console.log('3. 기본 점수와 보너스 점수의 실제 분포 측정');
console.log('4. 필요시 기본 점수 상한을 55 → 45로 추가 조정');
console.log('5. 또는 보너스 범위를 -20~+20 → -20~+30으로 확대\n');
