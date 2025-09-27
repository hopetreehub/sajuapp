/**
 * 향상된 사주 점수 계산 엔진
 * 전통 명리학 기반의 정교한 적성 점수 시스템
 */

import { SajuData, CurrentTimePillars } from './SajuCalculator'

export interface DetailedCategoryScore {
  category_name: string
  category_type: 'positive' | 'negative'
  base_score: number      // 기본 점수 (0-100)
  daily_score: number     // 오늘 점수 (0-100)
  monthly_score: number   // 이달 점수 (0-100)
  yearly_score: number    // 올해 점수 (0-100)
  score_breakdown: {
    element_affinity: number      // 오행 친화도 (0-40점)
    ten_gods_harmony: number      // 십성 조화도 (0-30점) 
    pillar_strength: number       // 기둥 강도 (0-20점)
    seasonal_bonus: number        // 계절 보너스 (0-10점)
  }
  confidence_level: number        // 신뢰도 (0.0-1.0)
  items: Array<{
    name: string
    individual_score: number
    affinity_reason: string
    confidence: number
  }>
}

export interface SajuAptitudeAnalysis {
  element_dominance: {
    primary: string    // 주도 오행
    secondary: string  // 보조 오행
    balance_score: number // 균형 점수
  }
  ten_gods_profile: {
    dominant_gods: string[]
    personality_type: string
    career_inclination: string
  }
  strengths: string[]
  weaknesses: string[]
  optimal_careers: string[]
}

export class EnhancedSajuScoreEngine {
  
  // 오행별 적성 분야 매핑
  private readonly elementAptitudes = {
    '목': {
      categories: ['문학', '교육', '창작', '기획'],
      traits: ['성장성', '창조력', '유연성'],
      bonus_items: ['소설가', '작가', '기획자', '교사']
    },
    '화': {
      categories: ['연예', '예술', '소통', '영업'],
      traits: ['표현력', '열정', '사교성'],
      bonus_items: ['가수', '배우', 'MC', '연예인']
    },
    '토': {
      categories: ['관리', '부동산', '농업', '건설'],
      traits: ['안정성', '신뢰성', '포용력'],
      bonus_items: ['관리자', '부동산', '건축']
    },
    '금': {
      categories: ['금융', '법률', '의료', '기계'],
      traits: ['정확성', '논리성', '결단력'],
      bonus_items: ['의사', '변호사', '금융']
    },
    '수': {
      categories: ['IT', '연구', '철학', '물류'],
      traits: ['지혜', '유동성', '적응력'],
      bonus_items: ['프로그래머', '연구원', '철학자']
    }
  }

  // 십성별 적성 분야
  private readonly tenGodsAptitudes = {
    '정관': {
      suitable: ['전공', '관리', '법률'],
      bonus: 25,
      traits: ['리더십', '책임감', '권위']
    },
    '편관': {
      suitable: ['체능', '군사', '경쟁'],
      bonus: 20,
      traits: ['추진력', '경쟁심', '도전']
    },
    '정재': {
      suitable: ['경영', '재정', '관리'],
      bonus: 22,
      traits: ['관리능력', '안정추구']
    },
    '편재': {
      suitable: ['사업', '영업', '투자'],
      bonus: 20,
      traits: ['사업감각', '기회포착']
    },
    '정인': {
      suitable: ['학문', '교육', '연구'],
      bonus: 25,
      traits: ['학습능력', '지혜', '가르침']
    },
    '편인': {
      suitable: ['예술', '창작', '독창'],
      bonus: 23,
      traits: ['창의성', '독창성']
    },
    '식신': {
      suitable: ['예술', '요리', '엔터테인먼트'],
      bonus: 24,
      traits: ['표현력', '창조력']
    },
    '상관': {
      suitable: ['예술', '연예', '자유업'],
      bonus: 22,
      traits: ['표현력', '반항심', '독창성']
    },
    '비견': {
      suitable: ['동업', '협력', '팀워크'],
      bonus: 15,
      traits: ['협력성', '동료의식']
    },
    '겁재': {
      suitable: ['경쟁', '개척', '모험'],
      bonus: 18,
      traits: ['경쟁심', '개척정신']
    }
  }

