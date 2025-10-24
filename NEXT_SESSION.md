# 다음 세션 작업 지침 (2025-10-25 05:57 KST)

## 🎯 최우선 작업: Vercel에서 최신 커밋으로 새 배포 생성

### ⚠️ 핵심 문제
**Vercel "Redeploy" 버튼은 이전 배포를 재빌드하며, 최신 커밋을 가져오지 않음!**
- "Redeploy of 4ovatX334" → 이전 배포 재실행
- 최신 커밋 `8137cd7`이 배포되지 않음
- 결과: 수정사항 미반영, 동일한 빌드 에러 반복

---

## 📋 현재 상황

### ✅ 완료된 작업

1. **TypeScript 빌드 에러 수정** (커밋 `20e6690`)
   ```
   api/database/init-schema.ts - dotenv 제거, ESM → CommonJS 변환
   api/database/db.ts - 배열 null 처리 추가
   ```

2. **Vercel 설정 최적화**
   - `api/tsconfig.json` 생성 (커밋 `d5616ed`)
   - `vercel.json` buildCommand 간소화 (커밋 `b02a68e`)
   - **`vercel.json` framework 필드 제거 + rewrites 수정 (커밋 `8137cd7`)** ⭐

3. **Git 상태**
   - 최신 커밋: `8137cd7` "fix: Vercel 라우팅 수정 - API Functions 우선순위 확보"
   - 모든 변경사항 GitHub에 푸시 완료 ✅
   - origin/main과 동기화 완료 ✅

### ❌ 미해결 문제

#### 1. 최신 커밋이 배포되지 않음
- Vercel에서 "Redeploy" 클릭 시 → 이전 배포 재빌드
- 최신 커밋 `8137cd7` 미배포
- 빌드 로그에서 계속 동일한 에러:
  ```
  api/database/db.ts(428,9): error TS2345: Argument of type 'string[]'...
  api/database/init-schema.ts(14,24): error TS2307: Cannot find module 'dotenv'...
  ```
  → 이 에러들은 커밋 `20e6690`에서 **이미 수정됨**

#### 2. GitHub Webhook 미설정
- 자동 배포 트리거 없음
- 새 커밋 푸시 시 자동 배포 안 됨

---

## 🚀 다음 세션 실행 계획

### 1단계: 최신 커밋으로 새 배포 생성 ⭐ **필수**

#### 방법: Vercel 대시보드에서 수동 배포

```bash
# 1. Deployments 페이지 열기
start brave https://vercel.com/johns-projects-bf5e60f3/sajuapp/deployments
```

**대시보드 작업:**
1. **"Create Deployment"** 또는 **"Deploy"** 버튼 클릭
2. 설정:
   - **Branch**: `main` 선택
   - **Commit**: 최신 커밋 선택
     - SHA: `8137cd7`
     - 메시지: "fix: Vercel 라우팅 수정 - API Functions 우선순위 확보"
3. **Deploy** 클릭
4. 빌드 대기 (약 2분)

**빌드 성공 확인 사항:**
- ✅ TypeScript 에러 없음 (dotenv, db.ts 에러 해결)
- ✅ API Functions 빌드됨 (api/v1/tarot, saju, ziwei, qimen)
- ✅ 프론트엔드 빌드 성공

### 2단계: AI Functions 엔드포인트 테스트

배포 완료 후 4개 엔드포인트 테스트:

```bash
# Tarot AI
curl -X POST https://sajuapp-seven.vercel.app/api/v1/tarot/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"타로 카드 3장: 마법사, 여황제, 운명의 수레바퀴","userQuestion":"오늘의 운세는?"}' \
  -w "\n\nHTTP Status: %{http_code}\n"

# Saju AI
curl -X POST https://sajuapp-seven.vercel.app/api/v1/saju/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"사주 테스트","userQuestion":"오늘의 운세는?"}' \
  -w "\n\nHTTP Status: %{http_code}\n"

# Ziwei AI
curl -X POST https://sajuapp-seven.vercel.app/api/v1/ziwei/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"자미두수 테스트","userQuestion":"오늘의 운세는?"}' \
  -w "\n\nHTTP Status: %{http_code}\n"

# Qimen AI
curl -X POST https://sajuapp-seven.vercel.app/api/v1/qimen/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"귀문둔갑 테스트","userQuestion":"오늘의 운세는?"}' \
  -w "\n\nHTTP Status: %{http_code}\n"
```

**예상 결과:**
- ✅ HTTP 200 OK
- ✅ JSON 응답 (순수 한국어)
- ✅ `{"success": true, "response": "한국어 텍스트...", "provider": "google-gemini"}`

**만약 여전히 405/404:**
- vercel.json rewrites 문제 가능성
- 빌드 로그에서 API Functions 빌드 여부 재확인

### 3단계: GitHub Webhook 설정 (선택사항)

자동 배포를 위한 webhook 설정:

1. GitHub: https://github.com/hopetreehub/sajuapp/settings/hooks
2. Vercel Integration 연결 상태 확인
3. 테스트: 작은 변경사항 커밋 → 자동 배포 확인

---

## 📁 최신 코드 상태

