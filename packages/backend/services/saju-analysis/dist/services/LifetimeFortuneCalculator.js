"use strict";
/**
 * 100년 인생운세 계산 엔진
 * 전통 사주 이론 기반 대운/세운 분석
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LifetimeFortuneCalculator = void 0;
class LifetimeFortuneCalculator {
    constructor() {
        this.천간 = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
        this.지지 = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        this.오행 = {
            '甲': '木', '乙': '木', '丙': '火', '丁': '火',
            '戊': '土', '己': '土', '庚': '金', '辛': '金',
            '壬': '水', '癸': '水',
            '子': '水', '丑': '土', '寅': '木', '卯': '木',
            '辰': '土', '巳': '火', '午': '火', '未': '土',
            '申': '金', '酉': '金', '戌': '土', '亥': '水'
        };
    }
    /**
     * 100년 인생운세 계산
     */
    calculateLifetimeFortune(birthYear, birthMonth, birthDay, birthHour, isLunar = false, gender = 'male') {
        const results = [];
        const currentYear = new Date().getFullYear();
        // 사주 기본 정보 계산
        const 사주 = this.calculate사주(birthYear, birthMonth, birthDay, birthHour);
        const 용신 = this.calculate용신(사주);
        // 100년간 운세 계산
        for (let i = 0; i < 100; i++) {
            const targetYear = birthYear + i;
            const age = i;
            // 대운 계산 (10년 주기)
            const 대운 = this.calculate대운(사주, age, gender);
            // 세운 계산 (연간 운)
            const 세운 = this.calculate세운(targetYear);
            // 종합 점수 계산
            const scores = this.calculateScores(사주, 대운, 세운, 용신, age);
            results.push({
                year: targetYear,
                age: age,
                totalScore: scores.total,
                fortune: scores.fortune,
                willpower: scores.willpower,
                environment: scores.environment,
                change: scores.change,
                대운: 대운,
                세운: 세운
            });
        }
        return results;
    }
    /**
     * 사주 계산
     */
    calculate사주(year, month, day, hour) {
        // 간지력 계산 (실제로는 복잡한 만세력 계산 필요)
        const yearIndex = (year - 4) % 60;
        const yearGan = this.천간[yearIndex % 10];
        const yearJi = this.지지[yearIndex % 12];
        // 월주, 일주, 시주 계산 (간단화된 버전)
        const monthGan = this.천간[(yearIndex * 2 + month) % 10];
        const monthJi = this.지지[(month + 1) % 12];
        const dayGan = this.천간[(year * 5 + month * 30 + day) % 10];
        const dayJi = this.지지[(year * 5 + month * 30 + day) % 12];
        const hourGan = this.천간[(day * 2 + Math.floor(hour / 2)) % 10];
        const hourJi = this.지지[Math.floor(hour / 2) % 12];
        return {
            년주: { 천간: yearGan, 지지: yearJi },
            월주: { 천간: monthGan, 지지: monthJi },
            일주: { 천간: dayGan, 지지: dayJi },
            시주: { 천간: hourGan, 지지: hourJi }
        };
    }
    /**
     * 용신 계산 (오행 균형 분석)
     */
    calculate용신(사주) {
        const 오행점수 = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
        // 사주의 오행 분포 계산
        Object.values(사주).forEach((주) => {
            const 천간오행 = this.오행[주.천간];
            const 지지오행 = this.오행[주.지지];
            오행점수[천간오행]++;
            오행점수[지지오행]++;
        });
        // 가장 약한 오행을 용신으로
        let minScore = 999;
        let 용신 = '木';
        Object.entries(오행점수).forEach(([key, value]) => {
            if (value < minScore) {
                minScore = value;
                용신 = key;
            }
        });
        return 용신;
    }
    /**
     * 대운 계산 (10년 주기)
     */
    calculate대운(사주, age, gender) {
        const 대운주기 = Math.floor(age / 10);
        const 순행 = (gender === 'male' && 사주.년주.천간 in ['甲', '丙', '戊', '庚', '壬']) ||
            (gender === 'female' && 사주.년주.천간 in ['乙', '丁', '己', '辛', '癸']);
        let 대운간지Index = this.천간.indexOf(사주.월주.천간);
        let 대운지지Index = this.지지.indexOf(사주.월주.지지);
        if (순행) {
            대운간지Index = (대운간지Index + 대운주기) % 10;
            대운지지Index = (대운지지Index + 대운주기) % 12;
        }
        else {
            대운간지Index = (대운간지Index - 대운주기 + 10) % 10;
            대운지지Index = (대운지지Index - 대운주기 + 12) % 12;
        }
        const 천간 = this.천간[대운간지Index];
        const 지지 = this.지지[대운지지Index];
        const 오행 = this.오행[천간];
        // 대운 점수 계산 (0-100)
        const score = this.calculate대운Score(사주, 천간, 지지);
        return { 천간, 지지, 오행, score };
    }
    /**
     * 세운 계산 (연간 운)
     */
    calculate세운(year) {
        const yearIndex = (year - 4) % 60;
        const 천간 = this.천간[yearIndex % 10];
        const 지지 = this.지지[yearIndex % 12];
        const 오행 = this.오행[천간];
        // 세운 점수 계산 (0-100)
        const score = 50 + Math.sin(yearIndex * 0.1) * 30;
        return { 천간, 지지, 오행, score };
    }
    /**
     * 대운 점수 계산
     */
    calculate대운Score(사주, 천간, 지지) {
        let score = 50; // 기본 점수
        // 일간과의 관계 분석
        const 일간 = 사주.일주.천간;
        const 일간오행 = this.오행[일간];
        const 대운오행 = this.오행[천간];
        // 상생 관계 점수
        if (this.is상생(일간오행, 대운오행)) {
            score += 20;
        }
        else if (this.is상극(일간오행, 대운오행)) {
            score -= 20;
        }
        // 합충 관계 분석
        if (this.is삼합(지지, 사주)) {
            score += 15;
        }
        if (this.is육합(지지, 사주)) {
            score += 10;
        }
        if (this.is충(지지, 사주)) {
            score -= 15;
        }
        return Math.max(0, Math.min(100, score));
    }
    /**
     * 종합 점수 계산
     */
    calculateScores(사주, 대운, 세운, 용신, age) {
        // 기본 점수 설정
        let baseScore = 50;
        // 나이별 보정 (청년기, 중년기, 노년기)
        if (age < 30) {
            baseScore += 10; // 청년기 보너스
        }
        else if (age > 60) {
            baseScore -= 5; // 노년기 감소
        }
        // 대운 영향 (30%)
        const 대운영향 = 대운.score * 0.3;
        // 세운 영향 (20%)
        const 세운영향 = 세운.score * 0.2;
        // 용신 영향 (20%)
        const 용신점수 = this.calculate용신Score(대운.오행, 세운.오행, 용신);
        const 용신영향 = 용신점수 * 0.2;
        // 종합 점수
        const totalScore = baseScore + 대운영향 + 세운영향 + 용신영향;
        // 4가지 기운 계산
        const fortune = this.calculateFortune(사주, 대운, 세운, age);
        const willpower = this.calculateWillpower(사주, 대운, age);
        const environment = this.calculateEnvironment(대운, 세운, age);
        const change = this.calculateChange(대운, 세운, age);
        return {
            total: Math.max(0, Math.min(100, totalScore)),
            fortune: Math.max(0, Math.min(100, fortune)),
            willpower: Math.max(0, Math.min(100, willpower)),
            environment: Math.max(0, Math.min(100, environment)),
            change: Math.max(0, Math.min(100, change))
        };
    }
    /**
     * 행운 점수 계산 (재물, 명예, 성공운)
     */
    calculateFortune(사주, 대운, 세운, age) {
        let score = 50;
        // 재성 분석
        if (대운.오행 === '金' || 세운.오행 === '金') {
            score += 15;
        }
        // 관성 분석
        if (대운.오행 === '火' || 세운.오행 === '火') {
            score += 10;
        }
        // 나이별 행운 주기
        const fortuneCycle = Math.sin(age * 0.15) * 20;
        score += fortuneCycle;
        return score;
    }
    /**
     * 의지력 점수 계산 (노력, 추진력, 실행력)
     */
    calculateWillpower(사주, 대운, age) {
        let score = 60; // 기본 의지력
        // 비겁성 분석 (자신감, 추진력)
        if (대운.오행 === 사주.일주.천간) {
            score += 20;
        }
        // 나이별 의지력 변화
        if (age >= 20 && age <= 50) {
            score += 15; // 황금기
        }
        return score;
    }
    /**
     * 환경 점수 계산 (대인관계, 외부 지원)
     */
    calculateEnvironment(대운, 세운, age) {
        let score = 55;
        // 인성 분석 (도움, 지원)
        if (대운.오행 === '水' || 세운.오행 === '水') {
            score += 15;
        }
        // 식상 분석 (표현, 소통)
        if (대운.오행 === '木' || 세운.오행 === '木') {
            score += 10;
        }
        // 사회 활동기
        if (age >= 25 && age <= 65) {
            score += 10;
        }
        return score;
    }
    /**
     * 변화 점수 계산 (변동성, 기회, 위기)
     */
    calculateChange(대운, 세운, age) {
        let score = 40;
        // 충 관계 분석 (변화, 변동)
        if (this.has충Relationship(대운.지지, 세운.지지)) {
            score += 30;
        }
        // 대운 전환기
        if (age % 10 === 0 || age % 10 === 9) {
            score += 20;
        }
        // 인생 전환점
        if ([30, 40, 50, 60].includes(age)) {
            score += 15;
        }
        return score;
    }
    /**
     * 용신 점수 계산
     */
    calculate용신Score(대운오행, 세운오행, 용신) {
        let score = 50;
        if (대운오행 === 용신)
            score += 30;
        if (세운오행 === 용신)
            score += 20;
        if (this.is상생(대운오행, 용신))
            score += 15;
        if (this.is상생(세운오행, 용신))
            score += 10;
        return score;
    }
    /**
     * 오행 상생 관계
     */
    is상생(오행1, 오행2) {
        const 상생관계 = {
            '木': '火', '火': '土', '土': '金', '金': '水', '水': '木'
        };
        return 상생관계[오행1] === 오행2;
    }
    /**
     * 오행 상극 관계
     */
    is상극(오행1, 오행2) {
        const 상극관계 = {
            '木': '土', '土': '水', '水': '火', '火': '金', '金': '木'
        };
        return 상극관계[오행1] === 오행2;
    }
    /**
     * 삼합 관계 확인
     */
    is삼합(지지, 사주) {
        const 삼합 = [
            ['申', '子', '辰'], // 수국
            ['寅', '午', '戌'], // 화국
            ['巳', '酉', '丑'], // 금국
            ['亥', '卯', '未'] // 목국
        ];
        const 사주지지 = [사주.년주.지지, 사주.월주.지지, 사주.일주.지지, 사주.시주.지지];
        return 삼합.some(group => group.includes(지지) && group.some(g => 사주지지.includes(g)));
    }
    /**
     * 육합 관계 확인
     */
    is육합(지지, 사주) {
        const 육합 = {
            '子': '丑', '丑': '子',
            '寅': '亥', '亥': '寅',
            '卯': '戌', '戌': '卯',
            '辰': '酉', '酉': '辰',
            '巳': '申', '申': '巳',
            '午': '未', '未': '午'
        };
        const 사주지지 = [사주.년주.지지, 사주.월주.지지, 사주.일주.지지, 사주.시주.지지];
        const 합지지 = 육합[지지];
        return 사주지지.includes(합지지);
    }
    /**
     * 충 관계 확인
     */
    is충(지지, 사주) {
        const 충 = {
            '子': '午', '午': '子',
            '丑': '未', '未': '丑',
            '寅': '申', '申': '寅',
            '卯': '酉', '酉': '卯',
            '辰': '戌', '戌': '辰',
            '巳': '亥', '亥': '巳'
        };
        const 사주지지 = [사주.년주.지지, 사주.월주.지지, 사주.일주.지지, 사주.시주.지지];
        const 충지지 = 충[지지];
        return 사주지지.includes(충지지);
    }
    /**
     * 충 관계 확인 (두 지지 간)
     */
    has충Relationship(지지1, 지지2) {
        const 충 = {
            '子': '午', '午': '子',
            '丑': '未', '未': '丑',
            '寅': '申', '申': '寅',
            '卯': '酉', '酉': '卯',
            '辰': '戌', '戌': '辰',
            '巳': '亥', '亥': '巳'
        };
        return 충[지지1] === 지지2;
    }
}
exports.LifetimeFortuneCalculator = LifetimeFortuneCalculator;
//# sourceMappingURL=LifetimeFortuneCalculator.js.map