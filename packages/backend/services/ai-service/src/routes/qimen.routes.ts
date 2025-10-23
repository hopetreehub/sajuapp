/**
 * 귀문둔갑 AI 챗 라우트
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
 * 귀문둔갑 AI 채팅 엔드포인트
 * POST /api/v1/qimen/chat
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
      requestType: AIRequestType.QIMEN,
      systemPrompt: `🚨🚨🚨 CRITICAL LANGUAGE REQUIREMENT 🚨🚨🚨
YOU MUST WRITE ONLY IN PURE KOREAN (순수 한국어)

❌ ABSOLUTELY FORBIDDEN (절대 금지):
- Chinese characters (漢字/汉字): 使用者❌, 金錢❌, 關係❌, 奇門遁甲❌, 局❌, 盤❌
- Japanese (日本語): の❌, と❌, も❌, しました❌, との❌, です❌, ます❌
- Chinese (中文): 使用❌, 金钱❌, 关系❌, 奇门遁甲❌
- English words: palace❌, fortune❌, gate❌
- ANY non-Korean characters

✅ USE ONLY (반드시 사용):
- Pure Korean: 사용자✓, 돈✓, 관계✓, 귀문둔갑✓, 국✓, 반✓
- Korean particles: 은/는/이/가/을/를
- Korean verbs: 하다/되다/되어/입니다

당신은 30년 경력의 전문 귀문둔갑 상담사입니다.

**핵심 원칙:**
1. 100% 순수 한국어로만 작성 (중국어, 일본어, 영어, 러시아어 등 모든 외국어 절대 금지)
2. 사용자의 질문에 직접적으로 답변
3. 구궁의 정보와 팔신, 팔문, 구성 등을 활용하여 구체적으로 해석
4. 실천 가능한 조언 제공
5. "사용자님"이라고 쓰기 (使用者님❌, 使用者様❌)

**절대 금지 - 이런 문자를 쓰지 마세요:**
- 한자: 国, 方位, 首先, 其次, 另外, 最后, 五行, 物品 등
- 일본어: の, は, を, が, です, ます 등
- 러시아어: здоровье, гидрат 등 키릴 문자
- 영어: health, time, direction, questi, bugs 등
- 그리스어: ά, β 등
- 그 어떤 외국어 문자도 절대 금지

**답변 형식:**
사용자님의 질문에 대한 답변을 명확하게 제시하고, 귀문둔갑의 정보를 근거로 설명해주세요.
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

    logger.info(`Processing qimen request: ${aiRequest.id}`);

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
    logger.error('[Qimen AI] Error:', error);

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
 * - 비한국어 문자 필터링 (중국어, 일본어, 러시아어, 그리스어 등)
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

  // 키릴 문자 제거 (러시아어 등)
  cleaned = cleaned.replace(/[\u0400-\u04FF]/g, '');

  // 그리스 문자 제거
  cleaned = cleaned.replace(/[\u0370-\u03FF]/g, '');

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
    logger.warn(`[Qimen] Low Korean ratio detected: ${koreanRatio.toFixed(1)}%`);
  }

  // 5. 최소 길이 검증
  if (cleaned.length < 20) {
    return '죄송합니다. 귀문둔갑 해석을 생성하는 데 문제가 발생했습니다. 다시 질문해 주세요.';
  }

  return cleaned;
}

export default router;
