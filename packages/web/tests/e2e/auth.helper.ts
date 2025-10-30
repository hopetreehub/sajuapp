/**
 * E2E 테스트용 인증 헬퍼
 *
 * TDD 원칙: 모든 E2E 테스트에서 인증이 필요한 경우 이 헬퍼를 사용
 * @author Claude Code
 * @version 1.0.0
 */

import { Page, expect } from '@playwright/test';

/**
 * 테스트 사용자 계정 정보
 */
export const TEST_USERS = {
  /** 일반 사용자 계정 */
  user: {
    email: 'test@example.com',
    password: 'test1234',
    role: 'user',
  },
  /** 관리자 계정 */
  admin: {
    email: 'admin@sajuapp.com',
    password: 'admin1234!',
    role: 'admin',
  },
} as const;

/**
 * 로그인 옵션
 */
export interface LoginOptions {
  /** 사용자 유형 (기본값: 'user') */
  userType?: 'user' | 'admin';
  /** 로그인 성공 후 이동할 페이지 (기본값: 자동 리다이렉트) */
  redirectTo?: string;
  /** 로그인 대기 시간 (ms) (기본값: 3000) */
  waitTime?: number;
}

/**
 * 로그인 플로우 실행
 *
 * @param page - Playwright Page 객체
 * @param options - 로그인 옵션
 *
 * @example
 * ```typescript
 * test.beforeEach(async ({ page }) => {
 *   await login(page); // 일반 사용자로 로그인
 * });
 * ```
 *
 * @example
 * ```typescript
 * test.beforeEach(async ({ page }) => {
 *   await login(page, { userType: 'admin' }); // 관리자로 로그인
 * });
 * ```
 */
export async function login(page: Page, options: LoginOptions = {}): Promise<void> {
  const {
    userType = 'user',
    redirectTo,
    waitTime = 3000,
  } = options;

  const user = TEST_USERS[userType];

  console.log(`🔐 [인증 헬퍼] ${user.email}로 Mock 인증 시작...`);

  try {
    // Mock 인증: localStorage에 직접 인증 정보 주입
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // localStorage에 인증 상태 설정
    await page.evaluate((userInfo) => {
      const authState = {
        state: {
          token: `mock-token-${Date.now()}`,
          user: {
            id: userInfo.role === 'admin' ? 1 : 100,
            email: userInfo.email,
            username: userInfo.role === 'admin' ? '관리자' : '테스트 사용자',
            role: userInfo.role,
            approval_status: 'approved',
            created_at: new Date().toISOString(),
          },
          isAuthenticated: true,
        },
        version: 0,
      };

      localStorage.setItem('auth-storage', JSON.stringify(authState));
    }, user);

    console.log(`✅ [인증 헬퍼] Mock 인증 완료: ${user.email}`);

    // 페이지 새로고침하여 localStorage 인증 정보 적용
    await page.reload();
    await page.waitForLoadState('networkidle');

    console.log(`🔄 [인증 헬퍼] 페이지 새로고침 완료 - 인증 정보 적용됨`);

    // 로그인 모달이 사라질 때까지 대기 (최대 10초)
    const loginModal = page.locator('h2:has-text("운명나침반 로그인")').or(
      page.locator('text=운명나침반 로그인')
    );

    const isLoginModalVisible = await loginModal.isVisible().catch(() => false);

    if (isLoginModalVisible) {
      console.log(`⏳ [인증 헬퍼] 로그인 모달 감지 - 사라질 때까지 대기 중...`);
      try {
        await loginModal.waitFor({ state: 'hidden', timeout: 10000 });
        console.log(`✅ [인증 헬퍼] 로그인 모달 사라짐`);
      } catch (error) {
        console.warn(`⚠️ [인증 헬퍼] 로그인 모달이 10초 내에 사라지지 않음`);
        // 모달이 사라지지 않으면 추가 대기
        await page.waitForTimeout(2000);
      }
    }

    // 추가 대기 시간
    await page.waitForTimeout(waitTime);
  } catch (error) {
    console.error(`❌ [인증 헬퍼] Mock 인증 실패:`, error);
    throw error;
  }
}

/**
 * 로그아웃 플로우 실행
 *
 * @param page - Playwright Page 객체
 *
 * @example
 * ```typescript
 * test('로그아웃 후 접근 불가', async ({ page }) => {
 *   await login(page);
 *   await logout(page);
 *   await page.goto('/saju');
 *   await expect(page).toHaveURL(/\/auth/);
 * });
 * ```
 */
