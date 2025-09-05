// 브라우저 콘솔에서 실행할 테스트 코드
console.log('=== 일기 저장 버튼 테스트 시작 ===');

// 1. 일간 뷰 클릭
const dayButton = document.querySelector('button[class*="text-sm"]:has-text("일간")') || 
                  Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('일간'));
if (dayButton) {
  console.log('✓ 일간 뷰 버튼 찾음');
  dayButton.click();
  
  setTimeout(() => {
    // 2. 일기쓰기 버튼 찾기
    const diaryButton = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent.includes('오늘의 일기 쓰기')
    );
    
    if (diaryButton) {
      console.log('✓ 일기쓰기 버튼 찾음');
      diaryButton.click();
      
      setTimeout(() => {
        // 3. textarea 찾기
        const textarea = document.querySelector('textarea');
        if (textarea) {
          console.log('✓ 텍스트 입력 영역 찾음');
          
          // 4. 저장 버튼 찾기
          const saveButton = Array.from(document.querySelectorAll('button')).find(btn => 
            btn.textContent === '저장하기'
          );
          
          if (saveButton) {
            console.log('✓ 저장 버튼 찾음');
            console.log('  - 초기 상태:', saveButton.disabled ? '비활성화' : '활성화');
            console.log('  - 초기 클래스:', saveButton.className);
            
            // 5. 텍스트 입력
            textarea.value = '테스트 일기 내용입니다.';
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.dispatchEvent(new Event('change', { bubbles: true }));
            
            // React의 상태 업데이트를 위해 잠시 대기
            setTimeout(() => {
              console.log('  - 텍스트 입력 후 상태:', saveButton.disabled ? '비활성화' : '활성화');
              console.log('  - 텍스트 입력 후 클래스:', saveButton.className);
              
              if (saveButton.className.includes('bg-amber-500')) {
                console.log('✅ 성공: 저장 버튼이 활성화됨 (노란색)');
              } else if (saveButton.className.includes('bg-gray-300')) {
                console.log('❌ 실패: 저장 버튼이 여전히 비활성화 상태 (회색)');
              }
              
              // content state 확인
              const reactFiber = textarea._valueTracker?.getValue?.();
              console.log('  - textarea 실제 값:', textarea.value);
              console.log('  - React 추적 값:', reactFiber);
              
            }, 1000);
            
          } else {
            console.log('❌ 저장 버튼을 찾을 수 없음');
          }
        } else {
          console.log('❌ textarea를 찾을 수 없음');
        }
      }, 1000);
    } else {
      console.log('❌ 일기쓰기 버튼을 찾을 수 없음');
    }
  }, 1000);
} else {
  console.log('❌ 일간 뷰 버튼을 찾을 수 없음');
}