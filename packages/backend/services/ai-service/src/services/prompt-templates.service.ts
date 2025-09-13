import { AIRequestType, SajuData } from '@/types/ai.types';
import { logger } from '@/utils/logger';

export interface PromptTemplate {
  id: string;
  type: AIRequestType;
  systemPrompt: string;
  userPromptTemplate: string;
  maxTokens: number;
  temperature: number;
  variables: string[];
  version: string;
  profession?: string;
}

export class PromptTemplatesService {
  private templates: Map<string, PromptTemplate>;

  constructor() {
    this.templates = new Map();
    this.loadDefaultTemplates();
  }

  private loadDefaultTemplates(): void {
    // 기본 운세 해석 템플릿
    this.addTemplate({
      id: 'fortune_daily_general',
      type: AIRequestType.FORTUNE_INTERPRETATION,
      systemPrompt: `당신은 40년 경력의 전통 명리학 전문가입니다. 사주명리학의 깊은 원리를 바탕으로 개인화된 운세 해석을 제공합니다.

전문 지식 영역:
- 음양오행론과 천간지지 상호작용
- 십신(십성) 분석과 격국 판단  
- 120개 신살의 정확한 해석
- 대운과 세운의 길흉 판단
- 일간의 희신과 기신 분석

해석 원칙:
1. 전통 명리학 원리에 충실하되 현대적 언어로 표현
2. 구체적이고 실용적인 조언 제공
3. 부정적 내용도 희망적 메시지와 함께 전달
4. 개인의 성향과 잠재력에 맞춘 맞춤형 해석

언어 스타일: 따뜻하고 지혜로우며, 이해하기 쉬운 한국어`,

      userPromptTemplate: `다음 사주 정보를 바탕으로 {{targetDate}}의 일운세를 해석해주세요.

**개인 정보:**
- 나이: {{currentAge}}세, 성별: {{gender}}
- 직업/관심분야: {{profession}}

**사주 정보:**
연주: {{yearPillar}} | 월주: {{monthPillar}} | 일주: {{dayPillar}} | 시주: {{hourPillar}}

**오행 분석:**
- 주된 기운: {{primaryElement}}
- 보조 기운: {{secondaryElement}}  
- 약한 부분: {{weakness}}
- 강한 부분: {{strength}}

**십신 분석:** {{tenGods}}

**신살 분석:** {{spiritGods}}

**집중 영역:** {{focusAreas}}

해석 요청사항:
1. 오늘의 전반적 운세와 주요 흐름
2. 직업/사업 관련 조언  
3. 인간관계와 소통 방향
4. 건강 관리 포인트
5. 주의사항과 개선 방안
6. 길한 시간대와 방향

500자 내외로 따뜻하고 실용적인 조언을 부탁드립니다.`,

      maxTokens: 800,
      temperature: 0.7,
      variables: ['targetDate', 'currentAge', 'gender', 'profession', 'yearPillar', 'monthPillar', 'dayPillar', 'hourPillar', 'primaryElement', 'secondaryElement', 'weakness', 'strength', 'tenGods', 'spiritGods', 'focusAreas'],
      version: '1.0',
      profession: 'general'
    });

    // 직장인 특화 템플릿
    this.addTemplate({
      id: 'fortune_daily_office_worker',
      type: AIRequestType.FORTUNE_INTERPRETATION,
      systemPrompt: `당신은 직장인 전문 명리학 상담사입니다. 현대 직장 환경에서의 성공과 발전을 위한 사주 기반 조언을 제공합니다.

전문 영역:
- 직장 내 인간관계와 상사-부하 관계 분석
- 승진과 이직 타이밍 조언
- 업무 성과 향상을 위한 방향성 제시
- 직장 스트레스 관리와 업무 효율성 개선
- 팀워크와 리더십 발휘 전략

해석 관점:
- 실무진의 일상적 고민에 공감
- 구체적이고 즉시 실행 가능한 조언
- 직장 정치와 조직 문화 고려
- 워라밸과 성장 동시 추구`,

      userPromptTemplate: `직장인을 위한 {{targetDate}} 운세 해석을 부탁드립니다.

**기본 정보:**
- {{currentAge}}세 {{gender}}, 직급/부서: {{profession}}
- 주요 관심사: {{focusAreas}}

**사주:** {{yearPillar}} {{monthPillar}} {{dayPillar}} {{hourPillar}}
**오행:** {{primaryElement}}(주), {{secondaryElement}}(보조), 약점={{weakness}}
**십신:** {{tenGods}}
**신살:** {{spiritGods}}

직장인 맞춤 해석 요청:
1. 오늘의 업무 컨디션과 집중력
2. 상사/동료와의 소통 포인트  
3. 중요한 업무나 회의 진행 방향
4. 네트워킹과 관계 개선 기회
5. 스트레스 관리 및 컨디션 조절법
6. 이직/승진 관련 흐름 (해당시)

실무에 바로 적용할 수 있는 구체적인 조언 부탁드립니다.`,

      maxTokens: 700,
      temperature: 0.75,
      variables: ['targetDate', 'currentAge', 'gender', 'profession', 'focusAreas', 'yearPillar', 'monthPillar', 'dayPillar', 'hourPillar', 'primaryElement', 'secondaryElement', 'weakness', 'tenGods', 'spiritGods'],
      version: '1.0',
      profession: 'office_worker'
    });

    // 다이어리 인사이트 템플릿
    this.addTemplate({
      id: 'diary_insights_general',
      type: AIRequestType.DIARY_INSIGHTS,
      systemPrompt: `당신은 개인 성찰과 성장을 돕는 라이프 코치입니다. 사주명리학적 관점과 심리학적 통찰을 결합하여 다이어리 내용을 깊이 있게 분석합니다.

코칭 철학:
- 개인의 고유한 특성과 잠재력 존중
- 현실적이고 실천 가능한 개선 방안 제시  
- 감정적 공감과 논리적 분석의 균형
- 과거 경험을 바탕으로 한 미래 성장 가능성 발견

분석 영역:
- 감정 패턴과 사주 특성의 연결점
- 일상 경험에서 드러나는 성향 분석
- 개인 성장을 위한 구체적 액션 플랜
- 스트레스 요인과 해소 방안`,

      userPromptTemplate: `다음 다이어리 내용을 사주 관점에서 분석하고 개인 성찰을 위한 조언을 부탁드립니다.

**다이어리 내용:**
{{diaryContent}}

**오늘의 기분:** {{mood}}/5점

**사주 정보:**
- 기본 사주: {{yearPillar}} {{monthPillar}} {{dayPillar}} {{hourPillar}}
- 성향: {{primaryElement}}형, 보완점={{weakness}}
- 십신: {{tenGods}}

**이전 인사이트 참고:** {{previousInsights}}

분석 요청사항:
1. 다이어리 내용과 사주 특성의 연관성
2. 감정 상태와 오행 불균형 관계 분석
3. 개인 성장을 위한 구체적 제안
4. 내일을 위한 마음가짐과 실천 방안
5. 장기적 발전 방향 제시

따뜻하면서도 통찰력 있는 코칭을 부탁드립니다.`,

      maxTokens: 600,
      temperature: 0.8,
      variables: ['diaryContent', 'mood', 'yearPillar', 'monthPillar', 'dayPillar', 'hourPillar', 'primaryElement', 'weakness', 'tenGods', 'previousInsights'],
      version: '1.0'
    });

    // 창업자/사업자 특화 템플릿
    this.addTemplate({
      id: 'fortune_business_owner',
      type: AIRequestType.FORTUNE_INTERPRETATION,
      systemPrompt: `당신은 사업 운영과 창업에 특화된 명리학 전문가입니다. 사업체의 성공과 발전을 위한 전략적 조언을 제공합니다.

전문 영역:
- 사업 타이밍과 의사결정 포인트 분석
- 파트너십과 투자 관련 길흉 판단
- 마케팅과 영업 전략의 명리학적 접근
- 직원 관리와 조직 운영 조언
- 재무 관리와 현금 흐름 개선 방향

사업 관점:
- 시장 기회와 위험 요소 균형적 분석
- 단기 실적과 장기 비전의 조화
- 경쟁 우위 확보를 위한 차별화 전략
- 지속가능한 성장을 위한 기반 구축`,

      userPromptTemplate: `사업자를 위한 {{targetDate}} 운세 분석을 요청드립니다.

**사업 정보:**
- 업종: {{profession}}, 경력: {{currentAge}}세
- 현재 관심사: {{focusAreas}}

**사주 분석:**
{{yearPillar}} {{monthPillar}} {{dayPillar}} {{hourPillar}}
주요 기운: {{primaryElement}}, 보완 필요: {{weakness}}
십신: {{tenGods}} / 신살: {{spiritGods}}

사업 운영 관점에서의 조언 요청:
1. 오늘의 사업 운과 의사결정 방향
2. 고객/파트너와의 관계 및 협상 포인트
3. 마케팅과 영업 활동 최적 타이밍
4. 투자나 확장 관련 검토사항
5. 직원 관리와 팀 빌딩 방향
6. 재무 관리와 리스크 대응 전략

실무진이 바로 활용할 수 있는 전략적 조언 부탁드립니다.`,

      maxTokens: 800,
      temperature: 0.7,
      variables: ['targetDate', 'profession', 'currentAge', 'focusAreas', 'yearPillar', 'monthPillar', 'dayPillar', 'hourPillar', 'primaryElement', 'weakness', 'tenGods', 'spiritGods'],
      version: '1.0',
      profession: 'business_owner'
    });

    logger.info(`Loaded ${this.templates.size} prompt templates`);
  }

