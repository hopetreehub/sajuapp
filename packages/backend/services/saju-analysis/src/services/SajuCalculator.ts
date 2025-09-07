/**
 * 사주 계산 엔진
 * 전통 명리학 기반의 정확한 사주 분석 시스템
 */

export interface SajuData {
  year_pillar: { heavenly: string; earthly: string }
  month_pillar: { heavenly: string; earthly: string }
  day_pillar: { heavenly: string; earthly: string }
  hour_pillar: { heavenly: string; earthly: string }
  five_elements: {
    wood: number; fire: number; earth: number; metal: number; water: number
  }
  ten_gods: string[]
  birth_info: {
    birth_date: string
    birth_time: string
    is_lunar: boolean
    season: string
    day_master: string
  }
  strength: {
    day_master_strength: number
    seasonal_influence: number
    supporting_elements: number
  }
}

export interface CurrentTimePillars {
  current_year: { heavenly: string; earthly: string }
  current_month: { heavenly: string; earthly: string }
  current_day: { heavenly: string; earthly: string }
  current_date: string
  analysis_timestamp: string
}

export interface TemporalSajuAnalysis {
  personal_saju: SajuData
  current_pillars: CurrentTimePillars
  temporal_interactions: {
    year_interaction: string    // 본명 vs 세운
    month_interaction: string   // 본명 vs 월운
    day_interaction: string     // 본명 vs 일운
  }
  fortune_trends: {
    current_year_fortune: number    // -100 to 100
    current_month_fortune: number   // -100 to 100
    current_day_fortune: number     // -100 to 100
    overall_trend: 'rising' | 'stable' | 'declining'
  }
}

export class SajuCalculator {
  private readonly heavenlyStems = [
    '갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'
  ]
  
  private readonly earthlyBranches = [
    '자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'
  ]
  
  private readonly elementMap = {
    '갑': 'wood', '을': 'wood',
    '병': 'fire', '정': 'fire', 
    '무': 'earth', '기': 'earth',
    '경': 'metal', '신': 'metal',
    '임': 'water', '계': 'water'
  }
  
  private readonly branchElementMap = {
    '인': 'wood', '묘': 'wood',
    '사': 'fire', '오': 'fire',
    '진': 'earth', '미': 'earth', '술': 'earth', '축': 'earth',
    '신': 'metal', '유': 'metal',
    '자': 'water', '해': 'water'
  }
  
  private readonly seasonMap = {
    1: 'winter', 2: 'winter', 3: 'spring',
    4: 'spring', 5: 'spring', 6: 'summer',
    7: 'summer', 8: 'summer', 9: 'autumn',
    10: 'autumn', 11: 'autumn', 12: 'winter'
  }

  /**
   * 메인 사주 계산 함수
   */
  async calculateSaju(birthDate: string, birthTime: string, isLunar: boolean = false): Promise<SajuData> {
    console.log(`🔮 사주 계산 시작: ${birthDate} ${birthTime}`)
    
    const date = new Date(birthDate)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = parseInt(birthTime.split(':')[0])
    
    // 음력 변환 처리 (실제 구현에서는 음력-양력 변환 라이브러리 사용)
    const adjustedDate = isLunar ? this.convertLunarToSolar(year, month, day) : { year, month, day }
    
    // 사주 기둥 계산
    const yearPillar = this.calculateYearPillar(adjustedDate.year)
    const monthPillar = this.calculateMonthPillar(adjustedDate.year, adjustedDate.month)
    const dayPillar = this.calculateDayPillar(adjustedDate.year, adjustedDate.month, adjustedDate.day)
    const hourPillar = this.calculateHourPillar(dayPillar.heavenly, hour)
    
    // 오행 분석
    const fiveElements = this.analyzeFiveElements(yearPillar, monthPillar, dayPillar, hourPillar)
    
    // 십성 분석
    const tenGods = this.analyzeTenGods(dayPillar.heavenly, [yearPillar, monthPillar, dayPillar, hourPillar])
    
    // 일주 강약 분석
    const strength = this.analyzeStrength(dayPillar, monthPillar, fiveElements, adjustedDate.month)
    
    const sajuData: SajuData = {
      year_pillar: yearPillar,
      month_pillar: monthPillar,
      day_pillar: dayPillar,
      hour_pillar: hourPillar,
      five_elements: fiveElements,
      ten_gods: tenGods,
      birth_info: {
        birth_date: birthDate,
        birth_time: birthTime,
        is_lunar: isLunar,
        season: this.seasonMap[adjustedDate.month],
        day_master: dayPillar.heavenly
      },
      strength: strength
    }
    
    console.log(`✅ 사주 계산 완료: 일주 ${dayPillar.heavenly}${dayPillar.earthly}`)
    return sajuData
  }
  
