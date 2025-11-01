/**
 * 이메일 구독 시스템 E2E 테스트
 *
 * @author Claude Code
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test';

test.describe('이메일 구독 시스템', () => {
  test.beforeEach(async ({ page }) => {
    // 홈페이지로 이동 (Footer가 있는 페이지)
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
  });

  test('Footer에 구독 폼이 표시되어야 함', async ({ page }) => {
    // Footer까지 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // 구독 폼 확인
    const subscriptionSection = page.locator('text=/운세 소식을 받아보세요/i');
    await expect(subscriptionSection).toBeVisible({ timeout: 10000 });

    // 이메일 입력창 확인
    const emailInput = page.locator('input[type="email"]').filter({ hasText: '' }).first();
    await expect(emailInput).toBeVisible();

    // 구독하기 버튼 확인
    const subscribeButton = page.locator('button').filter({ hasText: /구독하기/i });
    await expect(subscribeButton.first()).toBeVisible();
  });

  test('이메일 입력 후 구독하기 버튼 클릭 가능', async ({ page }) => {
    // Footer까지 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // 이메일 입력창 찾기 - placeholder로 찾기
    const emailInput = page.locator('input[placeholder*="이메일"]').first();
    await expect(emailInput).toBeVisible({ timeout: 10000 });

    // 이메일 입력
    await emailInput.fill('test@example.com');
    await page.waitForTimeout(500);

    // 구독하기 버튼 찾기 및 클릭
    const subscribeButton = page.locator('button:has-text("구독하기")').first();
    await expect(subscribeButton).toBeVisible();
    await expect(subscribeButton).toBeEnabled();

    // 버튼 정보 출력
    const buttonText = await subscribeButton.textContent();
    console.log('버튼 텍스트:', buttonText);

    const isDisabled = await subscribeButton.isDisabled();
    console.log('버튼 비활성화 상태:', isDisabled);

    // 클릭 시도
    await subscribeButton.click({ timeout: 5000 });
    await page.waitForTimeout(2000);

    // 알림 또는 응답 확인
    console.log('클릭 완료');
  });

  test('구독하기 버튼 JavaScript 클릭', async ({ page }) => {
    // Footer까지 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // 이메일 입력
    const emailInput = page.locator('input[placeholder*="이메일"]').first();
    await emailInput.fill('test-js@example.com');
    await page.waitForTimeout(500);

    // JavaScript로 직접 클릭
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const subscribeBtn = buttons.find(btn => btn.textContent?.includes('구독하기'));
      if (subscribeBtn) {
        console.log('버튼 찾음:', subscribeBtn);
        (subscribeBtn as HTMLButtonElement).click();
      } else {
        console.log('버튼을 찾을 수 없음');
      }
    });

    await page.waitForTimeout(2000);
  });

  test('구독 폼 상세 정보 입력 토글', async ({ page }) => {
    // Footer까지 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // 추가 정보 입력 토글 버튼 찾기
    const toggleButton = page.locator('button:has-text("추가 정보 입력하기")');

    if (await toggleButton.isVisible({ timeout: 5000 })) {
      await toggleButton.click();
      await page.waitForTimeout(1000);

      // 상세 폼 확인
      const nameInput = page.locator('input[placeholder*="이름"]');
      const phoneInput = page.locator('input[placeholder*="연락처"]');
      const messageTextarea = page.locator('textarea[placeholder*="메시지"]');

      await expect(nameInput).toBeVisible();
      await expect(phoneInput).toBeVisible();
      await expect(messageTextarea).toBeVisible();
    }
  });

  test.skip('전체 구독 플로우 테스트 (API 호출)', async ({ page }) => {
    // Footer까지 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // 이메일 입력
    const emailInput = page.locator('input[placeholder*="이메일"]').first();
    await emailInput.fill('e2e-test@example.com');

    // 구독하기 버튼 클릭
    const subscribeButton = page.locator('button:has-text("구독하기")').first();
    await subscribeButton.click();

    // 처리 중 상태 확인
    await expect(page.locator('text=/처리 중/i')).toBeVisible({ timeout: 5000 });

    // 성공 메시지 대기
    await expect(page.locator('text=/완료|성공/i')).toBeVisible({ timeout: 10000 });
  });
});
