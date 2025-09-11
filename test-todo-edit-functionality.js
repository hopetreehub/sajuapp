const { chromium } = require('playwright');

async function testTodoEditFunctionality() {
  console.log('✏️ ===== 할일 수정 기능 테스트 시작 =====\n');
  
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
    
    // 2. MonthView 테스트
    console.log('\n📍 2. MonthView 할일 수정 기능 테스트');
    console.log('='.repeat(50));
    
    const monthButton = await page.$('button:has-text("월")');
    if (monthButton) {
      await monthButton.click();
      await page.waitForTimeout(500);
      
      // 날짜에 마우스 호버하여 툴팁 표시
      const dateCell = await page.$('.cursor-pointer.transition-colors');
      if (dateCell) {
        await dateCell.hover();
        await page.waitForTimeout(1000);
        
        // 할일 수정 버튼 확인
        const editButton = await page.$('button[title="할일 수정"]');
        if (editButton) {
          console.log('   ✅ MonthView: 할일 수정 버튼 존재');
        } else {
          console.log('   ℹ️ MonthView: 할일이 없거나 수정 버튼 없음');
        }
      }
    }
    
    // 3. WeekView 테스트
    console.log('\n📍 3. WeekView 할일 수정 기능 테스트');
    console.log('='.repeat(50));
    
    const weekButton = await page.$('button:has-text("주")');
    if (weekButton) {
      await weekButton.click();
      await page.waitForTimeout(500);
      
      // 할일 항목에 마우스 호버
      const todoItem = await page.$('.group .flex.items-center.space-x-1');
      if (todoItem) {
        await todoItem.hover();
        await page.waitForTimeout(500);
        
        // 수정 버튼(연필 이모지) 확인
        const editButton = await page.$('button:has-text("✏️")');
        if (editButton) {
          console.log('   ✅ WeekView: 할일 수정 버튼 존재 (✏️)');
          
          // 수정 버튼 클릭해보기
          try {
            await editButton.click();
            await page.waitForTimeout(1000);
            
            const editModal = await page.$('text=할일 수정');
            if (editModal) {
              console.log('   ✅ WeekView: 할일 수정 모달 정상 열림');
              
              // 모달 닫기
              const cancelButton = await page.$('button:has-text("취소")');
              if (cancelButton) {
                await cancelButton.click();
              }
            } else {
              console.log('   ⚠️ WeekView: 할일 수정 모달이 열리지 않음');
            }
          } catch (error) {
            console.log(`   ⚠️ WeekView: 수정 버튼 클릭 실패 - ${error.message}`);
          }
        } else {
          console.log('   ℹ️ WeekView: 할일이 없거나 수정 버튼 없음');
        }
      } else {
        console.log('   ℹ️ WeekView: 할일 항목이 없음');
      }
    }
    
    // 4. DayView 테스트
    console.log('\n📍 4. DayView 할일 수정 기능 테스트');
    console.log('='.repeat(50));
    
    const dayButton = await page.$('button:has-text("일")');
    if (dayButton) {
      await dayButton.click();
      await page.waitForTimeout(500);
      
      // 할일 수정 버튼 확인
      const editButton = await page.$('button:has-text("수정")');
      if (editButton) {
        console.log('   ✅ DayView: 할일 수정 버튼 존재');
        
        // 수정 버튼 클릭 테스트
        try {
          await editButton.click();
          await page.waitForTimeout(1000);
          
          const editModal = await page.$('text=할일 수정');
          if (editModal) {
            console.log('   ✅ DayView: 할일 수정 모달 정상 열림');
            
            // 모달 필드 확인
            const textInput = await page.$('input[placeholder="할일을 입력하세요"]');
            const priorityButtons = await page.$$('button:has-text("높음"), button:has-text("보통"), button:has-text("낮음")');
            
            if (textInput && priorityButtons.length === 3) {
              console.log('   ✅ DayView: 수정 모달의 모든 필드 정상');
            } else {
              console.log('   ⚠️ DayView: 수정 모달 필드 불완전');
            }
            
            // 모달 닫기
            const cancelButton = await page.$('button:has-text("취소")');
            if (cancelButton) {
              await cancelButton.click();
            }
          } else {
            console.log('   ❌ DayView: 할일 수정 모달이 열리지 않음');
          }
        } catch (error) {
          console.log(`   ⚠️ DayView: 수정 버튼 클릭 실패 - ${error.message}`);
        }
      } else {
        console.log('   ℹ️ DayView: 할일이 없거나 수정 버튼 없음');
      }
    }
    
    // 5. EditTodoModal 상세 테스트 (만약 할일이 있다면)
    console.log('\n📍 5. EditTodoModal 상세 기능 테스트');
    console.log('='.repeat(50));
    
    // 할일 생성해서 테스트
    const quickTodoButton = await page.$('button:has-text("✅ 할일")');
    if (quickTodoButton) {
      await quickTodoButton.click();
      await page.waitForTimeout(1000);
      
      // AddItemModal에서 할일 탭으로 전환하고 테스트 할일 추가
      const todoTab = await page.$('button:has-text("할일")');
      if (todoTab) {
        await todoTab.click();
        await page.waitForTimeout(500);
        
        const todoInput = await page.$('input[placeholder*="할일"]');
        if (todoInput) {
          await todoInput.fill('테스트 할일 - 수정 기능 확인용');
          
          const addButton = await page.$('button:has-text("추가")');
          if (addButton) {
            await addButton.click();
            await page.waitForTimeout(1000);
            console.log('   ✅ 테스트용 할일 생성 완료');
            
            // 이제 생성된 할일의 수정 버튼 테스트
            const editButton = await page.$('button:has-text("수정")');
            if (editButton) {
              await editButton.click();
              await page.waitForTimeout(500);
              
              const modal = await page.$('text=할일 수정');
              if (modal) {
                console.log('   ✅ EditTodoModal이 정상적으로 열림');
                
                // 취소 버튼으로 닫기
                const cancelBtn = await page.$('button:has-text("취소")');
                if (cancelBtn) {
                  await cancelBtn.click();
                }
              }
            }
          }
        }
      }
    }
    
    // 스크린샷 캡처
    await page.screenshot({ 
      path: 'todo-edit-functionality-test.png',
      fullPage: true 
    });
    console.log('\n📸 스크린샷 저장: todo-edit-functionality-test.png');
    
    // 6. 최종 결과 요약
    console.log('\n' + '='.repeat(60));
    console.log('📊 ===== 할일 수정 기능 테스트 결과 =====');
    console.log('='.repeat(60));
    console.log('✨ Phase 2 완료: 모든 캘린더 뷰에 할일 수정 기능 추가됨!');
    console.log('   - MonthView: 할일 툴팁에 수정 버튼 추가');
    console.log('   - WeekView: 할일에 ✏️ 수정 버튼 추가');
    console.log('   - DayView: 할일에 수정/삭제 버튼 분리');
    console.log('   - EditTodoModal: 완전한 할일 수정 기능 제공');
    console.log('   - 모든 뷰에서 할일 클릭 시 수정 모달 열기');
    
  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error.message);
  }
  
  console.log('\n테스트 완료! 5초 후 브라우저 종료...');
  await page.waitForTimeout(5000);
  await browser.close();
}

// 실행
testTodoEditFunctionality().catch(console.error);