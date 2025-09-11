import sqlite3 from 'sqlite3';
import { SajuData } from './SajuCalculator';
/**
 * 적성 분석 엔진
 * 사주 데이터를 바탕으로 주능/주흉 분석 수행
 */
export interface AptitudeResult {
    positive: {
        [category: string]: {
            items: string[];
            confidence: number;
            reasoning: string;
        };
    };
    negative: {
        [category: string]: {
            items: string[];
            risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
            reasoning: string;
        };
    };
    confidence: number;
    summary: string;
}
export declare class AptitudeAnalyzer {
    private db;
    constructor(database: sqlite3.Database);
    /**
     * 메인 적성 분석 함수
     */
    analyzeAptitude(sajuData: SajuData): Promise<AptitudeResult>;
    /**
     * 카테고리 데이터 로드
     */
    private loadCategories;
    /**
     * 주능 (긍정적 적성) 분석
     */
    private analyzePositiveAptitudes;
    /**
     * 주흉 (주의사항) 분석
     */
    private analyzeNegativeWarnings;
    /**
     * 카테고리별 분석
     */
    private analyzeCategory;
    /**
     * 게임 분야 분석
     */
    private analyzeGaming;
    /**
     * 과목 분야 분석
     */
    private analyzeSubjects;
    /**
     * 무용 분야 분석
     */
    private analyzeDance;
    /**
     * 문학 분야 분석
     */
    private analyzeLiterature;
    /**
     * 미술 분야 분석
     */
    private analyzeArts;
    /**
     * 연예 분야 분석
     */
    private analyzeEntertainment;
    /**
     * 음악 분야 분석
     */
    private analyzeMusic;
    /**
     * 전공 분야 분석
     */
    private analyzeMajors;
    /**
     * 체능 분야 분석
     */
    private analyzeSports;
    /**
     * 교통사고 위험 분석
     */
    private analyzeTrafficRisks;
    /**
     * 법적 사건 위험 분석
     */
    private analyzeLegalRisks;
    /**
     * 일반 사고 위험 분석
     */
    private analyzeAccidentRisks;
    /**
     * 도로별 위험 분석
     */
    private analyzeRoadRisks;
    /**
     * 천간에서 오행 추출
     */
    private getElementFromStem;
    /**
     * 위험도 계산
     */
    private calculateRiskLevel;
    /**
     * 전체 신뢰도 계산
     */
    private calculateOverallConfidence;
    /**
     * 분석 요약 생성
     */
    private generateSummary;
}
//# sourceMappingURL=AptitudeAnalyzer.d.ts.map