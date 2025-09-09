const { chromium } = require('playwright');

(async () => {
  console.log('🎭 DayView 직접 테스트 시작...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 200
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('1️⃣ DayView 페이지 직접 접속...');
    await page.goto('http://localhost:4000/calendar', { 
      waitUntil: 'networkidle' 
    });
    
    console.log('   ✅ 캘린더 페이지 로드 완료\n');
    
    // DayView 활성화 시도
    console.log('2️⃣ DayView 활성화 시도...');
    
    // 가능한 모든 DayView 버튼들 찾기
    const dayButtons = await page.$$('button');
    console.log(`   📊 전체 버튼 개수: ${dayButtons.length}개`);
    
    let dayViewFound = false;
    for (let i = 0; i < dayButtons.length; i++) {
      const buttonText = await dayButtons[i].textContent();
      console.log(`   - 버튼 ${i+1}: "${buttonText}"`);
      
      if (buttonText.includes('일') || buttonText.includes('Day') || buttonText.includes('day')) {
        console.log(`   🎯 DayView 버튼 발견! 클릭 시도...`);
        try {
          await dayButtons[i].click();
          await page.waitForTimeout(1000);
          dayViewFound = true;
          break;
        } catch (error) {
          console.log(`   ⚠️ 클릭 실패: ${error.message}`);
        }
      }
    }
    
    if (!dayViewFound) {
      console.log('   ⚠️ DayView 버튼을 찾을 수 없음. 현재 뷰가 DayView일 수 있음\n');
    }
    
    // 페이지 전체 내용 확인
    console.log('3️⃣ 페이지 전체 내용 분석...');
    const bodyText = await page.textContent('body');
    
    if (bodyText.includes('📝 오늘의 할일')) {
      console.log('   ❌ "📝 오늘의 할일" 텍스트 발견!');
      console.log('   🔍 해당 섹션의 부모 요소 분석...');
      
      // 오늘의 할일 섹션 찾기
      const todoSection = await page.$('*:has-text("📝 오늘의 할일")');
      if (todoSection) {
        const sectionInfo = await page.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          return {
            tagName: element.tagName,
            className: element.className,
            visible: rect.width > 0 && rect.height > 0,
            innerHTML: element.innerHTML.substring(0, 300)
          };
        }, todoSection);
        
        console.log('   📋 섹션 정보:');
        console.log(`   - 태그: ${sectionInfo.tagName}`);
        console.log(`   - 클래스: ${sectionInfo.className}`);
        console.log(`   - 표시여부: ${sectionInfo.visible}`);
        console.log(`   - 내용: ${sectionInfo.innerHTML}...`);
      }
    } else {
      console.log('   ✅ "📝 오늘의 할일" 텍스트 없음');
    }
    
    // 할일 관련 모든 요소 찾기
    console.log('\n4️⃣ 할일 관련 요소 검색...');
    const todoElements = await page.$$('[class*="todo"], *:has-text("할일"), *:has-text("📝")');
    console.log(`   📊 할일 관련 요소 개수: ${todoElements.length}개`);
    
    for (let i = 0; i < Math.min(todoElements.length, 5); i++) {
      const elementText = await todoElements[i].textContent();
      console.log(`   - 요소 ${i+1}: "${elementText.substring(0, 50)}..."`);
    }
    
    // 빠른 작성 버튼 확인
    console.log('\n5️⃣ 빠른 작성 버튼 확인...');
    const quickCreateButtons = await page.$$('button:has-text("빠른 작성"), button:has-text("📅"), button:has-text("✅"), button:has-text("📖")');
    console.log(`   📊 빠른 작성 관련 버튼: ${quickCreateButtons.length}개`);
    
    for (let i = 0; i < quickCreateButtons.length; i++) {
      const buttonText = await quickCreateButtons[i].textContent();
      console.log(`   - 버튼 ${i+1}: "${buttonText}"`);
    }
    
    // 스크린샷 캡처
    console.log('\n6️⃣ 스크린샷 캡처...');
    await page.screenshot({ 
      path: 'dayview-direct-test.png',
      fullPage: true 
    });
    console.log('   ✅ 스크린샷 저장: dayview-direct-test.png');
    
    // 할일 데이터 추가해보기 (테스트용)
    console.log('\n7️⃣ 할일 추가 테스트...');
    
    const createButton = await page.$('button:has-text("✅")');
    if (createButton) {
      console.log('   🎯 할일 생성 버튼 발견! 클릭 시도...');
      try {
        await createButton.click();
        await page.waitForTimeout(1000);
        
        // 모달이나 폼이 나타났는지 확인
        const modal = await page.$('[class*="modal"], [class*="Modal"], .fixed.inset-0');
        if (modal) {
          console.log('   ✅ 할일 생성 모달이 열림!');
        } else {
          console.log('   ⚠️ 할일 생성 모달이 열리지 않음');
        }
      } catch (error) {
        console.log(`   ❌ 할일 생성 버튼 클릭 실패: ${error.message}`);
      }
    } else {
      console.log('   ⚠️ 할일 생성 버튼(✅)을 찾을 수 없음');
    }
    
  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ 테스트 완료! 10초 후 브라우저 종료...');
  
  await page.waitForTimeout(10000);
  await browser.close();
  console.log('브라우저 종료됨');
})();