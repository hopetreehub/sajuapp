const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'packages/backend/services/data/saju.db');
const backupPath = path.join(__dirname, 'packages/backend/services/data/saju_backup.db');

console.log('🔧 데이터베이스 초기화 작업 시작...\n');

// 백업 생성
try {
  if (fs.existsSync(dbPath)) {
    console.log('1️⃣ 기존 데이터베이스 백업 중...');
    fs.copyFileSync(dbPath, backupPath);
    console.log('   ✅ 백업 완료: saju_backup.db');
    
    console.log('2️⃣ 기존 데이터베이스 삭제 중...');
    fs.unlinkSync(dbPath);
    console.log('   ✅ 삭제 완료');
    
    console.log('\n✨ 데이터베이스 초기화 완료!');
    console.log('   이제 서버를 재시작하면 깨끗한 데이터베이스가 생성됩니다.');
  } else {
    console.log('⚠️ 데이터베이스 파일이 없습니다.');
  }
} catch (error) {
  console.error('❌ 오류 발생:', error);
}