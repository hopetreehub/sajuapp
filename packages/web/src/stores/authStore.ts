import { create } from 'zustand';

// 임시 타입 정의 (추후 별도 파일로 분리)
interface User {
  id: string
  email: string
  name: string
  createdAt: string
  referredBy?: string
}

interface SignUpData {
  email: string
  password: string
  name: string
  referralCode?: string
  agreedToTerms?: boolean
  agreedToPrivacy?: boolean
  agreedToMarketing?: boolean
}

interface LoginData {
  email: string
  password: string
}

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  user: User | null
  referralStats: any
  isLoadingReferralStats: boolean
  
  login: (credentials: { email: string; password: string } | string, password?: string) => Promise<void>
  logout: () => void
  signUp: (data: SignUpData) => Promise<void>
  loadReferralStats: (userId: string) => Promise<void>
  setError: (error: string | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: false,
  error: null,
  user: null,
  referralStats: null,
  isLoadingReferralStats: false,
  
  login: async (credentials: { email: string; password: string } | string, password?: string) => {
    set({ isLoading: true, error: null });
    try {
      // 매개변수 정규화 (이전 버전과 호환성 유지)
      const email = typeof credentials === 'string' ? credentials : credentials.email;
      const pwd = typeof credentials === 'string' ? password : credentials.password;
      
      // 임시로 성공 처리 - name 필드 추가
      const userName = email?.split('@')[0] || 'User';
      set({ 
        isAuthenticated: true, 
        user: { 
          email, 
          name: userName,
          id: Date.now().toString(), // 임시 ID
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
  
  loadReferralStats: async (userId: string) => {
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
}));

export default useAuthStore;