// 십성 분석 유틸리티

import { 
  TenGodsData, 
  TenGodsAnalysis,
  TenGodsBalance,
  PersonalityProfile,
  TenGodsRecommendation,
  TenGodType,
  TEN_GODS_INFO,
  TEN_GODS_CATEGORIES,
  TEN_GODS_THRESHOLDS,
} from '@/types/tenGods';
import { SajuData } from '@/types/saju';

export class TenGodsAnalyzer {
  
  /**
   * 사주 데이터로부터 십성 분석
   */
  static analyzeFromSaju(sajuData: SajuData): TenGodsData {
    const { tenGods } = sajuData;
    
    return {
      bijeon: tenGods.bijeon || 0,
      geopjae: tenGods.geopjae || 0,
      siksin: tenGods.siksin || 0,
      sanggwan: tenGods.sanggwan || 0,
      pyeonjae: tenGods.pyeonjae || 0,
      jeongjae: tenGods.jeongjae || 0,
      pyeongwan: tenGods.pyeongwan || 0,
      jeonggwan: tenGods.jeonggwan || 0,
      pyeongin: tenGods.pyeongin || 0,
      jeongin: tenGods.jeongin || 0,
    };
  }

  /**
   * 종합 십성 분석 실행
   */
  static performFullAnalysis(sajuData: SajuData): TenGodsAnalysis {
    const data = this.analyzeFromSaju(sajuData);
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    
    // 백분율 계산
    const percentages = {} as TenGodsData;
    Object.entries(data).forEach(([key, value]) => {
      percentages[key as TenGodType] = total > 0 ? (value / total) : 0;
    });

    // 강한/약한/없는 십성 판정
    const dominant: TenGodType[] = [];
    const weak: TenGodType[] = [];
    const missing: TenGodType[] = [];
    
    Object.entries(percentages).forEach(([key, percentage]) => {
      const tenGod = key as TenGodType;
      if (data[tenGod] === 0) {
        missing.push(tenGod);
      } else if (percentage >= TEN_GODS_THRESHOLDS.DOMINANT_MIN) {
        dominant.push(tenGod);
      } else if (percentage <= TEN_GODS_THRESHOLDS.WEAK_MAX) {
        weak.push(tenGod);
      }
    });

    const balance = this.calculateBalance(data);
    const personality = this.analyzePersonality(data);
    const recommendations = this.generateRecommendations(data, personality);

    return {
      data,
      total,
      percentages,
      dominant,
      weak,
      missing,
      balance,
      personality,
      recommendations,
    };
  }

  /**
   * 십성 균형도 계산
   */
  private static calculateBalance(data: TenGodsData): TenGodsBalance {
    const values = Object.values(data);
    const total = values.reduce((sum, val) => sum + val, 0);
    
    if (total === 0) {
      return {
        score: 0,
        status: 'poor',
        description: '십성 데이터가 부족합니다',
      };
    }

    // 카테고리별 균형도 계산
    const categoryBalance = Object.entries(TEN_GODS_CATEGORIES).map(([category, info]) => {
      const categorySum = info.tenGods.reduce((sum, tenGod) => sum + data[tenGod], 0);
      return categorySum / total;
    });

    // 분산 계산 (낮을수록 균형)
    const average = 1 / Object.keys(TEN_GODS_CATEGORIES).length;
    const variance = categoryBalance.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / categoryBalance.length;
    
    // 점수 계산 (분산이 낮을수록 높은 점수)
    const score = Math.max(0, Math.min(100, 100 - (variance * 500)));
    
    let status: TenGodsBalance['status'];
    let description: string;
    
    if (score >= TEN_GODS_THRESHOLDS.EXCELLENT_MIN) {
      status = 'excellent';
      description = '매우 균형 잡힌 십성 분포';
    } else if (score >= TEN_GODS_THRESHOLDS.GOOD_MIN) {
      status = 'good';
      description = '균형 잡힌 십성 분포';
    } else if (score >= TEN_GODS_THRESHOLDS.FAIR_MIN) {
      status = 'fair';
      description = '보통 수준의 십성 분포';
    } else {
      status = 'poor';
      description = '불균형한 십성 분포';
    }

    return { score, status, description };
  }

