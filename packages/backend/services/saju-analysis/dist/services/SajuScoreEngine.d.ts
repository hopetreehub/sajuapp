/**
 * 사주 점수 계산 엔진
 * 주능/주흉 카테고리를 사주와 연결하여 시점별 점수 계산
 */
import { SajuData, CurrentTimePillars } from './SajuCalculator';
export interface CategoryScore {
    category_name: string;
    category_type: 'positive' | 'negative';
    base_score: number;
    daily_score: number;
    monthly_score: number;
    yearly_score: number;
    items: Array<{
        name: string;
        score: number;
        confidence: number;
    }>;
}
export interface ScoreBreakdown {
    saju_influence: number;
    temporal_influence: number;
    category_fitness: number;
    total: number;
}
export interface ComprehensiveScores {
    user_id: string;
    timestamp: string;
    positive_scores: Map<string, CategoryScore>;
    negative_scores: Map<string, CategoryScore>;
    summary: {
        overall_fortune: number;
        trend: 'rising' | 'stable' | 'declining';
        recommendations: string[];
    };
}
export declare class SajuScoreEngine {
    private readonly elementRelations;
    private readonly heavenlyStemScores;
    private readonly earthlyBranchScores;
    /**
     * 종합 점수 계산
     */
    calculateComprehensiveScores(userSaju: SajuData, currentPillars: CurrentTimePillars, categories: any, db: any): Promise<ComprehensiveScores>;
    /**
     * 카테고리별 점수 계산
     */
    private calculateCategoryScore;
    /**
     * 기본 점수 계산 (사주 본연의 점수)
     */
    private calculateBaseScore;
    /**
     * 시점별 점수 계산
     */
    private calculateTemporalScore;
    /**
     * 오행 균형도 평가
     */
    private evaluateElementBalance;
    /**
     * 십성 평가
     */
    private evaluateTenGods;
    /**
     * 천간 상호작용 평가
     */
    private evaluateHeavenlyInteraction;
    /**
     * 지지 상호작용 평가
     */
    private evaluateEarthlyInteraction;
    /**
     * 카테고리별 특수 보정
     */
    private getCategorySpecificAdjustment;
    /**
     * 개별 항목 점수 계산
     */
    private calculateItemScore;
    /**
     * 신뢰도 계산
     */
    private calculateConfidence;
    /**
     * 항목과 오행 매칭
     */
    private matchItemElement;
    /**
     * 카테고리 데이터 로드
     */
    private loadCategories;
    /**
     * 전체 요약 생성
     */
    private generateSummary;
}
//# sourceMappingURL=SajuScoreEngine.d.ts.map