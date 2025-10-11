/**
 * 레이더 차트 점수 분석 테스트
 * 기본 점수 대비 시간대 점수의 변화를 직접 측정
 */
import { test, expect } from '@playwright/test';

test.describe('레이더 차트 점수 분석', () => {
  test('건강/재물/인간관계 차트 점수 변화 분석', async ({ page }) => {
    // 페이지 로드
    await page.goto('http://localhost:4000/saju');

    // 페이지 로드 대기
    await page.waitForLoadState('networkidle');

    // 고객 선택 (첫 번째 고객)
    const customerSelector = page.locator('select, [role="combobox"]').first();
    await customerSelector.waitFor({ state: 'visible', timeout: 10000 });

    // 선택 가능한 옵션 확인
    const options = await customerSelector.locator('option').count();
    console.log(`📊 선택 가능한 고객 수: ${options}`);

    if (options > 1) {
      // 첫 번째 고객 선택 (인덱스 1, 0은 보통 placeholder)
      await customerSelector.selectOption({ index: 1 });
      console.log('✅ 고객 선택 완료');

      // 데이터 로드 대기
      await page.waitForTimeout(2000);
    }

    // 콘솔 로그 수집
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('건강 점수') || text.includes('재물 점수') || text.includes('인간관계')) {
        consoleLogs.push(text);
      }
    });

    // 페이지 새로고침으로 콘솔 로그 다시 캡처
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 콘솔 로그 출력
    console.log('\n=== 📊 수집된 콘솔 로그 ===');
    consoleLogs.forEach(log => console.log(log));

    // 건강 차트가 표시되는지 확인
    const healthChart = page.locator('text=12대 건강 시스템').first();
    await expect(healthChart).toBeVisible({ timeout: 10000 });
    console.log('✅ 건강 차트 표시됨');

    // 재물 차트 확인
    const wealthChart = page.locator('text=9대 재물운 시스템').first();
    await expect(wealthChart).toBeVisible({ timeout: 10000 });
    console.log('✅ 재물 차트 표시됨');

    // 인간관계 차트 확인
    const relationshipChart = page.locator('text=7대 인간관계운 시스템').first();
    await expect(relationshipChart).toBeVisible({ timeout: 10000 });
    console.log('✅ 인간관계 차트 표시됨');

    // JavaScript로 점수 데이터 직접 추출
    const scoreData = await page.evaluate(() => {
      const results: any = {
        health: [],
        wealth: [],
        relationship: []
      };

      // 전역 변수나 윈도우 객체에서 데이터 추출 시도
      // (실제로는 React 컴포넌트 내부이므로 접근 불가능할 수 있음)

      return results;
    });

    // 시간대 버튼 클릭 테스트
    console.log('\n=== 🎯 시간대 버튼 클릭 테스트 ===');

    // "오늘" 버튼 찾기 및 클릭
    const todayButtons = page.locator('button:has-text("오늘")');
    const todayButtonCount = await todayButtons.count();
    console.log(`발견된 "오늘" 버튼 수: ${todayButtonCount}`);

    if (todayButtonCount > 0) {
      // 첫 번째 "오늘" 버튼 클릭 (건강 차트)
      await todayButtons.first().click();
      console.log('✅ 건강 차트 "오늘" 버튼 클릭');
      await page.waitForTimeout(1000);

      // "이달" 버튼 클릭
      const monthButtons = page.locator('button:has-text("이달")');
      await monthButtons.first().click();
      console.log('✅ 건강 차트 "이달" 버튼 클릭');
      await page.waitForTimeout(1000);

      // "올해" 버튼 클릭
      const yearButtons = page.locator('button:has-text("올해")');
      await yearButtons.first().click();
      console.log('✅ 건강 차트 "올해" 버튼 클릭');
      await page.waitForTimeout(1000);

      // "기본" 버튼으로 돌아가기
      const baseButtons = page.locator('button:has-text("기본")');
      await baseButtons.first().click();
      console.log('✅ 건강 차트 "기본" 버튼 클릭');
    }

    // 스크린샷 촬영
    await page.screenshot({
      path: 'radar-chart-analysis.png',
      fullPage: true
    });
    console.log('\n📸 스크린샷 저장: radar-chart-analysis.png');

    // 최종 대기
    await page.waitForTimeout(2000);
  });

  test('점수 계산 로직 직접 테스트', async ({ page }) => {
    console.log('\n=== 🧪 점수 계산 로직 직접 테스트 ===\n');

    // 페이지에서 계산 함수 직접 실행
    await page.goto('http://localhost:4000/saju');
    await page.waitForLoadState('networkidle');

    // 테스트용 사주 데이터로 점수 계산
    const testScores = await page.evaluate(() => {
      // 샘플 사주 데이터
      const testSaju = {
        year: { gan: '갑', ji: '자' },
        month: { gan: '병', ji: '인' },
        day: { gan: '무', ji: '진' },
        time: { gan: '경', ji: '신' },
        ohHaengBalance: {
          목: 30,
          화: 25,
          토: 20,
          금: 15,
          수: 10,
        },
        fullSaju: '갑자 병인 무진 경신',
      };

      // 브라우저 콘솔에서 함수 접근 시도
      // (실제로는 모듈 스코프라 접근 불가능)
      return {
        message: '계산 함수는 모듈 스코프에 있어 직접 접근 불가',
        testData: testSaju
      };
    });

    console.log('테스트 결과:', JSON.stringify(testScores, null, 2));
  });
});