  // 계절별 활동 보너스
  private readonly seasonalBonus = {
    'spring': {
      '체능': 15, '야외활동': 20, '성장관련': 10
    },
    'summer': {
      '연예': 20, '사교활동': 15, '에너지관련': 10
    },
    'autumn': {
      '수확관련': 20, '정리정돈': 15, '계획관련': 10
    },
    'winter': {
      '실내활동': 15, '학습': 20, '내성관련': 10
    }
  }

  /**
   * 향상된 카테고리별 점수 계산
   */
  calculateEnhancedCategoryScore(
    userSaju: SajuData,
    currentPillars: CurrentTimePillars,
    categoryName: string,
    items: any[],
    type: 'positive' | 'negative'
  ): DetailedCategoryScore {
    
    // 1. 오행 친화도 계산 (40점)
    const elementAffinity = this.calculateElementAffinity(userSaju, categoryName)
    
    // 2. 십성 조화도 계산 (30점)  
    const tenGodsHarmony = this.calculateTenGodsHarmony(userSaju, categoryName)
    
    // 3. 기둥 강도 계산 (20점)
    const pillarStrength = this.calculatePillarStrength(userSaju)
    
    // 4. 계절 보너스 계산 (10점)
    const seasonalBonus = this.calculateSeasonalBonus(userSaju, categoryName)

    // 기본 점수 합산
    const baseScore = elementAffinity + tenGodsHarmony + pillarStrength + seasonalBonus
    
    // 시점별 점수 계산
    const dailyScore = this.calculateTemporalScore(userSaju, currentPillars.current_day, baseScore, 0.2)
    const monthlyScore = this.calculateTemporalScore(userSaju, currentPillars.current_month, baseScore, 0.3)
    const yearlyScore = this.calculateTemporalScore(userSaju, currentPillars.current_year, baseScore, 0.5)

    // 항목별 상세 분석
    const detailedItems = this.calculateDetailedItems(userSaju, items, categoryName, type)
    
    // 신뢰도 계산
    const confidenceLevel = this.calculateConfidenceLevel(userSaju, categoryName)

    // 주흉의 경우 점수 반전
    const finalBaseScore = type === 'negative' ? (100 - baseScore) : baseScore
    const finalDailyScore = type === 'negative' ? (100 - dailyScore) : dailyScore
    const finalMonthlyScore = type === 'negative' ? (100 - monthlyScore) : monthlyScore
    const finalYearlyScore = type === 'negative' ? (100 - yearlyScore) : yearlyScore

    return {
      category_name: categoryName,
      category_type: type,
      base_score: Math.max(0, Math.min(100, finalBaseScore)),
      daily_score: Math.max(0, Math.min(100, finalDailyScore)),
      monthly_score: Math.max(0, Math.min(100, finalMonthlyScore)),
      yearly_score: Math.max(0, Math.min(100, finalYearlyScore)),
      score_breakdown: {
        element_affinity: elementAffinity,
        ten_gods_harmony: tenGodsHarmony,
        pillar_strength: pillarStrength,
        seasonal_bonus: seasonalBonus
      },
      confidence_level: confidenceLevel,
      items: detailedItems
    }
  }

  /**
   * 오행 친화도 계산 (0-40점)
   */
  private calculateElementAffinity(saju: SajuData, categoryName: string): number {
    const dayMaster = saju.day_pillar.heavenly
    const dayMasterElement = this.getElementFromStem(dayMaster)
    
    let affinity = 0
    
    // 주도 오행 확인
    const dominantElement = this.getDominantElement(saju.five_elements)
    
    // 카테고리별 오행 매칭
    for (const [element, aptitude] of Object.entries(this.elementAptitudes)) {
      if (aptitude.categories.includes(categoryName) || 
          categoryName.includes(aptitude.categories.join('|'))) {
        
        // 일간과의 관계
        if (element === dayMasterElement) {
          affinity += 15 // 동일 오행
        } else if (this.isGeneratingRelation(dayMasterElement, element)) {
          affinity += 12 // 상생 관계
        } else if (this.isSupportingRelation(dayMasterElement, element)) {
          affinity += 10 // 지원 관계
        }
        
        // 주도 오행과의 관계
        if (element === dominantElement) {
          affinity += 10
        }
        
        // 오행 강도에 따른 보너스
        const elementStrength = (saju.five_elements as any)[this.getElementKey(element)]
        if (elementStrength > 1.5) {
          affinity += 8
        } else if (elementStrength > 1.0) {
          affinity += 5
        }
      }
    }
    
    return Math.min(40, affinity)
  }

