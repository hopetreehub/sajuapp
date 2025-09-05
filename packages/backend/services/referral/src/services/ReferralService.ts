import { ReferralModel } from '../models/ReferralModel'
import { ReferralCodeGenerator } from '../utils/codeGenerator'
import {
  GenerateReferralCodeRequest,
  GenerateReferralCodeResponse,
  ApplyReferralCodeRequest,
  ApplyReferralCodeResponse,
  ValidateCodeResponse,
  ReferralDashboardResponse,
  UserRewardsResponse,
  ClaimRewardRequest,
  ClaimRewardResponse,
  ReferralError,
  REFERRAL_CONSTANTS,
  FortuneCategory,
  RelationshipType
} from '../types/referral'

export class ReferralService {
  /**
   * 새 추천 코드 생성
   */
  static async generateReferralCode(
    request: GenerateReferralCodeRequest
  ): Promise<GenerateReferralCodeResponse> {
    try {
      // 사용자당 코드 생성 제한 확인
      const existingCodes = await ReferralModel.getUserReferralCodes(request.user_id)
      const activeCodes = existingCodes.filter(code => code.is_active)
      
      if (activeCodes.length >= REFERRAL_CONSTANTS.MAX_CODES_PER_USER) {
        return {
          success: false,
          error: `사용자당 최대 ${REFERRAL_CONSTANTS.MAX_CODES_PER_USER}개의 활성 코드만 생성할 수 있습니다`
        }
      }

      // 만료일 설정 (제공되지 않으면 기본값 사용)
      let expiresAt: string | undefined
      if (request.expires_at) {
        expiresAt = request.expires_at
      } else {
        const expiry = new Date()
        expiry.setDate(expiry.getDate() + REFERRAL_CONSTANTS.DEFAULT_EXPIRY_DAYS)
        expiresAt = expiry.toISOString()
      }

      // 코드 생성
      const code = await ReferralCodeGenerator.generateCode(
        request.user_id,
        request.fortune_category as FortuneCategory
      )

      // 데이터베이스에 저장
      const savedCode = await ReferralModel.createReferralCode({
        code,
        user_id: request.user_id,
        fortune_category: request.fortune_category as FortuneCategory,
        max_uses: request.max_uses,
        expires_at: expiresAt
      })

      // 성공 메시지 생성
      const description = ReferralCodeGenerator.getCodeDescription(code, request.fortune_category as FortuneCategory)

      return {
        success: true,
        data: {
          code: savedCode.code,
          expires_at: savedCode.expires_at,
          message: `${description}이 생성되었습니다!`
        }
      }
    } catch (error: any) {
      console.error('❌ 추천 코드 생성 실패:', error)
      
      return {
        success: false,
        error: error instanceof ReferralError ? error.message : '추천 코드 생성에 실패했습니다'
      }
    }
  }

