const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'packages/backend/services/data/saju.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 데이터베이스 중복 검사 시작...\n');

// 전체 항목 수 확인
db.get(`
  SELECT COUNT(*) as total_count 
  FROM minor_categories
`, (err, row) => {
  if (err) {
    console.error('오류:', err);
    return;
  }
  console.log(`📊 전체 소항목 수: ${row.total_count}개\n`);
});

// 주능 중복 확인
db.all(`
  SELECT 
    mid.name as middle_name,
    min.name as item_name,
    COUNT(*) as count
  FROM major_categories mc
  JOIN middle_categories mid ON mc.id = mid.major_id
  JOIN minor_categories min ON mid.id = min.middle_id
  WHERE mc.name = '주능'
  GROUP BY mid.name, min.name
  HAVING COUNT(*) > 1
  ORDER BY count DESC, mid.name, min.name
`, (err, rows) => {
  if (err) {
    console.error('오류:', err);
    return;
  }
  
  if (rows.length > 0) {
    console.log('⚠️ 주능 카테고리 중복 발견:');
    console.log('='.repeat(50));
    rows.forEach(row => {
      console.log(`   ${row.middle_name} > "${row.item_name}": ${row.count}개`);
    });
    console.log(`   총 중복 항목: ${rows.length}개\n`);
  } else {
    console.log('✅ 주능 카테고리: 중복 없음\n');
  }
});

// 주흉 중복 확인
db.all(`
  SELECT 
    mid.name as middle_name,
    min.name as item_name,
    COUNT(*) as count
  FROM major_categories mc
  JOIN middle_categories mid ON mc.id = mid.major_id
  JOIN minor_categories min ON mid.id = min.middle_id
  WHERE mc.name = '주흉'
  GROUP BY mid.name, min.name
  HAVING COUNT(*) > 1
  ORDER BY count DESC, mid.name, min.name
`, (err, rows) => {
  if (err) {
    console.error('오류:', err);
    return;
  }
  
  if (rows.length > 0) {
    console.log('⚠️ 주흉 카테고리 중복 발견:');
    console.log('='.repeat(50));
    rows.forEach(row => {
      console.log(`   ${row.middle_name} > "${row.item_name}": ${row.count}개`);
    });
    console.log(`   총 중복 항목: ${rows.length}개\n`);
  } else {
    console.log('✅ 주흉 카테고리: 중복 없음\n');
  }
});

// 카테고리별 항목 수 통계
setTimeout(() => {
  console.log('\n📈 카테고리별 항목 수 통계:');
  console.log('='.repeat(50));
  
  db.all(`
    SELECT 
      mc.name as major_name,
      mid.name as middle_name,
      COUNT(DISTINCT min.name) as unique_items,
      COUNT(min.name) as total_items
    FROM major_categories mc
    JOIN middle_categories mid ON mc.id = mid.major_id
    JOIN minor_categories min ON mid.id = min.middle_id
    GROUP BY mc.name, mid.name
    ORDER BY mc.name, mid.name
  `, (err, rows) => {
    if (err) {
      console.error('오류:', err);
      db.close();
      return;
    }
    
    let currentMajor = '';
    rows.forEach(row => {
      if (row.major_name !== currentMajor) {
        console.log(`\n[${row.major_name}]`);
        currentMajor = row.major_name;
      }
      
      const status = row.unique_items === row.total_items ? '✅' : '⚠️';
      console.log(`  ${status} ${row.middle_name}: 고유${row.unique_items}개 / 전체${row.total_items}개`);
      
      if (row.unique_items !== row.total_items) {
        const duplicates = row.total_items - row.unique_items;
        console.log(`     → ${duplicates}개 중복!`);
      }
    });
    
    // 전체 통계
    db.get(`
      SELECT 
        COUNT(DISTINCT name) as unique_total,
        COUNT(name) as grand_total
      FROM minor_categories
    `, (err, summary) => {
      if (err) {
        console.error('오류:', err);
      } else {
        console.log('\n' + '='.repeat(50));
        console.log('📊 전체 통계:');
        console.log(`   고유 항목: ${summary.unique_total}개`);
        console.log(`   전체 항목: ${summary.grand_total}개`);
        if (summary.unique_total !== summary.grand_total) {
          console.log(`   ⚠️ 중복 수: ${summary.grand_total - summary.unique_total}개`);
        } else {
          console.log(`   ✅ 중복 없음!`);
        }
      }
      
      db.close();
    });
  });
}, 500);