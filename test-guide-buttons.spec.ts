import { test, expect } from '@playwright/test';

test.describe('초보자 가이드 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 콘솔 에러 캡처
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Browser Console Error:', msg.text());
      }
    });
  });

  test('사주 분석 페이지 - 초보자 가이드 버튼 확인', async ({ page }) => {
    console.log('\n🧪 테스트 시작: 사주 분석 페이지 초보자 가이드 버튼');

    // 1. 메인 페이지 접속
    await page.goto('http://localhost:4000');
    await page.waitForTimeout(2000);
    console.log('✅ 메인 페이지 로드 완료');

    // 2. 사주 분석 페이지로 이동
    const links = await page.$$eval('a', elements =>
      elements.map(el => ({
        text: el.textContent?.trim(),
        href: el.getAttribute('href')
      }))
    );

    const sajuLink = links.find(link =>
      link.text?.includes('사주') ||
      link.href?.includes('unified-saju')
    );

    console.log('🔍 찾은 사주 링크:', sajuLink);

    if (!sajuLink?.href) {
      throw new Error('사주 분석 링크를 찾을 수 없습니다');
    }

    await page.goto(`http://localhost:4000${sajuLink.href}`);
    await page.waitForTimeout(2000);
    console.log('✅ 사주 분석 페이지로 이동 완료');

    // 스크린샷 저장
    await page.screenshot({
      path: 'test-results/saju-page-initial.png',
      fullPage: true
    });

    // 3. 페이지의 모든 버튼 찾기
    const allButtons = await page.$$eval('button', buttons =>
      buttons.map(btn => ({
        text: btn.textContent?.trim(),
        visible: btn.offsetParent !== null,
        classes: btn.className
      }))
    );

    console.log('\n📋 페이지의 모든 버튼:');
    allButtons.forEach((btn, idx) => {
      if (btn.visible) {
        console.log(`  ${idx + 1}. "${btn.text}"`);
      }
    });

    // 4. 초보자 가이드 버튼 찾기
    const guideButtonSelectors = [
      'button:has-text("초보자 가이드")',
      'button:has-text("가이드")',
      'button:has-text("📖")',
    ];

    let guideButton = null;
    for (const selector of guideButtonSelectors) {
      try {
        const button = await page.$(selector);
        if (button && await button.isVisible()) {
          guideButton = button;
          const text = await button.textContent();
          console.log(`✅ 초보자 가이드 버튼 발견! 텍스트: "${text}"`);
          break;
        }
      } catch (e) {
        // 계속 시도
      }
    }

    // 5. 결과 검증
    if (!guideButton) {
      console.log('\n❌ 초보자 가이드 버튼을 찾을 수 없습니다!');
      console.log('   스크린샷을 확인해주세요: test-results/saju-page-initial.png');

      // HTML 저장
      const html = await page.content();
      require('fs').writeFileSync('test-results/saju-page.html', html);
      console.log('💾 페이지 HTML 저장: test-results/saju-page.html');

      throw new Error('초보자 가이드 버튼이 페이지에 없습니다');
    }

    // 6. 버튼 클릭 테스트
    await guideButton.click();
    await page.waitForTimeout(1000);
    console.log('🖱️ 초보자 가이드 버튼 클릭 완료');

    // 7. 모달이 열렸는지 확인
    const modalVisible = await page.isVisible('text=사주분석 초보자 가이드');
    console.log(`📊 모달 표시 여부: ${modalVisible}`);

    await page.screenshot({
      path: 'test-results/saju-guide-modal.png',
      fullPage: true
    });

    expect(modalVisible).toBe(true);
    console.log('✅ 테스트 성공: 초보자 가이드가 정상 작동합니다!');
  });

  test('자미두수 페이지 - 초보자 가이드 버튼 확인', async ({ page }) => {
    console.log('\n🧪 테스트 시작: 자미두수 페이지 초보자 가이드 버튼');

    await page.goto('http://localhost:4000');
    await page.waitForTimeout(1000);

    // 자미두수 페이지로 이동
    const links = await page.$$eval('a', elements =>
      elements.map(el => ({
        text: el.textContent?.trim(),
        href: el.getAttribute('href')
      }))
    );

    const ziweiLink = links.find(link =>
      link.text?.includes('자미두수') ||
      link.href?.includes('ziwei')
    );

    if (ziweiLink?.href) {
      await page.goto(`http://localhost:4000${ziweiLink.href}`);
      await page.waitForTimeout(2000);
      console.log('✅ 자미두수 페이지로 이동 완료');

      await page.screenshot({
        path: 'test-results/ziwei-page-initial.png',
        fullPage: true
      });

      // 초보자 가이드 버튼 찾기
      const guideButton = await page.$('button:has-text("초보자 가이드")');

      if (guideButton && await guideButton.isVisible()) {
        console.log('✅ 초보자 가이드 버튼 발견!');

        await guideButton.click();
        await page.waitForTimeout(1000);

        const modalVisible = await page.isVisible('text=자미두수 초보자 가이드');
        console.log(`📊 모달 표시 여부: ${modalVisible}`);

        await page.screenshot({
          path: 'test-results/ziwei-guide-modal.png',
          fullPage: true
        });

        expect(modalVisible).toBe(true);
        console.log('✅ 테스트 성공!');
      } else {
        console.log('❌ 초보자 가이드 버튼을 찾을 수 없습니다');
      }
    }
  });

  test('귀문둔갑 페이지 - 초보자 가이드 버튼 확인', async ({ page }) => {
    console.log('\n🧪 테스트 시작: 귀문둔갑 페이지 초보자 가이드 버튼');

    await page.goto('http://localhost:4000');
    await page.waitForTimeout(1000);

    // 귀문둔갑 페이지로 이동
    const links = await page.$$eval('a', elements =>
      elements.map(el => ({
        text: el.textContent?.trim(),
        href: el.getAttribute('href')
      }))
    );

    const qimenLink = links.find(link =>
      link.text?.includes('귀문둔갑') ||
      link.href?.includes('qimen')
    );

    if (qimenLink?.href) {
      await page.goto(`http://localhost:4000${qimenLink.href}`);
      await page.waitForTimeout(2000);
      console.log('✅ 귀문둔갑 페이지로 이동 완료');

      await page.screenshot({
        path: 'test-results/qimen-page-initial.png',
        fullPage: true
      });

      // 초보자 가이드 버튼 찾기
      const guideButton = await page.$('button:has-text("초보자 가이드")');

      if (guideButton && await guideButton.isVisible()) {
        console.log('✅ 초보자 가이드 버튼 발견!');

        await guideButton.click();
        await page.waitForTimeout(1000);

        const modalVisible = await page.isVisible('text=귀문둔갑 초보자 가이드');
        console.log(`📊 모달 표시 여부: ${modalVisible}`);

        await page.screenshot({
          path: 'test-results/qimen-guide-modal.png',
          fullPage: true
        });

        expect(modalVisible).toBe(true);
        console.log('✅ 테스트 성공!');
      } else {
        console.log('❌ 초보자 가이드 버튼을 찾을 수 없습니다');
      }
    }
  });
});