  /**
   * 십성 조화도 계산 (0-30점)  
   */
  private calculateTenGodsHarmony(saju: SajuData, categoryName: string): number {
    let harmony = 0
    
    for (const god of saju.ten_gods) {
      const aptitude = this.tenGodsAptitudes[god]
      if (aptitude && aptitude.suitable.some(field => 
        categoryName.includes(field) || field.includes(categoryName))) {
        harmony += aptitude.bonus
      }
    }
    
    // 십성 균형도 보너스
    const uniqueGods = new Set(saju.ten_gods).size
    if (uniqueGods >= 6) {
      harmony += 5 // 다양성 보너스
    } else if (uniqueGods <= 3) {
      harmony -= 5 // 단조로움 페널티
    }
    
    return Math.min(30, harmony)
  }

  /**
   * 기둥 강도 계산 (0-20점)
   */
  private calculatePillarStrength(saju: SajuData): number {
    let strength = 0
    
    // 일주 강약
    const dayMasterStrength = saju.strength.day_master_strength
    if (dayMasterStrength > 7) {
      strength += 10 // 매우 강함
    } else if (dayMasterStrength > 5) {
      strength += 7  // 강함
    } else if (dayMasterStrength > 3) {
      strength += 5  // 보통
    } else {
      strength += 2  // 약함
    }
    
    // 계절 지원도
    strength += Math.min(10, saju.strength.seasonal_influence)
    
    return Math.min(20, strength)
  }

  /**
   * 계절 보너스 계산 (0-10점)
   */
  private calculateSeasonalBonus(saju: SajuData, categoryName: string): number {
    const season = saju.birth_info.season
    const seasonBonus = this.seasonalBonus[season]
    
    if (!seasonBonus) return 0
    
    for (const [activity, bonus] of Object.entries(seasonBonus)) {
      if (categoryName.includes(activity) ||
          this.isRelatedActivity(categoryName, activity)) {
        return Math.min(10, bonus as number)
      }
    }
    
    return 0
  }

  /**
   * 시점별 점수 계산
   */
  private calculateTemporalScore(
    userSaju: SajuData,
    currentPillar: { heavenly: string, earthly: string },
    baseScore: number,
    weight: number
  ): number {
    let modifier = 0

    // 천간 상호작용
    const heavenlyRelation = this.getHeavenlyRelation(
      userSaju.day_pillar.heavenly, 
      currentPillar.heavenly
    )
    modifier += this.getRelationScore(heavenlyRelation) * weight

    // 지지 상호작용  
    const earthlyRelation = this.getEarthlyRelation(
      userSaju.day_pillar.earthly,
      currentPillar.earthly
    )
    modifier += this.getRelationScore(earthlyRelation) * weight

    const temporalScore = baseScore + modifier
    return Math.max(0, Math.min(100, temporalScore))
  }

  /**
   * 항목별 상세 분석
   */
  private calculateDetailedItems(
    saju: SajuData, 
    items: any[], 
    categoryName: string,
    type: 'positive' | 'negative'
  ): Array<any> {
    const scoredItems = items.map(item => {
      const individualScore = this.calculateIndividualItemScore(saju, item, categoryName)
      const affinityReason = this.getAffinityReason(saju, item, categoryName)
      const confidence = this.calculateItemConfidence(saju, item)
      
      return {
        name: item.name,
        individual_score: type === 'negative' ? (100 - individualScore) : individualScore,
        affinity_reason: affinityReason,
        confidence: confidence
      }
    })

    // 중복 제거
    const uniqueItems = Array.from(
      new Map(scoredItems.map(item => [item.name, item])).values()
    )

    // 상위 5개만 반환
    return uniqueItems
      .sort((a, b) => b.individual_score - a.individual_score)
      .slice(0, 5)
  }

