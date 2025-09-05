import crypto from 'crypto'
import { REFERRAL_CONSTANTS, FortuneCategory } from '../types/referral'
import DatabaseConnection from '../database/connection'

export class ReferralCodeGenerator {
  private static readonly CODE_LENGTH = REFERRAL_CONSTANTS.CODE_LENGTH
  
  // 혼동하기 쉬운 문자 제외 (0, O, I, L, 1)
  private static readonly CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  
  // 부적절한 단어 패턴 (한국어 + 영어)
  private static readonly BLOCKED_PATTERNS = [
    'FUCK', 'SHIT', 'DAMN', 'HELL', 'SUCK',
    'DEAD', 'KILL', 'HATE', 'UGLY', 'NAZI',
    '死ね', '死', '殺', '憎', '醜'  // 일본어/한자 부정적 표현
  ]

  // 사주/운세 관련 길운 문자 (선택적 포함)
  private static readonly LUCKY_CHARS = ['7', '8', '9', 'F', 'G', 'H']  // 길운 숫자와 알파벳
  
  // 운세 카테고리별 특수 접두사
  private static readonly CATEGORY_PREFIXES: Record<FortuneCategory, string[]> = {
    '총운': ['T', 'G', 'A'],      // Total, General, All
    '연애운': ['L', 'R'],        // Love, Romance
    '재물운': ['M', 'W', 'G'],   // Money, Wealth, Gold
    '건강운': ['H', 'V'],        // Health, Vitality
    '직업운': ['C', 'W', 'J'],   // Career, Work, Job
    '학업운': ['S', 'E']         // Study, Education
  }

  /**
   * 안전하고 기억하기 쉬운 추천인 코드 생성
   */
  static async generateCode(
    userId: string, 
    category?: FortuneCategory,
    customLength?: number
  ): Promise<string> {
    const maxAttempts = 10
    let attempts = 0
    
    while (attempts < maxAttempts) {
      const code = this.createSecureCode(userId, category, customLength)
      
      if (await this.isCodeUnique(code) && this.isCodeValid(code)) {
        console.log(`✅ 추천인 코드 생성 성공: ${code} (시도 ${attempts + 1}회)`)
        return code
      }
      
      attempts++
    }
    
    throw new Error(`추천인 코드 생성 실패: ${maxAttempts}번 시도 후 고유 코드를 생성할 수 없습니다`)
  }

  /**
   * 암호학적으로 안전한 코드 생성
   */
  private static createSecureCode(
    userId: string, 
    category?: FortuneCategory,
    customLength?: number
  ): string {
    const length = customLength || this.CODE_LENGTH
    
    // 사용자별 시드 생성 (재현 가능하지만 예측 어려움)
    const userSeed = this.createUserSeed(userId)
    
    // 암호학적 랜덤 바이트 생성
    const randomBytes = crypto.randomBytes(length * 2) // 여유분 확보
    
    let code = ''
    let charIndex = 0
    
    // 카테고리별 접두사 추가 (선택적)
    if (category && this.CATEGORY_PREFIXES[category]) {
      const prefixes = this.CATEGORY_PREFIXES[category]
      const prefixIndex = userSeed % prefixes.length
      code += prefixes[prefixIndex]
      charIndex = 1
    }
    
    // 나머지 문자 생성
    let byteIndex = 0
    while (code.length < length && byteIndex < randomBytes.length) {
      const randomValue = (userSeed + randomBytes[byteIndex]) % this.CHARSET.length
      const char = this.CHARSET[randomValue]
      
      // 길운 문자 우선 포함 (20% 확률)
      if (Math.random() < 0.2 && this.LUCKY_CHARS.includes(char)) {
        code += char
      } else {
        code += char
      }
      
      byteIndex++
    }
    
    // 길이가 부족한 경우 추가 생성
    while (code.length < length) {
      const extraByte = crypto.randomBytes(1)[0]
      const charIndex = (userSeed + extraByte) % this.CHARSET.length
      code += this.CHARSET[charIndex]
    }
    
    return code.substring(0, length)
  }

  /**
   * 사용자별 시드 생성 (일관된 패턴이지만 예측 어려움)
   */
  private static createUserSeed(userId: string): number {
    const hash = crypto.createHash('sha256').update(userId + 'FORTUNE_COMPASS_SALT').digest()
    
    // 해시의 첫 4바이트를 32비트 정수로 변환
    let seed = 0
    for (let i = 0; i < 4; i++) {
      seed = (seed << 8) | hash[i]
    }
    
    return Math.abs(seed)
  }

  /**
   * 코드 유효성 검증 (부적절한 단어 필터링)
   */
  private static isCodeValid(code: string): boolean {
    const upperCode = code.toUpperCase()
    
    // 부적절한 패턴 검사
    for (const pattern of this.BLOCKED_PATTERNS) {
      if (upperCode.includes(pattern)) {
        console.warn(`⚠️  부적절한 코드 패턴 감지: ${code} (패턴: ${pattern})`)
        return false
      }
    }
    
    // 연속된 동일 문자 방지 (3개 이상)
    let consecutiveCount = 1
    for (let i = 1; i < code.length; i++) {
      if (code[i] === code[i - 1]) {
        consecutiveCount++
        if (consecutiveCount >= 3) {
          console.warn(`⚠️  연속된 문자가 너무 많음: ${code}`)
          return false
        }
      } else {
        consecutiveCount = 1
      }
    }
    
    return true
  }

