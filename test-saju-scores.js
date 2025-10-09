const playwright = require('playwright');

async function testSajuScores() {
  console.log('🚀 사주 점수 시스템 브라우저 테스트 시작...\n');

  const browser = await playwright.chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. 메인 페이지 접속
    console.log('📍 Step 1: http://localhost:4000 접속...');
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 2. 사주 분석 페이지로 이동
    console.log('📍 Step 2: 사주 분석 페이지 이동...');
    const sajuLink = page.locator('text=사주 분석').or(page.locator('a[href*="saju"]'));
    if (await sajuLink.count() > 0) {
      await sajuLink.first().click();
      await page.waitForTimeout(2000);
    } else {
      await page.goto('http://localhost:4000/saju-analysis', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
    }

    console.log('✅ 현재 URL:', page.url());

    // 3. 주능 카테고리 확인
    console.log('\n📍 Step 3: 주능 카테고리 점수 확인...');
    const junungButton = page.locator('button:has-text("주능")').or(page.locator('text=주능'));

    if (await junungButton.count() > 0) {
      await junungButton.first().click();
      await page.waitForTimeout(1500);

      // 주능 항목들의 점수 확인
      const scoreElements = await page.locator('text=/\\d+점/').all();
      console.log('   주능 항목 수:', scoreElements.length);

      const scores = [];
      for (const el of scoreElements.slice(0, 10)) {
        const text = await el.textContent();
        const scoreMatch = text.match(/(\d+)/);
        if (scoreMatch) {
          scores.push(parseInt(scoreMatch[1]));
        }
      }

      if (scores.length > 0) {
        console.log('   ✅ 주능 점수 샘플:', scores.slice(0, 5).join(', '));
        console.log('   📊 점수 범위:', Math.min(...scores), '~', Math.max(...scores));
      } else {
        console.log('   ⚠️  주능 점수를 찾을 수 없음');
      }
    } else {
      console.log('   ⚠️  주능 버튼을 찾을 수 없음');
    }

    // 4. 주흉 카테고리 확인
    console.log('\n📍 Step 4: 주흉 카테고리 점수 확인...');
    const juhungButton = page.locator('button:has-text("주흉")').or(page.locator('text=주흉'));

    if (await juhungButton.count() > 0) {
      await juhungButton.first().click();
      await page.waitForTimeout(1500);

      const scoreElements = await page.locator('text=/\\d+점/').all();
      console.log('   주흉 항목 수:', scoreElements.length);

      const scores = [];
      for (const el of scoreElements.slice(0, 10)) {
        const text = await el.textContent();
        const scoreMatch = text.match(/(\d+)/);
        if (scoreMatch) {
          scores.push(parseInt(scoreMatch[1]));
        }
      }

      if (scores.length > 0) {
        console.log('   ✅ 주흉 점수 샘플:', scores.slice(0, 5).join(', '));
        console.log('   📊 점수 범위:', Math.min(...scores), '~', Math.max(...scores));

        // 모두 90점인지 확인
        const all90 = scores.every(s => s === 90);
        if (all90) {
          console.log('   ❌ 문제: 모든 점수가 90점입니다!');
        } else {
          console.log('   ✅ 점수가 다양하게 분포되어 있습니다!');
        }
      } else {
        console.log('   ⚠️  주흉 점수를 찾을 수 없음');
      }
    } else {
      console.log('   ⚠️  주흉 버튼을 찾을 수 없음');
    }

    // 5. 시간대별 점수 확인
    console.log('\n📍 Step 5: 시간대별 점수 차이 확인...');
    const timeFrames = ['기본', '오늘', '이달', '올해'];
    const timeScores = {};

    for (const timeFrame of timeFrames) {
      const timeButton = page.locator(`button:has-text("${timeFrame}")`);
      if (await timeButton.count() > 0) {
        await timeButton.first().click();
        await page.waitForTimeout(1000);

        const scoreElements = await page.locator('text=/\\d+점/').all();
        const scores = [];

        for (const el of scoreElements.slice(0, 5)) {
          const text = await el.textContent();
          const scoreMatch = text.match(/(\d+)/);
          if (scoreMatch) {
            scores.push(parseInt(scoreMatch[1]));
          }
        }

        if (scores.length > 0) {
          timeScores[timeFrame] = scores;
          console.log(`   ${timeFrame}: [${scores.join(', ')}]`);
        }
      }
    }

    // 6. 스크린샷 캡처
    console.log('\n📍 Step 6: 스크린샷 캡처...');
    await page.screenshot({ path: 'saju-test-screenshot.png', fullPage: true });
    console.log('   ✅ 스크린샷 저장: saju-test-screenshot.png');

    // 7. 콘솔 에러 확인
    console.log('\n📍 Step 7: 브라우저 콘솔 확인...');
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('   ❌ 콘솔 에러:', msg.text());
      }
    });

    // 최종 보고서
    console.log('\n' + '='.repeat(60));
    console.log('📊 테스트 결과 요약');
    console.log('='.repeat(60));

    if (Object.keys(timeScores).length > 0) {
      const baseScores = timeScores['기본'] || [];
      const todayScores = timeScores['오늘'] || [];

      if (baseScores.length > 0 && todayScores.length > 0) {
        const baseAvg = baseScores.reduce((a, b) => a + b, 0) / baseScores.length;
        const todayAvg = todayScores.reduce((a, b) => a + b, 0) / todayScores.length;

        console.log(`✅ 기본 평균 점수: ${baseAvg.toFixed(1)}점`);
        console.log(`✅ 오늘 평균 점수: ${todayAvg.toFixed(1)}점`);
        console.log(`✅ 점수 차이: ${Math.abs(todayAvg - baseAvg).toFixed(1)}점`);

        if (Math.abs(todayAvg - baseAvg) < 1) {
          console.log('⚠️  경고: 시간대별 점수 차이가 거의 없습니다!');
        } else {
          console.log('✅ 시간대별 점수 차별화 성공!');
        }
      }
    }

    console.log('='.repeat(60));
    console.log('\n✅ 테스트 완료! 브라우저를 5초 후 종료합니다...');

  } catch (error) {
    console.error('\n❌ 테스트 실패:', error.message);
    console.error(error.stack);
  } finally {
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

testSajuScores().catch(console.error);
