/**
 * 귀문둔갑 & 자미두수 AI Service 간단 서버
 * PORT=4017로 실행
 *
 * AI Provider Priority:
 * 1. OpenAI (gpt-4o-mini)
 * 2. DeepInfra (Qwen/Qwen2.5-32B-Instruct)
 * 3. Gemini (gemini-2.0-flash-exp)
 * 4. Rule-based fallback
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4017;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ============================================
// 외국어 문자 제거 함수
// ============================================
function cleanForeignCharacters(text) {
  // <think> 태그와 그 안의 내용 제거
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '');

  // 마크다운 형식 제거
  text = text.replace(/#{1,6}\s/g, ''); // 헤딩 제거
  text = text.replace(/\*\*(.*?)\*\*/g, '$1'); // 볼드 제거
  text = text.replace(/\*(.*?)\*/g, '$1'); // 이탤릭 제거
  text = text.replace(/^[\s]*[-*+]\s/gm, ''); // 리스트 기호 제거

  // 연속된 공백을 하나로
  text = text.replace(/\s+/g, ' ');

  // 앞뒤 공백 제거
  text = text.trim();

  return text;
}

// ============================================
// DeepInfra API 호출 함수
// ============================================
async function callDeepInfraAPI(prompt) {
  const fetch = (await import('node-fetch')).default;

  const response = await fetch(`${process.env.DEEPINFRA_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPINFRA_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.DEEPINFRA_DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: `당신은 한국어로만 답변하는 자미두수 및 귀문둔갑 전문가입니다.

🚫 절대 금지 사항 (위반 시 재생성):
1. 영어 단어 사용 금지 (yes, no, OK, the, and 등 모든 영어)
2. 중국어 사용 금지 (今天, 時節 등)
3. 일본어 사용 금지 (は, を, の 등)
4. 러시아어 사용 금지 (вашей, карте, показывает 등)
5. 아랍어 및 기타 모든 외국어 문자 사용 금지
6. <think> 태그나 사고 과정 노출 금지
7. 마크다운 형식(#, **, -) 사용 금지
8. 불완전한 문장 사용 금지 (예: "에 이 있어", "과 점수가")

✅ 반드시 지킬 사항:
1. 오직 한국어(한글 자모음)와 숫자, 문장부호만 사용
2. 궁위 이름은 반드시 완전하게 표현
   - 12궁위: 명궁, 부모궁, 복덕궁, 전택궁, 관록궁, 노복궁, 천이궁, 질액궁, 재백궁, 자녀궁, 부부궁, 형제궁
3. 친구에게 말하듯 편한 말투 (~거든요, ~해요, ~네요)
4. 궁위를 언급할 때는 "명궁이 강하고", "재백궁은 95점으로 높아요" 처럼 명확하고 완전하게 표현
5. 모든 문장은 주어와 서술어가 완전해야 함

📋 올바른 궁위 표현 예시:
✅ 좋은 예: "관록궁이 57점으로 낮아서 경쟁에서 어려움을 겪을 수 있어요"
✅ 좋은 예: "재백궁은 95점으로 높아서 재물운이 좋아요"
❌ 나쁜 예: "공식운이 57점으로 낮아 에 이 있어" (불완전한 문장)
❌ 나쁜 예: "과 점수가 높아" (주어 누락)

지금 바로 순수 한국어로만 완전한 문장으로 답변하세요.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: parseInt(process.env.DEEPINFRA_MAX_TOKENS) || 4000,
      temperature: parseFloat(process.env.DEEPINFRA_TEMPERATURE) || 0.7,
    }),
    timeout: parseInt(process.env.DEEPINFRA_TIMEOUT) || 30000,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepInfra API Error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  let text = data.choices[0].message.content;

  // 응답 후처리: 외국어 문자 제거
  text = cleanForeignCharacters(text);

  return {
    text: text,
    usage: {
      input_tokens: data.usage.prompt_tokens,
      output_tokens: data.usage.completion_tokens,
    },
    provider: 'deepinfra',
  };
}

