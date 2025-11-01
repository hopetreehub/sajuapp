# 🔮 AI 챗 통합 점검 및 수정 작업지시서

**작성일**: 2025-11-02
**작성자**: Claude Code
**프로젝트**: 운명나침반 (SajuApp)
**목적**: 모든 AI 챗의 정확한 연결 및 목업 제거

---

## 📊 현황 조사 결과

### ✅ AI 챗 컴포넌트 현황

| AI 챗 | 컴포넌트 | API 엔드포인트 | 상태 |
|--------|----------|---------------|------|
| **사주 AI** | `SajuAIChat.tsx:308` | `/api/sajuChat` | ✅ 연결됨 |
| **귀문둔갑 AI** | `qimen/AIChat.tsx:137` | `/api/qimenChat` | ✅ 연결됨 |
| **타로 AI** | `TarotAIChat.tsx:198` | `/api/tarotChat` | ✅ 연결됨 |
| **자미두수 AI** | `ZiweiAIChat.tsx:296` | `/api/ziweiChat` | ✅ 연결됨 |

### 🔍 API Functions 구조

모든 AI 챗은 **동일한 우선순위 시스템** 사용:

```typescript
// 파일: packages/web/api/utils/aiProvider.ts
export async function callAIWithPriority(
  systemPrompt: string,
  userPrompt: string
): Promise<AIResponse> {
  // 우선순위:
  // 1. OpenAI GPT-4o (OPENAI_API_KEY 필요)
  // 2. Google Gemini 2.0 Flash (GOOGLE_API_KEY 필요)
  // 3. DeepInfra Llama 3.1 (DEEPINFRA_API_KEY 필요)
}
```

### ⚠️ 발견된 문제점

#### 🚨 문제 1: 목업 응답 발생 원인
**증상**: 사용자가 "목업만 나온다"고 보고
**원인**:
1. ❌ 환경 변수 미설정 또는 유효하지 않음
2. ❌ API 키 만료 또는 잘못된 키
3. ❌ 네트워크 에러로 인한 폴백

**확인 방법**:
```typescript
// aiProvider.ts:149-151
const enabledProviders = providers
  .filter(p => p.enabled) // ← 환경 변수 체크
  .sort((a, b) => a.priority - b.priority);

// 모든 provider.enabled가 false면 → 목업 응답
```

#### 🔧 문제 2: 에러 핸들링 부족
**위치**: 각 AI 챗 컴포넌트
**문제**: API 실패 시 사용자에게 명확한 메시지 없음

**현재 코드 (SajuAIChat.tsx:330-346)**:
```typescript
const data = await response.json();

if (!data.success || !data.response) {
  throw new Error(data.error || 'AI 응답 생성 실패');
}

// ❌ 목업 응답인지 실제 AI인지 사용자가 모름
```

#### 🎯 문제 3: 사주 데이터 전달 누락 가능성
**위치**: `SajuAIChat.tsx:308-316`
**문제**: 프롬프트에 사주 데이터가 포함되지만, 검증 없음

---

## 🎯 작업 목표

### Phase 1: 환경 변수 및 API 키 확인 (최우선)
1. Vercel 환경 변수 확인
2. 로컬 개발 환경 `.env` 확인
3. API 키 유효성 테스트

### Phase 2: 에러 핸들링 개선
1. API 실패 시 명확한 에러 메시지
2. 목업 vs 실제 AI 구분 UI 표시
3. 재시도 버튼 추가

### Phase 3: 사주 데이터 정확성 검증
1. 각 AI 챗의 프롬프트에 사주 데이터 정확히 전달되는지 확인
2. 프롬프트 품질 개선

### Phase 4: 통합 테스트
1. 각 AI 챗에서 실제 질문 테스트
2. 응답 시간 측정
3. 응답 품질 평가

---

## 📋 상세 작업 지침

### ✅ Task 1: 환경 변수 확인 및 설정

#### 1-1. Vercel 환경 변수 확인
```bash
# Vercel Dashboard에서 확인
https://vercel.com/johns-projects-bf5e60f3/sajuapp/settings/environment-variables

# 필요한 환경 변수:
- OPENAI_API_KEY (선택)
- GOOGLE_API_KEY (필수 - 무료)
- DEEPINFRA_API_KEY (선택)
- NODE_ENV=production
```

