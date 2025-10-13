/**
 * 자미두수 & 사주 AI 서비스 - 다중 제공자 폴백 버전
 * 포트: 4017
 *
 * AI 제공자 우선순위:
 * 1순위: OpenAI (GPT-4)
 * 2순위: DeepInfra (Llama 3.1 70B)
 * 3순위: Google Gemini (2.0 Flash Exp)
 */

import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4017;

// API 키 확인
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const DEEPINFRA_API_KEY = process.env.DEEPINFRA_API_KEY || '';
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY || '';

// Gemini API 초기화
const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

/**
 * 1순위: OpenAI API 호출
 */
async function callOpenAI(prompt) {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('🟢 [1순위] OpenAI 호출 시도...');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.9,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const text = data.choices[0]?.message?.content;

  if (!text) {
    throw new Error('OpenAI returned empty response');
  }

  console.log('✅ [1순위] OpenAI 응답 성공');
  return { text, provider: 'OpenAI (GPT-4o-mini)' };
}

/**
 * 2순위: DeepInfra API 호출
 */
async function callDeepInfra(prompt) {
  if (!DEEPINFRA_API_KEY) {
    throw new Error('DeepInfra API key not configured');
  }

  console.log('🟡 [2순위] DeepInfra 호출 시도...');

  const response = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPINFRA_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.9,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepInfra API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const text = data.choices[0]?.message?.content;

  if (!text) {
    throw new Error('DeepInfra returned empty response');
  }

  console.log('✅ [2순위] DeepInfra 응답 성공');
  return { text, provider: 'DeepInfra (Llama 3.1 70B)' };
}

/**
 * 3순위: Google Gemini API 호출
 */
async function callGemini(prompt) {
  if (!GOOGLE_AI_API_KEY) {
    throw new Error('Google AI API key not configured');
  }

  console.log('🔵 [3순위] Gemini 호출 시도...');

  const model = genAI.getGenerativeModel({
    model: process.env.GOOGLE_MODEL || 'gemini-2.0-flash-exp',
  });

  const generationConfig = {
    temperature: 0.9,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 1500,
  };

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig,
  });

  const response = result.response;
  const text = response.text();

  if (!text) {
    throw new Error('Gemini returned empty response');
  }

  console.log('✅ [3순위] Gemini 응답 성공');
  return { text, provider: 'Google Gemini (2.0 Flash Exp)' };
}

/**
 * AI 제공자 폴백 체인 실행
 */
async function getAIResponse(prompt) {
  const providers = [
    { name: 'OpenAI', func: callOpenAI, enabled: !!OPENAI_API_KEY },
    { name: 'DeepInfra', func: callDeepInfra, enabled: !!DEEPINFRA_API_KEY },
    { name: 'Gemini', func: callGemini, enabled: !!GOOGLE_AI_API_KEY },
  ];

  console.log('\n🤖 [AI 폴백 체인] 시작...');
  console.log('설정된 제공자:', providers.filter(p => p.enabled).map(p => p.name).join(' → '));

  for (const provider of providers) {
    if (!provider.enabled) {
      console.log(`⏭️  ${provider.name}: API 키 없음 - 스킵`);
      continue;
    }

    try {
      const result = await provider.func(prompt);
      console.log(`\n✅ [최종] ${provider.name} 사용 성공!\n`);
      return result;
    } catch (error) {
      console.error(`❌ ${provider.name} 실패:`, error.message);
      // 다음 제공자로 폴백
    }
  }

  // 모든 제공자 실패
  throw new Error('모든 AI 제공자 호출 실패');
}

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AI Service (Multi-Provider)',
    port: PORT,
    providers: {
      openai: !!OPENAI_API_KEY,
      deepinfra: !!DEEPINFRA_API_KEY,
      gemini: !!GOOGLE_AI_API_KEY,
    },
    timestamp: new Date().toISOString(),
  });
});

