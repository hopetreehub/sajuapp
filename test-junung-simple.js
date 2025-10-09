const playwright = require('playwright');

async function testJunung() {
  console.log('🔍 주능 카테고리 간단 테스트...\n');

  const browser = await playwright.chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('📍 사주 분석 페이지 접속...');
    await page.goto('http://localhost:4000/saju', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    console.log('\n📍 주능 카테고리 클릭...');
    const junungButton = page.getByRole('button', { name: /주능/ }).first();
    await junungButton.click();
    await page.waitForTimeout(3000);

    console.log('   ✅ 주능 카테고리 활성화됨');

    // 페이지 내용 확인
    const pageContent = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const buttonTexts = buttons.map(b => b.textContent?.trim()).filter(t => t && t.length < 30);

      const hasCanvas = document.querySelector('canvas') !== null;

      return {
        hasCanvas,
        buttonCount: buttons.length,
        sampleButtons: buttonTexts.slice(0, 20)
      };
    });

    console.log(`\n   Canvas 존재: ${pageContent.hasCanvas ? '✅' : '❌'}`);
    console.log(`   버튼 개수: ${pageContent.buttonCount}개`);
    console.log(`   버튼 샘플: ${pageContent.sampleButtons.slice(0, 10).join(', ')}`);

    // 스크린샷 캡처
    await page.screenshot({ path: 'junung-main.png', fullPage: true });
    console.log('\n   📸 스크린샷: junung-main.png');

    // 첫 번째 하위 탭이 있으면 클릭
    console.log('\n📍 첫 번째 하위 탭 찾기...');
    const subTabs = await page.locator('button').all();

    for (const tab of subTabs.slice(0, 20)) {
      const text = await tab.textContent();
      if (text && text.length > 0 && text.length < 20 && !text.includes('주능') && !text.includes('기본')) {
        console.log(`   발견: "${text}"`);

        try {
          await tab.click();
          await page.waitForTimeout(2000);
          console.log(`   ✅ "${text}" 클릭 성공`);

          await page.screenshot({ path: 'junung-sub-tab.png', fullPage: true });
          console.log(`   📸 스크린샷: junung-sub-tab.png`);
          break;
        } catch (e) {
          console.log(`   ⚠️  "${text}" 클릭 실패`);
        }
      }
    }

    console.log('\n✅ 테스트 완료!');
    console.log('5초 후 브라우저 종료...');

  } catch (error) {
    console.error('\n❌ 에러:', error.message);

    try {
      await page.screenshot({ path: 'junung-error.png', fullPage: true });
      console.log('📸 에러 스크린샷: junung-error.png');
    } catch (e) {}
  } finally {
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

testJunung().catch(console.error);
