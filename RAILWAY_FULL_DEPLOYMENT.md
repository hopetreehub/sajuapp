# 🚂 Railway 통합 배포 가이드 (프론트엔드 + 백엔드)

## ✅ Railway로 모든 서비스 배포하기

Railway는 **프론트엔드와 백엔드를 모두 배포**할 수 있는 플랫폼입니다!

### 🏗️ Railway 프로젝트 구조

```
Railway 프로젝트
├── sajuapp-frontend (React/Vite)
├── calendar-service (Node.js)
├── diary-service (Node.js)
├── saju-analysis-service (Node.js)
└── PostgreSQL Database
```

## 📦 1. Railway에 모든 서비스 배포

### 🎨 프론트엔드 배포 (React/Vite)

1. **Railway CLI 설치**
```bash
npm install -g @railway/cli
```

2. **프론트엔드 배포**
```bash
cd packages/web
railway login
railway link  # 새 프로젝트 생성 또는 기존 프로젝트 연결
railway up    # 자동 배포
```

3. **환경 변수 설정 (Railway 대시보드)**
```
VITE_API_URL=내부 서비스 URL
VITE_CALENDAR_SERVICE_URL=calendar-service.railway.internal
VITE_DIARY_SERVICE_URL=diary-service.railway.internal
VITE_SAJU_SERVICE_URL=saju-service.railway.internal
```

### 🔧 백엔드 서비스 배포

각 서비스별로 동일한 방식으로 배포:

```bash
# Calendar Service
cd packages/backend/services/calendar
railway up

# Diary Service
cd packages/backend/services/diary
railway up

# Saju Analysis Service
cd packages/backend/services/saju-analysis
railway up
```

## 🌐 2. Railway 내부 네트워크 활용

### Private Networking (무료!)
Railway는 **내부 네트워크**를 제공하여 서비스 간 통신이 빠르고 안전합니다.

```javascript
// 프론트엔드에서 백엔드 호출
// 외부 URL 대신 내부 URL 사용 가능
const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://calendar-service.railway.internal'  // 내부 네트워크
  : 'http://localhost:4012';
```

## 💰 3. 비용 비교

### Railway만 사용 (통합 관리)
```
✅ 장점:
- 한 곳에서 모든 서비스 관리
- 내부 네트워크로 빠른 통신
- 통합 모니터링/로깅
- 환경 변수 공유 쉬움
- 단일 결제

💵 비용:
- Hobby: $5/월 (500시간 무료)
- Pro: $20/월 (무제한)
```

### Vercel + Railway (분리)
```
⚠️ 단점:
- 두 플랫폼 관리 필요
- 외부 네트워크 통신 (느림)
- 별도 결제
- CORS 설정 복잡

💵 비용:
- Vercel: $0-20/월
- Railway: $5-20/월
- 총: $5-40/월
```

## 🚀 4. Railway 배포 명령어

### 한 번에 모든 서비스 배포
```bash
# 루트에 railway.json 생성
{
  "version": 1,
  "services": [
    {
      "name": "frontend",
      "root": "packages/web"
    },
    {
      "name": "calendar-service",
      "root": "packages/backend/services/calendar"
    },
    {
      "name": "diary-service",
      "root": "packages/backend/services/diary"
    },
    {
      "name": "saju-service",
      "root": "packages/backend/services/saju-analysis"
    }
  ]
}
```

그 후:
```bash
railway up --service frontend
railway up --service calendar-service
railway up --service diary-service
railway up --service saju-service
```

## 📊 5. Railway 대시보드 활용

### 모니터링
- CPU/메모리 실시간 모니터링
- 로그 스트리밍
- 배포 히스토리
- 롤백 기능

### 스케일링
```bash
# 인스턴스 늘리기
railway scale --replicas 3 --service frontend
```

## 🔒 6. 보안 설정

### 환경 변수 그룹
Railway에서 환경 변수를 그룹으로 관리:
```
[공통 변수]
NODE_ENV=production
DATABASE_URL=postgresql://...

[프론트엔드 전용]
VITE_API_URL=...

[백엔드 전용]
JWT_SECRET=...
```

## ✅ Railway 선택 시 장점

1. **통합 관리**: 한 곳에서 모든 서비스 관리
2. **내부 네트워크**: 빠르고 안전한 서비스 간 통신
3. **자동 SSL**: 모든 서비스에 HTTPS 자동 제공
4. **GitHub 연동**: Push하면 자동 배포
5. **데이터베이스 포함**: PostgreSQL, Redis 등 제공
6. **모니터링 내장**: 별도 도구 불필요
7. **한국어 지원**: 일부 문서 한국어 제공

## 🎯 결론: Railway 추천!

**Railway에서 프론트엔드와 백엔드를 모두 배포**하는 것이 가장 효율적입니다:

- ✅ 관리 편의성
- ✅ 비용 효율성
- ✅ 성능 최적화
- ✅ 통합 모니터링

Vercel은 정적 사이트에는 좋지만, **풀스택 앱은 Railway가 더 적합**합니다.

---

**작성일**: 2025년 9월 23일
**추천도**: ⭐⭐⭐⭐⭐
**난이도**: 쉬움
**예상 시간**: 1시간