import express, { Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import { ReferralService } from '../services/ReferralService'
import { CodeValidator } from '../utils/codeGenerator'
import {
  GenerateReferralCodeRequest,
  ApplyReferralCodeRequest,
  ClaimRewardRequest,
  ReferralError
} from '../types/referral'

const router = express.Router()

// Rate limiting 설정
const referralRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 20, // 15분당 20회
  message: {
    success: false,
    error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

const codeGenerationLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24시간
  max: 5, // 하루 5개
  message: {
    success: false,
    error: '하루에 생성할 수 있는 추천 코드 수를 초과했습니다.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `code_gen_${req.body.user_id || req.ip}`
})

// 미들웨어: 요청 검증
const validateUserRequest = (req: Request, res: Response, next: express.NextFunction) => {
  const { user_id } = req.body
  
  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({
      success: false,
      error: '사용자 ID가 필요합니다'
    })
  }
  
  next()
}

// === 코드 관리 API ===

/**
 * POST /api/referral/codes
 * 새 추천 코드 생성
 */
router.post('/codes', codeGenerationLimit, validateUserRequest, async (req: Request, res: Response) => {
  try {
    console.log('📝 추천 코드 생성 요청:', req.body)
    
    const request: GenerateReferralCodeRequest = {
      user_id: req.body.user_id,
      fortune_category: req.body.fortune_category,
      max_uses: req.body.max_uses,
      expires_at: req.body.expires_at
    }

    const result = await ReferralService.generateReferralCode(request)
    
    if (result.success) {
      console.log('✅ 추천 코드 생성 성공:', result.data?.code)
      res.status(201).json(result)
    } else {
      console.log('❌ 추천 코드 생성 실패:', result.error)
      res.status(400).json(result)
    }
  } catch (error: any) {
    console.error('💥 추천 코드 생성 서버 오류:', error)
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다'
    })
  }
})

/**
 * GET /api/referral/codes/validate/:code
 * 추천 코드 유효성 검증
 */
router.get('/codes/validate/:code', referralRateLimit, async (req: Request, res: Response) => {
  try {
    const { code } = req.params
    
    console.log('🔍 추천 코드 검증 요청:', code)
    
    // 기본 형식 검증
    const formatValidation = CodeValidator.validateFormat(code)
    if (!formatValidation.valid) {
      return res.status(400).json({
        valid: false,
        error: formatValidation.errors[0]
      })
    }

    const result = await ReferralService.validateReferralCode(code)
    
    console.log('📊 코드 검증 결과:', result.valid ? '유효' : '무효')
    res.status(200).json(result)
  } catch (error: any) {
    console.error('💥 코드 검증 서버 오류:', error)
    res.status(500).json({
      valid: false,
      error: '서버 오류가 발생했습니다'
    })
  }
})

/**
 * GET /api/referral/codes/my/:userId
 * 내 추천 코드 목록 조회
 */
router.get('/codes/my/:userId', referralRateLimit, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    
    console.log('📋 사용자 코드 목록 요청:', userId)
    
    const dashboard = await ReferralService.getUserDashboard(userId)
    
    if (dashboard.success && dashboard.data) {
      res.status(200).json({
        success: true,
        data: dashboard.data.my_codes
      })
    } else {
      res.status(400).json({
        success: false,
        error: dashboard.error || '코드 목록을 불러올 수 없습니다'
      })
    }
  } catch (error: any) {
    console.error('💥 코드 목록 조회 서버 오류:', error)
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다'
    })
  }
})

// === 추천 처리 API ===

/**
 * POST /api/referral/apply
 * 추천 코드 적용
 */
