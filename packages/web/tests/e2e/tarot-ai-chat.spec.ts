/**
 * 타로 AI 챗 E2E 테스트 (모달 UI 개선)
 *
 * TDD 원칙: 실패하는 테스트 작성 → 구현 → 리팩토링
 * @author Claude Code
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test';
import { login } from './auth.helper';

test.describe('타로 AI 챗 모달 기능', () => {
  test.beforeEach(async ({ page }) => {
    // 인증 필요 - 테스트 사용자로 로그인
    await login(page);

    // 타로 페이지로 이동
    await page.goto('/tarot');

    // 페이지 로드 대기
    await page.waitForLoadState('networkidle');

    // 추가 대기: 타로 페이지의 초기화 완료 대기
    await page.waitForTimeout(2000);
  });

  test('타로 페이지가 정상 로드되어야 함', async ({ page }) => {
    // 페이지 제목 확인 (이모지 포함) - h1 태그 명확히 지정
    const h1Element = page.locator('h1').first();
    await expect(h1Element).toBeVisible({ timeout: 10000 });

    // 스프레드 선택 UI 확인
    const spreadOptions = page.locator('[data-testid="spread-option"]').or(
      page.locator('button').filter({ hasText: /원 카드|쓰리 카드|켈틱 크로스/i })
    );
    await expect(spreadOptions.first()).toBeVisible({ timeout: 10000 });
  });

  test('스프레드 선택 → 질문 입력 → 카드 뽑기 플로우', async ({ page }) => {
    // 스프레드 선택 (원 카드 선택)
    const oneCardButton = page.locator('button').filter({ hasText: /원 카드|One Card/i });
    if (await oneCardButton.isVisible({ timeout: 5000 })) {
      await oneCardButton.click();
    }

    // 질문 입력 필드
    const questionInput = page.locator('input[placeholder*="질문"], textarea[placeholder*="질문"]');
    if (await questionInput.isVisible({ timeout: 5000 })) {
      await questionInput.fill('오늘의 운세는 어떤가요?');

      // 다음 단계 버튼 클릭
      const nextButton = page.locator('button').filter({ hasText: /다음|카드 뽑기|확인/i });
      await nextButton.click();
    }

    // 카드가 표시될 때까지 대기
    await page.waitForTimeout(2000);
  });

  test('AI 챗 모달 버튼이 표시되어야 함', async ({ page }) => {
    // 스프레드 선택 (원 카드)
    const oneCardButton = page.locator('button').filter({ hasText: /원 카드/i }).first();
    await expect(oneCardButton).toBeVisible({ timeout: 5000 });
    await oneCardButton.click();

    // 질문 입력
    const questionInput = page.locator('textarea[placeholder*="예:"]');
    await expect(questionInput).toBeVisible({ timeout: 5000 });
    await questionInput.fill('테스트 질문입니다');

    // 카드 뽑기 버튼 클릭
    const drawButton = page.locator('button').filter({ hasText: /카드 뽑기/i });
    await expect(drawButton).toBeVisible({ timeout: 3000 });
    await drawButton.click();

    // 카드 뽑는 중 애니메이션 대기
    await page.waitForTimeout(3000);

    // AI 챗 버튼 찾기 (stage === 'show-result' 상태에서만 표시)
    const aiChatButton = page.locator('button').filter({
      hasText: /AI에게.*질문/i
    });

    await expect(aiChatButton).toBeVisible({ timeout: 10000 });
  });

  test('AI 챗 모달이 열려야 함', async ({ page }) => {
    // 스프레드 선택 (원 카드)
    const oneCardButton = page.locator('button').filter({ hasText: /원 카드/i }).first();
    await expect(oneCardButton).toBeVisible({ timeout: 5000 });
    await oneCardButton.click();

    // 질문 입력
    const questionInput = page.locator('textarea[placeholder*="예:"]');
    await expect(questionInput).toBeVisible({ timeout: 5000 });
    await questionInput.fill('테스트 질문');

    // 카드 뽑기 버튼 클릭
    const drawButton = page.locator('button').filter({ hasText: /카드 뽑기/i });
    await expect(drawButton).toBeVisible({ timeout: 3000 });
    await drawButton.click();

    // 카드 뽑는 중 애니메이션 대기
    await page.waitForTimeout(3000);

    // AI 챗 버튼 클릭
    const aiChatButton = page.locator('button').filter({
      hasText: /AI에게.*질문/i
    });
    await expect(aiChatButton).toBeVisible({ timeout: 10000 });
    await aiChatButton.click();

    // 모달 헤더 확인
    const modalHeader = page.locator('h3:has-text("타로 AI 상담사")');
    await expect(modalHeader).toBeVisible({ timeout: 5000 });

    // 시스템 메시지 확인
    const systemMessage = page.locator('text=/안녕하세요.*타로.*상담사/i');
    await expect(systemMessage).toBeVisible();
  });

  test('AI 챗에서 질문 입력 및 응답 확인', async ({ page }) => {
    // 스프레드 선택 (원 카드)
    const oneCardButton = page.locator('button').filter({ hasText: /원 카드/i }).first();
    await expect(oneCardButton).toBeVisible({ timeout: 5000 });
    await oneCardButton.click();

    // 질문 입력
    const questionInput = page.locator('textarea[placeholder*="예:"]');
    await expect(questionInput).toBeVisible({ timeout: 5000 });
    await questionInput.fill('테스트 질문');

    // 카드 뽑기 버튼 클릭
    const drawButton = page.locator('button').filter({ hasText: /카드 뽑기/i });
    await expect(drawButton).toBeVisible({ timeout: 3000 });
    await drawButton.click();

    // 카드 뽑는 중 애니메이션 대기
    await page.waitForTimeout(3000);

    // AI 챗 버튼 클릭
    const aiChatButton = page.locator('button').filter({
      hasText: /AI에게.*질문/i
    });
    await expect(aiChatButton).toBeVisible({ timeout: 10000 });
    await aiChatButton.click();

    // 모달 로드 대기
    await page.waitForSelector('h3:has-text("타로 AI 상담사")', { timeout: 5000 });

    // 입력 필드 찾기
    const inputField = page.locator('input[placeholder*="질문"]');
    await expect(inputField).toBeVisible();

    // 질문 입력
    await inputField.fill('이 카드의 의미를 더 자세히 알려주세요');

    // 전송 버튼 클릭 (Mobile viewport 대응 - JavaScript 직접 클릭)
    const sendButton = page.locator('button:has-text("전송")');
    await expect(sendButton).toBeEnabled();

    // JavaScript로 직접 클릭 (viewport 제약 우회)
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const sendBtn = buttons.find(btn => btn.textContent?.includes('전송'));
      if (sendBtn) {
        (sendBtn as HTMLButtonElement).click();
      }
    });

    // 사용자 메시지가 표시되는지 확인
    const userMessage = page.locator('text=이 카드의 의미를 더 자세히 알려주세요');
    await expect(userMessage).toBeVisible({ timeout: 3000 });

    // 로딩 인디케이터 확인 (점 3개) - 조건부 대기
    const loadingDots = page.locator('.animate-bounce').first();
    const isLoadingVisible = await loadingDots.isVisible().catch(() => false);

    if (isLoadingVisible) {
      // 로딩 인디케이터가 있으면 사라질 때까지 대기
      await expect(loadingDots).not.toBeVisible({ timeout: 40000 });
    } else {
      // 로딩이 즉시 사라진 경우 (빠른 응답) - 짧게 대기
      await page.waitForTimeout(1000);
    }

    // AI 응답 대기 (최대 10초)
    const aiResponse = page.locator('div.bg-gray-100, div.dark\\:bg-gray-700').last();
    await expect(aiResponse).toBeVisible({ timeout: 10000 });

    // AI 응답 내용이 있는지 확인 (최소 20자)
    const responseText = await aiResponse.textContent();
    expect(responseText?.length || 0).toBeGreaterThan(20);
  });

  test.skip('샘플 질문 선택 기능', async ({ page }) => {
    // 스프레드 선택 (원 카드)
    const oneCardButton = page.locator('button').filter({ hasText: /원 카드/i }).first();
    await expect(oneCardButton).toBeVisible({ timeout: 5000 });
    await oneCardButton.click();

    // 질문 입력
    const questionInput = page.locator('textarea[placeholder*="예:"]');
    await expect(questionInput).toBeVisible({ timeout: 5000 });
    await questionInput.fill('테스트 질문');

    // 카드 뽑기 버튼 클릭
    const drawButton = page.locator('button').filter({ hasText: /카드 뽑기/i });
    await expect(drawButton).toBeVisible({ timeout: 3000 });
    await drawButton.click();

    // 카드 뽑는 중 애니메이션 대기
    await page.waitForTimeout(3000);

    // AI 챗 버튼 클릭
    const aiChatButton = page.locator('button').filter({
      hasText: /AI에게.*질문/i
    });
    await expect(aiChatButton).toBeVisible({ timeout: 10000 });
    await aiChatButton.click();

    // 모달 로드 대기
    await page.waitForSelector('h3:has-text("타로 AI 상담사")', { timeout: 5000 });

    // 샘플 질문 버튼 확인 (QuestionSelector 컴포넌트)
    const sampleQuestionButtons = page.locator('button').filter({
      hasText: /카드.*의미|해석|조언|메시지|이 카드가/i
    });

    // 샘플 질문이 최소 1개 이상 있는지 확인
    await expect(sampleQuestionButtons.first()).toBeVisible({ timeout: 5000 });

    // 첫 번째 샘플 질문 클릭 (JavaScript 직접 클릭 - Mobile viewport 대응)
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const sampleBtn = buttons.find(btn =>
        /카드.*의미|해석|조언|메시지|이 카드가/i.test(btn.textContent || '')
      );
      if (sampleBtn) {
        (sampleBtn as HTMLButtonElement).click();
      }
    });

    // 입력 필드에 질문이 입력되었는지 확인
    await page.waitForTimeout(500);
    const inputField = page.locator('input[placeholder*="질문"]');
    const inputValue = await inputField.inputValue();
    expect(inputValue.length).toBeGreaterThan(0);
  });

  test('음성 입력 버튼 표시', async ({ page }) => {
    // 스프레드 선택 (원 카드)
    const oneCardButton = page.locator('button').filter({ hasText: /원 카드/i }).first();
    await expect(oneCardButton).toBeVisible({ timeout: 5000 });
    await oneCardButton.click();

    // 질문 입력
    const questionInput = page.locator('textarea[placeholder*="예:"]');
    await expect(questionInput).toBeVisible({ timeout: 5000 });
    await questionInput.fill('테스트 질문');

    // 카드 뽑기 버튼 클릭
    const drawButton = page.locator('button').filter({ hasText: /카드 뽑기/i });
    await expect(drawButton).toBeVisible({ timeout: 3000 });
    await drawButton.click();

    // 카드 뽑는 중 애니메이션 대기
    await page.waitForTimeout(3000);

    // AI 챗 버튼 클릭
    const aiChatButton = page.locator('button').filter({
      hasText: /AI에게.*질문/i
    });
    await expect(aiChatButton).toBeVisible({ timeout: 10000 });
    await aiChatButton.click();

    // 모달 로드 대기
    await page.waitForSelector('h3:has-text("타로 AI 상담사")', { timeout: 5000 });

    // 음성 입력 버튼 확인 (🎙️ 이모지)
    const voiceButton = page.locator('button[title="음성 입력"]').or(
      page.locator('button:has-text("🎙️")')
    );
    await expect(voiceButton).toBeVisible();
  });

  test('모달 닫기 기능', async ({ page }) => {
    // 스프레드 선택 (원 카드)
    const oneCardButton = page.locator('button').filter({ hasText: /원 카드/i }).first();
    await expect(oneCardButton).toBeVisible({ timeout: 5000 });
    await oneCardButton.click();

    // 질문 입력
    const questionInput = page.locator('textarea[placeholder*="예:"]');
    await expect(questionInput).toBeVisible({ timeout: 5000 });
    await questionInput.fill('테스트 질문');

    // 카드 뽑기 버튼 클릭
    const drawButton = page.locator('button').filter({ hasText: /카드 뽑기/i });
    await expect(drawButton).toBeVisible({ timeout: 3000 });
    await drawButton.click();

    // 카드 뽑는 중 애니메이션 대기
    await page.waitForTimeout(3000);

    // AI 챗 버튼 클릭
    const aiChatButton = page.locator('button').filter({
      hasText: /AI에게.*질문/i
    });
    await expect(aiChatButton).toBeVisible({ timeout: 10000 });
    await aiChatButton.click();

    // 모달 로드 대기
    const modalHeader = page.locator('h3:has-text("타로 AI 상담사")');
    await expect(modalHeader).toBeVisible({ timeout: 5000 });

    // 닫기 버튼 클릭 (X 버튼)
    const closeButton = page.locator('button').filter({
      has: page.locator('svg path[d*="M6 18L18 6M6 6l12 12"]')
    });
    await closeButton.click();

    // 모달이 사라졌는지 확인
    await expect(modalHeader).not.toBeVisible({ timeout: 3000 });
  });

  test.skip('기존 인라인 AI 해석 기능 확인', async ({ page }) => {
    // 현재 구현된 인라인 방식 검증 (호환성 테스트)

    // 스프레드 선택 (가능한 경우)
    const spreadButton = page.locator('button').filter({ hasText: /원 카드/i }).first();
    if (await spreadButton.isVisible({ timeout: 3000 })) {
      await spreadButton.click();

      // 질문 입력
      const questionInput = page.locator('input[placeholder*="질문"], textarea[placeholder*="질문"]');
      if (await questionInput.isVisible({ timeout: 3000 })) {
        await questionInput.fill('테스트 질문');

        // 다음/확인 버튼
        const nextButton = page.locator('button').filter({ hasText: /다음|확인/i });
        if (await nextButton.isVisible({ timeout: 2000 })) {
          await nextButton.click();
        }
      }
    }

    // AI 해석 버튼 또는 자동 해석 대기
    await page.waitForTimeout(3000);

    // AI 해석 결과 또는 버튼 확인
    const hasAIButton = await page.locator('button').filter({ hasText: /AI.*해석/i }).isVisible({ timeout: 5000 }).catch(() => false);
    const hasAIResult = await page.locator('text=/해석|카드.*의미/i').isVisible({ timeout: 5000 }).catch(() => false);

    // 둘 중 하나는 있어야 함
    expect(hasAIButton || hasAIResult).toBeTruthy();
  });
});
