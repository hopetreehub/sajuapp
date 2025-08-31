// 6대 영역 데이터 처리 유틸리티

import { SajuData } from '@/types/saju'
import { SixAreaScores } from '@/types/saju'

export class SixAreaProcessor {
  /**
   * 사주 데이터를 6대 영역 점수로 변환
   */
  static calculateSixAreaScores(sajuData: SajuData): SixAreaScores {
    console.log('🔮 [SixAreaProcessor] 실제 사주 데이터 사용:', {
      tenGods: sajuData.tenGods,
      fiveElements: sajuData.fiveElements,
      dayMaster: sajuData.dayMaster
    })
    
    const { fiveElements, tenGods } = sajuData
    
    // 근본 (Foundation) - 일간의 힘, 비견/겁재
    const foundation = this.calculateFoundation(tenGods, fiveElements)
    
    // 사고 (Thinking) - 인성, 식상
    const thinking = this.calculateThinking(tenGods, fiveElements)
    
    // 인연 (Relationship) - 재성, 관성
    const relationship = this.calculateRelationship(tenGods, fiveElements)
    
    // 행동 (Action) - 목, 화 오행 및 식상
    const action = this.calculateAction(tenGods, fiveElements)
    
    // 행운 (Luck) - 전체 균형도 및 편재
    const luck = this.calculateLuck(tenGods, fiveElements)
    
    // 환경 (Environment) - 토, 금, 수 오행
    const environment = this.calculateEnvironment(tenGods, fiveElements)
    
    const result = {
      foundation,
      thinking,
      relationship,
      action,
      luck,
      environment
    }
    
    console.log('📊 [SixAreaProcessor] 계산된 6대 영역 점수:', result)
    console.log('✅ [SixAreaProcessor] Math.random() 제거 완료 - 순수 실제 데이터만 사용')
    
    return result
  }

  /**
   * 근본 점수 계산
   * 자아의 힘과 독립성을 나타냄
   */
  private static calculateFoundation(tenGods: any, fiveElements: any): number {
    let score = 40 // 기본 점수
    
    // 비견이 강하면 자아가 강함 (최대 +20)
    if (tenGods.bijeon) {
      score += Math.min(20, tenGods.bijeon * 4)
    }
    
    // 겁재가 있으면 경쟁심과 독립성 (최대 +15)
    if (tenGods.geopjae) {
      score += Math.min(15, tenGods.geopjae * 3)
    }
    
    // 오행 균형도 반영 (최대 +15)
    const balance = this.calculateElementBalance(fiveElements)
    score += balance * 15
    
    return Math.max(20, Math.min(95, Math.round(score)))
  }

  /**
   * 사고 점수 계산
   * 지적 능력과 창의성을 나타냄
   */
  private static calculateThinking(tenGods: any, fiveElements: any): number {
    let score = 45 // 기본 점수
    
    // 정인이 강하면 학습 능력 우수 (최대 +20)
    if (tenGods.jeongin) {
      score += Math.min(20, tenGods.jeongin * 4)
    }
    
    // 편인이 있으면 창의성 (최대 +15)
    if (tenGods.pyeongin) {
      score += Math.min(15, tenGods.pyeongin * 3)
    }
    
    // 식신이 있으면 표현력 (최대 +10)
    if (tenGods.siksin) {
      score += Math.min(10, tenGods.siksin * 2)
    }
    
    // 수(水) 오행이 강하면 지혜 (최대 +10)
    if (fiveElements.water) {
      score += Math.min(10, fiveElements.water * 0.1)
    }
    
    return Math.max(20, Math.min(95, Math.round(score)))
  }

  /**
   * 인연 점수 계산
   * 대인관계와 사회성을 나타냄
   */
  private static calculateRelationship(tenGods: any, fiveElements: any): number {
    let score = 45 // 기본 점수
    
    // 정재가 강하면 신뢰 관계 (최대 +20)
    if (tenGods.jeongjae) {
      score += Math.min(20, tenGods.jeongjae * 4)
    }
    
    // 편재가 있으면 사교성 (최대 +15)
    if (tenGods.pyeonjae) {
      score += Math.min(15, tenGods.pyeonjae * 3)
    }
    
    // 정관이 있으면 리더십 (최대 +10)
    if (tenGods.jeonggwan) {
      score += Math.min(10, tenGods.jeonggwan * 2)
    }
    
    // 화(火) 오행이 강하면 열정적 관계 (최대 +10)
    if (fiveElements.fire) {
      score += Math.min(10, fiveElements.fire * 0.1)
    }
    
    return Math.max(20, Math.min(95, Math.round(score)))
  }

