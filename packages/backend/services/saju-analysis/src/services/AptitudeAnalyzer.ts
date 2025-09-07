import sqlite3 from 'sqlite3'
import { SajuData } from './SajuCalculator'

/**
 * 적성 분석 엔진
 * 사주 데이터를 바탕으로 주능/주흉 분석 수행
 */

export interface AptitudeResult {
  positive: {
    [category: string]: {
      items: string[]
      confidence: number
      reasoning: string
    }
  }
  negative: {
    [category: string]: {
      items: string[]
      risk_level: 'LOW' | 'MEDIUM' | 'HIGH'
      reasoning: string
    }
  }
  confidence: number
  summary: string
}

export class AptitudeAnalyzer {
  private db: sqlite3.Database

  constructor(database: sqlite3.Database) {
    this.db = database
  }

  /**
   * 메인 적성 분석 함수
   */
  async analyzeAptitude(sajuData: SajuData): Promise<AptitudeResult> {
    console.log('🎯 적성 분석 시작...')
    
    const categories = await this.loadCategories()
    const positiveAnalysis = await this.analyzePositiveAptitudes(sajuData, categories.positive)
    const negativeAnalysis = await this.analyzeNegativeWarnings(sajuData, categories.negative)
    
    const overallConfidence = this.calculateOverallConfidence(sajuData, positiveAnalysis, negativeAnalysis)
    const summary = this.generateSummary(sajuData, positiveAnalysis, negativeAnalysis)
    
    console.log('✅ 적성 분석 완료')
    
    return {
      positive: positiveAnalysis,
      negative: negativeAnalysis,
      confidence: overallConfidence,
      summary: summary
    }
  }