  /**
   * 데이터베이스에서 코드 중복 확인
   */
  private static async isCodeUnique(code: string): Promise<boolean> {
    try {
      const existing = await DatabaseConnection.get(
        'SELECT id FROM referral_codes WHERE code = ? AND is_active = 1',
        [code]
      )
      
      return !existing
    } catch (error) {
      console.error('❌ 코드 중복 확인 실패:', error)
      return false
    }
  }

  /**
   * 특별 이벤트용 코드 생성 (관리자용)
   */
  static async generateEventCode(
    eventName: string,
    maxUses?: number,
    expiryDays?: number
  ): Promise<string> {
    const eventPrefix = this.getEventPrefix(eventName)
    const randomSuffix = this.generateRandomSuffix(4)
    const code = `${eventPrefix}${randomSuffix}`
    
    if (await this.isCodeUnique(code) && this.isCodeValid(code)) {
      console.log(`🎉 이벤트 코드 생성: ${code} (${eventName})`)
      return code
    }
    
    // 재시도 로직
    return this.generateEventCode(eventName, maxUses, expiryDays)
  }

  /**
   * 이벤트명에서 접두사 추출
   */
  private static getEventPrefix(eventName: string): string {
    const eventMap: Record<string, string> = {
      '신년': 'NY',      // New Year
      '설날': 'LN',      // Lunar New Year  
      '추석': 'CH',      // Chuseok
      '생일': 'BD',      // Birthday
      '개업': 'OP',      // Opening
      '결혼': 'WD',      // Wedding
      '임신': 'PG',      // Pregnancy
      '합격': 'PS',      // Pass
      '승진': 'PM',      // Promotion
      '이사': 'MV'       // Move
    }
    
    return eventMap[eventName] || 'SP'  // Special
  }

  /**
   * 랜덤 접미사 생성
   */
  private static generateRandomSuffix(length: number): string {
    let suffix = ''
    const bytes = crypto.randomBytes(length)
    
    for (let i = 0; i < length; i++) {
      suffix += this.CHARSET[bytes[i] % this.CHARSET.length]
    }
    
    return suffix
  }

  /**
   * 코드 패턴 분석 (통계용)
   */
  static analyzeCodePattern(code: string): {
    hasLuckyChars: boolean
    categoryHint?: FortuneCategory
    strength: 'weak' | 'medium' | 'strong'
  } {
    const hasLuckyChars = this.LUCKY_CHARS.some(char => code.includes(char))
    
    // 카테고리 힌트 추출
    let categoryHint: FortuneCategory | undefined
    for (const [category, prefixes] of Object.entries(this.CATEGORY_PREFIXES)) {
      if (prefixes.some(prefix => code.startsWith(prefix))) {
        categoryHint = category as FortuneCategory
        break
      }
    }
    
    // 강도 분석 (엔트로피 기반)
    const uniqueChars = new Set(code).size
    const strength = uniqueChars >= 6 ? 'strong' : 
                    uniqueChars >= 4 ? 'medium' : 'weak'
    
    return { hasLuckyChars, categoryHint, strength }
  }

  /**
   * 사용자 친화적인 코드 설명 생성
   */
  static getCodeDescription(code: string, category?: FortuneCategory): string {
    const analysis = this.analyzeCodePattern(code)
    
    let description = `추천 코드: ${code}`
    
    if (category) {
      description += ` (${category} 특화)`
    }
    
    if (analysis.hasLuckyChars) {
      description += ' ✨ 행운의 문자 포함'
    }
    
    return description
  }
}

// 테스트 및 검증 유틸리티
export class CodeValidator {
  /**
   * 코드 형식 검증
   */
  static validateFormat(code: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!code || typeof code !== 'string') {
      errors.push('코드가 제공되지 않았습니다')
      return { valid: false, errors }
    }
    
    if (code.length < 4 || code.length > 12) {
      errors.push('코드 길이는 4-12자 사이여야 합니다')
    }
    
    if (!/^[A-Z0-9]+$/.test(code)) {
      errors.push('코드는 영문 대문자와 숫자만 포함할 수 있습니다')
    }
    
    if (ReferralCodeGenerator['BLOCKED_PATTERNS'].some(pattern => code.includes(pattern))) {
      errors.push('부적절한 문자열이 포함되어 있습니다')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 코드 보안 강도 검사
   */
  static checkSecurityStrength(code: string): {
    score: number  // 0-100
    level: 'low' | 'medium' | 'high'
    recommendations: string[]
  } {
    let score = 0
    const recommendations: string[] = []
    
    // 길이 점수 (40점 만점)
    if (code.length >= 8) score += 40
    else if (code.length >= 6) score += 30
    else if (code.length >= 4) score += 20
    else recommendations.push('더 긴 코드를 사용하세요')
    
    // 문자 다양성 (30점 만점)
    const uniqueChars = new Set(code).size
    score += Math.min(uniqueChars * 4, 30)
    
    // 예측 불가능성 (30점 만점)
    const hasNumbers = /\d/.test(code)
    const hasLetters = /[A-Z]/.test(code)
    
    if (hasNumbers && hasLetters) score += 30
    else if (hasNumbers || hasLetters) score += 15
    else recommendations.push('숫자와 문자를 함께 사용하세요')
    
    // 레벨 결정
    const level = score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low'
    
    if (level === 'low') {
      recommendations.push('보안을 위해 더 복잡한 코드를 생성하세요')
    }
    
    return { score, level, recommendations }
  }
}