#### 1-2. 로컬 개발 환경 `.env` 파일 생성
```bash
# 파일 위치: packages/web/.env

# Google Gemini API (무료, 권장)
GOOGLE_API_KEY=your_gemini_api_key_here

# OpenAI GPT-4o (유료, 선택사항)
OPENAI_API_KEY=your_openai_api_key_here

# DeepInfra (백업용, 선택사항)
DEEPINFRA_API_KEY=your_deepinfra_api_key_here
```

#### 1-3. Google Gemini API 키 발급 방법
```
1. https://aistudio.google.com/app/apikey 접속
2. "Create API Key" 클릭
3. 프로젝트 선택 또는 새로 생성
4. API 키 복사
5. .env 파일에 추가
```

---

### ✅ Task 2: API 키 유효성 테스트

#### 2-1. API 키 테스트 스크립트 생성
**파일**: `packages/web/scripts/test-ai-apis.ts` (신규)

```typescript
/**
 * AI API 키 유효성 테스트
 */

async function testGeminiAPI() {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.error('❌ GOOGLE_API_KEY가 설정되지 않았습니다');
    return false;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: '안녕하세요' }]
          }]
        })
      }
    );

    if (response.ok) {
      console.log('✅ Google Gemini API 정상 작동');
      return true;
    } else {
      console.error('❌ Google Gemini API 오류:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Google Gemini API 연결 실패:', error);
    return false;
  }
}

async function testOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn('⚠️  OPENAI_API_KEY가 설정되지 않았습니다 (선택사항)');
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: '안녕' }],
        max_tokens: 10,
      })
    });

    if (response.ok) {
      console.log('✅ OpenAI API 정상 작동');
      return true;
    } else {
      console.error('❌ OpenAI API 오류:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ OpenAI API 연결 실패:', error);
    return false;
  }
}

async function main() {
  console.log('🔍 AI API 키 유효성 테스트 시작...\n');

  const geminiResult = await testGeminiAPI();
  const openaiResult = await testOpenAI();

  console.log('\n📊 테스트 결과:');
  console.log(`Google Gemini: ${geminiResult ? '✅ 정상' : '❌ 실패'}`);
  console.log(`OpenAI: ${openaiResult === null ? '⚠️  미설정' : openaiResult ? '✅ 정상' : '❌ 실패'}`);

  if (!geminiResult && !openaiResult) {
    console.error('\n🚨 모든 AI API가 작동하지 않습니다!');
    console.error('최소 하나의 API 키를 설정해야 합니다.');
    process.exit(1);
  } else {
    console.log('\n✅ AI API 준비 완료!');
  }
}

main();
```

#### 2-2. 테스트 실행
```bash
# Node.js로 실행
cd packages/web
node -r dotenv/config scripts/test-ai-apis.ts

# 또는 tsx로 실행
npx tsx scripts/test-ai-apis.ts
```

---

### ✅ Task 3: 에러 핸들링 개선

#### 3-1. AI 응답 상태 표시 컴포넌트 추가
**파일**: `SajuAIChat.tsx` (수정)

```typescript
// 🎯 추가: AI 상태 표시
interface AIStatus {
  isUsingMock: boolean;
  provider?: string;
  model?: string;
  error?: string;
}

const [aiStatus, setAIStatus] = useState<AIStatus | null>(null);

// API 호출 부분 수정
const data = await response.json();

if (!data.success || !data.response) {
  setAIStatus({
    isUsingMock: true,
    error: data.error || 'AI 응답 생성 실패',
  });
  throw new Error(data.error || 'AI 응답 생성 실패');
}

// ✅ 실제 AI 사용 중임을 표시
setAIStatus({
  isUsingMock: false,
  provider: data.provider, // 'google-gemini' or 'openai'
  model: data.model, // 'gemini-2.0-flash-exp' or 'gpt-4o'
});

// UI에 표시
{aiStatus && !aiStatus.isUsingMock && (
  <div className="text-xs text-gray-500 mt-2">
    🤖 {aiStatus.provider} ({aiStatus.model})
  </div>
)}

{aiStatus && aiStatus.isUsingMock && (
  <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
    ⚠️  AI 연결 실패: {aiStatus.error}
  </div>
)}
```

