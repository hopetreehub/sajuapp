import DatabaseConnection from '../database/connection'
import { 
  ReferralCode, 
  ReferralRelationship, 
  ReferralReward, 
  ReferralUserStats,
  ReferralError,
  REFERRAL_CONSTANTS,
  FortuneCategory,
  RelationshipType
} from '../types/referral'

export class ReferralModel {
  /**
   * 추천 코드 생성 및 저장
   */
  static async createReferralCode(data: {
    code: string
    user_id: string
    fortune_category?: FortuneCategory
    max_uses?: number
    expires_at?: string
    regional_bonus?: boolean
  }): Promise<ReferralCode> {
    try {
      const result = await DatabaseConnection.run(`
        INSERT INTO referral_codes (
          code, user_id, fortune_category, max_uses, expires_at, regional_bonus
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        data.code,
        data.user_id,
        data.fortune_category || null,
        data.max_uses || null,
        data.expires_at || null,
        data.regional_bonus || false
      ])

      return await this.getReferralCodeById(result.lastID)
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new ReferralError('이미 존재하는 추천 코드입니다', 'DUPLICATE_CODE', 409)
      }
      throw new ReferralError(`추천 코드 생성 실패: ${error.message}`, 'CREATE_FAILED', 500)
    }
  }

  /**
   * ID로 추천 코드 조회
   */
  static async getReferralCodeById(id: number): Promise<ReferralCode> {
    const code = await DatabaseConnection.get(
      'SELECT * FROM referral_codes WHERE id = ?',
      [id]
    )

    if (!code) {
      throw new ReferralError('추천 코드를 찾을 수 없습니다', 'CODE_NOT_FOUND', 404)
    }

    return code as ReferralCode
  }

  /**
   * 코드 문자열로 추천 코드 조회
   */
  static async getReferralCodeByCode(code: string): Promise<ReferralCode | null> {
    const result = await DatabaseConnection.get(
      'SELECT * FROM referral_codes WHERE code = ? AND is_active = 1',
      [code]
    )

    return result as ReferralCode | null
  }

  /**
   * 사용자의 모든 추천 코드 조회
   */
  static async getUserReferralCodes(userId: string): Promise<ReferralCode[]> {
    const codes = await DatabaseConnection.query(`
      SELECT * FROM referral_codes 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `, [userId])

    return codes as ReferralCode[]
  }

  /**
   * 추천 코드 사용 (추천 관계 생성)
   */
  static async applyReferralCode(data: {
    referrer_id: string
    referee_id: string
    referral_code: string
    relationship_type?: RelationshipType
  }): Promise<ReferralRelationship> {
    // 트랜잭션으로 원자성 보장
    try {
      await DatabaseConnection.run('BEGIN TRANSACTION')

      // 1. 추천 코드 유효성 검사
      const codeData = await this.getReferralCodeByCode(data.referral_code)
      if (!codeData) {
        throw new ReferralError('유효하지 않은 추천 코드입니다', 'INVALID_CODE', 400)
      }

      // 2. 만료 확인
      if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
        throw new ReferralError('만료된 추천 코드입니다', 'EXPIRED_CODE', 400)
      }

      // 3. 사용 횟수 확인
      if (codeData.max_uses && codeData.current_uses >= codeData.max_uses) {
        throw new ReferralError('사용 횟수가 초과된 추천 코드입니다', 'USAGE_EXCEEDED', 400)
      }

      // 4. 자기 추천 방지
      if (data.referrer_id === data.referee_id) {
        throw new ReferralError('자신의 추천 코드는 사용할 수 없습니다', 'SELF_REFERRAL', 400)
      }

      // 5. 중복 추천 확인
      const existingRelation = await DatabaseConnection.get(
        'SELECT * FROM referral_relationships WHERE referee_id = ?',
        [data.referee_id]
      )

      if (existingRelation) {
        throw new ReferralError('이미 추천을 받은 사용자입니다', 'ALREADY_REFERRED', 409)
      }

      // 6. 추천 관계 생성
      const relationshipResult = await DatabaseConnection.run(`
        INSERT INTO referral_relationships (
          referrer_id, referee_id, referral_code, relationship_type
        ) VALUES (?, ?, ?, ?)
      `, [
        data.referrer_id,
        data.referee_id,
        data.referral_code,
        data.relationship_type || null
      ])

      await DatabaseConnection.run('COMMIT')

      return await this.getReferralRelationshipById(relationshipResult.lastID)
    } catch (error: any) {
      await DatabaseConnection.run('ROLLBACK')
      
      if (error instanceof ReferralError) {
        throw error
      }
      
      throw new ReferralError(`추천 적용 실패: ${error.message}`, 'APPLY_FAILED', 500)
    }
  }

  /**
   * 추천 관계 조회
   */
  static async getReferralRelationshipById(id: number): Promise<ReferralRelationship> {
    const relationship = await DatabaseConnection.get(
      'SELECT * FROM referral_relationships WHERE id = ?',
      [id]
    )

    if (!relationship) {
      throw new ReferralError('추천 관계를 찾을 수 없습니다', 'RELATIONSHIP_NOT_FOUND', 404)
    }

    return relationship as ReferralRelationship
  }

  /**
   * 사용자의 추천 통계 조회
   */
  static async getUserReferralStats(userId: string): Promise<ReferralUserStats> {
    const stats = await DatabaseConnection.get(`
      SELECT 
        user_id,
        my_referral_code,
        total_invitations,
        successful_referrals,
        total_generated_value,
        total_rewards_received,
        last_referral_date
      FROM referral_user_stats 
      WHERE user_id = ?
    `, [userId])

    if (!stats) {
      // 통계가 없으면 빈 통계 반환
      return {
        user_id: userId,
        my_referral_code: '',
        total_invitations: 0,
        successful_referrals: 0,
        total_generated_value: 0,
        total_rewards_received: 0
      } as ReferralUserStats
    }

    return stats as ReferralUserStats
  }

  /**
   * 사용자가 추천한 사람들 목록 조회
   */
  static async getUserReferrals(userId: string, limit?: number): Promise<ReferralRelationship[]> {
    const sql = `
      SELECT * FROM referral_relationships 
      WHERE referrer_id = ? 
      ORDER BY referred_at DESC
      ${limit ? `LIMIT ${limit}` : ''}
    `
    
    const referrals = await DatabaseConnection.query(sql, [userId])
    return referrals as ReferralRelationship[]
  }

  /**
   * 보상 생성
   */
  static async createReward(data: {
    user_id: string
    reward_type: 'premium_days' | 'analysis_credits' | 'cash_discount'
    reward_value: number
    earned_from_referral_id?: number
    expires_at?: string
    fortune_unlock?: string
    compatibility_bonus?: boolean
  }): Promise<ReferralReward> {
    try {
      const result = await DatabaseConnection.run(`
        INSERT INTO referral_rewards (
          user_id, reward_type, reward_value, earned_from_referral_id, 
          expires_at, fortune_unlock, compatibility_bonus
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        data.user_id,
        data.reward_type,
        data.reward_value,
        data.earned_from_referral_id || null,
        data.expires_at || null,
        data.fortune_unlock || null,
        data.compatibility_bonus || false
      ])

      return await this.getRewardById(result.lastID)
    } catch (error: any) {
      throw new ReferralError(`보상 생성 실패: ${error.message}`, 'REWARD_CREATE_FAILED', 500)
    }
  }

