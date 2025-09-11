/**
 * 향상된 사주 점수 계산 엔진
 * 전통 명리학 기반의 정교한 적성 점수 시스템
 */
import { SajuData, CurrentTimePillars } from './SajuCalculator';
export interface DetailedCategoryScore {
    category_name: string;
    category_type: 'positive' | 'negative';
    base_score: number;
    daily_score: number;
    monthly_score: number;
    yearly_score: number;
    score_breakdown: {
        element_affinity: number;
        ten_gods_harmony: number;
        pillar_strength: number;
        seasonal_bonus: number;
    };
    confidence_level: number;
    items: Array<{
        name: string;
        individual_score: number;
        affinity_reason: string;
        confidence: number;
    }>;
}
export interface SajuAptitudeAnalysis {
    element_dominance: {
        primary: string;
        secondary: string;
        balance_score: number;
    };
    ten_gods_profile: {
        dominant_gods: string[];
        personality_type: string;
        career_inclination: string;
    };
    strengths: string[];
    weaknesses: string[];
    optimal_careers: string[];
}
export declare class EnhancedSajuScoreEngine {
    private readonly elementAptitudes;
    private readonly tenGodsAptitudes;
    private readonly seasonalBonus;
    /**
     * 향상된 카테고리별 점수 계산
     */
    calculateEnhancedCategoryScore(userSaju: SajuData, currentPillars: CurrentTimePillars, categoryName: string, items: any[], type: 'positive' | 'negative'): DetailedCategoryScore;
    /**
     * 오행 친화도 계산 (0-40점)
     */
    private calculateElementAffinity;
    /**
     * 십성 조화도 계산 (0-30점)
     */
    private calculateTenGodsHarmony;
    /**
     * 기둥 강도 계산 (0-20점)
     */
    private calculatePillarStrength;
    /**
     * 계절 보너스 계산 (0-10점)
     */
    private calculateSeasonalBonus;
    /**
     * 시점별 점수 계산
     */
    private calculateTemporalScore;
    /**
     * 항목별 상세 분석
     */
    private calculateDetailedItems;
    /**
     * 개별 항목 점수 계산
     */
    private calculateIndividualItemScore;
    /**
     * 신뢰도 계산
     */
    private calculateConfidenceLevel;
    private getElementFromStem;
    private getDominantElement;
    private getElementKey;
    private isGeneratingRelation;
    private isSupportingRelation;
    private isRelatedActivity;
    private getHeavenlyRelation;
    private getEarthlyRelation;
    private getRelationScore;
    private getAffinityReason;
    private calculateItemConfidence;
    private getItemElementBonus;
    private getItemTenGodBonus;
    private getCategorySpecificBonus;
    private calculateSajuCompleteness;
    private calculateElementBalance;
}
//# sourceMappingURL=EnhancedSajuScoreEngine.d.ts.map