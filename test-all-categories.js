const playwright = require('playwright');

async function testAllCategories() {
  console.log('🔍 전체 카테고리 기능 테스트\n');

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
    console.log('📍 로컬 개발 서버 접속 중...');
    await page.goto('http://localhost:4000/saju', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // 9개 카테고리 정의
    const categories = [
      { id: 'jubon', name: '주본', icon: '🎯', expectedSubs: ['본성', '기질', '태도'] },
      { id: 'jugun', name: '주건', icon: '💪', expectedSubs: ['신체', '체력', '건강운'] },
      { id: 'jumul', name: '주물', icon: '💰', expectedSubs: ['재운', '재테크', '소비성향'] },
      { id: 'juyeon', name: '주연', icon: '🤝', expectedSubs: ['인간관계', '사교성', '배우자운'] },
      { id: 'jujae', name: '주재', icon: '🎨', expectedSubs: ['취미', '여가', '예술성'] },
      { id: 'jueob', name: '주업', icon: '💼', expectedSubs: ['직업운', '성공운', '사업운'] },
      { id: 'jusaeng', name: '주생', icon: '🌱', expectedSubs: ['자녀운', '교육관', '가정운'] },
      { id: 'juneung', name: '주능', icon: '⚡', expectedSubs: ['리더십', '창의력', '소통능력', '학습능력', '사업능력', '전문성'] },
      { id: 'juhyung', name: '주흉', icon: '⚠️', expectedSubs: ['건강주의', '재물주의', '관계주의', '사고주의', '법률주의', '사업주의'] }
    ];

    console.log('📊 전체 카테고리 테스트 시작\n');

    const results = [];

    for (const category of categories) {
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
        await categoryButton.click();
        await page.waitForTimeout(2000);

        // 하위 카테고리 확인
        const subcategoryInfo = await page.evaluate(() => {
          const allButtons = Array.from(document.querySelectorAll('button'));
          const subButtons = allButtons.filter(b => {
            const text = b.textContent?.trim() || '';
            return text.length > 0 && text.includes('(') && text.includes(')') && text.length < 50;
          });
          return subButtons.slice(0, 15).map(b => b.textContent?.trim());
        });

        console.log(`\n📋 발견된 하위 카테고리 (${subcategoryInfo.length}개):`);
        subcategoryInfo.forEach((sub, idx) => {
          console.log(`  ${idx + 1}. ${sub}`);
        });

        // 예상 하위 카테고리와 비교
        const matchCount = category.expectedSubs.filter(expected =>
          subcategoryInfo.some(actual => actual && actual.includes(expected))
        ).length;

        const matchRate = (matchCount / category.expectedSubs.length * 100).toFixed(0);

        console.log(`\n✓ 일치율: ${matchCount}/${category.expectedSubs.length} (${matchRate}%)`);
        console.log(`  예상: ${category.expectedSubs.join(', ')}`);

        if (matchRate >= 80) {
          console.log(`✅ ${category.name} 테스트 통과!`);
          results.push({ category: category.name, status: 'PASS', matchRate: `${matchRate}%` });
        } else {
          console.log(`⚠️ ${category.name} 테스트 실패 (일치율 낮음)`);
          results.push({ category: category.name, status: 'WARN', matchRate: `${matchRate}%` });
        }

        // 각 하위 카테고리 클릭하여 차트 확인
        for (let i = 0; i < Math.min(subcategoryInfo.length, 3); i++) {
          const subButton = await page.locator(`button:has-text("${subcategoryInfo[i].split('(')[0]}")`).first();
          if (subButton) {
            await subButton.click();
            await page.waitForTimeout(1000);

            // 레이더 차트 확인
            const hasRadarChart = await page.evaluate(() => {
              const canvas = document.querySelector('canvas');
              return canvas !== null;
            });

            if (hasRadarChart) {
              console.log(`  ✓ ${subcategoryInfo[i]}: 레이더 차트 표시됨`);
            } else {
              console.log(`  ⚠️ ${subcategoryInfo[i]}: 레이더 차트 없음`);
            }
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
    console.log('📊 테스트 결과 요약');
    console.log('='.repeat(60));

    const passCount = results.filter(r => r.status === 'PASS').length;
    const warnCount = results.filter(r => r.status === 'WARN').length;
    const failCount = results.filter(r => r.status === 'FAIL').length;
    const errorCount = results.filter(r => r.status === 'ERROR').length;

    console.log(`\n전체: ${results.length}개 카테고리`);
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

    // 스크린샷 저장
    await page.screenshot({ path: 'test-all-categories-final.png', fullPage: true });
    console.log('\n📸 스크린샷: test-all-categories-final.png');

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

testAllCategories()
  .then(results => {
    const passCount = results.filter(r => r.status === 'PASS').length;
    console.log(`\n\n✨ 테스트 완료! (${passCount}/${results.length} 통과)`);
    process.exit(passCount === results.length ? 0 : 1);
  })
  .catch(error => {
    console.error('테스트 실패:', error);
    process.exit(1);
  });
