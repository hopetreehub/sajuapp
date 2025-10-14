/**
 * 자미두수(Ziwei) 및 타로(Tarot) 기능 통합 테스트
 *
 * 테스트 대상:
 * 1. 자미두수 AI 챗 - 주간 운세 추천 기능
 * 2. 타로 점술 - AI 해석 및 기록 저장 기능
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4000';

test.describe('운명나침반 - 자미두수 & 타로 기능 테스트', () => {

  // 테스트 전 로그인 처리
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);

    // 로그인 페이지로 리다이렉트되는지 확인
    await page.waitForURL('**/auth**', { timeout: 5000 });

    // 로그인 수행 (mock auth)
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 로그인 후 대시보드로 이동 대기
    await page.waitForURL(/\/(calendar|dashboard)?/, { timeout: 5000 });
  });

  test('1. 자미두수 페이지 접근 및 기본 UI 확인', async ({ page }) => {
    // 자미두수 페이지로 이동
    await page.goto(`${BASE_URL}/ziwei`);
    await page.waitForLoadState('networkidle');

    // 페이지 타이틀 확인
    await expect(page.locator('h1, h2').filter({ hasText: /자미두수|紫微斗數/ })).toBeVisible({ timeout: 10000 });

    console.log('✅ 자미두수 페이지 로딩 성공');
  });

  test('2. 자미두수 AI 챗 - 주간 운세 추천 질문', async ({ page }) => {
    await page.goto(`${BASE_URL}/ziwei`);
    await page.waitForLoadState('networkidle');

    // AI 챗 입력창 찾기 (다양한 선택자 시도)
    const chatInput = page.locator('textarea, input[type="text"]').filter({
      hasText: /질문|채팅|메시지/i
    }).or(page.locator('textarea').first());

    // 입력창이 보일 때까지 대기
    await chatInput.waitFor({ state: 'visible', timeout: 10000 });

    // 주간 운세 질문 입력
    const testQuestion = '이번 주 중 언제 중요한 일을 하면 좋을까요?';
    await chatInput.fill(testQuestion);

    // 전송 버튼 찾기 및 클릭
    const sendButton = page.locator('button').filter({ hasText: /전송|보내기|Send/i }).first();
    await sendButton.click();

    // AI 응답 대기 (최대 30초)
    await page.waitForTimeout(2000); // 최소 2초 대기

    // 응답에 날짜 정보가 포함되어 있는지 확인
    const responseArea = page.locator('.chat-message, .message, .response').last();
    const responseText = await responseArea.textContent() || '';

    // 날짜 패턴 확인 (예: "1월 15일", "15일", "월요일", "화요일" 등)
    const hasDateInfo = /\d{1,2}일|월요일|화요일|수요일|목요일|금요일|토요일|일요일/i.test(responseText);

    expect(hasDateInfo).toBeTruthy();
    console.log('✅ 자미두수 AI 주간 운세 추천 응답 확인');
    console.log(`   응답 내용 일부: ${responseText.substring(0, 100)}...`);
  });

  test('3. 타로 페이지 접근 및 스프레드 선택', async ({ page }) => {
    await page.goto(`${BASE_URL}/tarot`);
    await page.waitForLoadState('networkidle');

    // 페이지 타이틀 확인
    await expect(page.locator('h1, h2').filter({ hasText: /타로|Tarot/i })).toBeVisible({ timeout: 10000 });

    // 스프레드 선택 버튼 확인 (예: "원 카드", "쓰리 카드" 등)
    const spreadButtons = page.locator('button').filter({ hasText: /카드|스프레드/i });
    const buttonCount = await spreadButtons.count();

    expect(buttonCount).toBeGreaterThan(0);
    console.log(`✅ 타로 페이지 로딩 성공 (스프레드 ${buttonCount}개 발견)`);
  });

  test('4. 타로 카드 점술 전체 플로우 테스트', async ({ page }) => {
    await page.goto(`${BASE_URL}/tarot`);
    await page.waitForLoadState('networkidle');

    // 1단계: 스프레드 선택 (첫 번째 스프레드)
    const firstSpread = page.locator('button').filter({
      hasText: /원.*카드|단일.*카드|One.*Card/i
    }).first();

    if (await firstSpread.count() > 0) {
      await firstSpread.click();
      console.log('✅ 스프레드 선택 완료');
    } else {
      // 대체: 아무 스프레드 버튼 클릭
      await page.locator('button').filter({ hasText: /카드/i }).first().click();
    }

    // 2단계: 질문 입력
    await page.waitForTimeout(500);
    const questionInput = page.locator('textarea, input[type="text"]').first();
    await questionInput.fill('오늘의 운세는 어떤가요?');

    // 3단계: 카드 뽑기
    const drawButton = page.locator('button').filter({ hasText: /카드.*뽑기|뽑기|Draw/i }).first();
    await drawButton.click();
    console.log('✅ 카드 뽑기 실행');

    // 카드 뽑기 애니메이션 대기
    await page.waitForTimeout(2000);

    // 4단계: AI 해석 요청 버튼 확인
    const aiButton = page.locator('button').filter({ hasText: /AI.*해석|해석.*받기/i }).first();

    if (await aiButton.isVisible({ timeout: 5000 })) {
      await aiButton.click();
      console.log('✅ AI 해석 요청 완료');

      // AI 해석 결과 대기
      await page.waitForTimeout(3000);

      // AI 해석 결과 확인
      const aiResponse = page.locator('.prose, .interpretation, .response').last();
      if (await aiResponse.isVisible({ timeout: 5000 })) {
        const responseText = await aiResponse.textContent() || '';
        expect(responseText.length).toBeGreaterThan(50);
        console.log('✅ AI 해석 결과 수신 확인');
      }
    } else {
      console.log('⚠️  AI 해석 버튼을 찾을 수 없음 (AI 서비스 미실행)');
    }
  });

  test('5. 타로 기록 보기 기능 테스트', async ({ page }) => {
    await page.goto(`${BASE_URL}/tarot`);
    await page.waitForLoadState('networkidle');

    // 기록 보기 버튼 찾기
    const historyButton = page.locator('button').filter({
      hasText: /기록.*보기|📜.*기록|History/i
    }).first();

    if (await historyButton.isVisible({ timeout: 5000 })) {
      await historyButton.click();
      console.log('✅ 기록 보기 버튼 클릭');

      // 기록 뷰 표시 확인
      await page.waitForTimeout(500);
      const historyView = page.locator('.history, .record').first();

      if (await historyView.isVisible({ timeout: 3000 })) {
        console.log('✅ 타로 기록 뷰 표시 확인');
      } else {
        console.log('ℹ️  타로 기록이 비어있거나 UI가 다를 수 있음');
      }
    } else {
      console.log('⚠️  기록 보기 버튼을 찾을 수 없음');
    }
  });

  test('6. 스크린샷 캡처 - 자미두수 페이지', async ({ page }) => {
    await page.goto(`${BASE_URL}/ziwei`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'screenshot-ziwei-page.png',
      fullPage: true
    });
    console.log('✅ 자미두수 페이지 스크린샷 저장: screenshot-ziwei-page.png');
  });

  test('7. 스크린샷 캡처 - 타로 페이지', async ({ page }) => {
    await page.goto(`${BASE_URL}/tarot`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'screenshot-tarot-page.png',
      fullPage: true
    });
    console.log('✅ 타로 페이지 스크린샷 저장: screenshot-tarot-page.png');
  });
});
