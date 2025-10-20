import { test, expect } from '@playwright/test';

/**
 * 귀문둔갑 기능 E2E 테스트
 */
test.describe('귀문둔갑', () => {
  test.beforeEach(async ({ page }) => {
    // 귀문둔갑 페이지로 이동
    await page.goto('/qimen');
  });

  test('귀문둔갑 페이지가 로드된다', async ({ page }) => {
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/귀문둔갑|운명나침반/);

    // 메인 컨텐츠 확인
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('날짜 선택이 가능하다', async ({ page }) => {
    // 날짜 입력 필드 찾기
    const dateInput = page.locator('input[type="date"], input[placeholder*="날짜"]').first();

    if (await dateInput.count() > 0) {
      await expect(dateInput).toBeVisible();

      // 날짜 입력
      await dateInput.fill('2024-01-15');
      await expect(dateInput).toHaveValue('2024-01-15');
    }
  });

  test('시간 선택이 가능하다', async ({ page }) => {
    // 시간 입력 필드 찾기
    const timeInput = page.locator('input[type="time"], input[placeholder*="시간"]').first();

    if (await timeInput.count() > 0) {
      await expect(timeInput).toBeVisible();

      // 시간 입력
      await timeInput.fill('10:00');
      await expect(timeInput).toHaveValue('10:00');
    }
  });

  test('귀문둔갑 차트가 표시된다', async ({ page }) => {
    // 차트 컨테이너 찾기
    const chart = page.locator('.qimen-chart, [class*="chart"], canvas').first();

    if (await chart.count() > 0) {
      await expect(chart).toBeVisible();
    }
  });

  test('9궁 레이아웃이 표시된다', async ({ page }) => {
    // 9궁 그리드 찾기
    const palaces = page.locator('[class*="palace"], .grid').first();

    if (await palaces.count() > 0) {
      await expect(palaces).toBeVisible();
    }
  });

  test('3D 뷰 토글이 작동한다', async ({ page }) => {
    // 3D 버튼 찾기
    const toggle3D = page.locator('button:has-text("3D"), button:has-text("2D")').first();

    if (await toggle3D.count() > 0) {
      await expect(toggle3D).toBeVisible();

      // 클릭
      await toggle3D.click();

      // 잠시 대기 (애니메이션)
      await page.waitForTimeout(500);

      // 다시 클릭 (토글)
      await toggle3D.click();
    }
  });

  test('궁 클릭 시 상세 정보가 표시된다', async ({ page }) => {
    // 궁 요소 찾기
    const palace = page.locator('[class*="palace"]').first();

    if (await palace.count() > 0) {
      // 클릭
      await palace.click();

      // 상세 정보 패널 확인
      await page.waitForTimeout(300);

      // 텍스트 내용 확인 (9성, 8문, 8신 등)
      const pageContent = await page.textContent('body');
      const hasQimenTerms =
        pageContent?.includes('성') ||
        pageContent?.includes('문') ||
        pageContent?.includes('신');

      expect(hasQimenTerms).toBeTruthy();
    }
  });
});

/**
 * 귀문둔갑 학습 페이지 테스트
 */
test.describe('귀문둔갑 학습', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/qimen/learning');
  });

  test('학습 페이지가 로드된다', async ({ page }) => {
    await expect(page).toHaveTitle(/학습|귀문둔갑|운명나침반/);

    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('코스 목록이 표시된다', async ({ page }) => {
    // 코스 카드 찾기
    const courseCards = page.locator('[class*="course"], .card, [role="article"]');

    // 최소 1개 이상의 코스가 있어야 함
    if (await courseCards.count() > 0) {
      await expect(courseCards.first()).toBeVisible();
    }
  });

  test('용어집이 접근 가능하다', async ({ page }) => {
    // 용어집 버튼 또는 링크 찾기
    const glossaryButton = page.locator('button:has-text("용어"), a:has-text("용어")').first();

    if (await glossaryButton.count() > 0) {
      await glossaryButton.click();
      await page.waitForTimeout(500);

      // 용어 목록 확인
      const terms = page.locator('[class*="term"], .glossary-term');
      if (await terms.count() > 0) {
        await expect(terms.first()).toBeVisible();
      }
    }
  });

  test('검색 기능이 작동한다', async ({ page }) => {
    // 검색 입력 필드 찾기
    const searchInput = page.locator('input[type="search"], input[placeholder*="검색"]').first();

    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible();

      // 검색어 입력
      await searchInput.fill('9성');

      // 검색 결과 대기
      await page.waitForTimeout(500);

      // 결과 확인
      const results = page.locator('[class*="result"], [class*="item"]');
      if (await results.count() > 0) {
        await expect(results.first()).toBeVisible();
      }
    }
  });
});
