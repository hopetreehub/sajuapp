import { test, expect } from '@playwright/test';

test.describe('사주 분석 페이지 AI 버튼 테스트', () => {
  test('AI 질문 버튼이 보이는지 확인', async ({ page }) => {
    // 1. 사주 분석 페이지로 이동
    await page.goto('http://localhost:4000');

    console.log('✅ 페이지 로드 완료');

    // 페이지 스크린샷
    await page.screenshot({ path: 'screenshot-1-initial.png', fullPage: true });
    console.log('📸 초기 화면 스크린샷 저장: screenshot-1-initial.png');

    // 2. 네비게이션에서 사주 분석 메뉴 찾기
    await page.waitForTimeout(2000);

    // 모든 링크 출력
    const links = await page.$$eval('a', elements => elements.map(el => ({
      text: el.textContent?.trim(),
      href: el.getAttribute('href')
    })));
    console.log('🔗 페이지의 모든 링크:', links);

    // 사주 관련 링크 찾기
    const sajuLink = links.find(link =>
      link.text?.includes('사주') ||
      link.href?.includes('saju') ||
      link.href?.includes('unified')
    );

    console.log('🎯 찾은 사주 링크:', sajuLink);

    if (sajuLink?.href) {
      await page.goto(`http://localhost:4000${sajuLink.href}`);
      console.log(`✅ 사주 분석 페이지로 이동: ${sajuLink.href}`);
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'screenshot-2-saju-page.png', fullPage: true });
      console.log('📸 사주 분석 페이지 스크린샷 저장: screenshot-2-saju-page.png');
    }

    // 3. 고객 선택 드롭다운 찾기
    const customerSelectors = [
      'select',
      '[role="combobox"]',
      'button:has-text("고객")',
      'div:has-text("고객을 선택")'
    ];

    let customerSelector = null;
    for (const selector of customerSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          customerSelector = element;
          console.log(`✅ 고객 선택 요소 찾음: ${selector}`);
          break;
        }
      } catch (e) {
        // 계속 시도
      }
    }

    if (customerSelector) {
      await customerSelector.click();
      await page.waitForTimeout(1000);

      await page.screenshot({ path: 'screenshot-3-customer-dropdown.png', fullPage: true });
      console.log('📸 고객 드롭다운 열림 스크린샷: screenshot-3-customer-dropdown.png');

      // 첫 번째 고객 선택
      const firstOption = await page.$('option:not([value=""]), [role="option"]');
      if (firstOption) {
        await firstOption.click();
        console.log('✅ 첫 번째 고객 선택 완료');
        await page.waitForTimeout(2000);

        await page.screenshot({ path: 'screenshot-4-customer-selected.png', fullPage: true });
        console.log('📸 고객 선택 후 스크린샷: screenshot-4-customer-selected.png');
      }
    }

    // 4. AI 버튼 찾기
    const aiButtonSelectors = [
      'button:has-text("AI")',
      'button:has-text("질문")',
      'button:has-text("🤖")',
      '[class*="ai"]',
      '[class*="AI"]'
    ];

    console.log('\n🔍 AI 버튼 찾기 시작...');
    let aiButton = null;

    for (const selector of aiButtonSelectors) {
      try {
        const buttons = await page.$$(selector);
        if (buttons.length > 0) {
          console.log(`✅ 버튼 발견! selector: ${selector}, 개수: ${buttons.length}`);
          aiButton = buttons[0];

          const buttonText = await aiButton.textContent();
          const isVisible = await aiButton.isVisible();
          console.log(`   텍스트: "${buttonText}", 보임: ${isVisible}`);

          if (isVisible && (buttonText?.includes('AI') || buttonText?.includes('질문') || buttonText?.includes('🤖'))) {
            console.log('✅ AI 버튼 찾음!');
            break;
          }
        }
      } catch (e) {
        // 계속 시도
      }
    }

    // 5. 페이지의 모든 버튼 출력
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
        console.log(`  ${idx + 1}. "${btn.text}" (${btn.classes})`);
      }
    });

    // 6. 최종 스크린샷
    await page.screenshot({ path: 'screenshot-5-final.png', fullPage: true });
    console.log('\n📸 최종 스크린샷 저장: screenshot-5-final.png');

    // 7. HTML 저장
    const html = await page.content();
    require('fs').writeFileSync('page-content.html', html);
    console.log('💾 페이지 HTML 저장: page-content.html');

    // 결과 출력
    if (aiButton) {
      console.log('\n✅ 테스트 성공: AI 버튼이 발견되었습니다!');
    } else {
      console.log('\n❌ 테스트 실패: AI 버튼을 찾을 수 없습니다.');
      console.log('   스크린샷과 HTML을 확인해주세요.');
    }
  });
});
