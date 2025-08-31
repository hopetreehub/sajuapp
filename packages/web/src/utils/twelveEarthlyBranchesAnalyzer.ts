// 12간지 분석 유틸리티

import {
  TwelveEarthlyBranchesData,
  EarthlyBranchType,
  EarthlyBranchAnalysis,
  BranchRelationship,
  BranchInteractionMatrix,
  SeasonalBalance,
  AnimalPersonality,
  BranchRecommendations,
  EARTHLY_BRANCHES_INFO
} from '@/types/twelveEarthlyBranches'
import { SajuData } from '@/types/saju'

export class TwelveEarthlyBranchesAnalyzer {
  
  /**
   * 사주 데이터로부터 12간지 분석
   */
  static analyzeFromSaju(sajuData: SajuData): TwelveEarthlyBranchesData {
    // 실제 사주 데이터에서 12간지 정보 추출
    // 여기서는 더미 데이터를 사용 (실제 구현 시 사주팔자에서 지지 추출)
    const branches: TwelveEarthlyBranchesData = {
      ja: Math.floor(Math.random() * 30),     // 자(子) - 쥐
      chuk: Math.floor(Math.random() * 30),   // 축(丑) - 소
      in: Math.floor(Math.random() * 30),     // 인(寅) - 호랑이
      myo: Math.floor(Math.random() * 30),    // 묘(卯) - 토끼
      jin: Math.floor(Math.random() * 30),    // 진(辰) - 용
      sa: Math.floor(Math.random() * 30),     // 사(巳) - 뱀
      o: Math.floor(Math.random() * 30),      // 오(午) - 말
      mi: Math.floor(Math.random() * 30),     // 미(未) - 양
      sin: Math.floor(Math.random() * 30),    // 신(申) - 원숭이
      yu: Math.floor(Math.random() * 30),     // 유(酉) - 닭
      sul: Math.floor(Math.random() * 30),    // 술(戌) - 개
      hae: Math.floor(Math.random() * 30)     // 해(亥) - 돼지
    }
    
    // 생년지지, 월지, 일지, 시지에 따라 가중치 부여
    const yearBranch = this.getYearBranch(sajuData.birthDate.year)
    if (yearBranch) {
      branches[yearBranch] += 30
    }
    
    return branches
  }

  /**
   * 종합 12간지 분석 실행
   */
  static performFullAnalysis(sajuData: SajuData): EarthlyBranchAnalysis {
    const data = this.analyzeFromSaju(sajuData)
    const total = Object.values(data).reduce((sum, val) => sum + val, 0)
    
    // 강한/약한/없는 간지 판정
    const dominant: EarthlyBranchType[] = []
    const missing: EarthlyBranchType[] = []
    
    Object.entries(data).forEach(([key, value]) => {
      const branch = key as EarthlyBranchType
      if (value === 0) {
        missing.push(branch)
      } else if (value >= 30) {
        dominant.push(branch)
      }
    })
    
    const interactions = this.analyzeInteractions(data)
    const overallHarmony = this.calculateOverallHarmony(data, interactions)
    const seasonalBalance = this.calculateSeasonalBalance(data)
    const animalPersonality = this.analyzeAnimalPersonality(data, dominant)
    const recommendations = this.generateRecommendations(data, dominant, missing)
    
    return {
      data,
      total,
      dominant,
      missing,
      interactions,
      overallHarmony,
      seasonalBalance,
      animalPersonality,
      recommendations
    }
  }

  /**
   * 생년으로부터 지지 추출
   */
  private static getYearBranch(year: number): EarthlyBranchType | null {
    const branches: EarthlyBranchType[] = [
      'sin', 'yu', 'sul', 'hae', 'ja', 'chuk', 
      'in', 'myo', 'jin', 'sa', 'o', 'mi'
    ]
    const index = year % 12
    return branches[index] || null
  }

  /**
   * 간지 간 상호작용 분석
   */
  private static analyzeInteractions(data: TwelveEarthlyBranchesData): BranchInteractionMatrix {
    const interactions: BranchInteractionMatrix = {}
    
    // 주요 간지들 간의 관계 분석
    const significantBranches = Object.entries(data)
      .filter(([_, value]) => value > 10)
      .map(([key]) => key as EarthlyBranchType)
    
    for (let i = 0; i < significantBranches.length; i++) {
      for (let j = i + 1; j < significantBranches.length; j++) {
        const branch1 = significantBranches[i]
        const branch2 = significantBranches[j]
        const key = `${branch1}-${branch2}`
        
        interactions[key] = this.analyzeRelationship(branch1, branch2)
      }
    }
    
    return interactions
  }

  /**
   * 두 간지 간의 관계 분석
   */
  private static analyzeRelationship(
    branch1: EarthlyBranchType, 
    branch2: EarthlyBranchType
  ): {
    relationship: BranchRelationship
    effects: string[]
    recommendations: string[]
  } {
    const info1 = EARTHLY_BRANCHES_INFO[branch1]
    const info2 = EARTHLY_BRANCHES_INFO[branch2]
    
    // 합(合) 관계 체크
    if (info1.compatibility.includes(branch2)) {
      return {
        relationship: {
          type: 'harmony',
          strength: 80,
          description: '서로 조화를 이루며 시너지를 발생시킴'
        },
        effects: ['긍정적 에너지 증폭', '목표 달성 용이', '관계 개선'],
        recommendations: ['함께 협력하면 좋은 결과', '파트너십 강화 필요']
      }
    }
    
    // 충(沖) 관계 체크
    if (info1.conflict.includes(branch2)) {
      return {
        relationship: {
          type: 'conflict',
          strength: 70,
          description: '서로 대립하고 충돌하는 관계'
        },
        effects: ['갈등 가능성', '스트레스 증가', '의견 충돌'],
        recommendations: ['중재자 필요', '거리두기 권장', '이해와 배려 필요']
      }
    }
    
    // 중립 관계
    return {
      relationship: {
        type: 'neutral',
        strength: 30,
        description: '특별한 영향 없는 중립적 관계'
      },
      effects: ['평범한 관계', '특별한 영향 없음'],
      recommendations: ['자연스러운 관계 유지']
    }
  }

