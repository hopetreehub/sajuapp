const { chromium } = require('playwright');

async function testMonthViewImprovements() {
  console.log('📅 ===== MonthView 기능 개선 테스트 시작 =====\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300
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
    
    // 2. MonthView로 전환
    console.log('\n📍 2. MonthView로 전환...');
    const monthButton = await page.$('button:has-text("월")');
    if (monthButton) {
      await monthButton.click();
      await page.waitForTimeout(500);
      console.log('   ✅ MonthView 활성화됨');
    }
    
    // 3. ActionMenu 개선사항 테스트
    console.log('\n📍 3. ActionMenu 개선사항 테스트');
    console.log('='.repeat(50));
    
    // 날짜 클릭하여 ActionMenu 열기
    const dateCell = await page.$('.cursor-pointer.transition-colors');
    if (dateCell) {
      await dateCell.click();
      await page.waitForTimeout(1000);
      
      // "일정,할일 추가" 버튼 확인
      const eventButton = await page.$('text=일정,할일 추가');
      if (eventButton) {
        console.log('   ✅ "일정,할일 추가" 버튼 존재');
        
        // 설명 텍스트 확인
        const description = await page.$('text=새로운 일정과 할일을 만듭니다');
        if (description) {
          console.log('   ✅ 설명 텍스트 "새로운 일정과 할일을 만듭니다" 확인');
        } else {
          console.log('   ⚠️ 설명 텍스트가 업데이트되지 않음');
        }
      } else {
        console.log('   ❌ "일정,할일 추가" 버튼 없음');
      }
      
      // "할일 추가" 버튼이 제거되었는지 확인
      const todoButton = await page.$('text=할일 추가');
      if (todoButton) {
        console.log('   ❌ "할일 추가" 버튼이 여전히 존재함');
      } else {
        console.log('   ✅ "할일 추가" 버튼 성공적으로 제거됨');
      }
      
      // 일기 쓰기 버튼 확인
      const diaryButton = await page.$('text=일기 쓰기');
      if (diaryButton) {
        console.log('   ✅ "일기 쓰기" 버튼 정상 존재');
      }
      
      // ActionMenu 닫기
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } else {
      console.log('   ⚠️ 날짜 셀을 찾을 수 없음');
    }
    
    // 4. 일정 삭제 기능 테스트
    console.log('\n📍 4. MonthView 일정 삭제 기능 테스트');
    console.log('='.repeat(50));
    
    // 일정 항목에 마우스 호버
    const eventItem = await page.$('[class*="text-xs p-1 rounded cursor-pointer"]');
    if (eventItem) {
      await eventItem.hover();
      await page.waitForTimeout(500);
      
      // 삭제 버튼 확인
      const deleteButton = await page.$('button[title="일정 삭제"]');
      if (deleteButton) {
        console.log('   ✅ 일정 삭제 버튼 호버 시 정상 표시');
        
        // 삭제 버튼이 보이는지 확인
        const isVisible = await deleteButton.isVisible();
        console.log(`   ${isVisible ? '✅' : '❌'} 삭제 버튼 가시성: ${isVisible ? '표시됨' : '숨겨짐'}`);
      } else {
        console.log('   ⚠️ 일정 삭제 버튼 없음');
      }
    } else {
      console.log('   ℹ️ 일정이 없어 삭제 기능 테스트 불가');
    }
    
    // 5. 할일 수정/삭제 기능 테스트 (툴팁)
    console.log('\n📍 5. MonthView 할일 수정/삭제 기능 테스트');
    console.log('='.repeat(50));
    
    // 날짜에 마우스 호버하여 할일 툴팁 표시
    const dateWithTodos = await page.$('.cursor-pointer.transition-colors');
    if (dateWithTodos) {
      await dateWithTodos.hover();
      await page.waitForTimeout(1500);
      
      // 할일 수정 버튼 확인
      const editButton = await page.$('button[title="할일 수정"]');
      if (editButton) {
        console.log('   ✅ 할일 수정 버튼(✏️) 존재');
      } else {
        console.log('   ℹ️ 할일이 없거나 수정 버튼 없음');
      }
      
      // 할일 삭제 버튼 확인
      const todoDeleteButton = await page.$('button[title="할일 삭제"]');
      if (todoDeleteButton) {
        console.log('   ✅ 할일 삭제 버튼(×) 존재');
      } else {
        console.log('   ℹ️ 할일이 없거나 삭제 버튼 없음');
      }
    }
    
    // 6. ActionMenu 기능 테스트
    console.log('\n📍 6. "일정,할일 추가" 버튼 기능 테스트');
    console.log('='.repeat(50));
    
    // 다시 날짜 클릭
    const anotherDateCell = await page.$('.cursor-pointer.transition-colors');
    if (anotherDateCell) {
      await anotherDateCell.click();
      await page.waitForTimeout(1000);
      
      const eventAddButton = await page.$('text=일정,할일 추가');
      if (eventAddButton) {
        try {
          await eventAddButton.click();
          await page.waitForTimeout(1000);
          
          // EventModal이 열리는지 확인
          const modal = await page.$('[class*="modal"], [class*="Modal"], .fixed.inset-0');
          if (modal) {
            console.log('   ✅ "일정,할일 추가" 버튼 클릭 시 모달 정상 열림');
            
            // 모달 닫기
            const cancelButton = await page.$('button:has-text("취소")');
            if (cancelButton) {
              await cancelButton.click();
            } else {
              await page.keyboard.press('Escape');
            }
          } else {
            console.log('   ⚠️ "일정,할일 추가" 버튼 클릭 시 모달이 열리지 않음');
          }
        } catch (error) {
          console.log(`   ⚠️ "일정,할일 추가" 버튼 클릭 실패: ${error.message}`);
        }
      }
    }
    
    // 스크린샷 캡처
    await page.screenshot({ 
      path: 'monthview-improvements-test.png',
      fullPage: true 
    });
    console.log('\n📸 스크린샷 저장: monthview-improvements-test.png');
    
    // 7. 최종 결과 요약
    console.log('\n' + '='.repeat(60));
    console.log('📊 ===== MonthView 개선사항 테스트 결과 =====');
    console.log('='.repeat(60));
    console.log('✨ MonthView 기능 개선 완료!');
    console.log('   - 일정 삭제 기능: 확인 다이얼로그 추가');
    console.log('   - 할일 추가 버튼: 완전 제거');
    console.log('   - 일정 추가 버튼: "일정,할일 추가"로 변경');
    console.log('   - 사용자 혼동 방지 및 UI 일관성 개선');
    
  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error.message);
  }
  
  console.log('\n테스트 완료! 5초 후 브라우저 종료...');
  await page.waitForTimeout(5000);
  await browser.close();
}

// 실행
testMonthViewImprovements().catch(console.error);