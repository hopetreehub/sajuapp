# 🚀 운명나침반 배포 가이드

## 📋 배포 현황

### ✅ 프론트엔드 (Cloudflare Pages)
- **상태**: ✅ 배포 완료
- **URL**: https://56da5d50.fortune-compass.pages.dev
- **프로젝트명**: fortune-compass
- **계정**: junsupark9999@gmail.com

### ⏳ 백엔드 (Railway)
- **상태**: 대기 중 (브라우저 로그인 필요)
- **서비스**:
  - Calendar Service (포트 4012)
  - Diary Service (포트 4004)
  - Saju Analysis Service (포트 4015)

## 🔧 배포 명령어

### Cloudflare Pages 재배포
```bash
cd packages/web
npm run build
npx wrangler pages deploy dist --project-name=fortune-compass --commit-dirty=true
```

### Railway 배포 (브라우저 필요)
1. 브라우저에서 Railway 로그인: https://railway.app
2. 계정: junsupark9999@gmail.com
3. New Project → Deploy from GitHub repo
4. Repository: https://github.com/hopetreehub/sajuapp
5. Railway가 railway.toml 파일을 자동 감지하여 서비스 배포

## 🌐 프로덕션 URL
- **프론트엔드**: https://fortune-compass.pages.dev (곧 활성화)
- **백엔드 API**: Railway 배포 후 제공

## 📝 환경 변수 설정

### Cloudflare Pages
프론트엔드는 환경 변수가 필요 없음 (현재 로컬 스토리지 사용)

### Railway
각 서비스별 환경 변수:
- `PORT`: 자동 설정됨
- `DATABASE_URL`: SQLite 파일 경로 (자동)

## ⚠️ 주의사항
1. 프론트엔드는 백엔드 API URL이 하드코딩되어 있음
2. Railway 배포 후 API URL 업데이트 필요
3. CORS 설정 확인 필요

## 📊 현재 상태
- ✅ GitHub 저장소 연결 완료
- ✅ 프론트엔드 빌드 성공
- ✅ Cloudflare Pages 배포 완료
- ⏳ Railway 백엔드 배포 대기 중

## 🔄 다음 단계
1. Railway 브라우저 로그인
2. GitHub 저장소 연결
3. 백엔드 서비스 배포
4. API URL을 프론트엔드에 업데이트
5. 환경 변수로 API URL 관리