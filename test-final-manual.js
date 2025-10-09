const playwright = require('playwright');

async function finalManualTest() {
  console.log('🔍 주능/주흉 최종 수동 테스트\n');
  console.log('⚠️  이 테스트는 브라우저를 열어둡니다.');
  console.log('   직접 주능과 주흉 카테고리를 클릭하여 확인해주세요.\n');

  const browser = await playwright.chromium.launch({
    headless: false,
    slowMo: 0
  });

  const page = await browser.newPage();

  try {
    console.log('📍 사주 분석 페이지 접속 중...');
    await page.goto('http://localhost:4000/saju', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    console.log('✅ 페이지 로드 완료\n');

    console.log('=' .repeat(70));
    console.log('📋 수동 확인 가이드');
    console.log('='.repeat(70));
    console.log('\n다음 항목들을 직접 확인해주세요:\n');
    console.log('1. 상단의 ⚡주능 카테고리를 클릭하세요');
    console.log('   → 하위 탭이 나타나는지 확인 (리더십, 창의력, 소통능력...)');
    console.log('   → 레이더 차트가 0점이 아닌 다양한 값을 보이는지 확인\n');
    console.log('2. 상단의 ⚠️주흉 카테고리를 클릭하세요');
    console.log('   → 하위 탭이 나타나는지 확인 (건강주의, 재물주의...)');
    console.log('   → 레이더 차트가 90점이 아닌 다양한 값을 보이는지 확인\n');
    console.log('3. 각 하위 탭을 클릭하여 차트 변화를 확인하세요\n');
    console.log('=' .repeat(70));
    console.log('\n⏰ 브라우저가 5분 동안 열려 있습니다.');
    console.log('   확인 후 터미널에서 Ctrl+C를 눌러 종료하세요.\n');

    // 5분 대기
    await page.waitForTimeout(300000);

  } catch (error) {
    console.error('\n❌ 에러:', error.message);
  } finally {
    console.log('\n브라우저를 종료합니다...');
    await browser.close();
  }
}

finalManualTest().catch(console.error);
