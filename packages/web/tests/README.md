# 운명나침반 E2E 테스트 가이드

## 📋 개요
Playwright를 사용한 End-to-End 테스트 스위트입니다.

---

## 🚀 빠른 시작

### 1. Playwright 브라우저 설치
```bash
cd packages/web
npx playwright install
```

### 2. 테스트 실행
```bash
# 모든 테스트 실행
npm test

# UI 모드로 실행 (시각적 디버깅)
npm run test:ui

# Headed 모드 (브라우저 보면서 실행)
npm run test:headed

# 디버그 모드
npm run test:debug

# 특정 테스트 파일만 실행
npx playwright test home.spec.ts

# 특정 브라우저만 실행
npx playwright test --project=chromium
```

### 3. 테스트 리포트 확인
```bash
npm run test:report
```

---

## 📁 테스트 구조

```
tests/e2e/
├── home.spec.ts        # 홈페이지 테스트
├── qimen.spec.ts       # 귀문둔갑 기능 테스트
├── api.spec.ts         # API 엔드포인트 테스트
└── README.md           # 이 파일
```

---

## 🧪 테스트 커버리지

### 1. 홈페이지 (home.spec.ts)
- ✅ 페이지 로딩
- ✅ 네비게이션 메뉴
- ✅ 반응형 디자인
- ✅ 푸터 표시
- ✅ 로딩 시간 (3초 이내)

### 2. 귀문둔갑 (qimen.spec.ts)
- ✅ 페이지 로딩
- ✅ 날짜/시간 선택
- ✅ 차트 표시
- ✅ 9궁 레이아웃
- ✅ 3D 뷰 토글
- ✅ 궁 클릭 및 상세 정보
- ✅ 학습 페이지
- ✅ 코스 목록
- ✅ 용어집
- ✅ 검색 기능

### 3. API (api.spec.ts)
- ✅ GET /api/customers
- ✅ POST /api/customers
- ✅ 필수 필드 검증 (400 에러)
- ✅ XSS 공격 차단
- ✅ Rate Limiting (429 에러)
- ✅ 보안 헤더
- ✅ CORS Preflight
- ✅ 404/405 에러 핸들링
- ✅ SQL Injection 차단

---

## 🎯 테스트 작성 가이드

### 기본 구조
```typescript
import { test, expect } from '@playwright/test';

test.describe('기능 그룹', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 실행
    await page.goto('/');
  });

  test('테스트 설명', async ({ page }) => {
    // 테스트 코드
    const button = page.getByRole('button', { name: '버튼' });
    await expect(button).toBeVisible();
    await button.click();
  });
});
```

### 권장 사항

#### 1. 명확한 테스트 이름
```typescript
// ❌ 나쁜 예
test('test 1', async ({ page }) => { ... });

// ✅ 좋은 예
test('사용자가 로그인 버튼을 클릭하면 로그인 페이지로 이동한다', async ({ page }) => { ... });
```

#### 2. Locator 우선순위
```typescript
// 1순위: Role-based (접근성 기반)
page.getByRole('button', { name: '제출' })

// 2순위: Label
page.getByLabel('이메일')

// 3순위: Placeholder
page.getByPlaceholder('이름을 입력하세요')

// 4순위: Text
page.getByText('환영합니다')

// 5순위: Test ID (마지막 수단)
page.getByTestId('submit-button')
```

#### 3. Wait 사용
```typescript
// ❌ 하드코딩된 대기
await page.waitForTimeout(1000);

// ✅ 조건부 대기
await page.waitForLoadState('networkidle');
await expect(element).toBeVisible();
```

#### 4. 에러 핸들링
```typescript
// 요소가 없을 수 있는 경우
const element = page.locator('.optional-element');
if (await element.count() > 0) {
  await element.click();
}
```

---

## 🔧 설정

### playwright.config.ts
```typescript
{
  testDir: './tests/e2e',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  use: {
    baseURL: 'http://localhost:4000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    { name: 'chromium' },
    { name: 'Mobile Chrome' },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4000',
    reuseExistingServer: !process.env.CI,
  },
}
```

---

## 🐛 디버깅

### 1. UI 모드 사용
```bash
npm run test:ui
```
- 시각적으로 테스트 단계 확인
- 각 단계별 DOM 스냅샷
- 실시간 locator 테스트

### 2. 디버그 모드
```bash
npm run test:debug
```
- 브라우저 Developer Tools 자동 열림
- 중단점 설정 가능
- 단계별 실행

### 3. 스크린샷 확인
```bash
# 테스트 실패 시 자동 저장
packages/web/test-results/
  └── [테스트명]/
      ├── screenshot.png
      └── video.webm
```

### 4. Trace Viewer
```bash
npx playwright show-trace test-results/[테스트명]/trace.zip
```

---

## 📊 CI/CD 통합

### GitHub Actions
`.github/workflows/test.yml`에 통합되어 있습니다:

```yaml
e2e:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npm ci
    - run: npx playwright install --with-deps chromium
    - run: npm run test
```

### 테스트 결과 아티팩트
- 테스트 리포트: `playwright-report/`
- 스크린샷: `test-results/`
- 보관 기간: 7일

---

## 🎭 고급 기능

### 1. API 테스트
```typescript
test('API 엔드포인트 테스트', async ({ request }) => {
  const response = await request.get('/api/customers');
  expect(response.ok()).toBeTruthy();

  const data = await response.json();
  expect(data).toHaveProperty('success', true);
});
```

### 2. 모바일 테스트
```typescript
test.use({ ...devices['iPhone 12'] });

test('모바일 반응형', async ({ page }) => {
  await page.goto('/');
  // 모바일 뷰 테스트
});
```

### 3. 스크린샷 비교
```typescript
test('시각적 회귀 테스트', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png');
});
```

---

## 📈 성능 테스트

### 로딩 시간 측정
```typescript
test('페이지 로딩 시간', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;

  expect(loadTime).toBeLessThan(3000); // 3초 이내
});
```

---

## 🔗 참고 자료

- [Playwright 공식 문서](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Debugging Guide](https://playwright.dev/docs/debug)

---

## 📝 체크리스트

새 테스트 작성 시:
- [ ] 명확하고 설명적인 테스트 이름
- [ ] beforeEach로 초기 상태 설정
- [ ] Role-based locator 사용
- [ ] 적절한 assertion 사용
- [ ] 에러 케이스 처리
- [ ] 주석으로 테스트 의도 설명
- [ ] CI에서 실행 가능한지 확인

---

**작성일**: PHASE2-004
**버전**: 1.0.0
**마지막 업데이트**: 2025-01-XX
