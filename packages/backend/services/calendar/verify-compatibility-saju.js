const sqlite3 = require('sqlite3').verbose();

console.log('=== 궁합 계산 사주 데이터 검증 ===\n');

const db = new sqlite3.Database('./calendar.db');

// 테이블 존재 확인
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('테이블 목록 조회 에러:', err);
    db.close();
    return;
  }
  
  console.log('데이터베이스 테이블 목록:', tables.map(t => t.name).join(', '));
  
  // users 테이블이 있는지 확인
  const hasUsersTable = tables.some(t => t.name === 'users');
  const hasCustomersTable = tables.some(t => t.name === 'customers');
  
  if (hasCustomersTable) {
    checkCustomersData();
  } else if (hasUsersTable) {
    checkUsersData();
  } else {
    console.log('❌ 고객/사용자 테이블을 찾을 수 없습니다');
    db.close();
  }
});

function checkCustomersData() {
  console.log('\n=== customers 테이블 확인 ===');
  
  db.all('SELECT name, birth_date, birth_time, saju_data FROM customers ORDER BY created_at DESC LIMIT 3', (err, rows) => {
    if (err) {
      console.error('customers 쿼리 에러:', err);
      db.close();
      return;
    }
    
    console.log(`고객 데이터 ${rows.length}건 확인:`);
    analyzeCustomerData(rows);
  });
}

function checkUsersData() {
  console.log('\n=== users 테이블 확인 ===');
  
  db.all('SELECT name, birth_date, birth_time, saju_data FROM users ORDER BY created_at DESC LIMIT 3', (err, rows) => {
    if (err) {
      console.error('users 쿼리 에러:', err);
      db.close();
      return;
    }
    
    console.log(`사용자 데이터 ${rows.length}건 확인:`);
    analyzeCustomerData(rows);
  });
}

function analyzeCustomerData(rows) {
  rows.forEach((row, index) => {
    console.log(`\n${index + 1}. ${row.name} (${row.birth_date} ${row.birth_time})`);
    
    if (!row.saju_data) {
      console.log('  ❌ 사주 데이터가 없습니다');
      return;
    }
    
    try {
      const sajuData = JSON.parse(row.saju_data);
      
      // 필수 필드 검증
      const requiredFields = ['year', 'month', 'day', 'time'];
      let isValid = true;
      
      for (const field of requiredFields) {
        if (!sajuData[field] || !sajuData[field].gan || !sajuData[field].ji) {
          console.log(`  ❌ ${field} 데이터가 불완전합니다`);
          isValid = false;
        }
      }
      
      if (isValid) {
        console.log('  ✅ 사주 데이터 구조 정상');
        console.log('  - 연주:', sajuData.year.gan, sajuData.year.ji);
        console.log('  - 월주:', sajuData.month.gan, sajuData.month.ji);  
        console.log('  - 일주:', sajuData.day.gan, sajuData.day.ji);
        console.log('  - 시주:', sajuData.time.gan, sajuData.time.ji);
        console.log('  - 전체 사주:', sajuData.fullSaju || '미제공');
        
        // 오행 균형 데이터 확인
        if (sajuData.ohHaengBalance) {
          const balance = sajuData.ohHaengBalance;
          const total = Object.values(balance).reduce((sum, val) => sum + val, 0);
          console.log('  ✅ 오행균형 데이터 존재 (합계:', total + ')');
          console.log('    목:', balance.목 || 0, '화:', balance.화 || 0, '토:', balance.토 || 0, '금:', balance.금 || 0, '수:', balance.수 || 0);
        } else {
          console.log('  ⚠️  오행균형 데이터 없음 (궁합 계산에 영향)');
        }
        
        // 궁합 계산에 필요한 추가 검증
        testCompatibilityCalculation(sajuData, index + 1);
      }
      
    } catch (e) {
      console.log('  ❌ 사주 데이터 파싱 오류:', e.message);
    }
  });
  
  db.close();
  
  console.log('\n=== 검증 완료 ===');
  console.log('다음 단계: 궁합 계산 로직에 실제 데이터 적용');
}

function testCompatibilityCalculation(sajuData, index) {
  console.log(`  🔍 궁합 계산 테스트 (고객 ${index})`);
  
  // 간단한 십신 계산 테스트
  const dayGan = sajuData.day.gan;
  const gans = [sajuData.year.gan, sajuData.month.gan, sajuData.day.gan, sajuData.time.gan];
  
  console.log(`    일간: ${dayGan}`);
  console.log(`    사주의 간: ${gans.join(' ')}`);
  
  // 오행 분포 확인
  if (sajuData.ohHaengBalance) {
    const elements = ['목', '화', '토', '금', '수'];
    const strongElements = elements.filter(e => sajuData.ohHaengBalance[e] > 20);
    const weakElements = elements.filter(e => sajuData.ohHaengBalance[e] < 10);
    
    if (strongElements.length > 0) {
      console.log(`    강한 오행: ${strongElements.join(', ')}`);
    }
    if (weakElements.length > 0) {
      console.log(`    약한 오행: ${weakElements.join(', ')}`);
    }
  }
}