const path = require('path');
const Database = require('better-sqlite3');
const { calculateCompleteSaju } = require('./dist/utils/accurateSajuCalculator.js');

// Customer database path
const dbPath = path.join(__dirname, '../customer/customers.db');
const db = new Database(dbPath);

console.log('='.repeat(80));
console.log('🔮 완성된 정확한 사주 계산 로직 적용');
console.log('📅 서머타임 자동 적용, 정확한 만세력 기준');
console.log('='.repeat(80));

console.log(`\n📂 Database: ${dbPath}`);

// 모든 고객 조회
const customers = db.prepare('SELECT * FROM customers ORDER BY id').all();

console.log(`\n🔄 총 ${customers.length}명의 고객 사주 재계산 시작...\n`);

let updated = 0;
let alreadyCorrect = 0;
let errors = 0;

customers.forEach((customer, index) => {
  console.log('='.repeat(60));
  
  try {
    console.log(`\n${index + 1}. 처리 중: ${customer.name}`);
    
    // 생년월일시 파싱
    const [year, month, day] = customer.birth_date.split('-').map(Number);
    const [hour, minute] = customer.birth_time.split(':').map(Number);
    const isLunar = customer.lunar_solar === 'lunar';
    
    console.log(`   📅 생년월일시: ${year}년 ${month}월 ${day}일 ${hour}시 ${minute || 0}분 (${isLunar ? '음력' : '양력'})`);
    
    // 기존 사주 데이터 확인
    let oldSaju = null;
    if (customer.saju_data) {
      try {
        const oldData = JSON.parse(customer.saju_data);
        oldSaju = oldData.fullSaju || `${oldData.year.gan}${oldData.year.ji} ${oldData.month.gan}${oldData.month.ji} ${oldData.day.gan}${oldData.day.ji} ${oldData.time.gan}${oldData.time.ji}`;
      } catch (e) {
        oldSaju = '파싱 오류';
      }
    }
    
    // 완성된 로직으로 새로 계산
    const accurateSaju = calculateCompleteSaju(year, month, day, hour, minute || 0, isLunar);
    
    console.log(`   ❌ 기존: ${oldSaju || '없음'}`);
    console.log(`   ✅ 정확: ${accurateSaju.fullSaju}`);
    
    // 서머타임 적용 여부 표시
    const needsSummerTime = checkNeedsSummerTime(year, month, day);
    if (needsSummerTime) {
      console.log(`   🕐 서머타임 자동 적용됨 (${hour}시 → ${hour-1}시로 계산)`);
    }
    
    // 변경 여부 확인
    if (oldSaju === accurateSaju.fullSaju) {
      console.log(`   ℹ️  이미 정확함 - 업데이트 불필요`);
      alreadyCorrect++;
    } else {
      // 데이터베이스 업데이트
      console.log(`   🔄 업데이트 중...`);
      
      const stmt = db.prepare(`
        UPDATE customers 
        SET saju_data = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);
      
      const result = stmt.run(JSON.stringify(accurateSaju), customer.id);
      
      if (result.changes > 0) {
        console.log(`   ✅ 업데이트 완료!`);
        updated++;
      } else {
        console.log(`   ❌ 업데이트 실패`);
        errors++;
      }
    }
    
  } catch (error) {
    console.log(`   💥 오류 발생: ${customer.name} - ${error.message}`);
    errors++;
  }
});

// 서머타임 체크 함수 (중복 정의)
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

console.log('\n' + '='.repeat(80));
console.log('\n📊 최종 재계산 완료 통계:');
console.log(`\n   ✅ 업데이트됨: ${updated}명`);
console.log(`   ℹ️  이미 정확함: ${alreadyCorrect}명`);
console.log(`   ❌ 오류 발생: ${errors}명`);
console.log(`   📊 전체 처리: ${customers.length}명`);

console.log('\n='.repeat(80));

// 최종 검증 (처음 3명)
console.log('\n📝 최종 검증 (처음 3명):');
const verifyCustomers = db.prepare('SELECT * FROM customers ORDER BY id LIMIT 3').all();

verifyCustomers.forEach(customer => {
  const saju = JSON.parse(customer.saju_data);
  console.log(`   ${customer.name}: ${saju.fullSaju}`);
});

console.log('\n✨ 정확한 만세력 기반 사주 계산 시스템 완성!');
console.log('🔮 서머타임 자동 적용, 모든 고객 데이터 최신화 완료');

db.close();