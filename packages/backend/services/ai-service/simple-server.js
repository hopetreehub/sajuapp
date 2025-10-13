/**
 * 자미두수 AI 서비스 - 간소화 버전
 * 포트: 4017
 */

import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4017;

// Gemini API 초기화
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AI Service (Ziwei)',
    port: PORT,
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

    console.log('[Ziwei AI] 요청 받음:', {
      userQuestion,
      promptLength: prompt.length,
    });

    // Gemini 2.0 Flash Exp 모델 사용
    const model = genAI.getGenerativeModel({
      model: process.env.GOOGLE_MODEL || 'gemini-2.0-flash-exp',
    });

    // 생성 설정
    const generationConfig = {
      temperature: 0.9,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 500,
    };

    // AI 응답 생성
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    });

    const response = result.response;
    const text = response.text();

    console.log('[Ziwei AI] 응답 생성 완료:', {
      responseLength: text.length,
      preview: text.substring(0, 100),
    });

    // 응답 검증 및 정제
    const cleanedResponse = cleanAIResponse(text);

    return res.json({
      success: true,
      response: cleanedResponse,
      model: 'gemini-2.0-flash-exp',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Ziwei AI] Error:', error);

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
  console.log(`✨ AI Service (Ziwei) is running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`💬 Ziwei Chat: POST http://localhost:${PORT}/api/v1/ziwei/chat`);
  console.log(`🔑 Google AI API Key: ${process.env.GOOGLE_AI_API_KEY ? '설정됨' : '미설정'}`);
  console.log(`🤖 Model: ${process.env.GOOGLE_MODEL || 'gemini-2.0-flash-exp'}`);
});
