const { calculateCompleteSaju } = require('./dist/utils/accurateSajuCalculator.js');

console.log('='.repeat(80));
console.log('1988년 9월 18일 20:00 양력 사주 계산');
console.log('='.repeat(80));

console.log('\n📅 입력 정보');
console.log('   입력: 88.09.18 20:00 양력');
console.log('   해석: 1988년 9월 18일 20시 0분 (양력)');

const result = calculateCompleteSaju(1988, 9, 18, 20, 0, false);

console.log('\n📊 계산 결과');
console.log('   ➡️  사주: ' + result.fullSaju);
console.log('');
console.log('   상세 분석:');
console.log('   년주 (年柱): ' + result.year.gan + result.year.ji);
console.log('   월주 (月柱): ' + result.month.gan + result.month.ji);
console.log('   일주 (日柱): ' + result.day.gan + result.day.ji);
console.log('   시주 (時柱): ' + result.time.gan + result.time.ji);

// 오행 분석
if (result.ohHaengBalance) {
  console.log('\n   오행 균형:');
  console.log('   - 목(木): ' + (result.ohHaengBalance['목'] || 0) + '%');
  console.log('   - 화(火): ' + (result.ohHaengBalance['화'] || 0) + '%');
  console.log('   - 토(土): ' + (result.ohHaengBalance['토'] || 0) + '%');
  console.log('   - 금(金): ' + (result.ohHaengBalance['금'] || 0) + '%');
  console.log('   - 수(水): ' + (result.ohHaengBalance['수'] || 0) + '%');
}

console.log('\n' + '='.repeat(80));