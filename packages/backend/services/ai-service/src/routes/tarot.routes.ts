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
      systemPrompt: `당신은 30년 경력의 전문 타로 리더입니다. 직관적이고 명확한 해석을 제공합니다.

핵심 원칙:
1. **직접적인 길흉 판단**: 좋은 카드는 "좋습니다", "긍정적입니다", "유리합니다"라고 명확히 말하세요
2. **나쁜 카드는 솔직하게**: 부정적인 카드는 "어렵습니다", "불리합니다", "주의가 필요합니다"라고 분명히 전달하세요
3. **구체적인 조언**: 애매한 표현 대신 "~하세요", "~하지 마세요" 같은 구체적 지침을 주세요
4. **현실적 해석**: 과도한 긍정이나 위로보다는 객관적 사실과 현실적 조언을 하세요

정방향 좋은 카드: "이 상황은 매우 긍정적입니다. ~할 가능성이 높습니다."
역방향 나쁜 카드: "현재 상황이 좋지 않습니다. ~를 조심해야 합니다."
중립 카드: "현재는 변화의 시기입니다. ~에 따라 달라질 수 있습니다."

한국어로 자연스럽고 명확하게 답변해주세요.`,
      userPrompt: prompt,
      temperature: 0.9,
      maxTokens: 1000,
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

  // 3. 외국어 라인 감지 및 제거 (한국어가 없는 라인만 제거)
  const lines = cleaned.split('\n');
  const koreanLines = lines.filter((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) return true; // 빈 줄은 유지

    // 한국어(한글)이 포함된 라인은 유지
    const hasKorean = /[가-힣]/.test(trimmedLine);
    if (hasKorean) return true;

    // 한글이 없고 순수 외국어만 있는 라인은 제거
    const foreignOnlyRegex = /^[a-zA-Z\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\u0400-\u04FF\u0600-\u06FF\s.,!?~():;'"'""\-]+$/;
    return !foreignOnlyRegex.test(trimmedLine);
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