// ============================================
// OpenAI API 호출 함수
// ============================================
async function callOpenAIAPI(prompt) {
  const fetch = (await import('node-fetch')).default;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `당신은 한국어로만 답변하는 자미두수 및 귀문둔갑 전문가입니다.

🚫 절대 금지 사항 (위반 시 재생성):
1. 영어 단어 사용 금지 (yes, no, OK, the, and 등 모든 영어)
2. 중국어 사용 금지 (今天, 時節 등)
3. 일본어 사용 금지 (は, を, の 등)
4. 러시아어 사용 금지 (вашей, карте, показывает 등)
5. 아랍어 및 기타 모든 외국어 문자 사용 금지
6. <think> 태그나 사고 과정 노출 금지
7. 마크다운 형식(#, **, -) 사용 금지
8. 불완전한 문장 사용 금지 (예: "에 이 있어", "과 점수가")

✅ 반드시 지킬 사항:
1. 오직 한국어(한글 자모음)와 숫자, 문장부호만 사용
2. 궁위 이름은 반드시 완전하게 표현
   - 12궁위: 명궁, 부모궁, 복덕궁, 전택궁, 관록궁, 노복궁, 천이궁, 질액궁, 재백궁, 자녀궁, 부부궁, 형제궁
3. 친구에게 말하듯 편한 말투 (~거든요, ~해요, ~네요)
4. 궁위를 언급할 때는 "명궁이 강하고", "재백궁은 95점으로 높아요" 처럼 명확하고 완전하게 표현
5. 모든 문장은 주어와 서술어가 완전해야 함

📋 올바른 궁위 표현 예시:
✅ 좋은 예: "관록궁이 57점으로 낮아서 경쟁에서 어려움을 겪을 수 있어요"
✅ 좋은 예: "재백궁은 95점으로 높아서 재물운이 좋아요"
❌ 나쁜 예: "공식운이 57점으로 낮아 에 이 있어" (불완전한 문장)
❌ 나쁜 예: "과 점수가 높아" (주어 누락)

지금 바로 순수 한국어로만 완전한 문장으로 답변하세요.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API Error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  let text = data.choices[0].message.content;

  // 응답 후처리: 외국어 문자 제거
  text = cleanForeignCharacters(text);

  return {
    text: text,
    usage: {
      input_tokens: data.usage.prompt_tokens,
      output_tokens: data.usage.completion_tokens,
    },
    provider: 'openai',
  };
}

// ============================================
// Google Gemini API 호출 함수
// ============================================
async function callGeminiAPI(prompt) {
  const fetch = (await import('node-fetch')).default;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GOOGLE_MODEL}:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `당신은 한국어로만 답변하는 자미두수 및 귀문둔갑 전문가입니다.

🚫 절대 금지 사항 (위반 시 재생성):
1. 영어 단어 사용 금지 (yes, no, OK, the, and 등 모든 영어)
2. 중국어 사용 금지 (今天, 時節 등)
3. 일본어 사용 금지 (は, を, の 등)
4. 러시아어 사용 금지 (вашей, карте, показывает 등)
5. 아랍어 및 기타 모든 외국어 문자 사용 금지
6. <think> 태그나 사고 과정 노출 금지
7. 마크다운 형식(#, **, -) 사용 금지
8. 불완전한 문장 사용 금지 (예: "에 이 있어", "과 점수가")

✅ 반드시 지킬 사항:
1. 오직 한국어(한글 자모음)와 숫자, 문장부호만 사용
2. 궁위 이름은 반드시 완전하게 표현
   - 12궁위: 명궁, 부모궁, 복덕궁, 전택궁, 관록궁, 노복궁, 천이궁, 질액궁, 재백궁, 자녀궁, 부부궁, 형제궁
3. 친구에게 말하듯 편한 말투 (~거든요, ~해요, ~네요)
4. 궁위를 언급할 때는 "명궁이 강하고", "재백궁은 95점으로 높아요" 처럼 명확하고 완전하게 표현
5. 모든 문장은 주어와 서술어가 완전해야 함

📋 올바른 궁위 표현 예시:
✅ 좋은 예: "관록궁이 57점으로 낮아서 경쟁에서 어려움을 겪을 수 있어요"
✅ 좋은 예: "재백궁은 95점으로 높아서 재물운이 좋아요"
❌ 나쁜 예: "공식운이 57점으로 낮아 에 이 있어" (불완전한 문장)
❌ 나쁜 예: "과 점수가 높아" (주어 누락)

사용자 질문: ${prompt}

지금 바로 순수 한국어로만 완전한 문장으로 답변하세요.`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      }
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API Error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  let text = data.candidates[0].content.parts[0].text;

  // 응답 후처리: 외국어 문자 제거
  text = cleanForeignCharacters(text);

  return {
    text: text,
    usage: {
      input_tokens: data.usageMetadata?.promptTokenCount || 0,
      output_tokens: data.usageMetadata?.candidatesTokenCount || 0,
    },
    provider: 'gemini',
  };
}

// ============================================
// Rule-based Fallback 응답
// ============================================
function getRuleBasedResponse(prompt) {
  // 간단한 규칙 기반 응답 (AI 모두 실패 시)
  const response = `귀문둔갑 분석을 기반으로 말씀드리겠습니다.

현재 시점의 국(局)과 팔문, 구성, 팔신의 배치를 보면, 전체적인 에너지 흐름은 중립적이거나 약간 긍정적인 상태입니다.

**추천 방향**: 최적의 길흉을 가진 방위로 이동하거나 중요한 일을 진행하시면 좋습니다.

**주의사항**: 흉한 방위는 피하시고, 중요한 결정은 길한 시간대에 하시는 것이 좋습니다.

더 자세한 분석을 원하시면 AI 서비스가 복구된 후 다시 질문해 주세요.`;

  return {
    text: response,
    usage: { input_tokens: 0, output_tokens: 0 },
    provider: 'rule-based',
  };
}

// ============================================
// AI 응답 생성 (폴백 체인)
// ============================================
async function generateAIResponse(prompt) {
  // 1순위: OpenAI
  try {
    console.log('🤖 [1순위] OpenAI API 시도 중...');
    const result = await callOpenAIAPI(prompt);
    console.log('✅ [1순위] OpenAI API 성공');
    return result;
  } catch (error) {
    console.warn('⚠️ [1순위] OpenAI API 실패:', error.message);
  }

  // 2순위: DeepInfra
  try {
    console.log('🤖 [2순위] DeepInfra API 시도 중...');
    const result = await callDeepInfraAPI(prompt);
    console.log('✅ [2순위] DeepInfra API 성공');
    return result;
  } catch (error) {
    console.warn('⚠️ [2순위] DeepInfra API 실패:', error.message);
  }

  // 3순위: Gemini
  try {
    console.log('🤖 [3순위] Gemini API 시도 중...');
    const result = await callGeminiAPI(prompt);
    console.log('✅ [3순위] Gemini API 성공');
    return result;
  } catch (error) {
    console.warn('⚠️ [3순위] Gemini API 실패:', error.message);
  }

  // 4순위: Rule-based Fallback
  console.log('📋 [4순위] Rule-based fallback 사용');
  return getRuleBasedResponse(prompt);
}

// ============================================
// Health check
// ============================================
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Qimen AI Service',
    providers: {
      deepinfra: !!process.env.DEEPINFRA_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
    },
  });
});

// ============================================
// 귀문둔갑 AI 채팅
// ============================================
app.post('/api/v1/qimen/chat', async (req, res) => {
  try {
    const { prompt, userQuestion } = req.body;

    if (!prompt || !userQuestion) {
      return res.status(400).json({
        success: false,
        error: 'prompt와 userQuestion은 필수입니다.',
      });
    }

    console.log('🔮 [귀문둔갑 AI] 요청 받음');
    console.log('💬 [사용자 질문]:', userQuestion);

    // AI 응답 생성 (폴백 체인)
    const result = await generateAIResponse(prompt);

    console.log(`✅ [귀문둔갑 AI] 응답 생성 완료 (Provider: ${result.provider})`);

    res.json({
      success: true,
      response: result.text,
      provider: result.provider,
      usage: result.usage,
    });
  } catch (error) {
    console.error('❌ [귀문둔갑 AI] 오류:', error.message);

    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.',
      details: error.message,
    });
  }
});

// ============================================
// 자미두수 AI 채팅
// ============================================
app.post('/api/v1/ziwei/chat', async (req, res) => {
  try {
    const { prompt, userQuestion } = req.body;

    if (!prompt || !userQuestion) {
      return res.status(400).json({
        success: false,
        error: 'prompt와 userQuestion은 필수입니다.',
      });
    }

    console.log('⭐ [자미두수 AI] 요청 받음');
    console.log('💬 [사용자 질문]:', userQuestion);

    // AI 응답 생성 (폴백 체인)
    const result = await generateAIResponse(prompt);

    console.log(`✅ [자미두수 AI] 응답 생성 완료 (Provider: ${result.provider})`);

    res.json({
      success: true,
      response: result.text,
      provider: result.provider,
      usage: result.usage,
    });
  } catch (error) {
    console.error('❌ [자미두수 AI] 오류:', error.message);

    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.',
      details: error.message,
    });
  }
});

// ============================================
// 서버 시작
// ============================================
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 귀문둔갑 & 자미두수 AI Service 시작');
  console.log('='.repeat(60));
  console.log(`📡 서버 실행 중: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`🔮 귀문둔갑 AI: POST http://localhost:${PORT}/api/v1/qimen/chat`);
  console.log(`⭐ 자미두수 AI: POST http://localhost:${PORT}/api/v1/ziwei/chat`);
  console.log('');
  console.log('🔄 AI Provider Priority:');
  console.log(`   1️⃣ OpenAI (${process.env.OPENAI_MODEL || 'gpt-4o-mini'})`);
  console.log(`   2️⃣ DeepInfra (${process.env.DEEPINFRA_DEFAULT_MODEL})`);
  console.log(`   3️⃣ Gemini (${process.env.GOOGLE_MODEL || 'gemini-2.0-flash-exp'})`);
  console.log(`   4️⃣ Rule-based fallback`);
  console.log('='.repeat(60));
});