export async function logout(page: Page): Promise<void> {
  console.log(`🚪 [인증 헬퍼] 로그아웃 시작...`);

  try {
    // 1. 프로필 메뉴 또는 로그아웃 버튼 찾기
    const logoutButton = page.locator('button').filter({ hasText: /로그아웃|Logout/i });

    if (await logoutButton.isVisible({ timeout: 3000 })) {
      await logoutButton.click();
    } else {
      // 프로필 아이콘 클릭 후 로그아웃 버튼 찾기
      const profileButton = page.locator('button[aria-label*="프로필"], button[aria-label*="Profile"]');
      if (await profileButton.isVisible({ timeout: 3000 })) {
        await profileButton.click();
        await page.waitForTimeout(500);

        const logoutMenuItem = page.locator('button, a').filter({ hasText: /로그아웃|Logout/i });
        await logoutMenuItem.click();
      } else {
        console.warn('⚠️ [인증 헬퍼] 로그아웃 버튼을 찾을 수 없습니다.');
        return;
      }
    }

    // 2. 로그아웃 성공 확인 (로그인 페이지로 리다이렉트)
    await page.waitForURL(/\/auth/, { timeout: 10000 });

    console.log(`✅ [인증 헬퍼] 로그아웃 성공`);
  } catch (error) {
    console.error(`❌ [인증 헬퍼] 로그아웃 실패:`, error);
    throw error;
  }
}

/**
 * 인증 상태 확인
 *
 * @param page - Playwright Page 객체
 * @returns 인증 여부
 *
 * @example
 * ```typescript
 * test('인증 확인', async ({ page }) => {
 *   await login(page);
 *   const isAuth = await isAuthenticated(page);
 *   expect(isAuth).toBe(true);
 * });
 * ```
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    // localStorage에서 인증 토큰 확인
    const authData = await page.evaluate(() => {
      const authStore = localStorage.getItem('auth-storage');
      if (!authStore) return null;

      const parsed = JSON.parse(authStore);
      return parsed.state;
    });

    if (!authData) return false;

    // 토큰과 사용자 정보 확인
    const hasToken = !!authData.token;
    const hasUser = !!authData.user;

    console.log(`🔍 [인증 헬퍼] 인증 상태: ${hasToken && hasUser ? '로그인됨' : '로그인 안됨'}`);

    return hasToken && hasUser;
  } catch (error) {
    console.error(`❌ [인증 헬퍼] 인증 상태 확인 실패:`, error);
    return false;
  }
}

/**
 * 인증 상태 초기화 (localStorage 클리어)
 *
 * @param page - Playwright Page 객체
 *
 * @example
 * ```typescript
 * test.beforeEach(async ({ page }) => {
 *   await clearAuth(page); // 테스트 전 인증 상태 초기화
 * });
 * ```
 */
export async function clearAuth(page: Page): Promise<void> {
  console.log(`🧹 [인증 헬퍼] 인증 상태 초기화...`);

  try {
    await page.evaluate(() => {
      localStorage.removeItem('auth-storage');
      sessionStorage.clear();
    });

    console.log(`✅ [인증 헬퍼] 인증 상태 초기화 완료`);
  } catch (error) {
    console.error(`❌ [인증 헬퍼] 인증 상태 초기화 실패:`, error);
  }
}

/**
 * 보호된 페이지 접근 테스트 (인증 없이 접근 시 리다이렉트 확인)
 *
 * @param page - Playwright Page 객체
 * @param protectedPath - 보호된 페이지 경로
 *
 * @example
 * ```typescript
 * test('인증 없이 접근 불가', async ({ page }) => {
 *   await testProtectedRoute(page, '/saju');
 * });
 * ```
 */
export async function testProtectedRoute(page: Page, protectedPath: string): Promise<void> {
  console.log(`🔒 [인증 헬퍼] 보호된 라우트 테스트: ${protectedPath}`);

  try {
    // 1. 인증 상태 초기화
    await clearAuth(page);

    // 2. 보호된 페이지 접근 시도
    await page.goto(protectedPath);

    // 3. 로그인 페이지로 리다이렉트 확인
    await page.waitForURL(/\/auth/, { timeout: 10000 });

    console.log(`✅ [인증 헬퍼] 보호된 라우트 정상 작동: 로그인 페이지로 리다이렉트됨`);
  } catch (error) {
    console.error(`❌ [인증 헬퍼] 보호된 라우트 테스트 실패:`, error);
    throw error;
  }
}
