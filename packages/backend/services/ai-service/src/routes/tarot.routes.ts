/**
 * 타로(Tarot) AI 채팅 라우트
 *
 * @author Claude Code
 * @version 1.0.0
 */

import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

// Gemini API 초기화
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

/**
 * 타로 AI 채팅 엔드포인트
 * POST /api/v1/tarot/chat
 */
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { prompt, userQuestion } = req.body;

    if (!prompt || !userQuestion) {
      return res.status(400).json({
        success: false,
        error: '프롬프트와 사용자 질문이 필요합니다',
      });
    }

    // Gemini 2.0 Flash Exp 모델 사용
    const model = genAI.getGenerativeModel({
      model: process.env.GOOGLE_MODEL || 'gemini-2.0-flash-exp',
    });

    // 생성 설정 - 타로는 더 창의적인 해석이 필요하므로 temperature를 높게 설정
    const generationConfig = {
      temperature: 1.0,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 800, // 타로 해석은 더 상세하므로 토큰 수 증가
    };

    // AI 응답 생성
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    });

    const response = result.response;
    const text = response.text();

    // 응답 검증 및 정제
    const cleanedResponse = cleanAIResponse(text);

    return res.json({
      success: true,
      response: cleanedResponse,
      model: 'gemini-2.0-flash-exp',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Tarot AI] Error:', error);

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
 * - 외국어 제거
 * - 마크다운 형식 제거
 * - 불완전한 문장 수정
 */
function cleanAIResponse(text: string): string {
  let cleaned = text;

  // 1. <think> 태그 및 사고 과정 제거
  cleaned = cleaned.replace(/<think>.*?<\/think>/gs, '');
  cleaned = cleaned.replace(/<\/?think>/g, '');

  // 2. 마크다운 형식 제거
  cleaned = cleaned.replace(/#{1,6}\s/g, ''); // 헤딩
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1'); // 볼드
  cleaned = cleaned.replace(/\*(.*?)\*/g, '$1'); // 이탤릭
  cleaned = cleaned.replace(/^[-*+]\s/gm, ''); // 리스트
  cleaned = cleaned.replace(/^\d+\.\s/gm, ''); // 번호 리스트

  // 3. 외국어 감지 및 제거 (영어, 중국어, 일본어, 러시아어 등)
  const foreignRegex = /[a-zA-Z\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\u0400-\u04FF\u0600-\u06FF]+/g;
  const lines = cleaned.split('\n');
  const koreanLines = lines.filter((line) => {
    // 숫자와 문장부호는 허용
    const nonKoreanChars = line.replace(/[0-9\s.,!?~():;'"'""\-]/g, '');
    const hasForeignChars = foreignRegex.test(nonKoreanChars);
    return !hasForeignChars || line.trim().length === 0;
  });

  cleaned = koreanLines.join('\n');

  // 4. 불완전한 문장 제거
  cleaned = cleaned.replace(/\s+[을를이가에와과]$/gm, ''); // 끝나지 않은 조사
  cleaned = cleaned.replace(/\s+있어$/gm, '있어요'); // 불완전한 종결어미

  // 5. 공백 정리
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n'); // 3개 이상 개행 제거
  cleaned = cleaned.trim();

  // 6. 최소 길이 검증
  if (cleaned.length < 20) {
    return '죄송합니다. 타로 해석을 생성하는 데 문제가 발생했습니다. 다시 질문해 주세요.';
  }

  return cleaned;
}

export default router;
