/**
 * 타로(Tarot) AI 채팅 라우트
 *
 * @author Claude Code
 * @version 1.0.0
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { aiOrchestrator } from '@/services/ai-orchestrator.service';
import { AIRequest, AIRequestType } from '@/types/ai.types';
import { logger } from '@/utils/logger';

const router = Router();

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

    // AI Orchestrator를 통해 요청 처리
    const aiRequest: AIRequest = {
      id: uuidv4(),
      requestType: AIRequestType.TAROT,
      systemPrompt: '당신은 전문 타로 리더입니다. 타로 카드의 상징과 의미를 깊이 이해하고 있으며, 내담자의 질문에 대해 통찰력 있고 공감적인 해석을 제공합니다. 한국어로 자연스럽고 따뜻한 어조로 답변해주세요.',
      userPrompt: prompt,
      temperature: 1.0,
      maxTokens: 800,
      metadata: {
        userQuestion,
        language: 'ko'
      }
    };

    logger.info(`Processing tarot request: ${aiRequest.id}`);

    const aiResponse = await aiOrchestrator.processRequest(aiRequest);

    if (!aiResponse.success) {
      throw new Error(aiResponse.error || 'AI 응답 생성 실패');
    }

    // 응답 검증 및 정제
    const cleanedResponse = cleanAIResponse(aiResponse.content);

    return res.json({
      success: true,
      response: cleanedResponse,
      provider: aiResponse.provider,
      model: aiResponse.model,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('[Tarot AI] Error:', error);

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
