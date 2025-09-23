# 🔧 캘린더 및 다이어리 서비스 연결 오류 해결 작업지시서

## 📌 현재 문제 상황

### 오류 메시지
```
CalendarPage.tsx:87 Failed to load events: AxiosError
:4003/api/calendar/events:1 Failed to load resource: net::ERR_CONNECTION_REFUSED

useDiaryData.ts:81 Failed to load diaries: AxiosError
:5002/api/diaries/search?startDate=2025-09-01&endDate=2025-09-30:1 Failed to load resource: net::ERR_CONNECTION_REFUSED
```

### 문제 분석
1. **포트 불일치 문제**:
   - 프론트엔드 api.ts: 포트 4003으로 요청
   - vite.config.ts 프록시: 포트 5001로 설정
   - 실제 요청: 포트 4003으로 직접 요청 (프록시 미사용)

2. **다이어리 서비스 포트 혼선**:
   - 실제 요청: 포트 5002
   - vite.config.ts 프록시: 포트 4004로 설정

3. **백엔드 서비스 미실행**:
   - calendar 서비스 (포트 5001) 미실행
   - diary 서비스 (포트 4004) 미실행

## 🎯 해결 방안

### Phase 1: API 엔드포인트 정리 (10분)

#### 1-1. api.ts 수정
```typescript
// packages/web/src/services/api.ts
const API_URL = import.meta.env.VITE_API_URL || ''; // 빈 문자열로 변경 (프록시 사용)
```

이렇게 하면 모든 API 요청이 현재 도메인으로 가고, Vite 프록시가 적용됩니다.

#### 1-2. 다이어리 API URL 수정
```typescript
// packages/web/src/services/diaryApi.ts 확인 및 수정
const DIARY_API_URL = ''; // 프록시 사용하도록 변경
```

### Phase 2: 백엔드 서비스 실행 (15분)

#### 2-1. Calendar 서비스 실행
```bash
cd packages/backend/services/calendar
PORT=5001 npx ts-node --transpile-only src/index.ts
```

#### 2-2. Diary 서비스 실행
```bash
cd packages/backend/services/diary
PORT=4004 npx ts-node --transpile-only src/index.ts
```

### Phase 3: 프록시 설정 확인 (5분)

#### 3-1. vite.config.ts 검증
현재 설정이 올바른지 확인:
- `/api/calendar/*` → `http://localhost:5001`
- `/api/diaries/*` → `http://localhost:4004`

### Phase 4: 테스트 및 검증 (10분)

#### 4-1. API 엔드포인트 테스트
```bash
# 캘린더 이벤트 조회
curl http://localhost:4000/api/calendar/events

# 다이어리 조회
curl http://localhost:4000/api/diaries/search?startDate=2025-09-01&endDate=2025-09-30
```

#### 4-2. 브라우저 테스트
1. 캘린더 페이지 접속
2. 네트워크 탭에서 API 요청 확인
3. 콘솔 에러 없음 확인

## 🚀 즉시 실행 명령어

```bash
# 1단계: Calendar 서비스 실행
cd packages/backend/services/calendar
PORT=5001 npx ts-node --transpile-only src/index.ts

# 2단계: Diary 서비스 실행 (새 터미널)
cd packages/backend/services/diary
PORT=4004 npx ts-node --transpile-only src/index.ts

# 3단계: API 설정 수정
# api.ts의 API_URL을 빈 문자열로 변경

# 4단계: 프론트엔드 재시작 (필요시)
cd packages/web
PORT=4000 npm run dev
```

## ⚠️ 주의사항

### CLAUDE.md 포트 정책과의 충돌
CLAUDE.md에서는 "포트 4000만 사용" 정책이 있지만, 현재 시스템은 마이크로서비스 아키텍처로 설계되어 있습니다.

**권장 해결책**:
1. 단기: 현재 마이크로서비스 구조 유지 (포트 5001, 4004 사용)
2. 장기: API Gateway를 통한 단일 포트(4000) 통합 고려

### 포트 충돌 시 해결
```bash
# Windows에서 포트 사용 프로세스 확인
netstat -ano | findstr ":5001"
netstat -ano | findstr ":4004"

# 프로세스 종료
taskkill /PID [PID번호] /F
```

## 📊 예상 결과

### Before
- 캘린더 이벤트 로드 실패
- 다이어리 데이터 로드 실패
- 콘솔에 ERR_CONNECTION_REFUSED 에러

### After
- 캘린더 이벤트 정상 표시
- 다이어리 데이터 정상 로드
- 모든 API 요청 성공

## 🔍 추가 확인 사항

1. **데이터베이스 파일 존재 여부**:
   - `packages/backend/services/calendar/calendar.db`
   - `packages/backend/services/diary/diary.db`

2. **환경 변수 설정**:
   - `.env` 파일에 필요한 설정 확인

3. **CORS 설정**:
   - 백엔드 서비스에서 CORS 허용 확인

---

**작성일**: 2025년 9월 22일
**우선순위**: 🔴 긴급 (사용자 경험 직접 영향)
**예상 소요시간**: 40분
**담당**: DevOps 엔지니어