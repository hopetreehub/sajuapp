const { chromium } = require('playwright');

(async () => {
  console.log('🎭 상세 플레이라이트 테스트 시작...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 콘솔 로그 캡처
  const consoleLogs = [];
  page.on('console', msg => {
    const logText = `[${msg.type()}] ${msg.text()}`;
    consoleLogs.push(logText);
    if (msg.type() === 'error') {
      console.log(`   ❌ 콘솔 에러: ${msg.text()}`);
    }
  });
  
  // 네트워크 요청 캡처
  const failedRequests = [];
  page.on('requestfailed', request => {
    failedRequests.push({
      url: request.url(),
      failure: request.failure()
    });
    console.log(`   ❌ 요청 실패: ${request.url()}`);
  });
  
  // 응답 캡처
  page.on('response', response => {
    if (response.url().includes('4015') || response.url().includes('api')) {
      console.log(`   📡 API 응답: ${response.status()} - ${response.url()}`);
    }
  });
  
  try {
    console.log('1️⃣ 페이지 접속 중...');
    await page.goto('http://localhost:4000/test-comprehensive', { 
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log('   ✅ 페이지 로드 완료\n');
    
    // 페이지 내용 확인
    console.log('2️⃣ 페이지 콘텐츠 확인:');
    const bodyText = await page.textContent('body');
    
    if (bodyText.includes('Failed to fetch')) {
      console.log('   ⚠️ "Failed to fetch" 오류 발견!');
      
      // 개발자 도구 열기
      console.log('\n3️⃣ 네트워크 문제 진단:');
      
      // API 직접 호출 테스트
      const apiTestResponse = await page.evaluate(async () => {
        try {
          const response = await fetch('http://localhost:4015/api/saju/scores/comprehensive', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: "test-comprehensive-user",
              birth_date: "1990-05-15", 
              birth_time: "14:30",
              is_lunar: false
            })
          });
          return {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText
          };
        } catch (error) {
          return {
            error: error.message
          };
        }
      });
      
      console.log('   API 테스트 결과:', apiTestResponse);
    }
    
    // 에러 메시지 확인
    const errorElement = await page.$('.bg-red-100');
    if (errorElement) {
      const errorText = await errorElement.textContent();
      console.log(`\n4️⃣ 에러 메시지: ${errorText}`);
    }
    
    // 대기 후 재시도
    console.log('\n5️⃣ 3초 후 재시도...');
    await page.waitForTimeout(3000);
    await page.reload();
    await page.waitForTimeout(2000);
    
    // 재시도 후 확인
    const hasData = await page.$('.bg-white');
    if (hasData) {
      console.log('   ✅ 데이터 로드 성공!');
      
      // 주능 카테고리 확인
      const positiveScores = await page.$$('.bg-white h3');
      if (positiveScores.length > 0) {
        console.log(`   📊 ${positiveScores.length}개 카테고리 발견`);
      }
    } else {
      console.log('   ⚠️ 여전히 데이터가 표시되지 않음');
    }
    
    // 스크린샷
    await page.screenshot({ 
      path: 'saju-detail-test.png',
      fullPage: true 
    });
    console.log('\n📸 스크린샷 저장: saju-detail-test.png');
    
    // 콘솔 로그 출력
    console.log('\n📋 전체 콘솔 로그:');
    consoleLogs.forEach(log => console.log(log));
    
    // 실패한 요청 출력
    if (failedRequests.length > 0) {
      console.log('\n⚠️ 실패한 요청들:');
      failedRequests.forEach(req => {
        console.log(`   - ${req.url}: ${req.failure?.errorText}`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ 테스트 완료!');
  
  await page.waitForTimeout(5000);
  await browser.close();
})();