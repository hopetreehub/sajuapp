/**
 * 귀문둔갑 AI 챗 라우트
 *
 * Claude API를 사용하여 귀문둔갑 관련 질문에 답변
 * @author Claude Code
 * @version 1.0.0
 */

import express, { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();

// Anthropic SDK 초기화
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * POST /api/v1/qimen/chat
 * 귀문둔갑 AI 채팅 엔드포인트
 */
router.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt, userQuestion } = req.body;

    if (!prompt || !userQuestion) {
      return res.status(400).json({
        success: false,
        error: 'prompt와 userQuestion은 필수입니다.',
      });
    }

    logger.info('🤖 [귀문둔갑 AI] 요청 받음:', {
      questionLength: userQuestion.length,
      promptLength: prompt.length,
    });

    // Claude API 호출
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // 응답 추출
    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    logger.info('✅ [귀문둔갑 AI] 응답 생성 완료');

    res.json({
      success: true,
      response: responseText,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
      },
    });

  } catch (error: any) {
    logger.error('❌ [귀문둔갑 AI] 오류 발생:', error);

    // Anthropic API 에러 처리
    if (error.status === 401) {
      return res.status(401).json({
        success: false,
        error: 'API 키가 유효하지 않습니다.',
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
      });
    }

    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.',
      details: error.message,
    });
  }
});

/**
 * POST /api/v1/qimen/interpret
 * 귀문둔갑 차트 전체 해석 (한 번에 전체 해석 요청)
 */
router.post('/interpret', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chart, context, customerInfo } = req.body;

    if (!chart) {
      return res.status(400).json({
        success: false,
        error: 'chart 정보는 필수입니다.',
      });
    }

    logger.info('📊 [귀문둔갑 AI] 전체 해석 요청');

    // 전체 해석 프롬프트 생성
    const interpretPrompt = `
당신은 전문 귀문둔갑(奇門遁甲) 상담사입니다. 다음 정보를 바탕으로 종합적인 해석을 제공해주세요.

## 귀문둔갑 차트 정보
- 국(局): ${chart.yinYang === 'yang' ? '양둔' : '음둔'} ${chart.ju}국
- 절기: ${chart.solarTerm.name}
- 시간 간지: ${chart.hourGanZhi.gan}${chart.hourGanZhi.zhi}
- 전체 점수: ${chart.overallFortune.score}점

${context && context !== 'general' ? `\n## 상담 목적\n- ${context}\n` : ''}

${customerInfo ? `\n## 고객 정보\n- 이름: ${customerInfo.name}\n- 생년월일: ${customerInfo.birthDate}\n` : ''}

## 요청사항
다음 항목에 대해 친절하고 이해하기 쉽게 설명해주세요:

1. 현재 시간의 전반적인 길흉과 의미
2. 가장 좋은 방위와 그 이유
3. 조심해야 할 방위와 주의사항
4. ${context !== 'general' ? `${context} 목적에 특화된` : '일상생활을 위한'} 실용적인 조언

답변은 공손하고 따뜻한 말투로, 2-3문단 정도로 작성해주세요.
`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: interpretPrompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    logger.info('✅ [귀문둔갑 AI] 전체 해석 완료');

    res.json({
      success: true,
      interpretation: responseText,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
      },
    });

  } catch (error: any) {
    logger.error('❌ [귀문둔갑 AI] 해석 오류:', error);
    res.status(500).json({
      success: false,
      error: '해석 생성 중 오류가 발생했습니다.',
      details: error.message,
    });
  }
});

export default router;
