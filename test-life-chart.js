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
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: 'saju-page-screenshot.png',
      fullPage: true 
    });
    console.log('📸 스크린샷 저장: saju-page-screenshot.png');
    
    // LifeChartButton 컴포넌트 확인
    const lifeChartButton = await page.locator('text=/100년 인생운세/').first();
    const buttonExists = await lifeChartButton.count() > 0;
    
    if (buttonExists) {
      console.log('✅ 인생차트 버튼 발견!');
      
      // 버튼 위치 정보
      const buttonBox = await lifeChartButton.boundingBox();
      console.log('📍 버튼 위치:', buttonBox);
      
      // 버튼 클릭
      await lifeChartButton.click();
      console.log('🖱️ 인생차트 버튼 클릭');
      
      await page.waitForTimeout(2000);
      
      // 클릭 후 스크린샷
      await page.screenshot({ 
        path: 'after-click-screenshot.png',
        fullPage: true 
      });
      console.log('📸 클릭 후 스크린샷 저장: after-click-screenshot.png');
    } else {
      console.log('❌ 인생차트 버튼을 찾을 수 없습니다');
      
      // 페이지 내용 확인
      const pageContent = await page.content();
      console.log('📄 페이지 HTML 길이:', pageContent.length);
      
      // 주요 요소들 확인
      const h1Text = await page.locator('h1').first().textContent();
      console.log('📌 페이지 제목:', h1Text);
      
      // 사용자 선택 패널 확인
      const userPanel = await page.locator('text=/사용자 선택/').count();
      console.log('👤 사용자 선택 패널:', userPanel > 0 ? '있음' : '없음');
      
      // 분석 결과 영역 확인
      const analysisArea = await page.locator('.space-y-8').count();
      console.log('📊 분석 결과 영역:', analysisArea > 0 ? '있음' : '없음');
    }
    
    // 콘솔 에러 확인
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🔴 콘솔 에러:', msg.text());
      }
    });
    
    // 10초 대기 (사용자가 직접 확인할 수 있도록)
    console.log('⏰ 10초 대기 중... (브라우저 확인)');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  } finally {
    // 브라우저 종료
    await browser.close();
    console.log('✅ 테스트 완료');
  }
})();