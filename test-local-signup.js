const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('===================================================');
  console.log('🔧 로컬 환경에서 회원가입 페이지 수정사항 확인');
  console.log('===================================================\n');

  try {
    // 회원가입 페이지 확인
    console.log('1️⃣ 로컬 회원가입 페이지 확인...');
    const signupUrl = 'http://localhost:4000/auth?mode=signup';
    const signupResponse = await page.goto(signupUrl, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('   상태 코드:', signupResponse.status());

    if (signupResponse.status() === 200) {
      console.log('   ✅ 회원가입 페이지 정상 로드!');

      // 페이지 제목 확인
      const title = await page.title();
      console.log('   제목:', title);

      // 무한 리렌더링 체크 (5초 모니터링)
      console.log('\n2️⃣ 무한 리렌더링 체크 (5초 모니터링)...');
      let mutationCount = 0;

      await page.evaluate(() => {
        window.mutationCount = 0;
        const observer = new MutationObserver((mutations) => {
          window.mutationCount += mutations.length;
        });
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true
        });
      });

      await page.waitForTimeout(5000);

      mutationCount = await page.evaluate(() => window.mutationCount);
      console.log('   5초 동안 DOM 변경 횟수:', mutationCount);

      if (mutationCount > 100) {
        console.log('   ❌ 과도한 DOM 변경! 무한 리렌더링 여전히 존재');
      } else if (mutationCount > 50) {
        console.log('   ⚠️ 중간 정도 DOM 변경 - 개선 필요');
      } else {
        console.log('   ✅ DOM 변경 정상 범위 - 무한 리렌더링 해결됨!');
      }

      // 탭 전환 테스트
      console.log('\n3️⃣ 로그인/회원가입 탭 전환 테스트...');

      // 현재 URL 확인
      console.log('   현재 URL:', page.url());

      // 로그인 탭 클릭
      await page.click('button:has-text("로그인")');
      await page.waitForTimeout(1000);

      const currentUrl1 = page.url();
      console.log('   로그인 탭 클릭 후 URL:', currentUrl1);

      // 회원가입 탭 다시 클릭
      await page.click('button:has-text("회원가입")');
      await page.waitForTimeout(1000);

      const currentUrl2 = page.url();
      console.log('   회원가입 탭 클릭 후 URL:', currentUrl2);

      // URL 변경 확인
      if (currentUrl1.includes('mode=login') && currentUrl2.includes('mode=signup')) {
        console.log('   ✅ 탭 전환과 URL 업데이트 정상!');
      } else {
        console.log('   ❌ 탭 전환 또는 URL 업데이트 문제');
      }

      // 회원가입 폼 요소 확인
      console.log('\n4️⃣ 회원가입 폼 요소 확인...');
      const emailInput = await page.locator('input[name="email"], input[type="email"]').count();
      const passwordInput = await page.locator('input[name="password"], input[type="password"]').count();
      const nameInput = await page.locator('input[name="name"]').count();

      console.log('   이메일 입력 필드:', emailInput > 0 ? '✅' : '❌');
      console.log('   비밀번호 입력 필드:', passwordInput > 0 ? '✅' : '❌');
      console.log('   이름 입력 필드:', nameInput > 0 ? '✅' : '❌');

      // 콘솔 에러 확인
      console.log('\n5️⃣ 콘솔 에러 확인...');
      let consoleErrors = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.waitForTimeout(2000);

      if (consoleErrors.length > 0) {
        console.log('   ❌ 콘솔 에러 발견:');
        consoleErrors.forEach(error => console.log('     -', error));
      } else {
        console.log('   ✅ 콘솔 에러 없음!');
      }

    } else {
      console.log('   ❌ 회원가입 페이지 로드 실패');
    }

    // 스크린샷 저장
    await page.screenshot({ path: 'local-signup-test.png', fullPage: true });
    console.log('\n📸 스크린샷 저장: local-signup-test.png');

    console.log('\n===================================================');
    console.log('✨ 로컬 환경 테스트 완료!');
    console.log('===================================================');

  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message);
  } finally {
    await browser.close();
  }
})();