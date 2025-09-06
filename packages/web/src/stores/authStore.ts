import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  COMPANY_WELCOME_CODE, 
  REFERRAL_SOURCE_TYPES, 
  type ReferralSourceType 
} from '@/constants/referral'

// 타입 정의
export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  referralCode?: string
  referredBy?: string
  referralSource?: ReferralSourceType
  isWelcomeUser?: boolean
}

export interface SignUpData {
  email: string
  password: string
  name: string
  referralCode?: string
}

export interface LoginData {
  email: string
  password: string
}

interface AuthState {
  // 상태
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // 추천인 관련 상태
  referralCode: string
  isValidatingReferral: boolean
  referralValidation: {
    isValid: boolean
    message: string
    referrerName?: string
  } | null
  
  // 내 추천 관련 상태
  myReferralCode: string | null
  isGeneratingReferralCode: boolean
  referralStats: {
    totalReferred: number
    pendingRewards: number
    totalRewards: number
    referredUsers: Array<{
      id: string
      name: string
      joinedAt: string
      rewardStatus: 'pending' | 'completed'
    }>
  } | null
  isLoadingReferralStats: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // 추천인 관련 액션
  setReferralCode: (code: string) => void
  validateReferralCode: (code: string) => Promise<boolean>
  clearReferralValidation: () => void
  
  // 내 추천 관련 액션
  generateMyReferralCode: () => Promise<string | null>
  loadReferralStats: () => Promise<void>
  
  // 인증 액션
  signUp: (data: SignUpData) => Promise<void>
  login: (data: LoginData) => Promise<void>
  logout: () => void
  
  // 사용자 정보 업데이트
  updateUser: (userData: Partial<User>) => void
}

// Rate limiting을 위한 전역 맵
const rateLimiter = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 5 // 1분에 5회
const RATE_WINDOW = 60000 // 1분

const checkRateLimit = (clientId: string = 'default'): boolean => {
  const now = Date.now()
  const current = rateLimiter.get(clientId)
  
  if (!current || now > current.resetTime) {
    rateLimiter.set(clientId, { count: 1, resetTime: now + RATE_WINDOW })
    return true
  }
  
  if (current.count >= RATE_LIMIT) {
    return false
  }
  
  current.count += 1
  return true
}

// 입력 검증 함수들
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateReferralCodeFormat = (code: string): boolean => {
  const codeRegex = /^[A-Z0-9]{6}$/
  return codeRegex.test(code)
}

