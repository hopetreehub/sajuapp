const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Navigating to login page...');
  await page.goto('http://localhost:4000/auth?mode=login');

  // 페이지 로드 대기
  await page.waitForLoadState('networkidle');

  // 데모 계정 버튼 찾기
  try {
    const demoButton = await page.$('button:has-text("데모 계정으로 체험하기")');
    if (demoButton) {
      console.log('❌ 데모 계정 버튼이 발견되었습니다!');
      const buttonHTML = await demoButton.evaluate(el => el.outerHTML);
      console.log('버튼 HTML:', buttonHTML);
    } else {
      console.log('✅ 데모 계정 버튼이 없습니다.');
    }
  } catch (error) {
    console.log('✅ 데모 계정 버튼을 찾을 수 없습니다.');
  }

  // 페이지 소스 확인
  const pageContent = await page.content();
  if (pageContent.includes('데모 계정')) {
    console.log('❌ 페이지에 "데모 계정" 텍스트가 있습니다!');
    // 해당 부분 찾기
    const lines = pageContent.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('데모 계정')) {
        console.log(`Line ${index}: ${line.trim()}`);
      }
    });
  } else {
    console.log('✅ 페이지에 "데모 계정" 텍스트가 없습니다.');
  }

  // 스크린샷 캡처
  await page.screenshot({ path: 'login-page-check.png', fullPage: true });
  console.log('스크린샷 저장: login-page-check.png');

  await browser.close();
})();
