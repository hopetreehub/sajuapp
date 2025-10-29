# 운명나침반 캘린더 앱 - Claude Code 개발 지침서

## 🚨 다음 세션 작업 지침 (최우선)

### ✅ 현재 완료 상태 (2025-10-27 오후 2시 최종 업데이트)
- ✅ **Vercel 배포 성공** - 모든 API Functions 정상 작동
- ✅ **관리자 회원 승인 시스템 완성**
  - API: packages/web/api/adminUsers.ts (GET/POST)
  - 승인/거부/정지/활성화 기능 완료
  - 헤더에 "회원관리" 메뉴 추가
  - 인증 보호 정상 작동 확인
- ✅ **로그인 기능 작동**
  - 관리자: admin@sajuapp.com / admin1234!
  - 테스트: test@example.com / test1234
- ✅ **API 엔드포인트 14개 배포 완료**
  - authLogin, authLogout, authMe, authSignup
  - adminUsers
  - sajuChat, qimenChat, tarotChat, ziweiChat
  - health, customers, events, diaries, tags
- ✅ **AI 챗 서비스 100% 정상 작동!** 🎉
  - 환경 변수 GOOGLE_API_KEY 이미 설정됨 (Production/Preview/Development)
  - 4개 AI 챗 API 모두 테스트 완료
  - AI Provider: Google Gemini 2.0 Flash (gemini-2.0-flash-exp)
  - 평균 응답 시간: 9초
  - 한국어 품질: 100% 완벽

### 📊 AI 챗 테스트 결과 (2025-10-27)

| API | 상태 | 응답시간 | 응답길이 | 품질 |
|-----|------|----------|----------|------|
| sajuChat | ✅ | 11초 | 3,349자 | 우수 |
| qimenChat | ✅ | 9초 | 3,525자 | 우수 |
| tarotChat | ✅ | 6초 | 2,114자 | 우수 |
| ziweiChat | ✅ | 10초 | 3,185자 | 우수 |

**테스트 명령어:**
```bash
# 사주 AI 챗 테스트
curl -X POST https://sajuapp-zeta.vercel.app/api/sajuChat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"당신은 사주 전문가입니다","userQuestion":"오늘의 운세는?"}'

# 응답 예시: {"success":true, "provider":"google-gemini", "model":"gemini-2.0-flash-exp", ...}
```

### 🎯 다음 세션 작업 권장사항

#### 옵션 1: 프론트엔드 AI 챗 통합 확인
- 사주 분석 페이지 (/saju)에서 AI 챗 사용 테스트
- 귀문둔갑 페이지 (/qimen)에서 AI 챗 사용 테스트
- 타로/자미두수 페이지에서 AI 챗 사용 테스트
- UI/UX 개선 작업

#### 옵션 2: 차트 시스템 개발 (PRD.md 기반)
- 6대 영역 종합 분석 차트 구현
- 7대 성격 특성 분석 차트 구현
- 17대 운세 종합 분석 차트 구현
- 100년 생애 곡선 차트 구현

#### 옵션 3: 성능 최적화
- AI 챗 응답 시간 단축 (목표: 3-5초)
- 캐싱 시스템 도입
- 스트리밍 응답 구현
- 번들 크기 최적화

#### 옵션 4: 새로운 기능 추가
- 음력 달력 연동
- 사용자 맞춤 알림 시스템
- 다이어리 고도화
- 고객 CRM 시스템 확장

### 📝 관리자 회원 관리 시스템 사용법
**관리자 로그인:**
1. https://sajuapp-web.vercel.app/auth?mode=login
2. admin@sajuapp.com / admin1234!

**회원 관리:**
1. 헤더에서 "회원관리" 메뉴 클릭
2. 상태별 필터링: 전체/승인대기/승인됨/거부됨/정지됨
3. 버튼 기능:
   - 승인 대기 → "승인" (초록색) / "거부" (빨간색)
   - 승인됨 → "정지" (회색)
   - 정지됨 → "활성화" (파란색)
