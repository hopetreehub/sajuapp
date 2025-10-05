/**
 * 인증 및 추천인 시스템 API 서비스
 * 운명나침반(Fortune Compass) 사주 캘린더 앱
 */

import { SignUpData, LoginData, User } from '@/stores/authStore';

// API 기본 설정
const API_BASE_URL = 'http://localhost:4013'; // 추천인 서비스 포트
const REFERRAL_API_BASE = `${API_BASE_URL}/api/referral`;

// HTTP 요청을 위한 공통 설정
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// 네트워크 에러 처리
class NetworkError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}

// API 응답 타입 정의
interface APIResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

// 추천인 검증 응답 타입
interface ReferralValidationResponse {
  isValid: boolean
  referrerName?: string
  referralCode?: string
}

// 추천인 적용 요청 타입
interface ApplyReferralRequest {
  userId: string
  referralCode: string
}

/**
 * 추천인 코드 관련 API
 */
export const referralAPI = {
  /**
   * 추천인 코드 유효성 검증
   * @param code 추천인 코드 (6자리 영숫자)
   * @returns 검증 결과
   */
  validateCode: async (code: string): Promise<APIResponse<ReferralValidationResponse>> => {
    if (!code || code.trim().length === 0) {
      return {
        success: false,
        data: { isValid: false },
        message: '추천인 코드를 입력해주세요.',
      };
    }

    // 코드 형식 검증
    const cleanCode = code.trim().toUpperCase();
    const codePattern = /^[A-Z0-9]{6}$/;
    
    if (!codePattern.test(cleanCode)) {
      return {
        success: false,
        data: { isValid: false },
        message: '추천인 코드는 영문 대문자와 숫자 6자리여야 합니다.',
      };
    }

    try {
      const response = await fetch(`${REFERRAL_API_BASE}/codes/validate/${cleanCode}`, {
        method: 'GET',
        headers: defaultHeaders,
        signal: AbortSignal.timeout(10000), // 10초 타임아웃
      });

      if (!response.ok) {
        throw new NetworkError(
          `서버 응답 오류: ${response.status}`,
          response.status,
        );
      }

      const result: APIResponse<ReferralValidationResponse> = await response.json();
      
      return {
        success: result.success,
        data: result.data,
        message: result.success 
          ? `${result.data.referrerName || '친구'}님의 추천 코드가 확인되었습니다! 🎉`
          : '유효하지 않은 추천인 코드입니다.',
      };

    } catch (error) {
      console.error('추천인 코드 검증 API 오류:', error);
      
      let errorMessage = '추천인 코드 확인 중 오류가 발생했습니다.';
      
      if (error instanceof NetworkError) {
        if (error.status === 404) {
          errorMessage = '유효하지 않은 추천인 코드입니다.';
        } else if (error.status === 429) {
          errorMessage = '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.';
        } else if (error.status && error.status >= 500) {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        }
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
      }

      return {
        success: false,
        data: { isValid: false },
        error: errorMessage,
      };
    }
  },

  /**
   * 추천인 코드 적용 (회원가입 시)
   * @param request 사용자 ID와 추천인 코드
   */
  applyReferral: async (request: ApplyReferralRequest): Promise<APIResponse<any>> => {
    try {
      const response = await fetch(`${REFERRAL_API_BASE}/apply`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new NetworkError(
          `추천인 적용 실패: ${response.status}`,
          response.status,
        );
      }

      const result = await response.json();
      
      return {
        success: true,
        data: result.data,
        message: '추천인이 성공적으로 적용되었습니다!',
      };

    } catch (error) {
      console.error('추천인 적용 API 오류:', error);
      
      let errorMessage = '추천인 적용 중 오류가 발생했습니다.';
      
      if (error instanceof NetworkError) {
        if (error.status === 400) {
          errorMessage = '잘못된 추천인 정보입니다.';
        } else if (error.status === 409) {
          errorMessage = '이미 추천인이 적용된 계정입니다.';
        }
      }

      return {
        success: false,
        data: null,
        error: errorMessage,
      };
    }
  },

  /**
   * 사용자의 추천 통계 조회
   * @param userId 사용자 ID
   */
  getUserReferralStats: async (userId: string): Promise<APIResponse<any>> => {
    try {
      const response = await fetch(`${REFERRAL_API_BASE}/stats/${userId}`, {
        method: 'GET',
        headers: defaultHeaders,
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new NetworkError(
          `통계 조회 실패: ${response.status}`,
          response.status,
        );
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('추천 통계 조회 API 오류:', error);
      
      return {
        success: false,
        data: null,
        error: '추천 통계를 불러올 수 없습니다.',
      };
    }
  },
};

/**
 * 인증 관련 API (향후 확장)
 */
export const authAPI = {
  /**
   * 회원가입
   * @param data 회원가입 데이터
   */
  signUp: async (data: SignUpData): Promise<APIResponse<User>> => {
    try {
      // 입력 데이터 검증
      if (!data.email || !data.password || !data.name) {
        return {
          success: false,
          data: {} as User,
          error: '필수 정보를 모두 입력해주세요.',
        };
      }

      // 이메일 형식 검증
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(data.email)) {
        return {
          success: false,
          data: {} as User,
          error: '올바른 이메일 주소를 입력해주세요.',
        };
      }

      // 비밀번호 검증
      if (data.password.length < 8) {
        return {
          success: false,
          data: {} as User,
          error: '비밀번호는 8자리 이상이어야 합니다.',
        };
      }

      // TODO: 실제 회원가입 API 구현
      // 현재는 임시 구현으로 로컬 데이터 생성
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: data.email.toLowerCase().trim(),
        name: data.name.trim(),
        createdAt: new Date().toISOString(),
        referredBy: data.referralCode || undefined,
      };

      // 추천인 코드가 있는 경우 적용
      if (data.referralCode) {
        const referralResult = await referralAPI.applyReferral({
          userId: newUser.id,
          referralCode: data.referralCode,
        });
        
        if (!referralResult.success) {

        }
      }

      return {
        success: true,
        data: newUser,
        message: '회원가입이 완료되었습니다!',
      };

    } catch (error) {
      console.error('회원가입 API 오류:', error);
      
      return {
        success: false,
        data: {} as User,
        error: '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.',
      };
    }
  },

  /**
   * 로그인
   * @param data 로그인 데이터
   */
  login: async (data: LoginData): Promise<APIResponse<User>> => {
    try {
      // TODO: 실제 로그인 API 구현
      // 현재는 임시 구현
      
      if (!data.email || !data.password) {
        return {
          success: false,
          data: {} as User,
          error: '이메일과 비밀번호를 입력해주세요.',
        };
      }

      // 임시 사용자 데이터
      const mockUser: User = {
        id: 'user_mock_123',
        email: data.email,
        name: '홍길동',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      return {
        success: true,
        data: mockUser,
        message: '로그인되었습니다!',
      };

    } catch (error) {
      console.error('로그인 API 오류:', error);
      
      return {
        success: false,
        data: {} as User,
        error: '로그인 중 오류가 발생했습니다.',
      };
    }
  },

  /**
   * 로그아웃
   */
  logout: async (): Promise<APIResponse<null>> => {
    try {
      // TODO: 실제 로그아웃 API 구현
      // 현재는 클라이언트 사이드에서만 처리
      
      return {
        success: true,
        data: null,
        message: '로그아웃되었습니다.',
      };

    } catch (error) {
      console.error('로그아웃 API 오류:', error);
      
      return {
        success: false,
        data: null,
        error: '로그아웃 중 오류가 발생했습니다.',
      };
    }
  },

  /**
   * 사용자 정보 업데이트
   * @param userId 사용자 ID
   * @param userData 업데이트할 사용자 데이터
   */
  updateUser: async (userId: string, userData: Partial<User>): Promise<APIResponse<User>> => {
    try {
      // TODO: 실제 사용자 업데이트 API 구현
      
      return {
        success: true,
        data: userData as User,
        message: '사용자 정보가 업데이트되었습니다.',
      };

    } catch (error) {
      console.error('사용자 정보 업데이트 API 오류:', error);
      
      return {
        success: false,
        data: {} as User,
        error: '사용자 정보 업데이트 중 오류가 발생했습니다.',
      };
    }
  },
};

/**
 * 유틸리티 함수들
 */
export const authUtils = {
  /**
   * 추천인 코드 형식 검증
   */
  isValidReferralCode: (code: string): boolean => {
    if (!code) return false;
    const cleanCode = code.trim().toUpperCase();
    return /^[A-Z0-9]{6}$/.test(cleanCode);
  },

  /**
   * 이메일 형식 검증
   */
  isValidEmail: (email: string): boolean => {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  },

  /**
   * 비밀번호 강도 검사
   */
  getPasswordStrength: (password: string): {
    score: number // 0-4
    feedback: string
  } => {
    if (!password) return { score: 0, feedback: '비밀번호를 입력해주세요.' };
    
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score++;
    else feedback.push('8자 이상');

    if (/[a-z]/.test(password)) score++;
    else feedback.push('소문자 포함');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('대문자 포함');

    if (/[0-9]/.test(password)) score++;
    else feedback.push('숫자 포함');

    if (/[^A-Za-z0-9]/.test(password)) score++;
    else feedback.push('특수문자 포함');

    const strengthLabels = ['매우 약함', '약함', '보통', '강함', '매우 강함'];
    const strengthLabel = strengthLabels[Math.min(score, 4)];

    return {
      score: Math.min(score, 4),
      feedback: feedback.length > 0 
        ? `${strengthLabel} (추가 권장: ${feedback.join(', ')})`
        : `${strengthLabel}`,
    };
  },

  /**
   * 입력값 sanitization
   */
  sanitizeInput: (input: string): string => {
    if (!input) return '';
    return input.replace(/[<>'&]/g, '').trim();
  },
};

// 기본 내보내기
export default {
  referral: referralAPI,
  auth: authAPI,
  utils: authUtils,
};