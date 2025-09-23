# 운명나침반 캘린더 앱 - Claude Code 개발 지침서

## 📋 프로젝트 개요
- **프로젝트명**: 운명나침반 (Fortune Compass)
- **유형**: 사주 운세 + 캘린더 + 다이어리 통합 웹 애플리케이션
- **기술스택**: React + TypeScript + Node.js + SQLite

## 🔧 개발 환경 설정

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

## 📊 개발 체크리스트

### 🚀 개발 워크플로우 필수 단계
**⚠️ 절대 준수사항: 모든 변경사항은 반드시 아래 순서로 진행**

1. **📝 변경사항 계획 및 문서화**
   - [ ] TodoWrite 도구로 작업 계획 수립
   - [ ] 각 단계별 진행상황 추적
   - [ ] 완료된 작업은 즉시 completed로 마킹

2. **💻 코드 개발 및 테스트**
   - [ ] TypeScript 컴파일 에러 없음
   - [ ] ESLint 경고/에러 해결
   - [ ] 프론트엔드 서버 포트 4000으로 실행
   - [ ] 백엔드 서비스 정상 실행 확인

3. **🔍 철저한 테스트 및 검증**
   - [ ] 브라우저에서 기능 동작 완전 확인
   - [ ] 모든 UI 인터랙션 테스트
   - [ ] 콘솔 에러 없음 확인
   - [ ] 네트워크 탭에서 API 호출 확인
   - [ ] 다양한 시나리오 테스트

4. **📋 상세한 진행 보고**
   - [ ] 구현된 기능 목록 작성
   - [ ] 변경사항 상세 설명
   - [ ] 테스트 결과 보고
   - [ ] 스크린샷 또는 동작 확인 결과

5. **💾 Git 커밋 및 문서화**
   - [ ] git status로 변경사항 확인
   - [ ] git diff로 코드 변경 내용 검토
   - [ ] 상세한 커밋 메시지 작성
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
- 🚫 변경사항을 테스트 없이 커밋하는 것
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