const { chromium } = require('playwright');

(async () => {
  console.log('🎭 최종 검증 테스트 시작...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 200
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('1️⃣ DayView 페이지 접속...');
    await page.goto('http://localhost:4000/calendar', { 
      waitUntil: 'networkidle' 
    });
    
    // DayView 활성화
    const dayButton = await page.$('button:has-text("일")');
    if (dayButton) {
      await dayButton.click();
      await page.waitForTimeout(1000);
      console.log('   ✅ DayView 활성화됨\n');
    }
    
    // "📝 오늘의 할일" 섹션 확인
    console.log('2️⃣ "📝 오늘의 할일" 섹션 제거 확인:');
    console.log('='.repeat(50));
    
    const todoSection = await page.$('text=📝 오늘의 할일');
    if (todoSection) {
      console.log('   ❌ "📝 오늘의 할일" 섹션이 여전히 존재함!');
    } else {
      console.log('   ✅ "📝 오늘의 할일" 섹션이 성공적으로 제거됨!');
    }
    
    // 빠른 작성 버튼 그룹 확인
    console.log('\n3️⃣ 빠른 작성 버튼 그룹 확인:');
    console.log('='.repeat(50));
    
    const quickCreateSection = await page.$('text=빠른 작성');
    if (quickCreateSection) {
      console.log('   ✅ "빠른 작성" 섹션 정상 표시됨!');
      
      const buttons = await page.$$('button:has-text("📅"), button:has-text("✅"), button:has-text("📖")');
      console.log(`   📊 빠른 작성 버튼 개수: ${buttons.length}개`);
      
      if (buttons.length >= 3) {
        console.log('   ✅ 일정/할일/일기 버튼 모두 정상!');
      }
    } else {
      console.log('   ⚠️ "빠른 작성" 섹션이 없음');
    }
    
    // 오른쪽 할일 표시 영역 확인
    console.log('\n4️⃣ 오른쪽 할일 표시 영역 확인:');
    console.log('='.repeat(50));
    
    // 시간 미지정 할일 섹션 확인
    const generalTodoSection = await page.$('text=시간 미지정 할일');
    if (generalTodoSection) {
      console.log('   ✅ "시간 미지정 할일" 섹션 존재함');
    } else {
      console.log('   ℹ️ "시간 미지정 할일" 섹션 없음 (할일 없는 상태)');
    }
    
    // 전체 페이지에서 중복 할일 관련 텍스트 검색
    console.log('\n5️⃣ 중복 할일 관련 텍스트 검색:');
    console.log('='.repeat(50));
    
    const bodyText = await page.textContent('body');
    const duplicatePatterns = [
      '📝 오늘의 할일',
      '할일 추가',
      '+ 할일'
    ];
    
    let hasDuplicates = false;
    duplicatePatterns.forEach(pattern => {
      const matches = (bodyText.match(new RegExp(pattern, 'g')) || []).length;
      console.log(`   - "${pattern}": ${matches}개 발견`);
      if ((pattern === '📝 오늘의 할일' && matches > 0) || 
          (pattern === '할일 추가' && matches > 0) ||
          (pattern === '+ 할일' && matches > 0)) {
        hasDuplicates = true;
      }
    });
    
    if (!hasDuplicates) {
      console.log('   ✅ 중복 할일 관련 텍스트 완전 제거됨!');
    } else {
      console.log('   ⚠️ 일부 중복 텍스트가 여전히 존재함');
    }
    
    // 할일 추가 기능 테스트
    console.log('\n6️⃣ 할일 추가 기능 테스트:');
    console.log('='.repeat(50));
    
    const todoButton = await page.$('button:has-text("✅ 할일")');
    if (todoButton) {
      console.log('   🎯 "✅ 할일" 버튼 클릭 시도...');
      try {
        await todoButton.click();
        await page.waitForTimeout(1000);
        
        const modal = await page.$('[class*="modal"], [class*="Modal"], .fixed.inset-0');
        if (modal) {
          console.log('   ✅ 할일 생성 모달 정상 동작!');
          
          // 모달 닫기
          const closeButton = await page.$('button:has-text("취소")');
          if (closeButton) {
            await closeButton.click();
          } else {
            await page.keyboard.press('Escape');
          }
        } else {
          console.log('   ⚠️ 할일 생성 모달이 열리지 않음');
        }
      } catch (error) {
        console.log(`   ❌ 할일 버튼 클릭 실패: ${error.message}`);
      }
    } else {
      console.log('   ❌ "✅ 할일" 버튼을 찾을 수 없음');
    }
    
    // 스크린샷 캡처
    console.log('\n7️⃣ 최종 상태 스크린샷 캡처...');
    await page.screenshot({ 
      path: 'final-verification-test.png',
      fullPage: true 
    });
    console.log('   ✅ 스크린샷 저장: final-verification-test.png');
    
    // 최종 점검
    console.log('\n8️⃣ 최종 점검 결과:');
    console.log('='.repeat(50));
    
    const hasQuickCreate = await page.$('text=빠른 작성');
    const hasOldTodoSection = await page.$('text=📝 오늘의 할일');
    const hasTodoButton = await page.$('button:has-text("✅ 할일")');
    
    console.log(`   - 빠른 작성 섹션: ${hasQuickCreate ? '✅ 존재' : '❌ 없음'}`);
    console.log(`   - 구 할일 섹션: ${hasOldTodoSection ? '❌ 존재' : '✅ 제거됨'}`);
    console.log(`   - 할일 버튼: ${hasTodoButton ? '✅ 정상' : '❌ 없음'}`);
    
    if (hasQuickCreate && !hasOldTodoSection && hasTodoButton) {
      console.log('\n🎉 모든 검증 통과! 중복 제거 작업 성공적으로 완료됨!');
    } else {
      console.log('\n⚠️ 일부 검증 실패. 추가 수정이 필요할 수 있음.');
    }
    
  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ 최종 검증 테스트 완료! 5초 후 브라우저 종료...');
  
  await page.waitForTimeout(5000);
  await browser.close();
  console.log('브라우저 종료됨');
})();