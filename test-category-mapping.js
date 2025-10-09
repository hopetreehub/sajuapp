const playwright = require('playwright');

async function testCategoryMapping() {
  console.log('🔍 카테고리 매핑 디버깅\n');

  const browser = await playwright.chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const page = await browser.newPage();

  // JavaScript 주입: 카테고리 데이터 로깅
  await page.addInitScript(() => {
    // 전역 함수로 카테고리 정보 출력
    window.debugCategories = () => {
      const categories = window.SAJU_RADAR_CATEGORIES || [];
      console.log('\n=== 카테고리 디버그 정보 ===');
      categories.forEach((cat, idx) => {
        console.log(`${idx}. ${cat.id} (${cat.name})`);
        if (cat.subcategories && cat.subcategories.length > 0) {
          console.log(`   첫 하위: ${cat.subcategories[0].name}`);
        }
      });
    };
  });

  // 콘솔 로그 캡처
  page.on('console', msg => {
    const text = msg.text();
    if (!text.includes('[vite]') && !text.includes('[HMR]')) {
      console.log(`[브라우저] ${text}`);
    }
  });

  try {
    await page.goto('http://localhost:4000/saju', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // React 컴포넌트 상태 직접 확인
    const reactState = await page.evaluate(() => {
      // React 컴포넌트의 props나 state에 접근하는 방법
      const buttons = Array.from(document.querySelectorAll('button'));
      const categoryButtons = buttons.filter(b => {
        const text = b.textContent;
        return text && ['주본', '주건', '주물', '주연', '주재', '주업', '주생', '주능', '주흉'].some(cat => text.includes(cat));
      });

      return categoryButtons.map((b) => {
        // onClick 이벤트에서 전달되는 ID를 추출하려고 시도
        const onclick = b.onclick;
        return {
          text: b.textContent.trim().substring(0, 10),
          // className에서 선택 상태 확인
          isSelected: b.className.includes('bg-purple') || b.className.includes('purple-500'),
        };
      });
    });

    console.log('\n📊 카테고리 버튼 상태:');
    reactState.forEach((btn, idx) => {
      console.log(`  ${idx + 1}. ${btn.text} ${btn.isSelected ? '✅' : ''}`);
    });

    console.log('\n📍 주능 버튼 클릭 (8번째 버튼)...');
    const allButtons = await page.locator('button').all();
    const categoryPattern = /🎯|💪|💰|🤝|🎨|💼|🌱|⚡|⚠️/;
    const categoryButtons = [];

    for (const btn of allButtons) {
      const text = await btn.textContent();
      if (text && categoryPattern.test(text)) {
        categoryButtons.push(btn);
      }
    }

    console.log(`\n발견된 카테고리 버튼 수: ${categoryButtons.length}`);

    if (categoryButtons.length >= 8) {
      const junengButton = categoryButtons[7]; // 8번째 (인덱스 7)
      const buttonText = await junengButton.textContent();
      console.log(`8번째 버튼 텍스트: ${buttonText?.substring(0, 20)}`);

      await junengButton.click();
      await page.waitForTimeout(2000);

      // 클릭 후 상태 확인
      const afterClick = await page.evaluate(() => {
        // 하위 카테고리 탭 버튼들 찾기
        const allBtns = Array.from(document.querySelectorAll('button'));
        const subButtons = allBtns.filter(b => {
          const text = b.textContent?.trim() || '';
          // 숫자가 포함된 버튼 (개수 표시)
          return text.includes('(') && text.includes(')') && text.length < 30;
        });

        return {
          subcategories: subButtons.slice(0, 10).map(b => b.textContent?.trim())
        };
      });

      console.log('\n✅ 클릭 후 표시된 하위 카테고리:');
      afterClick.subcategories.forEach((sub, idx) => {
        console.log(`  ${idx + 1}. ${sub}`);
      });

      const expected = ['리더십', '창의력', '소통능력', '학습능력', '사업능력', '전문성'];
      const hasMatch = afterClick.subcategories.some(sub =>
        expected.some(exp => sub && sub.includes(exp))
      );

      if (hasMatch) {
        console.log('\n✅ 성공: 주능의 올바른 하위 카테고리 표시됨!');
      } else {
        console.log('\n❌ 실패: 여전히 잘못된 하위 카테고리 표시됨');
      }

      await page.screenshot({ path: 'category-mapping-debug.png', fullPage: true });
      console.log('\n📸 스크린샷: category-mapping-debug.png');
    }

    console.log('\n⏳ 10초 후 종료...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('\n❌ 에러:', error.message);
  } finally {
    await browser.close();
  }
}

testCategoryMapping().catch(console.error);
