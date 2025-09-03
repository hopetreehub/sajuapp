// checkNeedsSummerTime 함수를 직접 테스트
function checkNeedsSummerTime(year, month, day) {
    const summerTimePeriods = [
        { year: 1987, start: [5, 10], end: [10, 11] },
        { year: 1988, start: [5, 8], end: [10, 9] },
        { year: 1960, start: [5, 1], end: [9, 18] },
        { year: 1961, start: [5, 1], end: [9, 30] },
        { year: 1962, start: [5, 1], end: [9, 30] },
        { year: 1963, start: [5, 1], end: [9, 30] },
        { year: 1964, start: [5, 10], end: [9, 20] },
        { year: 1965, start: [5, 10], end: [9, 20] },
        { year: 1966, start: [5, 10], end: [9, 20] },
        { year: 1967, start: [5, 10], end: [10, 1] },
        { year: 1968, start: [5, 10], end: [10, 1] },
        { year: 1969, start: [5, 10], end: [10, 1] },
        { year: 1948, start: [6, 1], end: [9, 13] },
        { year: 1949, start: [4, 3], end: [9, 11] },
        { year: 1950, start: [4, 1], end: [9, 10] },
        { year: 1951, start: [5, 6], end: [9, 9] }
    ];
    
    const period = summerTimePeriods.find(p => p.year === year);
    if (!period) return false;
    
    const currentDate = new Date(year, month - 1, day);
    const startDate = new Date(year, period.start[0] - 1, period.start[1]);
    const endDate = new Date(year, period.end[0] - 1, period.end[1]);
    
    return currentDate >= startDate && currentDate <= endDate;
}

console.log('='.repeat(80));
console.log('서머타임 체크 함수 테스트');
console.log('='.repeat(80));

// 1988년 9월 18일 테스트
console.log('\n1988년 9월 18일 서머타임 체크:');
const result1988 = checkNeedsSummerTime(1988, 9, 18);
console.log('   결과:', result1988 ? '✅ 서머타임 적용' : '❌ 서머타임 미적용');
console.log('   기간: 1988년 5월 8일 ~ 10월 9일');

// 경계 날짜 테스트
console.log('\n경계 날짜 테스트:');
console.log('   1988년 5월 7일:', checkNeedsSummerTime(1988, 5, 7) ? '✅' : '❌');
console.log('   1988년 5월 8일:', checkNeedsSummerTime(1988, 5, 8) ? '✅' : '❌');
console.log('   1988년 10월 9일:', checkNeedsSummerTime(1988, 10, 9) ? '✅' : '❌');
console.log('   1988년 10월 10일:', checkNeedsSummerTime(1988, 10, 10) ? '✅' : '❌');

console.log('\n' + '='.repeat(80));

// 실제 계산 테스트
const { calculateCompleteSaju } = require('./dist/utils/accurateSajuCalculator.js');

console.log('\n실제 계산 함수에서 서머타임 적용 확인:');
console.log('\n1988년 9월 18일 계산:');

// 디버깅을 위해 시간별로 계산
for (let hour = 18; hour <= 21; hour++) {
    const result = calculateCompleteSaju(1988, 9, 18, hour, 0, false);
    console.log(`   ${hour}:00 → ${result.time.gan}${result.time.ji}`);
}

console.log('\n💡 분석:');
console.log('   - checkNeedsSummerTime 함수는 true를 반환해야 함');
console.log('   - 20:00 입력 시 19:00으로 조정되어 정유가 나와야 함');
console.log('   - 현재 20:00 → 무술이 나오므로 서머타임이 미적용됨');

console.log('\n' + '='.repeat(80));