# 🚀 플래어(Cloudflare) + Railway 마이그레이션 가이드

## 📋 사전 준비 완료 사항
✅ **앱 헬스 체크**: 빌드 성공 (TypeScript 에러는 있지만 배포 가능)
✅ **Wrangler CLI 설치**: 완료 (`npm install -g wrangler`)
✅ **wrangler.toml 생성**: 완료

## 🎯 마이그레이션 단계별 가이드

### 📦 Phase 1: 플래어(Cloudflare Pages) 설정

#### 1. 플래어 계정 로그인
```bash
# 터미널에서 실행
wrangler login
```
- 브라우저가 열리면 Cloudflare 계정으로 로그인
- 권한 승인 클릭

#### 2. 플래어 Pages 프로젝트 생성
```bash
# packages/web 디렉토리에서 실행
cd packages/web

# 프로젝트 생성
wrangler pages project create sajuapp-frontend
```

#### 3. 첫 번째 배포
```bash
# 이미 빌드된 파일을 배포
wrangler pages deploy dist --project-name=sajuapp-frontend

# 또는 빌드와 배포 한번에
npm run build && wrangler pages deploy dist --project-name=sajuapp-frontend
```

#### 4. 환경변수 설정 (플래어 대시보드)
1. https://dash.cloudflare.com 접속
2. Pages → sajuapp-frontend → Settings → Environment variables
3. 다음 변수 추가:
```
VITE_API_URL=https://your-railway-backend.railway.app
VITE_CALENDAR_SERVICE_URL=https://your-railway-backend.railway.app/api/calendar
VITE_DIARY_SERVICE_URL=https://your-railway-backend.railway.app/api/diary
VITE_SAJU_SERVICE_URL=https://your-railway-backend.railway.app/api/saju
```

### 🚂 Phase 2: Railway 백엔드 설정

#### 1. Railway CLI 설치 (선택사항)
```bash
# Railway CLI 설치 (Windows)
npm install -g @railway/cli

# 또는 웹 대시보드 사용
# https://railway.app
```

#### 2. Railway 프로젝트 생성
```bash
# 프로젝트 루트에서
railway login
railway init

# 프로젝트 이름 입력: sajuapp-backend
```

#### 3. PostgreSQL 데이터베이스 추가
```bash
# Railway 대시보드에서
# New → Database → PostgreSQL
# 자동으로 DATABASE_URL 환경변수 생성됨
```

#### 4. 서비스 배포
```bash
# 각 서비스별로 배포
cd packages/backend/services/calendar
railway up

cd packages/backend/services/diary
railway up

cd packages/backend/services/saju-analysis
railway up
```

#### 5. 환경변수 설정 (Railway 대시보드)
```env
NODE_ENV=production
PORT=8080
DATABASE_URL=(자동 생성됨)
CORS_ORIGIN=https://sajuapp-frontend.pages.dev
JWT_SECRET=your-secret-key-here
```

### 🔗 Phase 3: 연결 및 테스트

#### 1. CORS 설정 확인
백엔드 각 서비스의 `index.ts`에서:
```typescript
app.use(cors({
  origin: [
    'https://sajuapp-frontend.pages.dev',
    'https://custom-domain.com' // 커스텀 도메인
  ],
  credentials: true
}));
```

#### 2. API 엔드포인트 테스트
```bash
# 플래어 배포 URL 확인
https://sajuapp-frontend.pages.dev

# Railway 백엔드 URL 확인
https://sajuapp-backend.railway.app

# API 테스트
curl https://sajuapp-backend.railway.app/api/health
```

#### 3. 프론트엔드 환경변수 업데이트
```bash
# packages/web/.env.production
VITE_API_URL=https://sajuapp-backend.railway.app
```

### 📊 Phase 4: 데이터 마이그레이션

#### 1. SQLite → PostgreSQL 마이그레이션
```bash
# SQLite 데이터 내보내기
sqlite3 calendar.db .dump > calendar_dump.sql

# PostgreSQL로 가져오기 (Railway 콘솔에서)
psql $DATABASE_URL < calendar_dump.sql
```

#### 2. 스키마 조정
```sql
-- PostgreSQL 스키마 조정 예시
ALTER TABLE events ALTER COLUMN created_at TYPE TIMESTAMP;
ALTER TABLE events ALTER COLUMN updated_at TYPE TIMESTAMP;
```

### ⚡ 빠른 배포 명령어

#### 플래어 재배포
```bash
cd packages/web
npm run build
wrangler pages deploy dist --project-name=sajuapp-frontend
```

#### Railway 재배포
```bash
railway up
```

### 🔧 트러블슈팅

#### 1. TypeScript 에러
```bash
# 임시 해결 (프로덕션 빌드 시)
npx vite build --mode production
```

#### 2. CORS 에러
- Railway 환경변수에서 CORS_ORIGIN 확인
- 플래어 URL이 정확한지 확인

#### 3. 데이터베이스 연결 실패
- DATABASE_URL이 Railway에서 자동 생성되었는지 확인
- PostgreSQL 서비스가 실행 중인지 확인

### 📱 커스텀 도메인 설정

#### 플래어 커스텀 도메인
1. Pages → Custom domains → Add domain
2. DNS 레코드 추가:
```
CNAME @ sajuapp-frontend.pages.dev
```

#### Railway 커스텀 도메인
1. 서비스 → Settings → Domains
2. Add custom domain
3. DNS 레코드 추가

### 🎉 배포 완료 체크리스트

- [ ] 플래어 Pages 배포 성공
- [ ] Railway 백엔드 배포 성공
- [ ] PostgreSQL 연결 성공
- [ ] API 통신 테스트 완료
- [ ] CORS 설정 완료
- [ ] 환경변수 설정 완료
- [ ] 커스텀 도메인 설정 (선택)

### 💡 프로 팁

1. **개발/프로덕션 분리**
```bash
# 개발용
wrangler pages deploy dist --env=staging

# 프로덕션용
wrangler pages deploy dist --env=production
```

2. **자동 배포 설정**
GitHub Actions로 자동화 가능

3. **모니터링**
- 플래어: Web Analytics 무료 제공
- Railway: 대시보드에서 실시간 로그 확인

### 📞 지원

- 플래어 문서: https://developers.cloudflare.com/pages
- Railway 문서: https://docs.railway.app
- Wrangler 문서: https://developers.cloudflare.com/workers/wrangler

---

**준비 완료!** 이제 다음 명령어로 바로 배포를 시작할 수 있습니다:

```bash
# 플래어 로그인 후 배포
wrangler login
cd packages/web
wrangler pages deploy dist --project-name=sajuapp-frontend
```

배포 URL: `https://sajuapp-frontend.pages.dev`