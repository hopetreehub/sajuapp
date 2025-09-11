const { chromium } = require('playwright');

async function healthCheck() {
  console.log('🏥 ===== 운명나침반 시스템 전체 헬스체크 시작 =====\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    details: []
  };
  
  // 1. 메인 페이지 체크
  console.log('📍 1. 메인 페이지 체크');
  console.log('='.repeat(50));
  results.total++;
  try {
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    const title = await page.$('text=운명나침반');
    if (title) {
      console.log('   ✅ 메인 페이지 로드 성공');
      results.passed++;
      results.details.push({ test: '메인 페이지', status: 'PASS' });
    } else {
      console.log('   ❌ 메인 페이지 로드 실패');
      results.failed++;
      results.details.push({ test: '메인 페이지', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`   ❌ 메인 페이지 접속 실패: ${error.message}`);
    results.failed++;
    results.details.push({ test: '메인 페이지', status: 'FAIL', error: error.message });
  }
  
  // 2. 캘린더 페이지 체크
  console.log('\n📍 2. 캘린더 페이지 체크');
  console.log('='.repeat(50));
  results.total++;
  try {
    await page.goto('http://localhost:4000/calendar', { waitUntil: 'networkidle' });
    const calendarView = await page.$('[class*="calendar"], [class*="Calendar"]');
    if (calendarView) {
      console.log('   ✅ 캘린더 페이지 로드 성공');
      results.passed++;
      results.details.push({ test: '캘린더 페이지', status: 'PASS' });
    } else {
      console.log('   ⚠️ 캘린더 요소를 찾을 수 없음');
      results.warnings++;
      results.details.push({ test: '캘린더 페이지', status: 'WARNING' });
    }
  } catch (error) {
    console.log(`   ❌ 캘린더 페이지 접속 실패: ${error.message}`);
    results.failed++;
    results.details.push({ test: '캘린더 페이지', status: 'FAIL', error: error.message });
  }
  
  // 3. 캘린더 뷰 전환 체크
  console.log('\n📍 3. 캘린더 뷰 전환 체크');
  console.log('='.repeat(50));
  const views = ['년', '월', '주', '일'];
  for (const view of views) {
    results.total++;
    try {
      const viewButton = await page.$(`button:has-text("${view}")`);
      if (viewButton) {
        await viewButton.click();
        await page.waitForTimeout(500);
        console.log(`   ✅ ${view} 뷰 전환 성공`);
        results.passed++;
        results.details.push({ test: `${view} 뷰 전환`, status: 'PASS' });
      } else {
        console.log(`   ⚠️ ${view} 뷰 버튼을 찾을 수 없음`);
        results.warnings++;
        results.details.push({ test: `${view} 뷰 전환`, status: 'WARNING' });
      }
    } catch (error) {
      console.log(`   ❌ ${view} 뷰 전환 실패: ${error.message}`);
      results.failed++;
      results.details.push({ test: `${view} 뷰 전환`, status: 'FAIL', error: error.message });
    }
  }
  
  // 4. DayView 특별 체크 (중복 할일 제거 확인)
  console.log('\n📍 4. DayView 중복 할일 제거 확인');
  console.log('='.repeat(50));
  results.total++;
  const dayButton = await page.$('button:has-text("일")');
  if (dayButton) {
    await dayButton.click();
    await page.waitForTimeout(500);
    
    const oldTodoSection = await page.$('text=📝 오늘의 할일');
    if (oldTodoSection) {
      console.log('   ❌ 중복 할일 섹션이 여전히 존재함');
      results.failed++;
      results.details.push({ test: 'DayView 중복 할일 제거', status: 'FAIL' });
    } else {
      console.log('   ✅ 중복 할일 섹션이 성공적으로 제거됨');
      results.passed++;
      results.details.push({ test: 'DayView 중복 할일 제거', status: 'PASS' });
    }
  }
  
  // 5. 빠른 작성 버튼 체크
  console.log('\n📍 5. 빠른 작성 버튼 체크');
  console.log('='.repeat(50));
  const quickButtons = ['📅', '✅', '📖'];
  const buttonNames = ['일정', '할일', '일기'];
  
  for (let i = 0; i < quickButtons.length; i++) {
    results.total++;
    const button = await page.$(`button:has-text("${quickButtons[i]}")`);
    if (button) {
      console.log(`   ✅ ${buttonNames[i]} 버튼 존재`);
      results.passed++;
      results.details.push({ test: `${buttonNames[i]} 버튼`, status: 'PASS' });
    } else {
      console.log(`   ❌ ${buttonNames[i]} 버튼 없음`);
      results.failed++;
      results.details.push({ test: `${buttonNames[i]} 버튼`, status: 'FAIL' });
    }
  }
  
  // 6. 모달 기능 체크
  console.log('\n📍 6. 모달 기능 체크');
  console.log('='.repeat(50));
  results.total++;
  try {
    const todoButton = await page.$('button:has-text("✅")');
    if (todoButton) {
      await todoButton.click();
      await page.waitForTimeout(1000);
      
      const modal = await page.$('[class*="modal"], [class*="Modal"], .fixed.inset-0');
      if (modal) {
        console.log('   ✅ 모달 열기 성공');
        results.passed++;
        results.details.push({ test: '모달 기능', status: 'PASS' });
        
        // 모달 닫기
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      } else {
        console.log('   ❌ 모달 열기 실패');
        results.failed++;
        results.details.push({ test: '모달 기능', status: 'FAIL' });
      }
    }
  } catch (error) {
    console.log(`   ❌ 모달 테스트 실패: ${error.message}`);
    results.failed++;
    results.details.push({ test: '모달 기능', status: 'FAIL', error: error.message });
  }
  
  // 7. 사주 분석 페이지 체크
  console.log('\n📍 7. 사주 분석 페이지 체크');
  console.log('='.repeat(50));
  results.total++;
  try {
    await page.goto('http://localhost:4000/saju', { waitUntil: 'networkidle' });
    const sajuPage = await page.$('text=사주') || await page.$('text=분석');
    if (sajuPage) {
      console.log('   ✅ 사주 분석 페이지 로드 성공');
      results.passed++;
      results.details.push({ test: '사주 분석 페이지', status: 'PASS' });
    } else {
      console.log('   ⚠️ 사주 분석 요소를 찾을 수 없음');
      results.warnings++;
      results.details.push({ test: '사주 분석 페이지', status: 'WARNING' });
    }
  } catch (error) {
    console.log(`   ❌ 사주 분석 페이지 접속 실패: ${error.message}`);
    results.failed++;
    results.details.push({ test: '사주 분석 페이지', status: 'FAIL', error: error.message });
  }
  
  // 8. 설정 페이지 체크
  console.log('\n📍 8. 설정 페이지 체크');
  console.log('='.repeat(50));
  results.total++;
  try {
    await page.goto('http://localhost:4000/settings', { waitUntil: 'networkidle' });
    const settingsPage = await page.$('text=설정') || await page.$('[class*="settings"], [class*="Settings"]');
    if (settingsPage) {
      console.log('   ✅ 설정 페이지 로드 성공');
      results.passed++;
      results.details.push({ test: '설정 페이지', status: 'PASS' });
    } else {
      console.log('   ⚠️ 설정 요소를 찾을 수 없음');
      results.warnings++;
      results.details.push({ test: '설정 페이지', status: 'WARNING' });
    }
  } catch (error) {
    console.log(`   ❌ 설정 페이지 접속 실패: ${error.message}`);
    results.failed++;
    results.details.push({ test: '설정 페이지', status: 'FAIL', error: error.message });
  }
  
  // 9. 네비게이션 체크
  console.log('\n📍 9. 네비게이션 메뉴 체크');
  console.log('='.repeat(50));
  await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
  const navItems = ['홈', '캘린더', '사주분석', '궁합', '설정'];
  for (const item of navItems) {
    results.total++;
    const navLink = await page.$(`text=${item}`);
    if (navLink) {
      console.log(`   ✅ ${item} 메뉴 존재`);
      results.passed++;
      results.details.push({ test: `네비게이션-${item}`, status: 'PASS' });
    } else {
      console.log(`   ⚠️ ${item} 메뉴 없음`);
      results.warnings++;
      results.details.push({ test: `네비게이션-${item}`, status: 'WARNING' });
    }
  }
  
  // 10. 콘솔 에러 체크
  console.log('\n📍 10. 콘솔 에러 체크');
  console.log('='.repeat(50));
  results.total++;
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  if (consoleErrors.length === 0) {
    console.log('   ✅ 콘솔 에러 없음');
    results.passed++;
    results.details.push({ test: '콘솔 에러', status: 'PASS' });
  } else {
    console.log(`   ⚠️ ${consoleErrors.length}개의 콘솔 에러 발견`);
    consoleErrors.forEach(err => console.log(`      - ${err.substring(0, 100)}...`));
    results.warnings++;
    results.details.push({ test: '콘솔 에러', status: 'WARNING', count: consoleErrors.length });
  }
  
  // 최종 결과 출력
  console.log('\n' + '='.repeat(60));
  console.log('📊 ===== 헬스체크 최종 결과 =====');
  console.log('='.repeat(60));
  console.log(`총 테스트: ${results.total}개`);
  console.log(`✅ 성공: ${results.passed}개 (${Math.round(results.passed/results.total*100)}%)`);
  console.log(`❌ 실패: ${results.failed}개 (${Math.round(results.failed/results.total*100)}%)`);
  console.log(`⚠️ 경고: ${results.warnings}개 (${Math.round(results.warnings/results.total*100)}%)`);
  
  // 상태 평가
  console.log('\n🏥 시스템 상태 평가:');
  const successRate = results.passed / results.total * 100;
  if (successRate >= 90) {
    console.log('🎉 매우 양호 - 시스템이 정상적으로 작동하고 있습니다!');
  } else if (successRate >= 70) {
    console.log('✅ 양호 - 대부분의 기능이 정상 작동하지만 일부 개선이 필요합니다.');
  } else if (successRate >= 50) {
    console.log('⚠️ 주의 필요 - 여러 문제가 발견되어 점검이 필요합니다.');
  } else {
    console.log('❌ 위험 - 심각한 문제가 발견되어 즉시 조치가 필요합니다.');
  }
  
  // 스크린샷 저장
  await page.screenshot({ path: 'health-check-screenshot.png', fullPage: true });
  console.log('\n📸 스크린샷 저장: health-check-screenshot.png');
  
  await browser.close();
  return results;
}

// 실행
healthCheck().then(results => {
  console.log('\n✨ 헬스체크 완료!');
}).catch(error => {
  console.error('헬스체크 실행 중 오류:', error);
});