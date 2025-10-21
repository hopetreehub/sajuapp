# 운명나침반 - 다음 개발 작업 계획

**작성일**: 2025-10-21
**작성자**: Claude Code (Swarm PM)
**프로젝트 상태**: Phase 1 완료, Phase 2 진행 중

---

## 📊 현재 프로젝트 상태

### ✅ 완료된 작업 (2025-10-21 기준)

#### 1. **코드 품질 개선**
- ✅ ESLint 에러 **263개 수정** (1027개 → 764개)
  - 1차 수정: 252개 (자동 수정)
  - 2차 수정: 11개 (수동 수정)
- ✅ TypeScript 타입 안전성 강화
- ✅ 코딩 스타일 통일
- ✅ Git 커밋 2회 완료

#### 2. **개발 환경 검증**
- ✅ 프론트엔드 서버 (포트 4000): 정상 실행
- ✅ Calendar Service (포트 4012): 정상 실행
- ✅ Diary Service (포트 4004): 정상 실행
- ✅ Saju Analysis Service (포트 4015): 정상 실행

#### 3. **기존 완료 기능**
- ✅ 캘린더 시스템 (Year/Month/Week/Day/DayEnhanced 뷰)
- ✅ 다이어리 시스템 (DiaryModal 팝업 방식)
- ✅ 사주 분석 시스템 (6대 영역, 7대 성격, 17대 운세, 100년 차트)
- ✅ 인증 시스템 (회원가입/로그인, JWT, QR코드)
- ✅ 고객 관리 시스템
- ✅ 귀문둔갑, 자미두수, 타로 카드 기능

---

## 🚨 발견된 이슈

### **우선순위 1 - 즉시 수정 필요**

#### 1. **Diary API 프록시 연결 에러** 🔴
**문제**: `/api/diaries/search` 엔드포인트 ECONNREFUSED 에러
**영향**: 다이어리 검색 기능 동작 불가
**원인**: Vite 프록시 설정과 백엔드 서비스 불일치
**해결 방안**:
- vite.config.ts의 `/api/diaries` 프록시 설정 확인
- Diary Service (포트 4004) 라우팅 확인
- API 엔드포인트 통일성 검증

**작업 예상 시간**: 1-2시간

---

## 🎯 다음 작업 우선순위

### **Phase 2-1: 버그 수정 및 안정화 (최우선)**

#### 작업 1: Diary API 연결 문제 해결
```yaml
목표: 다이어리 API 연결 복구
우선순위: ★★★★★
예상 시간: 1-2시간
담당: Backend + Frontend 통합

작업 내용:
  1. Vite 프록시 설정 검증
  2. Diary Service 라우팅 확인
  3. API 엔드포인트 표준화
  4. 연결 테스트 및 검증
```

#### 작업 2: 남은 ESLint 에러 점진적 개선
```yaml
목표: 136개 남은 에러 → 50개 이하로 감소
우선순위: ★★★☆☆
예상 시간: 3-4시간
담당: Code Quality

작업 내용:
  1. React Hooks 규칙 위반 수정
  2. @ts-ignore → @ts-expect-error 변경
  3. 중요하지 않은 사용하지 않는 변수는 유지
```

---

### **Phase 2-2: 기능 완성도 향상 (높음)**

#### 작업 3: 월간 캘린더 할일 표시 기능 완성
```yaml
목표: MonthView에서 할일 표시 및 관리
우선순위: ★★★★☆
예상 시간: 4-6시간
담당: Frontend (Calendar)

작업 내용:
  1. CalendarContext의 할일 데이터를 MonthView에 연동
  2. 날짜별 할일 개수 뱃지 표시
  3. 할일 클릭 시 상세 보기/편집 모달
  4. 우선순위별 시각적 구분 (🔴🟡🟢)
```

#### 작업 4: 캘린더 태그 시스템 활용
```yaml
목표: 태그 기반 일정/할일 필터링
우선순위: ★★★☆☆
예상 시간: 3-4시간
담당: Frontend (Calendar) + Backend (Calendar Service)

작업 내용:
  1. 태그 CRUD API 완성 (이미 구현됨, 연동 필요)
  2. 태그 선택 UI 구현
  3. 태그별 필터링 기능
  4. 태그별 색상 구분
```

---

### **Phase 2-3: 사용자 경험 개선 (중간)**

