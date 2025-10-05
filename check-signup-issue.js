const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('===================================================');
  console.log('🔍 회원가입 페이지 떨림 현상 점검');
  console.log('===================================================\n');

  try {
    // 로컬 서버에서 회원가입 페이지 확인
    console.log('1️⃣ 로컬 서버 회원가입 페이지 확인...');
    await page.goto('http://localhost:4000/auth?mode=signup', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(3000);

    // 콘솔 에러 캡처
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ 콘솔 에러:', msg.text());
      }
    });

    // 네트워크 요청 모니터링
    page.on('request', request => {
      if (request.failure()) {
        console.log('❌ 실패한 요청:', request.url());
      }
    });

    // 페이지 내용 확인
    const title = await page.title();
    console.log('페이지 제목:', title);

    // 무한 리렌더링 감지를 위한 DOM 변경 모니터링
    console.log('\n2️⃣ DOM 변경 모니터링 (5초)...');
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
    console.log('5초 동안 DOM 변경 횟수:', mutationCount);

    if (mutationCount > 100) {
      console.log('⚠️ 과도한 DOM 변경 감지! 무한 리렌더링 가능성 있음');
    }

    // React 컴포넌트 에러 확인
    const hasReactError = await page.evaluate(() => {
      const errorOverlay = document.querySelector('.runtime-error');
      return !!errorOverlay;
    });

    if (hasReactError) {
      console.log('❌ React 런타임 에러 발견!');
    }

    // 스크린샷
    await page.screenshot({ path: 'signup-page-issue.png', fullPage: true });
    console.log('\n📸 스크린샷 저장: signup-page-issue.png');

    // 회원가입 폼 요소 확인
    console.log('\n3️⃣ 회원가입 폼 요소 확인...');
    const emailInput = await page.locator('input[name="email"], input[type="email"]').count();
    const passwordInput = await page.locator('input[name="password"], input[type="password"]').count();
    const nameInput = await page.locator('input[name="name"]').count();

    console.log('이메일 입력 필드:', emailInput > 0 ? '✅' : '❌');
    console.log('비밀번호 입력 필드:', passwordInput > 0 ? '✅' : '❌');
    console.log('이름 입력 필드:', nameInput > 0 ? '✅' : '❌');

    // 애니메이션 관련 CSS 확인
    const hasAnimation = await page.evaluate(() => {
      const styles = window.getComputedStyle(document.body);
      return styles.animation !== 'none' || styles.transition !== 'all 0s ease 0s';
    });

    if (hasAnimation) {
      console.log('\n⚠️ 애니메이션/트랜지션 감지됨');
    }

  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message);
  } finally {
    console.log('\n===================================================');
    console.log('점검 완료');
    console.log('===================================================');
    await browser.close();
  }
})();