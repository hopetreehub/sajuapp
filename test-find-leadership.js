const playwright = require('playwright');

async function findLeadershipTab() {
  console.log('🔍 주능 > 리더십 탭 찾기\n');

  const browser = await playwright.chromium.launch({
    headless: false,
    slowMo: 800
  });

  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:4000/saju', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('📍 주능 카테고리 클릭...');
    await page.getByRole('button', { name: /주능/ }).first().click();
    await page.waitForTimeout(3000);

    // 페이지의 모든 버튼 텍스트 출력
    const allButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.map(b => ({
        text: b.textContent?.trim() || '',
        visible: b.offsetParent !== null,
        className: b.className
      })).filter(b => b.text.length > 0 && b.text.length < 30);
    });

    console.log(`\n발견된 버튼들 (총 ${allButtons.length}개):`);
    allButtons.slice(0, 40).forEach((btn, idx) => {
      console.log(`  ${idx + 1}. "${btn.text}" (표시: ${btn.visible ? '✓' : '✗'})`);
    });

    // "리더십" 버튼 찾기
    const leadershipButtons = allButtons.filter(b => b.text.includes('리더십'));
    console.log(`\n"리더십" 버튼 검색 결과: ${leadershipButtons.length}개`);
    if (leadershipButtons.length > 0) {
      leadershipButtons.forEach(btn => {
        console.log(`  - "${btn.text}" (표시: ${btn.visible ? '✓' : '✗'})`);
      });

      console.log('\n리더십 버튼 클릭 시도...');
      try {
        await page.locator('button:has-text("리더십")').first().click();
        await page.waitForTimeout(3000);
        console.log('  ✅ 리더십 클릭 성공!');

        await page.screenshot({ path: 'leadership-tab.png', fullPage: true });
        console.log('  📸 스크린샷: leadership-tab.png');
      } catch (e) {
        console.log(`  ❌ 클릭 실패: ${e.message}`);
      }
    } else {
      console.log('  ❌ "리더십" 버튼을 찾을 수 없습니다!');
      console.log('  → UI가 주능의 하위 카테고리를 렌더링하지 않고 있습니다');
    }

    await page.screenshot({ path: 'all-buttons-shown.png', fullPage: true });
    console.log('\n📸 전체 화면 스크린샷: all-buttons-shown.png');

    console.log('\n⏳ 10초 후 종료...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('\n❌ 에러:', error.message);
  } finally {
    await browser.close();
  }
}

findLeadershipTab().catch(console.error);
