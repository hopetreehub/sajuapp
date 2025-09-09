const { chromium } = require('playwright');

(async () => {
  console.log('🎭 DayView 할일 섹션 테스트 시작...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('1️⃣ 페이지 접속 중...');
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle' 
    });
    
    console.log('   ✅ 메인 페이지 로드 완료\n');
    
    // DayView로 이동
    console.log('2️⃣ DayView로 이동...');
    
    // 캘린더 뷰 버튼 찾기 및 클릭
    const dayViewButton = await page.$('button:has-text("일")');
    if (dayViewButton) {
      await dayViewButton.click();
      await page.waitForTimeout(1000);
      console.log('   ✅ DayView 활성화됨\n');
    } else {
      console.log('   ⚠️ DayView 버튼을 찾을 수 없음\n');
    }
    
    // 오늘의 할일 섹션 확인
    console.log('3️⃣ "오늘의 할일" 섹션 확인:');
    console.log('='.repeat(50));
    
    const todoSection = await page.$('text=📝 오늘의 할일');
    if (todoSection) {
      console.log('   ❌ "오늘의 할일" 섹션이 여전히 표시됨!');
      
      // 섹션 내용 확인
      const todoSectionContainer = await page.$('.bg-muted\\/10:has-text("📝 오늘의 할일")');
      if (todoSectionContainer) {
        const sectionHTML = await todoSectionContainer.innerHTML();
        console.log('\n   📋 섹션 내용:');
        console.log('   ' + sectionHTML.substring(0, 200) + '...');
      }
    } else {
      console.log('   ✅ "오늘의 할일" 섹션이 제거됨!');
    }
    
    // 빠른 작성 버튼 그룹 확인
    console.log('\n4️⃣ 빠른 작성 버튼 그룹 확인:');
    console.log('='.repeat(50));
    
    const quickButtons = await page.$$('button:has-text("📅"), button:has-text("✅"), button:has-text("📖")');
    console.log(`   📊 빠른 작성 버튼 개수: ${quickButtons.length}개`);
    
    if (quickButtons.length >= 3) {
      console.log('   ✅ 빠른 작성 버튼 그룹 정상 표시됨!');
    } else {
      console.log('   ⚠️ 빠른 작성 버튼이 누락됨');
    }
    
    // 중복 "할일 추가" 버튼 확인
    console.log('\n5️⃣ 중복 "할일 추가" 버튼 확인:');
    console.log('='.repeat(50));
    
    const todoAddButtons = await page.$$('button:has-text("할일 추가"), button:has-text("+ 할일")');
    console.log(`   📊 "할일 추가" 버튼 개수: ${todoAddButtons.length}개`);
    
    if (todoAddButtons.length === 0) {
      console.log('   ✅ 중복 "할일 추가" 버튼이 제거됨!');
    } else {
      console.log('   ⚠️ 여전히 "할일 추가" 버튼이 존재함');
      
      // 각 버튼의 위치와 텍스트 출력
      for (let i = 0; i < todoAddButtons.length; i++) {
        const buttonText = await todoAddButtons[i].textContent();
        console.log(`   - 버튼 ${i+1}: "${buttonText}"`);
      }
    }
    
    // 스크린샷 캡처
    console.log('\n6️⃣ 스크린샷 캡처 중...');
    await page.screenshot({ 
      path: 'dayview-todos-test.png',
      fullPage: true 
    });
    console.log('   ✅ 스크린샷 저장: dayview-todos-test.png');
    
    // 할일이 있는지 확인
    console.log('\n7️⃣ 할일 데이터 확인:');
    const todoItems = await page.$$('[class*="todo"], [class*="할일"]');
    console.log(`   📊 할일 항목 개수: ${todoItems.length}개`);
    
  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ 테스트 완료! 브라우저를 닫으려면 5초 대기...');
  
  await page.waitForTimeout(5000);
  await browser.close();
  console.log('브라우저 종료됨');
})();