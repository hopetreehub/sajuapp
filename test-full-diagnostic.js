const playwright = require('playwright');

async function fullDiagnostic() {
  console.log('🔍 주능/주흉 점수 완전 진단 시작...\n');

  const browser = await playwright.chromium.launch({
    headless: false,
    slowMo: 500
  });

  const page = await browser.newPage();

  // 콘솔 로그 캡처
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ 브라우저 에러: ${msg.text()}`);
    }
  });

  try {
    console.log('📍 1단계: 사주 분석 페이지 접속...');
    await page.goto('http://localhost:4000/saju', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);
    console.log('   ✅ 페이지 로드 완료\n');

    // ========== 주능 완전 테스트 ==========
    console.log('=' .repeat(70));
    console.log('📊 2단계: 주능 카테고리 상세 분석');
    console.log('='.repeat(70));

    const junungButton = page.getByRole('button', { name: /주능/ }).first();
    await junungButton.click();
    await page.waitForTimeout(3000);

    // 주능 하위 탭들 확인
    const junungTabs = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const tabTexts = buttons
        .map(b => b.textContent?.trim())
        .filter(t => t && t.length > 0 && t.length < 20);
      return tabTexts;
    });

    console.log(`\n   발견된 버튼 수: ${junungTabs.length}개`);
    console.log(`   버튼들: ${junungTabs.slice(0, 15).join(', ')}`);

    // 각 하위 탭 테스트
    const junungSubcategories = ['리더십', '창의력', '소통능력', '학습능력', '사업능력', '전문성'];

    for (const subcat of junungSubcategories) {
      try {
        console.log(`\n   📌 "${subcat}" 하위 탭 테스트...`);

        // 버튼 찾기 및 클릭
        const subcatButton = page.locator(`button:has-text("${subcat}")`).first();
        const isVisible = await subcatButton.isVisible().catch(() => false);

        if (isVisible) {
          await subcatButton.click();
          await page.waitForTimeout(2000);

          // 점수 데이터 추출
          const scores = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            if (!canvas) return { error: 'Canvas not found' };

            // 화면에 표시된 텍스트에서 점수 찾기
            const bodyText = document.body.innerText;
            const scoreMatches = bodyText.match(/\d{1,3}점/g);

            return {
              success: true,
              scoresFound: scoreMatches ? scoreMatches.length : 0,
              sampleScores: scoreMatches ? scoreMatches.slice(0, 10) : []
            };
          });

          if (scores.success) {
            console.log(`      ✅ 점수 발견: ${scores.scoresFound}개`);
            if (scores.sampleScores.length > 0) {
              console.log(`      샘플: ${scores.sampleScores.join(', ')}`);
            }
          } else {
            console.log(`      ❌ 에러: ${scores.error}`);
          }
        } else {
          console.log(`      ⚠️  "${subcat}" 버튼을 찾을 수 없습니다`);
        }
      } catch (e) {
        console.log(`      ❌ "${subcat}" 테스트 실패: ${e.message}`);
      }
    }

    await page.screenshot({ path: 'diagnostic-junung.png', fullPage: true });
    console.log('\n   📸 스크린샷: diagnostic-junung.png');

    // ========== 주흉 완전 테스트 ==========
    console.log('\n' + '='.repeat(70));
    console.log('📊 3단계: 주흉 카테고리 상세 분석');
    console.log('='.repeat(70));

    const juhungButton = page.getByRole('button', { name: /주흉/ }).first();
    await juhungButton.click();
    await page.waitForTimeout(3000);

    const juhungSubcategories = ['건강주의', '재물주의', '관계주의', '사고주의', '법률주의', '사업주의'];

    for (const subcat of juhungSubcategories) {
      try {
        console.log(`\n   📌 "${subcat}" 하위 탭 테스트...`);

        const subcatButton = page.locator(`button:has-text("${subcat}")`).first();
        const isVisible = await subcatButton.isVisible().catch(() => false);

        if (isVisible) {
          await subcatButton.click();
          await page.waitForTimeout(2000);

          const scores = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            if (!canvas) return { error: 'Canvas not found' };

            const bodyText = document.body.innerText;
            const scoreMatches = bodyText.match(/\d{1,3}점/g);

            return {
              success: true,
              scoresFound: scoreMatches ? scoreMatches.length : 0,
              sampleScores: scoreMatches ? scoreMatches.slice(0, 10) : []
            };
          });

          if (scores.success) {
            console.log(`      ✅ 점수 발견: ${scores.scoresFound}개`);
            if (scores.sampleScores.length > 0) {
              console.log(`      샘플: ${scores.sampleScores.join(', ')}`);
            }
          } else {
            console.log(`      ❌ 에러: ${scores.error}`);
          }
        } else {
          console.log(`      ⚠️  "${subcat}" 버튼을 찾을 수 없습니다`);
        }
      } catch (e) {
        console.log(`      ❌ "${subcat}" 테스트 실패: ${e.message}`);
      }
    }

    await page.screenshot({ path: 'diagnostic-juhung.png', fullPage: true });
    console.log('\n   📸 스크린샷: diagnostic-juhung.png');

    // ========== 최종 진단 ==========
    console.log('\n' + '='.repeat(70));
    console.log('📊 4단계: 최종 진단 결과');
    console.log('='.repeat(70));

    console.log('\n✅ 테스트 완료!');
    console.log('   - 주능 6개 하위 카테고리 테스트 완료');
    console.log('   - 주흉 6개 하위 카테고리 테스트 완료');
    console.log('   - 스크린샷 2개 저장 완료');

    console.log('\n⏳ 5초 후 브라우저 종료...');

  } catch (error) {
    console.error('\n❌ 에러 발생:', error.message);
    console.error(error.stack);

    try {
      await page.screenshot({ path: 'diagnostic-error.png', fullPage: true });
      console.log('📸 에러 스크린샷: diagnostic-error.png');
    } catch (e) {}
  } finally {
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

fullDiagnostic().catch(console.error);
