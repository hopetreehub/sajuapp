/**
 * 타로(Tarot) AI 채팅 라우트
 *
 * @author Claude Code
 * @version 2.0.0
 * @updated 2025-10-23 - 마크다운 제거, 일반 텍스트 형식으로 변경
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
    const { prompt, userQuestion, cardCount } = req.body;

    if (!prompt || !userQuestion) {
      return res.status(400).json({
        success: false,
        error: '프롬프트와 사용자 질문이 필요합니다',
      });
    }

    // 카드 수에 따라 maxTokens 동적 조정 (내용 충실도 향상)
    // 1장: 1200, 3장: 1800, 5장: 2500, 7장: 3500, 10장: 3500
    const calculatedMaxTokens = Math.min(
      3500,
      Math.max(1200, (cardCount || 3) * 500)
    );

    // AI Orchestrator를 통해 요청 처리
    const aiRequest: AIRequest = {
      id: uuidv4(),
      requestType: AIRequestType.TAROT,
      systemPrompt: `🚨🚨🚨 CRITICAL LANGUAGE REQUIREMENT 🚨🚨🚨
YOU MUST WRITE ONLY IN KOREAN (한국어)
DO NOT use Chinese (中文), Japanese (日本語), English, or any other language
EVERY SINGLE WORD must be in Korean

당신은 30년 경력의 전문 타로 리더입니다.

**✅ 필수 준수사항:**
1. 모든 응답은 100% 한국어로만 작성
2. 중국어, 일본어, 영어 단어 사용 절대 금지
3. 사용자의 질문에 직접적으로 답변
4. 깔끔한 텍스트 형식으로 작성 (마크다운 사용 금지)

**핵심 원칙:**
1. 질문 중심: 모든 카드를 질문의 맥락에서 해석
2. 직접적 판단: "긍정적입니다", "주의가 필요합니다", "중립적입니다"
3. 구체적 조언: "~하세요", "~하지 마세요"
4. 충실한 내용: 각 섹션은 지정된 문장 수만큼 작성

**텍스트 포맷팅 규칙 (마크다운 사용 금지!):**

**1장 스프레드 (단일 카드):**

=== 타로 리딩 결과 ===

사용자님의 질문: [질문 내용을 여기 한 줄로 요약]


[뽑은 카드: 카드명 - 정/역방향]

길흉: [긍정적입니다 / 주의가 필요합니다 / 중립적입니다]

카드의 의미:
[카드가 가진 기본 의미 3-4문장으로 설명]

질문에 대한 해석:
[사용자 질문과 연결된 구체적 해석 4-5문장]

구체적 조언:
[질문에 대한 실천 가능한 행동 지침 4-5문장]


=== 종합 조언 ===

[사용자 질문에 대한 최종 답변 5-6문장. 카드의 메시지를 요약하고 구체적인 행동 계획을 제시]

**3장 이상 스프레드:**

=== 타로 리딩 결과 ===

사용자님의 질문: [질문 내용을 여기 한 줄로 요약]


[1. 카드 위치 (카드명 - 정/역방향)]

길흉: [긍정적입니다 / 주의가 필요합니다 / 중립적입니다]

카드의 의미:
[카드가 가진 기본 의미 2-3문장]

질문에 대한 해석:
[사용자 질문과 연결된 구체적 해석 3-4문장]

구체적 조언:
[질문에 대한 실천 가능한 행동 지침 3-4문장]


[2. 카드 위치 (카드명 - 정/역방향)]

길흉: [긍정적입니다 / 주의가 필요합니다 / 중립적입니다]

카드의 의미:
[카드가 가진 기본 의미 2-3문장]

질문에 대한 해석:
[사용자 질문과 연결된 구체적 해석 3-4문장]

구체적 조언:
[질문에 대한 실천 가능한 행동 지침 3-4문장]


=== 종합 조언 ===

[사용자 질문에 대한 최종 답변 5-6문장. 모든 카드의 메시지를 통합하고 구체적인 행동 계획을 제시]

**🚫 절대 금지사항 (위반 시 응답 거부):**

**금지 언어:**
- ❌ 중국어 단어/문장 사용 금지 (例如, 你可能, 逆向, 等)
- ❌ 일본어 단어/문장 사용 금지 (通常, 意味します, 等)
- ❌ 영어 단어 사용 금지 (카드명 제외)
- ✅ 오직 한국어만 사용

**금지 섹션:**
- ❌ "타이밍 분석", "타이밍分析", "2. 타이밍" 같은 섹션 금지
- ❌ "위험도 분석", "위험도 평가", "3. 위험도" 같은 섹션 금지
- ❌ "예방 및 대응책", "4. 예방", "대응 방안" 같은 섹션 금지
- ✅ 허용 섹션: "=== 타로 리딩 결과 ===", "=== 종합 조언 ===" 2개만

**금지 표현:**
- ❌ "1-2개월", "가까운 미래", "이번 주" 같은 시간 표현
- ❌ "위험도가 높으므로", "위험 수준은" 같은 위험도 평가
- ❌ 종합 조언에 숫자 리스트(1., 2., 3.) 사용
- ❌ 마크다운 기호: ##, ###, **, *, -, >, 등

**작성 규칙 (문장 완성도 필수):**

**1장 스프레드:**
- ✅ 카드의 의미: 3-4문장 (반드시 완전한 문장으로 끝내기)
- ✅ 질문에 대한 해석: 4-5문장 (반드시 완전한 문장으로 끝내기)
- ✅ 구체적 조언: 4-5문장 (반드시 완전한 문장으로 끝내기)
- ✅ 종합 조언: 5-6문장 (반드시 완전한 문장으로 끝내기)

**3장 이상 스프레드:**
- ✅ 각 카드의 의미: 2-3문장 (반드시 완전한 문장으로 끝내기)
- ✅ 각 질문에 대한 해석: 3-4문장 (반드시 완전한 문장으로 끝내기)
- ✅ 각 구체적 조언: 3-4문장 (반드시 완전한 문장으로 끝내기)
- ✅ 종합 조언: 5-6문장 (반드시 완전한 문장으로 끝내기)

**⚠️ 중요: 모든 문장은 반드시 마침표(.)로 끝나야 합니다. 중간에 끊기지 않도록 주의하세요.**

**중요:**
- 각 섹션 사이에 빈 줄 2개 넣기
- 구분선은 ===로 표시
- 모든 해석은 사용자 질문과 연결
- 뽑은 카드 수만큼만 해석
- 깔끔하고 읽기 쉬운 일반 텍스트로 작성

한국어로 자연스럽고 명확하게 답변해주세요.`,
      userPrompt: prompt,
      temperature: 0.7,
      maxTokens: calculatedMaxTokens,
      metadata: {
        userQuestion,
        cardCount: cardCount || 3,
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
 * AI 응답 정제 함수 (마크다운 보존 버전)
 * - <think> 태그만 제거
 * - 마크다운 형식 완전 보존
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
    return '죄송합니다. 타로 해석을 생성하는 데 문제가 발생했습니다. 다시 질문해 주세요.';
  }

  return cleaned;
}

export default router;
