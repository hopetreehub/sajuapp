"use strict";
/**
 * 사주 점수 계산 엔진
 * 주능/주흉 카테고리를 사주와 연결하여 시점별 점수 계산
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SajuScoreEngine = void 0;
class SajuScoreEngine {
    constructor() {
        // 오행 상성상극 관계 정의
        this.elementRelations = {
            생: {
                목: '화', 화: '토', 토: '금', 금: '수', 수: '목'
            },
            극: {
                목: '토', 토: '수', 수: '화', 화: '금', 금: '목'
            }
        };
        // 천간 관계 점수
        this.heavenlyStemScores = {
            상생: 20,
            상극: -20,
            합: 30,
            충: -30,
            동일: 10
        };
        // 지지 관계 점수
        this.earthlyBranchScores = {
            삼합: 30,
            육합: 25,
            방합: 20,
            충: -30,
            형: -20,
            파: -15,
            해: -10
        };
    }
    /**
     * 종합 점수 계산
     */
    async calculateComprehensiveScores(userSaju, currentPillars, categories, db) {
        const positiveScores = new Map();
        const negativeScores = new Map();
        // 주능 카테고리 점수 계산
        const positiveCategories = await this.loadCategories(db, 'positive');
        for (const [categoryName, items] of Object.entries(positiveCategories)) {
            const score = this.calculateCategoryScore(userSaju, currentPillars, categoryName, items, 'positive');
            positiveScores.set(categoryName, score);
        }
        // 주흉 카테고리 점수 계산
        const negativeCategories = await this.loadCategories(db, 'negative');
        for (const [categoryName, items] of Object.entries(negativeCategories)) {
            const score = this.calculateCategoryScore(userSaju, currentPillars, categoryName, items, 'negative');
            negativeScores.set(categoryName, score);
        }
        // 전체 요약 생성
        const summary = this.generateSummary(positiveScores, negativeScores);
        return {
            user_id: userSaju.birth_info.birth_date + '_' + userSaju.birth_info.birth_time,
            timestamp: new Date().toISOString(),
            positive_scores: positiveScores,
            negative_scores: negativeScores,
            summary
        };
    }
    /**
     * 카테고리별 점수 계산
     */
    calculateCategoryScore(userSaju, currentPillars, categoryName, items, type) {
        // 기본 점수 계산 (사주 본연의 점수)
        const baseScore = this.calculateBaseScore(userSaju, categoryName, type);
        // 일운 점수 계산
        const dailyScore = this.calculateTemporalScore(userSaju, currentPillars.current_day, baseScore, 0.2 // 20% 가중치
        );
        // 월운 점수 계산
        const monthlyScore = this.calculateTemporalScore(userSaju, currentPillars.current_month, baseScore, 0.3 // 30% 가중치
        );
        // 세운 점수 계산
        const yearlyScore = this.calculateTemporalScore(userSaju, currentPillars.current_year, baseScore, 0.5 // 50% 가중치
        );
        // 항목별 점수 계산 및 중복 제거
        const scoredItems = items.map(item => ({
            name: item.name,
            score: this.calculateItemScore(userSaju, item, type),
            confidence: this.calculateConfidence(userSaju, item)
        }));
        // 중복 제거: 같은 name을 가진 항목은 첫 번째 것만 유지
        const uniqueItems = Array.from(new Map(scoredItems.map(item => [item.name, item])).values());
        // 상위 항목만 선택
        const topItems = uniqueItems
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
        return {
            category_name: categoryName,
            category_type: type,
            base_score: Math.round(baseScore),
            daily_score: Math.round(dailyScore),
            monthly_score: Math.round(monthlyScore),
            yearly_score: Math.round(yearlyScore),
            items: topItems
        };
    }
    /**
     * 기본 점수 계산 (사주 본연의 점수)
     */
    calculateBaseScore(saju, categoryName, type) {
        let score = 50; // 기본 점수
        // 1. 오행 균형도 평가
        const elementBalance = this.evaluateElementBalance(saju.five_elements);
        score += elementBalance;
        // 2. 십성 발달도 평가
        const tenGodScore = this.evaluateTenGods(saju.ten_gods, categoryName);
        score += tenGodScore;
        // 3. 일주 강약 평가
        const dayMasterStrength = saju.strength.day_master_strength;
        if (dayMasterStrength > 6) {
            score += 10; // 강한 일주
        }
        else if (dayMasterStrength < 4) {
            score -= 10; // 약한 일주
        }
        // 4. 카테고리별 특수 보정
        score += this.getCategorySpecificAdjustment(categoryName, saju);
        // 주흉의 경우 반전 (낮을수록 좋음)
        if (type === 'negative') {
            score = 100 - score;
        }
        return Math.max(0, Math.min(100, score));
    }
    /**
     * 시점별 점수 계산
     */
    calculateTemporalScore(userSaju, currentPillar, baseScore, weight) {
        let modifier = 0;
        // 천간 상호작용
        const heavenlyInteraction = this.evaluateHeavenlyInteraction(userSaju.day_pillar.heavenly, currentPillar.heavenly);
        modifier += heavenlyInteraction * weight;
        // 지지 상호작용
        const earthlyInteraction = this.evaluateEarthlyInteraction(userSaju.day_pillar.earthly, currentPillar.earthly);
        modifier += earthlyInteraction * weight;
        const temporalScore = baseScore + modifier;
        return Math.max(0, Math.min(100, temporalScore));
    }
    /**
     * 오행 균형도 평가
     */
    evaluateElementBalance(elements) {
        const values = Object.values(elements);
        const total = values.reduce((sum, val) => sum + val, 0);
        if (total === 0)
            return 0;
        // 표준편차 계산
        const mean = total / 5;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / 5;
        const stdDev = Math.sqrt(variance);
        // 균형도 점수 (표준편차가 낮을수록 균형)
        if (stdDev < 0.5)
            return 30; // 완벽한 균형
        if (stdDev < 1.0)
            return 20; // 좋은 균형
        if (stdDev < 1.5)
            return 10; // 보통 균형
        if (stdDev < 2.0)
            return 0; // 약간 불균형
        return -10; // 심한 불균형
    }
    /**
     * 십성 평가
     */
    evaluateTenGods(tenGods, categoryName) {
        let score = 0;
        // 카테고리별 유리한 십성 매칭
        const favorableGods = {
            '게임': ['식신', '상관', '편재'],
            '연예': ['식신', '상관', '정관'],
            '체능': ['비견', '겁재', '편관'],
            '문학': ['정인', '편인', '식신'],
            '미술': ['식신', '상관', '편인'],
            '음악': ['식신', '정인', '편인'],
            '전공': ['정관', '정인', '편인'],
            '교통사고': ['편관', '겁재'], // 주흉은 반대
            '사건': ['편관', '상관'],
            '사고': ['겁재', '편관']
        };
        const favorable = favorableGods[categoryName] || [];
        for (const god of tenGods) {
            if (favorable.includes(god)) {
                score += 8;
            }
        }
        return Math.min(25, score);
    }
    /**
     * 천간 상호작용 평가
     */
    evaluateHeavenlyInteraction(userStem, currentStem) {
        // 천간 상생상극 관계 판단
        const stemElements = {
            '갑': '목', '을': '목',
            '병': '화', '정': '화',
            '무': '토', '기': '토',
            '경': '금', '신': '금',
            '임': '수', '계': '수'
        };
        const userElement = stemElements[userStem];
        const currentElement = stemElements[currentStem];
        if (!userElement || !currentElement)
            return 0;
        // 상생 관계
        if (this.elementRelations.생[userElement] === currentElement) {
            return this.heavenlyStemScores.상생;
        }
        // 상극 관계
        if (this.elementRelations.극[userElement] === currentElement) {
            return this.heavenlyStemScores.상극;
        }
        // 동일 오행
        if (userElement === currentElement) {
            return this.heavenlyStemScores.동일;
        }
        return 0;
    }
    /**
     * 지지 상호작용 평가
     */
    evaluateEarthlyInteraction(userBranch, currentBranch) {
        // 지지 충합 관계 판단
        const clashPairs = {
            '자': '오', '축': '미', '인': '신', '묘': '유', '진': '술', '사': '해',
            '오': '자', '미': '축', '신': '인', '유': '묘', '술': '진', '해': '사'
        };
        const harmonyPairs = {
            '자': '축', '인': '해', '묘': '술', '진': '유', '사': '신', '오': '미',
            '축': '자', '해': '인', '술': '묘', '유': '진', '신': '사', '미': '오'
        };
        // 충
        if (clashPairs[userBranch] === currentBranch) {
            return this.earthlyBranchScores.충;
        }
        // 육합
        if (harmonyPairs[userBranch] === currentBranch) {
            return this.earthlyBranchScores.육합;
        }
        return 0;
    }
    /**
     * 카테고리별 특수 보정
     */
    getCategorySpecificAdjustment(categoryName, saju) {
        let adjustment = 0;
        // 카테고리별 특수 조건
        switch (categoryName) {
            case '게임':
                if (saju.five_elements.water > 1.5)
                    adjustment += 5;
                if (saju.five_elements.metal > 1.5)
                    adjustment += 5;
                break;
            case '체능':
                if (saju.five_elements.fire > 1.5)
                    adjustment += 5;
                if (saju.five_elements.wood > 1.5)
                    adjustment += 5;
                break;
            case '문학':
                if (saju.five_elements.water > 1.5)
                    adjustment += 5;
                if (saju.ten_gods.includes('정인'))
                    adjustment += 5;
                break;
            case '교통사고':
                if (saju.ten_gods.includes('편관'))
                    adjustment += 10;
                if (saju.ten_gods.includes('겁재'))
                    adjustment += 10;
                break;
        }
        return adjustment;
    }
    /**
     * 개별 항목 점수 계산
     */
    calculateItemScore(saju, item, type) {
        let score = 50; // 기본 점수
        // 사주 가중치 적용
        if (item.saju_weight) {
            score += item.saju_weight * 10;
        }
        // 오행 매칭
        const elementMatch = this.matchItemElement(saju, item.name);
        score += elementMatch * 5;
        // 타입별 반전
        if (type === 'negative') {
            score = 100 - score;
        }
        return Math.max(0, Math.min(100, score));
    }
    /**
     * 신뢰도 계산
     */
    calculateConfidence(saju, item) {
        // 기본 신뢰도
        let confidence = 0.5;
        // 사주 강도에 따른 보정
        const strength = saju.strength.day_master_strength;
        if (strength > 6) {
            confidence += 0.2;
        }
        else if (strength > 4) {
            confidence += 0.1;
        }
        // 가중치에 따른 보정
        if (item.saju_weight) {
            confidence += item.saju_weight * 0.1;
        }
        return Math.min(1.0, confidence);
    }
    /**
     * 항목과 오행 매칭
     */
    matchItemElement(saju, itemName) {
        // 항목명에서 오행 연관성 추출
        const elementKeywords = {
            '수영': '수', '물': '수',
            '화': '화', '열': '화',
            '나무': '목', '숲': '목',
            '금': '금', '철': '금',
            '토': '토', '땅': '토'
        };
        for (const [keyword, element] of Object.entries(elementKeywords)) {
            if (itemName.includes(keyword)) {
                const elementValue = saju.five_elements[element];
                if (elementValue > 1.5)
                    return 2;
                if (elementValue > 1.0)
                    return 1;
            }
        }
        return 0;
    }
    /**
     * 카테고리 데이터 로드
     */
    async loadCategories(db, type) {
        return new Promise((resolve, reject) => {
            const query = `
        SELECT 
          mid.name as category_name,
          min.name as item_name,
          min.saju_weight
        FROM major_categories mc
        JOIN middle_categories mid ON mc.id = mid.major_id
        JOIN minor_categories min ON mid.id = min.middle_id
        WHERE mc.type = ?
        ORDER BY mid.name, min.name
      `;
            db.all(query, [type], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const categories = {};
                for (const row of rows) {
                    if (!categories[row.category_name]) {
                        categories[row.category_name] = [];
                    }
                    categories[row.category_name].push({
                        name: row.item_name,
                        saju_weight: row.saju_weight || 1.0
                    });
                }
                resolve(categories);
            });
        });
    }
    /**
     * 전체 요약 생성
     */
    generateSummary(positiveScores, negativeScores) {
        // 전체 운세 계산
        let totalPositive = 0;
        let totalNegative = 0;
        let count = 0;
        for (const score of positiveScores.values()) {
            totalPositive += (score.base_score + score.daily_score + score.monthly_score + score.yearly_score) / 4;
            count++;
        }
        for (const score of negativeScores.values()) {
            totalNegative += (100 - ((score.base_score + score.daily_score + score.monthly_score + score.yearly_score) / 4));
            count++;
        }
        const overallFortune = Math.round((totalPositive + totalNegative) / count);
        // 추세 판단
        let trend = 'stable';
        let dailyAvg = 0;
        let yearlyAvg = 0;
        for (const score of positiveScores.values()) {
            dailyAvg += score.daily_score;
            yearlyAvg += score.yearly_score;
        }
        if (dailyAvg > yearlyAvg + 10)
            trend = 'rising';
        else if (dailyAvg < yearlyAvg - 10)
            trend = 'declining';
        // 추천사항 생성
        const recommendations = [];
        // 높은 점수 카테고리 추천
        const topCategories = Array.from(positiveScores.entries())
            .sort((a, b) => b[1].base_score - a[1].base_score)
            .slice(0, 3);
        for (const [category, score] of topCategories) {
            if (score.base_score > 70) {
                recommendations.push(`${category} 분야에 재능이 있습니다`);
            }
        }
        // 주의 카테고리 경고
        const riskCategories = Array.from(negativeScores.entries())
            .filter(([_, score]) => score.base_score > 70);
        for (const [category] of riskCategories) {
            recommendations.push(`${category} 관련 주의가 필요합니다`);
        }
        return {
            overall_fortune: overallFortune,
            trend,
            recommendations
        };
    }
}
exports.SajuScoreEngine = SajuScoreEngine;
//# sourceMappingURL=SajuScoreEngine.js.map