/**
 * 사주 AI 채팅 Vercel Function
 *
 * @author Claude Code
 * @version 3.0.0 - Vercel Serverless Function으로 마이그레이션
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { callAIWithPriority } from './utils/aiProvider';

/**
 * AI 응답 정제 함수
 */
function cleanAIResponse(text: string): string {
  let cleaned = text;

  // 1. <think> 태그 제거
  cleaned = cleaned.replace(/<think>.*?<\/think>/gs, '');
  cleaned = cleaned.replace(/<\/?think>/g, '');

  // 2. 비한국어 문자 필터링
  cleaned = cleaned.replace(/[\u4E00-\u9FFF]/g, ''); // 중국어
  cleaned = cleaned.replace(/[\u3040-\u309F\u30A0-\u30FF]/g, ''); // 일본어
  cleaned = cleaned.replace(/[\u0400-\u04FF]/g, ''); // 러시아어
  cleaned = cleaned.replace(/[\u0370-\u03FF]/g, ''); // 그리스어
  cleaned = cleaned.replace(/\b[a-zA-Z]{3,}\b/g, ''); // 영어 단어

  // 한글, 숫자, 문장부호만 유지
  cleaned = cleaned.replace(/[^\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F0-9\s\.,!?\-~:;'"()\[\]{}%/+\n]/g, '');

  // 3. 공백 정리 (가독성을 위한 줄바꿈 보존)
  cleaned = cleaned.replace(/\n{5,}/g, '\n\n\n\n'); // 최대 4개 줄바꿈 허용
  cleaned = cleaned.replace(/ +/g, ' '); // 연속된 공백만 하나로
  cleaned = cleaned.replace(/\n /g, '\n'); // 줄바꿈 후 공백 제거
  cleaned = cleaned.trim();

  // 4. 최소 길이 검증
  if (cleaned.length < 20) {
    return '죄송합니다. 사주 해석을 생성하는 데 문제가 발생했습니다. 다시 질문해 주세요.';
  }

  return cleaned;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // CORS 설정
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // OPTIONS 요청 처리
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // POST만 허용
  if (request.method !== 'POST') {
    return response.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { prompt, userQuestion } = request.body;

    if (!prompt || !userQuestion) {
      return response.status(400).json({
        success: false,
        error: '프롬프트와 사용자 질문이 필요합니다',
      });
    }

    // 시스템 프롬프트
    const systemPrompt = `당신은 30년 경력의 전문 사주명리학 상담사입니다.

**핵심 원칙:**
1. 100% 순수 한국어로만 작성
2. 사용자의 질문에 직접적으로 답변
3. 사주팔자, 십신, 오행, 용신 등을 활용하여 구체적으로 해석
4. 실천 가능한 조언 제공
5. "사용자님"이라고 쓰기

**가독성을 위한 답변 형식 (필수):**

1. **총평 (2-3줄)**
   - 사주의 전반적인 특징
   - 핵심 운세 한 문장


2. **사주팔자 분석**

   📅 년주: [천간지지]
   - 특징: [1-2줄]

   📅 월주: [천간지지]
   - 특징: [1-2줄]

   📅 일주: [천간지지]
   - 특징: [1-2줄]

   📅 시주: [천간지지]
   - 특징: [1-2줄]


3. **십신 분석**
   - 주요 십신: [십신명]
   - 의미: [2-3줄 해석]
   - 영향: [구체적 영향]


4. **오행 균형**
   - 강한 오행: [오행명]
   - 약한 오행: [오행명]
   - 용신: [용신 설명]


5. **운세 전망**

   ⭐ 즉시 (이번 주):
   - [구체적 운세]

   ⭐ 단기 (이번 달):
   - [구체적 운세]

   ⭐ 중기 (3개월):
   - [구체적 운세]


6. **💡 실천 조언**
   - 강화할 점: [조언]
   - 주의할 점: [조언]
   - 추천 방향: [조언]

**중요 규칙:**
- 각 주요 섹션 사이에 빈 줄 2개 (Enter 2번)
- 각 항목 사이에 빈 줄 1개 (Enter 1번)
- 제목에 이모지 사용 (📅 ⭐ 💡 등)
- 번호 매기기와 불릿 포인트 활용
- 한 문단은 3-4줄 이내로 제한

반드시 순수 한국어로만 작성하고, 위 형식을 정확히 따라주세요. 빈 줄은 실제로 Enter를 눌러 공백을 만드세요.`;

    // AI 제공자 우선순위 시스템 사용
    const userPrompt = `${prompt}\n\n사용자 질문: ${userQuestion}`;
    const aiResult = await callAIWithPriority(systemPrompt, userPrompt);

    if (!aiResult.success || !aiResult.response) {
      throw new Error(aiResult.error || 'AI 응답 생성 실패');
    }

    // 응답 정제
    const cleanedResponse = cleanAIResponse(aiResult.response);

    return response.status(200).json({
      success: true,
      response: cleanedResponse,
      provider: aiResult.provider,
      model: aiResult.model,
      timestamp: aiResult.timestamp,
    });

  } catch (error: any) {
    console.error('[Saju AI] Error:', error);

    return response.status(500).json({
      success: false,
      error: 'AI 응답 생성 중 오류가 발생했습니다',
      details: error.message,
    });
  }
}
