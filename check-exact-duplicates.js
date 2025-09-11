const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'packages/backend/services/data/saju.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 정확한 중복 항목 확인\n');

// 정확한 중복 확인
db.all(`
  SELECT name, COUNT(*) as count, GROUP_CONCAT(id) as ids, middle_id
  FROM minor_categories 
  GROUP BY name 
  HAVING count > 1
  ORDER BY count DESC, name
`, (err, duplicates) => {
  if (err) {
    console.error('❌ 중복 확인 오류:', err);
    db.close();
    return;
  }

  console.log('⚠️ 데이터베이스 중복 항목 발견:');
  console.log('='.repeat(60));
  
  if (duplicates.length === 0) {
    console.log('✅ 중복 항목이 없습니다!');
  } else {
    duplicates.forEach(dup => {
      console.log(`⚠️ "${dup.name}": ${dup.count}개 (ID: ${dup.ids})`);
    });
  }
  
  // 특별히 게임 관련 중복 확인
  console.log('\n🎮 게임 카테고리 상세 확인:');
  console.log('='.repeat(40));
  
  db.all(`
    SELECT mc.name, mc.id, mc.middle_id, mdc.name as middle_name, mjc.name as major_name
    FROM minor_categories mc
    LEFT JOIN middle_categories mdc ON mc.middle_id = mdc.id
    LEFT JOIN major_categories mjc ON mdc.major_id = mjc.id
    WHERE mc.name LIKE '%게임%' OR mc.name LIKE '%FPS%' 
    ORDER BY mc.name, mc.id
  `, (err, games) => {
    if (err) {
      console.error('❌ 게임 데이터 조회 오류:', err);
      db.close();
      return;
    }
    
    const gameGroups = {};
    games.forEach(game => {
      if (!gameGroups[game.name]) gameGroups[game.name] = [];
      gameGroups[game.name].push(game);
    });
    
    Object.entries(gameGroups).forEach(([name, items]) => {
      if (items.length > 1) {
        console.log(`⚠️ "${name}": ${items.length}개 중복`);
        items.forEach(item => {
          console.log(`   - ID: ${item.id}, 중분류: ${item.middle_name}, 대분류: ${item.major_name}`);
        });
      } else {
        console.log(`✅ "${name}": 정상`);
      }
    });
    
    db.close();
  });
});