  /**
   * 전체 조화도 계산
   */
  private static calculateOverallHarmony(
    data: TwelveEarthlyBranchesData,
    interactions: BranchInteractionMatrix
  ): number {
    let harmonyScore = 50
    
    // 상호작용 기반 점수 조정
    Object.values(interactions).forEach(interaction => {
      if (interaction.relationship.type === 'harmony') {
        harmonyScore += 10
      } else if (interaction.relationship.type === 'conflict') {
        harmonyScore -= 10
      }
    })
    
    // 분포 균형도 반영
    const values = Object.values(data)
    const average = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length
    
    // 분산이 작을수록 균형적
    harmonyScore += Math.max(0, 30 - Math.sqrt(variance))
    
    return Math.max(0, Math.min(100, harmonyScore))
  }

  /**
   * 계절별 균형도 계산
   */
  private static calculateSeasonalBalance(data: TwelveEarthlyBranchesData): SeasonalBalance {
    const spring = (data.in || 0) + (data.myo || 0) + (data.jin || 0)
    const summer = (data.sa || 0) + (data.o || 0) + (data.mi || 0)
    const autumn = (data.sin || 0) + (data.yu || 0) + (data.sul || 0)
    const winter = (data.hae || 0) + (data.ja || 0) + (data.chuk || 0)
    
    const total = spring + summer + autumn + winter
    
    // 계절별 백분율 계산
    const springPct = total > 0 ? (spring / total) * 100 : 25
    const summerPct = total > 0 ? (summer / total) * 100 : 25
    const autumnPct = total > 0 ? (autumn / total) * 100 : 25
    const winterPct = total > 0 ? (winter / total) * 100 : 25
    
    // 균형도 계산 (이상적인 25%에서 벗어난 정도)
    const deviations = [
      Math.abs(springPct - 25),
      Math.abs(summerPct - 25),
      Math.abs(autumnPct - 25),
      Math.abs(winterPct - 25)
    ]
    
    const maxDeviation = Math.max(...deviations)
    const balance = Math.max(0, 100 - (maxDeviation * 2))
    
    return {
      spring: springPct,
      summer: summerPct,
      autumn: autumnPct,
      winter: winterPct,
      balance
    }
  }

  /**
   * 동물 성격 분석
   */
  private static analyzeAnimalPersonality(
    data: TwelveEarthlyBranchesData,
    dominant: EarthlyBranchType[]
  ): AnimalPersonality {
    // 가장 강한 간지의 동물 성격
    const primaryBranch = dominant[0] || 'ja'
    const info = EARTHLY_BRANCHES_INFO[primaryBranch]
    
    return {
      primaryAnimal: `${info.animalEmoji} ${info.animal}형 인격`,
      traits: info.positiveTraits,
      compatibility: info.compatibility.map(branch => 
        EARTHLY_BRANCHES_INFO[branch].animal
      ),
      cautions: info.negativeTraits,
      lifePattern: `${info.time} 시간대에 활동적, ${info.direction}방향 선호`
    }
  }

  /**
   * 맞춤 추천사항 생성
   */
  private static generateRecommendations(
    data: TwelveEarthlyBranchesData,
    dominant: EarthlyBranchType[],
    missing: EarthlyBranchType[]
  ): BranchRecommendations {
    const colors: BranchRecommendations['colors'] = []
    const directions: BranchRecommendations['directions'] = []
    const timing: BranchRecommendations['timing'] = []
    const relationships: BranchRecommendations['relationships'] = []
    
    // 강한 간지 기반 추천
    dominant.forEach(branch => {
      const info = EARTHLY_BRANCHES_INFO[branch]
      
      colors.push({
        color: info.color.primary,
        hex: info.color.primary,
        reason: `${info.animal}의 기운을 강화`
      })
      
      directions.push({
        direction: info.direction,
        benefit: `${info.element} 오행 에너지 증진`
      })
      
      timing.push({
        period: info.time,
        activity: '중요한 일정',
        effect: '최상의 컨디션과 운세'
      })
    })
    
    // 관계 추천
    if (dominant.length > 0) {
      const primaryInfo = EARTHLY_BRANCHES_INFO[dominant[0]]
      relationships.push({
        compatible: primaryInfo.compatibility.map(b => 
          EARTHLY_BRANCHES_INFO[b].animal
        ),
        avoid: primaryInfo.conflict.map(b => 
          EARTHLY_BRANCHES_INFO[b].animal
        ),
        reason: '간지 상성과 상충 관계'
      })
    }
    
    return {
      colors: colors.slice(0, 3),
      directions: directions.slice(0, 2),
      timing: timing.slice(0, 3),
      relationships: relationships.slice(0, 1)
    }
  }
}