  /**
   * 성격 프로필 분석
   */
  private static analyzePersonality(data: TenGodsData): PersonalityProfile {
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    
    if (total === 0) {
      return {
        leadership: 0,
        creativity: 0,
        stability: 0,
        sociability: 0,
        independence: 0,
        overall: '분석 불가',
      };
    }

    // 각 성향별 점수 계산
    const leadership = Math.round(((data.jeonggwan + data.pyeongwan) / total) * 100);
    const creativity = Math.round(((data.siksin + data.sanggwan) / total) * 100);
    const stability = Math.round(((data.jeongin + data.pyeongin) / total) * 100);
    const sociability = Math.round(((data.jeongjae + data.pyeonjae) / total) * 100);
    const independence = Math.round(((data.bijeon + data.geopjae) / total) * 100);

    // 종합 성향 판정
    const scores = { leadership, creativity, stability, sociability, independence };
    const maxScore = Math.max(...Object.values(scores));
    const dominant = Object.entries(scores).find(([, score]) => score === maxScore)?.[0];

    const overallMap: Record<string, string> = {
      leadership: '리더십형 - 권위와 책임감이 강한 성향',
      creativity: '창의형 - 표현력과 창조성이 뛰어난 성향',
      stability: '안정형 - 학습과 보호본능이 강한 성향',
      sociability: '사교형 - 대인관계와 재물관리에 뛰어난 성향',
      independence: '독립형 - 자아실현과 경쟁에 강한 성향',
    };

    const overall = overallMap[dominant || 'stability'] || '균형형 - 다양한 면에서 고른 성향';

    return {
      leadership,
      creativity,
      stability,
      sociability,
      independence,
      overall,
    };
  }

  /**
   * 맞춤 추천사항 생성
   */
  private static generateRecommendations(
    data: TenGodsData, 
    personality: PersonalityProfile,
  ): TenGodsRecommendation {
    const career = this.getCareerRecommendations(data);
    const relationships = this.getRelationshipAdvice(data, personality);
    const development = this.getDevelopmentSuggestions(data);
    const caution = this.getCautionAreas(data);

    return {
      career,
      relationships,
      development,
      caution,
    };
  }

  private static getCareerRecommendations(data: TenGodsData) {
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    const careers = [];

    // 관성이 강한 경우
    const authorityScore = data.jeonggwan + data.pyeongwan;
    if (authorityScore / total >= 0.2) {
      careers.push({
        field: '관리직, 행정직, 공무원',
        tenGod: 'jeonggwan' as TenGodType,
        suitability: Math.round((authorityScore / total) * 100),
        reason: '강한 관성으로 권위와 책임을 잘 감당할 수 있음',
      });
    }

    // 식상이 강한 경우
    const expressionScore = data.siksin + data.sanggwan;
    if (expressionScore / total >= 0.2) {
      careers.push({
        field: '예술, 창작, 엔터테인먼트',
        tenGod: 'siksin' as TenGodType,
        suitability: Math.round((expressionScore / total) * 100),
        reason: '뛰어난 표현력과 창의성을 활용할 수 있음',
      });
    }

    // 재성이 강한 경우
    const wealthScore = data.jeongjae + data.pyeonjae;
    if (wealthScore / total >= 0.2) {
      careers.push({
        field: '영업, 마케팅, 금융',
        tenGod: 'jeongjae' as TenGodType,
        suitability: Math.round((wealthScore / total) * 100),
        reason: '재물 관리와 대인관계 능력이 뛰어남',
      });
    }

    return careers.length > 0 ? careers : [{
      field: '균형 잡힌 다양한 분야',
      tenGod: 'bijeon' as TenGodType,
      suitability: 70,
      reason: '고른 십성 분포로 다양한 분야에 적응 가능',
    }];
  }