// 자미두수 AI 채팅 엔드포인트
app.post('/api/v1/ziwei/chat', async (req, res) => {
  try {
    const { prompt, userQuestion } = req.body;

    if (!prompt || !userQuestion) {
      return res.status(400).json({
        success: false,
        error: '프롬프트와 사용자 질문이 필요합니다',
      });
    }

    console.log('\n[자미두수 AI] 요청 받음:', {
      userQuestion,
      promptLength: prompt.length,
    });

    // 폴백 체인으로 AI 응답 생성
    const { text, provider } = await getAIResponse(prompt);

    console.log('[자미두수 AI] 응답 생성 완료:', {
      provider,
      responseLength: text.length,
      preview: text.substring(0, 100),
    });

    // 응답 검증 및 정제
    const cleanedResponse = cleanAIResponse(text);

    return res.json({
      success: true,
      response: cleanedResponse,
      provider,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[자미두수 AI] Error:', error);

    // 에러 응답
    return res.status(500).json({
      success: false,
      error: 'AI 응답 생성 중 오류가 발생했습니다',
      details: error.message,
    });
  }
});

// 사주 AI 채팅 엔드포인트 (자미두수와 동일한 로직 사용)
app.post('/api/v1/saju/chat', async (req, res) => {
  try {
    const { prompt, userQuestion } = req.body;

    if (!prompt || !userQuestion) {
      return res.status(400).json({
        success: false,
        error: '프롬프트와 사용자 질문이 필요합니다',
      });
    }

    console.log('\n[사주 AI] 요청 받음:', {
      userQuestion,
      promptLength: prompt.length,
    });

    // 폴백 체인으로 AI 응답 생성
    const { text, provider } = await getAIResponse(prompt);

    console.log('[사주 AI] 응답 생성 완료:', {
      provider,
      responseLength: text.length,
      preview: text.substring(0, 100),
    });

    // 응답 검증 및 정제
    const cleanedResponse = cleanAIResponse(text);

    return res.json({
      success: true,
      response: cleanedResponse,
      provider,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[사주 AI] Error:', error);

    // 에러 응답
    return res.status(500).json({
      success: false,
      error: 'AI 응답 생성 중 오류가 발생했습니다',
      details: error.message,
    });
  }
});

/**
 * AI 응답 정제 함수
 */
function cleanAIResponse(text) {
  let cleaned = text;

  // 1. <think> 태그 및 사고 과정 제거
  cleaned = cleaned.replace(/<think>.*?<\/think>/gs, '');
  cleaned = cleaned.replace(/<\/?think>/g, '');

  // 2. 마크다운 형식 제거
  cleaned = cleaned.replace(/#{1,6}\s/g, '');
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');
  cleaned = cleaned.replace(/^[-*+]\s/gm, '');
  cleaned = cleaned.replace(/^\d+\.\s/gm, '');

  // 3. 외국어 감지 및 제거
  const lines = cleaned.split('\n');
  const koreanLines = lines.filter((line) => {
    const foreignRegex = /[a-zA-Z\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\u0400-\u04FF\u0600-\u06FF]+/g;
    const nonKoreanChars = line.replace(/[0-9\s.,!?~():;'"'""\-]/g, '');
    const hasForeignChars = foreignRegex.test(nonKoreanChars);
    return !hasForeignChars || line.trim().length === 0;
  });

  cleaned = koreanLines.join('\n');

  // 4. 불완전한 문장 제거
  cleaned = cleaned.replace(/\s+[을를이가에와과]$/gm, '');
  cleaned = cleaned.replace(/\s+있어$/gm, '있어요');

  // 5. 공백 정리
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.trim();

  // 6. 최소 길이 검증
  if (cleaned.length < 20) {
    return '죄송합니다. 답변을 생성하는 데 문제가 발생했습니다. 다시 질문해 주세요.';
  }

  return cleaned;
}

// 서버 시작
app.listen(PORT, () => {
  console.log(`\n✨ AI Service (Multi-Provider Fallback) is running on http://localhost:${PORT}\n`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`💬 Ziwei Chat: POST http://localhost:${PORT}/api/v1/ziwei/chat`);
  console.log(`💬 Saju Chat: POST http://localhost:${PORT}/api/v1/saju/chat`);
  console.log(`\n🔑 AI 제공자 우선순위:`);
  console.log(`   1순위: OpenAI (GPT-4o-mini) - ${OPENAI_API_KEY ? '✅ 설정됨' : '❌ 미설정'}`);
  console.log(`   2순위: DeepInfra (Llama 3.1 70B) - ${DEEPINFRA_API_KEY ? '✅ 설정됨' : '❌ 미설정'}`);
  console.log(`   3순위: Google Gemini (2.0 Flash Exp) - ${GOOGLE_AI_API_KEY ? '✅ 설정됨' : '❌ 미설정'}\n`);
});
