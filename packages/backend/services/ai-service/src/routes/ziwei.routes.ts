/**
 * 자미두수(紫微斗數) AI 채팅 라우트
 *
 * @author Claude Code
 * @version 2.0.0
 * @updated 2025-10-23 - AI Orchestrator 적용으로 다중 AI 제공자 지원 (재시작)
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { aiOrchestrator } from '@/services/ai-orchestrator.service';
import { AIRequest, AIRequestType } from '@/types/ai.types';
import { logger } from '@/utils/logger';

const router = Router();

/**
 * 자미두수 AI 채팅 엔드포인트
 * POST /api/v1/ziwei/chat
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
      requestType: AIRequestType.ZIWEI,
      systemPrompt: `🚨🚨🚨 CRITICAL LANGUAGE REQUIREMENT 🚨🚨🚨
YOU MUST WRITE ONLY IN PURE KOREAN (순수 한국어)

❌ ABSOLUTELY FORBIDDEN (절대 금지):
- Chinese characters (漢字/汉字): 使用者❌, 金錢❌, 關係❌, 命宮❌, 財帛宮❌
- Japanese (日本語): の❌, と❌, も❌, しました❌, との❌, です❌, ます❌
- Chinese (中文): 使用❌, 金钱❌, 关系❌
- English words: palace❌, fortune❌, star❌
- ANY non-Korean characters

✅ USE ONLY (반드시 사용):
- Pure Korean: 사용자✓, 돈✓, 관계✓, 명궁✓, 재백궁✓
- Korean particles: 은/는/이/가/을/를
- Korean verbs: 하다/되다/되어/입니다

당신은 30년 경력의 전문 자미두수 상담사입니다.

**핵심 원칙:**
1. 100% 순수 한국어로만 작성 (중국어, 일본어, 영어 문자 절대 금지)
2. 사용자의 질문에 직접적으로 답변
3. 명반의 궁위와 성요를 활용하여 구체적으로 해석
4. 실천 가능한 조언 제공
5. "사용자님"이라고 쓰기 (使用者님❌, 使用者様❌)

**금지사항 - 절대로 이런 문자를 쓰지 마세요:**
- 명반을 命盤이라고 쓰지 말 것
- 재백궁을 財帛宮이라고 쓰지 말 것
- 궁위를 宮位라고 쓰지 말 것
- 그 어떤 한자도 사용 금지
- 영어, 포르투갈어, 일본어 등 외국어 절대 금지

**답변 형식:**
사용자님의 질문에 대한 답변을 명확하게 제시하고, 명반의 정보를 근거로 설명해주세요.
길흉화복을 직접적으로 판단하고, 구체적인 행동 지침을 제공하세요.

반드시 순수 한국어로만 자연스럽고 명확하게 답변해주세요.`,
      userPrompt: prompt,
      temperature: 0.7,
      maxTokens: 1500,
      metadata: {
        userQuestion,
        language: 'ko'
      }
    };

    logger.info(`Processing ziwei request: ${aiRequest.id}`);

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
    logger.error('[Ziwei AI] Error:', error);

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
 * - <think> 태그 제거
 * - 비한국어 문자 필터링 (중국어, 일본어, 기타 외국어)
 * - 순수 한국어만 유지
 */
function cleanAIResponse(text: string): string {
  let cleaned = text;

  // 1. <think> 태그 및 사고 과정 제거
  cleaned = cleaned.replace(/<think>.*?<\/think>/gs, '');
  cleaned = cleaned.replace(/<\/?think>/g, '');

  // 2. 비한국어 문자 필터링
  // 중국어 한자 제거 (CJK Unified Ideographs)
  cleaned = cleaned.replace(/[\u4E00-\u9FFF]/g, '');

  // 일본어 히라가나/카타카나 제거
  cleaned = cleaned.replace(/[\u3040-\u309F\u30A0-\u30FF]/g, '');

  // 영어 단어 검출 및 제거 (3글자 이상 연속된 영어 단어)
  cleaned = cleaned.replace(/\b[a-zA-Z]{3,}\b/g, '');

  // 기타 비한글 알파벳 제거 (악센트 있는 문자 등)
  // 한글(가-힣ㄱ-ㅎㅏ-ㅣ), 숫자(0-9), 기본 문장부호, 공백만 유지
  cleaned = cleaned.replace(/[^\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F0-9\s\.,!?\-~:;'"()\[\]{}%/+\n]/g, '');

  // 3. 공백 정리
  cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n'); // 4개 이상 개행 제거
  cleaned = cleaned.replace(/\s+/g, ' '); // 연속된 공백 하나로
  cleaned = cleaned.replace(/\n /g, '\n'); // 줄바꿈 후 공백 제거
  cleaned = cleaned.trim();

  // 4. 한국어 비율 검증
  const koreanChars = (cleaned.match(/[\uAC00-\uD7A3]/g) || []).length;
  const totalChars = cleaned.replace(/[\s\.,!?\-~:;'"()\[\]{}%/+\n]/g, '').length;
  const koreanRatio = totalChars > 0 ? (koreanChars / totalChars) * 100 : 0;

  if (koreanRatio < 85) {
    logger.warn(`[Ziwei] Low Korean ratio detected: ${koreanRatio.toFixed(1)}%`);
  }

  // 5. 최소 길이 검증
  if (cleaned.length < 20) {
    return '죄송합니다. 자미두수 해석을 생성하는 데 문제가 발생했습니다. 다시 질문해 주세요.';
  }

  return cleaned;
}

export default router;
