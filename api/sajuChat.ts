/**
 * 사주 AI 채팅 Vercel Function
 *
 * @author Claude Code
 * @version 3.0.0 - Vercel Serverless Function으로 마이그레이션
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

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

  // 3. 공백 정리
  cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n');
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.replace(/\n /g, '\n');
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

**답변 형식:**
사용자님의 질문에 대한 답변을 명확하게 제시하고, 사주명리학의 이론을 근거로 설명해주세요.
운세와 길흉을 직접적으로 판단하고, 구체적인 행동 지침을 제공하세요.

반드시 순수 한국어로만 자연스럽고 명확하게 답변해주세요.`;

    // Google Gemini API 호출
    const geminiApiKey = process.env.GOOGLE_API_KEY;

    if (!geminiApiKey) {
      throw new Error('Google API Key not configured');
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\n${prompt}\n\n사용자 질문: ${userQuestion}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1500,
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // 응답 정제
    const cleanedResponse = cleanAIResponse(aiResponse);

    return response.status(200).json({
      success: true,
      response: cleanedResponse,
      provider: 'google-gemini',
      model: 'gemini-2.0-flash-exp',
      timestamp: new Date().toISOString(),
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
