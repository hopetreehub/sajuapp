const { chromium } = require('playwright');

(async () => {
  console.log('🎭 플레이라이트 테스트 시작...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('1️⃣ 페이지 접속 중...');
    await page.goto('http://localhost:4000/test-comprehensive', { 
      waitUntil: 'networkidle' 
    });
    
    console.log('   ✅ 페이지 로드 완료\n');
    
    // 페이지 타이틀 확인
    const title = await page.textContent('h1');
    console.log(`2️⃣ 페이지 타이틀: ${title}\n`);
    
    // API 응답 대기
    console.log('3️⃣ API 응답 대기 중...');
    await page.waitForTimeout(3000);
    
    // 주능 카테고리 확인
    console.log('\n4️⃣ 주능 카테고리 확인:');
    console.log('='.repeat(50));
    
    const juneungSection = await page.$('text=주능 (긍정적 능력)');
    if (juneungSection) {
      console.log('   ✅ 주능 섹션 발견!');
      
      // 주능 중항목들 찾기
      const juneungCategories = await page.$$eval(
        '.bg-white:has(h2:has-text("주능")) h3',
        elements => elements.map(el => el.textContent.trim())
      );
      
      if (juneungCategories.length > 0) {
        console.log(`   📊 ${juneungCategories.length}개 중항목 발견:`);
        juneungCategories.forEach(cat => {
          console.log(`      • ${cat}`);
        });
      } else {
        console.log('   ⚠️ 주능 중항목이 표시되지 않음!');
      }
    } else {
      console.log('   ❌ 주능 섹션을 찾을 수 없음!');
    }
    
    // 주흉 카테고리 확인
    console.log('\n5️⃣ 주흉 카테고리 확인:');
    console.log('='.repeat(50));
    
    const juhyungSection = await page.$('text=주흉 (주의사항)');
    if (juhyungSection) {
      console.log('   ✅ 주흉 섹션 발견!');
      
      // 주흉 중항목들 찾기
      const juhyungCategories = await page.$$eval(
        '.bg-white:has(h2:has-text("주흉")) h3',
        elements => elements.map(el => el.textContent.trim())
      );
      
      if (juhyungCategories.length > 0) {
        console.log(`   📊 ${juhyungCategories.length}개 중항목 발견:`);
        juhyungCategories.forEach(cat => {
          console.log(`      • ${cat}`);
        });
      } else {
        console.log('   ⚠️ 주흉 중항목이 표시되지 않음!');
      }
    } else {
      console.log('   ❌ 주흉 섹션을 찾을 수 없음!');
    }
    
    // 스크린샷 캡처
    console.log('\n6️⃣ 스크린샷 캡처 중...');
    await page.screenshot({ 
      path: 'saju-display-test.png',
      fullPage: true 
    });
    console.log('   ✅ 스크린샷 저장: saju-display-test.png');
    
    // 콘솔 에러 확인
    console.log('\n7️⃣ 콘솔 에러 확인:');
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`   ❌ 에러: ${msg.text()}`);
      }
    });
    
    // 네트워크 요청 확인
    console.log('\n8️⃣ API 요청 상태:');
    page.on('response', response => {
      if (response.url().includes('4015')) {
        console.log(`   📡 API 응답: ${response.status()} - ${response.url()}`);
      }
    });
    
    // 추가 대기 시간
    await page.waitForTimeout(2000);
    
    // 최종 확인
    console.log('\n9️⃣ 최종 상태 확인:');
    const hasPositiveScores = await page.$('.bg-white:has(h2:has-text("주능"))');
    const hasNegativeScores = await page.$('.bg-white:has(h2:has-text("주흉"))');
    
    if (hasPositiveScores && hasNegativeScores) {
      console.log('   ✅ 주능/주흉 모두 정상 표시됨!');
    } else {
      console.log('   ⚠️ 일부 요소가 표시되지 않음');
      if (!hasPositiveScores) console.log('      - 주능 섹션 없음');
      if (!hasNegativeScores) console.log('      - 주흉 섹션 없음');
    }
    
    // 디버그 정보 확인
    const debugSection = await page.$('details summary:has-text("디버그 정보")');
    if (debugSection) {
      await debugSection.click();
      console.log('\n🔧 디버그 정보 확장됨');
    }
    
  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ 테스트 완료! 브라우저를 닫으려면 Enter를 누르세요...');
  
  // 수동 확인을 위해 대기
  await page.waitForTimeout(10000);
  
  await browser.close();
  console.log('브라우저 종료됨');
})();