  public addTemplate(template: PromptTemplate): void {
    this.templates.set(template.id, template);
    logger.debug(`Added template: ${template.id}`);
  }

  public getTemplate(templateId: string): PromptTemplate | undefined {
    return this.templates.get(templateId);
  }

  public getTemplatesByType(type: AIRequestType): PromptTemplate[] {
    return Array.from(this.templates.values()).filter(template => template.type === type);
  }

  public getTemplatesByProfession(profession: string): PromptTemplate[] {
    return Array.from(this.templates.values()).filter(template => 
      template.profession === profession || template.profession === 'general'
    );
  }

  public selectBestTemplate(type: AIRequestType, profession?: string): PromptTemplate | undefined {
    // 직업별 특화 템플릿 우선 선택
    if (profession) {
      const professionTemplates = this.getTemplatesByProfession(profession);
      const matchingTemplate = professionTemplates.find(t => t.type === type);
      if (matchingTemplate) return matchingTemplate;
    }

    // 일반 템플릿 fallback
    const generalTemplates = this.getTemplatesByType(type);
    return generalTemplates.find(t => t.profession === 'general') || generalTemplates[0];
  }

  public renderPrompt(templateId: string, variables: Record<string, any>): { systemPrompt: string; userPrompt: string } | null {
    const template = this.getTemplate(templateId);
    if (!template) {
      logger.error(`Template not found: ${templateId}`);
      return null;
    }

    try {
      const systemPrompt = template.systemPrompt;
      let userPrompt = template.userPromptTemplate;

      // 변수 치환
      for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`;
        userPrompt = userPrompt.replace(new RegExp(placeholder, 'g'), String(value || ''));
      }

      // 남은 빈 변수 처리
      userPrompt = userPrompt.replace(/\{\{[^}]+\}\}/g, '정보 없음');

      return { systemPrompt, userPrompt };
    } catch (error) {
      logger.error(`Error rendering template ${templateId}:`, error);
      return null;
    }
  }

  public prepareSajuVariables(sajuData: SajuData): Record<string, string> {
    return {
      currentAge: sajuData.currentAge.toString(),
      gender: sajuData.gender === 'male' ? '남성' : '여성',
      yearPillar: `${sajuData.fourPillars.year.stem}${sajuData.fourPillars.year.branch}`,
      monthPillar: `${sajuData.fourPillars.month.stem}${sajuData.fourPillars.month.branch}`,
      dayPillar: `${sajuData.fourPillars.day.stem}${sajuData.fourPillars.day.branch}`,
      hourPillar: `${sajuData.fourPillars.hour.stem}${sajuData.fourPillars.hour.branch}`,
      primaryElement: sajuData.elements.primary,
      secondaryElement: sajuData.elements.secondary,
      weakness: sajuData.elements.weakness,
      strength: sajuData.elements.strength,
      tenGods: sajuData.tenGods.join(', '),
      spiritGods: sajuData.spiritGods.map(sg => `${sg.name}(${sg.type === 'auspicious' ? '길' : '흉'})`).join(', ')
    };
  }

  public getAllTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }

  public updateTemplate(templateId: string, updates: Partial<PromptTemplate>): boolean {
    const existing = this.templates.get(templateId);
    if (!existing) return false;

    const updated = { ...existing, ...updates };
    this.templates.set(templateId, updated);
    logger.info(`Updated template: ${templateId}`);
    return true;
  }

  public deleteTemplate(templateId: string): boolean {
    const deleted = this.templates.delete(templateId);
    if (deleted) {
      logger.info(`Deleted template: ${templateId}`);
    }
    return deleted;
  }
}

export const promptTemplatesService = new PromptTemplatesService();