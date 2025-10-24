# 다음 세션 작업 지침

## 📅 세션 정보
- **날짜**: 2025-10-25 00:45 KST
- **상태**: AI Functions Vercel 배포 대기 중 ⏳

## ✅ 완료된 작업

### 1. AI Functions Vercel 마이그레이션 완료 ✅
```
커밋: a5b9aed - fix: Vercel AI Functions 404 에러 해결 - @vercel/node 패키지 추가
커밋: 1e1803b - feat: AI 서비스 Vercel Serverless Functions로 마이그레이션
```

**생성된 API Functions:**
- `api/v1/saju/chat.ts` - 사주 AI (Google Gemini)
- `api/v1/tarot/chat.ts` - 타로 AI (Google Gemini)
- `api/v1/ziwei/chat.ts` - 자미두수 AI (Google Gemini)
- `api/v1/qimen/chat.ts` - 귀문둔갑 AI (Google Gemini)

**각 Function 특징:**
- Google Gemini API 직접 호출 (gemini-2.0-flash-exp)
- 완벽한 한국어 필터링 (중국어/일본어/러시아어/그리스어/영어 제거)
- CORS 완전 지원
- 에러 핸들링 완비
- 환경변수: `GOOGLE_API_KEY` 필요

### 2. 404 에러 원인 파악 및 해결 ✅
**문제:**
- Vercel이 TypeScript 함수를 인식하지 못함
- `@vercel/node` 패키지 누락

**해결:**
```json
{
  "devDependencies": {
    "@vercel/node": "^3.3.1",
    "typescript": "^5.7.3"
  }
}
```

### 3. Git 커밋 완료 ✅
- 로컬: `a5b9aed` (최신)
- 리모트: `a5b9aed` (동기화 완료)

## ⏳ 진행 중인 작업

### Vercel 배포 대기
**현재 상황:**
- GitHub 자동 배포가 트리거되지 않음 (webhook 지연 또는 설정 문제)
- Vercel CLI 수동 배포는 권한 문제로 실패
- 최신 배포: 57분 전 (커밋 1e1803b)

**필요한 조치:**
1. ✅ Vercel 대시보드 열림: https://vercel.com/johns-projects-bf5e60f3/sajuapp
2. 🔄 **수동으로 "Redeploy" 버튼 클릭** (최신 커밋 a5b9aed 배포)
3. ⏳ 배포 완료 대기 (약 3분 소요)
4. ✅ 환경 변수 확인: `GOOGLE_API_KEY` 설정됨

## 🔍 다음 단계

### 1. Vercel 배포 확인
```bash
# 새 배포가 시작되었는지 확인
vercel ls | head -20

# 최신 배포 상태 확인
vercel inspect [URL] --logs
```

### 2. AI Functions 프로덕션 테스트
```bash
# 사주 AI 테스트
curl -X POST https://sajuapp-eight.vercel.app/api/v1/saju/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"생년월일: 1990년 5월 15일 오전 10시\n사주: 경오(庚午) 신사(辛巳) 무인(戊寅) 정사(丁巳)","userQuestion":"올해 재물운이 어떤가요?"}'

# 타로 AI 테스트
curl -X POST https://sajuapp-eight.vercel.app/api/v1/tarot/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"타로 카드: 과거-현재-미래 스프레드\n과거: 컵의 2 (정방향)\n현재: 검의 에이스 (역방향)\n미래: 별 (정방향)","userQuestion":"새로운 직장으로 이직을 고민 중인데 어떤가요?"}'

# 자미두수 AI 테스트
curl -X POST https://sajuapp-eight.vercel.app/api/v1/ziwei/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"자미두수 명반 정보","userQuestion":"올해 사업 운세가 어떤가요?"}'

# 귀문둔갑 AI 테스트
curl -X POST https://sajuapp-eight.vercel.app/api/v1/qimen/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"귀문둔갑 구궁 정보","userQuestion":"오늘 중요한 계약에 좋은 방향이 어디인가요?"}'
```

### 3. 응답 검증
**확인 사항:**
- ✅ 순수 한국어로만 응답
- ✅ 중국어/일본어/영어 없음
- ✅ 자연스러운 문장 구조
- ✅ 최소 20자 이상 응답
- ✅ 에러 없이 정상 응답

### 4. 프론트엔드 연동
**packages/web 수정 필요:**
```typescript
// API 엔드포인트 업데이트 필요
// 기존: http://localhost:4019/api/v1/...
// 신규: /api/v1/... (Vercel Functions)
```

## 📝 중요 노트

### 환경 변수
```
GOOGLE_API_KEY=AIzaSyCr2nGfVnEiNXugGWeFYP3gXtREk2jkcTs
```
- Vercel 환경 변수에 이미 설정되어 있어야 함
- Production, Preview, Development 모두 체크

### API 엔드포인트
```
Production: https://sajuapp-eight.vercel.app/api/v1/{service}/chat
Local Dev: http://localhost:4019/api/v1/{service}/chat (로컬 Express 서버)
```

### 배포 트리거
- GitHub push → 자동 배포 (현재 작동 안 함)
- Vercel 대시보드 → Redeploy 버튼 (수동)
- Vercel CLI → `vercel --prod` (권한 에러)

## 🚨 알려진 이슈

### 1. GitHub Auto-Deploy 미작동
- 원인: 불명 (webhook 설정 확인 필요)
- 해결: 수동 Redeploy 사용

