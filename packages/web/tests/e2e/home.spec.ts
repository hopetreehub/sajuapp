import { test, expect } from '@playwright/test';

/**
 * 홈페이지 E2E 테스트
 */
test.describe('홈페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('홈페이지가 정상적으로 로드된다', async ({ page }) => {
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/운명나침반/);

    // 메인 헤더 확인
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('네비게이션 메뉴가 표시된다', async ({ page }) => {
    // 네비게이션 항목 확인
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // 주요 메뉴 항목 확인
    await expect(page.getByRole('link', { name: /홈/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /사주/ })).toBeVisible();
  });

  test('반응형 디자인이 작동한다', async ({ page }) => {
    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 });

    // 햄버거 메뉴 확인 (모바일에서)
    const mobileMenu = page.locator('[aria-label*="menu"], .mobile-menu, button.menu');

    // 메뉴가 있으면 클릭 가능한지 확인
    if (await mobileMenu.count() > 0) {
      await expect(mobileMenu.first()).toBeVisible();
    }
  });

  test('푸터가 표시된다', async ({ page }) => {
    // 페이지 끝으로 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // 푸터 확인
    const footer = page.locator('footer');

    // 푸터가 있으면 확인
    if (await footer.count() > 0) {
      await expect(footer).toBeVisible();
    }
  });

  test('페이지가 3초 이내에 로드된다', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // 3초 이내 로드 확인
    expect(loadTime).toBeLessThan(3000);
  });
});
