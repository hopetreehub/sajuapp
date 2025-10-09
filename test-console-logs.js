const playwright = require('playwright');

async function checkConsoleLogs() {
  console.log('🔍 브라우저 콘솔 로그 확인\n');

  const browser = await playwright.chromium.launch({
    headless: false,
    slowMo: 500
  });

  const page = await browser.newPage();

  const logs = [];

  // 모든 콘솔 메시지 캡처
  page.on('console', msg => {
    const text = msg.text();
    logs.push(text);
    console.log(`[브라우저] ${text}`);
  });

  try {
    console.log('📍 페이지 접속 중...\n');
    await page.goto('http://localhost:4000/saju', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(5000);

    console.log('\n📊 로그 요약:');
    const scoreLogsToDisplay = logs.filter(log => log.includes('getSajuScore'));

    if (scoreLogsToDisplay.length > 0) {
      console.log(`  발견된 getSajuScore 로그: ${scoreLogsToDisplay.length}개`);
      scoreLogsToDisplay.forEach(log => {
        console.log(`    ${log}`);
      });
    } else {
      console.log('  ❌ getSajuScore 로그가 없습니다');
      console.log('  → 점수 계산 함수가 호출되지 않았거나 모듈이 로드되지 않았을 수 있음');
    }

    console.log('\n📍 주능 클릭...');
    await page.getByRole('button', { name: /주능/ }).first().click();
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'console-logs-test.png', fullPage: true });
    console.log('📸 스크린샷: console-logs-test.png');

    console.log('\n⏳ 5초 후 종료...');
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('\n❌ 에러:', error.message);
  } finally {
    await browser.close();
  }
}

checkConsoleLogs().catch(console.error);
