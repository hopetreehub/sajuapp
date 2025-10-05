const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🔍 Vercel 배포 상태 확인');
  console.log('========================\n');

  try {
    // 홈페이지 먼저 확인
    console.log('1️⃣ 홈페이지 상태 확인...');
    const homeUrl = 'https://sajuapp-v2.vercel.app';
    const homeResponse = await page.goto(homeUrl, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('   홈페이지 상태 코드:', homeResponse.status());

    if (homeResponse.status() === 200) {
      console.log('   ✅ 홈페이지 정상!');
      const title = await page.title();
      console.log('   제목:', title);
    } else {
      console.log('   ❌ 홈페이지 접근 불가');
    }

    // 로그인 페이지 확인
    console.log('\n2️⃣ 로그인 페이지 상태 확인...');
    const loginUrl = 'https://sajuapp-v2.vercel.app/auth?mode=login';
    const loginResponse = await page.goto(loginUrl, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('   로그인 페이지 상태 코드:', loginResponse.status());

    if (loginResponse.status() === 200) {
      console.log('   ✅ 로그인 페이지 정상!');
    } else {
      console.log('   ❌ 로그인 페이지 접근 불가');
    }

    // 회원가입 페이지 확인
    console.log('\n3️⃣ 회원가입 페이지 상태 확인...');
    const signupUrl = 'https://sajuapp-v2.vercel.app/auth?mode=signup';
    const signupResponse = await page.goto(signupUrl, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('   회원가입 페이지 상태 코드:', signupResponse.status());

    if (signupResponse.status() === 200) {
      console.log('   ✅ 회원가입 페이지 정상!');
    } else {
      console.log('   ❌ 회원가입 페이지 접근 불가');
    }

    // 스크린샷 저장
    await page.screenshot({ path: 'vercel-status-check.png', fullPage: true });
    console.log('\n📸 현재 상태 스크린샷: vercel-status-check.png');

  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message);
  } finally {
    await browser.close();
  }

  console.log('\n========================');
  console.log('상태 확인 완료');
  console.log('========================');
})();