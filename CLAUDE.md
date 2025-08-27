# 운명나침반 캘린더 앱 - Claude Code 개발 지침서

## 📋 프로젝트 개요
- **프로젝트명**: 운명나침반 (Fortune Compass)
- **유형**: 사주 운세 + 캘린더 + 다이어리 통합 웹 애플리케이션
- **기술스택**: React + TypeScript + Node.js + SQLite

## 🔧 개발 환경 설정

### 포트 구성
- **프론트엔드**: 4010 (메인), 4011 (백업)
- **API Gateway**: 4012
- **Calendar Service**: 4003
- **Auth Service**: 4004
- **Diary Service**: 4005
- **Database**: 4006
- **Redis**: 4007

### 서버 실행 명령어
```bash
# 프론트엔드
cd packages/web && npm run dev

# 백엔드 서비스
cd packages/backend/services/calendar && npm run dev
cd packages/backend/api-gateway && npm run dev

# 포트 충돌 시 대체 명령어
cd packages/web && npx vite --port 4011
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
1. 기본 프로젝트 구조 설정
2. React + TypeScript 프론트엔드
3. 4가지 캘린더 뷰 (Year/Month/Week/Day)
4. SQLite 기반 Calendar Service
5. API Gateway 라우팅
6. CRUD 기능 (일정 생성/수정/삭제)
7. 타입 안전성 보장
8. 방화벽 포트 관리

### 🚧 진행 중인 작업
1. Auth Service 개발
2. 사용자 인증 시스템
3. JWT 토큰 관리

### 📋 향후 계획
1. Diary Service 개발
2. 음력 달력 연동
3. 사주 운세 정보 통합
4. 배포 환경 구축

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