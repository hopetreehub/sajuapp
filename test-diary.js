const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('📌 localhost:4000 접속 중...');
  await page.goto('http://localhost:4000');
  
  // 페이지 로드 대기
  await page.waitForTimeout(2000);
  
  console.log('📌 일간 뷰 버튼 클릭...');
  // 일간 뷰로 이동
  const dayButton = await page.$('button:has-text("일간")');
  if (dayButton) {
    await dayButton.click();
    await page.waitForTimeout(1000);
  }
  
  console.log('📌 일기쓰기 버튼 찾기...');
  // 일기쓰기 버튼 찾기
  const diaryButton = await page.$('button:has-text("오늘의 일기 쓰기")');
  if (diaryButton) {
    console.log('✅ 일기쓰기 버튼 발견!');
    await diaryButton.click();
    await page.waitForTimeout(1000);
    
    console.log('📌 일기 모달 확인...');
    // 일기 모달이 열렸는지 확인
    const modal = await page.$('text=/일기장/')
    if (modal) {
      console.log('✅ 일기 모달 열림!');
      
      // textarea 찾기
      const textarea = await page.$('textarea');
      if (textarea) {
        console.log('📌 텍스트 입력 중...');
        
        // 텍스트 입력 전 저장 버튼 상태 확인
        const saveButtonBefore = await page.$('button:has-text("저장하기")');
        const isDisabledBefore = await saveButtonBefore.isDisabled();
        console.log(`⚡ 텍스트 입력 전 저장 버튼 상태: ${isDisabledBefore ? '비활성화' : '활성화'}`);
        
        // 텍스트 입력
        await textarea.fill('테스트 일기 내용입니다. Playwright로 자동 입력했습니다.');
        await page.waitForTimeout(500);
        
        // 텍스트 입력 후 저장 버튼 상태 확인
        const saveButtonAfter = await page.$('button:has-text("저장하기")');
        const isDisabledAfter = await saveButtonAfter.isDisabled();
        console.log(`⚡ 텍스트 입력 후 저장 버튼 상태: ${isDisabledAfter ? '비활성화' : '활성화'}`);
        
        // 버튼 클래스 확인
        const buttonClasses = await saveButtonAfter.getAttribute('class');
        console.log(`📝 저장 버튼 클래스: ${buttonClasses}`);
        
        // 버튼 색상 체크
        if (buttonClasses.includes('bg-amber-500')) {
          console.log('✅ 저장 버튼이 노란색(활성화)으로 변경됨!');
        } else if (buttonClasses.includes('bg-gray-300')) {
          console.log('❌ 저장 버튼이 여전히 회색(비활성화) 상태!');
        }
        
        // 저장 버튼 클릭 시도
        if (!isDisabledAfter) {
          console.log('📌 저장 버튼 클릭 시도...');
          await saveButtonAfter.click();
          await page.waitForTimeout(2000);
          console.log('✅ 저장 완료!');
        } else {
          console.log('❌ 저장 버튼이 비활성화되어 클릭할 수 없음');
        }
        
      } else {
        console.log('❌ textarea를 찾을 수 없음');
      }
    } else {
      console.log('❌ 일기 모달을 찾을 수 없음');
    }
  } else {
    console.log('❌ 일기쓰기 버튼을 찾을 수 없음');
  }
  
  console.log('📌 5초 후 브라우저 종료...');
  await page.waitForTimeout(5000);
  await browser.close();
})();