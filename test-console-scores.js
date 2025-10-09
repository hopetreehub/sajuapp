const playwright = require('playwright');

async function testConsoleScores() {
  console.log('🔍 콘솔에서 직접 점수 계산 테스트\n');

  const browser = await playwright.chromium.launch({
    headless: false,
    slowMo: 300
  });

  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:4000/saju', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('📍 주능/주흉 항목 점수 직접 계산 테스트\n');

    // 주능 항목들의 점수 계산
    const junungScores = await page.evaluate(() => {
      // getSajuScore 함수가 전역에 있는지 확인
      const testItems = [
        '통솔력', '결단력', '책임감', '영향력', '선득력',
        '공감', '의사소통', '경청', '설득', '표현력'
      ];

      // 임시 사주 데이터
      const testSaju = {
        year: { gan: '갑', ji: '자' },
        month: { gan: '병', ji: '인' },
        day: { gan: '무', ji: '진' },
        time: { gan: '경', ji: '신' },
        ohHaengBalance: { 목: 30, 화: 25, 토: 20, 금: 15, 수: 10 }
      };

      const results = {};

      // calculateSajuScore 함수가 있는지 확인
      if (typeof window.calculateSajuScore !== 'function') {
        return { error: 'calculateSajuScore function not found in window' };
      }

      testItems.forEach(item => {
        try {
          const score = window.calculateSajuScore(item, testSaju);
          results[item] = score;
        } catch (e) {
          results[item] = `Error: ${e.message}`;
        }
      });

      return { success: true, scores: results };
    });

    console.log('주능 항목 점수:');
    if (junungScores.error) {
      console.log(`   ❌ ${junungScores.error}`);
      console.log('   ℹ️  함수가 전역 스코프에 없습니다. 모듈로 번들링되었을 수 있습니다.');
    } else if (junungScores.success) {
      Object.entries(junungScores.scores).forEach(([item, score]) => {
        console.log(`   ${item}: ${score}점`);
      });
    }

    // 주흉 항목들의 점수 계산
    const juhungScores = await page.evaluate(() => {
      const testItems = [
        '질병', '상처', '만성질환', '스트레스', '정신건강',
        '재물손실', '사기조심', '투자주의'
      ];

      const testSaju = {
        year: { gan: '갑', ji: '자' },
        month: { gan: '병', ji: '인' },
        day: { gan: '무', ji: '진' },
        time: { gan: '경', ji: '신' },
        ohHaengBalance: { 목: 30, 화: 25, 토: 20, 금: 15, 수: 10 }
      };

      const results = {};

      if (typeof window.calculateSajuScore !== 'function') {
        return { error: 'calculateSajuScore function not found' };
      }

      testItems.forEach(item => {
        try {
          const score = window.calculateSajuScore(item, testSaju);
          results[item] = score;
        } catch (e) {
          results[item] = `Error: ${e.message}`;
        }
      });

      return { success: true, scores: results };
    });

    console.log('\n주흉 항목 점수:');
    if (juhungScores.error) {
      console.log(`   ❌ ${juhungScores.error}`);
    } else if (juhungScores.success) {
      Object.entries(juhungScores.scores).forEach(([item, score]) => {
        console.log(`   ${item}: ${score}점`);
      });
    }

    // 실제 렌더링된 데이터 확인
    console.log('\n📍 실제 페이지에 렌더링된 데이터 확인...\n');

    await page.getByRole('button', { name: /주능/ }).first().click();
    await page.waitForTimeout(2000);

    const renderedText = await page.evaluate(() => {
      return document.body.innerText;
    });

    // "점" 텍스트가 포함된 줄 찾기
    const scoreLines = renderedText.split('\n').filter(line => line.includes('점') && /\d/.test(line));
    console.log('주능 페이지에서 발견된 점수 관련 텍스트:');
    scoreLines.slice(0, 20).forEach(line => {
      console.log(`   ${line.trim()}`);
    });

    await page.screenshot({ path: 'console-test-junung.png', fullPage: true });

    await page.getByRole('button', { name: /주흉/ }).first().click();
    await page.waitForTimeout(2000);

    const juhungRenderedText = await page.evaluate(() => {
      return document.body.innerText;
    });

    const juhungScoreLines = juhungRenderedText.split('\n').filter(line => line.includes('점') && /\d/.test(line));
    console.log('\n주흉 페이지에서 발견된 점수 관련 텍스트:');
    juhungScoreLines.slice(0, 20).forEach(line => {
      console.log(`   ${line.trim()}`);
    });

    await page.screenshot({ path: 'console-test-juhung.png', fullPage: true });

    console.log('\n✅ 테스트 완료');
    console.log('   📸 스크린샷: console-test-junung.png, console-test-juhung.png');
    console.log('\n⏳ 5초 후 종료...');

  } catch (error) {
    console.error('\n❌ 에러:', error.message);
    console.error(error.stack);
  } finally {
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

testConsoleScores().catch(console.error);
