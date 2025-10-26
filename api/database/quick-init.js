/**
 * 빠른 데이터베이스 스키마 초기화
 */
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

async function initSchema() {
  console.log('🔧 데이터베이스 스키마 초기화 시작...\n');

  const sql = neon(process.env.POSTGRES_URL);

  // schema.sql 파일 읽기
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

  console.log('📖 schema.sql 파일 읽기 완료');
  console.log(`📏 SQL 스크립트 크기: ${schemaSQL.length} bytes\n`);

  try {
    // SQL 문을 세미콜론으로 분리
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 실행할 SQL 문: ${statements.length}개\n`);

    // 각 SQL 문을 순차적으로 실행
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];

      try {
        await sql(stmt);

        // 진행 상황 표시 (10개마다)
        if ((i + 1) % 10 === 0) {
          console.log(`⚙️  진행 중... [${i + 1}/${statements.length}]`);
        }
      } catch (error) {
        // 이미 존재하는 객체는 무시
        if (error.message && error.message.includes('already exists')) {
          console.log(`   ℹ️  [${i + 1}] 이미 존재함 (건너뜀)`);
        } else {
          console.error(`   ❌ [${i + 1}] 오류:`, error.message);
          // 중요하지 않은 에러는 계속 진행
        }
      }
    }

    console.log('\n✅ 스키마 초기화 완료!\n');

    // 테이블 목록 확인
    const tables = await sql`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    console.log('📊 생성된 테이블 목록:');
    tables.forEach(table => {
      console.log(`   - ${table.tablename}`);
    });

    console.log('\n🎉 데이터베이스 준비 완료!\n');
  } catch (error) {
    console.error('❌ 스키마 초기화 실패:', error.message);
    process.exit(1);
  }
}

initSchema();