  /**
   * 개별 항목 점수 계산
   */
  private calculateIndividualItemScore(saju: SajuData, item: any, categoryName: string): number {
    let score = 50 // 기본 점수

    // 사주 가중치 적용
    if (item.saju_weight) {
      score += item.saju_weight * 15
    }

    // 오행 매칭 보너스
    const elementBonus = this.getItemElementBonus(saju, item.name)
    score += elementBonus

    // 십성 매칭 보너스
    const tenGodBonus = this.getItemTenGodBonus(saju, item.name)
    score += tenGodBonus

    // 카테고리 특화 보너스
    const categoryBonus = this.getCategorySpecificBonus(saju, item.name, categoryName)
    score += categoryBonus

    return Math.max(0, Math.min(100, score))
  }

  /**
   * 신뢰도 계산
   */
  private calculateConfidenceLevel(saju: SajuData, categoryName: string): number {
    let confidence = 0.5 // 기본 신뢰도

    // 사주 완성도
    const completeness = this.calculateSajuCompleteness(saju)
    confidence += completeness * 0.3

    // 오행 균형도
    const balance = this.calculateElementBalance(saju.five_elements)
    confidence += (balance / 100) * 0.2

    return Math.min(1.0, confidence)
  }

  // === 헬퍼 메서드들 ===

  private getElementFromStem(stem: string): string {
    const stemElements: { [key: string]: string } = {
      '갑': '목', '을': '목',
      '병': '화', '정': '화',
      '무': '토', '기': '토',
      '경': '금', '신': '금',
      '임': '수', '계': '수'
    }
    return stemElements[stem] || '토'
  }

  private getDominantElement(elements: any): string {
    let maxElement = '토'
    let maxValue = 0
    
    for (const [element, value] of Object.entries(elements)) {
      if ((value as number) > maxValue) {
        maxValue = value as number
        maxElement = this.getElementKey(element)
      }
    }
    
    return maxElement
  }

  private getElementKey(element: string): string {
    const keyMap: { [key: string]: string } = {
      '목': 'wood', '화': 'fire', '토': 'earth', 
      '금': 'metal', '수': 'water'
    }
    return keyMap[element] || element
  }

  private isGeneratingRelation(source: string, target: string): boolean {
    const generation: { [key: string]: string } = {
      '목': '화', '화': '토', '토': '금', '금': '수', '수': '목'
    }
    return generation[source] === target
  }

  private isSupportingRelation(source: string, target: string): boolean {
    const support: { [key: string]: string } = {
      '화': '목', '토': '화', '금': '토', '수': '금', '목': '수'
    }
    return support[source] === target
  }

  private isRelatedActivity(categoryName: string, activity: string): boolean {
    const relationMap: { [key: string]: string[] } = {
      '야외활동': ['체능', '체육', '스포츠'],
      '사교활동': ['연예', '영업', 'MC'],
      '수확관련': ['농업', '관리', '완성'],
      '실내활동': ['학습', '연구', '독서'],
      '에너지관련': ['체능', '연예', '활동'],
      '성장관련': ['교육', '개발', '창작']
    }
    
    const related = relationMap[activity] || []
    return related.some(r => categoryName.includes(r))
  }

  private getHeavenlyRelation(userStem: string, currentStem: string): string {
    if (userStem === currentStem) return '동일'
    
    const userElement = this.getElementFromStem(userStem)
    const currentElement = this.getElementFromStem(currentStem)
    
    if (this.isGeneratingRelation(userElement, currentElement)) return '상생'
    if (this.isGeneratingRelation(currentElement, userElement)) return '피생'
    
    return '중성'
  }

  private getEarthlyRelation(userBranch: string, currentBranch: string): string {
    // 지지 충합 관계 (간단 구현)
    const clashes: { [key: string]: string } = {
      '자': '오', '축': '미', '인': '신', '묘': '유', '진': '술', '사': '해'
    }
    
    if (clashes[userBranch] === currentBranch || clashes[currentBranch] === userBranch) {
      return '충'
    }
    
    if (userBranch === currentBranch) return '동일'
    
    return '중성'
  }

  private getRelationScore(relation: string): number {
    const scores: { [key: string]: number } = {
      '상생': 15, '피생': 10, '동일': 8, '중성': 0, '충': -15
    }
    return scores[relation] || 0
  }

