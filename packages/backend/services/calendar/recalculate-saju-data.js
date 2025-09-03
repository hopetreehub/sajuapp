const Database = require('better-sqlite3');
const path = require('path');
const { calculateCompleteSaju } = require('./dist/utils/accurateSajuCalculator.js');

// Database path - customers.db in customer service directory
const dbPath = path.join(__dirname, '../customer/customers.db');
console.log('Database path:', dbPath);
const db = new Database(dbPath);

// Check available tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Available tables:', tables.map(t => t.name).join(', '));

// 모든 고객 데이터 조회
const customers = db.prepare('SELECT * FROM customers').all();

console.log(`\n🔄 총 ${customers.length}명의 고객 사주 재계산 시작...\n`);
console.log('='.repeat(80));

let updatedCount = 0;
let alreadyCorrectCount = 0;
let errorCount = 0;

for (const customer of customers) {
  try {
    // 생년월일 처리 - 다양한 형식 대응
    let birthDate = customer.birth_date;
    // "197609-09-16" 같은 형식 처리
    if (birthDate.includes('-') && birthDate.length > 10) {
      // 첫 6자리를 년도로 처리
      const yearPart = birthDate.substring(0, 4);
      const remainPart = birthDate.substring(4);
      birthDate = yearPart + remainPart;
    }
    
    // 날짜 파싱
    const dateParts = birthDate.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]);
    const day = parseInt(dateParts[2]);
    
    // 시간 파싱
    const [hour, minute] = customer.birth_time.split(':').map(Number);
    const isLunar = customer.lunar_solar === 'lunar';
    
    console.log(`\n처리 중: ${customer.name}`);
    console.log(`  생년월일시: ${year}년 ${month}월 ${day}일 ${hour}시 ${minute}분 (${isLunar ? '음력' : '양력'})`);
    
    // 정확한 사주 계산
    const accurateSaju = calculateCompleteSaju(year, month, day, hour, minute || 0, isLunar);
    
    // 기존 데이터와 비교
    let oldSaju = null;
    let oldSajuText = 'N/A';
    
    try {
      oldSaju = customer.saju_data ? JSON.parse(customer.saju_data) : null;
      oldSajuText = oldSaju?.fullSaju || 'N/A';
    } catch (e) {
      console.log(`  ⚠️  기존 사주 데이터 파싱 실패`);
    }
    
    const newSajuText = accurateSaju.fullSaju;
    
    if (newSajuText !== oldSajuText) {
      console.log(`  ❌ 기존: ${oldSajuText}`);
      console.log(`  ✅ 정확: ${newSajuText}`);
      console.log(`  🔄 업데이트 중...`);
      
      // 데이터베이스 업데이트
      const updateStmt = db.prepare(`
        UPDATE customers 
        SET saju_data = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);
      
      updateStmt.run(JSON.stringify(accurateSaju), customer.id);
      updatedCount++;
      console.log(`  ✅ 업데이트 완료!`);
    } else {
      console.log(`  ✅ 이미 정확함: ${newSajuText}`);
      alreadyCorrectCount++;
    }
    
  } catch (error) {
    console.error(`\n❌ ${customer.name} 계산 실패:`, error.message);
    errorCount++;
  }
}

console.log('\n' + '='.repeat(80));
console.log('\n📊 사주 재계산 완료 통계:\n');
console.log(`  ✅ 업데이트됨: ${updatedCount}명`);
console.log(`  ✅ 이미 정확함: ${alreadyCorrectCount}명`);
console.log(`  ❌ 오류 발생: ${errorCount}명`);
console.log(`  📊 전체 처리: ${customers.length}명`);
console.log('\n' + '='.repeat(80));

// 업데이트된 데이터 검증
if (updatedCount > 0) {
  console.log('\n📝 업데이트된 고객 검증:');
  const verifyStmt = db.prepare('SELECT name, saju_data FROM customers WHERE id IN (' + 
    customers.filter((c, i) => i < updatedCount).map(c => c.id).join(',') + ')');
  
  const updated = db.prepare('SELECT name, birth_date, birth_time, saju_data FROM customers').all();
  
  console.log('\n최종 검증 (처음 3명):');
  for (let i = 0; i < Math.min(3, updated.length); i++) {
    const customer = updated[i];
    try {
      const saju = JSON.parse(customer.saju_data);
      console.log(`  ${customer.name}: ${saju.fullSaju}`);
    } catch (e) {
      console.log(`  ${customer.name}: 사주 데이터 없음`);
    }
  }
}

db.close();
console.log('\n✨ 모든 작업이 완료되었습니다!\n');