/**
 * 완전한 사주 데이터 업데이트 스크립트
 *
 * 목적: 테스트용 완전한 사주 데이터 (_isMinimal: false) 생성
 * 실행: npx tsx packages/web/api/database/update-full-saju-data.ts
 *
 * @author Claude Code
 * @version 1.0.0
 */

import { sql } from '@vercel/postgres';
import { config } from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ESM에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env.local 파일 로드
const envPath = path.join(__dirname, '../../.env.local');
console.log(`📁 환경 변수 파일: ${envPath}`);
config({ path: envPath });

/**
 * 완전한 사주 데이터 생성
 *
 * 필수 필드:
 * - year/month/day/time: { gan, ji }
 * - ohHaengBalance: { 목, 화, 토, 금, 수 }
 * - fullSaju: 사주 팔자 문자열
 * - _isMinimal: false
 */
const createFullSajuData = (customerId: number) => {
  const samples = [
    {
      id: 1,
      name: '박준수',
      data: {
        year: { gan: '경', ji: '오' },
        month: { gan: '신', ji: '사' },
        day: { gan: '갑', ji: '자' },
        time: { gan: '신', ji: '미' },
        ohHaengBalance: {
          목: 25,
          화: 30,
          토: 15,
          금: 20,
          수: 10,
        },
        sipSungBalance: {
          비겁: 12,
          식상: 18,
          재성: 15,
          관성: 10,
          인성: 8,
        },
        fullSaju: '경오 신사 갑자 신미',
        _isMinimal: false,
      },
    },
    {
      id: 2,
      name: '이정미',
      data: {
        year: { gan: '무', ji: '진' },
        month: { gan: '계', ji: '해' },
        day: { gan: '을', ji: '사' },
        time: { gan: '신', ji: '사' },
        ohHaengBalance: {
          목: 18,
          화: 22,
          토: 20,
          금: 25,
          수: 15,
        },
        sipSungBalance: {
          비겁: 14,
          식상: 16,
          재성: 18,
          관성: 9,
          인성: 6,
        },
        fullSaju: '무진 계해 을사 신사',
        _isMinimal: false,
      },
    },
    {
      id: 3,
      name: '최민호',
      data: {
        year: { gan: '을', ji: '축' },
        month: { gan: '기', ji: '묘' },
        day: { gan: '병', ji: '신' },
        time: { gan: '병', ji: '신' },
        ohHaengBalance: {
          목: 22,
          화: 28,
          토: 12,
          금: 28,
          수: 10,
        },
        sipSungBalance: {
          비겁: 16,
          식상: 20,
          재성: 14,
          관성: 7,
          인성: 5,
        },
        fullSaju: '을축 기묘 병신 병신',
        _isMinimal: false,
      },
    },
  ];

  return samples.find(s => s.id === customerId)?.data || samples[0].data;
};

async function updateCustomerSajuData() {
  try {
    console.log('🔧 고객 사주 데이터 업데이트 시작...\n');

    // 기존 고객 조회
    const { rows: customers } = await sql`
      SELECT id, name FROM customers
      ORDER BY id ASC
      LIMIT 10
    `;

    console.log(`📊 업데이트할 고객 수: ${customers.length}명\n`);

    // 각 고객의 사주 데이터 업데이트
    for (const customer of customers) {
      const fullSajuData = createFullSajuData(customer.id);

      console.log(`⚙️  고객 [${customer.id}] ${customer.name} 업데이트 중...`);
      console.log(`   사주: ${fullSajuData.fullSaju}`);
      console.log(`   오행 밸런스: 목${fullSajuData.ohHaengBalance.목} 화${fullSajuData.ohHaengBalance.화} 토${fullSajuData.ohHaengBalance.토} 금${fullSajuData.ohHaengBalance.금} 수${fullSajuData.ohHaengBalance.수}`);
      console.log(`   _isMinimal: ${fullSajuData._isMinimal}`);

      await sql`
        UPDATE customers
        SET saju_data = ${JSON.stringify(fullSajuData)}::jsonb,
            updated_at = NOW()
        WHERE id = ${customer.id}
      `;

      console.log(`   ✅ 완료\n`);
    }

    console.log('✅ 모든 고객 사주 데이터 업데이트 완료!\n');

    // 업데이트된 데이터 확인
    const { rows: updated } = await sql`
      SELECT id, name, saju_data->'_isMinimal' as is_minimal
      FROM customers
      ORDER BY id ASC
      LIMIT 10
    `;

    console.log('📋 업데이트 결과 확인:');
    updated.forEach((row: { id: number; name: string; is_minimal: boolean }) => {
      console.log(`   - [${row.id}] ${row.name}: _isMinimal = ${row.is_minimal}`);
    });

    console.log('\n🎉 완료!\n');

  } catch (error) {
    console.error('❌ 업데이트 실패:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// 스크립트 실행
updateCustomerSajuData();
