import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  FortuneInterpretationRequest, 
  AIRequestType, 
  FortuneInterpretationSchema 
} from '@/types/ai.types';
import { aiOrchestrator } from '@/services/ai-orchestrator.service';
import { promptTemplatesService } from '@/services/prompt-templates.service';
import { logger, logRequest, logResponse } from '@/utils/logger';

export class FortuneController {
  
  /**
   * 일일 운세 해석
   * POST /api/v1/fortune/daily
   */
  public async getDailyFortune(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const requestId = uuidv4();
    
    try {
      logRequest('POST', '/api/v1/fortune/daily', req.body, req.headers.authorization);
      
      // 입력 유효성 검증
      const validationResult = FortuneInterpretationSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: validationResult.error.errors
        });
        return;
      }
      
      const requestData = validationResult.data;
      const { sajuData, targetDate, profession, focusAreas } = requestData;
      
      // 적절한 프롬프트 템플릿 선택
      const template = promptTemplatesService.selectBestTemplate(
        AIRequestType.FORTUNE_INTERPRETATION, 
        profession || 'general'
      );
      
      if (!template) {
        res.status(500).json({
          success: false,
          error: 'No suitable template found'
        });
        return;
      }
      
      // 템플릿 변수 준비
      const sajuVariables = promptTemplatesService.prepareSajuVariables(sajuData);
      const templateVariables = {
        ...sajuVariables,
        targetDate: new Date(targetDate).toLocaleDateString('ko-KR'),
        profession: profession || '일반',
        focusAreas: focusAreas?.join(', ') || '전반적인 운세'
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
      const aiRequest: FortuneInterpretationRequest = {
        id: requestId,
        systemPrompt: prompts.systemPrompt,
        userPrompt: prompts.userPrompt,
        maxTokens: template.maxTokens,
        temperature: template.temperature,
        requestType: AIRequestType.FORTUNE_INTERPRETATION,
        sajuData,
        targetDate,
        interpretationType: 'daily',
        profession,
        focusAreas,
        userId: req.headers.authorization,
        metadata: {
          templateId: template.id,
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
      
      // 성공 응답
      const response = {
        success: true,
        data: {
          interpretation: aiResponse.content,
          date: targetDate,
          sajuSummary: {
            fourPillars: sajuData.fourPillars,
            primaryElement: sajuData.elements.primary,
            age: sajuData.currentAge,
            gender: sajuData.gender
          },
          metadata: {
            provider: aiResponse.provider,
            model: aiResponse.model,
            tokenUsage: aiResponse.tokenUsage,
            responseTime: aiResponse.responseTime,
            cost: aiResponse.cost,
            templateUsed: template.id
          }
        }
      };
      
      res.json(response);
      logResponse('POST', '/api/v1/fortune/daily', 200, Date.now() - startTime);
      
    } catch (error) {
      logger.error('Daily fortune request failed:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        requestId
      });
      logResponse('POST', '/api/v1/fortune/daily', 500, Date.now() - startTime);
    }
  }
  
  /**
   * 주간 운세 해석
   * POST /api/v1/fortune/weekly
   */
  public async getWeeklyFortune(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const requestId = uuidv4();
    
    try {
      logRequest('POST', '/api/v1/fortune/weekly', req.body);
      
      const validationResult = FortuneInterpretationSchema.safeParse({
        ...req.body,
        interpretationType: 'weekly'
      });
      
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: validationResult.error.errors
        });
        return;
      }
      
      const requestData = validationResult.data;
      
      // Weekly fortune template (can be specialized later)
      const template = promptTemplatesService.selectBestTemplate(
        AIRequestType.FORTUNE_INTERPRETATION,
        requestData.profession || 'general'
      );
      
      if (!template) {
        res.status(500).json({
          success: false,
          error: 'No suitable template found'
        });
        return;
      }
      
      // Modify template for weekly interpretation
      const sajuVariables = promptTemplatesService.prepareSajuVariables(requestData.sajuData);
      const weekStart = new Date(requestData.targetDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const templateVariables = {
        ...sajuVariables,
        targetDate: `${weekStart.toLocaleDateString('ko-KR')} ~ ${weekEnd.toLocaleDateString('ko-KR')}`,
        profession: requestData.profession || '일반',
        focusAreas: requestData.focusAreas?.join(', ') || '전반적인 운세'
      };
      
      const prompts = promptTemplatesService.renderPrompt(template.id, templateVariables);
      if (!prompts) {
        res.status(500).json({
          success: false,
          error: 'Failed to render prompt template'
        });
        return;
      }
      
      // Modify system prompt for weekly context
      const weeklySystemPrompt = prompts.systemPrompt.replace(
        '일운세를', '주간운세를'
      );
      
      const aiRequest: FortuneInterpretationRequest = {
        id: requestId,
        systemPrompt: weeklySystemPrompt,
        userPrompt: prompts.userPrompt,
        maxTokens: template.maxTokens + 200, // Slightly more for weekly
        temperature: template.temperature,
        requestType: AIRequestType.FORTUNE_INTERPRETATION,
        sajuData: requestData.sajuData,
        targetDate: requestData.targetDate,
        interpretationType: 'weekly',
        profession: requestData.profession,
        focusAreas: requestData.focusAreas,
        userId: req.headers.authorization,
        metadata: {
          templateId: template.id,
          weekRange: `${weekStart.toISOString()} - ${weekEnd.toISOString()}`,
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
      
      const response = {
        success: true,
        data: {
          interpretation: aiResponse.content,
          weekStart: weekStart.toISOString(),
          weekEnd: weekEnd.toISOString(),
          sajuSummary: {
            fourPillars: requestData.sajuData.fourPillars,
            primaryElement: requestData.sajuData.elements.primary,
            age: requestData.sajuData.currentAge,
            gender: requestData.sajuData.gender
          },
          metadata: {
            provider: aiResponse.provider,
            model: aiResponse.model,
            tokenUsage: aiResponse.tokenUsage,
            responseTime: aiResponse.responseTime,
            cost: aiResponse.cost,
            templateUsed: template.id
          }
        }
      };
      
      res.json(response);
      logResponse('POST', '/api/v1/fortune/weekly', 200, Date.now() - startTime);
      
    } catch (error) {
      logger.error('Weekly fortune request failed:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        requestId
      });
      logResponse('POST', '/api/v1/fortune/weekly', 500, Date.now() - startTime);
    }
  }
  
  /**
   * 월간 운세 해석
   * POST /api/v1/fortune/monthly
   */
  public async getMonthlyFortune(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const requestId = uuidv4();
    
    try {
      logRequest('POST', '/api/v1/fortune/monthly', req.body);
      
      const validationResult = FortuneInterpretationSchema.safeParse({
        ...req.body,
        interpretationType: 'monthly'
      });
      
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: validationResult.error.errors
        });
        return;
      }
      
      const requestData = validationResult.data;
      
      const template = promptTemplatesService.selectBestTemplate(
        AIRequestType.FORTUNE_INTERPRETATION,
        requestData.profession || 'general'
      );
      
      if (!template) {
        res.status(500).json({
          success: false,
          error: 'No suitable template found'
        });
        return;
      }
      
      // Monthly context preparation
      const sajuVariables = promptTemplatesService.prepareSajuVariables(requestData.sajuData);
      const targetMonth = new Date(requestData.targetDate);
      const monthName = targetMonth.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
      
      const templateVariables = {
        ...sajuVariables,
        targetDate: monthName,
        profession: requestData.profession || '일반',
        focusAreas: requestData.focusAreas?.join(', ') || '전반적인 운세'
      };
      
      const prompts = promptTemplatesService.renderPrompt(template.id, templateVariables);
      if (!prompts) {
        res.status(500).json({
          success: false,
          error: 'Failed to render prompt template'
        });
        return;
      }
      
      // Modify for monthly context
      const monthlySystemPrompt = prompts.systemPrompt.replace(
        '일운세를', '월간운세를'
      );
      
      const aiRequest: FortuneInterpretationRequest = {
        id: requestId,
        systemPrompt: monthlySystemPrompt,
        userPrompt: prompts.userPrompt,
        maxTokens: template.maxTokens + 400, // More tokens for monthly
        temperature: template.temperature,
        requestType: AIRequestType.FORTUNE_INTERPRETATION,
        sajuData: requestData.sajuData,
        targetDate: requestData.targetDate,
        interpretationType: 'monthly',
        profession: requestData.profession,
        focusAreas: requestData.focusAreas,
        userId: req.headers.authorization,
        metadata: {
          templateId: template.id,
          month: monthName,
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
      
      const response = {
        success: true,
        data: {
          interpretation: aiResponse.content,
          month: monthName,
          year: targetMonth.getFullYear(),
          sajuSummary: {
            fourPillars: requestData.sajuData.fourPillars,
            primaryElement: requestData.sajuData.elements.primary,
            age: requestData.sajuData.currentAge,
            gender: requestData.sajuData.gender
          },
          metadata: {
            provider: aiResponse.provider,
            model: aiResponse.model,
            tokenUsage: aiResponse.tokenUsage,
            responseTime: aiResponse.responseTime,
            cost: aiResponse.cost,
            templateUsed: template.id
          }
        }
      };
      
      res.json(response);
      logResponse('POST', '/api/v1/fortune/monthly', 200, Date.now() - startTime);
      
    } catch (error) {
      logger.error('Monthly fortune request failed:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        requestId
      });
      logResponse('POST', '/api/v1/fortune/monthly', 500, Date.now() - startTime);
    }
  }
}