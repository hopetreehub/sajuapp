import { create } from 'zustand';

// 임시 타입 정의 (추후 별도 파일로 분리)
export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  referredBy?: string
}

export interface SignUpData {
  email: string
  password: string
  name: string
  referralCode?: string
  agreedToTerms?: boolean
  agreedToPrivacy?: boolean
  agreedToMarketing?: boolean
}

export interface LoginData {
  email: string
  password: string
}

interface ReferralValidation {
  isValid: boolean
  message: string
  referrerName?: string
}

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  user: User | null
  referralStats: any
  isLoadingReferralStats: boolean

  // 추천 코드 관련 속성들
  referralCode: string
  isValidatingReferral: boolean
  referralValidation: ReferralValidation | null
  myReferralCode: string | null
  isGeneratingReferralCode: boolean

  login: (credentials: { email: string; password: string } | string, password?: string) => Promise<void>
  logout: () => void
  signUp: (data: SignUpData) => Promise<void>
  loadReferralStats: (userId: string) => Promise<void>
  setError: (error: string | null) => void

  // 추천 코드 관련 메소드들
  setReferralCode: (code: string) => void
  validateReferralCode: (code: string) => Promise<boolean>
  clearReferralValidation: () => void
  generateMyReferralCode: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: false,
  error: null,
  user: null,
  referralStats: null,
  isLoadingReferralStats: false,

  // 추천 코드 관련 초기값
  referralCode: '',
  isValidatingReferral: false,
  referralValidation: null,
  myReferralCode: null,
  isGeneratingReferralCode: false,
  
  login: async (credentials: { email: string; password: string } | string, password?: string) => {
    set({ isLoading: true, error: null });
    try {
      // 매개변수 정규화 (이전 버전과 호환성 유지)
      const email = typeof credentials === 'string' ? credentials : credentials.email;
      const _pwd = typeof credentials === 'string' ? password : credentials.password;
      
      // 임시로 성공 처리 - name 필드 추가
      const userName = email?.split('@')[0] || 'User';
      set({
        isAuthenticated: true,
        user: {
          email,
          name: userName,
          id: Date.now().toString(), // 임시 ID
          createdAt: new Date().toISOString(),
        }, 
        isLoading: false, 
      });
    } catch (error) {
      set({ error: 'Login failed', isLoading: false });
    }
  },
  
  logout: () => {
    set({ isAuthenticated: false, user: null });
  },
  
  signUp: async (data: SignUpData) => {
    set({ isLoading: true, error: null });
    try {
      // 임시로 성공 처리 - User 타입에 맞게 생성
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: data.email,
        name: data.name,
        createdAt: new Date().toISOString(),
        referredBy: data.referralCode,
      };
      
      set({ 
        isAuthenticated: true, 
        user: newUser, 
        isLoading: false, 
      });
    } catch (error) {
      set({ error: 'Signup failed', isLoading: false });
    }
  },
  
  loadReferralStats: async (_userId: string) => {
    set({ isLoadingReferralStats: true });
    try {
      // 임시 데이터
      const mockStats = {
        totalReferrals: 0,
        pendingReferrals: 0,
        confirmedReferrals: 0,
        totalCommission: 0,
      };
      set({ referralStats: mockStats, isLoadingReferralStats: false });
    } catch (error) {
      set({ error: 'Failed to load referral stats', isLoadingReferralStats: false });
    }
  },
  
  setError: (error: string | null) => {
    set({ error });
  },

  // 추천 코드 관련 메소드들
  setReferralCode: (code: string) => {
    set({ referralCode: code });
  },

  validateReferralCode: async (code: string) => {
    if (!code || code.length !== 6) {
      set({ referralValidation: null });
      return false;
    }

    set({ isValidatingReferral: true });

    try {
      // 임시 검증 로직 - 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 지연 시뮬레이션

      // 간단한 검증 로직 (실제로는 서버에서 검증)
      const isValid = code.toUpperCase() !== 'INVALID' && code.length === 6;
      const referrerName = isValid ? '친구' : undefined;
      const message = isValid
        ? `유효한 추천 코드입니다! ${referrerName}님의 추천으로 특별 혜택을 받으실 수 있습니다.`
        : '존재하지 않는 추천 코드입니다. 다시 확인해주세요.';

      const validation: ReferralValidation = {
        isValid,
        message,
        referrerName,
      };

      set({
        referralValidation: validation,
        isValidatingReferral: false,
      });

      return isValid;
    } catch (error) {
      set({
        referralValidation: {
          isValid: false,
          message: '추천 코드 확인 중 오류가 발생했습니다.',
        },
        isValidatingReferral: false,
      });
      return false;
    }
  },

  clearReferralValidation: () => {
    set({
      referralValidation: null,
      isValidatingReferral: false,
    });
  },

  generateMyReferralCode: async () => {
    set({ isGeneratingReferralCode: true });

    try {
      // 임시 생성 로직 - 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 500));

      const code = Math.random().toString(36).substr(2, 6).toUpperCase();
      set({
        myReferralCode: code,
        isGeneratingReferralCode: false,
      });
    } catch (error) {
      set({
        error: '추천 코드 생성에 실패했습니다.',
        isGeneratingReferralCode: false,
      });
    }
  },
}));

export default useAuthStore;