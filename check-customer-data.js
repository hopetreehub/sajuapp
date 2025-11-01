/**
 * 고객 데이터 확인 스크립트
 */

const { sql } = require('@vercel/postgres');
const dotenv = require('dotenv');
const path = require('path');

// .env.local 로드
dotenv.config({ path: path.join(__dirname, 'packages/web/.env.local') });

async function checkCustomerData() {
  try {
    console.log('🔍 고객 데이터 확인 중...\n');

    const { rows } = await sql`
      SELECT id, name, saju_data
      FROM customers
      ORDER BY id ASC
      LIMIT 3
    `;

    console.log(`📊 총 ${rows.length}명의 고객 데이터:\n`);

    rows.forEach((row) => {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`👤 고객 [${row.id}] ${row.name}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      if (row.saju_data) {
        console.log(`✅ saju_data 존재:`);
        console.log(JSON.stringify(row.saju_data, null, 2));

        // _isMinimal 플래그 확인
        if (row.saju_data._isMinimal !== undefined) {
          console.log(`\n🏷️  _isMinimal: ${row.saju_data._isMinimal}`);
        } else {
          console.log(`\n⚠️  _isMinimal 플래그 없음`);
        }
      } else {
        console.log(`❌ saju_data 없음`);
      }
    });

    console.log(`\n\n✅ 확인 완료!\n`);

  } catch (error) {
    console.error('❌ 에러:', error);
  } finally {
    process.exit(0);
  }
}

checkCustomerData();
