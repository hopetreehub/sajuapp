const playwright = require('playwright');

async function testVercelProduction() {
  console.log('🔍 Vercel 프로덕션 환경 테스트\n');
  console.log('URL: https://sajuapp-prod.vercel.app/saju\n');

  const browser = await playwright.chromium.launch({
    headless: false,
    slowMo: 500
  });

  const page = await browser.newPage();

  // 콘솔 로그 캡처
  page.on('console', msg => {
    const text = msg.text();
    if (!text.includes('[vite]') && !text.includes('[HMR]')) {
      console.log(`[브라우저] ${text}`);
    }
  });

  try {
    console.log('📍 Vercel 프로덕션 서버 접속 중...');
    await page.goto('https://sajuapp-prod.vercel.app/saju', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await page.waitForTimeout(3000);

    console.log('✅ 페이지 로드 완료\n');

    // 핵심 카테고리만 테스트: 주능, 주흉
    const criticalCategories = [
      { id: 'juneung', name: '주능', icon: '⚡', expectedSubs: ['리더십', '창의력', '소통능력', '학습능력', '사업능력', '전문성'] },
      { id: 'juhyung', name: '주흉', icon: '⚠️', expectedSubs: ['건강주의', '재물주의', '관계주의', '사고주의', '법률주의', '사업주의'] }
    ];

    const results = [];

    for (const category of criticalCategories) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🧪 테스트: ${category.icon} ${category.name} (${category.id})`);
      console.log('='.repeat(60));

      try {
        // 카테고리 버튼 찾기
        const categoryButton = await page.locator(`button:has-text("${category.name}")`).first();

        if (!categoryButton) {
          console.log(`❌ ${category.name} 버튼을 찾을 수 없음`);
          results.push({ category: category.name, status: 'FAIL', reason: '버튼 없음' });
          continue;
        }

        // 버튼 클릭
        console.log(`📍 ${category.name} 버튼 클릭...`);
        await categoryButton.click();
        await page.waitForTimeout(2500);

        // 하위 카테고리 확인
        const subcategoryInfo = await page.evaluate(() => {
          const allButtons = Array.from(document.querySelectorAll('button'));
          const subButtons = allButtons.filter(b => {
            const text = b.textContent?.trim() || '';
            return text.length > 0 && text.includes('(') && text.includes(')') && text.length < 50;
          });
          return subButtons.slice(0, 10).map(b => b.textContent?.trim());
        });

        console.log(`\n📋 발견된 하위 카테고리 (${subcategoryInfo.length}개):`);
        subcategoryInfo.forEach((sub, idx) => {
          console.log(`  ${idx + 1}. ${sub}`);
        });

        // 예상 하위 카테고리와 비교
        const matchedSubs = category.expectedSubs.filter(expected =>
          subcategoryInfo.some(actual => actual && actual.includes(expected))
        );

        const matchRate = (matchedSubs.length / category.expectedSubs.length * 100).toFixed(0);

        console.log(`\n✓ 일치율: ${matchedSubs.length}/${category.expectedSubs.length} (${matchRate}%)`);
        console.log(`  일치: ${matchedSubs.join(', ')}`);

        if (matchRate >= 100) {
          console.log(`✅ ${category.name} 테스트 통과! (완벽)`);
          results.push({ category: category.name, status: 'PASS', matchRate: `${matchRate}%` });
        } else if (matchRate >= 80) {
          console.log(`⚠️ ${category.name} 테스트 경고 (일부 불일치)`);
          results.push({ category: category.name, status: 'WARN', matchRate: `${matchRate}%` });
        } else {
          console.log(`❌ ${category.name} 테스트 실패 (일치율 낮음)`);
          results.push({ category: category.name, status: 'FAIL', matchRate: `${matchRate}%` });
        }

        // 첫 번째 하위 카테고리 클릭하여 차트 확인
        if (subcategoryInfo.length > 0) {
          const firstSubName = subcategoryInfo[0].split('(')[0];
          const subButton = await page.locator(`button:has-text("${firstSubName}")`).first();

          if (subButton) {
            console.log(`\n📊 "${firstSubName}" 클릭하여 차트 확인...`);
            await subButton.click();
            await page.waitForTimeout(2000);

            // 레이더 차트 확인
            const hasRadarChart = await page.evaluate(() => {
              const canvas = document.querySelector('canvas');
              return canvas !== null;
            });

            if (hasRadarChart) {
              console.log(`✅ 레이더 차트 정상 렌더링됨`);
            } else {
              console.log(`⚠️ 레이더 차트를 찾을 수 없음`);
            }

            // 스크린샷 저장
            await page.screenshot({
              path: `vercel-${category.id}-chart.png`,
              fullPage: true
            });
            console.log(`📸 스크린샷 저장: vercel-${category.id}-chart.png`);
          }
        }

      } catch (error) {
        console.log(`❌ ${category.name} 테스트 중 에러: ${error.message}`);
        results.push({ category: category.name, status: 'ERROR', reason: error.message });
      }

      await page.waitForTimeout(1000);
    }

    // 최종 결과 요약
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 Vercel 프로덕션 테스트 결과');
    console.log('='.repeat(60));

    const passCount = results.filter(r => r.status === 'PASS').length;
    const warnCount = results.filter(r => r.status === 'WARN').length;
    const failCount = results.filter(r => r.status === 'FAIL').length;
    const errorCount = results.filter(r => r.status === 'ERROR').length;

    console.log(`\n전체: ${results.length}개 핵심 카테고리`);
    console.log(`✅ 통과: ${passCount}개`);
    console.log(`⚠️ 경고: ${warnCount}개`);
    console.log(`❌ 실패: ${failCount}개`);
    console.log(`💥 에러: ${errorCount}개`);

    console.log('\n상세 결과:');
    results.forEach((result, idx) => {
      const emoji = result.status === 'PASS' ? '✅' :
                    result.status === 'WARN' ? '⚠️' :
                    result.status === 'FAIL' ? '❌' : '💥';
      console.log(`${idx + 1}. ${emoji} ${result.category}: ${result.status} ${result.matchRate || result.reason || ''}`);
    });

    // 전체 스크린샷
    await page.screenshot({ path: 'vercel-production-final.png', fullPage: true });
    console.log('\n📸 전체 스크린샷: vercel-production-final.png');

    console.log('\n⏳ 10초 후 종료...');
    await page.waitForTimeout(10000);

    return results;

  } catch (error) {
    console.error('\n❌ 전체 테스트 에러:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

testVercelProduction()
  .then(results => {
    const passCount = results.filter(r => r.status === 'PASS').length;
    console.log(`\n\n✨ Vercel 프로덕션 테스트 완료! (${passCount}/${results.length} 통과)`);

    if (passCount === results.length) {
      console.log('🎉 모든 핵심 카테고리가 프로덕션에서 완벽하게 작동합니다!');
      process.exit(0);
    } else {
      console.log('⚠️ 일부 카테고리에 문제가 있습니다.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ 테스트 실패:', error);
    process.exit(1);
  });
