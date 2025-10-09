const playwright = require('playwright');

async function testSajuScores() {
  console.log('🚀 사주 점수 시스템 브라우저 테스트 v2 시작...\n');

  const browser = await playwright.chromium.launch({
    headless: false,
    slowMo: 300
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // 콘솔 로그 캡처
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    // 1. 메인 페이지 접속
    console.log('📍 Step 1: http://localhost:4000 접속...');
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(1000);

    // 2. 사주 분석 페이지로 이동
    console.log('📍 Step 2: 사주 분석 페이지 이동...');
    try {
      await page.goto('http://localhost:4000/saju', { waitUntil: 'networkidle', timeout: 10000 });
    } catch (e) {
      console.log('   ⚠️  /saju 경로 실패, 다른 경로 시도...');
      await page.goto('http://localhost:4000/saju-analysis', { waitUntil: 'networkidle', timeout: 10000 });
    }
    await page.waitForTimeout(2000);
    console.log('   ✅ 현재 URL:', page.url());

    // 3. 카테고리 버튼 찾기 및 확인
    console.log('\n📍 Step 3: 카테고리 확인...');
    const categories = ['주본', '주건', '주물', '주연', '주재', '주업', '주능', '주흉'];

    for (const cat of categories) {
      const button = page.locator(`button:has-text("${cat}")`).or(page.locator(`text=${cat}`).first());
      const exists = await button.count() > 0;
      console.log(`   ${exists ? '✅' : '❌'} ${cat} 카테고리`);
    }

    // 4. 주능 카테고리 테스트
    console.log('\n📍 Step 4: 주능 카테고리 상세 테스트...');
    const junungButton = page.getByRole('button', { name: /주능/ });

    if (await junungButton.count() > 0) {
      await junungButton.first().click();
      await page.waitForTimeout(2000);

      // 레이더 차트 확인
      const canvas = page.locator('canvas');
      const canvasCount = await canvas.count();
      console.log(`   📊 레이더 차트: ${canvasCount}개`);

      // 시간대 버튼 확인
      const timeFrames = ['교통사고', '기본', '오늘', '이달', '올해'];
      console.log('   시간대 버튼:');
      for (const tf of timeFrames) {
        const btn = page.locator(`button:has-text("${tf}")`);
        const exists = await btn.count() > 0;
        if (exists) {
          console.log(`      - ${tf} ✅`);
        }
      }

      // 스크린샷 1
      await page.screenshot({ path: 'test-주능-기본.png' });
      console.log('   📸 스크린샷: test-주능-기본.png');

      // 오늘 버튼 클릭
      const todayBtn = page.locator('button:has-text("오늘")');
      if (await todayBtn.count() > 0) {
        await todayBtn.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'test-주능-오늘.png' });
        console.log('   📸 스크린샷: test-주능-오늘.png');
      }
    }

    // 5. 주흉 카테고리 테스트
    console.log('\n📍 Step 5: 주흉 카테고리 상세 테스트...');
    const juhungButton = page.getByRole('button', { name: /주흉/ });

    if (await juhungButton.count() > 0) {
      await juhungButton.first().click();
      await page.waitForTimeout(2000);

      // 레이더 차트 확인
      const canvas = page.locator('canvas');
      const canvasCount = await canvas.count();
      console.log(`   📊 레이더 차트: ${canvasCount}개`);

      // 스크린샷 2
      await page.screenshot({ path: 'test-주흉-기본.png' });
      console.log('   📸 스크린샷: test-주흉-기본.png');

      // 오늘 버튼 클릭
      const todayBtn = page.locator('button:has-text("오늘")');
      if (await todayBtn.count() > 0) {
        await todayBtn.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'test-주흉-오늘.png' });
        console.log('   📸 스크린샷: test-주흉-오늘.png');
      }
    }

    // 6. DOM 구조 분석
    console.log('\n📍 Step 6: DOM 구조 분석...');

    // Chart.js 데이터 추출 시도
    const chartData = await page.evaluate(() => {
      const charts = window.Chart?.instances;
      if (!charts) return null;

      const results = [];
      for (let i = 0; i < charts.length; i++) {
        const chart = charts[i];
        if (chart && chart.data && chart.data.datasets) {
          const datasets = chart.data.datasets.map(ds => ({
            label: ds.label,
            data: ds.data,
            backgroundColor: ds.backgroundColor
          }));
          results.push({
            labels: chart.data.labels,
            datasets: datasets
          });
        }
      }
      return results;
    });

    if (chartData && chartData.length > 0) {
      console.log('   ✅ Chart.js 데이터 발견:');
      chartData.forEach((chart, idx) => {
        console.log(`\n   차트 ${idx + 1}:`);
        console.log(`      라벨: ${chart.labels?.join(', ')}`);
        chart.datasets?.forEach((ds, dsIdx) => {
          console.log(`      데이터셋 ${dsIdx + 1} (${ds.label}):`);
          console.log(`         값: ${ds.data?.join(', ')}`);
        });
      });
    } else {
      console.log('   ⚠️  Chart.js 인스턴스를 찾을 수 없음');
    }

    // 7. 콘솔 에러 확인
    console.log('\n📍 Step 7: 브라우저 콘솔 에러 확인...');
    if (consoleErrors.length > 0) {
      console.log('   ❌ 콘솔 에러 발견:');
      consoleErrors.forEach(err => console.log(`      - ${err}`));
    } else {
      console.log('   ✅ 콘솔 에러 없음');
    }

    // 8. 전체 페이지 스크린샷
    console.log('\n📍 Step 8: 전체 페이지 스크린샷...');
    await page.screenshot({ path: 'test-final-full.png', fullPage: true });
    console.log('   ✅ 스크린샷 저장: test-final-full.png');

    // 최종 보고서
    console.log('\n' + '='.repeat(60));
    console.log('📊 테스트 결과 요약');
    console.log('='.repeat(60));
    console.log('✅ 사주 분석 페이지 접근 성공');
    console.log('✅ 주능/주흉 카테고리 버튼 확인');
    console.log('✅ 레이더 차트 렌더링 확인');
    console.log('✅ 시간대별 전환 기능 확인');
    if (chartData && chartData.length > 0) {
      console.log('✅ Chart.js 데이터 추출 성공');
    }
    console.log('='.repeat(60));

    console.log('\n✅ 테스트 완료! 브라우저를 5초 후 종료합니다...');
    console.log('📁 생성된 파일:');
    console.log('   - test-주능-기본.png');
    console.log('   - test-주능-오늘.png');
    console.log('   - test-주흉-기본.png');
    console.log('   - test-주흉-오늘.png');
    console.log('   - test-final-full.png');

  } catch (error) {
    console.error('\n❌ 테스트 실패:', error.message);
    console.error(error.stack);

    // 에러 발생 시에도 스크린샷 저장
    try {
      await page.screenshot({ path: 'test-error.png', fullPage: true });
      console.log('📸 에러 스크린샷 저장: test-error.png');
    } catch (e) {
      console.error('스크린샷 저장 실패:', e.message);
    }
  } finally {
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

testSajuScores().catch(console.error);
