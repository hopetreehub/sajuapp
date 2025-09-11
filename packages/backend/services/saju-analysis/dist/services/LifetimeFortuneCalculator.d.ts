/**
 * 100년 인생운세 계산 엔진
 * 전통 사주 이론 기반 대운/세운 분석
 */
interface YearlyFortune {
    year: number;
    age: number;
    totalScore: number;
    fortune: number;
    willpower: number;
    environment: number;
    change: number;
    대운: {
        천간: string;
        지지: string;
        오행: string;
        score: number;
    };
    세운: {
        천간: string;
        지지: string;
        오행: string;
        score: number;
    };
}
export declare class LifetimeFortuneCalculator {
    private 천간;
    private 지지;
    private 오행;
    /**
     * 100년 인생운세 계산
     */
    calculateLifetimeFortune(birthYear: number, birthMonth: number, birthDay: number, birthHour: number, isLunar?: boolean, gender?: 'male' | 'female'): YearlyFortune[];
    /**
     * 사주 계산
     */
    private calculate사주;
    /**
     * 용신 계산 (오행 균형 분석)
     */
    private calculate용신;
    /**
     * 대운 계산 (10년 주기)
     */
    private calculate대운;
    /**
     * 세운 계산 (연간 운)
     */
    private calculate세운;
    /**
     * 대운 점수 계산
     */
    private calculate대운Score;
    /**
     * 종합 점수 계산
     */
    private calculateScores;
    /**
     * 행운 점수 계산 (재물, 명예, 성공운)
     */
    private calculateFortune;
    /**
     * 의지력 점수 계산 (노력, 추진력, 실행력)
     */
    private calculateWillpower;
    /**
     * 환경 점수 계산 (대인관계, 외부 지원)
     */
    private calculateEnvironment;
    /**
     * 변화 점수 계산 (변동성, 기회, 위기)
     */
    private calculateChange;
    /**
     * 용신 점수 계산
     */
    private calculate용신Score;
    /**
     * 오행 상생 관계
     */
    private is상생;
    /**
     * 오행 상극 관계
     */
    private is상극;
    /**
     * 삼합 관계 확인
     */
    private is삼합;
    /**
     * 육합 관계 확인
     */
    private is육합;
    /**
     * 충 관계 확인
     */
    private is충;
    /**
     * 충 관계 확인 (두 지지 간)
     */
    private has충Relationship;
}
export {};
//# sourceMappingURL=LifetimeFortuneCalculator.d.ts.map