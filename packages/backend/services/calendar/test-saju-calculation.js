const { calculateCompleteSaju } = require('./dist/utils/accurateSajuCalculator.js');

console.log('='.repeat(80));
console.log('사주 계산 테스트');
console.log('='.repeat(80));

// 테스트할 날짜들
const testCases = [
  {
    name: '정비제 (현재 DB)',
    year: 1976,
    month: 9, 
    day: 16,
    hour: 9,
    minute: 40,
    isLunar: false
  },
  {
    name: '테스트1',
    year: 1971,
    month: 5,
    day: 12,
    hour: 5,
    minute: 0,
    isLunar: false
  },
  {
    name: '테스트2 (정비제님 정확한 생일?)',
    year: 1976,
    month: 7,
    day: 15,
    hour: 6,
    minute: 0,
    isLunar: false
  }
];

testCases.forEach(test => {
  console.log('\n' + '─'.repeat(60));
  console.log(`📅 ${test.name}`);
  console.log(`   생년월일시: ${test.year}년 ${test.month}월 ${test.day}일 ${test.hour}시 ${test.minute}분 (${test.isLunar ? '음력' : '양력'})`);
  
  const result = calculateCompleteSaju(
    test.year,
    test.month, 
    test.day,
    test.hour,
    test.minute,
    test.isLunar
  );
  
  if (result) {
    // fullSaju를 사용하거나 gan/ji로 직접 조합
    const fourPillars = result.fullSaju || 
      `${result.year.gan}${result.year.ji} ${result.month.gan}${result.month.ji} ${result.day.gan}${result.day.ji} ${result.time.gan}${result.time.ji}`;
    console.log(`   ➡️  사주: ${fourPillars}`);
    
    // 정비제님의 정확한 사주와 비교
    if (test.name.includes('정비제')) {
      const expected = '병진 정유 신미 계사';
      if (fourPillars === expected) {
        console.log(`   ✅ 정확함! (기대값: ${expected})`);
      } else {
        console.log(`   ❌ 불일치! (기대값: ${expected})`);
      }
    }
  } else {
    console.log('   ❌ 계산 실패');
  }
});

console.log('\n' + '='.repeat(80));