const playwright = require('playwright');

async function debugZeroScores() {
  console.log('🔍 주능 0점 문제 상세 디버깅\n');

  const browser = await playwright.chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const page = await browser.newPage();

  // 브라우저 콘솔 로그 캡처
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    if (text.includes('점수') || text.includes('score') || text.includes('getSajuScore')) {
      console.log(`[브라우저] ${text}`);
    }
  });

  try {
    console.log('📍 페이지 접속...');
    await page.goto('http://localhost:4000/saju', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('\n📍 주능 카테고리 클릭...');
    await page.getByRole('button', { name: /주능/ }).first().click();
    await page.waitForTimeout(3000);

    // 페이지 내 모든 텍스트에서 점수 찾기
    const allText = await page.evaluate(() => document.body.innerText);

    console.log('\n페이지에서 "점" 또는 숫자 패턴 찾기:');
    const lines = allText.split('\n');
    const scoreLines = lines.filter(line => {
      return line.match(/\d+점/) || line.match(/점수.*\d+/) || line.match(/score.*\d+/i);
    });

    if (scoreLines.length > 0) {
      console.log('  발견된 점수 관련 텍스트:');
      scoreLines.forEach(line => console.log(`    ${line.trim()}`));
    } else {
      console.log('  ❌ 점수 관련 텍스트를 찾을 수 없습니다!');
    }

    // Chart.js 차트 데이터 직접 추출
    console.log('\n📊 Chart.js 데이터 직접 추출 시도...');
    const chartData = await page.evaluate(() => {
      // 모든 canvas 요소 찾기
      const canvases = Array.from(document.querySelectorAll('canvas'));
      console.log(`[DEBUG] Canvas 개수: ${canvases.length}`);

      if (canvases.length === 0) {
        return { error: 'Canvas 요소가 없습니다' };
      }

      const canvas = canvases[0];
      console.log('[DEBUG] Canvas found:', canvas.id, canvas.className);

      // Chart.js 인스턴스 찾기 - 여러 방법 시도
      let chart = null;

      // 방법 1: Chart.getChart (Chart.js v3+)
      if (window.Chart && typeof window.Chart.getChart === 'function') {
        chart = window.Chart.getChart(canvas);
        console.log('[DEBUG] Method 1 (Chart.getChart):', chart ? 'Found' : 'Not found');
      }

      // 방법 2: canvas.__chart__
      if (!chart && canvas.__chart__) {
        chart = canvas.__chart__;
        console.log('[DEBUG] Method 2 (canvas.__chart__):', 'Found');
      }

      // 방법 3: Chart.instances
      if (!chart && window.Chart && window.Chart.instances) {
        const instances = Object.values(window.Chart.instances);
        if (instances.length > 0) {
          chart = instances[0];
          console.log('[DEBUG] Method 3 (Chart.instances):', 'Found');
        }
      }

      // 방법 4: 전역 변수 검색
      if (!chart) {
        console.log('[DEBUG] Searching window object for chart...');
        for (let key in window) {
          if (window[key] && typeof window[key] === 'object' && window[key].data && window[key].data.datasets) {
            chart = window[key];
            console.log('[DEBUG] Found chart in window.' + key);
            break;
          }
        }
      }

      if (!chart) {
        console.log('[DEBUG] Chart.js 정보:', {
          hasChart: typeof window.Chart !== 'undefined',
          chartVersion: window.Chart ? window.Chart.version : 'N/A'
        });
        return { error: 'Chart 인스턴스를 찾을 수 없습니다' };
      }

      if (!chart.data || !chart.data.datasets) {
        return { error: 'Chart 데이터 구조가 예상과 다릅니다' };
      }

      const dataset = chart.data.datasets[0];
      const scores = dataset.data || [];

      console.log('[DEBUG] Chart data:', {
        labels: chart.data.labels,
        dataLength: scores.length,
        sampleData: scores.slice(0, 5)
      });

      return {
        success: true,
        labels: chart.data.labels || [],
        scores: scores,
        allZero: scores.every(s => s === 0),
        min: scores.length > 0 ? Math.min(...scores.filter(s => typeof s === 'number')) : null,
        max: scores.length > 0 ? Math.max(...scores.filter(s => typeof s === 'number')) : null,
        avg: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null
      };
    });

    console.log('\nChart.js 추출 결과:');
    if (chartData.error) {
      console.log(`  ❌ ${chartData.error}`);
    } else {
      console.log(`  ✅ 성공`);
      console.log(`  라벨 개수: ${chartData.labels?.length || 0}`);
      console.log(`  점수 개수: ${chartData.scores?.length || 0}`);
      if (chartData.scores && chartData.scores.length > 0) {
        console.log(`  점수 샘플: ${chartData.scores.slice(0, 10).join(', ')}`);
        console.log(`  최소값: ${chartData.min}`);
        console.log(`  최대값: ${chartData.max}`);
        console.log(`  평균값: ${chartData.avg?.toFixed(2)}`);

        if (chartData.allZero) {
          console.log('\n  ❌❌❌ 심각: 모든 점수가 0점입니다! ❌❌❌');
        } else {
          console.log('\n  ✅ 점수가 다양합니다');
        }
      }
    }

    await page.screenshot({ path: 'debug-junung-zero.png', fullPage: true });
    console.log('\n📸 스크린샷: debug-junung-zero.png');

    // 주흉도 확인
    console.log('\n' + '='.repeat(70));
    console.log('📍 주흉 카테고리 클릭 (비교용)...');
    await page.getByRole('button', { name: /주흉/ }).first().click();
    await page.waitForTimeout(3000);

    const juhungChartData = await page.evaluate(() => {
      const canvases = Array.from(document.querySelectorAll('canvas'));
      if (canvases.length === 0) return { error: 'Canvas not found' };

      const canvas = canvases[0];
      let chart = null;

      if (window.Chart && typeof window.Chart.getChart === 'function') {
        chart = window.Chart.getChart(canvas);
      }
      if (!chart && canvas.__chart__) {
        chart = canvas.__chart__;
      }

      if (!chart || !chart.data || !chart.data.datasets) {
        return { error: 'Chart not found' };
      }

      const scores = chart.data.datasets[0].data || [];
      return {
        success: true,
        labels: chart.data.labels || [],
        scores: scores,
        all90: scores.every(s => s === 90),
        min: scores.length > 0 ? Math.min(...scores.filter(s => typeof s === 'number')) : null,
        max: scores.length > 0 ? Math.max(...scores.filter(s => typeof s === 'number')) : null,
        avg: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null
      };
    });

    console.log('\n주흉 Chart.js 추출 결과:');
    if (juhungChartData.success) {
      console.log(`  점수 샘플: ${juhungChartData.scores.slice(0, 10).join(', ')}`);
      console.log(`  최소값: ${juhungChartData.min}`);
      console.log(`  최대값: ${juhungChartData.max}`);
      console.log(`  평균값: ${juhungChartData.avg?.toFixed(2)}`);

      if (juhungChartData.all90) {
        console.log('\n  ❌ 모든 점수가 90점입니다!');
      } else {
        console.log('\n  ✅ 점수가 다양합니다');
      }
    }

    await page.screenshot({ path: 'debug-juhung-compare.png', fullPage: true });
    console.log('📸 스크린샷: debug-juhung-compare.png');

    console.log('\n' + '='.repeat(70));
    console.log('📊 최종 진단:');
    console.log('='.repeat(70));

    if (chartData.success && chartData.allZero) {
      console.log('\n❌ 확인됨: 주능 점수가 모두 0점입니다!');
      console.log('   원인: getSajuScore() 함수가 0을 반환하거나 호출되지 않음');
      console.log('   다음 단계: sajuRadarData.ts의 getSajuScore 호출 확인 필요');
    }

    console.log('\n⏳ 10초 후 브라우저 종료...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('\n❌ 에러:', error.message);
    console.error(error.stack);

    try {
      await page.screenshot({ path: 'debug-error.png', fullPage: true });
    } catch (e) {}
  } finally {
    await browser.close();
  }
}

debugZeroScores().catch(console.error);