  /**
   * 추천 코드 유효성 검증
   */
  static async validateReferralCode(code: string): Promise<ValidateCodeResponse> {
    try {
      const codeData = await ReferralModel.getReferralCodeByCode(code.toUpperCase())
      
      if (!codeData) {
        return {
          valid: false,
          error: '존재하지 않는 추천 코드입니다'
        }
      }

      // 만료 확인
      if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
        return {
          valid: false,
          error: '만료된 추천 코드입니다'
        }
      }

      // 사용 횟수 확인
      if (codeData.max_uses && codeData.current_uses >= codeData.max_uses) {
        return {
          valid: false,
          error: '사용 횟수가 초과된 추천 코드입니다'
        }
      }

      // 활성 상태 확인
      if (!codeData.is_active) {
        return {
          valid: false,
          error: '비활성화된 추천 코드입니다'
        }
      }

      // 혜택 목록 생성
      const benefits = this.generateBenefitsList(codeData.fortune_category as FortuneCategory)
      
      // 남은 사용 횟수 계산
      let usesRemaining: number | undefined
      if (codeData.max_uses) {
        usesRemaining = codeData.max_uses - codeData.current_uses
      }

      return {
        valid: true,
        data: {
          code: codeData.code,
          fortune_category: codeData.fortune_category,
          benefits,
          expires_at: codeData.expires_at,
          uses_remaining: usesRemaining
        }
      }
    } catch (error: any) {
      console.error('❌ 코드 검증 실패:', error)
      
      return {
        valid: false,
        error: '코드 검증 중 오류가 발생했습니다'
      }
    }
  }

  /**
   * 추천 코드 적용
   */
  static async applyReferralCode(
    request: ApplyReferralCodeRequest
  ): Promise<ApplyReferralCodeResponse> {
    try {
      // 코드 유효성 먼저 확인
      const validation = await this.validateReferralCode(request.referral_code)
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        }
      }

      // 추천자 정보 조회
      const codeData = await ReferralModel.getReferralCodeByCode(request.referral_code.toUpperCase())
      if (!codeData) {
        return {
          success: false,
          error: '추천 코드 정보를 찾을 수 없습니다'
        }
      }

      // 추천 관계 생성
      const relationship = await ReferralModel.applyReferralCode({
        referrer_id: codeData.user_id,
        referee_id: request.user_id,
        referral_code: request.referral_code.toUpperCase(),
        relationship_type: request.relationship_type as RelationshipType
      })

      // 환영 보상 생성 (신규 가입자)
      const welcomeRewards = await this.createWelcomeRewards(
        request.user_id,
        relationship.id,
        codeData.fortune_category as FortuneCategory
      )

      // 추천자 보상 생성
      await this.createReferrerRewards(
        codeData.user_id,
        relationship.id,
        codeData.fortune_category as FortuneCategory
      )

      return {
        success: true,
        data: {
          relationship_id: relationship.id,
          welcome_rewards: welcomeRewards,
          message: '추천 코드가 성공적으로 적용되었습니다! 환영 보상을 확인해보세요.'
        }
      }
    } catch (error: any) {
      console.error('❌ 추천 코드 적용 실패:', error)
      
      return {
        success: false,
        error: error instanceof ReferralError ? error.message : '추천 코드 적용에 실패했습니다'
      }
    }
  }

  /**
   * 사용자 추천 대시보드 데이터 조회
   */
  static async getUserDashboard(userId: string): Promise<ReferralDashboardResponse> {
    try {
      // 사용자 통계 조회
      const userStats = await ReferralModel.getUserReferralStats(userId)
      
      // 내 추천 코드들
      const myCodes = await ReferralModel.getUserReferralCodes(userId)
      
      // 최근 추천 현황 (최대 5개)
      const recentReferrals = await ReferralModel.getUserReferrals(userId, 5)
      
      // 사용 가능한 보상들
      const availableRewards = await ReferralModel.getUserRewards(userId, 'available')
      
      // 대기 중인 보상들
      const pendingRewards = await ReferralModel.getUserRewards(userId, 'available')
        .then(rewards => rewards.filter(r => !r.redeemed_at))
      
      // 다음 마일스톤 계산
      const nextMilestone = this.calculateNextMilestone(userStats.successful_referrals)

      return {
        success: true,
        data: {
          user_stats: userStats,
          my_codes: myCodes,
          recent_referrals: recentReferrals.map(r => ({
            referred_at: r.referred_at,
            status: r.first_payment_at ? 'rewarded' : 'pending'
          })),
          available_rewards: availableRewards,
          pending_rewards: pendingRewards,
          next_milestone: nextMilestone
        }
      }
    } catch (error: any) {
      console.error('❌ 대시보드 조회 실패:', error)
      
      return {
        success: false,
        error: '대시보드 정보를 불러오는데 실패했습니다'
      }
    }
  }

  /**
   * 사용자 보상 목록 조회
   */
  static async getUserRewards(userId: string): Promise<UserRewardsResponse> {
    try {
      const available = await ReferralModel.getUserRewards(userId, 'available')
      const claimed = await ReferralModel.getUserRewards(userId, 'redeemed')
      const expired = await ReferralModel.getUserRewards(userId, 'expired')
      
      const totalValue = available.reduce((sum, reward) => sum + reward.reward_value, 0) +
                        claimed.reduce((sum, reward) => sum + reward.reward_value, 0)

      return {
        success: true,
        data: {
          available,
          claimed,
          expired,
          total_value: totalValue
        }
      }
    } catch (error: any) {
      console.error('❌ 보상 목록 조회 실패:', error)
      
      return {
        success: false,
        error: '보상 목록을 불러오는데 실패했습니다'
      }
    }
  }

  /**
   * 보상 사용
   */
  static async claimReward(request: ClaimRewardRequest): Promise<ClaimRewardResponse> {
    try {
      const reward = await ReferralModel.redeemReward(request.reward_id, request.user_id)
      
      return {
        success: true,
        data: {
          reward,
          message: `${this.getRewardDescription(reward)}을 성공적으로 받았습니다!`
        }
      }
    } catch (error: any) {
      console.error('❌ 보상 사용 실패:', error)
      
      return {
        success: false,
        error: error instanceof ReferralError ? error.message : '보상 사용에 실패했습니다'
      }
    }
  }

  // === 헬퍼 메서드들 ===

  /**
   * 카테고리별 혜택 목록 생성
   */
  private static generateBenefitsList(category?: FortuneCategory): string[] {
    const commonBenefits = ['프리미엄 운세 해석 7일 무료', '친구 추천 보너스 적립']
    
    const categoryBenefits: Record<string, string[]> = {
      '연애운': ['커플 궁합 분석 무료', '연애 운세 특별 해석'],
      '재물운': ['재물운 상세 분석', '투자 길일 추천'],
      '건강운': ['건강 운세 모니터링', '건강관리 조언'],
      '직업운': ['취업/이직 운세 분석', '사업운 검토'],
      '학업운': ['시험운 분석', '학습 효율 증대 방법']
    }
    
    if (category && categoryBenefits[category]) {
      return [...commonBenefits, ...categoryBenefits[category]]
    }
    
    return commonBenefits
  }

  /**
   * 환영 보상 생성
   */
  private static async createWelcomeRewards(
    userId: string,
    relationshipId: number,
    category?: FortuneCategory
  ) {
    const rewards = []
    
    // 기본 프리미엄 일수 보상
    const premiumReward = await ReferralModel.createReward({
      user_id: userId,
      reward_type: 'premium_days',
      reward_value: REFERRAL_CONSTANTS.DEFAULT_REWARD_VALUES.WELCOME_PREMIUM_DAYS,
      earned_from_referral_id: relationshipId,
      expires_at: this.getExpiryDate(30).toISOString()
    })
    
    rewards.push(premiumReward)
    
    // 카테고리별 추가 보상
    if (category) {
      const categoryReward = await ReferralModel.createReward({
        user_id: userId,
        reward_type: 'analysis_credits',
        reward_value: 3,
        earned_from_referral_id: relationshipId,
        fortune_unlock: `${category} 특별 분석`,
        expires_at: this.getExpiryDate(15).toISOString()
      })
      
      rewards.push(categoryReward)
    }
    
    return rewards
  }

  /**
   * 추천자 보상 생성
   */
  private static async createReferrerRewards(
    referrerId: string,
    relationshipId: number,
    category?: FortuneCategory
  ) {
    // 추천자 기본 보상
    await ReferralModel.createReward({
      user_id: referrerId,
      reward_type: 'premium_days',
      reward_value: REFERRAL_CONSTANTS.DEFAULT_REWARD_VALUES.REFERRER_PREMIUM_DAYS,
      earned_from_referral_id: relationshipId,
      expires_at: this.getExpiryDate(30).toISOString()
    })

    // 마일스톤 보상 확인
    const userStats = await ReferralModel.getUserReferralStats(referrerId)
    const milestones = REFERRAL_CONSTANTS.DEFAULT_REWARD_VALUES.MILESTONE_REWARDS
    
    if (milestones[userStats.successful_referrals as keyof typeof milestones]) {
      const milestone = milestones[userStats.successful_referrals as keyof typeof milestones]
      
      await ReferralModel.createReward({
        user_id: referrerId,
        reward_type: milestone.type as any,
        reward_value: milestone.value,
        earned_from_referral_id: relationshipId,
        expires_at: this.getExpiryDate(90).toISOString()
      })
    }
  }

  /**
   * 다음 마일스톤 계산
   */
  private static calculateNextMilestone(currentReferrals: number): {
    target: number
    current: number
    reward: string
  } {
    const milestones = [5, 10, 20, 50, 100]
    const nextTarget = milestones.find(m => m > currentReferrals) || 100
    
    const rewards: Record<number, string> = {
      5: '프리미엄 1개월 무료',
      10: '분석 크레딧 50개',
      20: '할인 쿠폰 10,000원',
      50: '프리미엄 6개월 무료',
      100: '평생 프리미엄 혜택'
    }
    
    return {
      target: nextTarget,
      current: currentReferrals,
      reward: rewards[nextTarget] || '특별 혜택'
    }
  }

  /**
   * 보상 설명 텍스트 생성
   */
  private static getRewardDescription(reward: any): string {
    switch (reward.reward_type) {
      case 'premium_days':
        return `프리미엄 ${reward.reward_value}일`
      case 'analysis_credits':
        return `분석 크레딧 ${reward.reward_value}개`
      case 'cash_discount':
        return `할인 쿠폰 ${reward.reward_value.toLocaleString()}원`
      default:
        return '특별 보상'
    }
  }

  /**
   * 만료일 계산 헬퍼
   */
  private static getExpiryDate(days: number): Date {
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + days)
    return expiry
  }
}