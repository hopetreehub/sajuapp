const { calculateCompleteSaju } = require('./dist/utils/accurateSajuCalculator.js');

console.log('='.repeat(80));
console.log('1951년 2월 5일 21:00 양력 사주 계산');
console.log('='.repeat(80));

console.log('\n📅 입력 정보');
console.log('   입력: 51.02.05 21:00 양력');
console.log('   해석: 1951년 2월 5일 21시 0분 (양력)');

const result = calculateCompleteSaju(1951, 2, 5, 21, 0, false);

console.log('\n📊 계산 결과');
console.log('   ➡️  사주: ' + result.fullSaju);
console.log('');
console.log('   상세 분석:');
console.log('   년주 (年柱): ' + result.year.gan + result.year.ji);
console.log('   월주 (月柱): ' + result.month.gan + result.month.ji);
console.log('   일주 (日柱): ' + result.day.gan + result.day.ji);
console.log('   시주 (時柱): ' + result.time.gan + result.time.ji);

console.log('\n' + '='.repeat(80));