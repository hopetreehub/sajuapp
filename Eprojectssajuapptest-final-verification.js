const playwright = require('playwright');

async function testFinalVerification() {
  console.log('🎯 최종 검증 테스트: 주능과 주흉\n');

  const browser = await playwright.chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:4000/saju', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // 모든 카테고리 버튼 찾기
    const allButtons = await page.locator('button').all();
    const categoryPattern = /🎯|💪|💰|🤝|🎨|💼|🌱|⚡|⚠️/;
    const categoryButtons = [];

    for (const btn of allButtons) {
      const text = await btn.textContent();
      if (text && categoryPattern.test(text)) {
        categoryButtons.push(btn);
      }
    }

    console.log(`발견된 카테고리 버튼 수: ${categoryButtons.length}\n`);

    // 주능 테스트
    console.log('📍 1. 주능 카테고리 테스트');
    if (categoryButtons.length >= 8) {
      const junengButton = categoryButtons[7]; // 8번째
      await junengButton.click();
      await page.waitForTimeout(2000);

      const junengSubs = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns
          .filter(b => {
            const text = b.textContent?.trim() || '';
            return text.includes('(') && text.includes(')') && text.length < 30;
          })
          .slice(0, 10)
          .map(b => b.textContent?.trim());
      });

      console.log('  하위 카테고리:', junengSubs.join(', '));

      const expectedJuneung = ['리더십', '창의력', '소통능력', '학습능력', '사업능력', '전문성'];
      const hasJuneung = expectedJuneung.every(exp =>
        junengSubs.some(sub => sub && sub.includes(exp))
      );

      if (hasJuneung) {
        console.log('  ✅ 주능: 정상 작동 - 모든 6개 하위 카테고리 표시됨\n');
      } else {
        console.log('  ❌ 주능: 오류 - 일부 하위 카테고리 누락\n');
      }
    }

    // 주흉 테스트
    console.log('📍 2. 주흉 카테고리 테스트');
    if (categoryButtons.length >= 9) {
      const juhyungButton = categoryButtons[8]; // 9번째
      await juhyungButton.click();
      await page.waitForTimeout(2000);

      const juhyungSubs = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns
          .filter(b => {
            const text = b.textContent?.trim() || '';
            return text.includes('(') && text.includes(')') && text.length < 30;
          })
          .slice(0, 10)
          .map(b => b.textContent?.trim());
      });

      console.log('  하위 카테고리:', juhyungSubs.join(', '));

      const expectedJuhyung = ['건강주의', '재물주의', '관계주의', '사고주의', '법률주의', '사업주의'];
      const hasJuhyung = expectedJuhyung.every(exp =>
        juhyungSubs.some(sub => sub && sub.includes(exp))
      );

      if (hasJuhyung) {
        console.log('  ✅ 주흉: 정상 작동 - 모든 6개 하위 카테고리 표시됨\n');
      } else {
        console.log('  ❌ 주흉: 오류 - 일부 하위 카테고리 누락\n');
      }

      await page.screenshot({ path: 'final-verification.png', fullPage: true });
      console.log('📸 스크린샷: final-verification.png\n');
    }

    console.log('🎊 최종 검증 완료!');
    console.log('\n⏳ 10초 후 종료...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('\n❌ 에러:', error.message);
  } finally {
    await browser.close();
  }
}

testFinalVerification().catch(console.error);