#### 3-2. 재시도 버튼 추가
```typescript
const handleRetry = async () => {
  // 실패한 질문 다시 시도
  if (lastFailedQuestion) {
    await handleSendMessage(lastFailedQuestion);
  }
};

// UI
{aiStatus?.isUsingMock && (
  <button
    onClick={handleRetry}
    className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
  >
    🔄 다시 시도
  </button>
)}
```

---

### ✅ Task 4: 사주 데이터 전달 검증

#### 4-1. 프롬프트에 사주 데이터 포함 여부 확인
**파일**: `SajuAIChat.tsx:40-150`

**체크리스트**:
- [ ] `fourPillars` (사주팔자) 전달됨
- [ ] `fiveElements` (오행 균형) 전달됨
- [ ] `tenGods` (십성 분포) 전달됨
- [ ] `daewoon` (대운) 계산 및 전달됨
- [ ] `sewoon` (세운) 계산 및 전달됨
- [ ] `monthlyFortune` (월운) 계산 및 전달됨
- [ ] `dailyFortune` (일운) 계산 및 전달됨

**확인 방법**:
```typescript
// SajuAIChat.tsx:87-150
const prompt = `당신은 30년 경력의 사주명리학 전문가입니다. ${customer.name}님에게 친구처럼 편하게 조언하듯 자연스럽게 대화하세요.

🙋 고객 정보:
...

🔮 사주팔자 (四柱八字):
- 년주(年柱): ${fourPillars.year.combined}
- 월주(月柱): ${fourPillars.month.combined}
- 일주(日柱): ${fourPillars.day.combined}
- 시주(時柱): ${fourPillars.hour.combined}

⚖️ 오행 균형 (五行均衡):
${fiveElementsStr}

🎭 십성 분포 (十星分布):
${tenGodsStr}

🌊 현재 운세 (運勢):
- 대운(大運): ${daewoon ? `${daewoon.combined}` : '계산 불가'}
- 세운(歲運): ${sewoon.combined}
- 월운(月運): ${monthlyFortune}점
- 일운(日運): ${dailyPillar.combined} (${dailyFortune}점)
`;
```

#### 4-2. 콘솔 로그로 프롬프트 확인
```typescript
// 디버깅용 (개발 환경에서만)
if (import.meta.env.DEV) {
  console.log('📤 [AI 프롬프트]', aiPrompt);
}
```

---

### ✅ Task 5: 통합 테스트

#### 5-1. 각 AI 챗 테스트 시나리오

##### 사주 AI 챗 테스트
```
질문 1: "오늘의 운세는?"
예상 응답: 일운 정보 기반 조언

질문 2: "올해 재물운은?"
예상 응답: 세운 + 재성 십성 기반 조언

질문 3: "내 사주의 특징은?"
예상 응답: 사주팔자 + 오행 균형 종합 분석
```

##### 귀문둔갑 AI 챗 테스트
```
질문 1: "오늘 중요한 미팅이 있는데 괜찮을까요?"
예상 응답: 궁합 국 정보 기반 조언

질문 2: "이번 주 좋은 날은?"
예상 응답: 일진 분석 기반 조언
```

##### 타로 AI 챗 테스트
```
질문 1: "연애운을 봐주세요"
예상 응답: 뽑은 카드 기반 해석

질문 2: "새로운 시작이 잘될까요?"
예상 응답: 카드 조합 해석
```

##### 자미두수 AI 챗 테스트
```
질문 1: "올해 전반적인 운세는?"
예상 응답: 명궁 + 12궁 종합 분석

질문 2: "재물운이 궁금합니다"
예상 응답: 재백궁 분석
```

#### 5-2. 테스트 결과 기록

**템플릿**:
```markdown
## [AI 챗 이름] 테스트 결과

### 질문 1: [질문 내용]
- **응답 시간**: [초]
- **AI 제공자**: Google Gemini / OpenAI GPT-4o
- **응답 품질**: ⭐⭐⭐⭐⭐ (5점 만점)
- **사주 데이터 반영**: ✅ / ❌
- **문제점**: [발견된 문제]

### 질문 2: [질문 내용]
...
```

---

## 🚨 예상 문제 및 해결 방안