  /**
   * 보상 조회
   */
  static async getRewardById(id: number): Promise<ReferralReward> {
    const reward = await DatabaseConnection.get(
      'SELECT * FROM referral_rewards WHERE id = ?',
      [id]
    )

    if (!reward) {
      throw new ReferralError('보상을 찾을 수 없습니다', 'REWARD_NOT_FOUND', 404)
    }

    return reward as ReferralReward
  }

  /**
   * 사용자 보상 목록 조회
   */
  static async getUserRewards(
    userId: string, 
    status?: 'available' | 'redeemed' | 'expired'
  ): Promise<ReferralReward[]> {
    let whereClause = 'WHERE user_id = ?'
    const params = [userId]

    if (status === 'available') {
      whereClause += ' AND redeemed_at IS NULL AND (expires_at IS NULL OR expires_at > datetime("now"))'
    } else if (status === 'redeemed') {
      whereClause += ' AND redeemed_at IS NOT NULL'
    } else if (status === 'expired') {
      whereClause += ' AND redeemed_at IS NULL AND expires_at <= datetime("now")'
    }

    const rewards = await DatabaseConnection.query(`
      SELECT * FROM referral_rewards 
      ${whereClause}
      ORDER BY earned_at DESC
    `, params)

    return rewards as ReferralReward[]
  }

