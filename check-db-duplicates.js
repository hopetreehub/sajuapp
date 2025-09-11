const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'packages/backend/services/data/saju.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 데이터베이스 직접 확인: 게임 카테고리 중복 체크\n');

// 게임 카테고리 중복 확인
db.all(`
  SELECT name, COUNT(*) as count 
  FROM minor_categories 
  WHERE major_category = '게임' 
  GROUP BY name 
  ORDER BY count DESC, name
`, (err, rows) => {
  if (err) {
    console.error('❌ 쿼리 오류:', err);
    return;
  }

  console.log('📊 게임 카테고리 항목 분석:');
  console.log('='.repeat(40));
  
  let totalItems = 0;
  let duplicatedItems = 0;
  
  rows.forEach(row => {
    totalItems += row.count;
    if (row.count > 1) {
      console.log(`⚠️  "${row.name}": ${row.count}개 (중복!)`);
      duplicatedItems += row.count;
    } else {
      console.log(`✅  "${row.name}": ${row.count}개`);
    }
  });
  
  console.log('\n📋 요약:');
  console.log(`   - 고유 항목명: ${rows.length}개`);
  console.log(`   - 전체 데이터: ${totalItems}개`);
  console.log(`   - 중복 데이터: ${duplicatedItems - (duplicatedItems/rows.filter(r => r.count > 1).length)}개`);
  
  if (duplicatedItems > rows.filter(r => r.count > 1).length) {
    console.log('\n⚠️ 데이터베이스에 중복이 존재합니다!');
  } else {
    console.log('\n✅ 데이터베이스는 정상입니다.');
  }
  
  // 전체 주능 카테고리도 빠르게 확인
  console.log('\n🔍 모든 주능 카테고리 중복 확인...');
  db.all(`
    SELECT major_category, name, COUNT(*) as count
    FROM minor_categories 
    WHERE type = 'positive'
    GROUP BY major_category, name 
    HAVING count > 1
    ORDER BY major_category, count DESC
  `, (err, duplicates) => {
    if (err) {
      console.error('❌ 전체 확인 오류:', err);
      db.close();
      return;
    }
    
    if (duplicates.length === 0) {
      console.log('✅ 모든 주능 카테고리에 중복이 없습니다!');
    } else {
      console.log(`⚠️ 총 ${duplicates.length}개의 중복 항목 발견:`);
      duplicates.forEach(dup => {
        console.log(`   - ${dup.major_category} > "${dup.name}": ${dup.count}개`);
      });
    }
    
    db.close();
  });
});