import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 사용자 타입 정의
export interface User {
  id: number;
  email: string;
  username: string;
  role: 'user' | 'admin' | 'super_admin';
  approval_status: 'pending' | 'approved' | 'rejected' | 'suspended';
  phone?: string | null;
  birth_date?: string | null;
  birth_time?: string | null;
  lunar_solar?: string | null;
  referral_code?: string | null;
  created_at: string;
  last_login_at?: string | null;
}

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  phone?: string;
  birth_date?: string;
  birth_time?: string;
  lunar_solar?: 'solar' | 'lunar';
  referral_code?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: User | null;
  token: string | null;

  login: (credentials: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  getCurrentUser: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      user: null,
      token: null,

      login: async (credentials: LoginData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });

          const data = await response.json();

          if (!response.ok) {
            // 승인 대기/거부/정지 상태 처리
            if (data.approval_status) {
              throw new Error(data.error || '로그인에 실패했습니다.');
            }
            throw new Error(data.error || '로그인에 실패했습니다.');
          }

          // 로그인 성공
          set({
            isAuthenticated: true,
            user: data.user,
            token: data.token,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || '로그인 중 오류가 발생했습니다.',
            isLoading: false
          });
          throw error;
        }
      },

      logout: async () => {
        const token = get().token;

        try {
          if (token) {
            await fetch('/api/auth/logout', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
          }
        } catch (error) {
          console.error('Logout error:', error);
        }

        // 상태 완전 초기화
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          error: null,
          isLoading: false
        });

        // localStorage 강제 초기화 (persist 미들웨어 지연 방지)
        try {
          localStorage.removeItem('auth-storage');
        } catch (error) {
          console.error('Failed to clear auth storage:', error);
        }
      },

      signUp: async (data: SignUpData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || '회원가입에 실패했습니다.');
          }

          // 회원가입 성공 - 승인 대기 메시지 표시
          set({
            isLoading: false,
            error: null,
          });

          // 성공 메시지를 에러 필드에 임시 저장 (UI에서 표시용)
          set({
            error: result.message || '회원가입이 완료되었습니다. 관리자 승인 후 로그인이 가능합니다.'
          });
        } catch (error: any) {
          set({
            error: error.message || '회원가입 중 오류가 발생했습니다.',
            isLoading: false
          });
          throw error;
        }
      },

      getCurrentUser: async () => {
        const token = get().token;

        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || '사용자 정보를 가져올 수 없습니다.');
          }

          set({
            isAuthenticated: true,
            user: data.user,
          });
        } catch (error: any) {
          console.error('Get current user error:', error);
          set({
            isAuthenticated: false,
            user: null,
            token: null
          });
        }
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