  /**
   * 년주 계산
   */
  private calculateYearPillar(year: number) {
    // 1984년 = 갑자년을 기준으로 계산
    const baseYear = 1984
    const diff = year - baseYear
    
    const heavenlyIndex = (diff % 10 + 10) % 10
    const earthlyIndex = (diff % 12 + 12) % 12
    
    return {
      heavenly: this.heavenlyStems[heavenlyIndex],
      earthly: this.earthlyBranches[earthlyIndex]
    }
  }
  
  /**
   * 월주 계산
   */
  private calculateMonthPillar(year: number, month: number) {
    const yearPillar = this.calculateYearPillar(year)
    const yearStemIndex = this.heavenlyStems.indexOf(yearPillar.heavenly)
    
    // 년간에 따른 월간 시작점
    const monthStemStart = (yearStemIndex % 5) * 2
    const monthStemIndex = (monthStemStart + month - 1) % 10
    
    // 월지는 고정 (인월부터 시작)
    const monthBranchIndex = (month + 1) % 12
    
    return {
      heavenly: this.heavenlyStems[monthStemIndex],
      earthly: this.earthlyBranches[monthBranchIndex]
    }
  }
  
  /**
   * 일주 계산 (간단한 근사치 계산)
   */
  private calculateDayPillar(year: number, month: number, day: number) {
    // 실제로는 정확한 만세력 계산이 필요하지만, 여기서는 근사치 사용
    const date = new Date(year, month - 1, day)
    const daysSince1900 = Math.floor((date.getTime() - new Date(1900, 0, 1).getTime()) / (1000 * 60 * 60 * 24))
    
    // 1900년 1월 1일을 기준일로 설정 (실제로는 더 정확한 기준일 필요)
    const baseDayIndex = 36 // 임신일 기준
    
    const heavenlyIndex = (baseDayIndex + daysSince1900) % 10
    const earthlyIndex = (baseDayIndex + daysSince1900) % 12
    
    return {
      heavenly: this.heavenlyStems[heavenlyIndex],
      earthly: this.earthlyBranches[earthlyIndex]
    }
  }
  
  /**
   * 시주 계산
   */
  private calculateHourPillar(dayStem: string, hour: number) {
    const dayStemIndex = this.heavenlyStems.indexOf(dayStem)
    
    // 시간에 따른 지지 결정
    const hourBranchIndex = Math.floor((hour + 1) / 2) % 12
    
    // 일간에 따른 시간 시작점
    const hourStemStart = (dayStemIndex % 5) * 2
    const hourStemIndex = (hourStemStart + hourBranchIndex) % 10
    
    return {
      heavenly: this.heavenlyStems[hourStemIndex],
      earthly: this.earthlyBranches[hourBranchIndex]
    }
  }
  
  /**
   * 오행 분석
   */
  private analyzeFiveElements(yearPillar: any, monthPillar: any, dayPillar: any, hourPillar: any) {
    const elements = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }
    
    const pillars = [yearPillar, monthPillar, dayPillar, hourPillar]
    
    pillars.forEach(pillar => {
      // 천간 오행
      const stemElement = this.elementMap[pillar.heavenly]
      if (stemElement) elements[stemElement] += 1.0
      
      // 지지 오행
      const branchElement = this.branchElementMap[pillar.earthly]
      if (branchElement) elements[branchElement] += 0.8
    })
    