#### 작업 5: 음력 달력 연동
```yaml
목표: 음력/양력 전환 기능 및 표시
우선순위: ★★★☆☆
예상 시간: 6-8시간
담당: Frontend (Calendar) + Data Integration

작업 내용:
  1. korean-lunar-calendar 라이브러리 활용 (이미 설치됨)
  2. 캘린더 뷰에 음력 날짜 표시 옵션
  3. 음력 기반 일정 생성 기능
  4. 음력 절기 정보 표시
```

#### 작업 6: 사주 운세 정보 고도화
```yaml
목표: 일간별 사주 운세 정확도 향상
우선순위: ★★☆☆☆
예상 시간: 8-12시간
담당: Backend (Saju Analysis) + Data Science

작업 내용:
  1. 십신 분석 정확도 개선
  2. 120개 신살 완전 구현
  3. 대운/세운 상세 분석
  4. AI 기반 개인화된 해석
```

---

### **Phase 3: 배포 및 운영 준비 (낮음)**

#### 작업 7: Vercel 배포 최적화
```yaml
목표: 프로덕션 배포 안정화
우선순위: ★★☆☆☆
예상 시간: 4-6시간
담당: DevOps

작업 내용:
  1. Vercel Functions 성능 최적화
  2. 환경변수 관리 체계화
  3. 캐싱 전략 수립
  4. 모니터링 설정
```

#### 작업 8: 사용자 데이터 백업 시스템
```yaml
목표: 데이터 손실 방지 시스템 구축
우선순위: ★★☆☆☆
예상 시간: 6-8시간
담당: Backend + Database

작업 내용:
  1. SQLite → PostgreSQL 마이그레이션 (선택사항)
  2. 자동 백업 스케줄러
  3. 데이터 복구 프로세스
  4. 사용자 데이터 내보내기 기능
```

---

## 🎓 추천 작업 순서

### **Week 1-2: 안정화 집중**
1. 🔴 Diary API 연결 문제 해결 (즉시)
2. 🟡 월간 캘린더 할일 표시 기능 완성
3. 🟡 캘린더 태그 시스템 활용

### **Week 3-4: 기능 확장**
4. 🟢 음력 달력 연동
5. 🟢 ESLint 에러 점진적 개선 (백그라운드)

### **Week 5-6: 사주 운세 고도화**
6. 🔵 사주 운세 정보 고도화
7. 🔵 AI 기반 해석 정확도 향상

### **Week 7-8: 배포 준비**
8. ⚪ Vercel 배포 최적화
9. ⚪ 데이터 백업 시스템

---

## 📋 작업 시작 전 체크리스트

### 개발 환경 확인
- [ ] 모든 서비스 정상 실행 (포트 4000, 4004, 4012, 4015)
- [ ] Brave 브라우저에서 http://localhost:4000 접근 확인
- [ ] Git 저장소 최신 상태 확인
- [ ] ESLint/TypeScript 에러 없음

### 작업 준비
- [ ] TodoWrite로 작업 계획 수립
- [ ] 관련 문서 (CLAUDE.md, PRD.md) 검토
- [ ] 백그라운드 서비스 로그 확인
- [ ] 테스트 시나리오 작성

---

## 🚀 빠른 시작 가이드

### 1. 서버 실행
```bash
# 프론트엔드 (포트 4000)
cd packages/web && npx vite --port 4000

# Calendar Service (포트 4012)
cd packages/backend/services/calendar && PORT=4012 npm start

# Diary Service (포트 4004)
cd packages/backend/services/diary && PORT=4004 npm start

# Saju Analysis (포트 4015)
cd packages/backend/services/saju-analysis && PORT=4015 npm start
```

### 2. 브라우저 접속
```bash
start brave http://localhost:4000
```

### 3. 작업 시작
```bash
# 새로운 기능 개발 전 브랜치 생성 (선택사항)
git checkout -b feature/diary-api-fix

# 작업 후 커밋
git add .
git commit -m "feat: 작업 내용 설명

- 주요 변경사항 1
- 주요 변경사항 2

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## 📞 다음 세션 시작 시 확인사항

1. ✅ 이 문서 확인
2. ✅ Git log 확인 (최근 작업 내용)
3. ✅ 서버 실행 상태 확인
4. ✅ 진행 중인 이슈 확인
5. ✅ TodoWrite로 작업 계획 수립

---

**⚡ 즉시 시작 가능한 작업**: Diary API 연결 문제 해결
**🎯 다음 우선순위**: 월간 캘린더 할일 표시 기능

**문의사항 또는 지침 변경이 필요하면 CLAUDE.md를 업데이트하세요.**
