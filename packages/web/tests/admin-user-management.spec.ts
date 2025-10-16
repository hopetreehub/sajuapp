import { test, expect } from '@playwright/test';

test.describe('관리자 사용자 관리 E2E 테스트', () => {
  const ADMIN_EMAIL = 'admin@sajuapp.com';
  const ADMIN_PASSWORD = 'Admin123!ChangeMeNow';
  const BASE_URL = 'http://localhost:4001';

  test.beforeEach(async ({ page }) => {
    // 1. 로그인 페이지로 이동
    await page.goto(`${BASE_URL}/auth`);
    await page.waitForLoadState('networkidle');
  });

  test('관리자 로그인 및 사용자 관리 페이지 접근', async ({ page }) => {
    // 2. 관리자 계정으로 로그인
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // 3. 로그인 성공 후 대시보드로 이동 대기
    await page.waitForURL(/\/(dashboard|admin|calendar)/, { timeout: 10000 });

    // 4. 관리자 페이지로 이동
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForLoadState('networkidle');

    // 5. "사용자 관리" 버튼 확인 및 클릭
    const userManagementButton = page.locator('button:has-text("사용자 관리")');
    await expect(userManagementButton).toBeVisible({ timeout: 5000 });
    await userManagementButton.click();

    // 6. 사용자 관리 페이지로 이동 확인
    await page.waitForURL(`${BASE_URL}/admin/users`, { timeout: 5000 });

    // 7. 페이지 제목 확인
    await expect(page.locator('h1:has-text("사용자 관리")')).toBeVisible();
  });

  test('사용자 목록 조회 및 필터링', async ({ page }) => {
    // 로그인
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|admin|calendar)/, { timeout: 10000 });

    // 사용자 관리 페이지로 이동
    await page.goto(`${BASE_URL}/admin/users`);
    await page.waitForLoadState('networkidle');

    // 상태 필터 확인
    const statusFilter = page.locator('select').first();
    await expect(statusFilter).toBeVisible();

    // "승인 대기" 필터 선택
    await statusFilter.selectOption('pending');
    await page.waitForTimeout(1000); // API 응답 대기

    // 검색 기능 테스트
    const searchInput = page.locator('input[placeholder*="검색"]');
    await expect(searchInput).toBeVisible();
  });

  test('사용자 승인 워크플로우', async ({ page }) => {
    // 로그인
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|admin|calendar)/, { timeout: 10000 });

    // 사용자 관리 페이지로 이동
    await page.goto(`${BASE_URL}/admin/users`);
    await page.waitForLoadState('networkidle');

    // 승인 대기 필터 선택
    const statusFilter = page.locator('select').first();
    await statusFilter.selectOption('pending');
    await page.waitForTimeout(1000);

    // 승인 버튼 찾기 (있는 경우)
    const approveButtons = page.locator('button:has-text("승인")');
    const buttonCount = await approveButtons.count();

    if (buttonCount > 0) {
      // 확인 다이얼로그 핸들러 설정
      page.on('dialog', dialog => dialog.accept());

      // 첫 번째 승인 버튼 클릭
      await approveButtons.first().click();
      await page.waitForTimeout(1000);

      // 성공 알림 확인
      await expect(page.locator('text=/승인되었습니다|승인 완료/')).toBeVisible({ timeout: 3000 });
    } else {
      console.log('승인 대기 중인 사용자가 없습니다.');
    }
  });

  test('사용자 거부 워크플로우', async ({ page }) => {
    // 로그인
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|admin|calendar)/, { timeout: 10000 });

    // 사용자 관리 페이지로 이동
    await page.goto(`${BASE_URL}/admin/users`);
    await page.waitForLoadState('networkidle');

    // 승인 대기 필터 선택
    const statusFilter = page.locator('select').first();
    await statusFilter.selectOption('pending');
    await page.waitForTimeout(1000);

    // 거부 버튼 찾기
    const rejectButtons = page.locator('button:has-text("거부")');
    const buttonCount = await rejectButtons.count();

    if (buttonCount > 0) {
      // 첫 번째 거부 버튼 클릭
      await rejectButtons.first().click();
      await page.waitForTimeout(500);

      // 거부 모달 확인
      await expect(page.locator('h3:has-text("사용자 거부")')).toBeVisible({ timeout: 3000 });

      // 거부 사유 입력
      const reasonTextarea = page.locator('textarea');
      await reasonTextarea.fill('E2E 테스트용 거부');

      // 거부하기 버튼 클릭
      await page.locator('button:has-text("거부하기")').click();
      await page.waitForTimeout(1000);

      // 성공 알림 확인
      await expect(page.locator('text=/거부되었습니다|거부 완료/')).toBeVisible({ timeout: 3000 });
    } else {
      console.log('거부할 수 있는 사용자가 없습니다.');
    }
  });

  test('사용자 역할 변경', async ({ page }) => {
    // 로그인
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|admin|calendar)/, { timeout: 10000 });

    // 사용자 관리 페이지로 이동
    await page.goto(`${BASE_URL}/admin/users`);
    await page.waitForLoadState('networkidle');

    // 승인된 사용자 필터
    const statusFilter = page.locator('select').first();
    await statusFilter.selectOption('approved');
    await page.waitForTimeout(1000);

    // 테이블의 역할 드롭다운 찾기
    const roleSelects = page.locator('table select');
    const roleCount = await roleSelects.count();

    if (roleCount > 0) {
      // 현재 역할 확인
      const currentRole = await roleSelects.first().inputValue();
      console.log('현재 역할:', currentRole);

      // 역할 옵션이 있는지 확인
      const options = await roleSelects.first().locator('option').count();
      expect(options).toBeGreaterThan(0);
    } else {
      console.log('승인된 사용자가 없습니다.');
    }
  });

  test('페이지 UI 요소 확인', async ({ page }) => {
    // 로그인
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|admin|calendar)/, { timeout: 10000 });

    // 사용자 관리 페이지로 이동
    await page.goto(`${BASE_URL}/admin/users`);
    await page.waitForLoadState('networkidle');

    // 필수 UI 요소 확인
    await expect(page.locator('h1:has-text("사용자 관리")')).toBeVisible();
    await expect(page.locator('label:has-text("상태 필터")')).toBeVisible();
    await expect(page.locator('label:has-text("검색")')).toBeVisible();

    // 테이블 헤더 확인
    await expect(page.locator('th:has-text("사용자")')).toBeVisible();
    await expect(page.locator('th:has-text("역할")')).toBeVisible();
    await expect(page.locator('th:has-text("상태")')).toBeVisible();
    await expect(page.locator('th:has-text("가입일")')).toBeVisible();
    await expect(page.locator('th:has-text("액션")')).toBeVisible();
  });
});
