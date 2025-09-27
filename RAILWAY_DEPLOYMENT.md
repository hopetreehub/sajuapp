# 🚂 Railway 배포 전략 (3개 개별 앱)

## 🎯 배포 전략: 3개의 독립 Railway 앱으로 분리

Railway의 무료 플랜 제한으로 인해 각 서비스를 별도의 앱으로 배포합니다.

## 📱 3개의 Railway 앱 생성

### 1️⃣ Calendar Service (fortune-calendar)
```bash
# GitHub 저장소: https://github.com/hopetreehub/sajuapp
# 배포 경로: packages/backend/services/calendar
# 포트: 4012
# Start Command: npm start
```

### 2️⃣ Diary Service (fortune-diary)
```bash
# GitHub 저장소: https://github.com/hopetreehub/sajuapp
# 배포 경로: packages/backend/services/diary
# 포트: 4004
# Start Command: npm start
```

### 3️⃣ Saju Analysis Service (fortune-saju)
```bash
# GitHub 저장소: https://github.com/hopetreehub/sajuapp
# 배포 경로: packages/backend/services/saju-analysis
# 포트: 4015
# Start Command: npm start
```

## 🔧 Railway 브라우저 배포 단계

### 각 서비스별 배포 (3번 반복):

1. **Railway 로그인**
   - https://railway.app 접속
   - junsupark9999@gmail.com 계정 로그인

2. **새 프로젝트 생성**
   - "New Project" 클릭
   - "Deploy from GitHub repo" 선택
   - hopetreehub/sajuapp 저장소 선택

3. **서비스별 설정**

   **Calendar Service:**
   - Project Name: fortune-calendar
   - Root Directory: packages/backend/services/calendar
   - Build Command: npm install && npm run build
   - Start Command: npm start
   - Environment Variables:
     ```
     PORT=4012
     NODE_ENV=production
     ```

   **Diary Service:**
   - Project Name: fortune-diary
   - Root Directory: packages/backend/services/diary
   - Build Command: npm install && npm run build
   - Start Command: npm start
   - Environment Variables:
     ```
     PORT=4004
     NODE_ENV=production
     ```

   **Saju Analysis Service:**
   - Project Name: fortune-saju
   - Root Directory: packages/backend/services/saju-analysis
   - Build Command: npm install && npm run build
   - Start Command: npm start
   - Environment Variables:
     ```
     PORT=4015
     NODE_ENV=production
     ```

4. **배포 확인**
   - 각 서비스의 Railway 대시보드에서 배포 상태 확인
   - Logs 탭에서 실행 로그 확인
   - 제공된 URL로 Health Check

## 🌐 배포 후 API URL

Railway에서 각 서비스별로 제공하는 URL:

- Calendar Service: https://fortune-calendar.up.railway.app
- Diary Service: https://fortune-diary.up.railway.app
- Saju Service: https://fortune-saju.up.railway.app

## 📝 프론트엔드 API URL 업데이트

`packages/web/src/services/api.ts` 파일 수정:

```typescript
const API_URLS = {
  calendar: process.env.NODE_ENV === 'production'
    ? 'https://fortune-calendar.up.railway.app/api'
    : 'http://localhost:4012/api',
  diary: process.env.NODE_ENV === 'production'
    ? 'https://fortune-diary.up.railway.app/api'
    : 'http://localhost:4004/api',
  saju: process.env.NODE_ENV === 'production'
    ? 'https://fortune-saju.up.railway.app/api'
    : 'http://localhost:4015/api'
};
```

## ⚠️ 주의사항

1. **무료 플랜 제한**
   - 각 앱당 $5 크레딧/월
   - 3개 앱 = 총 $15 크레딧
   - 초과 시 서비스 중단

2. **모니터링**
   - Railway 대시보드에서 사용량 확인
   - 비용 알림 설정 권장

3. **CORS 설정**
   - 각 백엔드 서비스에 Cloudflare Pages URL 추가
   - https://fortune-compass.pages.dev

## 🚀 배포 순서 요약

1. ✅ Cloudflare Pages 프론트엔드 배포 (완료)
2. ⏳ Railway에서 3개 백엔드 앱 생성 (대기중)
3. ⏳ API URL 업데이트 후 프론트엔드 재배포
4. ⏳ 전체 시스템 테스트

## 📊 현재 상태

- ✅ GitHub 저장소 준비 완료
- ✅ railway.toml 파일 생성 (하지만 개별 앱 방식으로 변경)
- ✅ 프론트엔드 Cloudflare Pages 배포
- ⏳ Railway 백엔드 3개 앱 배포 대기중