  /**
   * 카테고리 데이터 로드
   */
  private async loadCategories(): Promise<{ positive: any, negative: any }> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          mc.type,
          mid.name as middle_category,
          mid.icon,
          min.name as minor_category,
          min.saju_weight,
          min.confidence_factor
        FROM major_categories mc
        JOIN middle_categories mid ON mc.id = mid.major_id
        JOIN minor_categories min ON mid.id = min.middle_id
        ORDER BY mc.type, mid.name, min.name
      `
      
      this.db.all(query, (err, rows) => {
        if (err) {
          reject(err)
          return
        }
        
        const positive = {}
        const negative = {}
        
        rows.forEach((row: any) => {
          const target = row.type === 'positive' ? positive : negative
          
          if (!target[row.middle_category]) {
            target[row.middle_category] = {
              icon: row.icon,
              items: []
            }
          }
          
          target[row.middle_category].items.push({
            name: row.minor_category,
            weight: row.saju_weight,
            confidence: row.confidence_factor
          })
        })
        
        resolve({ positive, negative })
      })
    })
  }

  /**
   * 주능 (긍정적 적성) 분석
   */
  private async analyzePositiveAptitudes(sajuData: SajuData, categories: any): Promise<any> {
    const result = {}
    
    for (const [categoryName, categoryData] of Object.entries(categories) as any) {
      const analysis = this.analyzeCategory(sajuData, categoryName, categoryData, 'positive')
      if (analysis.items.length > 0) {
        result[categoryName] = analysis
      }
    }
    
    return result
  }

  /**
   * 주흉 (주의사항) 분석
   */
  private async analyzeNegativeWarnings(sajuData: SajuData, categories: any): Promise<any> {
    const result = {}
    
    for (const [categoryName, categoryData] of Object.entries(categories) as any) {
      const analysis = this.analyzeCategory(sajuData, categoryName, categoryData, 'negative')
      if (analysis.items.length > 0) {
        result[categoryName] = analysis
      }
    }
    
    return result
  }

  /**
   * 카테고리별 분석
   */
  private analyzeCategory(sajuData: SajuData, categoryName: string, categoryData: any, type: 'positive' | 'negative'): any {
    const dayMasterElement = this.getElementFromStem(sajuData.day_pillar.heavenly)
    const fiveElements = sajuData.five_elements
    const strength = sajuData.strength.day_master_strength
    const season = sajuData.birth_info.season
    
    let suitableItems: any[] = []
    let baseConfidence = 0.6
    let reasoning = ''
    
    switch (categoryName) {
      case '게임':
        suitableItems = this.analyzeGaming(sajuData, categoryData.items)
        reasoning = '수(水)와 금(金) 기운이 강하고 십성에서 식상이 발달한 경우 게임 분야 적성'
        break
        
      case '과목':
        suitableItems = this.analyzeSubjects(sajuData, categoryData.items)
        reasoning = '일주의 오행과 십성 구조에 따른 학습 분야 적성'
        break
        
      case '무용':
        suitableItems = this.analyzeDance(sajuData, categoryData.items)
        reasoning = '화(火)와 목(木) 기운이 조화롭고 체능 관련 십성이 발달한 경우'
        break
        
      case '문학':
        suitableItems = this.analyzeLiterature(sajuData, categoryData.items)
        reasoning = '상관, 식신이 발달하고 수(水) 기운이 풍부한 경우 문학적 재능'
        break
        
      case '미술':
        suitableItems = this.analyzeArts(sajuData, categoryData.items)
        reasoning = '토(土)와 화(火) 기운의 조화, 상관 식신의 발달'
        break
        
      case '연예':
        suitableItems = this.analyzeEntertainment(sajuData, categoryData.items)
        reasoning = '화(火) 기운이 강하고 상관이 발달한 경우 연예 분야 적성'
        break
        
      case '음악':
        suitableItems = this.analyzeMusic(sajuData, categoryData.items)
        reasoning = '금(金) 기운과 수(水) 기운의 조화, 식상 발달'
        break
        
      case '전공':
        suitableItems = this.analyzeMajors(sajuData, categoryData.items)
        reasoning = '오행 균형과 십성 구조에 따른 학문 분야 적성'
        break
        
      case '체능':
        suitableItems = this.analyzeSports(sajuData, categoryData.items)
        reasoning = '화(火) 기운과 목(木) 기운이 강한 경우 체능 분야 적성'
        break
        
      case '교통사고':
        suitableItems = this.analyzeTrafficRisks(sajuData, categoryData.items)
        reasoning = '충, 형, 파, 해 등의 신살과 금(金) 기운의 과다'
        break
        
      case '사건':
        suitableItems = this.analyzeLegalRisks(sajuData, categoryData.items)
        reasoning = '편관, 상관의 과다와 오행 불균형'
        break
        
      case '사고':
        suitableItems = this.analyzeAccidentRisks(sajuData, categoryData.items)
        reasoning = '일주가 약하고 충극이 많은 경우'
        break
        
      case '사고도로':
        suitableItems = this.analyzeRoadRisks(sajuData, categoryData.items)
        reasoning = '특정 방향성과 시간대의 불리한 기운'
        break
        
      default:
        suitableItems = []
    }
    
    // 신뢰도 조정
    if (strength > 3.0) baseConfidence += 0.2
    if (strength < 1.5) baseConfidence -= 0.1
    
    const confidence = Math.min(Math.max(baseConfidence, 0.3), 0.95)
    
    if (type === 'negative') {
      return {
        items: suitableItems.map(item => item.name),
        risk_level: this.calculateRiskLevel(suitableItems.length, confidence),
        reasoning: reasoning
      }
    } else {
      return {
        items: suitableItems.map(item => item.name),
        confidence: Math.round(confidence * 100),
        reasoning: reasoning
      }
    }
  }

  /**
   * 게임 분야 분석
   */
  private analyzeGaming(sajuData: SajuData, items: any[]): any[] {
    const suitable = []
    const waterStrength = sajuData.five_elements.water || 0
    const metalStrength = sajuData.five_elements.metal || 0
    
    if (waterStrength > 1.5 || metalStrength > 1.5) {
      suitable.push(...items.filter(item => 
        ['FPS게임', '액션게임', '스포츠게임'].includes(item.name)
      ))
    }
    
    if (sajuData.five_elements.earth > 1.2) {
      suitable.push(...items.filter(item => 
        ['시뮬레이션게임', '롤플레잉게임'].includes(item.name)
      ))
    }
    
    return suitable.slice(0, 3)
  }

  /**
   * 과목 분야 분석
   */
  private analyzeSubjects(sajuData: SajuData, items: any[]): any[] {
    const suitable = []
    const dayMaster = this.getElementFromStem(sajuData.day_pillar.heavenly)
    
    switch (dayMaster) {
      case 'wood':
        suitable.push(...items.filter(item => 
          ['국어', '영어', '음악', '미술'].includes(item.name)
        ))
        break
      case 'fire':
        suitable.push(...items.filter(item => 
          ['체육', '음악', '미술'].includes(item.name)
        ))
        break
      case 'earth':
        suitable.push(...items.filter(item => 
          ['사회', '도덕', '한국사'].includes(item.name)
        ))
        break
      case 'metal':
        suitable.push(...items.filter(item => 
          ['수학', '과학', '기술'].includes(item.name)
        ))
        break
      case 'water':
        suitable.push(...items.filter(item => 
          ['한문', '국어', '영어'].includes(item.name)
        ))
        break
    }
    
    return suitable.slice(0, 4)
  }

  /**
   * 무용 분야 분석
   */
  private analyzeDance(sajuData: SajuData, items: any[]): any[] {
    const suitable = []
    const fireStrength = sajuData.five_elements.fire || 0
    const woodStrength = sajuData.five_elements.wood || 0
    
    if (fireStrength > 1.0 && woodStrength > 1.0) {
      suitable.push(...items.filter(item => 
        ['현대무용', '대중무용', '스포츠댄스'].includes(item.name)
      ))
    }
    
    if (sajuData.five_elements.earth > 1.2) {
      suitable.push(...items.filter(item => 
        ['전통무용', '민속무용'].includes(item.name)
      ))
    }
    
    return suitable.slice(0, 3)
  }

  /**
   * 문학 분야 분석
   */
  private analyzeLiterature(sajuData: SajuData, items: any[]): any[] {
    const suitable = []
    const waterStrength = sajuData.five_elements.water || 0
    
    if (waterStrength > 1.5) {
      suitable.push(...items.filter(item => 
        ['소설가', '시인', '시나리오작가'].includes(item.name)
      ))
    }
    
    if (sajuData.ten_gods.includes('상관') || sajuData.ten_gods.includes('식신')) {
      suitable.push(...items.filter(item => 
        ['방송작가', '라디오작가', '작사가'].includes(item.name)
      ))
    }
    
    return suitable.slice(0, 3)
  }

  /**
   * 미술 분야 분석
   */
  private analyzeArts(sajuData: SajuData, items: any[]): any[] {
    const suitable = []
    const fireStrength = sajuData.five_elements.fire || 0
    const earthStrength = sajuData.five_elements.earth || 0
    
    if (fireStrength > 1.2) {
      suitable.push(...items.filter(item => 
        ['서양화', '디자인', '시각디자인'].includes(item.name)
      ))
    }
    
    if (earthStrength > 1.2) {
      suitable.push(...items.filter(item => 
        ['조소', '공예', '인테리어'].includes(item.name)
      ))
    }
    
    return suitable.slice(0, 4)
  }

  /**
   * 연예 분야 분석
   */
  private analyzeEntertainment(sajuData: SajuData, items: any[]): any[] {
    const suitable = []
    const fireStrength = sajuData.five_elements.fire || 0
    
    if (fireStrength > 1.5) {
      suitable.push(...items.filter(item => 
        ['가수', '연기자', '드라마배우'].includes(item.name)
      ))
    }
    
    if (sajuData.ten_gods.includes('상관')) {
      suitable.push(...items.filter(item => 
        ['개그맨', 'MC', '뮤지컬배우'].includes(item.name)
      ))
    }
    
    return suitable.slice(0, 3)
  }

  /**
   * 음악 분야 분석
   */
  private analyzeMusic(sajuData: SajuData, items: any[]): any[] {
    const suitable = []
    const metalStrength = sajuData.five_elements.metal || 0
    const waterStrength = sajuData.five_elements.water || 0
    
    if (metalStrength > 1.0) {
      suitable.push(...items.filter(item => 
        ['건반악기', '관악기', '작곡'].includes(item.name)
      ))
    }
    
    if (waterStrength > 1.0) {
      suitable.push(...items.filter(item => 
        ['보컬', '대중음악', '성악'].includes(item.name)
      ))
    }
    
    return suitable.slice(0, 3)
  }

  /**
   * 전공 분야 분석
   */
  private analyzeMajors(sajuData: SajuData, items: any[]): any[] {
    const suitable = []
    const dayMaster = this.getElementFromStem(sajuData.day_pillar.heavenly)
    
    switch (dayMaster) {
      case 'wood':
        suitable.push(...items.filter(item => 
          ['어문인문학계', '사범계', '예체능계'].includes(item.name)
        ))
        break
      case 'fire':
        suitable.push(...items.filter(item => 
          ['예체능계', '사회과학계'].includes(item.name)
        ))
        break
      case 'earth':
        suitable.push(...items.filter(item => 
          ['사회과학계', '생활과학계', '농생명과학계'].includes(item.name)
        ))
        break
      case 'metal':
        suitable.push(...items.filter(item => 
          ['공학계', '자연과학계', '의치악계'].includes(item.name)
        ))
        break
      case 'water':
        suitable.push(...items.filter(item => 
          ['법정계', '어문인문학계'].includes(item.name)
        ))
        break
    }
    
    return suitable.slice(0, 3)
  }

  /**
   * 체능 분야 분석
   */
  private analyzeSports(sajuData: SajuData, items: any[]): any[] {
    const suitable = []
    const fireStrength = sajuData.five_elements.fire || 0
    const woodStrength = sajuData.five_elements.wood || 0
    
    if (fireStrength > 1.5) {
      suitable.push(...items.filter(item => 
        ['축구', '농구', '배구', '야구'].includes(item.name)
      ))
    }
    
    if (woodStrength > 1.0) {
      suitable.push(...items.filter(item => 
        ['골프', '테니스', '배드민턴'].includes(item.name)
      ))
    }
    
    if (sajuData.five_elements.water > 1.0) {
      suitable.push(...items.filter(item => 
        ['수영', '수상스키', '요트'].includes(item.name)
      ))
    }
    
    return suitable.slice(0, 5)
  }

  /**
   * 교통사고 위험 분석
   */
  private analyzeTrafficRisks(sajuData: SajuData, items: any[]): any[] {
    const risks = []
    const metalStrength = sajuData.five_elements.metal || 0
    
    if (metalStrength > 2.0) {
      risks.push(...items.filter(item => 
        ['충돌사고', '과속사고', '접촉사고'].includes(item.name)
      ))
    }
    
    if (sajuData.strength.day_master_strength < 1.5) {
      risks.push(...items.filter(item => 
        ['졸음운전', '신호위반'].includes(item.name)
      ))
    }
    
    return risks.slice(0, 3)
  }

  /**
   * 법적 사건 위험 분석
   */
  private analyzeLegalRisks(sajuData: SajuData, items: any[]): any[] {
    const risks = []
    
    if (sajuData.ten_gods.includes('편관') || sajuData.ten_gods.includes('상관')) {
      risks.push(...items.filter(item => 
        ['소송', '명예훼손', '폭행'].includes(item.name)
      ))
    }
    
    return risks.slice(0, 2)
  }

  /**
   * 일반 사고 위험 분석
   */
  private analyzeAccidentRisks(sajuData: SajuData, items: any[]): any[] {
    const risks = []
    
    if (sajuData.strength.day_master_strength < 1.5) {
      risks.push(...items.filter(item => 
        ['분실', '손실', '언쟁'].includes(item.name)
      ))
    }
    
    return risks.slice(0, 2)
  }

  /**
   * 도로별 위험 분석
   */
  private analyzeRoadRisks(sajuData: SajuData, items: any[]): any[] {
    const risks = []
    
    if (sajuData.five_elements.metal > 1.5) {
      risks.push(...items.filter(item => 
        ['고속도로', '사거리', '고가도로'].includes(item.name)
      ))
    }
    
    return risks.slice(0, 3)
  }

  /**
   * 천간에서 오행 추출
   */
  private getElementFromStem(stem: string): string {
    const elementMap = {
      '갑': 'wood', '을': 'wood',
      '병': 'fire', '정': 'fire',
      '무': 'earth', '기': 'earth',
      '경': 'metal', '신': 'metal',
      '임': 'water', '계': 'water'
    }
    return elementMap[stem] || 'earth'
  }

  /**
   * 위험도 계산
   */
  private calculateRiskLevel(itemCount: number, confidence: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    const riskScore = itemCount * confidence
    
    if (riskScore > 2.5) return 'HIGH'
    if (riskScore > 1.5) return 'MEDIUM'
    return 'LOW'
  }

  /**
   * 전체 신뢰도 계산
   */
  private calculateOverallConfidence(sajuData: SajuData, positive: any, negative: any): number {
    let baseConfidence = 0.7
    
    // 오행 균형도
    const elements = Object.values(sajuData.five_elements) as number[]
    const maxElement = Math.max(...elements)
    const minElement = Math.min(...elements)
    const balance = 1 - (maxElement - minElement) / (maxElement + minElement)
    
    baseConfidence += balance * 0.2
    
    // 일주 강약
    if (sajuData.strength.day_master_strength > 2.0 && sajuData.strength.day_master_strength < 4.0) {
      baseConfidence += 0.1
    }
    
    return Math.round(Math.min(Math.max(baseConfidence, 0.5), 0.95) * 100)
  }

  /**
   * 분석 요약 생성
   */
  private generateSummary(sajuData: SajuData, positive: any, negative: any): string {
    const dayMaster = sajuData.day_pillar.heavenly
    const season = sajuData.birth_info.season
    const strength = sajuData.strength.day_master_strength
    
    let summary = `${dayMaster}일주 ${season === 'spring' ? '봄' : season === 'summer' ? '여름' : season === 'autumn' ? '가을' : '겨울'}생으로, `
    
    if (strength > 3.0) {
      summary += '일주가 강하여 적극적이고 추진력 있는 성향을 보입니다. '
    } else if (strength < 1.5) {
      summary += '일주가 약하여 신중하고 협조적인 성향을 보입니다. '
    } else {
      summary += '일주가 적절하여 균형잡힌 성향을 보입니다. '
    }
    
    const positiveCount = Object.keys(positive).length
    const negativeCount = Object.keys(negative).length
    
    summary += `주능 ${positiveCount}개 분야에서 재능을 보이며, ${negativeCount}개 분야에서 주의가 필요합니다.`
    
    return summary
  }
}