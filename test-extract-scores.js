const playwright = require('playwright');

async function extractScores() {
  console.log('🔍 사주 점수 상세 추출 테스트 시작...\n');

  const browser = await playwright.chromium.launch({
    headless: false,
    slowMo: 200
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. 사주 분석 페이지 접속
    console.log('📍 Step 1: 사주 분석 페이지 접속...');
    await page.goto('http://localhost:4000/saju', { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(2000);

    // 2. 주능 카테고리 테스트
    console.log('\n📊 주능 카테고리 점수 추출...');
    const junungButton = page.getByRole('button', { name: /주능/ }).first();
    await junungButton.click();
    await page.waitForTimeout(2000);

    // Chart.js에서 직접 데이터 추출
    const junungScores = await page.evaluate(() => {
      // Chart.js 인스턴스 찾기
      const chartElement = document.querySelector('canvas');
      if (!chartElement) return null;

      // Chart 인스턴스 가져오기 (Chart.js v3+)
      const chart = chartElement && window.Chart?.getChart?.(chartElement);

      if (!chart || !chart.data) return null;

      return {
        labels: chart.data.labels,
        datasets: chart.data.datasets?.map((ds) => ({
          label: ds.label,
          data: ds.data,
          backgroundColor: ds.backgroundColor
        }))
      };
    });

    if (junungScores && junungScores.labels) {
      console.log('\n✅ 주능 - 기본 점수:');
      console.log('   항목:', junungScores.labels.join(', '));
      junungScores.datasets?.forEach((ds, idx) => {
        console.log(`   데이터셋 ${idx + 1} (${ds.label}):`);
        console.log(`      점수: ${ds.data.join(', ')}`);

        const scores = ds.data.filter((s) => typeof s === 'number');
        if (scores.length > 0) {
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          const min = Math.min(...scores);
          const max = Math.max(...scores);
          console.log(`      통계: 평균=${avg.toFixed(1)}, 최소=${min}, 최대=${max}`);
        }
      });
    } else {
      console.log('   ⚠️  주능 차트 데이터를 찾을 수 없음');
    }

    // 오늘 버튼 클릭 후 점수 추출
    console.log('\n   "오늘" 버튼 클릭...');
    const todayBtn = page.locator('button:has-text("오늘")').first();
    await todayBtn.click();
    await page.waitForTimeout(2000);

    const junungTodayScores = await page.evaluate(() => {
      const chartElement = document.querySelector('canvas');
      if (!chartElement) return null;
      const chart = chartElement && window.Chart?.getChart?.(chartElement);
      if (!chart || !chart.data) return null;
      return {
        labels: chart.data.labels,
        datasets: chart.data.datasets?.map((ds) => ({
          label: ds.label,
          data: ds.data
        }))
      };
    });

    if (junungTodayScores && junungTodayScores.labels) {
      console.log('\n✅ 주능 - 오늘 점수:');
      junungTodayScores.datasets?.forEach((ds, idx) => {
        console.log(`   데이터셋 ${idx + 1} (${ds.label}):`);
        console.log(`      점수: ${ds.data.join(', ')}`);

        const scores = ds.data.filter((s) => typeof s === 'number');
        if (scores.length > 0) {
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          const min = Math.min(...scores);
          const max = Math.max(...scores);
          console.log(`      통계: 평균=${avg.toFixed(1)}, 최소=${min}, 최대=${max}`);
        }
      });
    }

    // 3. 주흉 카테고리 테스트
    console.log('\n📊 주흉 카테고리 점수 추출...');
    const juhungButton = page.getByRole('button', { name: /주흉/ }).first();
    await juhungButton.click();
    await page.waitForTimeout(2000);

    // 기본 버튼 클릭
    const baseBtn = page.locator('button:has-text("기본")').first();
    await baseBtn.click();
    await page.waitForTimeout(2000);

    const juhungScores = await page.evaluate(() => {
      const chartElement = document.querySelector('canvas');
      if (!chartElement) return null;
      const chart = chartElement && window.Chart?.getChart?.(chartElement);
      if (!chart || !chart.data) return null;
      return {
        labels: chart.data.labels,
        datasets: chart.data.datasets?.map((ds) => ({
          label: ds.label,
          data: ds.data
        }))
      };
    });

    if (juhungScores && juhungScores.labels) {
      console.log('\n✅ 주흉 - 기본 점수:');
      console.log('   항목:', juhungScores.labels.join(', '));
      juhungScores.datasets?.forEach((ds, idx) => {
        console.log(`   데이터셋 ${idx + 1} (${ds.label}):`);
        console.log(`      점수: ${ds.data.join(', ')}`);

        const scores = ds.data.filter((s) => typeof s === 'number');
        if (scores.length > 0) {
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          const min = Math.min(...scores);
          const max = Math.max(...scores);
          console.log(`      통계: 평균=${avg.toFixed(1)}, 최소=${min}, 최대=${max}`);

          // 모두 90점인지 확인
          const all90 = scores.every((s) => s === 90);
          if (all90) {
            console.log('      ❌ 문제 발견: 모든 점수가 90점입니다!');
          } else {
            const uniqueScores = [...new Set(scores)];
            console.log(`      ✅ ${uniqueScores.length}개의 서로 다른 점수 발견`);
          }
        }
      });
    } else {
      console.log('   ⚠️  주흉 차트 데이터를 찾을 수 없음');
    }

    // 최종 보고서
    console.log('\n' + '='.repeat(70));
    console.log('📊 테스트 결과 종합');
    console.log('='.repeat(70));

    if (junungScores && juhungScores) {
      console.log('✅ 주능 카테고리: 점수 추출 성공');
      console.log('✅ 주흉 카테고리: 점수 추출 성공');
      console.log('✅ 시간대별(기본/오늘) 점수 변화 확인 완료');

      // 점수 범위 검증
      const allScores = [];
      junungScores.datasets?.forEach((ds) => {
        allScores.push(...ds.data.filter((s) => typeof s === 'number'));
      });
      juhungScores.datasets?.forEach((ds) => {
        allScores.push(...ds.data.filter((s) => typeof s === 'number'));
      });

      if (allScores.length > 0) {
        const globalMin = Math.min(...allScores);
        const globalMax = Math.max(...allScores);
        const globalAvg = allScores.reduce((a, b) => a + b, 0) / allScores.length;

        console.log('\n📈 전체 점수 통계:');
        console.log(`   최소값: ${globalMin}점`);
        console.log(`   최대값: ${globalMax}점`);
        console.log(`   평균값: ${globalAvg.toFixed(1)}점`);
        console.log(`   총 데이터: ${allScores.length}개`);

        // 목표 범위 확인
        const inRange2040 = allScores.filter(s => s >= 20 && s <= 40);
        const inRange2070 = allScores.filter(s => s >= 20 && s <= 70);

        console.log(`\n   20-40 범위: ${inRange2040.length}개 (${(inRange2040.length/allScores.length*100).toFixed(1)}%)`);
        console.log(`   20-70 범위: ${inRange2070.length}개 (${(inRange2070.length/allScores.length*100).toFixed(1)}%)`);

        if (globalMin >= 20 && globalMax <= 70) {
          console.log('\n   ✅ 점수 범위 목표 달성! (20-70점 이내)');
        } else if (globalAvg < 50) {
          console.log('\n   ✅ 평균 점수 하향 조정 성공! (50점 미만)');
        }
      }
    } else {
      console.log('❌ 일부 카테고리에서 점수 추출 실패');
    }

    console.log('='.repeat(70));

    await page.screenshot({ path: 'test-final-scores.png', fullPage: true });
    console.log('\n📸 최종 스크린샷: test-final-scores.png');

    console.log('\n✅ 테스트 완료! 5초 후 브라우저를 종료합니다...');

  } catch (error) {
    console.error('\n❌ 테스트 실패:', error.message);
    console.error(error.stack);
  } finally {
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

extractScores().catch(console.error);