const sanitizeInput = (input: string): string => {
  return input.replace(/[<>\"'&]/g, '')
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      referralCode: '',
      isValidatingReferral: false,
      referralValidation: null,
      
      // 내 추천 초기 상태
      myReferralCode: null,
      isGeneratingReferralCode: false,
      referralStats: null,
      isLoadingReferralStats: false,
      
      // 기본 액션들
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      // 추천인 관련 액션
      setReferralCode: (code) => {
        const sanitizedCode = sanitizeInput(code.toUpperCase())
        set({ referralCode: sanitizedCode })
      },
      
      clearReferralValidation: () => set({ referralValidation: null }),
      
      validateReferralCode: async (code) => {
        const sanitizedCode = sanitizeInput(code.toUpperCase().trim())
        
        // 빈 코드는 유효하지 않음
        if (!sanitizedCode) {
          set({
            referralValidation: {
              isValid: false,
              message: '추천인 코드를 입력해주세요.'
            }
          })
          return false
        }
        
        // 형식 검증
        if (!validateReferralCodeFormat(sanitizedCode)) {
          set({
            referralValidation: {
              isValid: false,
              message: '추천인 코드는 영문 대문자와 숫자 6자리여야 합니다.'
            }
          })
          return false
        }
        
        // Rate limiting 체크
        if (!checkRateLimit('referral-validation')) {
          set({
            referralValidation: {
              isValid: false,
              message: '너무 많은 요청을 보냈습니다. 1분 후 다시 시도해주세요.'
            }
          })
          return false
        }
        
        set({ isValidatingReferral: true, error: null })
        
        try {
          // 백엔드 API 호출
          const response = await fetch(`http://localhost:4013/api/referral/codes/validate/${sanitizedCode}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          
          const result = await response.json()
          
          if (result.success && result.data.isValid) {
            set({
              referralValidation: {
                isValid: true,
                message: `${result.data.referrerName || '친구'}님의 추천 코드가 확인되었습니다! 🎉`,
                referrerName: result.data.referrerName
              },
              referralCode: sanitizedCode
            })
            return true
          } else {
            set({
              referralValidation: {
                isValid: false,
                message: '유효하지 않은 추천인 코드입니다. 다시 확인해주세요.'
              }
            })
            return false
          }
          
        } catch (error) {
          console.error('추천인 코드 검증 오류:', error)
          
          let errorMessage = '추천인 코드 확인 중 오류가 발생했습니다.'
          
          if (error instanceof Error) {
            if (error.message.includes('fetch')) {
              errorMessage = '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
            }
          }
          
          set({
            referralValidation: {
              isValid: false,
              message: errorMessage
            },
            error: errorMessage
          })
          return false
          
        } finally {
          set({ isValidatingReferral: false })
        }
      },
      
      // 내 추천 코드 생성/조회
      generateMyReferralCode: async () => {
        const currentUser = get().user
        if (!currentUser) {
          throw new Error('로그인이 필요합니다.')
        }
        
        set({ isGeneratingReferralCode: true, error: null })
        
        try {
          // 기존 코드 조회 먼저 시도
          const response = await fetch(`http://localhost:4013/api/referral/codes/my/${currentUser.id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          if (response.ok) {
            const result = await response.json()
            if (result.success && result.data.code) {
              set({ myReferralCode: result.data.code })
              return result.data.code
            }
          }
          
          // 기존 코드가 없으면 새로 생성
          const generateResponse = await fetch('http://localhost:4013/api/referral/codes/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: currentUser.id,
              userName: currentUser.name
            })
          })
          
          if (!generateResponse.ok) {
            throw new Error(`HTTP error! status: ${generateResponse.status}`)
          }
          
          const generateResult = await generateResponse.json()
          
          if (generateResult.success && generateResult.data.code) {
            set({ myReferralCode: generateResult.data.code })
            return generateResult.data.code
          } else {
            throw new Error('추천 코드 생성에 실패했습니다.')
          }
          
        } catch (error) {
          console.error('추천 코드 생성/조회 오류:', error)
          
          let errorMessage = '추천 코드를 불러오는 중 오류가 발생했습니다.'
          if (error instanceof Error) {
            errorMessage = error.message
          }
          
          set({ error: errorMessage })
          return null
          
        } finally {
          set({ isGeneratingReferralCode: false })
        }
      },
      
      // 추천 통계 조회
      loadReferralStats: async () => {
        const currentUser = get().user
        if (!currentUser) {
          throw new Error('로그인이 필요합니다.')
        }
        
        set({ isLoadingReferralStats: true, error: null })
        
        try {
          const response = await fetch(`http://localhost:4013/api/referral/stats/${currentUser.id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          
          const result = await response.json()
          
          if (result.success && result.data) {
            set({ referralStats: result.data })
          } else {
            // 통계가 없는 경우 초기 상태로 설정
            set({
              referralStats: {
                totalReferred: 0,
                pendingRewards: 0,
                totalRewards: 0,
                referredUsers: []
              }
            })
          }
          
        } catch (error) {
          console.error('추천 통계 조회 오류:', error)
          
          let errorMessage = '추천 통계를 불러오는 중 오류가 발생했습니다.'
          if (error instanceof Error && error.message.includes('fetch')) {
            errorMessage = '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
          }
          
          set({ error: errorMessage })
          
        } finally {
          set({ isLoadingReferralStats: false })
        }
      },
      
      // 회원가입
      signUp: async (data) => {
        set({ isLoading: true, error: null })
        
        try {
          // 입력 데이터 검증
          if (!validateEmail(data.email)) {
            throw new Error('올바른 이메일 주소를 입력해주세요.')
          }
          
          if (data.password.length < 8) {
            throw new Error('비밀번호는 8자리 이상이어야 합니다.')
          }
          
          if (!data.name.trim()) {
            throw new Error('이름을 입력해주세요.')
          }
          
          // 추천인 코드 처리 로직 (전문가 분석 결과 반영)
          let finalReferralCode = data.referralCode
          let referralSource: ReferralSourceType = REFERRAL_SOURCE_TYPES.USER_REFERRAL
          let isWelcomeUser = false

          if (data.referralCode) {
            // 사용자가 입력한 추천인 코드 검증
            const isValid = await get().validateReferralCode(data.referralCode)
            if (!isValid) {
              throw new Error('추천인 코드를 다시 확인해주세요.')
            }
            referralSource = REFERRAL_SOURCE_TYPES.USER_REFERRAL
          } else {
            // 추천인 코드가 없는 경우 웰컴 코드 자동 적용
            finalReferralCode = COMPANY_WELCOME_CODE
            referralSource = REFERRAL_SOURCE_TYPES.COMPANY_WELCOME
            isWelcomeUser = true
            
            // 웰컴 코드 적용 로그
            console.log('🎉 웰컴 코드 자동 적용:', COMPANY_WELCOME_CODE)
          }
          
          // TODO: 실제 회원가입 API 호출
          // 현재는 임시로 로컬 저장만 수행
          const newUser: User = {
            id: `user_${Date.now()}`,
            email: sanitizeInput(data.email),
            name: sanitizeInput(data.name),
            createdAt: new Date().toISOString(),
            referralCode: undefined, // 사용자의 추천 코드는 나중에 생성
            referredBy: finalReferralCode,
            referralSource: referralSource,
            isWelcomeUser: isWelcomeUser
          }
          
          // 추천인 코드 적용 API 호출 (모든 사용자에게 적용)
          try {
            const referralResponse = await fetch(`http://localhost:4013/api/referral/apply`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: newUser.id,
                referralCode: finalReferralCode,
                sourceType: referralSource,
                isWelcomeCode: isWelcomeUser
              })
            })
            
            if (referralResponse.ok) {
              const logMessage = isWelcomeUser 
                ? `🎉 웰컴 혜택 적용 성공: ${COMPANY_WELCOME_CODE}`
                : '👥 추천인 코드 적용 성공'
              console.log(logMessage)
            }
          } catch (error) {
            const errorMessage = isWelcomeUser 
              ? '웰컴 혜택 적용 중 오류 (회원가입은 완료됨):'
              : '추천인 적용 중 오류 (회원가입은 완료됨):'
            console.error(errorMessage, error)
          }
          
          set({ 
            user: newUser, 
            isAuthenticated: true,
            referralCode: '', // 회원가입 후 코드 초기화
            referralValidation: null
          })
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다.'
          set({ error: errorMessage })
          throw error
          
        } finally {
          set({ isLoading: false })
        }
      },
      
      // 로그인
      login: async (data) => {
        set({ isLoading: true, error: null })
        
        try {
          if (!validateEmail(data.email)) {
            throw new Error('올바른 이메일 주소를 입력해주세요.')
          }
          
          // TODO: 실제 로그인 API 호출
          // 현재는 임시 구현
          const mockUser: User = {
            id: 'user_123',
            email: data.email,
            name: '홍길동',
            createdAt: new Date().toISOString()
          }
          
          set({ user: mockUser, isAuthenticated: true })
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.'
          set({ error: errorMessage })
          throw error
          
        } finally {
          set({ isLoading: false })
        }
      },
      
      // 로그아웃
      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          referralCode: '', 
          referralValidation: null,
          myReferralCode: null,
          referralStats: null,
          error: null
        })
      },
      
      // 사용자 정보 업데이트
      updateUser: (userData) => {
        const currentUser = get().user
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData }
          set({ user: updatedUser })
        }
      }
      
    }),
    {
      name: 'auth-storage', // localStorage 키
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        myReferralCode: state.myReferralCode
      }) // 민감하지 않은 정보만 저장 (통계 데이터는 제외)
    }
  )
)

// 인증 상태 확인을 위한 유틸리티 함수
export const getAuthState = () => {
  return useAuthStore.getState()
}

// 타입 정의만 포함, HOC는 별도 파일로 분리