  private getAffinityReason(saju: SajuData, item: any, categoryName: string): string {
    const reasons: string[] = []
    
    // 오행 이유
    const dayMasterElement = this.getElementFromStem(saju.day_pillar.heavenly)
    for (const [element, aptitude] of Object.entries(this.elementAptitudes)) {
      if (aptitude.bonus_items.includes(item.name)) {
        if (element === dayMasterElement) {
          reasons.push(`${element}오행과 일치`)
        } else if (this.isGeneratingRelation(dayMasterElement, element)) {
          reasons.push(`${dayMasterElement}→${element} 상생관계`)
        }
      }
    }
    
    // 십성 이유
    for (const god of saju.ten_gods) {
      const aptitude = this.tenGodsAptitudes[god]
      if (aptitude && aptitude.suitable.some(s => categoryName.includes(s))) {
        reasons.push(`${god} 십성 영향`)
        break
      }
    }
    
    return reasons.join(', ') || '기본 적성'
  }

  private calculateItemConfidence(saju: SajuData, item: any): number {
    let confidence = 0.6
    
    if (item.saju_weight > 1.5) confidence += 0.2
    if (saju.strength.day_master_strength > 6) confidence += 0.1
    if (this.calculateElementBalance(saju.five_elements) > 70) confidence += 0.1
    
    return Math.min(1.0, confidence)
  }

  private getItemElementBonus(saju: SajuData, itemName: string): number {
    // 항목명에서 오행 연관성 찾기
    const elementKeywords: { [key: string]: string[] } = {
      '목': ['나무', '목재', '창작', '성장'],
      '화': ['불', '열', '에너지', '표현'],
      '토': ['토지', '건설', '관리', '안정'],
      '금': ['금속', '정밀', '의료', '법률'],  
      '수': ['물', '유동', 'IT', '연구']
    }
    
    for (const [element, keywords] of Object.entries(elementKeywords)) {
      if (keywords.some(keyword => itemName.includes(keyword))) {
        const elementValue = (saju.five_elements as any)[this.getElementKey(element)]
        return Math.min(15, elementValue * 8)
      }
    }
    
    return 0
  }

  private getItemTenGodBonus(saju: SajuData, itemName: string): number {
    // 십성별 항목 매칭
    for (const god of saju.ten_gods) {
      const aptitude = this.tenGodsAptitudes[god]
      if (aptitude) {
        // 간단한 키워드 매칭 (실제로는 더 정교하게 구현)
        if (god === '식신' && (itemName.includes('예술') || itemName.includes('요리'))) {
          return 10
        }
        if (god === '정관' && itemName.includes('관리')) {
          return 12
        }
        // ... 다른 매칭들
      }
    }
    
    return 0
  }

  private getCategorySpecificBonus(saju: SajuData, itemName: string, categoryName: string): number {
    // 카테고리별 특수 보너스 로직
    let bonus = 0
    
    switch(categoryName) {
      case '게임':
        if (saju.five_elements.water > 1.5) bonus += 8
        break
      case '연예':
        if (saju.ten_gods.includes('식신') || saju.ten_gods.includes('상관')) bonus += 10
        break
      case '체능':
        if (saju.five_elements.fire > 1.5) bonus += 8
        break
    }
    
    return bonus
  }

  private calculateSajuCompleteness(saju: SajuData): number {
    let completeness = 0
    
    // 사주 기둥 완성도
    if (saju.year_pillar && saju.month_pillar && saju.day_pillar && saju.hour_pillar) {
      completeness += 0.4
    }
    
    // 오행 다양성
    const elementCount = Object.values(saju.five_elements).filter(v => v > 0).length
    completeness += (elementCount / 5) * 0.3
    
    // 십성 다양성
    const tenGodCount = new Set(saju.ten_gods).size
    completeness += (tenGodCount / 10) * 0.3
    
    return completeness
  }

  private calculateElementBalance(elements: any): number {
    const values = Object.values(elements) as number[]
    const total = values.reduce((sum, val) => sum + val, 0)
    
    if (total === 0) return 0
    
    const mean = total / 5
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / 5
    const stdDev = Math.sqrt(variance)
    
    // 균형도를 0-100 점수로 변환
    return Math.max(0, 100 - (stdDev * 50))
  }
}