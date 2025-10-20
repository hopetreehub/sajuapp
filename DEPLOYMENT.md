# 운명나침반 프로덕션 배포 가이드

## 📋 목차
1. [Vercel 프로젝트 설정](#1-vercel-프로젝트-설정)
2. [Vercel Postgres 데이터베이스 설정](#2-vercel-postgres-데이터베이스-설정)
3. [환경 변수 설정](#3-환경-변수-설정)
4. [데이터베이스 마이그레이션](#4-데이터베이스-마이그레이션)
5. [배포 실행](#5-배포-실행)
6. [검증 및 테스트](#6-검증-및-테스트)
7. [트러블슈팅](#7-트러블슈팅)

---

## 1. Vercel 프로젝트 설정

### 1.1 Vercel CLI 설치
```bash
npm install -g vercel
```

### 1.2 로그인
```bash
vercel login
```

### 1.3 프로젝트 연결
```bash
# 프로젝트 루트에서
vercel link
```

---

## 2. Vercel Postgres 데이터베이스 설정

### 2.1 Vercel 대시보드에서 설정

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard 접속
   - 프로젝트 선택

2. **Storage 탭으로 이동**
   - 좌측 메뉴에서 "Storage" 클릭

3. **Postgres 데이터베이스 생성**
   - "Create Database" 클릭
   - "Postgres" 선택
   - 데이터베이스 이름 입력: `sajuapp-db`
   - Region 선택: `Asia Pacific (Seoul) - icn1` (권장)
   - "Create" 클릭

4. **환경 변수 자동 설정 확인**
   - Vercel이 자동으로 다음 환경 변수를 설정합니다:
     - `POSTGRES_URL`
     - `POSTGRES_PRISMA_URL`
     - `POSTGRES_URL_NON_POOLING`
     - `POSTGRES_USER`
     - `POSTGRES_HOST`
     - `POSTGRES_PASSWORD`
     - `POSTGRES_DATABASE`

### 2.2 CLI로 데이터베이스 설정 (선택사항)

```bash
# Vercel Storage 설치
npm install -g @vercel/storage

# 데이터베이스 생성
vercel storage create postgres sajuapp-db --region icn1
```

---

## 3. 환경 변수 설정

### 3.1 Vercel 대시보드에서 설정

1. **Settings → Environment Variables**로 이동

2. **Production 환경에 다음 변수 추가**:

```
# 앱 메타데이터
VITE_APP_NAME=운명나침반
VITE_APP_VERSION=2.0.0
VITE_APP_URL=https://sajuapp.vercel.app

# API URLs (Vercel Serverless Functions)
VITE_API_BASE_URL=/api
VITE_AUTH_SERVICE_URL=/api/auth
VITE_CUSTOMER_SERVICE_URL=/api/customers
VITE_CALENDAR_SERVICE_URL=/api/calendar
VITE_SAJU_SERVICE_URL=/api/saju
VITE_DIARY_SERVICE_URL=/api/diaries
VITE_AI_SERVICE_URL=/api/v1

# 기능 플래그
VITE_ENABLE_3D_VIEW=true
VITE_ENABLE_AI_CHAT=true
VITE_ENABLE_QIMEN_LEARNING=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true
VITE_ENABLE_SERVICE_WORKER=true

# 보안 설정
VITE_ENABLE_RATE_LIMITING=true
VITE_MAX_REQUESTS_PER_MINUTE=60
VITE_ENABLE_CSRF_PROTECTION=true
VITE_ENABLE_CORS=true

# 빌드 설정
BUILD_VERSION=v6
```

3. **Postgres 환경 변수는 자동 설정됨** (2.1 단계에서 설정됨)

### 3.2 CLI로 환경 변수 설정 (선택사항)

```bash
vercel env add VITE_APP_NAME production
# 값 입력: 운명나침반

vercel env add VITE_APP_VERSION production
# 값 입력: 2.0.0

# ... 나머지 변수도 동일하게 추가
```

---

## 4. 데이터베이스 마이그레이션

### 4.1 로컬에서 스키마 적용

```bash
# 1. Vercel Postgres 연결 정보 가져오기
vercel env pull .env.local

# 2. psql 명령으로 스키마 실행
psql $POSTGRES_URL -f packages/web/api/database/schema.sql
```

### 4.2 Vercel CLI로 스키마 적용

```bash
# 스키마 파일 실행
cat packages/web/api/database/schema.sql | vercel postgres sql
```

### 4.3 Vercel 대시보드에서 스키마 적용

1. **Storage → sajuapp-db → Query** 탭으로 이동
2. `packages/web/api/database/schema.sql` 파일 내용 복사
3. 쿼리 에디터에 붙여넣기
4. "Execute" 클릭

### 4.4 스키마 적용 확인

```bash
# 테이블 목록 확인
vercel postgres sql "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"

# customers 테이블 확인
vercel postgres sql "SELECT * FROM customers LIMIT 5;"
```

---

## 5. 배포 실행

### 5.1 프로덕션 배포

```bash
# 프로덕션 배포
vercel --prod
```

### 5.2 Preview 배포 (테스트용)

```bash
# Preview 배포 (테스트용)
vercel
```

### 5.3 자동 배포 (GitHub 연동)

1. **Vercel 대시보드 → Settings → Git**
2. GitHub 저장소 연결
3. `main` 또는 `master` 브랜치 푸시 시 자동 배포

```bash
# 변경사항 커밋 및 푸시
git add .
git commit -m "feat: PostgreSQL 마이그레이션 완료"
git push origin main
```

---

## 6. 검증 및 테스트

### 6.1 API 엔드포인트 테스트

```bash
# Customers API 테스트
curl https://sajuapp.vercel.app/api/customers

# 특정 고객 조회
curl https://sajuapp.vercel.app/api/customers/1

# 고객 생성 (POST)
curl -X POST https://sajuapp.vercel.app/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "테스트 고객",
    "birth_date": "1990-01-01",
    "birth_time": "12:00:00",
    "gender": "male",
    "lunar_solar": "solar",
    "phone": "010-0000-0000",
    "memo": "테스트용"
  }'
```

### 6.2 웹 앱 테스트

1. https://sajuapp.vercel.app 접속
2. 고객 관리 페이지에서 CRUD 테스트
3. 브라우저 콘솔에서 에러 확인
4. Network 탭에서 API 호출 확인

### 6.3 Vercel Logs 확인

```bash
# 실시간 로그 모니터링
vercel logs --follow

# 에러 로그만 필터링
vercel logs --filter error
```

---

## 7. 트러블슈팅

### 7.1 데이터베이스 연결 오류

**증상**: `Error: Connection failed`

**해결**:
```bash
# 1. 환경 변수 확인
vercel env ls

# 2. 환경 변수 재설정
vercel env pull .env.local

# 3. 연결 테스트
vercel postgres sql "SELECT 1;"
```

### 7.2 빌드 실패

**증상**: `Error during build`

**해결**:
```bash
# 로컬에서 빌드 테스트
cd packages/web
npm run build

# 타입 체크
npm run type-check

# 린트 체크
npm run lint
```

### 7.3 Serverless Function 타임아웃

**증상**: `Function exceeded time limit`

**해결**:
1. `vercel.json`에서 `maxDuration` 증가:
```json
{
  "functions": {
    "packages/web/api/**/*.ts": {
      "maxDuration": 10
    }
  }
}
```

2. SQL 쿼리 최적화
3. 인덱스 추가

### 7.4 CORS 에러

**증상**: `Access-Control-Allow-Origin error`

**해결**:
1. API 핸들러에서 CORS 헤더 확인
2. `vercel.json`에서 CORS 설정 추가:
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,PUT,DELETE,OPTIONS" }
      ]
    }
  ]
}
```

### 7.5 환경 변수 미인식

**증상**: `undefined` 환경 변수

**해결**:
```bash
# 1. Vercel 대시보드에서 환경 변수 확인
# 2. Production 환경에 설정되어 있는지 확인
# 3. 재배포
vercel --prod --force
```

---

## 📚 추가 리소스

- [Vercel Postgres 문서](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Vercel CLI 문서](https://vercel.com/docs/cli)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)

---

## 🔄 다음 단계

- [ ] Auth 서비스 PostgreSQL 마이그레이션
- [ ] Diary 서비스 PostgreSQL 마이그레이션
- [ ] Calendar 서비스 PostgreSQL 마이그레이션
- [ ] CI/CD 파이프라인 구축 (GitHub Actions)
- [ ] 모니터링 및 알림 설정 (Sentry, DataDog)

---

**작성**: PHASE2-003-2 (2025-01-XX)
**버전**: 1.0.0
**업데이트**: PostgreSQL 마이그레이션 완료
