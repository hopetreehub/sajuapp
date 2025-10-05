const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('===================================================');
  console.log('🚀 새로운 Vercel 배포 떨림 현상 최종 테스트');
  console.log('===================================================\n');

  const baseUrl = 'https://sajuapp-mmhg3th0y-johns-projects-bf5e60f3.vercel.app';

  try {
    // 1. 홈페이지 먼저 확인
    console.log('1️⃣ 홈페이지 접근 테스트...');
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

    // 2. 회원가입 페이지 테스트
    console.log('\n2️⃣ 회원가입 페이지 떨림 현상 테스트...');
    const signupUrl = baseUrl + '/auth?mode=signup';
    const signupResponse = await page.goto(signupUrl, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('   상태 코드:', signupResponse.status());

    if (signupResponse.status() === 200) {
      console.log('   ✅ 회원가입 페이지 정상 로드!');

      // 떨림 현상 모니터링 (10초간)
      console.log('\n3️⃣ 무한 리렌더링/떨림 현상 집중 모니터링 (10초)...');
      let mutationCount = 0;

      await page.evaluate(() => {
        window.mutationCount = 0;
        window.renderCount = 0;

        // DOM 변경 모니터링
        const observer = new MutationObserver((mutations) => {
          window.mutationCount += mutations.length;
        });
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true
        });

        // 컴포넌트 리렌더링 감지 (React DevTools 방식)
        const originalLog = console.log;
        console.log = function(...args) {
          if (args.some(arg => typeof arg === 'string' && arg.includes('render'))) {
            window.renderCount++;
          }
          originalLog.apply(console, args);
        };
      });

      // 10초간 모니터링
      for (let i = 1; i <= 10; i++) {
        await page.waitForTimeout(1000);
        const currentMutations = await page.evaluate(() => window.mutationCount);
        console.log(`   ${i}초: DOM 변경 ${currentMutations}회`);
      }

      mutationCount = await page.evaluate(() => window.mutationCount);
      console.log(`\n   📊 최종 결과:`);
      console.log(`   - 10초간 총 DOM 변경: ${mutationCount}회`);

      if (mutationCount > 200) {
        console.log('   ❌ 심각한 무한 리렌더링! (200회 이상)');
      } else if (mutationCount > 100) {
        console.log('   ⚠️ 과도한 DOM 변경 (100-200회)');
      } else if (mutationCount > 50) {
        console.log('   ⚠️ 중간 정도 DOM 변경 (50-100회)');
      } else if (mutationCount > 20) {
        console.log('   ✅ 적당한 DOM 변경 (20-50회) - 정상 범위');
      } else {
        console.log('   ✅ 매우 안정적! (20회 이하) - 완벽!');
      }

      // 4. 탭 전환 테스트
      console.log('\n4️⃣ 로그인/회원가입 탭 전환 안정성 테스트...');

      // 로그인 탭 클릭
      await page.click('button:has-text("로그인")');
      await page.waitForTimeout(2000);

      const loginUrl = page.url();
      console.log('   로그인 탭 클릭 후 URL:', loginUrl);

      // 회원가입 탭 다시 클릭
      await page.click('button:has-text("회원가입")');
      await page.waitForTimeout(2000);

      const signupUrlAfter = page.url();
      console.log('   회원가입 탭 클릭 후 URL:', signupUrlAfter);

      // URL 변경 확인
      if (loginUrl.includes('mode=login') && signupUrlAfter.includes('mode=signup')) {
        console.log('   ✅ 탭 전환과 URL 업데이트 완벽!');
      } else {
        console.log('   ❌ 탭 전환 또는 URL 업데이트 문제');
      }

      // 5. 폼 요소 확인
      console.log('\n5️⃣ 회원가입 폼 요소 확인...');
      const emailInput = await page.locator('input[name="email"], input[type="email"]').count();
      const passwordInput = await page.locator('input[name="password"], input[type="password"]').count();
      const nameInput = await page.locator('input[name="name"]').count();

      console.log('   이메일 입력 필드:', emailInput > 0 ? '✅' : '❌');
      console.log('   비밀번호 입력 필드:', passwordInput > 0 ? '✅' : '❌');
      console.log('   이름 입력 필드:', nameInput > 0 ? '✅' : '❌');

      // 6. 콘솔 에러 확인
      console.log('\n6️⃣ 콘솔 에러 모니터링...');
      let consoleErrors = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.waitForTimeout(3000);

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
    await page.screenshot({ path: 'new-vercel-deployment-test.png', fullPage: true });
    console.log('\n📸 스크린샷 저장: new-vercel-deployment-test.png');

    console.log('\n===================================================');
    console.log('✨ 새로운 Vercel 배포 테스트 완료!');
    console.log('===================================================');
    console.log('\n🌐 새로운 배포 URL:', baseUrl);
    console.log('🔗 회원가입 페이지:', signupUrl);

  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message);
  } finally {
    await browser.close();
  }
})();