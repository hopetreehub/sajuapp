const sqlite3 = require('sqlite3').verbose();

console.log('=== users 테이블 스키마 확인 ===');

const db = new sqlite3.Database('./calendar.db');

// users 테이블 스키마 확인
db.all("PRAGMA table_info(users)", (err, columns) => {
  if (err) {
    console.error('스키마 조회 에러:', err);
    db.close();
    return;
  }
  
  console.log('users 테이블 컬럼:');
  columns.forEach(col => {
    console.log(`  ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
  });
  
  console.log('\n=== 실제 데이터 확인 ===');
  
  // 모든 컬럼을 조회
  db.all("SELECT * FROM users LIMIT 3", (err, rows) => {
    if (err) {
      console.error('데이터 조회 에러:', err);
    } else {
      console.log(`\n사용자 데이터 ${rows.length}건:`);
      rows.forEach((row, index) => {
        console.log(`\n${index + 1}번 사용자:`);
        Object.keys(row).forEach(key => {
          if (key === 'saju_data' && row[key]) {
            try {
              const sajuData = JSON.parse(row[key]);
              console.log(`  ${key}: [사주 데이터 파싱 성공] ${sajuData.fullSaju || '풀 사주 없음'}`);
            } catch (e) {
              console.log(`  ${key}: [파싱 실패] ${row[key].substring(0, 50)}...`);
            }
          } else {
            console.log(`  ${key}: ${row[key]}`);
          }
        });
      });
    }
    
    db.close();
  });
});