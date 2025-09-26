# 홈페이지 제거 및 캘린더 페이지 기본 설정 작업 지시서

## 📋 작업 개요
홈페이지를 완전히 제거하고 캘린더 페이지를 앱의 기본 페이지로 설정합니다.

## 🎯 작업 목표
1. HomePage.tsx 파일 및 관련 코드 완전 제거
2. 캘린더 페이지를 루트 경로(/)로 설정
3. 네비게이션에서 "홈" 메뉴 제거
4. 모든 홈페이지 참조 제거

## 📍 영향 범위 분석

### 수정 필요 파일
1. **App.tsx**
   - HomePage import 제거
   - Route path="/" 를 CalendarPage로 변경
   - /calendar 라우트 제거 (중복 방지)

2. **Header.tsx**
   - navItems에서 홈 메뉴 제거
   - 로고 클릭 시 '/' 유지 (이제 캘린더로 이동)

3. **HomePage.tsx**
   - 파일 완전 삭제

4. **기타 참조 파일**
   - fortuneStore.ts (홈페이지 관련 주석 정리)
   - 문서 파일들의 HomePage 참조 정리

## 🔨 작업 단계

### 1단계: 라우팅 수정
```typescript
// App.tsx 수정
// Before:
<Route path="/" element={<HomePage />} />
<Route path="/calendar" element={<CalendarPage />} />

// After:
<Route path="/" element={<CalendarPage />} />
// /calendar 라우트 제거
```

### 2단계: Header 네비게이션 수정
```typescript
// Header.tsx 수정
// Before:
const navItems = [
  { path: '/', label: '홈', icon: '🏠' },
  { path: '/calendar', label: '캘린더', icon: '📅' },
  ...
];

// After:
const navItems = [
  { path: '/', label: '캘린더', icon: '📅' },
  ...
];
```

### 3단계: Import 정리
```typescript
// App.tsx
// 제거할 import:
import HomePage from '@/pages/HomePage';
```

### 4단계: 파일 삭제
```bash
# 삭제할 파일
packages/web/src/pages/HomePage.tsx
```

### 5단계: 리다이렉션 처리
- 기존 /calendar 링크들이 있을 경우를 대비한 리다이렉션 추가 고려
```typescript
// App.tsx에 추가 (선택사항)
<Route path="/calendar" element={<Navigate to="/" replace />} />
```

## ⚠️ 주의사항

1. **로그아웃 후 리다이렉션**
   - handleLogout 함수에서 navigate('/')는 그대로 유지
   - 이제 캘린더 페이지로 이동하게 됨

2. **로고 링크**
   - 로고 클릭 시 Link to="/" 유지
   - 이제 캘린더 페이지로 이동

3. **fortuneStore 유지**
   - HomePage 제거해도 TodayFortuneSection에서 사용 중
   - Store 자체는 유지 필요

4. **테스트 필요 항목**
   - 루트 경로(/) 접속 시 캘린더 페이지 표시
   - 네비게이션 메뉴 정상 작동
   - 로그인/로그아웃 후 리다이렉션
   - 기존 /calendar 북마크 처리

## ✅ 검증 체크리스트

- [ ] 루트 경로(/)에서 캘린더 페이지 표시
- [ ] Header에서 홈 메뉴 제거됨
- [ ] 로고 클릭 시 캘린더로 이동
- [ ] HomePage.tsx 파일 삭제됨
- [ ] 빌드 에러 없음
- [ ] 린트 에러 없음
- [ ] 기능 정상 작동

## 🚀 실행 명령어

```bash
# 1. 파일 수정 후
cd packages/web

# 2. 린트 확인
npm run lint

# 3. 개발 서버 재시작
npx kill-port 4000
npx vite --port 4000

# 4. 빌드 테스트
npm run build
```

## 📝 롤백 계획

변경사항이 문제를 일으킬 경우:
```bash
git revert HEAD
```

---

**작성일**: 2025-09-26
**우선순위**: 높음
**예상 소요시간**: 15분