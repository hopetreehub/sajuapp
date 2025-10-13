import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { authUtils } from '@/services/authService';

interface LoginFormProps {
  className?: string
  onSuccess?: () => void
  onSignUpClick?: () => void
}

/**
 * 로그인 폼 컴포넌트
 * 한국 사용자 특화 UX/UI 적용
 */
const LoginForm: React.FC<LoginFormProps> = ({
  className = '',
  onSuccess,
  onSignUpClick,
}) => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();

  // 폼 상태
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  // 유효성 검사 상태
  const [validation, setValidation] = useState({
    email: { isValid: false, message: '' },
    password: { isValid: false, message: '' },
  });

  // 폼 제출 가능 여부
  const [canSubmit, setCanSubmit] = useState(false);

  // 실시간 유효성 검사
  useEffect(() => {
    // 이메일 검증
    const emailValid = authUtils.isValidEmail(formData.email);
    const emailMessage = formData.email && !emailValid ? '올바른 이메일 주소를 입력해주세요.' : '';

    // 비밀번호 검증
    const passwordValid = formData.password.length >= 8;
    const passwordMessage = formData.password && !passwordValid ? '비밀번호는 8자리 이상입니다.' : '';

    // 상태 업데이트를 한번에 처리하여 리렌더링 최소화
    setValidation({
      email: { isValid: emailValid, message: emailMessage },
      password: { isValid: passwordValid, message: passwordMessage },
    });

    // 전체 폼 유효성 체크
    setCanSubmit(emailValid && passwordValid);
  }, [formData.email, formData.password]);

  // 입력값 변경 핸들러
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit || isLoading) return;

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });

      // 로그인 성공
      onSuccess?.();
      navigate('/dashboard'); // 대시보드로 이동
      
    } catch (error) {
      console.error('로그인 실패:', error);
      // 에러는 store에서 자동으로 설정됨
    }
  };

  // 입력 필드 스타일
  const getInputStyle = (field: keyof typeof validation) => {
    const base = `
      w-full px-4 py-3 border-2 rounded-lg 
      focus:outline-none focus:ring-0 transition-all duration-200
      bg-white dark:bg-gray-800 
      text-gray-800 dark:text-gray-200
      placeholder-gray-400
    `;
    
    if (!formData[field] || formData[field] === '') {
      return `${base  } border-gray-300 dark:border-gray-600 focus:border-purple-500`;
    }
    
    if (validation[field].isValid) {
      return `${base  } border-green-500 focus:border-green-600`;
    } else {
      return `${base  } border-red-500 focus:border-red-600`;
    }
  };


  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
            <span className="text-white text-2xl">🔮</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            운명나침반 로그인
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            나만의 운세 분석을 계속해보세요
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-red-600">⚠️</span>
              <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 이메일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              이메일 주소
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="example@email.com"
              className={getInputStyle('email')}
              disabled={isLoading}
            />
            {validation.email.message && (
              <p className="mt-1 text-sm text-red-600">{validation.email.message}</p>
            )}
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className={getInputStyle('password')}
              disabled={isLoading}
            />
            {validation.password.message && (
              <p className="mt-1 text-sm text-red-600">{validation.password.message}</p>
            )}
          </div>

          {/* 로그인 유지 및 비밀번호 찾기 */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                disabled={isLoading}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                로그인 상태 유지
              </span>
            </label>
            
            <button
              type="button"
              className="text-sm text-purple-600 hover:text-purple-700 hover:underline"
              disabled={isLoading}
            >
              비밀번호 찾기
            </button>
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={!canSubmit || isLoading}
            className={`
              w-full py-4 px-6 rounded-lg font-medium text-lg transition-all duration-200
              ${canSubmit && !isLoading
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl border-2 border-purple-400 dark:border-purple-300'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed border-2 border-gray-400 dark:border-gray-500'
              }
            `}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                <span>로그인 중...</span>
              </div>
            ) : (
              '로그인'
            )}
          </button>

          {/* 회원가입 링크 */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              아직 계정이 없으신가요?{' '}
              <button
                type="button"
                onClick={onSignUpClick}
                className="text-purple-600 hover:text-purple-700 font-medium hover:underline"
                disabled={isLoading}
              >
                회원가입하기
              </button>
            </p>
          </div>
        </form>
      </div>

      {/* 소셜 로그인 (향후 구현) */}
      <div className="mt-6">
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          소셜 계정으로 간편 로그인
        </div>
        <div className="grid grid-cols-3 gap-3">
          <button 
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            disabled
          >
            <div className="text-center">
              <div className="text-2xl mb-1">🌐</div>
              <div className="text-xs text-gray-500">구글</div>
            </div>
          </button>
          <button 
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            disabled
          >
            <div className="text-center">
              <div className="text-2xl mb-1">💬</div>
              <div className="text-xs text-gray-500">카카오</div>
            </div>
          </button>
          <button 
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            disabled
          >
            <div className="text-center">
              <div className="text-2xl mb-1">📱</div>
              <div className="text-xs text-gray-500">네이버</div>
            </div>
          </button>
        </div>
        <div className="text-center text-xs text-gray-400 mt-2">
          (준비 중)
        </div>
      </div>

      {/* 추가 정보 */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          로그인하시면 개인화된 사주 분석과 캘린더 기능을 이용하실 수 있습니다.
        </p>
      </div>
    </div>
  );
};

export default LoginForm;