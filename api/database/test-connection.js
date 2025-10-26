/**
 * 데이터베이스 연결 및 테이블 확인 테스트
 */
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env.local') });

async function testConnection() {
  console.log('🔗 데이터베이스 연결 테스트 중...\n');

  const sql = neon(process.env.POSTGRES_URL);

  try {
    // 테이블 목록 조회
    const tables = await sql`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    console.log('✅ 데이터베이스 연결 성공!\n');
    console.log('📊 생성된 테이블 목록:');

    const expectedTables = ['customers', 'diaries', 'events', 'event_tags', 'tags'];
    const foundTables = tables.map(t => t.tablename);

    expectedTables.forEach(table => {
      if (foundTables.includes(table)) {
        console.log(`   ✅ ${table}`);
      } else {
        console.log(`   ❌ ${table} (없음)`);
      }
    });

    // diaries 테이블 구조 확인
    console.log('\n📝 diaries 테이블 구조:');
    const columns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'diaries'
      ORDER BY ordinal_position
    `;

    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });

    console.log('\n🎉 데이터베이스 준비 완료!\n');

  } catch (error) {
    console.error('❌ 연결 실패:', error.message);
    process.exit(1);
  }
}

testConnection();
