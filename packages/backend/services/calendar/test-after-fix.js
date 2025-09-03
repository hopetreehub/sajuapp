const { calculateCompleteSaju } = require('./dist/utils/accurateSajuCalculator.js');

console.log('='.repeat(80));
console.log('사주 계산 정확성 검증 (서머타임 로직 수정 후)');
console.log('='.repeat(80));

// 테스트 케이스들
const testCases = [
  {
    name: '1951.02.05 21:00 양력',
    year: 1951, month: 2, day: 5, hour: 21, minute: 0,
    expected: '신묘 경인 병자 무술',
    description: '21:00을 술시로 계산해야 함'
  },
  {
    name: '1988.09.18 20:00 양력 (서머타임)',
    year: 1988, month: 9, day: 18, hour: 20, minute: 0,
    expected: '무진 신유 병자 정유',
    description: '서머타임 적용: 20:00 → 19:00 → 정유'
  },
  {
    name: '1988.09.18 19:00 양력 (직접 표준시)',
    year: 1988, month: 9, day: 18, hour: 19, minute: 0,
    expected: '무진 신유 병자 정유',
    description: '서머타임 적용: 19:00 → 18:00 → 정유'
  },
  {
    name: '박준수: 1971.11.17 04:00 양력',
    year: 1971, month: 11, day: 17, hour: 4, minute: 0,
    expected: '신해 기해 병오 경인',
    description: '이미 검증된 정확한 사주'
  },
  {
    name: '정비제: 1976.09.16 09:00 양력',
    year: 1976, month: 9, day: 16, hour: 9, minute: 0,
    expected: '병진 정유 신미 계사',
    description: '이미 검증된 정확한 사주'
  }
];

console.log('\n📋 테스트 결과:\n');

testCases.forEach((test, index) => {
  console.log(`${index + 1}. ${test.name}`);
  console.log(`   설명: ${test.description}`);
  
  const result = calculateCompleteSaju(
    test.year, test.month, test.day, 
    test.hour, test.minute, false
  );
  
  console.log(`   계산: ${result.fullSaju}`);
  console.log(`   기대: ${test.expected}`);
  
  if (result.fullSaju === test.expected) {
    console.log(`   ✅ 정확함!\n`);
  } else {
    console.log(`   ❌ 불일치!\n`);
  }
});

console.log('='.repeat(80));