### vercel.json (커밋 8137cd7) ⭐
```json
{
  "buildCommand": "npm run build --prefix packages/web",
  "outputDirectory": "packages/web/dist",
  "installCommand": "npm install",
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node@3.3.1"
    }
  },
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

**핵심 변경:**
- ❌ ~~`"framework": "vite"`~~ 제거 → API Functions 우선 라우팅
- ✅ rewrites: API 제외한 모든 요청 → SPA 라우팅

### api/tsconfig.json (커밋 d5616ed)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "types": ["node"]
  }
}
```

### api/database/init-schema.ts (커밋 20e6690)
- ✅ dotenv import 제거
- ✅ import.meta.url 제거
- ✅ CommonJS __dirname 사용

### api/database/db.ts (커밋 20e6690)
```typescript
// 배열 null 처리 추가
const tagsArray = data.tags && data.tags.length > 0 ? data.tags : null;
const imagesArray = data.images && data.images.length > 0 ? data.images : null;
```

---

## 🔧 문제 해결 로그

### 시도한 방법:
1. ✅ TypeScript 에러 수정 → 커밋 `20e6690`
2. ✅ vercel.json 최적화 → 커밋 `b02a68e`, `8137cd7`
3. ❌ GitHub auto-deploy → webhook 없음
4. ❌ "Redeploy" 버튼 → 이전 커밋 재배포 (문제!)
5. ❌ Vercel CLI → 권한 에러

### 해결책:
✅ **Vercel 대시보드에서 최신 커밋 수동 선택 배포**

---

## 📊 Git 커밋 히스토리

```
8137cd7 (HEAD -> main, origin/main) fix: Vercel 라우팅 수정 - API Functions 우선순위 확보 ⭐
b02a68e fix: vercel.json buildCommand 수정 - API Functions 빌드 활성화
d5616ed fix: Vercel API Functions 404 해결 - tsconfig.json 및 functions 설정 추가
3236ebc chore: README 업데이트 - Vercel 배포 트리거
60bcb39 chore: Vercel 자동 배포 트리거 - 최신 코드 반영
20e6690 fix: Vercel 빌드 에러 해결 - TypeScript 타입 및 ESM 이슈 수정
```

---

## 💡 빠른 시작 (다음 세션)

### 즉시 실행:

```bash
# 1. Vercel Deployments 페이지 열기
start brave https://vercel.com/johns-projects-bf5e60f3/sajuapp/deployments

# 2. "Create Deployment" 클릭 → 커밋 8137cd7 선택 → Deploy

# 3. 배포 완료 후 프로덕션 URL 열기
start brave https://sajuapp-seven.vercel.app

# 4. AI Functions 테스트 (위의 curl 명령 사용)
```

### 배포 검증:

```bash
# 최신 배포 확인
vercel ls | head -10

# 배포 상세 정보
vercel inspect [새_배포_URL]

# 빌드 로그 확인
# → Building 섹션에서 TypeScript 에러 없어야 함
# → Functions 탭에서 api/v1/* 함수들 빌드 확인
```

---

## 📝 중요 참고사항

### 환경 변수
- `GOOGLE_API_KEY`: Vercel에 설정되어 있어야 함
- Production, Preview, Development 모두 체크

### 배포 URL
- **프로덕션**: https://sajuapp-seven.vercel.app
- **대시보드**: https://vercel.com/johns-projects-bf5e60f3/sajuapp

### AI 엔드포인트
```
/api/v1/saju/chat    - 사주 AI (Google Gemini 2.0 Flash Exp)
/api/v1/tarot/chat   - 타로 AI
/api/v1/ziwei/chat   - 자미두수 AI
/api/v1/qimen/chat   - 귀문둔갑 AI
```

### 각 Function 특징
- Google Gemini API 직접 호출
- 순수 한국어 필터링 (중국어/일본어/러시아어/영어 제거)
- CORS 완전 지원
- 에러 핸들링 완비

---

## 🚨 알려진 이슈

### 1. Vercel "Redeploy" 버튼 문제
- **문제**: 최신 커밋이 아닌 이전 배포 재빌드
- **증상**: "Redeploy of [이전_배포_ID]" 메시지
- **해결**: "Create Deployment"로 최신 커밋 명시 선택

### 2. GitHub Auto-Deploy 미작동
- **문제**: Webhook 미설정 또는 작동 안 함
- **해결**: 수동 배포 사용

### 3. Vercel CLI 권한 에러
```
Error: Git author junsupark9999-8777@users.noreply.github.com
must have access to the team John's projects
```
- **해결**: 대시보드 사용

---

## 🎯 성공 기준

1. ✅ 빌드 에러 없음 (TypeScript 컴파일 성공)
2. ✅ 4개 AI Functions 모두 200 OK 응답
3. ✅ 순수 한국어 응답 (외국어 0%)
4. ✅ 3초 이내 응답 시간
5. ✅ 에러 핸들링 정상

---

**작성일**: 2025-10-25 05:57 KST
**현재 상태**: 최신 커밋 배포 대기 중
**다음 작업**: Vercel 대시보드에서 커밋 8137cd7로 새 배포 생성
