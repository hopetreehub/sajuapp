const playwright = require('playwright');

async function checkScoreValues() {
  console.log('🔍 주능/주흉 실제 점수 값 확인 시작...\n');

  const browser = await playwright.chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:4000/saju', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // ========== 주능 점수 확인 ==========
    console.log('=' .repeat(70));
    console.log('📊 주능 카테고리 점수 확인');
    console.log('='.repeat(70));

    const junungButton = page.getByRole('button', { name: /주능/ }).first();
    await junungButton.click();
    await page.waitForTimeout(2000);

    // Chart.js에서 데이터 추출
    const junungData = await page.evaluate(() => {
      // Canvas 찾기
      const canvas = document.querySelector('canvas');
      if (!canvas) return { error: 'Canvas not found' };

      // Chart.js 인스턴스 찾기 (여러 방법 시도)
      let chart = null;

      // 방법 1: Chart.getChart
      if (window.Chart && window.Chart.getChart) {
        chart = window.Chart.getChart(canvas);
      }

      // 방법 2: canvas.__chart__
      if (!chart && canvas.__chart__) {
        chart = canvas.__chart__;
      }

      // 방법 3: Chart.instances
      if (!chart && window.Chart && window.Chart.instances) {
        const instances = Object.values(window.Chart.instances);
        chart = instances[0];
      }

      if (chart && chart.data) {
        return {
          success: true,
          labels: chart.data.labels,
          datasets: chart.data.datasets.map(ds => ({
            label: ds.label,
            data: ds.data,
            backgroundColor: ds.backgroundColor
          }))
        };
      }

      return { error: 'Chart instance not found', hasChart: window.Chart !== undefined };
    });

    console.log('\n주능 차트 데이터:');
    if (junungData.success) {
      console.log(`   라벨: ${junungData.labels?.join(', ')}`);
      junungData.datasets?.forEach((ds, idx) => {
        console.log(`\n   데이터셋 ${idx + 1}: ${ds.label}`);
        console.log(`   점수: ${ds.data?.join(', ')}`);

        const scores = ds.data.filter(s => typeof s === 'number');
        if (scores.length > 0) {
          const allZero = scores.every(s => s === 0);
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          console.log(`   평균: ${avg.toFixed(1)}점`);
          console.log(`   최소: ${Math.min(...scores)}점, 최대: ${Math.max(...scores)}점`);

          if (allZero) {
            console.log('   ❌ 문제 발견: 모든 점수가 0점입니다!');
          } else {
            console.log('   ✅ 점수 다양성 확인');
          }
        }
      });
    } else {
      console.log(`   ❌ 에러: ${junungData.error}`);
      console.log(`   Chart 라이브러리 존재: ${junungData.hasChart}`);
    }

    await page.screenshot({ path: 'score-check-junung.png', fullPage: true });

    // ========== 주흉 점수 확인 ==========
    console.log('\n' + '='.repeat(70));
    console.log('📊 주흉 카테고리 점수 확인');
    console.log('='.repeat(70));

    const juhungButton = page.getByRole('button', { name: /주흉/ }).first();
    await juhungButton.click();
    await page.waitForTimeout(2000);

    const juhungData = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return { error: 'Canvas not found' };

      let chart = null;
      if (window.Chart && window.Chart.getChart) {
        chart = window.Chart.getChart(canvas);
      }
      if (!chart && canvas.__chart__) {
        chart = canvas.__chart__;
      }
      if (!chart && window.Chart && window.Chart.instances) {
        const instances = Object.values(window.Chart.instances);
        chart = instances[0];
      }

      if (chart && chart.data) {
        return {
          success: true,
          labels: chart.data.labels,
          datasets: chart.data.datasets.map(ds => ({
            label: ds.label,
            data: ds.data,
            backgroundColor: ds.backgroundColor
          }))
        };
      }

      return { error: 'Chart instance not found' };
    });

    console.log('\n주흉 차트 데이터:');
    if (juhungData.success) {
      console.log(`   라벨: ${juhungData.labels?.join(', ')}`);
      juhungData.datasets?.forEach((ds, idx) => {
        console.log(`\n   데이터셋 ${idx + 1}: ${ds.label}`);
        console.log(`   점수: ${ds.data?.join(', ')}`);

        const scores = ds.data.filter(s => typeof s === 'number');
        if (scores.length > 0) {
          const all90 = scores.every(s => s === 90);
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          console.log(`   평균: ${avg.toFixed(1)}점`);
          console.log(`   최소: ${Math.min(...scores)}점, 최대: ${Math.max(...scores)}점`);

          if (all90) {
            console.log('   ❌ 문제 발견: 모든 점수가 90점입니다!');
          } else {
            console.log('   ✅ 점수 다양성 확인');
          }
        }
      });
    } else {
      console.log(`   ❌ 에러: ${juhungData.error}`);
    }

    await page.screenshot({ path: 'score-check-juhung.png', fullPage: true });

    // 최종 보고
    console.log('\n' + '='.repeat(70));
    console.log('📊 최종 검증 결과');
    console.log('='.repeat(70));

    if (!junungData.success || !juhungData.success) {
      console.log('❌ Chart.js 데이터 추출 실패');
      console.log('⚠️  스크린샷으로 수동 확인 필요');
    }

    console.log('\n5초 후 브라우저 종료...');

  } catch (error) {
    console.error('\n❌ 에러:', error.message);
    console.error(error.stack);

    try {
      await page.screenshot({ path: 'score-check-error.png', fullPage: true });
    } catch (e) {}
  } finally {
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

checkScoreValues().catch(console.error);
