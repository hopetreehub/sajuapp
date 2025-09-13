import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  DiaryInsightRequest, 
  AIRequestType, 
  DiaryInsightSchema 
} from '@/types/ai.types';
import { aiOrchestrator } from '@/services/ai-orchestrator.service';
import { promptTemplatesService } from '@/services/prompt-templates.service';
import { logger, logRequest, logResponse } from '@/utils/logger';

export class DiaryController {
  
  /**
   * 다이어리 인사이트 분석
   * POST /api/v1/diary/insights
   */
  public async getDiaryInsights(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const requestId = uuidv4();
    
    try {
      logRequest('POST', '/api/v1/diary/insights', req.body, req.headers.authorization);
      
      // 입력 유효성 검증
      const validationResult = DiaryInsightSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: validationResult.error.errors
        });
        return;
      }
      
      const requestData = validationResult.data;
      const { diaryContent, mood, sajuData, previousInsights } = requestData;
      
      // 적절한 프롬프트 템플릿 선택
      const template = promptTemplatesService.selectBestTemplate(
        AIRequestType.DIARY_INSIGHTS
      );
      
      if (!template) {
        res.status(500).json({
          success: false,
          error: 'No suitable diary insight template found'
        });
        return;
      }
      
      // 템플릿 변수 준비
      const sajuVariables = promptTemplatesService.prepareSajuVariables(sajuData);
      const moodDescription = this.getMoodDescription(mood);
      
      const templateVariables = {
        ...sajuVariables,
        diaryContent: diaryContent.trim(),
        mood: `${mood}점 (${moodDescription})`,
        previousInsights: previousInsights?.join('\n') || '이전 인사이트 없음'
      };
      
      // 프롬프트 렌더링
      const prompts = promptTemplatesService.renderPrompt(template.id, templateVariables);
      if (!prompts) {
        res.status(500).json({
          success: false,
          error: 'Failed to render prompt template'
        });
        return;
      }
      
      // AI 요청 준비
      const aiRequest: DiaryInsightRequest = {
        id: requestId,
        systemPrompt: prompts.systemPrompt,
        userPrompt: prompts.userPrompt,
        maxTokens: template.maxTokens,
        temperature: template.temperature,
        requestType: AIRequestType.DIARY_INSIGHTS,
        diaryContent,
        mood,
        sajuData,
        previousInsights,
        userId: req.headers.authorization,
        metadata: {
          templateId: template.id,
          diaryLength: diaryContent.length,
          moodScore: mood,
          requestTimestamp: new Date().toISOString()
        }
      };
      
      // AI 서비스 처리
      const aiResponse = await aiOrchestrator.processRequest(aiRequest);
      
      if (!aiResponse.success) {
        res.status(503).json({
          success: false,
          error: 'AI service temporarily unavailable',
          details: aiResponse.error
        });
        return;
      }
      
      // 인사이트 구조화
      const structuredInsight = this.structureInsight(aiResponse.content);
      
      // 성공 응답
      const response = {
        success: true,
        data: {
          insight: {
            content: aiResponse.content,
            structured: structuredInsight,
            mood: {
              score: mood,
              description: moodDescription,
              analysis: structuredInsight.moodAnalysis
            },
            recommendations: structuredInsight.recommendations,
            sajuConnection: structuredInsight.sajuConnection
          },
          metadata: {
            provider: aiResponse.provider,
            model: aiResponse.model,
            tokenUsage: aiResponse.tokenUsage,
            responseTime: aiResponse.responseTime,
            cost: aiResponse.cost,
            templateUsed: template.id,
            analysisDate: new Date().toISOString()
          }
        }
      };
      
      res.json(response);
      logResponse('POST', '/api/v1/diary/insights', 200, Date.now() - startTime);
      
    } catch (error) {
      logger.error('Diary insights request failed:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        requestId
      });
      logResponse('POST', '/api/v1/diary/insights', 500, Date.now() - startTime);
    }
  }
  
  /**
   * 다이어리 기반 개인 조언
   * POST /api/v1/diary/advice
   */
  public async getPersonalAdvice(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const requestId = uuidv4();
    
    try {
      logRequest('POST', '/api/v1/diary/advice', req.body);
      
      const validationResult = DiaryInsightSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: validationResult.error.errors
        });
        return;
      }
      
      const requestData = validationResult.data;
      
      // 조언 특화 템플릿 (기존 템플릿 수정)
      const template = promptTemplatesService.selectBestTemplate(
        AIRequestType.DIARY_INSIGHTS
      );
      
      if (!template) {
        res.status(500).json({
          success: false,
          error: 'No suitable template found'
        });
        return;
      }
      
      const sajuVariables = promptTemplatesService.prepareSajuVariables(requestData.sajuData);
      const templateVariables = {
        ...sajuVariables,
        diaryContent: requestData.diaryContent.trim(),
        mood: `${requestData.mood}점`,
        previousInsights: requestData.previousInsights?.join('\n') || '이전 인사이트 없음'
      };
      
      const prompts = promptTemplatesService.renderPrompt(template.id, templateVariables);
      if (!prompts) {
        res.status(500).json({
          success: false,
          error: 'Failed to render prompt template'
        });
        return;
      }
      
      // 조언 중심의 시스템 프롬프트 수정
      const adviceSystemPrompt = prompts.systemPrompt + `\n\n특별 지침: 분석보다는 구체적이고 실천 가능한 조언에 집중하세요. 다음 내용을 포함해주세요:
1. 오늘의 경험에서 배울 점
2. 내일을 위한 구체적 행동 계획
3. 장기적 성장을 위한 방향성
4. 사주 특성을 활용한 개인화된 전략`;
      
      const aiRequest: DiaryInsightRequest = {
        id: requestId,
        systemPrompt: adviceSystemPrompt,
        userPrompt: prompts.userPrompt,
        maxTokens: template.maxTokens + 200,
        temperature: template.temperature + 0.1, // 약간 더 창의적으로
        requestType: AIRequestType.DAILY_ADVICE,
        diaryContent: requestData.diaryContent,
        mood: requestData.mood,
        sajuData: requestData.sajuData,
        previousInsights: requestData.previousInsights,
        userId: req.headers.authorization,
        metadata: {
          templateId: template.id + '_advice',
          requestType: 'personal_advice',
          requestTimestamp: new Date().toISOString()
        }
      };
      
      const aiResponse = await aiOrchestrator.processRequest(aiRequest);
      
      if (!aiResponse.success) {
        res.status(503).json({
          success: false,
          error: 'AI service temporarily unavailable',
          details: aiResponse.error
        });
        return;
      }
      
      // 조언 구조화
      const structuredAdvice = this.structureAdvice(aiResponse.content);
      
      const response = {
        success: true,
        data: {
          advice: {
            content: aiResponse.content,
            structured: structuredAdvice,
            actionItems: structuredAdvice.actionItems,
            longTermGoals: structuredAdvice.longTermGoals,
            sajuGuidance: structuredAdvice.sajuGuidance
          },
          metadata: {
            provider: aiResponse.provider,
            model: aiResponse.model,
            tokenUsage: aiResponse.tokenUsage,
            responseTime: aiResponse.responseTime,
            cost: aiResponse.cost,
            templateUsed: template.id,
            adviceDate: new Date().toISOString()
          }
        }
      };
      
      res.json(response);
      logResponse('POST', '/api/v1/diary/advice', 200, Date.now() - startTime);
      
    } catch (error) {
      logger.error('Personal advice request failed:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        requestId
      });
      logResponse('POST', '/api/v1/diary/advice', 500, Date.now() - startTime);
    }
  }
  
  /**
   * 기분 점수를 설명으로 변환
   */
  private getMoodDescription(mood: number): string {
    const moodMap: Record<number, string> = {
      1: '매우 나쁨',
      2: '나쁨',
      3: '보통',
      4: '좋음',
      5: '매우 좋음'
    };
    return moodMap[mood] || '알 수 없음';
  }
  
  /**
   * AI 응답을 구조화된 인사이트로 변환
   */
  private structureInsight(content: string): {
    moodAnalysis: string;
    sajuConnection: string;
    recommendations: string[];
    keyInsights: string[];
  } {
    // 간단한 구조화 - 실제로는 더 정교한 파싱 로직 필요
    const lines = content.split('\n').filter(line => line.trim());
    
    let moodAnalysis = '';
    let sajuConnection = '';
    const recommendations: string[] = [];
    const keyInsights: string[] = [];
    
    let currentSection = '';
    
    for (const line of lines) {
      if (line.includes('감정') || line.includes('기분') || line.includes('마음')) {
        currentSection = 'mood';
        moodAnalysis += line + ' ';
      } else if (line.includes('사주') || line.includes('명리') || line.includes('오행')) {
        currentSection = 'saju';
        sajuConnection += line + ' ';
      } else if (line.includes('추천') || line.includes('조언') || line.includes('제안')) {
        currentSection = 'recommendations';
        recommendations.push(line);
      } else if (line.includes('인사이트') || line.includes('깨달음') || line.includes('학습')) {
        currentSection = 'insights';
        keyInsights.push(line);
      } else {
        // 현재 섹션에 계속 추가
        if (currentSection === 'mood') moodAnalysis += line + ' ';
        else if (currentSection === 'saju') sajuConnection += line + ' ';
        else if (currentSection === 'recommendations') recommendations.push(line);
        else if (currentSection === 'insights') keyInsights.push(line);
      }
    }
    
    return {
      moodAnalysis: moodAnalysis.trim() || content.substring(0, 200),
      sajuConnection: sajuConnection.trim() || '사주 관련 분석 없음',
      recommendations: recommendations.length ? recommendations : [content.substring(0, 150)],
      keyInsights: keyInsights.length ? keyInsights : ['종합적인 인사이트가 필요합니다']
    };
  }
  
  /**
   * AI 응답을 구조화된 조언으로 변환
   */
  private structureAdvice(content: string): {
    actionItems: string[];
    longTermGoals: string[];
    sajuGuidance: string;
    summary: string;
  } {
    const lines = content.split('\n').filter(line => line.trim());
    
    const actionItems: string[] = [];
    const longTermGoals: string[] = [];
    let sajuGuidance = '';
    
    for (const line of lines) {
      if (line.includes('실천') || line.includes('행동') || line.includes('오늘') || line.includes('내일')) {
        actionItems.push(line);
      } else if (line.includes('장기') || line.includes('목표') || line.includes('비전') || line.includes('성장')) {
        longTermGoals.push(line);
      } else if (line.includes('사주') || line.includes('명리') || line.includes('특성')) {
        sajuGuidance += line + ' ';
      }
    }
    
    return {
      actionItems: actionItems.length ? actionItems : ['구체적인 행동 계획이 필요합니다'],
      longTermGoals: longTermGoals.length ? longTermGoals : ['장기 목표 설정이 필요합니다'],
      sajuGuidance: sajuGuidance.trim() || '개인 특성을 활용한 맞춤 조언이 필요합니다',
      summary: content.substring(0, 200) + '...'
    };
  }
}