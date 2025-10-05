/**
 * 포트 정책 검증 스크립트
 *
 * 이 스크립트는 모든 설정 파일이 CLAUDE.md의 포트 정책을 준수하는지 확인합니다.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CLAUDE.md에 정의된 포트 정책
const PORT_POLICY = {
  frontend: 4000,
  'api-gateway': 4001,
  calendar: 4012,
  diary: 4004,
  'saju-analysis': 4015,
  customer: 4016,
  'ai-service': 4017,
  academy: 4018,
  referral: 4019,
};

console.log('🔍 포트 정책 검증 시작...\n');

// 1. vite.config.ts 검증
console.log('📝 1. vite.config.ts 프록시 설정 확인');
const viteConfigPath = path.join(__dirname, 'packages/web/vite.config.ts');
const viteConfig = fs.readFileSync(viteConfigPath, 'utf-8');

const checks = [
  { service: 'customer', port: PORT_POLICY.customer, pattern: /\/api\/customers.*?target:\s*'http:\/\/localhost:(\d+)'/ },
  { service: 'calendar', port: PORT_POLICY.calendar, pattern: /\/api\/calendar.*?target:\s*'http:\/\/localhost:(\d+)'/ },
  { service: 'saju', port: PORT_POLICY['saju-analysis'], pattern: /\/api\/saju.*?target:\s*'http:\/\/localhost:(\d+)'/ },
  { service: 'diary', port: PORT_POLICY.diary, pattern: /\/api\/diaries.*?target:\s*'http:\/\/localhost:(\d+)'/ },
];

let allPassed = true;

checks.forEach(({ service, port, pattern }) => {
  const match = viteConfig.match(pattern);
  if (match) {
    const actualPort = parseInt(match[1]);
    if (actualPort === port) {
      console.log(`  ✅ ${service}: ${actualPort} (정책 준수)`);
    } else {
      console.log(`  ❌ ${service}: ${actualPort} (예상: ${port})`);
      allPassed = false;
    }
  } else {
    console.log(`  ⚠️ ${service}: 프록시 설정 없음`);
  }
});

// 2. Customer Service .env 확인
console.log('\n📝 2. Customer Service 환경변수 확인');
const customerEnvPath = path.join(__dirname, 'packages/backend/services/customer/.env');
try {
  const customerEnv = fs.readFileSync(customerEnvPath, 'utf-8');
  const portMatch = customerEnv.match(/CUSTOMER_SERVICE_PORT=(\d+)/);
  if (portMatch) {
    const actualPort = parseInt(portMatch[1]);
    if (actualPort === PORT_POLICY.customer) {
      console.log(`  ✅ CUSTOMER_SERVICE_PORT: ${actualPort} (정책 준수)`);
    } else {
      console.log(`  ❌ CUSTOMER_SERVICE_PORT: ${actualPort} (예상: ${PORT_POLICY.customer})`);
      allPassed = false;
    }
  } else {
    console.log('  ⚠️ CUSTOMER_SERVICE_PORT 설정 없음');
  }
} catch (error) {
  console.log('  ⚠️ .env 파일 없음');
}

// 3. 프론트엔드 포트 확인
console.log('\n📝 3. 프론트엔드 포트 설정 확인');
const webEnvPath = path.join(__dirname, 'packages/web/.env');
try {
  const webEnv = fs.readFileSync(webEnvPath, 'utf-8');
  const portMatch = webEnv.match(/VITE_PORT=(\d+)/);
  if (portMatch) {
    const actualPort = parseInt(portMatch[1]);
    if (actualPort === PORT_POLICY.frontend) {
      console.log(`  ✅ VITE_PORT: ${actualPort} (정책 준수)`);
    } else {
      console.log(`  ❌ VITE_PORT: ${actualPort} (예상: ${PORT_POLICY.frontend})`);
      allPassed = false;
    }
  }
} catch (error) {
  console.log('  ⚠️ .env 파일 읽기 실패');
}

// 4. 최종 결과
console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('✅ 모든 포트 정책 검증 통과!');
  console.log('\n포트 정책 요약:');
  Object.entries(PORT_POLICY).forEach(([service, port]) => {
    console.log(`  - ${service}: ${port}`);
  });
  process.exit(0);
} else {
  console.log('❌ 포트 정책 불일치 발견');
  console.log('CLAUDE.md의 포트 정책을 확인하고 설정 파일을 수정해주세요.');
  process.exit(1);
}
