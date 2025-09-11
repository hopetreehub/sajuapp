const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'packages/backend/services/data/saju.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 데이터베이스 스키마 확인\n');

// 테이블 목록 확인
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('❌ 테이블 목록 조회 오류:', err);
    return;
  }
  
  console.log('📋 테이블 목록:');
  tables.forEach(table => {
    console.log(`   - ${table.name}`);
  });
  
  // minor_categories 테이블 구조 확인
  db.all("PRAGMA table_info(minor_categories)", (err, columns) => {
    if (err) {
      console.error('❌ 테이블 구조 조회 오류:', err);
      db.close();
      return;
    }
    
    console.log('\n📊 minor_categories 테이블 구조:');
    columns.forEach(col => {
      console.log(`   - ${col.name}: ${col.type} ${col.notnull ? '(NOT NULL)' : ''}`);
    });
    
    // 게임 관련 데이터 샘플 조회
    console.log('\n🎮 게임 관련 데이터 샘플:');
    db.all("SELECT * FROM minor_categories WHERE name LIKE '%게임%' OR name LIKE '%FPS%' LIMIT 10", (err, games) => {
      if (err) {
        console.error('❌ 게임 데이터 조회 오류:', err);
        db.close();
        return;
      }
      
      if (games.length === 0) {
        console.log('   게임 관련 데이터가 없습니다.');
      } else {
        games.forEach(game => {
          console.log(`   - ${game.name} (${game.category || game.parent_category || 'unknown'})`);
        });
      }
      
      db.close();
    });
  });
});