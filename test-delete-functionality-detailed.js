const { chromium } = require('playwright');

async function testDeleteFunctionalityDetailed() {
  console.log('🔍 ===== 월간/주간 캘린더 삭제 기능 상세 테스트 =====\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500  // 느리게 해서 관찰 가능
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. 캘린더 페이지 접속
    console.log('📍 1. 캘린더 페이지 접속...');
    await page.goto('http://localhost:4000/calendar', { 
      waitUntil: 'networkidle' 
    });
    await page.waitForTimeout(1000);
    
    // 2. 먼저 테스트용 일정과 할일 생성
    console.log('\n📍 2. 테스트용 일정과 할일 생성');
    console.log('='.repeat(50));
    
    // MonthView로 전환
    const monthButton = await page.$('button:has-text("월")');
    if (monthButton) {
      await monthButton.click();
      await page.waitForTimeout(500);
    }
    
    // 날짜 클릭하여 ActionMenu 열기
    const dateCell = await page.locator('.cursor-pointer.transition-colors').first();
    await dateCell.click();
    await page.waitForTimeout(1000);
    
    // "일정,할일 추가" 버튼 클릭
    const addEventButton = await page.$('text=일정,할일 추가');
    if (addEventButton) {
      await addEventButton.click();
      await page.waitForTimeout(1000);
      
      // 일정 생성
      const titleInput = await page.$('input[placeholder*="제목"]');
      if (titleInput) {
        await titleInput.fill('삭제 테스트용 일정');
        
        // 할일 탭으로 전환
        const todoTab = await page.$('button:has-text("할일")');
        if (todoTab) {
          await todoTab.click();
          await page.waitForTimeout(500);
          
          // 할일 추가
          const todoInput = await page.$('input[placeholder*="할일"]');
          if (todoInput) {
            await todoInput.fill('삭제 테스트용 할일');
            const addTodoBtn = await page.$('button:has-text("추가")');
            if (addTodoBtn) {
              await addTodoBtn.click();
              await page.waitForTimeout(500);
              console.log('   ✅ 테스트용 할일 추가됨');
            }
          }
        }
        
        // 일정 탭으로 다시 전환
        const eventTab = await page.$('button:has-text("일정")');
        if (eventTab) {
          await eventTab.click();
          await page.waitForTimeout(500);
        }
        
        // 저장
        const saveButton = await page.$('button:has-text("저장")');
        if (saveButton) {
          await saveButton.click();
          await page.waitForTimeout(1000);
          console.log('   ✅ 테스트용 일정 생성 완료');
        }
      }
    }
    
    // 3. MonthView에서 일정 삭제 테스트
    console.log('\n📍 3. MonthView 일정 삭제 상세 테스트');
    console.log('='.repeat(50));
    
    // 생성된 일정 찾기
    const monthEventItem = await page.locator('text=삭제 테스트용 일정').first();
    if (await monthEventItem.isVisible()) {
      console.log('   ✅ 일정을 찾았습니다');
      
      // 일정에 마우스 호버
      await monthEventItem.hover();
      await page.waitForTimeout(1000);
      
      // 삭제 버튼 찾기 - 여러 선택자 시도
      const deleteSelectors = [
        'button[title="일정 삭제"]',
        'button:has-text("×")',
        '.opacity-0.group-hover\\:opacity-100.text-red-500',
        '.text-red-500:has-text("×")'
      ];
      
      let deleteButton = null;
      for (const selector of deleteSelectors) {
        deleteButton = await page.$(selector);
        if (deleteButton && await deleteButton.isVisible()) {
          console.log(`   ✅ 삭제 버튼 찾음: ${selector}`);
          break;
        }
      }
      
      if (deleteButton) {
        // 삭제 버튼 클릭
        page.once('dialog', async dialog => {
          console.log(`   ✅ 확인 다이얼로그: "${dialog.message()}"`);
          await dialog.accept(); // 삭제 확인
        });
        
        await deleteButton.click();
        await page.waitForTimeout(1000);
        console.log('   ✅ MonthView 일정 삭제 완료');
      } else {
        console.log('   ❌ MonthView 삭제 버튼을 찾을 수 없음');
        
        // 디버깅: 현재 DOM 구조 확인
        const eventHtml = await monthEventItem.innerHTML();
        console.log('   📝 일정 HTML:', eventHtml.substring(0, 200));
      }
    } else {
      console.log('   ⚠️ MonthView에서 일정을 찾을 수 없음');
    }
    
    // 할일 삭제 테스트 (툴팁에서)
    console.log('\n   📝 MonthView 할일 삭제 테스트');
    const dateWithTodo = await page.locator('.cursor-pointer.transition-colors').first();
    await dateWithTodo.hover();
    await page.waitForTimeout(2000); // 툴팁이 나타날 시간
    
    // 툴팁에서 할일 삭제 버튼 찾기
    const todoDeleteBtn = await page.$('button[title="할일 삭제"]');
    if (todoDeleteBtn && await todoDeleteBtn.isVisible()) {
      await todoDeleteBtn.click();
      console.log('   ✅ MonthView 할일 삭제 완료');
    } else {
      // 다른 방법으로 시도
      const todoXBtn = await page.locator('.opacity-0.group-hover\\:opacity-100.text-red-500').filter({ hasText: '×' }).first();
      if (await todoXBtn.isVisible()) {
        await todoXBtn.click();
        console.log('   ✅ MonthView 할일 삭제 완료 (대체 방법)');
      } else {
        console.log('   ⚠️ MonthView 할일 삭제 버튼을 찾을 수 없음');
      }
    }
    
    // 4. WeekView로 전환하여 테스트
    console.log('\n📍 4. WeekView 일정 삭제 상세 테스트');
    console.log('='.repeat(50));
    
    const weekButton = await page.$('button:has-text("주")');
    if (weekButton) {
      await weekButton.click();
      await page.waitForTimeout(1000);
      
      // WeekView에서 일정 찾기
      const weekEventItem = await page.locator('.text-xs.p-1.mb-1.rounded').first();
      if (await weekEventItem.isVisible()) {
        console.log('   ✅ WeekView에서 일정 찾음');
        
        // 일정에 마우스 호버
        await weekEventItem.hover();
        await page.waitForTimeout(1000);
        
        // 삭제 버튼 찾기
        const weekDeleteBtn = await page.locator('.opacity-0.group-hover\\:opacity-100.text-red-500').first();
        if (await weekDeleteBtn.isVisible()) {
          console.log('   ✅ WeekView 삭제 버튼 표시됨');
          
          page.once('dialog', async dialog => {
            console.log(`   ✅ 확인 다이얼로그: "${dialog.message()}"`);
            await dialog.accept();
          });
          
          await weekDeleteBtn.click();
          await page.waitForTimeout(1000);
          console.log('   ✅ WeekView 일정 삭제 완료');
        } else {
          console.log('   ❌ WeekView 삭제 버튼이 표시되지 않음');
        }
      } else {
        console.log('   ⚠️ WeekView에서 일정을 찾을 수 없음');
      }
      
      // WeekView 할일 삭제 테스트
      console.log('\n   📝 WeekView 할일 삭제 테스트');
      const weekTodoItem = await page.locator('.group .flex.items-center.space-x-1').first();
      if (await weekTodoItem.isVisible()) {
        await weekTodoItem.hover();
        await page.waitForTimeout(1000);
        
        const weekTodoDeleteBtn = await page.locator('button:has-text("×")').last();
        if (await weekTodoDeleteBtn.isVisible()) {
          await weekTodoDeleteBtn.click();
          console.log('   ✅ WeekView 할일 삭제 완료');
        } else {
          console.log('   ⚠️ WeekView 할일 삭제 버튼을 찾을 수 없음');
        }
      }
    }
    
    // 5. 삭제 기능 접근성 테스트
    console.log('\n📍 5. 삭제 버튼 접근성 분석');
    console.log('='.repeat(50));
    
    // MonthView로 다시 전환
    const monthBtn2 = await page.$('button:has-text("월")');
    if (monthBtn2) {
      await monthBtn2.click();
      await page.waitForTimeout(500);
    }
    
    // 모든 삭제 관련 요소 찾기
    const allDeleteButtons = await page.$$('[title*="삭제"], button:has-text("×"), .text-red-500');
    console.log(`   📊 전체 삭제 관련 요소 수: ${allDeleteButtons.length}`);
    
    for (let i = 0; i < Math.min(3, allDeleteButtons.length); i++) {
      const btn = allDeleteButtons[i];
      const isVisible = await btn.isVisible();
      const text = await btn.textContent();
      const title = await btn.getAttribute('title');
      console.log(`   - 버튼 ${i+1}: visible=${isVisible}, text="${text}", title="${title}"`);
    }
    
    // 스크린샷 캡처
    await page.screenshot({ 
      path: 'delete-functionality-detailed-test.png',
      fullPage: true 
    });
    console.log('\n📸 스크린샷 저장: delete-functionality-detailed-test.png');
    
    // 6. 최종 결과 요약
    console.log('\n' + '='.repeat(60));
    console.log('📊 ===== 테스트 결과 요약 =====');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error.message);
    console.error(error.stack);
  }
  
  console.log('\n테스트 완료! 5초 후 브라우저 종료...');
  await page.waitForTimeout(5000);
  await browser.close();
}

// 실행
testDeleteFunctionalityDetailed().catch(console.error);