### 문제 1: "목업만 나온다"
**원인**: 환경 변수 미설정
**해결**:
1. `.env` 파일 생성 및 GOOGLE_API_KEY 추가
2. Vercel 환경 변수 설정
3. 재배포

### 문제 2: "응답이 너무 느리다"
**원인**: OpenAI GPT-4o 사용 중 (10-15초)
**해결**:
1. Google Gemini 우선순위 높이기
2. 또는 Gemini만 사용

### 문제 3: "응답에 사주 정보가 없다"
**원인**: 프롬프트에 데이터 누락
**해결**:
1. `generateSajuAIPrompt()` 함수 검증
2. 콘솔 로그로 프롬프트 확인
3. 프롬프트 품질 개선

### 문제 4: "API 할당량 초과"
**원인**: Gemini 무료 플랜 제한 (분당 15회)
**해결**:
1. 캐싱 시스템 활용 (`sajuCacheManager`)
2. 동일한 질문 재사용
3. Rate Limiting 구현

---

## 📈 성공 기준

### ✅ Phase 1 완료 조건
- [ ] 최소 1개 이상의 AI API 키 설정 완료
- [ ] `test-ai-apis.ts` 스크립트 모두 통과

### ✅ Phase 2 완료 조건
- [ ] 모든 AI 챗에서 실제 AI 응답 확인
- [ ] 에러 발생 시 명확한 메시지 표시
- [ ] 재시도 버튼 동작 확인

### ✅ Phase 3 완료 조건
- [ ] 각 AI 챗의 프롬프트에 사주 데이터 정확히 전달
- [ ] 콘솔 로그로 프롬프트 검증

### ✅ Phase 4 완료 조건
- [ ] 4개 AI 챗 모두 실제 질문 테스트 통과
- [ ] 응답 품질 4점 이상 (5점 만점)
- [ ] 사주 데이터 정확히 반영됨

---

## 📝 작업 순서 (권장)

```
1단계: 환경 변수 설정 (30분)
   ├─ Google Gemini API 키 발급
   ├─ .env 파일 생성
   └─ Vercel 환경 변수 설정

2단계: API 키 테스트 (15분)
   ├─ test-ai-apis.ts 스크립트 생성
   └─ 테스트 실행 및 확인

3단계: 브라우저 테스트 (30분)
   ├─ 사주 AI 챗 테스트
   ├─ 귀문둔갑 AI 챗 테스트
   ├─ 타로 AI 챗 테스트
   └─ 자미두수 AI 챗 테스트

4단계: 에러 핸들링 개선 (60분)
   ├─ AI 상태 표시 컴포넌트 추가
   ├─ 재시도 버튼 구현
   └─ 에러 메시지 개선

5단계: 프롬프트 품질 검증 (30분)
   ├─ 콘솔 로그로 프롬프트 확인
   ├─ 사주 데이터 전달 검증
   └─ 필요시 프롬프트 개선

6단계: 최종 통합 테스트 (30분)
   ├─ 전체 시나리오 재테스트
   ├─ 테스트 결과 문서화
   └─ Git 커밋 및 배포
```

**예상 총 소요 시간**: 약 3시간

---

## 🎯 최종 목표

### 배포 전 필수 체크리스트
- [ ] 모든 AI 챗에서 실제 AI 응답 확인
- [ ] 환경 변수 Vercel에 설정 완료
- [ ] 에러 핸들링 UI 개선 완료
- [ ] 사주 데이터 정확히 반영 확인
- [ ] 응답 품질 만족 (4점 이상)
- [ ] 테스트 문서 작성 완료

### 배포 후 모니터링
- [ ] 프로덕션에서 AI 응답 정상 동작 확인
- [ ] API 호출 성공률 모니터링
- [ ] 사용자 피드백 수집
- [ ] 필요시 프롬프트 개선

---

**작업 완료 시 이 문서를 업데이트하고, Git에 커밋해주세요.**

```bash
git add AI_CHAT_INTEGRATION_WORK_INSTRUCTIONS.md
git commit -m "docs: AI 챗 통합 점검 작업지시서 작성"
```

---

**문의사항이나 문제 발생 시:**
- Claude Code에게 질문
- 작업지시서 참조
- 테스트 결과 문서화

**Good Luck! 🚀**
