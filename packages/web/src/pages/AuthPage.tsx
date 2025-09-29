import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import SignUpForm from '@/components/Auth/SignUpForm';
import LoginForm from '@/components/Auth/LoginForm';

/**
 * 통합 인증 페이지 (로그인/회원가입)
 * URL 파라미터로 모드 전환: /auth?mode=signup or /auth?mode=login
 */
const AuthPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  // URL 파라미터에서 모드 읽기 (기본값: login)
  const mode = searchParams.get('mode') || 'login';
  const validMode = mode === 'signup' || mode === 'login' ? mode : 'login';
  const [currentMode, setCurrentMode] = useState<'login' | 'signup'>(validMode);

  // 이미 로그인된 사용자 처리
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  // 모드 전환 핸들러 - URL도 함께 업데이트
  const switchToSignUp = () => {
    setCurrentMode('signup');
    setSearchParams({ mode: 'signup' }, { replace: true });
  };

  const switchToLogin = () => {
    setCurrentMode('login');
    setSearchParams({ mode: 'login' }, { replace: true });
  };

  // 인증 성공 핸들러
  const handleAuthSuccess = () => {
    console.log('인증 성공!');
    // 페이지 이동은 각 컴포넌트에서 처리
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-purple-900 dark:via-gray-900 dark:to-blue-900 flex flex-col justify-center py-12 px-4">
      
      {/* 배경 패턴 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl"></div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative z-10">
        
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-6">
            <span className="text-4xl">🔮</span>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              운명나침반
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-md mx-auto">
            AI와 전통 사주학이 만나 당신의 운명을 안내합니다
          </p>
        </div>

        {/* 모드 전환 탭 */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1 rounded-xl shadow-lg">
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={switchToLogin}
                className={`
                  py-3 px-6 text-sm font-medium rounded-lg transition-all duration-200
                  ${currentMode === 'login'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                  }
                `}
              >
                로그인
              </button>
              <button
                onClick={switchToSignUp}
                className={`
                  py-3 px-6 text-sm font-medium rounded-lg transition-all duration-200
                  ${currentMode === 'signup'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                  }
                `}
              >
                회원가입
              </button>
            </div>
          </div>
        </div>

        {/* 폼 렌더링 */}
        <div className="transition-all duration-300">
          {currentMode === 'signup' ? (
            <SignUpForm
              onSuccess={handleAuthSuccess}
              onLoginClick={switchToLogin}
            />
          ) : (
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSignUpClick={switchToSignUp}
            />
          )}
        </div>

        {/* 기능 소개 */}
        <div className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-8">
            운명나침반과 함께 하는 특별한 경험
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 개인화 사주 분석 */}
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-white text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                개인화 사주 분석
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                생년월일시를 바탕으로 한 정확한 사주 해석과 운세 분석을 제공합니다.
              </p>
            </div>

            {/* 스마트 캘린더 */}
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-white text-2xl">📅</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                스마트 캘린더
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                일정 관리와 운세 정보가 통합된 지능형 캘린더로 하루를 계획하세요.
              </p>
            </div>

            {/* 다이어리 & 운세 */}
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-white text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                다이어리 & 운세
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                매일의 기록과 함께 개인 맞춤 운세와 조언을 받아보세요.
              </p>
            </div>
          </div>
        </div>

        {/* 추천인 혜택 안내 */}
        {currentMode === 'signup' && (
          <div className="mt-12 max-w-md mx-auto">
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 p-6 rounded-xl border border-yellow-200 dark:border-yellow-700">
              <div className="text-center">
                <span className="text-3xl mb-2 block">🎁</span>
                <h3 className="font-bold text-gray-800 dark:text-white mb-2">
                  친구 추천 혜택
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  추천인 코드로 가입하시면 특별한 혜택을 드려요!
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div>✨ 프리미엄 기능 1개월 무료</div>
                  <div>🔍 특별 사주 분석 무료 제공</div>
                  <div>💕 궁합 분석 서비스 무료</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 푸터 */}
      <footer className="relative z-10 mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>&copy; 2024 운명나침반. 모든 권리 보유.</p>
        <div className="mt-2 space-x-4">
          <a href="#" className="hover:text-purple-600 transition-colors">이용약관</a>
          <a href="#" className="hover:text-purple-600 transition-colors">개인정보처리방침</a>
          <a href="#" className="hover:text-purple-600 transition-colors">고객지원</a>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;