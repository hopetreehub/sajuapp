/**
 * 추천인 시스템 상수 정의
 * 전문가 페르소나 분석 결과를 반영한 웰컴 코드 시스템
 */

// 기본 본사 웰컴 코드
export const COMPANY_WELCOME_CODE = 'WELCOME1';

// 웰컴 코드 관련 브랜딩 메시지
export const WELCOME_CODE_MESSAGES = {
  TITLE: '🎉 운명나침반 공식 웰컴 혜택',
  SUBTITLE: '추천인 코드가 없어도 특별한 혜택을 드려요!',
  DESCRIPTION: '신규 가입자 전용 웰컴 패키지가 자동으로 적용됩니다',
  BENEFITS: [
    '프리미엄 사주 분석 1회 무료',
    '궁합 분석 서비스 무제한 (7일)',
    '특별 운세 리포트 제공',
    'VIP 고객 지원 서비스',
  ],
  CTA_MESSAGE: '더 많은 혜택을 받고 싶다면 친구 추천 코드를 입력해보세요!',
  AUTO_APPLIED: '✅ 웰컴 혜택이 자동으로 적용되었습니다',
} as const;

// 추천 소스 타입
export const REFERRAL_SOURCE_TYPES = {
  USER_REFERRAL: 'user_referral',
  COMPANY_WELCOME: 'company_welcome', 
  SPECIAL_CAMPAIGN: 'special_campaign',
} as const;

export type ReferralSourceType = typeof REFERRAL_SOURCE_TYPES[keyof typeof REFERRAL_SOURCE_TYPES]

// 추천 코드 검증 설정
export const REFERRAL_CONFIG = {
  CODE_LENGTH: 6,
  VALIDATION_TIMEOUT: 500, // ms
  RATE_LIMIT_PER_MINUTE: 5,
  COMPANY_CODE_PREFIX: 'WELCOME',
} as const;

// 웰컴 코드 특별 혜택 정의
export const WELCOME_CODE_BENEFITS = {
  PREMIUM_ANALYSIS_COUNT: 1,
  COMPATIBILITY_UNLIMITED_DAYS: 7,
  SPECIAL_REPORT_ENABLED: true,
  VIP_SUPPORT_ENABLED: true,
  PRIORITY_CUSTOMER_SERVICE: true,
} as const;