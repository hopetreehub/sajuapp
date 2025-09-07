import { create } from 'zustand'

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  user: any
  referralStats: any
  isLoadingReferralStats: boolean
  
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  signUp: (data: any) => Promise<void>
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
  
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      // 임시로 성공 처리
      set({ isAuthenticated: true, user: { email }, isLoading: false })
    } catch (error) {
      set({ error: 'Login failed', isLoading: false })
    }
  },
  
  logout: () => {
    set({ isAuthenticated: false, user: null })
  },
  
  signUp: async (data: any) => {
    set({ isLoading: true, error: null })
    try {
      // 임시로 성공 처리
      set({ isAuthenticated: true, user: data, isLoading: false })
    } catch (error) {
      set({ error: 'Signup failed', isLoading: false })
    }
  },
  
  loadReferralStats: async (userId: string) => {
    set({ isLoadingReferralStats: true })
    try {
      // 임시 데이터
      const mockStats = {
        totalReferrals: 0,
        pendingReferrals: 0,
        confirmedReferrals: 0,
        totalCommission: 0
      }
      set({ referralStats: mockStats, isLoadingReferralStats: false })
    } catch (error) {
      set({ error: 'Failed to load referral stats', isLoadingReferralStats: false })
    }
  },
  
  setError: (error: string | null) => {
    set({ error })
  }
}))

export default useAuthStore