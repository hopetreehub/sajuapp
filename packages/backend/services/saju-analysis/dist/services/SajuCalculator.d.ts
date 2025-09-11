/**
 * 사주 계산 엔진
 * 전통 명리학 기반의 정확한 사주 분석 시스템
 */
export interface SajuData {
    year_pillar: {
        heavenly: string;
        earthly: string;
    };
    month_pillar: {
        heavenly: string;
        earthly: string;
    };
    day_pillar: {
        heavenly: string;
        earthly: string;
    };
    hour_pillar: {
        heavenly: string;
        earthly: string;
    };
    five_elements: {
        wood: number;
        fire: number;
        earth: number;
        metal: number;
        water: number;
    };
    ten_gods: string[];
    birth_info: {
        birth_date: string;
        birth_time: string;
        is_lunar: boolean;
        season: string;
        day_master: string;
    };
    strength: {
        day_master_strength: number;
        seasonal_influence: number;
        supporting_elements: number;
    };
}
export interface CurrentTimePillars {
    current_year: {
        heavenly: string;
        earthly: string;
    };
    current_month: {
        heavenly: string;
        earthly: string;
    };
    current_day: {
        heavenly: string;
        earthly: string;
    };
    current_date: string;
    analysis_timestamp: string;
}
export interface TemporalSajuAnalysis {
    personal_saju: SajuData;
    current_pillars: CurrentTimePillars;
    temporal_interactions: {
        year_interaction: string;
        month_interaction: string;
        day_interaction: string;
    };
    fortune_trends: {
        current_year_fortune: number;
        current_month_fortune: number;
        current_day_fortune: number;
        overall_trend: 'rising' | 'stable' | 'declining';
    };
}
export interface CategoryWeight {
    category_name: string;
    weight: number;
    confidence: number;
    temporal_modifier: number;
}
export interface EnhancedTemporalAnalysis extends TemporalSajuAnalysis {
    positive_categories: {
        [middle_category: string]: CategoryWeight[];
    };
    negative_categories: {
        [middle_category: string]: CategoryWeight[];
    };
    temporal_recommendations: {
        favorable_activities: string[];
        caution_areas: string[];
        optimal_timing: string;
    };
}
export declare class SajuCalculator {
    private readonly heavenlyStems;
    private readonly earthlyBranches;
    private readonly elementMap;
    private readonly branchElementMap;
    private readonly seasonMap;
    /**
     * 메인 사주 계산 함수
     */
    calculateSaju(birthDate: string, birthTime: string, isLunar?: boolean): Promise<SajuData>;
    /**
     * 년주 계산
     */
    private calculateYearPillar;
    /**
     * 월주 계산
     */
    private calculateMonthPillar;
    /**
     * 일주 계산 (간단한 근사치 계산)
     */
    private calculateDayPillar;
    /**
     * 시주 계산
     */
    private calculateHourPillar;
    /**
     * 오행 분석
     */
    private analyzeFiveElements;
    /**
     * 십성 분석 (간단한 버전)
     */
    private analyzeTenGods;
    /**
     * 오행 상생상극 관계 분석
     */
    private getElementRelationship;
    /**
     * 십성명 결정
     */
    private getTenGodName;
    /**
     * 일주 강약 분석
     */
    private analyzeStrength;
    /**
     * 계절별 오행 강약
     */
    private getSeasonalStrength;
    /**
     * 음력-양력 변환 (간단한 근사치)
     * 실제 구현에서는 전문 라이브러리 사용 권장
     */
    private convertLunarToSolar;
    /**
     * 현재 시점의 천간지지 계산 (세운, 월운, 일운)
     * 🎯 핵심 기능: 매년/매월/매일 변화하는 천간지지 계산
     */
    calculateCurrentTimePillars(targetDate?: Date): CurrentTimePillars;
    /**
     * 개인 사주와 현재 시점 천간지지 종합 분석
     * 🔮 핵심: 본명사주 + 세운/월운/일운 = 현재 시점 맞춤 운세
     */
    analyzeTemporalSaju(birthDate: string, birthTime: string, isLunar?: boolean, targetDate?: Date): Promise<TemporalSajuAnalysis>;
    /**
     * 개인 사주와 현재 시점 천간지지의 상호작용 분석
     */
    private analyzeTemporalInteractions;
    /**
     * 기둥 간 상호작용 분석 (사주학적 해석)
     */
    private analyzePillarInteraction;
    /**
     * 현재 시점 운세 점수 계산 (-100 ~ 100점)
     */
    private calculateFortuneTrends;
    /**
     * 상호작용 텍스트를 점수로 변환
     */
    private interactionToScore;
    /**
     * 현재 시점의 기둥 계산
     */
    getCurrentTimePillars(targetDate?: Date): Promise<CurrentTimePillars>;
    /**
     * 🌟 강화된 시점별 주능/주흉 분석
     * 개인 사주 + 현재 시점 + 카테고리 데이터베이스 종합 분석
     */
    analyzeEnhancedTemporalSaju(birthDate: string, birthTime: string, isLunar?: boolean, targetDate?: Date, db?: any): Promise<EnhancedTemporalAnalysis>;
    /**
     * 시점별 카테고리 가중치 계산 및 로드
     */
    private loadTemporalCategories;
    /**
     * 시점별 가중치 조정 계산
     */
    private calculateTemporalModifier;
    /**
     * 시점별 권장사항 생성
     */
    private generateTemporalRecommendations;
}
//# sourceMappingURL=SajuCalculator.d.ts.map