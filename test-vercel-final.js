const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('===================================================');
  console.log('🚀 VERCEL 최종 배포 테스트');
  console.log('===================================================\n');

  const baseUrl = 'https://sajuapp-91rhakuet-johns-projects-bf5e60f3.vercel.app';

  try {
    // 1. 홈페이지 테스트
    console.log('1️⃣ 홈페이지 테스트...');
    const homeResponse = await page.goto(baseUrl, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('   상태 코드:', homeResponse.status());
    if (homeResponse.status() === 200) {
      console.log('   ✅ 홈페이지 정상 로드!');
      const title = await page.title();
      console.log('   제목:', title);
    } else {
      console.log('   ❌ 홈페이지 로드 실패');
    }

    await page.waitForTimeout(2000);

    // 2. 로그인 페이지 테스트
    console.log('\n2️⃣ 로그인 페이지 테스트...');
    const authUrl = baseUrl + '/auth?mode=login';
    const authResponse = await page.goto(authUrl, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('   상태 코드:', authResponse.status());

    if (authResponse.status() === 200) {
      console.log('   ✅ 로그인 페이지 정상 로드!');

      // 데모 버튼 확인
      const demoButtonCount = await page.locator('text=데모 계정으로 체험하기').count();

      console.log('\n3️⃣ 데모 버튼 확인...');
      if (demoButtonCount > 0) {
        console.log('   ❌ 데모 버튼이 아직 존재합니다! (개수:', demoButtonCount + ')');
      } else {
        console.log('   ✅ 데모 버튼이 성공적으로 제거되었습니다!');
      }

      // 로그인 폼 확인
      const emailInput = await page.locator('input[type="email"]').count();
      const passwordInput = await page.locator('input[type="password"]').count();

      console.log('\n4️⃣ 로그인 폼 확인...');
      if (emailInput > 0 && passwordInput > 0) {
        console.log('   ✅ 로그인 폼이 정상적으로 표시됩니다');
      } else {
        console.log('   ❌ 로그인 폼을 찾을 수 없습니다');
      }

      // 버튼 개수 확인
      const buttons = await page.locator('button').all();
      console.log('   전체 버튼 개수:', buttons.length);

    } else if (authResponse.status() === 404) {
      console.log('   ❌ 404 에러 - SPA 라우팅이 작동하지 않습니다!');
    }

    // 스크린샷 저장
    await page.screenshot({ path: 'vercel-final-test.png', fullPage: true });
    console.log('\n📸 스크린샷 저장: vercel-final-test.png');

    console.log('\n===================================================');
    console.log('✨ 테스트 완료!');
    console.log('===================================================');
    console.log('\n🌐 배포 URL:', baseUrl);
    console.log('🔗 로그인 페이지:', authUrl);

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
})();