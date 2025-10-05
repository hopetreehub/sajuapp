const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('===================================================');
  console.log('🔍 Vercel Alias URL들 테스트');
  console.log('===================================================\n');

  const urls = [
    'https://sajuapp-ruddy.vercel.app',
    'https://sajuapp-johns-projects-bf5e60f3.vercel.app',
    'https://sajuapp-junsupark9999-8777-johns-projects-bf5e60f3.vercel.app',
    'https://sajuapp-mmhg3th0y-johns-projects-bf5e60f3.vercel.app'
  ];

  for (let i = 0; i < urls.length; i++) {
    const baseUrl = urls[i];
    console.log(`${i + 1}️⃣ 테스트 URL: ${baseUrl}`);

    try {
      // 홈페이지 테스트
      const homeResponse = await page.goto(baseUrl, {
        waitUntil: 'networkidle',
        timeout: 15000
      });

      console.log(`   홈페이지 상태: ${homeResponse.status()}`);

      if (homeResponse.status() === 200) {
        console.log('   ✅ 홈페이지 정상!');

        // 회원가입 페이지 테스트
        const signupUrl = baseUrl + '/auth?mode=signup';
        const signupResponse = await page.goto(signupUrl, {
          waitUntil: 'networkidle',
          timeout: 15000
        });

        console.log(`   회원가입 페이지 상태: ${signupResponse.status()}`);

        if (signupResponse.status() === 200) {
          console.log('   ✅ 회원가입 페이지도 정상!');
          console.log(`   🎉 작동하는 URL 발견: ${baseUrl}`);

          // 떨림 현상 빠른 체크
          console.log('   📊 빠른 떨림 현상 체크 (3초)...');

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

          await page.waitForTimeout(3000);

          const mutationCount = await page.evaluate(() => window.mutationCount);
          console.log(`   3초간 DOM 변경: ${mutationCount}회`);

          if (mutationCount === 0) {
            console.log('   🎉 떨림 현상 완전 해결 확인!');
          } else if (mutationCount < 20) {
            console.log('   ✅ 정상 범위의 DOM 변경');
          } else {
            console.log('   ⚠️ 다소 많은 DOM 변경');
          }

          // 성공한 URL 발견 시 종료
          break;
        } else {
          console.log('   ❌ 회원가입 페이지 실패');
        }
      } else {
        console.log(`   ❌ 홈페이지 실패 (${homeResponse.status()})`);
      }
    } catch (error) {
      console.log(`   ❌ 연결 오류: ${error.message}`);
    }

    console.log('');
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: 'vercel-alias-test.png', fullPage: true });
  console.log('📸 스크린샷 저장: vercel-alias-test.png');

  console.log('\n===================================================');
  console.log('✨ Vercel Alias URL 테스트 완료!');
  console.log('===================================================');

  await browser.close();
})();