const { chromium } = require('playwright');

(async () => {
  // 브라우저 실행
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--lang=ko-KR']
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('🌐 브라우저 실행 중...');
  
  try {
    // 사주분석 페이지로 이동
    console.log('📍 사주분석 페이지 접속: http://localhost:4000/saju');
    await page.goto('http://localhost:4000/saju', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 페이지 로드 대기
    await page.waitForTimeout(3000);
    
    // 고객 선택 컴포넌트 확인
    console.log('\n👤 고객 선택 UI 확인...');
    const customerSelector = await page.locator('text=/고객 검색/').count();
    console.log('  고객 선택 버튼:', customerSelector > 0 ? '✅ 있음' : '❌ 없음');
    
    // 인생차트 관련 요소들 확인
    console.log('\n🔮 인생차트 관련 요소 확인...');
    
    // 다양한 텍스트 패턴으로 검색
    const patterns = [
      '100년 인생운세',
      '인생 운세 차트',
      '인생차트',
      '생애 운세',
      'LifeChartButton'
    ];
    
    for (const pattern of patterns) {
      const count = await page.locator(`text=/${pattern}/i`).count();
      console.log(`  "${pattern}" 검색 결과:`, count > 0 ? `✅ ${count}개 발견` : '❌ 없음');
    }
    
    // 버튼 요소 확인
    const buttons = await page.locator('button').all();
    console.log(`\n🔘 총 버튼 개수: ${buttons.length}`);
    
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const text = await buttons[i].textContent();
      console.log(`  버튼 ${i+1}: ${text?.trim() || '(빈 텍스트)'}`);
    }
    
    // 컴포넌트 클래스명으로 검색
    const lifeChartComponent = await page.locator('[class*="life-chart"]').count();
    console.log('\n📊 life-chart 클래스 요소:', lifeChartComponent > 0 ? '✅ 있음' : '❌ 없음');
    
    // gradient 배경 요소 찾기 (인생차트 버튼의 특징)
    const gradientElements = await page.locator('[class*="gradient"]').count();
    console.log('🌈 Gradient 배경 요소:', gradientElements);
    
    // 페이지 구조 확인
    console.log('\n📄 페이지 구조 분석:');
    const h1Text = await page.locator('h1').first().textContent();
    console.log('  제목:', h1Text);
    
    const mainContent = await page.locator('main').first();
    const childCount = await mainContent.locator('> div').count();
    console.log('  메인 컨텐츠 하위 div 개수:', childCount);
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: 'saju-page-detailed-screenshot.png',
      fullPage: true 
    });
    console.log('\n📸 상세 스크린샷 저장: saju-page-detailed-screenshot.png');
    
    // 콘솔 에러 확인
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🔴 콘솔 에러:', msg.text());
      }
    });
    
    // 네트워크 에러 확인
    page.on('requestfailed', request => {
      console.log('🔴 네트워크 요청 실패:', request.url());
    });
    
    // 10초 대기 (사용자가 직접 확인할 수 있도록)
    console.log('\n⏰ 10초 대기 중... (브라우저 확인)');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  } finally {
    // 브라우저 종료
    await browser.close();
    console.log('✅ 테스트 완료');
  }
})();