    return elements
  }
  
  /**
   * 십성 분석 (간단한 버전)
   */
  private analyzeTenGods(dayMaster: string, pillars: any[]) {
    const tenGods: string[] = []
    const dayMasterElement = this.elementMap[dayMaster]
    
    pillars.forEach((pillar, index) => {
      const stemElement = this.elementMap[pillar.heavenly]
      const relationship = this.getElementRelationship(dayMasterElement, stemElement)
      
      if (index === 2) { // 일주는 자기 자신
        tenGods.push('일주')
      } else {
        tenGods.push(this.getTenGodName(relationship, pillar.heavenly, dayMaster))
      }
    })
    
    return tenGods
  }
  
  /**
   * 오행 상생상극 관계 분석
   */
  private getElementRelationship(source: string, target: string): string {
    const generationCycle = {
      wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood'
    }
    const destructionCycle = {
      wood: 'earth', earth: 'water', water: 'fire', fire: 'metal', metal: 'wood'
    }
    
    if (source === target) return 'same'
    if (generationCycle[source] === target) return 'generate'
    if (destructionCycle[source] === target) return 'destroy'
    if (generationCycle[target] === source) return 'support'
    if (destructionCycle[target] === source) return 'restrain'
    
    return 'neutral'
  }
  
  /**
   * 십성명 결정
   */
  private getTenGodName(relationship: string, targetStem: string, dayMaster: string): string {
    const isSamePolarity = (this.heavenlyStems.indexOf(targetStem) % 2) === (this.heavenlyStems.indexOf(dayMaster) % 2)
    
    switch (relationship) {
      case 'same': return isSamePolarity ? '비견' : '겁재'
      case 'generate': return isSamePolarity ? '식신' : '상관'
      case 'destroy': return isSamePolarity ? '편재' : '정재'
      case 'support': return isSamePolarity ? '편인' : '정인'
      case 'restrain': return isSamePolarity ? '편관' : '정관'
      default: return '중신'
    }
  }
  
  /**
   * 일주 강약 분석
   */
  private analyzeStrength(dayPillar: any, monthPillar: any, fiveElements: any, month: number) {
    const dayMasterElement = this.elementMap[dayPillar.heavenly]
    const monthElement = this.branchElementMap[monthPillar.earthly]
    
    // 계절별 강약
    const seasonStrength = this.getSeasonalStrength(dayMasterElement, this.seasonMap[month])
    
    // 동일 오행 지원
    const supportingElements = fiveElements[dayMasterElement] || 0
    
    // 월령에서의 강약
    const monthlyInfluence = this.getElementRelationship(monthElement, dayMasterElement) === 'support' ? 1.5 : 0.5
    
    const totalStrength = seasonStrength + supportingElements + monthlyInfluence
    
    return {
      day_master_strength: totalStrength,
      seasonal_influence: seasonStrength,
      supporting_elements: supportingElements
    }
  }
  
  /**
   * 계절별 오행 강약
   */
  private getSeasonalStrength(element: string, season: string): number {
    const strengthMatrix = {
      spring: { wood: 2.0, fire: 1.0, earth: 0.5, metal: 0.5, water: 1.5 },
      summer: { wood: 0.5, fire: 2.0, earth: 1.5, metal: 1.0, water: 0.5 },
      autumn: { wood: 0.5, fire: 0.5, earth: 1.0, metal: 2.0, water: 1.5 },
      winter: { wood: 1.5, fire: 0.5, earth: 0.5, metal: 1.0, water: 2.0 }
    }
    
    return strengthMatrix[season]?.[element] || 1.0
  }
  
  /**
   * 음력-양력 변환 (간단한 근사치)
   * 실제 구현에서는 전문 라이브러리 사용 권장
   */
  private convertLunarToSolar(year: number, month: number, day: number) {
    // 간단한 근사치 변환 (실제로는 더 정확한 변환 필요)
    const avgDaysDiff = 11 // 음력이 평균적으로 11일 정도 빠름
    const date = new Date(year, month - 1, day + avgDaysDiff)
    
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    }
  }

  /**
   * 현재 시점의 천간지지 계산 (세운, 월운, 일운)
   * 🎯 핵심 기능: 매년/매월/매일 변화하는 천간지지 계산
   */
  calculateCurrentTimePillars(targetDate?: Date): CurrentTimePillars {
    const currentDate = targetDate || new Date()
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1
    const day = currentDate.getDate()
    
    console.log(`🗓️ 현재 시점 천간지지 계산: ${year}년 ${month}월 ${day}일`)

    // 현재 년도의 천간지지 (세운)
    const currentYearPillar = this.calculateYearPillar(year)
    
    // 현재 월의 천간지지 (월운) 
    const currentMonthPillar = this.calculateMonthPillar(year, month)
    
    // 현재 일의 천간지지 (일운)
    const currentDayPillar = this.calculateDayPillar(year, month, day)

    const result: CurrentTimePillars = {
      current_year: currentYearPillar,
      current_month: currentMonthPillar, 
      current_day: currentDayPillar,
      current_date: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
      analysis_timestamp: new Date().toISOString()
    }

    console.log(`✅ 현재 천간지지: 년[${currentYearPillar.heavenly}${currentYearPillar.earthly}] 월[${currentMonthPillar.heavenly}${currentMonthPillar.earthly}] 일[${currentDayPillar.heavenly}${currentDayPillar.earthly}]`)
    
    return result
  }

  /**
   * 개인 사주와 현재 시점 천간지지 종합 분석
   * 🔮 핵심: 본명사주 + 세운/월운/일운 = 현재 시점 맞춤 운세
   */
  async analyzeTemporalSaju(birthDate: string, birthTime: string, isLunar: boolean = false, targetDate?: Date): Promise<TemporalSajuAnalysis> {
    console.log(`🎯 시점별 사주 종합 분석 시작`)
    console.log(`   개인정보: ${birthDate} ${birthTime} ${isLunar ? '음력' : '양력'}`)
    
    // 1. 개인 사주팔자 계산 (본명사주)
    const personalSaju = await this.calculateSaju(birthDate, birthTime, isLunar)
    
    // 2. 현재 시점 천간지지 계산 (세운/월운/일운)
    const currentPillars = this.calculateCurrentTimePillars(targetDate)
    
    // 3. 개인 사주와 현재 시점의 상호작용 분석
    const temporalInteractions = this.analyzeTemporalInteractions(personalSaju, currentPillars)
    
    // 4. 현재 시점 운세 점수 계산
    const fortuneTrends = this.calculateFortuneTrends(personalSaju, currentPillars, temporalInteractions)

    const result: TemporalSajuAnalysis = {
      personal_saju: personalSaju,
      current_pillars: currentPillars,
      temporal_interactions: temporalInteractions,
      fortune_trends: fortuneTrends
    }

    console.log(`🎉 시점별 사주 분석 완료`)
    console.log(`   연운: ${fortuneTrends.current_year_fortune}, 월운: ${fortuneTrends.current_month_fortune}, 일운: ${fortuneTrends.current_day_fortune}`)
    console.log(`   전체 트렌드: ${fortuneTrends.overall_trend}`)
    
    return result
  }

  /**
   * 개인 사주와 현재 시점 천간지지의 상호작용 분석
   */
  private analyzeTemporalInteractions(personalSaju: SajuData, currentPillars: CurrentTimePillars) {
    const dayMaster = personalSaju.day_pillar.heavenly

    // 개인 일주와 현재 시점 각 기둥의 관계 분석
    const yearInteraction = this.analyzePillarInteraction(dayMaster, currentPillars.current_year.heavenly, '세운')
    const monthInteraction = this.analyzePillarInteraction(dayMaster, currentPillars.current_month.heavenly, '월운')  
    const dayInteraction = this.analyzePillarInteraction(dayMaster, currentPillars.current_day.heavenly, '일운')

    return {
      year_interaction: yearInteraction,
      month_interaction: monthInteraction,
      day_interaction: dayInteraction
    }
  }

  /**
   * 기둥 간 상호작용 분석 (사주학적 해석)
   */
  private analyzePillarInteraction(personalStem: string, currentStem: string, period: string): string {
    const personalElement = this.elementMap[personalStem]
    const currentElement = this.elementMap[currentStem]
    
    if (!personalElement || !currentElement) return `${period}: 분석 불가`

    const relationship = this.getElementRelationship(personalElement, currentElement)
    
    const interactions = {
      'same': `${period}: 동기상조 - 안정적 발전 시기`,
      'generate': `${period}: 생조관계 - 성장과 발전 가능성 높음`, 
      'destroy': `${period}: 극제관계 - 도전이 많지만 성취 가능`,
      'support': `${period}: 인수관계 - 지지와 도움을 받는 시기`,
      'restrain': `${period}: 관살관계 - 압박감 있지만 절제와 성숙의 시기`,
      'neutral': `${period}: 중성관계 - 평범한 운세`
    }

    return interactions[relationship] || `${period}: 미상의 관계`
  }

  /**
   * 현재 시점 운세 점수 계산 (-100 ~ 100점)
   */
  private calculateFortuneTrends(personalSaju: SajuData, currentPillars: CurrentTimePillars, interactions: any) {
    // 각 상호작용을 점수로 변환
    const yearScore = this.interactionToScore(interactions.year_interaction)
    const monthScore = this.interactionToScore(interactions.month_interaction)  
    const dayScore = this.interactionToScore(interactions.day_interaction)

    // 가중 평균 (년 50%, 월 30%, 일 20%)
    const overallScore = (yearScore * 0.5) + (monthScore * 0.3) + (dayScore * 0.2)
    
    // 전체 트렌드 판정
    let overallTrend: 'rising' | 'stable' | 'declining'
    if (overallScore > 20) overallTrend = 'rising'
    else if (overallScore < -20) overallTrend = 'declining'
    else overallTrend = 'stable'

    return {
      current_year_fortune: Math.round(yearScore),
      current_month_fortune: Math.round(monthScore),
      current_day_fortune: Math.round(dayScore), 
      overall_trend: overallTrend
    }
  }

  /**
   * 상호작용 텍스트를 점수로 변환
   */
  private interactionToScore(interaction: string): number {
    if (interaction.includes('생조관계')) return 70    // 매우 좋음
    if (interaction.includes('동기상조')) return 50    // 좋음
    if (interaction.includes('인수관계')) return 40    // 괜찮음  
    if (interaction.includes('중성관계')) return 0     // 보통
    if (interaction.includes('관살관계')) return -30   // 어려움
    if (interaction.includes('극제관계')) return -50   // 매우 어려움
    return 0 // 기본값
  }
}