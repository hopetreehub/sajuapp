/**
 * 사주(四柱) AI 채팅 라우트
 *
 * @author Claude Code
 * @version 2.0.0
 * @updated 2025-10-24 - AI Orchestrator 적용으로 다중 AI 제공자 지원
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { aiOrchestrator } from '@/services/ai-orchestrator.service';
import { AIRequest, AIRequestType } from '@/types/ai.types';
import { logger } from '@/utils/logger';

const router = Router();

/**
 * 사주 AI 채팅 엔드포인트
 * POST /api/v1/saju/chat
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
      requestType: AIRequestType.SAJU,
      systemPrompt: `🚨🚨🚨 CRITICAL LANGUAGE REQUIREMENT 🚨🚨🚨
YOU MUST WRITE ONLY IN PURE KOREAN (순수 한국어)

❌ ABSOLUTELY FORBIDDEN (절대 금지):
- Chinese characters (漢字/汉字): 使用者❌, 金錢❌, 關係❌, 命宮❌, 財帛宮❌, 日主❌, 月支❌
- Japanese (日本語): の❌, と❌, も❌, しました❌, との❌, です❌, ます❌
- Chinese (中文): 使用❌, 金钱❌, 关系❌, 日主❌
- English words: palace❌, fortune❌, star❌, pillars❌
- ANY non-Korean characters

✅ USE ONLY (반드시 사용):
- Pure Korean: 사용자✓, 돈✓, 관계✓, 일주✓, 월지✓
- Korean particles: 은/는/이/가/을/를
- Korean verbs: 하다/되다/되어/입니다

당신은 30년 경력의 전문 사주명리학 상담사입니다.

**핵심 원칙:**
1. 100% 순수 한국어로만 작성 (중국어, 일본어, 영어 문자 절대 금지)
2. 사용자의 질문에 직접적으로 답변
3. 사주의 구성(년주, 월주, 일주, 시주)과 십성, 오행, 용신 등을 활용하여 구체적으로 해석
4. 실천 가능한 조언 제공
5. "사용자님"이라고 쓰기 (使用者님❌, 使用者様❌)

**답변 형식:**
사용자님의 질문에 대한 답변을 명확하게 제시하고, 사주의 정보를 근거로 설명해주세요.
길흉화복을 직접적으로 판단하고, 구체적인 행동 지침을 제공하세요.

반드시 순수 한국어로만 자연스럽고 명확하게 답변해주세요.`,
      userPrompt: prompt,
      temperature: 0.8,
      maxTokens: 1500,
      metadata: {
        userQuestion,
        language: 'ko'
      }
    };

    logger.info(`Processing saju request: ${aiRequest.id}`);

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
    logger.error('[Saju AI] Error:', error);

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
 * - <think> 태그만 제거
 * - 기본적인 정리만 수행
 */
function cleanAIResponse(text: string): string {
  let cleaned = text;

  // 1. <think> 태그 및 사고 과정 제거
  cleaned = cleaned.replace(/<think>.*?<\/think>/gs, '');
  cleaned = cleaned.replace(/<\/?think>/g, '');

  // 2. 기본 공백 정리만 수행
  cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n'); // 4개 이상 개행만 제거
  cleaned = cleaned.trim();

  // 3. 최소 길이 검증
  if (cleaned.length < 20) {
    return '죄송합니다. 사주 해석을 생성하는 데 문제가 발생했습니다. 다시 질문해 주세요.';
  }

  return cleaned;
}

export default router;
