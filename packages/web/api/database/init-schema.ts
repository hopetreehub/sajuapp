/**
 * 데이터베이스 스키마 초기화 스크립트
 *
 * 사용법: npx ts-node api/database/init-schema.ts
 *
 * @author Claude Code
 * @version 1.0.0
 */

import { sql } from '@vercel/postgres';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// ESM에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env.local 파일 로드
const envPath = path.join(__dirname, '../../.env.local');
console.log(`📁 환경 변수 파일: ${envPath}`);
config({ path: envPath });

async function initializeSchema() {
  try {
    console.log('🔧 데이터베이스 스키마 초기화 시작...\n');

    // schema.sql 파일 읽기
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

    console.log('📖 schema.sql 파일 읽기 완료');
    console.log(`📏 SQL 스크립트 크기: ${schemaSQL.length} bytes\n`);

    // SQL 문을 세미콜론으로 분리하여 개별 실행
    // 주석 제거 및 빈 줄 제거
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 실행할 SQL 문: ${statements.length}개\n`);

    // 각 SQL 문 실행
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];

      // CREATE TABLE, CREATE INDEX 등만 로그 출력
      const match = stmt.match(/^(CREATE|DROP|ALTER)\s+(\w+)\s+(?:IF\s+(?:NOT\s+)?EXISTS\s+)?(\w+)/i);
      if (match) {
        const [, command, objectType, objectName] = match;
        console.log(`⚙️  [${i + 1}/${statements.length}] ${command} ${objectType} ${objectName}...`);
      }

      try {
        await sql.query(stmt);
      } catch (error) {
        // 이미 존재하는 객체는 무시
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('already exists')) {
          console.log(`   ℹ️  이미 존재함 (건너뜀)`);
        } else {
          console.error(`   ❌ 오류:`, errorMessage);
          throw error;
        }
      }
    }

    console.log('\n✅ 스키마 초기화 완료!\n');

    // 테이블 목록 확인
    const { rows: tables } = await sql`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    console.log('📊 생성된 테이블 목록:');
    tables.forEach((table: { tablename: string }) => {
      console.log(`   - ${table.tablename}`);
    });

    console.log('\n🎉 데이터베이스 준비 완료!\n');

  } catch (error) {
    console.error('❌ 스키마 초기화 실패:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// 스크립트 실행
initializeSchema();
