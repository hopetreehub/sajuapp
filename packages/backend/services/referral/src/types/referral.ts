// 추천인 시스템 타입 정의

export interface ReferralCode {
  id: number
  code: string
  user_id: string
  created_at: string
  expires_at?: string
  max_uses?: number
  current_uses: number
  is_active: boolean
  fortune_category?: string
  regional_bonus: boolean
}

export interface ReferralRelationship {
  id: number
  referrer_id: string
  referee_id: string
  referral_code: string
  referred_at: string
  first_payment_at?: string
  total_referee_value: number
  referrer_reward_given: number
  relationship_type?: 'family' | 'friend' | 'couple' | 'colleague'
  shared_analysis_count: number
}

export interface ReferralReward {
  id: number
  user_id: string
  reward_type: 'premium_days' | 'analysis_credits' | 'cash_discount'
  reward_value: number
  earned_from_referral_id?: number
  earned_at: string
  redeemed_at?: string
  expires_at?: string
  fortune_unlock?: string
  compatibility_bonus: boolean
}

export interface ReferralEvent {
  id: number
  event_type: 'code_generated' | 'code_used' | 'reward_earned' | 'reward_redeemed'
  user_id: string
  referral_code?: string
  referral_relationship_id?: number
  event_data?: Record<string, any>
  created_at: string
}

// 통계용 인터페이스
export interface ReferralUserStats {
  user_id: string
  my_referral_code: string
  total_invitations: number
  successful_referrals: number
  total_generated_value: number
  total_rewards_received: number
  last_referral_date?: string
}

// API 요청/응답 타입들
export interface GenerateReferralCodeRequest {
  user_id: string
  fortune_category?: string
  max_uses?: number
  expires_at?: string
}

export interface GenerateReferralCodeResponse {
  success: boolean
  data: {
    code: string
    expires_at?: string
    message: string
  }
  error?: string
}

export interface ApplyReferralCodeRequest {
  user_id: string
  referral_code: string
  relationship_type?: 'family' | 'friend' | 'couple' | 'colleague'
}

export interface ApplyReferralCodeResponse {
  success: boolean
  data?: {
    relationship_id: number
    referrer_name?: string
    welcome_rewards: ReferralReward[]
    message: string
  }
  error?: string
}

export interface ValidateCodeResponse {
  valid: boolean
  data?: {
    code: string
    referrer_name?: string
    fortune_category?: string
    benefits: string[]
    expires_at?: string
    uses_remaining?: number
  }
  error?: string
}

export interface ReferralDashboardResponse {
  success: boolean
  data: {
    user_stats: ReferralUserStats
    my_codes: ReferralCode[]
    recent_referrals: Array<{
      referee_name?: string
      referred_at: string
      status: 'pending' | 'active' | 'rewarded'
    }>
    available_rewards: ReferralReward[]
    pending_rewards: ReferralReward[]
    next_milestone: {
      target: number
      current: number
      reward: string
    }
  }
  error?: string
}

export interface UserRewardsResponse {
  success: boolean
  data: {
    available: ReferralReward[]
    claimed: ReferralReward[]
    expired: ReferralReward[]
    total_value: number
  }
  error?: string
}

export interface ClaimRewardRequest {
  user_id: string
  reward_id: number
}

export interface ClaimRewardResponse {
  success: boolean
  data?: {
    reward: ReferralReward
    message: string
  }
  error?: string
}

// 관리자용 인터페이스
export interface ReferralAnalyticsResponse {
  success: boolean
  data: {
    total_codes: number
    total_relationships: number
    conversion_rate: number
    popular_categories: Array<{
      category: string
      count: number
    }>
    monthly_growth: Array<{
      month: string
      new_referrals: number
      successful_conversions: number
    }>
    top_referrers: Array<{
      user_id: string
      name?: string
      total_referrals: number
      success_rate: number
    }>
  }
  error?: string
}

export interface BulkRewardRequest {
  rewards: Array<{
    user_id: string
    reward_type: 'premium_days' | 'analysis_credits' | 'cash_discount'
    reward_value: number
    reason: string
  }>
}

// 에러 타입
export class ReferralError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'ReferralError'
  }
}

// 상수들
export const REFERRAL_CONSTANTS = {
  CODE_LENGTH: 8,
  DEFAULT_EXPIRY_DAYS: 30,
  MAX_CODES_PER_USER: 5,
  DEFAULT_REWARD_VALUES: {
    WELCOME_PREMIUM_DAYS: 7,
    REFERRER_PREMIUM_DAYS: 3,
    MILESTONE_REWARDS: {
      5: { type: 'premium_days', value: 30 },
      10: { type: 'analysis_credits', value: 50 },
      20: { type: 'cash_discount', value: 10000 } // 10,000원
    }
  },
  FORTUNE_CATEGORIES: [
    '총운', '연애운', '재물운', '건강운', '직업운', '학업운'
  ] as const,
  RELATIONSHIP_TYPES: [
    'family', 'friend', 'couple', 'colleague'
  ] as const
} as const

export type FortuneCategory = typeof REFERRAL_CONSTANTS.FORTUNE_CATEGORIES[number]
export type RelationshipType = typeof REFERRAL_CONSTANTS.RELATIONSHIP_TYPES[number]