4. 역할 변경: 드롭다운에서 user/admin/super_admin 선택

### 📝 문제 발생 시 체크리스트
- [ ] Vercel 환경 변수가 올바르게 설정되었는지 확인
- [ ] 재배포가 완료되었는지 확인 (Status: Ready)
- [ ] Google API Key가 유효한지 확인
- [ ] API 엔드포인트 직접 테스트 (curl)
- [ ] 브라우저 캐시 강력 새로고침 (Ctrl+Shift+R)

### 🔧 주요 파일 위치
- API Functions: `packages/web/api/*.ts`
- 프론트엔드 AI 챗: `packages/web/src/components/*/AIChat.tsx`
- 환경 변수: `.env` (로컬), Vercel Dashboard (프로덕션)

---

## 📋 프로젝트 개요
- **프로젝트명**: 운명나침반 (Fortune Compass)
- **유형**: 사주 운세 + 캘린더 + 다이어리 통합 웹 애플리케이션
- **기술스택**: React + TypeScript + Node.js + SQLite

## 🔧 개발 환경 설정

### 브라우저 설정
⚠️ **핵심 규칙: 모든 브라우저 작업은 Brave 브라우저 사용**

- **기본 브라우저**: Brave Browser
- **사용 이유**: 프라이버시 보호, 광고 차단, 빠른 속도
- **열기 명령어**: `start brave [URL]`
- **적용 범위**:
  - 개발 서버 테스트 (http://localhost:4000)
  - Vercel 배포 확인
  - API 테스트
  - 모든 웹 관련 작업

### 포트 구성 정책
⚠️ **핵심 규칙: 모든 서비스는 4000번대 포트만 사용**

#### 프론트엔드 및 백엔드 포트 할당
- **프론트엔드**: 4000 (고정)
- **API Gateway**: 4001 (선택사항)
- **Calendar Service**: 4012
- **Diary Service**: 4004
- **Saju Analysis**: 4015
- **Customer Service**: 4016
- **AI Service**: 4017
- **Academy Service**: 4018
- **Referral Service**: 4019

#### 포트 사용 원칙
- **허용 범위**: 4000 ~ 4099 (총 100개 포트)
- **프록시**: Vite에서 모든 백엔드로 자동 프록시
- **외부 접근**: 4000번만 노출 (다른 포트는 내부용)
- **이유**: 마이크로서비스 아키텍처 유지 + 관리 단순화

### 포트 충돌 해결 가이드
🚫 **금지사항**: 3000번대, 5000번대 포트 사용 금지
✅ **필수사항**: 포트 충돌 시 해당 프로세스 종료 후 할당된 포트 사용

### 서버 실행 명령어
```bash
# 프론트엔드 실행 (포트 4000)
cd packages/web && npx vite --port 4000

# 백엔드 서비스 실행 예시
cd packages/backend/services/calendar && PORT=4012 npm start
cd packages/backend/services/diary && PORT=4004 npm start
cd packages/backend/services/saju-analysis && PORT=4015 npm start
cd packages/backend/services/customer && CUSTOMER_SERVICE_PORT=4016 npm start

# 포트 충돌 시 해결
netstat -ano | findstr ":40"
taskkill /PID [PID번호] /F
```

### 포트 4000번대 방화벽 관리
```bash
# 포트 4000 열기
netsh advfirewall firewall add rule name="SajuApp Port 4000" dir=in action=allow protocol=TCP localport=4000

# 포트 4000 닫기  
netsh advfirewall firewall delete rule name="SajuApp Port 4000"
```

## 🚀 Git 자동 커밋 지침

### 1. 자동 커밋 실행 조건
변경사항이 발생한 경우 **반드시** 다음 단계를 수행:

1. **린트 및 타입 체크 실행**
```bash
cd packages/web && npm run lint
cd packages/web && npm run typecheck  # 있는 경우
```

2. **변경사항 확인**
```bash
git status
git diff
```

3. **커밋 메시지 작성 규칙**
```bash
git commit -m "$(cat <<'EOF'
feat: [기능 설명]

- 주요 변경사항 1
- 주요 변경사항 2
- 버그 수정사항

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### 2. 커밋 메시지 템플릿

#### 기능 추가
```
feat: 주간 뷰 타입 에러 수정

- CalendarEvent 타입 정의 API와 통일
- startDateTime → start_time 필드명 변경
- CalendarContext 타입 에러 해결
- WeekView 컴포넌트 안정화

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

#### 버그 수정
```
fix: 캘린더 뷰 전환 시 타입 에러 해결

- API 응답 필드명과 프론트엔드 타입 불일치 수정
- all_day, start_time, end_time 필드 통일

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

#### 리팩토링
```
refactor: 타입 정의 중앙화 및 일관성 개선

- @/types/calendar.ts를 @/services/api.ts와 통일
- 중복된 CalendarEvent 타입 정의 제거

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 3. 자동 커밋 스크립트

프로젝트 루트에 `auto-commit.sh` 생성:

```bash
#!/bin/bash
# auto-commit.sh - 자동 커밋 스크립트

echo "🔍 변경사항 확인 중..."
git status

echo "\n📝 최근 커밋 로그 확인..."
git log --oneline -5

echo "\n🔧 린트 실행 중..."
cd packages/web && npm run lint

echo "\n✅ 변경사항 커밋 중..."
git add .

# 커밋 메시지 자동 생성 (수정 필요 시 인터랙티브 편집)
git commit -m "$(cat <<'EOF'
feat: 자동 커밋 - $(date +'%Y-%m-%d %H:%M')

- 캘린더 앱 개발 진행사항 저장
- 최신 변경사항 반영

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

echo "✨ 커밋 완료!"
```

### 4. 실행 권한 설정
```bash
chmod +x auto-commit.sh
```

## 🧪 TDD (Test-Driven Development) 지침

### 핵심 원칙
**⚠️ 절대 준수사항: 테스트 먼저, 코드는 나중에**

TDD는 코드 품질과 신뢰성을 보장하는 가장 효과적인 개발 방법론입니다.

### Red-Green-Refactor 사이클

```
🔴 RED    → 실패하는 테스트 작성 (요구사항 명확화)
   ↓
🟢 GREEN  → 테스트를 통과하는 최소한의 코드 작성
   ↓
🔵 REFACTOR → 코드 개선 (테스트는 여전히 통과)
   ↓
   (반복)
```

### TDD 개발 워크플로우

1. **🔴 테스트 작성 (RED)**
   ```bash
   # 1단계: 테스트 파일 생성
   # 예: aiCacheManager.test.ts

   describe('AICacheManager', () => {
     it('should cache and retrieve AI responses', () => {
       // 테스트 코드 작성
     });
   });
   ```

2. **🟢 구현 (GREEN)**
   ```bash
   # 2단계: 테스트를 통과하는 최소 코드 작성
   # 예: aiCacheManager.ts

   export class AICacheManager {
     get() { /* 구현 */ }
     set() { /* 구현 */ }
   }
   ```

3. **🔵 리팩토링 (REFACTOR)**
   ```bash
   # 3단계: 코드 개선 (테스트 통과 유지)
   # - 중복 제거
   # - 성능 최적화
   # - 가독성 향상
   ```

4. **✅ 테스트 실행 및 검증**
   ```bash
   npm test                    # 전체 테스트 실행
   npm test -- --coverage      # 커버리지 리포트
   npm test aiCacheManager     # 특정 테스트만 실행
   ```

### 테스트 작성 우선순위

#### 1순위: 핵심 비즈니스 로직
- 사주 계산 알고리즘
- 귀문둔갑 국 계산
- 자미두수 명궁 계산
- AI 응답 캐싱 로직

#### 2순위: API 엔드포인트
- 인증 API (로그인/로그아웃)
- AI 챗 API (사주/귀문둔갑/타로/자미두수)
- 고객 관리 API

#### 3순위: 유틸리티 함수
- 날짜 변환 함수
- 문자열 처리 함수
- 데이터 검증 함수

#### 4순위: UI 컴포넌트
- 중요한 사용자 인터랙션
- 상태 관리 로직
- 폼 검증

### 테스트 종류별 가이드

#### Unit Tests (단위 테스트)
- **목적**: 개별 함수/클래스의 동작 검증
- **도구**: Vitest, Jest
- **예시**:
  ```typescript
  // aiCacheManager.test.ts
  describe('AICacheManager', () => {
    it('캐시 저장 후 조회 가능', () => {
      const cache = new AICacheManager('test');
      cache.set({ key: 'value' }, 'response', 'provider', 'model');
      const result = cache.get({ key: 'value' });
      expect(result?.response).toBe('response');
    });

    it('만료된 캐시는 null 반환', () => {
      const cache = new AICacheManager('test', { ttl: 0 });
      cache.set({ key: 'value' }, 'response', 'provider', 'model');
      const result = cache.get({ key: 'value' });
      expect(result).toBeNull();
    });
  });
  ```

#### Integration Tests (통합 테스트)
- **목적**: 여러 모듈 간 상호작용 검증
- **도구**: Vitest, Supertest
- **예시**:
  ```typescript
  // api/sajuChat.test.ts
  describe('POST /api/sajuChat', () => {
    it('유효한 요청에 AI 응답 반환', async () => {
      const response = await request(app)
        .post('/api/sajuChat')
        .send({
          prompt: '당신은 사주 전문가입니다',
          userQuestion: '오늘의 운세는?'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.response).toBeTruthy();
    });
  });
  ```

#### E2E Tests (엔드투엔드 테스트)
- **목적**: 사용자 시나리오 전체 플로우 검증
- **도구**: Playwright, Cypress
- **예시**:
  ```typescript
  // e2e/ai-chat.spec.ts
  test('사주 AI 챗 사용 플로우', async ({ page }) => {
    await page.goto('http://localhost:4000/saju');
    await page.fill('[data-testid="ai-chat-input"]', '오늘의 운세는?');
    await page.click('[data-testid="ai-chat-send"]');
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible();
  });
  ```

### 테스트 커버리지 목표

- **유틸리티 함수**: 90% 이상
- **비즈니스 로직**: 80% 이상
- **API 엔드포인트**: 70% 이상
- **UI 컴포넌트**: 60% 이상

```bash
# 커버리지 확인
npm test -- --coverage

# 커버리지 리포트 생성
npm test -- --coverage --reporter=html
```

### 테스트 명명 규칙

```typescript
// ✅ 좋은 예
describe('AICacheManager', () => {
  describe('get()', () => {
    it('캐시된 데이터를 올바르게 반환해야 함', () => {});
    it('캐시가 없으면 null을 반환해야 함', () => {});
    it('만료된 캐시는 삭제하고 null을 반환해야 함', () => {});
  });

  describe('set()', () => {
    it('데이터를 캐시에 저장해야 함', () => {});
    it('5MB를 초과하는 데이터는 저장하지 않아야 함', () => {});
  });
});

// ❌ 나쁜 예
describe('test', () => {
  it('works', () => {});
  it('test 2', () => {});
});
```

### 테스트 모범 사례

#### 1. AAA 패턴 사용
```typescript
it('캐시 저장 및 조회', () => {
  // Arrange (준비)
  const cache = new AICacheManager('test');
  const params = { question: 'test' };

  // Act (실행)
  cache.set(params, 'response', 'provider', 'model');
  const result = cache.get(params);

  // Assert (검증)
  expect(result?.response).toBe('response');
});
```

#### 2. Mock 활용
```typescript
import { vi } from 'vitest';

it('API 호출 시 에러 처리', async () => {
  // fetch를 mock으로 대체
  global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

  const result = await getAIResponse('test question');

  expect(result).toBe('규칙 기반 응답');
});
```

#### 3. 테스트 격리
```typescript
describe('AICacheManager', () => {
  beforeEach(() => {
    // 각 테스트 전에 localStorage 초기화
    localStorage.clear();
  });

  afterEach(() => {
    // 각 테스트 후 정리
    localStorage.clear();
  });
});
```

### 테스트 실행 명령어

```bash
# 전체 테스트 실행
npm test

# 특정 파일만 테스트
npm test aiCacheManager

# Watch 모드 (변경 시 자동 재실행)
npm test -- --watch

# 커버리지 리포트
npm test -- --coverage

# UI 모드로 실행 (Vitest)
npm test -- --ui
```

## 📊 개발 체크리스트

### 🚀 TDD 기반 개발 워크플로우 필수 단계
**⚠️ 절대 준수사항: 테스트 → 구현 → 리팩토링 순서 준수**

1. **📝 변경사항 계획 및 문서화**
   - [ ] TodoWrite 도구로 작업 계획 수립
   - [ ] 각 단계별 진행상황 추적
   - [ ] 완료된 작업은 즉시 completed로 마킹

2. **🔴 테스트 작성 (RED)**
   - [ ] 요구사항을 명확히 정의
   - [ ] 실패하는 테스트 작성 (테스트 파일: `*.test.ts`)
   - [ ] 테스트 실행하여 실패 확인 (`npm test`)
   - [ ] 테스트가 정확히 원하는 동작을 검증하는지 확인

3. **🟢 구현 (GREEN)**
   - [ ] 테스트를 통과하는 최소한의 코드 작성
   - [ ] TypeScript 컴파일 에러 없음
   - [ ] 테스트 실행하여 통과 확인
   - [ ] 모든 테스트가 통과할 때까지 반복

4. **🔵 리팩토링 (REFACTOR)**
   - [ ] 코드 중복 제거
   - [ ] 가독성 개선
   - [ ] 성능 최적화
   - [ ] ESLint 경고/에러 해결
   - [ ] 테스트가 여전히 통과하는지 확인

5. **🔍 통합 테스트 및 검증**
   - [ ] 프론트엔드 서버 포트 4000으로 실행
   - [ ] 백엔드 서비스 정상 실행 확인
   - [ ] 브라우저에서 기능 동작 완전 확인
   - [ ] 모든 UI 인터랙션 테스트
   - [ ] 콘솔 에러 없음 확인
   - [ ] 네트워크 탭에서 API 호출 확인
   - [ ] 다양한 시나리오 테스트

6. **📋 상세한 진행 보고**
   - [ ] 구현된 기능 목록 작성
   - [ ] 작성된 테스트 목록 작성
   - [ ] 테스트 커버리지 리포트
   - [ ] 변경사항 상세 설명
   - [ ] 스크린샷 또는 동작 확인 결과

7. **💾 Git 커밋 및 문서화**
   - [ ] 테스트 커버리지 확인 (`npm test -- --coverage`)
   - [ ] git status로 변경사항 확인
   - [ ] git diff로 코드 변경 내용 검토
   - [ ] 상세한 커밋 메시지 작성 (test: 추가)
   - [ ] 관련 문서 업데이트

### 코드 작성 후 필수 확인사항
- [ ] TypeScript 컴파일 에러 없음
- [ ] ESLint 경고/에러 해결
- [ ] API 엔드포인트 테스트 완료
- [ ] 브라우저에서 기능 동작 확인
- [ ] 콘솔 에러 없음
- [ ] Git 커밋 완료

### API 개발 시 확인사항
- [ ] 백엔드 서비스 정상 실행
- [ ] curl로 API 엔드포인트 테스트
- [ ] 프론트엔드-백엔드 연동 확인
- [ ] 에러 핸들링 구현
- [ ] 로그 출력 정상

### ⛔ 절대 금지사항
- 🚫 **테스트 없이 코드 작성하는 것** (TDD 원칙 위반)
- 🚫 **테스트 없이 변경사항을 커밋하는 것**
- 🚫 **실패하는 테스트를 무시하고 진행하는 것**
- 🚫 프론트엔드를 4000 포트 외에 다른 포트로 실행하는 것
- 🚫 진행상황을 보고하지 않고 작업하는 것
- 🚫 TodoWrite 없이 복잡한 작업을 진행하는 것
- 🚫 에러나 경고를 무시하고 진행하는 것

## 🔮 프로젝트 구조

```
sajuapp/
├── packages/
│   ├── web/                    # React 프론트엔드
│   │   ├── src/
│   │   │   ├── components/     # 재사용 컴포넌트
│   │   │   ├── contexts/       # React Context API
│   │   │   ├── services/       # API 호출 서비스
│   │   │   ├── types/          # TypeScript 타입 정의
│   │   │   └── pages/          # 페이지 컴포넌트
│   │   └── package.json
│   └── backend/
│       ├── api-gateway/        # API 게이트웨이
│       └── services/
│           ├── calendar/       # 캘린더 마이크로서비스
│           ├── auth/          # 인증 서비스 (개발 예정)
│           └── diary/         # 다이어리 서비스 (개발 예정)
├── open-ports.bat             # 방화벽 포트 열기
├── close-ports.bat            # 방화벽 포트 닫기
├── auto-commit.sh             # 자동 커밋 스크립트
├── CLAUDE.md                  # 이 파일
├── prd.md                     # 제품 요구사항 문서
└── development-guide.md       # 개발 가이드
```

## 🎯 현재 개발 상태

### ✅ 완료된 기능
1. **기본 캘린더 시스템**
   - React + TypeScript 프론트엔드
   - 4가지 캘린더 뷰 (Year/Month/Week/Day/DayEnhanced)
   - SQLite 기반 Calendar Service
   - API Gateway 라우팅

2. **할일 관리 시스템**
   - CalendarContext 중앙집중식 할일 상태 관리
   - 모든 캘린더 뷰에서 할일 데이터 동기화
   - CRUD 할일 기능 (추가/수정/삭제/완료)
   - 우선순위별 아이콘 표시 (🔴🟡🟢)

3. **일기 시스템**
   - DiaryModal 컴포넌트 구현
   - 팝업 모달 방식 일기 작성
   - 기분 선택 (8가지 이모지)
   - ESC 키 및 외부 클릭으로 닫기

4. **UI/UX 완성도**
   - 일정 생성/수정/삭제 기능
   - 타입 안전성 보장
   - 다크모드 지원
   - 사주 운세 차트 시각화
   - 설정 페이지 (생년월일/시간 입력)

5. **개발 환경**
   - 포트 4000 고정 정책 확립
   - 방화벽 포트 관리 스크립트
   - Git 자동 커밋 워크플로우

### 🚧 진행 중인 작업
1. 월간 캘린더 뷰에서 할일 표시 기능
2. 캘린더 태그 시스템 활용
3. API 서버 연동 최적화

### 📋 향후 계획
1. Diary Service 백엔드 개발
2. 음력 달력 연동
3. 사주 운세 정보 고도화
4. 사용자 인증 시스템
5. 배포 환경 구축

## ⚠️ 주의사항

### 타입 정의
- **CalendarEvent**: `@/services/api.ts`의 정의를 기준으로 사용
- **필드명**: `start_time`, `end_time`, `all_day` (snake_case)
- **날짜 형식**: ISO 8601 문자열 형태

### API 호출
- **기본 URL**: `http://localhost:4012/api`
- **인증**: 현재는 임시 사용자 ID 사용
- **에러 처리**: try-catch 블록으로 감싸기

### 개발 서버
- **포트 충돌 시**: 4011 포트 사용
- **재시작 필요 시**: 타입 변경, 설정 변경 후
- **로그 확인**: 백엔드 서비스 콘솔 모니터링

---

*이 문서는 Claude Code로 개발하는 운명나침반 프로젝트의 가이드라인입니다.*