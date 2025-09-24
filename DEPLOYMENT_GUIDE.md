# 🚀 운명나침반 앱 배포 가이드

## 📋 배포 전략 개요

### 🎯 추천 배포 구성
- **Frontend**: Vercel (React/Vite 최적화)
- **Backend Services**: Railway 또는 Render (마이크로서비스 지원)
- **Database**: PostgreSQL (SQLite → 마이그레이션)

## 🔧 1단계: Vercel 프론트엔드 배포

### 사전 준비
```bash
# Vercel CLI 설치
npm install -g vercel

# 프로젝트 루트에서 실행
cd packages/web
```

### vercel.json 설정 파일
```json
{
  "version": 2,
  "name": "sajuapp-frontend",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend-url.railway.app/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "https://your-backend-url.railway.app"
  }
}
```

### 배포 명령어
```bash
# 프론트엔드 디렉토리에서
cd packages/web
vercel --prod
```

## 🛠️ 2단계: Railway 백엔드 배포

### Railway.app 설정

1. **각 서비스별 railway.toml 생성**

#### Calendar Service (packages/backend/services/calendar/railway.toml)
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm run start"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"

[variables]
PORT = "8080"
NODE_ENV = "production"
DATABASE_URL = "${{ DATABASE_URL }}"
```

#### Diary Service (packages/backend/services/diary/railway.toml)
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm run start"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"

[variables]
PORT = "8081"
NODE_ENV = "production"
DATABASE_URL = "${{ DATABASE_URL }}"
```

#### Saju Analysis Service (packages/backend/services/saju-analysis/railway.toml)
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm run start"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"

[variables]
PORT = "8082"
NODE_ENV = "production"
DATABASE_URL = "${{ DATABASE_URL }}"
```

### 2. **package.json 스크립트 추가**
각 서비스에 다음 스크립트 추가:
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "npx tsc",
    "dev": "npx ts-node --transpile-only src/index.ts"
  }
}
```

## 📊 3단계: 데이터베이스 마이그레이션

### PostgreSQL 스키마 생성
```sql
-- customers 테이블
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    birth_time TIME,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    calendar_type VARCHAR(10) CHECK (calendar_type IN ('solar', 'lunar')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- events 테이블
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    all_day BOOLEAN DEFAULT FALSE,
    color VARCHAR(7) DEFAULT '#3b82f6',
    tag_id INTEGER,
    customer_id INTEGER REFERENCES customers(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- diary_entries 테이블
CREATE TABLE diary_entries (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    mood VARCHAR(50),
    content TEXT,
    customer_id INTEGER REFERENCES customers(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 데이터 마이그레이션 스크립트
```javascript
// migration.js
const sqlite3 = require('sqlite3');
const { Pool } = require('pg');

const migrateData = async () => {
  const sqliteDb = new sqlite3.Database('./saju.db');
  const pgPool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  // customers 마이그레이션
  sqliteDb.all("SELECT * FROM customers", async (err, rows) => {
    for (const row of rows) {
      await pgPool.query(
        'INSERT INTO customers (id, name, birth_date, birth_time, gender, calendar_type) VALUES ($1, $2, $3, $4, $5, $6)',
        [row.id, row.name, row.birthDate, row.birthTime, row.gender, row.calendarType]
      );
    }
  });

  console.log('Migration completed');
};

migrateData();
```

## ⚙️ 4단계: 환경 변수 설정

### Vercel 환경 변수
```bash
# Vercel 대시보드에서 설정
VITE_API_URL=https://your-backend-url.railway.app
VITE_CALENDAR_SERVICE_URL=https://calendar-service.railway.app
VITE_DIARY_SERVICE_URL=https://diary-service.railway.app
VITE_SAJU_SERVICE_URL=https://saju-service.railway.app
```

### Railway 환경 변수
```bash
# 각 서비스별 설정
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

## 🔒 5단계: 보안 설정

### CORS 설정 업데이트
```typescript
// src/index.ts (각 백엔드 서비스)
app.use(cors({
  origin: [
    'https://your-vercel-app.vercel.app',
    'http://localhost:4000' // 개발용
  ],
  credentials: true
}));
```

### API 키 보안
```typescript
// 환경변수로 API 키 관리
const API_KEY = process.env.API_KEY;
```

## 📈 6단계: 모니터링 및 로깅

### Railway 모니터링
- CPU/메모리 사용량 확인
- 로그 모니터링
- 에러 추적

### Vercel Analytics
```javascript
// packages/web/src/main.tsx
import { Analytics } from '@vercel/analytics/react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>
);
```

## 🚀 배포 체크리스트

### 프론트엔드 (Vercel)
- [ ] vercel.json 설정 완료
- [ ] 환경 변수 설정
- [ ] 빌드 에러 없음
- [ ] API 프록시 설정 확인

### 백엔드 (Railway)
- [ ] railway.toml 설정 완료
- [ ] PostgreSQL 연결 확인
- [ ] CORS 설정 업데이트
- [ ] Health check 엔드포인트 추가
- [ ] 환경 변수 설정

### 데이터베이스
- [ ] PostgreSQL 스키마 생성
- [ ] SQLite 데이터 마이그레이션
- [ ] 백업 전략 수립

### 도메인 설정
- [ ] 커스텀 도메인 연결 (선택사항)
- [ ] SSL 인증서 확인
- [ ] DNS 설정

## 💰 비용 예상

### 무료 티어 (소규모)
- **Vercel**: 무료 (개인용)
- **Railway**: $5/월 (기본 플랜)
- **총 비용**: ~$5/월

### 프로덕션 (확장)
- **Vercel Pro**: $20/월
- **Railway Scale**: $20-50/월
- **총 비용**: $40-70/월

## 🔧 트러블슈팅

### 자주 발생하는 문제
1. **CORS 에러**: 백엔드 CORS 설정 확인
2. **빌드 실패**: TypeScript 에러 해결
3. **API 연결 실패**: 환경 변수 URL 확인
4. **포트 충돌**: Railway 포트 설정 확인

### 해결 방법
```bash
# 로그 확인
railway logs
vercel logs

# 환경 변수 확인
railway variables
vercel env ls
```

---

**작성일**: 2025년 9월 23일
**상태**: ✅ 작성 완료
**우선순위**: 🔴 높음
**예상 배포 시간**: 2-3시간