const path = require('path');
const Database = require('better-sqlite3');
const { calculateCompleteSaju } = require('./dist/utils/accurateSajuCalculator.js');

// Customer database path
const dbPath = path.join(__dirname, '../customer/customers.db');
const db = new Database(dbPath);

console.log('정비제님 데이터 수정');
console.log('='.repeat(60));

// 현재 잘못된 데이터 확인
const oldCustomer = db.prepare('SELECT * FROM customers WHERE name LIKE ?').get('%정비제%');

if (oldCustomer) {
  console.log('현재 저장된 데이터:');
  console.log('  이름:', oldCustomer.name);
  console.log('  생년월일:', oldCustomer.birth_date);
  console.log('  생시:', oldCustomer.birth_time);
  
  // 정확한 생년월일로 수정
  const correctDate = '1976-09-16';
  const correctTime = '09:00';
  
  // 정확한 사주 계산
  const result = calculateCompleteSaju(1976, 9, 16, 9, 0, false);
  
  console.log('\n수정할 데이터:');
  console.log('  생년월일:', correctDate);
  console.log('  생시:', correctTime);
  console.log('  계산된 사주:', result.fullSaju);
  
  // DB 업데이트
  const updateStmt = db.prepare(`
    UPDATE customers 
    SET birth_date = ?, 
        birth_time = ?,
        saju_data = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE name LIKE ?
  `);
  
  const updateResult = updateStmt.run(
    correctDate,
    correctTime,
    JSON.stringify(result),
    '%정비제%'
  );
  
  if (updateResult.changes > 0) {
    console.log('\n✅ 성공적으로 수정되었습니다!');
    
    // 수정된 데이터 확인
    const newCustomer = db.prepare('SELECT * FROM customers WHERE name LIKE ?').get('%정비제%');
    const newSaju = JSON.parse(newCustomer.saju_data);
    
    console.log('\n수정 후 확인:');
    console.log('  이름:', newCustomer.name);
    console.log('  생년월일:', newCustomer.birth_date);
    console.log('  생시:', newCustomer.birth_time);
    console.log('  사주:', newSaju.fullSaju);
    
    if (newSaju.fullSaju === '병진 정유 신미 계사') {
      console.log('  ✅ 목표 사주와 일치합니다!');
    }
  } else {
    console.log('❌ 수정 실패');
  }
} else {
  console.log('정비제님 데이터를 찾을 수 없습니다.');
}

db.close();

console.log('\n' + '='.repeat(60));
console.log('작업 완료!');