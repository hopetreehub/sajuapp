# 운명나침반 프로덕션 배포 체크리스트

## 📋 배포 전 필수 작업 목록

### 1. 🗑️ 목업/테스트 데이터 제거

#### 제거할 테스트 페이지들:
- [ ] `TestSajuPage.tsx` - 테스트용 사주 페이지
- [ ] `TestComprehensiveScoresPage.tsx` - 종합 점수 테스트
- [ ] `SajuTestPage.tsx` - 사주 테스트 페이지

#### 제거할 테스트 라우트:
```typescript
// App.tsx에서 제거
<Route path="/test-saju" element={<TestSajuPage />} />
<Route path="/saju-test" element={<SajuTestPage />} />
<Route path="/test-comprehensive" element={<TestComprehensiveScoresPage />} />
```

#### 데이터베이스 초기화:
```bash
# SQLite 데이터베이스 파일 삭제
rm packages/backend/services/calendar/calendar.db
rm packages/backend/services/diary/diary.db
rm packages/backend/services/saju-analysis/saju.db
```

### 2. 🔧 환경 설정

#### 필수 환경변수:
```env
# .env.production
NODE_ENV=production
VITE_API_URL=https://your-domain.com

# 백엔드 서비스별 환경변수
PORT=자동할당 (Railway/Heroku)
DATABASE_URL=프로덕션_DB_URL
JWT_SECRET=실제_시크릿_키
```

### 3. 🏗️ 빌드 및 최적화

#### 프론트엔드 빌드:
```bash
cd packages/web
npm run build
```

#### 백엔드 빌드:
```bash
cd packages/backend/services/calendar
npm run build

cd ../diary
npm run build

cd ../saju-analysis
npm run build
```

### 4. 🚀 배포 옵션

#### Option A: Railway (권장)
```yaml
# railway.yml
services:
  - name: web
    build: packages/web
    port: 4000

  - name: calendar-service
    build: packages/backend/services/calendar
    port: 4012

  - name: diary-service
    build: packages/backend/services/diary
    port: 4004
```

#### Option B: Vercel (프론트엔드) + Railway (백엔드)
- 프론트엔드: Vercel
- 백엔드: Railway 마이크로서비스

#### Option C: Cloudflare Pages + Workers
- Pages: React 앱
- Workers: API 서비스

### 5. ✅ 배포 전 최종 체크리스트

#### 코드 정리:
- [ ] 모든 `console.log` 제거
- [ ] 개발용 주석 제거
- [ ] 테스트 컴포넌트 제거
- [ ] 목업 데이터 제거

#### 보안:
- [ ] API 키 환경변수로 분리
- [ ] CORS 설정 확인
- [ ] Rate Limiting 설정
- [ ] SQL Injection 방지 확인

#### 성능:
- [ ] 이미지 최적화
- [ ] 코드 스플리팅 확인
- [ ] 캐싱 전략 설정
- [ ] CDN 설정

#### 기능 테스트:
- [ ] 회원가입/로그인
- [ ] 캘린더 CRUD
- [ ] 사주 분석
- [ ] 고객 관리
- [ ] 다이어리

### 6. 📝 배포 스크립트

#### deploy.sh:
```bash
#!/bin/bash
echo "🚀 운명나침반 프로덕션 배포 시작"

# 1. 테스트 파일 제거
rm -f packages/web/src/pages/Test*.tsx
rm -f packages/web/src/pages/SajuTestPage.tsx

# 2. 빌드
npm run build:all

# 3. 테스트
npm run test

# 4. 배포
npm run deploy:production

echo "✅ 배포 완료!"
```

### 7. 🔄 롤백 계획

문제 발생 시:
```bash
git revert HEAD
npm run deploy:rollback
```

### 8. 📊 모니터링

배포 후 확인:
- [ ] Error Tracking (Sentry)
- [ ] Analytics (Google Analytics)
- [ ] Performance Monitoring
- [ ] Uptime Monitoring

## 🎯 배포 목표

- **목표 날짜**: 2025-09-XX
- **다운타임**: 0분 (Blue-Green 배포)
- **성능 목표**:
  - First Contentful Paint < 1.5s
  - Time to Interactive < 3.5s
  - Lighthouse Score > 90

## ⚠️ 중요 사항

1. **데이터베이스 백업** 필수
2. **환경변수** 이중 확인
3. **테스트 서버**에서 먼저 배포
4. **점진적 배포** (10% → 50% → 100%)

---

**작성일**: 2025-09-26
**담당자**: 개발팀
**상태**: 준비 중