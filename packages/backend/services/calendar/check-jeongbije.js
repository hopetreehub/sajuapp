const path = require('path');
const Database = require('better-sqlite3');

// Customer database path
const dbPath = path.join(__dirname, '../customer/customers.db');
const db = new Database(dbPath);

console.log('정비제님 데이터 확인:');
console.log('='.repeat(60));

const customer = db.prepare('SELECT * FROM customers WHERE name LIKE ?').get('%정비제%');

if (customer) {
  console.log('이름:', customer.name);
  console.log('생년월일:', customer.birth_date);
  console.log('생시:', customer.birth_time);
  console.log('음양력:', customer.lunar_solar);
  
  if (customer.saju_data) {
    const saju = JSON.parse(customer.saju_data);
    console.log('\n저장된 사주:');
    console.log(`  ${saju.year.gan}${saju.year.ji} ${saju.month.gan}${saju.month.ji} ${saju.day.gan}${saju.day.ji} ${saju.time.gan}${saju.time.ji}`);
  }
  
  // 저장된 생년월일로 다시 계산
  const { calculateCompleteSaju } = require('./dist/utils/accurateSajuCalculator.js');
  const [year, month, day] = customer.birth_date.split('-').map(Number);
  const [hour, minute] = customer.birth_time.split(':').map(Number);
  
  console.log('\n재계산 결과:');
  const result = calculateCompleteSaju(year, month, day, hour, minute || 0, customer.lunar_solar === 'lunar');
  console.log(`  ${result.fullSaju}`);
  
  console.log('\n✅ 기대값: 병진 정유 신미 계사');
  
  if (result.fullSaju === '병진 정유 신미 계사') {
    console.log('✅ 계산이 정확합니다!');
  } else {
    console.log('❌ 계산이 일치하지 않습니다.');
    console.log('\n정비제님의 정확한 생년월일을 확인해주세요.');
    console.log('현재 DB: 1976.09.16 09:40 양력');
    console.log('사주가 "병진 정유 신미 계사"가 나오려면 생년월일이 다를 수 있습니다.');
  }
} else {
  console.log('정비제님 데이터를 찾을 수 없습니다.');
}

db.close();