  private static getRelationshipAdvice(data: TenGodsData, personality: PersonalityProfile) {
    const advice = [];

    if (personality.sociability > 30) {
      advice.push({
        type: '대인관계',
        advice: '뛰어난 사교성을 활용하여 네트워킹을 적극적으로 활용하세요',
        basedOn: ['jeongjae', 'pyeonjae'] as TenGodType[],
      });
    }

    if (personality.independence > 30) {
      advice.push({
        type: '자아실현',
        advice: '독립적인 성향을 살려 자신만의 영역을 구축하세요',
        basedOn: ['bijeon', 'geopjae'] as TenGodType[],
      });
    }

    return advice.length > 0 ? advice : [{
      type: '균형발전',
      advice: '다양한 관계를 통해 균형 잡힌 성장을 추구하세요',
      basedOn: ['jeongin'] as TenGodType[],
    }];
  }

  private static getDevelopmentSuggestions(data: TenGodsData) {
    const suggestions = [];
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);

    // 가장 약한 십성 찾기
    const weakest = Object.entries(data)
      .sort(([,a], [,b]) => a - b)
      .slice(0, 2)
      .map(([key]) => key as TenGodType);

    weakest.forEach(tenGod => {
      const info = TEN_GODS_INFO[tenGod];
      suggestions.push({
        area: `${info.koreanName  } 개발`,
        method: `${info.positiveTraits.join(', ')  } 관련 활동 증가`,
        targetTenGod: tenGod,
      });
    });

    return suggestions;
  }

  private static getCautionAreas(data: TenGodsData) {
    const cautions = [];
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);

    // 과도하게 강한 십성 체크
    Object.entries(data).forEach(([key, value]) => {
      if (value / total > 0.3) {
        const tenGod = key as TenGodType;
        const info = TEN_GODS_INFO[tenGod];
        cautions.push({
          issue: `${info.koreanName} 과다`,
          reason: `${info.negativeTraits.join(', ')  } 경향이 나타날 수 있음`,
          solution: `${info.positiveTraits[0]} 측면을 적절히 조절하고 다른 십성을 균형있게 발전시키세요`,
        });
      }
    });

    return cautions;
  }

  /**
   * Chart.js용 수평 바 차트 데이터 생성
   */
  static generateChartData(data: TenGodsData) {
    const labels = Object.keys(data).map(key => 
      `${TEN_GODS_INFO[key as TenGodType].koreanName  }\n${  TEN_GODS_INFO[key as TenGodType].hanja}`,
    );
    
    const values = Object.values(data);
    const colors = Object.keys(data).map(key =>
      TEN_GODS_INFO[key as TenGodType].color.primary,
    );
    
    return {
      labels,
      datasets: [{
        label: '십성 분포',
        data: values,
        backgroundColor: colors.map(color => `${color  }80`), // 투명도 추가
        borderColor: colors,
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }],
    };
  }

  /**
   * 카테고리별 차트 데이터 생성
   */
  static generateCategoryChartData(data: TenGodsData) {
    const categoryData = Object.entries(TEN_GODS_CATEGORIES).map(([category, info]) => {
      const sum = info.tenGods.reduce((total, tenGod) => total + data[tenGod], 0);
      return {
        category,
        name: info.name,
        value: sum,
      };
    });

    return {
      labels: categoryData.map(item => item.name),
      datasets: [{
        data: categoryData.map(item => item.value),
        backgroundColor: [
          '#6366F1', // 자아성
          '#10B981', // 표현성  
          '#EF4444', // 재물성
          '#F59E0B', // 관성
          '#3B82F6',  // 인성
        ],
        borderWidth: 2,
      }],
    };
  }
}