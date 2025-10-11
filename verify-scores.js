/**
 * 점수 계산 검증 스크립트
 * Node.js에서 직접 실행하여 점수 변화 확인
 */

// 간단한 시뮬레이션
console.log('=== 📊 점수 계산 검증 ===\n');

// 기본 점수 범위: 20-55
const baseScores = [35, 42, 28, 51, 38, 45, 33, 48, 30, 40, 37, 44];

console.log('기본 점수 샘플 (20-55 범위):');
console.log(baseScores.join(', '));
console.log(`평균: ${(baseScores.reduce((a,b) => a+b) / baseScores.length).toFixed(1)}`);
console.log(`최소: ${Math.min(...baseScores)}, 최대: ${Math.max(...baseScores)}\n`);

// 보너스 계산 시뮬레이션
console.log('보너스 계산 (계수 1.0x, 범위 ±30):');
console.log('─'.repeat(80));

const systems = [
  { name: '순환계', base: 35 },
  { name: '호흡계', base: 42 },
  { name: '소화계', base: 28 },
  { name: '신경계', base: 51 },
  { name: '내분비계', base: 38 },
];

let aboveBaseCount = 0;
let totalChecks = 0;

systems.forEach(system => {
  // 대운/세운/월운/일운 점수 시뮬레이션 (20-80 범위)
  const daeunScore = 20 + Math.floor(Math.random() * 61);
  const seunScore = 20 + Math.floor(Math.random() * 61);
  const monthScore = 20 + Math.floor(Math.random() * 61);
  const dayScore = 20 + Math.floor(Math.random() * 61);

  // 보너스 계산 (중간값 40 기준, 계수 1.0)
  const daeunBonus = (daeunScore - 40) * 1.0;
  const seunBonus = (seunScore - 40) * 1.0;
  const monthBonus = (monthScore - 40) * 1.0;
  const dayBonus = (dayScore - 40) * 1.0;

  // 시간대별 가중치 적용
  const todayBonus = dayBonus * 0.35 + monthBonus * 0.20 + daeunBonus * 0.15 + seunBonus * 0.10;
  const thisMonthBonus = monthBonus * 0.30 + daeunBonus * 0.20 + seunBonus * 0.15 + dayBonus * 0.10;
  const thisYearBonus = seunBonus * 0.30 + daeunBonus * 0.30 + monthBonus * 0.05 + dayBonus * 0.05;

  // 보너스 범위 제한 (-30 ~ +30)
  const todayBonusCapped = Math.max(-30, Math.min(30, Math.round(todayBonus)));
  const monthBonusCapped = Math.max(-30, Math.min(30, Math.round(thisMonthBonus)));
  const yearBonusCapped = Math.max(-30, Math.min(30, Math.round(thisYearBonus)));

  // 최종 점수 (base + bonus, 20-90 범위)
  const todayScore = Math.max(20, Math.min(90, system.base + todayBonusCapped));
  const monthScore_final = Math.max(20, Math.min(90, system.base + monthBonusCapped));
  const yearScore = Math.max(20, Math.min(90, system.base + yearBonusCapped));

  console.log(`\n${system.name}:`);
  console.log(`  기본: ${system.base}점`);
  console.log(`  오늘: ${todayScore}점 (보너스 ${todayBonusCapped >= 0 ? '+' : ''}${todayBonusCapped}) ${todayScore > system.base ? '✅ 상승' : todayScore < system.base ? '📉 하락' : '➡️ 동일'}`);
  console.log(`  이달: ${monthScore_final}점 (보너스 ${monthBonusCapped >= 0 ? '+' : ''}${monthBonusCapped}) ${monthScore_final > system.base ? '✅ 상승' : monthScore_final < system.base ? '📉 하락' : '➡️ 동일'}`);
  console.log(`  올해: ${yearScore}점 (보너스 ${yearBonusCapped >= 0 ? '+' : ''}${yearBonusCapped}) ${yearScore > system.base ? '✅ 상승' : yearScore < system.base ? '📉 하락' : '➡️ 동일'}`);

  // 통계
  totalChecks += 3;
  if (todayScore > system.base) aboveBaseCount++;
  if (monthScore_final > system.base) aboveBaseCount++;
  if (yearScore > system.base) aboveBaseCount++;

  console.log(`  상세: 대운=${daeunScore} 세운=${seunScore} 월운=${monthScore} 일운=${dayScore}`);
});

console.log('\n' + '─'.repeat(80));
console.log('\n=== 📈 통계 분석 ===\n');
console.log(`시간대 점수가 기본보다 높은 경우: ${aboveBaseCount} / ${totalChecks} (${(aboveBaseCount / totalChecks * 100).toFixed(1)}%)`);

if (aboveBaseCount / totalChecks < 0.3) {
  console.log('\n⚠️ 경고: 상승 비율 30% 미만 - 여전히 문제 있음');
} else if (aboveBaseCount / totalChecks > 0.6) {
  console.log('\n✅ 양호: 상승 비율 60% 이상 - 변화가 명확함');
} else {
  console.log('\n🔄 보통: 상승 비율 30-60% - 일부 변화 감지됨');
}

console.log('\n=== 🎯 예상 결과 ===\n');
console.log('• 기본 점수: 20-55 (이전 20-70에서 낮춰짐)');
console.log('• 보너스 계수: 1.0x (이전 0.5x에서 2배 증가)');
console.log('• 보너스 범위: ±30 (이전 ±20에서 50% 확대)');
console.log('• 최종 점수: 20-85 (기본 55 + 보너스 30 = 85)');
console.log('• 기대 변화폭: 10~30점 (이전 2~5점에서 대폭 증가)\n');
