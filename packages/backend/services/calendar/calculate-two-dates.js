const { calculateCompleteSaju } = require('./dist/utils/accurateSajuCalculator.js');

console.log('='.repeat(80));
console.log('요청하신 두 날짜의 사주 계산');
console.log('='.repeat(80));

// 첫 번째: 1971년 5월 12일 05:00 양력
console.log('\n📅 첫 번째 날짜');
console.log('   입력: 71.05.12 05:00 양력');
console.log('   해석: 1971년 5월 12일 5시 0분 (양력)');

const result1 = calculateCompleteSaju(1971, 5, 12, 5, 0, false);
console.log('   ➡️  계산된 사주: ' + result1.fullSaju);
console.log('');
console.log('   상세 분석:');
console.log('   년주: ' + result1.year.gan + result1.year.ji);
console.log('   월주: ' + result1.month.gan + result1.month.ji);
console.log('   일주: ' + result1.day.gan + result1.day.ji);
console.log('   시주: ' + result1.time.gan + result1.time.ji);

// 두 번째: 1976년 7월 15일 06:00 양력
console.log('\n' + '─'.repeat(60));
console.log('\n📅 두 번째 날짜');
console.log('   입력: 76.07.15 06:00 양력');
console.log('   해석: 1976년 7월 15일 6시 0분 (양력)');

const result2 = calculateCompleteSaju(1976, 7, 15, 6, 0, false);
console.log('   ➡️  계산된 사주: ' + result2.fullSaju);
console.log('');
console.log('   상세 분석:');
console.log('   년주: ' + result2.year.gan + result2.year.ji);
console.log('   월주: ' + result2.month.gan + result2.month.ji);
console.log('   일주: ' + result2.day.gan + result2.day.ji);
console.log('   시주: ' + result2.time.gan + result2.time.ji);

console.log('\n' + '='.repeat(80));
console.log('\n📊 계산 결과 요약:');
console.log('');
console.log('1️⃣  1971.05.12 05:00 양력 → ' + result1.fullSaju);
console.log('2️⃣  1976.07.15 06:00 양력 → ' + result2.fullSaju);
console.log('\n' + '='.repeat(80));