  /**
   * 행동 점수 계산
   * 실행력과 추진력을 나타냄
   */
  private static calculateAction(tenGods: any, fiveElements: any): number {
    let score = 40 // 기본 점수
    
    // 식신이 강하면 활동성 (최대 +20)
    if (tenGods.siksin) {
      score += Math.min(20, tenGods.siksin * 4)
    }
    
    // 상관이 있으면 도전정신 (최대 +15)
    if (tenGods.sanggwan) {
      score += Math.min(15, tenGods.sanggwan * 3)
    }
    
    // 목(木) 오행이 강하면 성장 욕구 (최대 +10)
    if (fiveElements.wood) {
      score += Math.min(10, fiveElements.wood * 0.1)
    }
    
    // 화(火) 오행이 강하면 열정 (최대 +10)
    if (fiveElements.fire) {
      score += Math.min(10, fiveElements.fire * 0.1)
    }
    
    return Math.max(20, Math.min(95, Math.round(score)))
  }

  /**
   * 행운 점수 계산
   * 운세와 기회 포착을 나타냄
   */
  private static calculateLuck(tenGods: any, fiveElements: any): number {
    let score = 40 // 기본 점수
    
    // 편재가 강하면 횡재운 (최대 +20)
    if (tenGods.pyeonjae) {
      score += Math.min(20, tenGods.pyeonjae * 4)
    }
    
    // 식신이 있으면 복록 (최대 +15)
    if (tenGods.siksin) {
      score += Math.min(15, tenGods.siksin * 3)
    }
    
    // 오행 균형이 좋으면 전체적인 운 상승
    const balance = this.calculateElementBalance(fiveElements)
    score += balance * 20
    
    return Math.max(20, Math.min(95, Math.round(score)))
  }

  /**
   * 환경 점수 계산
   * 환경 적응력과 변화 대응을 나타냄
   */
  private static calculateEnvironment(tenGods: any, fiveElements: any): number {
    let score = 45 // 기본 점수
    
    // 토(土) 오행이 강하면 안정성 (최대 +15)
    if (fiveElements.earth) {
      score += Math.min(15, fiveElements.earth * 0.15)
    }
    
    // 금(金) 오행이 강하면 결단력 (최대 +15)
    if (fiveElements.metal) {
      score += Math.min(15, fiveElements.metal * 0.15)
    }
    
    // 수(水) 오행이 강하면 유연성 (최대 +15)
    if (fiveElements.water) {
      score += Math.min(15, fiveElements.water * 0.15)
    }
    
    // 인성이 있으면 적응력 (최대 +10)
    if (tenGods.jeongin || tenGods.pyeongin) {
      score += Math.min(10, (tenGods.jeongin + tenGods.pyeongin) * 2)
    }
    
    return Math.max(20, Math.min(95, Math.round(score)))
  }

  /**
   * 오행 균형도 계산 (0-1 사이의 값)
   */
  private static calculateElementBalance(fiveElements: any): number {
    const values = [
      fiveElements.wood || 0,
      fiveElements.fire || 0,
      fiveElements.earth || 0,
      fiveElements.metal || 0,
      fiveElements.water || 0
    ]
    
    const total = values.reduce((sum, val) => sum + val, 0)
    if (total === 0) return 0
    
    // 표준편차 계산
    const average = total / 5
    const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / 5
    const stdDev = Math.sqrt(variance)
    
    // 표준편차가 작을수록 균형이 좋음
    // 최대 표준편차를 average로 가정하고 정규화
    const normalizedBalance = 1 - (stdDev / (average + 1))
    
    return Math.max(0, Math.min(1, normalizedBalance))
  }
}