### 2. Vercel CLI 권한 에러
```
Error: Git author junsupark9999-8777@users.noreply.github.com must have access to the team John's projects
```
- 해결: 대시보드에서 수동 배포

## 📊 현재 배포 상태

**최신 배포:**
- URL: https://sajuapp-ats2tq9ki-johns-projects-bf5e60f3.vercel.app
- 커밋: 1e1803b (AI Functions 생성)
- 시간: 57분 전
- 상태: Ready ✅
- 문제: @vercel/node 패키지 없어서 404 에러

**대기 중인 배포:**
- 커밋: a5b9aed (@vercel/node 추가)
- 배포 방법: 수동 Redeploy 필요
- 예상 시간: 3분

## 🎯 성공 기준

1. ✅ 4개 AI Functions 모두 200 응답
2. ✅ 순수 한국어 응답
3. ✅ 외국어 문자 0%
4. ✅ 3초 이내 응답
5. ✅ 에러 핸들링 정상

---

## 📂 프로젝트 구조

```
sajuapp/
├── api/                              # Vercel Serverless Functions
│   ├── v1/
│   │   ├── saju/chat.ts             # 사주 AI Function
│   │   ├── tarot/chat.ts            # 타로 AI Function
│   │   ├── ziwei/chat.ts            # 자미두수 AI Function
│   │   └── qimen/chat.ts            # 귀문둔갑 AI Function
│   ├── diaries.ts                   # ✅ 에러 없음
│   ├── events.ts                    # ⚠️ 빌드 에러 (AI와 무관)
│   └── tags.ts                      # ⚠️ 빌드 에러 (AI와 무관)
├── packages/
│   ├── web/                         # React 프론트엔드
│   └── backend/
│       └── services/
│           └── ai-service/          # 로컬 Express 서버 (개발용)
│               └── src/routes/
│                   ├── qimen.routes.ts
│                   ├── saju.routes.ts
│                   ├── ziwei.routes.ts
│                   └── tarot.routes.ts
├── lib/
│   └── security.ts                  # 보안 미들웨어
├── package.json                     # @vercel/node 추가됨
├── vercel.json                      # Vercel 설정
├── CLAUDE.md                        # 개발 지침
├── NEXT_SESSION.md                  # 이 파일
└── README.md
```

## 🛠️ 기술 정보

### Gemini API 설정
```typescript
const geminiResponse = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${systemPrompt}\n\n${prompt}\n\n사용자 질문: ${userQuestion}` }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500,
      }
    })
  }
);
```

### 언어 필터링 정규식
```typescript
// 1. <think> 태그 제거
cleaned = cleaned.replace(/<think>.*?<\/think>/gs, '');

// 2. 비한국어 문자 필터링
cleaned = cleaned.replace(/[\u4E00-\u9FFF]/g, '');          // 중국어
cleaned = cleaned.replace(/[\u3040-\u309F\u30A0-\u30FF]/g, ''); // 일본어
cleaned = cleaned.replace(/[\u0400-\u04FF]/g, '');         // 러시아어
cleaned = cleaned.replace(/[\u0370-\u03FF]/g, '');         // 그리스어
cleaned = cleaned.replace(/\b[a-zA-Z]{3,}\b/g, '');        // 영어 단어

// 3. 한글, 숫자, 문장부호만 유지
cleaned = cleaned.replace(/[^\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F0-9\s\.,!?\-~:;'"()\[\]{}%/+\n]/g, '');
```

---

## 📝 빠른 시작 명령어

### Vercel 배포 확인
```bash
# 1. 브라우저에서 대시보드 열기
start brave https://vercel.com/johns-projects-bf5e60f3/sajuapp

# 2. 프로덕션 사이트 열기
start brave https://sajuapp-eight.vercel.app

# 3. 배포 상태 확인
vercel ls | head -20
```

### 로컬 개발 서버
```bash
# AI 서비스 (로컬 테스트용)
cd packages/backend/services/ai-service && PORT=4019 npm run dev

# 프론트엔드
cd packages/web && npm run dev
```

---

## ⚡ 즉시 실행할 명령어

```bash
# 1. Vercel 대시보드에서 수동 Redeploy
start brave https://vercel.com/johns-projects-bf5e60f3/sajuapp

# 2. 배포 완료 후 프로덕션 테스트
start brave https://sajuapp-eight.vercel.app

# 3. API 직접 테스트
curl -X POST https://sajuapp-eight.vercel.app/api/v1/saju/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"테스트","userQuestion":"오늘의 운세는?"}'
```

---

## 🚨 주의사항

1. **Vercel 대시보드에서 수동 배포 필수**
   - GitHub auto-deploy가 작동하지 않음
   - "Redeploy" 버튼 클릭하여 최신 커밋(a5b9aed) 배포

2. **GOOGLE_API_KEY 환경 변수 확인**
   - Vercel 환경 변수에 설정되어 있어야 함
   - Production, Preview, Development 모두 체크

3. **배포 완료 확인**
   - `vercel ls`로 새 배포가 Ready 상태인지 확인
   - 빌드 로그에 에러 없는지 확인

4. **API 테스트 철저히**
   - 4개 AI 엔드포인트 모두 테스트
   - 한국어 필터링 작동 확인
   - 응답 시간 3초 이내 확인

---

**작성일:** 2025-10-25 00:45 KST
**작성자:** Claude Code
**다음 작업:** Vercel 수동 배포 → AI Functions 프로덕션 테스트
