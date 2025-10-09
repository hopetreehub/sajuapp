const playwright = require('playwright');

async function testCategoryIndex() {
  console.log('🔍 카테고리 인덱스 확인 테스트\n');

  const browser = await playwright.chromium.launch({
    headless: false,
    slowMo: 800
  });

  const page = await browser.newPage();

  // 브라우저 콘솔 로그 캡처
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('selectedCategory') || text.includes('주능') || text.includes('juneung')) {
      console.log(`[브라우저] ${text}`);
    }
  });

  try {
    await page.goto('http://localhost:4000/saju', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // 페이지에서 카테고리 데이터 추출
    const categoryInfo = await page.evaluate(() => {
      // React DevTools가 없어도 DOM에서 정보 추출
      const buttons = Array.from(document.querySelectorAll('button'));
      const categoryButtons = buttons.filter(b => {
        const text = b.textContent;
        return text && ['주본', '주건', '주물', '주연', '주재', '주업', '주생', '주능', '주흉'].some(cat => text.includes(cat));
      });

      return categoryButtons.map((b, idx) => ({
        index: idx,
        text: b.textContent.trim(),
        className: b.className
      }));
    });

    console.log('📊 발견된 카테고리 버튼:');
    categoryInfo.forEach(cat => {
      console.log(`  ${cat.index + 1}. ${cat.text}`);
    });

    console.log('\n📍 주능 버튼 클릭...');
    const junengButton = await page.locator('button:has-text("주능")').first();
    await junengButton.click();
    await page.waitForTimeout(2000);

    // 선택된 카테고리 확인
    const selectedCategoryInfo = await page.evaluate(() => {
      // URL 파라미터나 선택된 상태 확인
      const selectedButton = document.querySelector('button[class*="bg-purple"], button[class*="selected"]');

      // 표시된 하위 카테고리 버튼들 확인
      const allButtons = Array.from(document.querySelectorAll('button'));
      const subButtons = allButtons.filter(b => {
        const text = b.textContent?.trim() || '';
        // 숫자가 포함된 버튼 (개수 표시)
        return text.length > 0 && text.includes('(') && text.includes(')');
      });

      return {
        selectedButton: selectedButton ? selectedButton.textContent.trim() : 'none',
        subButtons: subButtons.slice(0, 10).map(b => b.textContent.trim())
      };
    });

    console.log('\n✅ 선택된 카테고리 버튼:', selectedCategoryInfo.selectedButton);
    console.log('\n📋 표시된 하위 카테고리 (최대 10개):');
    selectedCategoryInfo.subButtons.forEach((btn, idx) => {
      console.log(`  ${idx + 1}. ${btn}`);
    });

    // 예상되는 주능 하위 카테고리
    const expectedSubcategories = ['리더십', '창의력', '소통능력', '학습능력', '사업능력', '전문성'];
    const hasExpected = expectedSubcategories.some(sub =>
      selectedCategoryInfo.subButtons.some(btn => btn.includes(sub))
    );

    if (hasExpected) {
      console.log('\n✅ 정상: 주능의 올바른 하위 카테고리 표시됨');
    } else {
      console.log('\n❌ 오류: 주능의 하위 카테고리가 아닌 다른 카테고리 표시됨');
      console.log('  → 기대: 리더십, 창의력, 소통능력, 학습능력, 사업능력, 전문성');
      console.log(`  → 실제: ${selectedCategoryInfo.subButtons.join(', ')}`);
    }

    await page.screenshot({ path: 'category-index-test.png', fullPage: true });
    console.log('\n📸 스크린샷: category-index-test.png');

    console.log('\n⏳ 10초 후 종료...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('\n❌ 에러:', error.message);
  } finally {
    await browser.close();
  }
}

testCategoryIndex().catch(console.error);
