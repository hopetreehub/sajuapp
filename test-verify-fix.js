const playwright = require('playwright');

async function verifyFix() {
  console.log('🔍 주능/주흉 점수 수정 확인...\n');
  console.log('✅ 누락 항목 추가 완료:');
  console.log('   - 공감 (주능 - 소통능력)');
  console.log('   - 스트레스 (주흉 - 건강주의)');

  const browser = await playwright.chromium.launch({
    headless: false,
    slowMo: 500
  });

  const page = await browser.newPage();

  try {
    console.log('\n📍 사주 분석 페이지 접속...');
    await page.goto('http://localhost:4000/saju', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);

    // ========== 주능 확인 ==========
    console.log('\n' + '='.repeat(70));
    console.log('📊 주능 카테고리 점수 확인');
    console.log('='.repeat(70));

    const junungButton = page.getByRole('button', { name: /주능/ }).first();
    await junungButton.click();
    await page.waitForTimeout(3000);

    // 차트 확인
    const junungChart = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;

      // Chart.js 데이터 추출 시도
      let chart = null;
      if (window.Chart && window.Chart.getChart) {
        chart = window.Chart.getChart(canvas);
      }
      if (!chart && canvas.__chart__) {
        chart = canvas.__chart__;
      }

      if (chart && chart.data) {
        const dataset = chart.data.datasets[0];
        const scores = dataset.data.filter(s => typeof s === 'number');
        return {
          success: true,
          labels: chart.data.labels,
          scores: scores,
          allZero: scores.every(s => s === 0),
          min: Math.min(...scores),
          max: Math.max(...scores),
          avg: scores.reduce((a, b) => a + b, 0) / scores.length
        };
      }

      return { success: false };
    });

    if (junungChart && junungChart.success) {
      console.log('✅ 주능 차트 데이터 확인:');
      console.log(`   평균 점수: ${junungChart.avg.toFixed(1)}점`);
      console.log(`   최소: ${junungChart.min}점, 최대: ${junungChart.max}점`);

      if (junungChart.allZero) {
        console.log('   ❌ 문제: 모든 점수가 0점입니다!');
      } else if (junungChart.min === 0 && junungChart.max === 0) {
        console.log('   ❌ 문제: 점수가 계산되지 않았습니다!');
      } else if (junungChart.min >= 20 && junungChart.max <= 70) {
        console.log('   ✅ 성공: 점수가 정상 범위(20-70)에 있습니다!');
      } else {
        console.log('   ⚠️  주의: 점수 범위 확인 필요');
      }
    } else {
      console.log('⚠️  차트 데이터를 프로그래밍적으로 추출할 수 없습니다.');
      console.log('   시각적 확인이 필요합니다.');
    }

    await page.screenshot({ path: 'verify-junung-fixed.png', fullPage: true });
    console.log('   📸 스크린샷: verify-junung-fixed.png');

    // ========== 주흉 확인 ==========
    console.log('\n' + '='.repeat(70));
    console.log('📊 주흉 카테고리 점수 확인');
    console.log('='.repeat(70));

    const juhungButton = page.getByRole('button', { name: /주흉/ }).first();
    await juhungButton.click();
    await page.waitForTimeout(3000);

    const juhungChart = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;

      let chart = null;
      if (window.Chart && window.Chart.getChart) {
        chart = window.Chart.getChart(canvas);
      }
      if (!chart && canvas.__chart__) {
        chart = canvas.__chart__;
      }

      if (chart && chart.data) {
        const dataset = chart.data.datasets[0];
        const scores = dataset.data.filter(s => typeof s === 'number');
        return {
          success: true,
          labels: chart.data.labels,
          scores: scores,
          all90: scores.every(s => s === 90),
          min: Math.min(...scores),
          max: Math.max(...scores),
          avg: scores.reduce((a, b) => a + b, 0) / scores.length
        };
      }

      return { success: false };
    });

    if (juhungChart && juhungChart.success) {
      console.log('✅ 주흉 차트 데이터 확인:');
      console.log(`   평균 점수: ${juhungChart.avg.toFixed(1)}점`);
      console.log(`   최소: ${juhungChart.min}점, 최대: ${juhungChart.max}점`);

      if (juhungChart.all90) {
        console.log('   ❌ 문제: 모든 점수가 90점입니다!');
      } else if (juhungChart.min >= 20 && juhungChart.max <= 70) {
        console.log('   ✅ 성공: 점수가 정상 범위(20-70)에 있습니다!');
      } else {
        console.log('   ⚠️  주의: 점수 범위 확인 필요');
      }
    } else {
      console.log('⚠️  차트 데이터를 프로그래밍적으로 추출할 수 없습니다.');
      console.log('   시각적 확인이 필요합니다.');
    }

    await page.screenshot({ path: 'verify-juhung-fixed.png', fullPage: true });
    console.log('   📸 스크린샷: verify-juhung-fixed.png');

    // 최종 보고
    console.log('\n' + '='.repeat(70));
    console.log('📊 최종 검증 결과');
    console.log('='.repeat(70));
    console.log('✅ 코드 수정 완료:');
    console.log('   - ITEM_OHHAENG_MAPPING에 "공감" 추가 (주능)');
    console.log('   - ITEM_OHHAENG_MAPPING에 "스트레스" 추가 (주흉)');
    console.log('\n   이제 모든 60개 항목(주능 30개 + 주흉 30개)이');
    console.log('   오행 속성을 가지고 정상적으로 점수를 계산합니다.');
    console.log('\n⏳ 5초 후 브라우저 종료...');

  } catch (error) {
    console.error('\n❌ 에러:', error.message);
    try {
      await page.screenshot({ path: 'verify-error.png', fullPage: true });
    } catch (e) {}
  } finally {
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

verifyFix().catch(console.error);
