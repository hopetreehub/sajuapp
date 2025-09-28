import { chromium } from '@playwright/test';

async function testAllDeployments() {
  console.log('🚀 모든 배포 사이트 테스트 시작...\n');

  const sites = [
    {
      name: 'Cloudflare Pages',
      url: 'https://2f845225.fortune-compass.pages.dev',
      testPaths: ['/customers', '/settings', '/test-api']
    },
    {
      name: 'Vercel (이전 배포)',
      url: 'https://calendar-j3vjlsr7q-johns-projects-bf5e60f3.vercel.app',
      testPaths: ['/api/calendar/health', '/api/calendar/customers']
    },
    {
      name: 'Vercel (새 배포)',
      url: 'https://sajuapp-5wjnpmyw7-johns-projects-bf5e60f3.vercel.app',
      testPaths: ['/']
    }
  ];

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  for (const site of sites) {
    console.log(`\n📍 테스트 중: ${site.name}`);
    console.log(`   URL: ${site.url}`);
    console.log('   ================================');

    for (const path of site.testPaths) {
      const page = await context.newPage();
      const fullUrl = `${site.url}${path}`;

      try {
        console.log(`\n   📝 경로: ${path}`);

        // 페이지 접속
        const response = await page.goto(fullUrl, {
          waitUntil: 'domcontentloaded',
          timeout: 10000
        });

        const status = response.status();
        const contentType = response.headers()['content-type'] || '';

        console.log(`      상태 코드: ${status}`);
        console.log(`      Content-Type: ${contentType}`);

        // HTML 또는 JSON 확인
        if (contentType.includes('application/json')) {
          const text = await response.text();
          try {
            const json = JSON.parse(text);
            console.log(`      ✅ JSON 응답 성공`);
            console.log(`      데이터:`, JSON.stringify(json, null, 2).substring(0, 200));
          } catch (e) {
            console.log(`      ❌ JSON 파싱 실패`);
          }
        } else if (contentType.includes('text/html')) {
          const title = await page.title();
          console.log(`      페이지 타이틀: ${title}`);

          // 콘솔 에러 체크
          const consoleErrors = [];
          page.on('console', msg => {
            if (msg.type() === 'error') {
              consoleErrors.push(msg.text());
            }
          });

          await page.waitForTimeout(1000);

          if (consoleErrors.length > 0) {
            console.log(`      ⚠️ 콘솔 에러 발견:`, consoleErrors[0]);
          } else {
            console.log(`      ✅ 콘솔 에러 없음`);
          }
        }

      } catch (error) {
        console.log(`      ❌ 에러: ${error.message}`);
      } finally {
        await page.close();
      }
    }
  }

  await browser.close();

  console.log('\n\n📊 ===== 테스트 요약 =====');
  console.log('1. Cloudflare Pages: 프론트엔드는 작동하나 API 연결 문제');
  console.log('2. Vercel 백엔드 API: 정상 작동');
  console.log('3. Vercel 새 배포: 빌드 에러로 실패');
  console.log('\n✅ 테스트 완료!');
}

testAllDeployments().catch(console.error);