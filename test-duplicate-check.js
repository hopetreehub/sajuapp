const { chromium } = require('playwright');

(async () => {
  console.log('🔍 운명나침반 주능/주흉 중복 검사 시작...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. 메인 페이지 접속
    console.log('📱 웹 애플리케이션 접속 중...');
    await page.goto('http://localhost:4000');
    await page.waitForTimeout(2000);
    
    // 스크린샷 캡처
    await page.screenshot({ path: 'screenshots/main-page.png', fullPage: true });
    console.log('✅ 메인 페이지 스크린샷 저장: screenshots/main-page.png');
    
    // 2. 사주 분석 페이지로 이동 (있다면)
    const analysisLink = page.locator('text=/사주|분석|운세/i').first();
    if (await analysisLink.count() > 0) {
      console.log('🔗 사주 분석 페이지로 이동...');
      await analysisLink.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'screenshots/analysis-page.png', fullPage: true });
      console.log('✅ 분석 페이지 스크린샷 저장: screenshots/analysis-page.png');
    }
    
    // 3. 차트나 그래프 요소 찾기
    console.log('\n📊 차트 요소 검색 중...');
    
    // canvas 요소 찾기 (차트가 보통 canvas로 렌더링됨)
    const canvasElements = await page.locator('canvas').all();
    console.log(`   - Canvas 요소 발견: ${canvasElements.length}개`);
    
    // 차트 컨테이너 찾기
    const chartContainers = await page.locator('[class*="chart"], [id*="chart"], [data-testid*="chart"]').all();
    console.log(`   - 차트 컨테이너 발견: ${chartContainers.length}개`);
    
    // 4. 주능/주흉 관련 텍스트 검색
    console.log('\n📝 주능/주흉 텍스트 분석...');
    
    // 주능 관련 텍스트
    const positiveTexts = await page.locator('text=/게임|과목|무용|문학|미술|연예|음악|전공|체능/').all();
    console.log(`   - 주능 카테고리 발견: ${positiveTexts.length}개`);
    
    // 주흉 관련 텍스트
    const negativeTexts = await page.locator('text=/교통사고|사건|사고|사고도로/').all();
    console.log(`   - 주흉 카테고리 발견: ${negativeTexts.length}개`);
    
    // 5. 중복 검사
    console.log('\n🔍 중복 항목 검사...');
    
    // 각 카테고리별 중복 체크
    const categories = ['게임', '과목', '무용', '문학', '미술', '연예', '음악', '전공', '체능', '교통사고', '사건', '사고', '사고도로'];
    
    for (const category of categories) {
      const elements = await page.locator(`text="${category}"`).all();
      if (elements.length > 1) {
        console.log(`   ⚠️ "${category}" 중복 발견: ${elements.length}번 표시됨`);
        
        // 각 요소의 위치 정보 수집
        for (let i = 0; i < elements.length; i++) {
          const box = await elements[i].boundingBox();
          if (box) {
            console.log(`      - 위치 ${i+1}: x=${Math.round(box.x)}, y=${Math.round(box.y)}`);
          }
        }
      }
    }
    
    // 6. 데이터 속성 검사
    console.log('\n💾 데이터 속성 검사...');
    
    // data 속성이나 props 확인
    const dataElements = await page.locator('[data-category], [data-type], [data-score]').all();
    console.log(`   - 데이터 속성 요소: ${dataElements.length}개`);
    
    for (const elem of dataElements.slice(0, 5)) { // 처음 5개만
      const category = await elem.getAttribute('data-category');
      const type = await elem.getAttribute('data-type');
      const score = await elem.getAttribute('data-score');
      if (category) {
        console.log(`   - ${category}: type=${type}, score=${score}`);
      }
    }
    
    // 7. 콘솔 에러 확인
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ 콘솔 에러:', msg.text());
      }
    });
    
    // 8. 네트워크 요청 모니터링
    console.log('\n🌐 API 요청 모니터링...');
    
    page.on('response', response => {
      if (response.url().includes('/api/saju')) {
        console.log(`   - API 호출: ${response.url()} (${response.status()})`);
      }
    });
    
    // API 호출 트리거 (있다면)
    const analyzeButton = page.locator('button:has-text("분석"), button:has-text("조회")').first();
    if (await analyzeButton.count() > 0) {
      console.log('🔄 분석 버튼 클릭...');
      await analyzeButton.click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: 'screenshots/after-analysis.png', fullPage: true });
      console.log('✅ 분석 후 스크린샷 저장: screenshots/after-analysis.png');
    }
    
    // 9. 최종 보고서
    console.log('\n' + '='.repeat(60));
    console.log('📋 검사 완료 보고서');
    console.log('='.repeat(60));
    console.log('1. 페이지 접속: ✅ 성공');
    console.log('2. 차트 요소: ' + (canvasElements.length > 0 ? '✅ 발견' : '❌ 미발견'));
    console.log('3. 주능 카테고리: ' + (positiveTexts.length > 0 ? `✅ ${positiveTexts.length}개` : '❌ 미발견'));
    console.log('4. 주흉 카테고리: ' + (negativeTexts.length > 0 ? `✅ ${negativeTexts.length}개` : '❌ 미발견'));
    console.log('5. 중복 문제: 위 로그 참조');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  } finally {
    await page.waitForTimeout(5000); // 결과 확인을 위해 5초 대기
    await browser.close();
    console.log('\n✨ 검사 종료');
  }
})();