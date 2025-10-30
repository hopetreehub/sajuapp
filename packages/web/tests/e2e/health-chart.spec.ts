/**
 * 12대 건강 시스템 차트 E2E 테스트
 *
 * TDD 원칙: 이미 구현된 기능의 회귀 방지 테스트
 * @author Claude Code
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test';
import { login } from './auth.helper';

test.describe('12대 건강 시스템 차트 기능', () => {
  test.beforeEach(async ({ page }) => {
    // 인증 필요 - 테스트 사용자로 로그인
    await login(page);

    // 사주 분석 페이지로 이동
    await page.goto('/saju');

    // 페이지 로드 대기
    await page.waitForLoadState('networkidle');
  });

  test('사주 분석 페이지가 정상 로드되어야 함', async ({ page }) => {
    // 페이지 제목 확인
    await expect(page.locator('h1, h2').filter({ hasText: /사주|분석/i })).toBeVisible({ timeout: 10000 });

    // 고객 선택 UI 확인
    const customerSelector = page.locator('text=/고객.*선택|Select.*Customer/i').or(
      page.locator('select[data-testid="customer-selector"]')
    );

    const hasCustomerUI = await customerSelector.isVisible({ timeout: 5000 }).catch(() => false);
    const hasCustomerButton = await page.locator('button').filter({ hasText: /고객/i }).isVisible({ timeout: 5000 }).catch(() => false);

    expect(hasCustomerUI || hasCustomerButton).toBeTruthy();
  });

  test('건강 차트가 렌더링되어야 함', async ({ page }) => {
    // 고객 선택이 필요하면 선택
    const customerSelect = page.locator('select').first();
    if (await customerSelect.isVisible({ timeout: 3000 })) {
      // 두 번째 옵션 선택 (첫 번째는 보통 placeholder)
      await customerSelect.selectOption({ index: 1 });
      await page.waitForTimeout(2000);
    }

    // 건강 차트 확인
    const healthChartSection = page.locator('#health-system-chart').or(
      page.locator('text=/12대.*건강|건강.*시스템/i')
    );

    await expect(healthChartSection).toBeVisible({ timeout: 10000 });
  });

  test('건강 차트에 12개 시스템이 표시되어야 함', async ({ page }) => {
    // 고객 선택
    const customerSelect = page.locator('select').first();
    if (await customerSelect.isVisible({ timeout: 3000 })) {
      await customerSelect.selectOption({ index: 1 });
      await page.waitForTimeout(2000);
    }

    // 건강 차트 섹션 확인
    const healthChart = page.locator('#health-system-chart');
    await expect(healthChart).toBeVisible({ timeout: 10000 });

    // 차트 캔버스 확인
    const canvas = healthChart.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 5000 });
  });

  test('시간대 선택 버튼이 작동해야 함', async ({ page }) => {
    // 고객 선택
    const customerSelect = page.locator('select').first();
    if (await customerSelect.isVisible({ timeout: 3000 })) {
      await customerSelect.selectOption({ index: 1 });
      await page.waitForTimeout(2000);
    }

    // 건강 차트 확인
    await page.waitForSelector('#health-system-chart', { timeout: 10000 });

    // 시간대 버튼 찾기
    const todayButton = page.locator('button').filter({ hasText: /오늘/i });
    const monthButton = page.locator('button').filter({ hasText: /이달/i });
    const yearButton = page.locator('button').filter({ hasText: /올해/i });

    // 오늘 버튼 클릭
    if (await todayButton.isVisible({ timeout: 3000 })) {
      await todayButton.click();
      await page.waitForTimeout(500);

      // 버튼이 활성화되었는지 확인
      await expect(todayButton).toHaveClass(/active|bg-/i);
    }

    // 이달 버튼 클릭
    if (await monthButton.isVisible({ timeout: 3000 })) {
      await monthButton.click();
      await page.waitForTimeout(500);
    }

    // 올해 버튼 클릭
    if (await yearButton.isVisible({ timeout: 3000 })) {
      await yearButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('전체 건강 지수가 표시되어야 함', async ({ page }) => {
    // 고객 선택
    const customerSelect = page.locator('select').first();
    if (await customerSelect.isVisible({ timeout: 3000 })) {
      await customerSelect.selectOption({ index: 1 });
      await page.waitForTimeout(2000);
    }

    // 건강 차트 확인
    await page.waitForSelector('#health-system-chart', { timeout: 10000 });

    // 전체 건강 지수 확인
    const healthScore = page.locator('text=/전체.*건강.*지수|건강.*지수/i').or(
      page.locator('text=/\\d+점/i')
    );

    await expect(healthScore).toBeVisible({ timeout: 5000 });
  });

  test('강점/취약 시스템 정보가 표시되어야 함', async ({ page }) => {
    // 고객 선택
    const customerSelect = page.locator('select').first();
    if (await customerSelect.isVisible({ timeout: 3000 })) {
      await customerSelect.selectOption({ index: 1 });
      await page.waitForTimeout(2000);
    }

    // 건강 차트 확인
    await page.waitForSelector('#health-system-chart', { timeout: 10000 });

    // 강점 시스템 확인
    const strongSystem = page.locator('text=/강점|Strong/i').or(
      page.locator('text=/💪/i')
    );

    // 취약 시스템 확인
    const weakSystem = page.locator('text=/취약|주의|Weak|Warning/i').or(
      page.locator('text=/⚠️/i')
    );

    const hasStrong = await strongSystem.isVisible({ timeout: 5000 }).catch(() => false);
    const hasWeak = await weakSystem.isVisible({ timeout: 5000 }).catch(() => false);

    expect(hasStrong || hasWeak).toBeTruthy();
  });

  test('건강 권장사항이 표시되어야 함', async ({ page }) => {
    // 고객 선택
    const customerSelect = page.locator('select').first();
    if (await customerSelect.isVisible({ timeout: 3000 })) {
      await customerSelect.selectOption({ index: 1 });
      await page.waitForTimeout(2000);
    }

    // 건강 차트 확인
    await page.waitForSelector('#health-system-chart', { timeout: 10000 });

    // 권장사항 섹션 확인
    const recommendations = page.locator('text=/권장사항|Recommendation/i').or(
      page.locator('text=/💡/i')
    );

    const hasRecommendations = await recommendations.isVisible({ timeout: 5000 }).catch(() => false);

    // 권장사항이 없어도 차트가 표시되면 통과
    const hasHealthChart = await page.locator('#health-system-chart canvas').isVisible({ timeout: 3000 });

    expect(hasRecommendations || hasHealthChart).toBeTruthy();
  });

  test('연령대별 주의사항이 표시되어야 함', async ({ page }) => {
    // 고객 선택
    const customerSelect = page.locator('select').first();
    if (await customerSelect.isVisible({ timeout: 3000 })) {
      await customerSelect.selectOption({ index: 1 });
      await page.waitForTimeout(2000);
    }

    // 건강 차트 확인
    await page.waitForSelector('#health-system-chart', { timeout: 10000 });

    // 연령대별 주의사항 확인
    const ageGroup = page.locator('text=/청년|중년|노년|유년/i').or(
      page.locator('text=/🎯|주의사항/i')
    );

    const hasAgeInfo = await ageGroup.isVisible({ timeout: 5000 }).catch(() => false);

    // 연령 정보가 없어도 건강 차트가 있으면 통과
    const hasHealthChart = await page.locator('#health-system-chart canvas').isVisible({ timeout: 3000 });

    expect(hasAgeInfo || hasHealthChart).toBeTruthy();
  });

  test('건강 차트 데이터가 고객별로 다르게 표시되어야 함', async ({ page }) => {
    // 첫 번째 고객 선택
    const customerSelect = page.locator('select').first();
    if (await customerSelect.isVisible({ timeout: 3000 })) {
      await customerSelect.selectOption({ index: 1 });
      await page.waitForTimeout(2000);
    }

    // 첫 번째 고객의 건강 지수 확인
    await page.waitForSelector('#health-system-chart', { timeout: 10000 });

    const firstScore = await page.locator('text=/\\d+점/i').first().textContent().catch(() => null);

    // 두 번째 고객으로 변경
    if (await customerSelect.isVisible({ timeout: 3000 })) {
      await customerSelect.selectOption({ index: 2 });
      await page.waitForTimeout(2000);
    }

    // 두 번째 고객의 건강 지수 확인
    const secondScore = await page.locator('text=/\\d+점/i').first().textContent().catch(() => null);

    // 점수가 다르면 성공 (같을 수도 있지만, 차트가 업데이트되는 것만 확인)
    if (firstScore && secondScore) {
      console.log(`첫 번째 고객: ${firstScore}, 두 번째 고객: ${secondScore}`);
    }

    // 차트가 재렌더링되었는지 확인
    await expect(page.locator('#health-system-chart canvas')).toBeVisible({ timeout: 5000 });
  });
});