  /**
   * 보상 사용 처리
   */
  static async redeemReward(rewardId: number, userId: string): Promise<ReferralReward> {
    try {
      await DatabaseConnection.run('BEGIN TRANSACTION')

      // 보상 존재 및 소유권 확인
      const reward = await DatabaseConnection.get(
        'SELECT * FROM referral_rewards WHERE id = ? AND user_id = ?',
        [rewardId, userId]
      )

      if (!reward) {
        throw new ReferralError('보상을 찾을 수 없습니다', 'REWARD_NOT_FOUND', 404)
      }

      // 이미 사용된 보상 확인
      if (reward.redeemed_at) {
        throw new ReferralError('이미 사용된 보상입니다', 'REWARD_ALREADY_REDEEMED', 409)
      }

      // 만료된 보상 확인
      if (reward.expires_at && new Date(reward.expires_at) < new Date()) {
        throw new ReferralError('만료된 보상입니다', 'REWARD_EXPIRED', 400)
      }

      // 보상 사용 처리
      await DatabaseConnection.run(`
        UPDATE referral_rewards 
        SET redeemed_at = datetime('now')
        WHERE id = ?
      `, [rewardId])

      await DatabaseConnection.run('COMMIT')

      return await this.getRewardById(rewardId)
    } catch (error: any) {
      await DatabaseConnection.run('ROLLBACK')
      
      if (error instanceof ReferralError) {
        throw error
      }
      
      throw new ReferralError(`보상 사용 실패: ${error.message}`, 'REDEEM_FAILED', 500)
    }
  }

  /**
   * 추천 코드 비활성화
   */
  static async deactivateReferralCode(codeId: number, userId: string): Promise<void> {
    const result = await DatabaseConnection.run(`
      UPDATE referral_codes 
      SET is_active = 0 
      WHERE id = ? AND user_id = ?
    `, [codeId, userId])

    if (result.changes === 0) {
      throw new ReferralError('추천 코드를 찾을 수 없거나 권한이 없습니다', 'CODE_NOT_FOUND', 404)
    }
  }

  /**
   * 추천 성과 업데이트 (결제 발생 시)
   */
  static async updateReferralPerformance(
    relationshipId: number,
    paymentAmount: number
  ): Promise<void> {
    try {
      await DatabaseConnection.run(`
        UPDATE referral_relationships 
        SET 
          first_payment_at = COALESCE(first_payment_at, datetime('now')),
          total_referee_value = total_referee_value + ?
        WHERE id = ?
      `, [paymentAmount, relationshipId])
    } catch (error: any) {
      throw new ReferralError(`성과 업데이트 실패: ${error.message}`, 'PERFORMANCE_UPDATE_FAILED', 500)
    }
  }

  /**
   * 관리자용: 전체 추천 통계
   */
  static async getGlobalStats(): Promise<{
    total_codes: number
    total_relationships: number
    total_rewards_given: number
    average_conversion_rate: number
  }> {
    const stats = await DatabaseConnection.get(`
      SELECT 
        (SELECT COUNT(*) FROM referral_codes WHERE is_active = 1) as total_codes,
        (SELECT COUNT(*) FROM referral_relationships) as total_relationships,
        (SELECT COUNT(*) FROM referral_rewards WHERE redeemed_at IS NOT NULL) as total_rewards_given,
        (SELECT 
          ROUND(
            CAST(COUNT(CASE WHEN first_payment_at IS NOT NULL THEN 1 END) AS REAL) / 
            CAST(COUNT(*) AS REAL) * 100, 2
          )
          FROM referral_relationships
        ) as average_conversion_rate
    `)

    return stats || {
      total_codes: 0,
      total_relationships: 0,
      total_rewards_given: 0,
      average_conversion_rate: 0
    }
  }

  /**
   * 코드 사용률이 높은 순으로 조회
   */
  static async getPopularCodes(limit: number = 10): Promise<Array<{
    code: string
    user_id: string
    usage_count: number
    conversion_rate: number
  }>> {
    const codes = await DatabaseConnection.query(`
      SELECT 
        rc.code,
        rc.user_id,
        rc.current_uses as usage_count,
        ROUND(
          CAST(COUNT(CASE WHEN rr.first_payment_at IS NOT NULL THEN 1 END) AS REAL) / 
          CAST(COUNT(rr.id) AS REAL) * 100, 2
        ) as conversion_rate
      FROM referral_codes rc
      LEFT JOIN referral_relationships rr ON rc.code = rr.referral_code
      WHERE rc.is_active = 1
      GROUP BY rc.code, rc.user_id, rc.current_uses
      ORDER BY usage_count DESC, conversion_rate DESC
      LIMIT ?
    `, [limit])

    return codes
  }
}