router.post('/apply', referralRateLimit, validateUserRequest, async (req: Request, res: Response) => {
  try {
    console.log('🎯 추천 코드 적용 요청:', { user_id: req.body.user_id, code: req.body.referral_code })
    
    const request: ApplyReferralCodeRequest = {
      user_id: req.body.user_id,
      referral_code: req.body.referral_code,
      relationship_type: req.body.relationship_type
    }

    // 필수 필드 검증
    if (!request.referral_code) {
      return res.status(400).json({
        success: false,
        error: '추천 코드가 필요합니다'
      })
    }

    const result = await ReferralService.applyReferralCode(request)
    
    if (result.success) {
      console.log('✅ 추천 코드 적용 성공:', result.data?.relationship_id)
      res.status(201).json(result)
    } else {
      console.log('❌ 추천 코드 적용 실패:', result.error)
      res.status(400).json(result)
    }
  } catch (error: any) {
    console.error('💥 추천 코드 적용 서버 오류:', error)
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다'
    })
  }
})

// === 대시보드 및 통계 API ===

/**
 * GET /api/referral/dashboard/:userId
 * 추천 대시보드 데이터 조회
 */
router.get('/dashboard/:userId', referralRateLimit, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    
    console.log('📊 추천 대시보드 요청:', userId)
    
    const result = await ReferralService.getUserDashboard(userId)
    
    if (result.success) {
      res.status(200).json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error: any) {
    console.error('💥 대시보드 조회 서버 오류:', error)
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다'
    })
  }
})

// === 보상 시스템 API ===

/**
 * GET /api/referral/rewards/:userId
 * 사용자 보상 목록 조회
 */
router.get('/rewards/:userId', referralRateLimit, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    
    console.log('🎁 사용자 보상 목록 요청:', userId)
    
    const result = await ReferralService.getUserRewards(userId)
    
    if (result.success) {
      res.status(200).json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error: any) {
    console.error('💥 보상 목록 조회 서버 오류:', error)
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다'
    })
  }
})

/**
 * POST /api/referral/rewards/claim
 * 보상 사용
 */
router.post('/rewards/claim', referralRateLimit, validateUserRequest, async (req: Request, res: Response) => {
  try {
    console.log('🎁 보상 사용 요청:', { user_id: req.body.user_id, reward_id: req.body.reward_id })
    
    const request: ClaimRewardRequest = {
      user_id: req.body.user_id,
      reward_id: req.body.reward_id
    }

    if (!request.reward_id) {
      return res.status(400).json({
        success: false,
        error: '보상 ID가 필요합니다'
      })
    }

    const result = await ReferralService.claimReward(request)
    
    if (result.success) {
      console.log('✅ 보상 사용 성공:', result.data?.reward.id)
      res.status(200).json(result)
    } else {
      console.log('❌ 보상 사용 실패:', result.error)
      res.status(400).json(result)
    }
  } catch (error: any) {
    console.error('💥 보상 사용 서버 오류:', error)
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다'
    })
  }
})

// === 유틸리티 API ===

/**
 * GET /api/referral/health
 * 서비스 상태 확인
 */
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    service: 'referral-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

/**
 * GET /api/referral/constants
 * 추천 시스템 상수들 조회 (프론트엔드용)
 */
router.get('/constants', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      MAX_CODES_PER_USER: 5,
      DEFAULT_EXPIRY_DAYS: 30,
      FORTUNE_CATEGORIES: ['총운', '연애운', '재물운', '건강운', '직업운', '학업운'],
      RELATIONSHIP_TYPES: ['family', 'friend', 'couple', 'colleague'],
      MILESTONE_TARGETS: [5, 10, 20, 50, 100],
      REWARD_TYPES: {
        PREMIUM_DAYS: 'premium_days',
        ANALYSIS_CREDITS: 'analysis_credits',
        CASH_DISCOUNT: 'cash_discount'
      }
    }
  })
})

// === 에러 핸들링 미들웨어 ===
router.use((error: any, req: Request, res: Response, next: express.NextFunction) => {
  console.error('💥 라우터 오류:', error)
  
  if (error instanceof ReferralError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      code: error.code
    })
  }
  
  res.status(500).json({
    success: false,
    error: '서버 내부 오류가 발생했습니다'
  })
})

export default router