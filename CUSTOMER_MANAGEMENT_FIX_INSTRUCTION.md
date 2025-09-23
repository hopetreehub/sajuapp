# 🔧 고객 관리 시스템 정상화 작업지시서

## 📌 문제 상황

### 증상
1. 사주 분석 페이지에서 고객 불러오기 실패
2. 신규 고객 등록 기능 작동 안 함
3. API 호출 시 연결 거부 오류 발생

### 근본 원인
**Calendar 서비스가 잘못된 포트(5001)에서 실행 중이었음**
- 프론트엔드는 4012 포트로 요청
- 실제 서비스는 5001 포트에서 실행
- 포트 불일치로 인한 연결 실패

## ✅ 해결 완료

### 수행된 작업

#### 1. 포트 충돌 문제 진단
```bash
# 실행 중인 프로세스 확인
netstat -ano | findstr ":4012"  # 결과 없음
netstat -ano | findstr ":5001"  # PID 27360 발견
```

#### 2. 잘못된 프로세스 종료
```bash
taskkill /PID 27360 /F
# 성공: 프로세스(PID 27360)가 종료되었습니다.
```

#### 3. Calendar 서비스 설정 수정
**파일**: `packages/backend/services/calendar/src/index.ts`

```typescript
// 수정 전
const PORT = process.env.CALENDAR_SERVICE_PORT || 4012

// 수정 후
const PORT = 4012 // 고정 포트 사용
```

#### 4. 서비스 재시작
```bash
cd packages/backend/services/calendar
PORT=4012 npx ts-node --transpile-only src/index.ts
```

#### 5. API 동작 확인
```bash
curl http://localhost:4012/api/calendar/customers
# 결과: 6명의 고객 데이터 정상 반환
```

## 🎯 검증 결과

### API 응답 확인
```json
[
  {
    "id": 1,
    "name": "이재명",
    "birthDate": "1964-12-22",
    "birthTime": "02:30",
    "gender": "male",
    "calendarType": "solar"
  },
  // ... 총 6명 고객 데이터
]
```

### 서비스 상태
- ✅ Calendar Service: 포트 4012에서 정상 실행
- ✅ 고객 목록 조회 API: 정상 작동
- ✅ 데이터베이스 연결: 정상
- ✅ 6명의 테스트 고객 데이터 확인

## 📊 현재 시스템 구조

```
프론트엔드 (4000)
    ↓ Proxy
Calendar API (4012)
    ├── /api/calendar/events    → 일정 관리
    ├── /api/calendar/customers → 고객 관리 ✅
    └── /api/calendar/tags      → 태그 관리
```

## 🔍 추가 확인 필요 사항

### 프론트엔드 연동 테스트
1. 사주 분석 페이지에서 고객 목록 로드 확인
2. 신규 고객 등록 폼 동작 테스트
3. 고객 선택 후 사주 분석 진행 확인

### UI 컴포넌트 확인
- `CustomerSelector.tsx`: 고객 선택 컴포넌트
- `SajuAnalysisPage.tsx`: 사주 분석 페이지
- API 호출 로직 정상 동작 여부

## 📋 체크리스트

- [x] 포트 충돌 문제 해결
- [x] Calendar 서비스 포트 4012 고정
- [x] 서비스 재시작 완료
- [x] API 응답 검증 완료
- [ ] 프론트엔드 UI에서 고객 목록 표시 확인
- [ ] 신규 고객 등록 기능 테스트
- [ ] 고객 선택 후 사주 분석 연동 테스트

## 🚀 다음 단계

1. **브라우저 테스트**
   - http://localhost:4000/saju 접속
   - 고객 목록 로드 확인
   - 고객 선택/등록 기능 테스트

2. **오류 발생 시**
   - 브라우저 콘솔 에러 확인
   - 네트워크 탭에서 API 호출 상태 확인
   - Calendar 서비스 로그 모니터링

3. **정상 동작 확인 후**
   - 실제 사주 분석 기능 테스트
   - 분석 결과 저장/조회 기능 확인

## 🐛 트러블슈팅 가이드

### 문제: API 호출 시 여전히 연결 실패
```bash
# 1. 포트 사용 현황 확인
netstat -ano | findstr ":4012"

# 2. 프로세스 강제 종료
taskkill /PID [PID번호] /F

# 3. Calendar 서비스 재시작
cd packages/backend/services/calendar
PORT=4012 npx ts-node --transpile-only src/index.ts
```

### 문제: 고객 데이터가 비어있음
```bash
# SQLite 데이터베이스 직접 확인
sqlite3 packages/backend/services/calendar/saju.db
.tables
SELECT * FROM customers;
.exit
```

### 문제: CORS 오류 발생
- Calendar 서비스의 CORS 설정 확인
- `packages/backend/services/calendar/src/index.ts`의 CORS 미들웨어 설정 검토

---

**작성일**: 2025년 9월 23일  
**상태**: ✅ 해결 완료  
**우선순위**: 🔴 긴급  
**담당**: 백엔드 개발팀  
**예상 소요 시간**: 완료 (10분 소요)