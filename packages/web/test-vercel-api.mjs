import { chromium } from '@playwright/test';

async function testVercelAPI() {
  console.log('🚀 Vercel API 테스트 시작...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const tests = [
    {
      name: 'Health Check',
      url: 'https://sajuapp.vercel.app/api/calendar/health',
      expectedStatus: [200, 404]
    },
    {
      name: 'Customer List',
      url: 'https://sajuapp.vercel.app/api/calendar/customers',
      expectedStatus: [200, 404]
    }
  ];

  for (const test of tests) {
    try {
      console.log(`📝 테스트: ${test.name}`);
      console.log(`   URL: ${test.url}`);

      const response = await page.goto(test.url, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });

      const status = response.status();
      const contentType = response.headers()['content-type'] || '';
      const text = await response.text();

      console.log(`   상태 코드: ${status}`);
      console.log(`   Content-Type: ${contentType}`);

      if (status === 404) {
        console.log(`   ❌ 404 - 배포가 아직 준비되지 않음`);
      } else if (contentType.includes('application/json')) {
        try {
          const json = JSON.parse(text);
          console.log(`   ✅ JSON 응답 성공`);
          console.log(`   데이터:`, JSON.stringify(json, null, 2));
        } catch (e) {
          console.log(`   ❌ JSON 파싱 실패`);
        }
      } else {
        console.log(`   ⚠️ HTML 응답 (예상: JSON)`);
      }

    } catch (error) {
      console.log(`   ❌ 에러: ${error.message}`);
    }

    console.log('');
  }

  await browser.close();
  console.log('✅ 테스트 완료!');
}

testVercelAPI().catch(console.error);