import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 테스트 설정
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',

  // 테스트 파일 패턴
  testMatch: '**/*.spec.ts',

  // 최대 실행 시간
  timeout: 30000,

  // 테스트 실패 시 재시도
  retries: process.env.CI ? 2 : 0,

  // 병렬 실행
  workers: process.env.CI ? 1 : undefined,

  // 리포터
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results.json' }]
  ],

  // 전역 설정
  use: {
    // 기본 URL
    baseURL: 'http://localhost:4000',

    // 스크린샷 (실패 시)
    screenshot: 'only-on-failure',

    // 비디오 (실패 시)
    video: 'retain-on-failure',

    // 추적 (실패 시)
    trace: 'on-first-retry',

    // 뷰포트
    viewport: { width: 1280, height: 720 },
  },

  // 프로젝트 설정 (브라우저별)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Firefox와 WebKit는 CI에서만 실행
    ...(process.env.CI ? [
      {
        name: 'firefox',
        use: { ...devices['Desktop Firefox'] },
      },
      {
        name: 'webkit',
        use: { ...devices['Desktop Safari'] },
      },
    ] : []),

    // 모바일 테스트
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // 개발 서버 설정
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
