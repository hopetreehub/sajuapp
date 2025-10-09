import React, { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { WELCOME_CODE_MESSAGES, COMPANY_WELCOME_CODE } from '@/constants/referral';

interface ReferralCodeInputProps {
  className?: string
  onValidationChange?: (isValid: boolean, code: string) => void
  disabled?: boolean
}

/**
 * 추천인 코드 입력 컴포넌트
 * 웰컴 코드 자동 적용 + 친구 추천 코드 옵션
 * 한국 사용자 특화 UX/UI 디자인 적용
 */
const ReferralCodeInput: React.FC<ReferralCodeInputProps> = ({
  className = '',
  onValidationChange,
  disabled = false,
}) => {
  const {
    referralCode,
    isValidatingReferral,
    referralValidation,
    setReferralCode,
    validateReferralCode,
    clearReferralValidation,
  } = useAuthStore();

  // 로컬 상태
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [hasUserReferralCode, setHasUserReferralCode] = useState(false);

  // 컴포넌트 마운트 시 웰컴 코드 자동 적용
  useEffect(() => {
    if (referralCode) {
      setInputValue(referralCode);
      setIsExpanded(true);
      setHasUserReferralCode(true);
    } else {
      // 웰컴 코드 자동 적용 알림 (사용자 코드가 없을 때)
      onValidationChange?.(true, COMPANY_WELCOME_CODE);
    }
  }, [referralCode, onValidationChange]);

  // 디바운스된 검증 함수
  const debouncedValidation = useCallback((code: string) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(async () => {
      if (code.length === 6) {
        const isValid = await validateReferralCode(code);
        onValidationChange?.(isValid, isValid ? code : COMPANY_WELCOME_CODE);
        setHasUserReferralCode(isValid);
      } else if (code.length === 0) {
        clearReferralValidation();
        // 친구 코드가 없으면 웰컴 코드로 복귀
        onValidationChange?.(true, COMPANY_WELCOME_CODE);
        setHasUserReferralCode(false);
      }
    }, 500); // 500ms 디바운스

    setDebounceTimer(timer);
  }, [debounceTimer, validateReferralCode, clearReferralValidation, onValidationChange]);

  // 입력값 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); // 영숫자만 허용
    
    if (value.length <= 6) {
      setInputValue(value);
      setReferralCode(value);
      debouncedValidation(value);
    }
  };

  // 섹션 토글
  const toggleExpanded = () => {
    if (disabled) return;
    
    setIsExpanded(!isExpanded);
    if (!isExpanded && inputValue) {
      clearReferralValidation();
    }
  };

  // 클리어 버튼 핸들러
  const handleClear = () => {
    setInputValue('');
    setReferralCode('');
    clearReferralValidation();
    // 웰컴 코드로 복귀
    onValidationChange?.(true, COMPANY_WELCOME_CODE);
    setHasUserReferralCode(false);
  };

  // 검증 상태에 따른 스타일링
  const getValidationStyle = () => {
    if (!inputValue || inputValue.length < 6) return '';
    
    if (isValidatingReferral) {
      return 'border-blue-500 ring-2 ring-blue-200';
    }
    
    if (referralValidation?.isValid) {
      return 'border-green-500 ring-2 ring-green-200';
    }
    
    if (referralValidation && !referralValidation.isValid) {
      return 'border-red-500 ring-2 ring-red-200';
    }
    
    return '';
  };

  // 아이콘 렌더링
  const renderIcon = () => {
    if (isValidatingReferral) {
      return (
        <div className="animate-spin text-blue-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      );
    }
    
    if (referralValidation?.isValid) {
      return (
        <div className="text-green-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    
    if (referralValidation && !referralValidation.isValid && inputValue.length === 6) {
      return (
        <div className="text-red-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className={`space-y-4 ${className}`}>

      {/* 사용자 추천 코드 확인 결과 */}
      {hasUserReferralCode && referralValidation?.isValid && (
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-6 rounded-xl border border-green-200 dark:border-green-700">
          <div className="text-center">
            <span className="text-3xl mb-3 block">🎊</span>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
              친구 추천 혜택 적용 완료!
            </h3>
            <div className="inline-flex items-center space-x-2 bg-green-200 dark:bg-green-800/30 px-4 py-2 rounded-lg border border-green-300 dark:border-green-600 mb-3">
              <span className="text-green-600">✅</span>
              <span className="text-green-800 dark:text-green-300 text-sm font-medium">
                추천인 코드: {inputValue}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {referralValidation?.referrerName}님의 추천으로 특별 혜택을 받으실 수 있습니다!
            </p>
          </div>
        </div>
      )}
      
      {/* 친구 추천 코드 입력 토글 버튼 */}
      <button
        type="button"
        onClick={toggleExpanded}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-4 py-3 
          bg-gradient-to-r from-purple-50 to-pink-50 
          dark:from-purple-900/20 dark:to-pink-900/20 
          border border-purple-200 dark:border-purple-700 
          rounded-lg text-left transition-all duration-200
          ${disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30 cursor-pointer'
          }
          ${isExpanded ? 'rounded-b-none border-b-0' : ''}
        `}
      >
        <div className="flex items-center space-x-3">
          <span className="text-2xl">👫</span>
          <div>
            <h3 className="font-medium text-gray-800 dark:text-white">
              친구 추천 코드가 있으신가요?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {hasUserReferralCode 
                ? '친구 추천으로 더 많은 혜택을 받고 계시네요!' 
                : isExpanded 
                  ? '친구가 알려준 6자리 코드를 입력하고 추가 혜택을 받아보세요' 
                  : '클릭하여 친구 코드를 입력하고 추가 혜택을 받아보세요'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasUserReferralCode && referralValidation?.isValid && (
            <span className="text-green-600 text-sm font-medium">적용됨</span>
          )}
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* 확장된 친구 코드 입력 영역 */}
      {isExpanded && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-l border-r border-b border-purple-200 dark:border-purple-700 rounded-b-lg px-4 py-4 space-y-4">
          
          {/* 입력 필드 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              친구 추천 코드 <span className="text-gray-400">(6자리 영문/숫자)</span>
            </label>
            
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                disabled={disabled || isValidatingReferral}
                placeholder="예: AB12CD"
                className={`
                  w-full px-4 py-3 pr-12 
                  border-2 rounded-lg text-lg font-mono tracking-widest text-center
                  placeholder-gray-400 
                  focus:outline-none focus:ring-0
                  disabled:opacity-50 disabled:cursor-not-allowed
                  bg-white dark:bg-gray-800 
                  text-gray-800 dark:text-gray-200
                  ${getValidationStyle() || 'border-gray-300 dark:border-gray-600 focus:border-purple-500'}
                  transition-all duration-200
                `}
                maxLength={6}
              />
              
              {/* 아이콘 영역 */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                {renderIcon()}
                {inputValue && !isValidatingReferral && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                    disabled={disabled}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* 입력 진행 표시 */}
            <div className="flex justify-center space-x-1">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index < inputValue.length
                      ? 'bg-purple-500'
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 검증 메시지 */}
          {referralValidation && inputValue.length > 0 && (
            <div className={`p-3 rounded-lg border ${
              referralValidation.isValid
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
            }`}>
              <div className="flex items-start space-x-2">
                <div className={`mt-0.5 ${
                  referralValidation.isValid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {referralValidation.isValid ? '✅' : '❌'}
                </div>
                <div className={`text-sm ${
                  referralValidation.isValid 
                    ? 'text-green-700 dark:text-green-400' 
                    : 'text-red-700 dark:text-red-400'
                }`}>
                  {referralValidation.message}
                </div>
              </div>
            </div>
          )}

          {/* 로딩 상태 */}
          {isValidatingReferral && (
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <div className="animate-spin">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <span className="text-sm">친구 추천 코드 확인 중...</span>
            </div>
          )}

          {/* 친구 추천 혜택 안내 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-start space-x-2">
              <span className="text-blue-600 mt-0.5">💝</span>
              <div className="text-sm text-blue-700 dark:text-blue-400">
                <p className="font-medium mb-1">친구 추천 추가 혜택</p>
                <ul className="space-y-1 text-xs">
                  <li>• 웰컴 혜택 + 친구 추천 혜택 모두 적용</li>
                  <li>• 프리미엄 기능 추가 1개월 연장</li>
                  <li>• 특별 사주 분석 리포트 제공</li>
                  <li>• 친구와 함께 쓰는 궁합 다이어리</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 주의사항 */}
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p>• 친구 추천 코드는 회원가입 시에만 입력할 수 있습니다</p>
            <p>• 친구 코드가 없어도 웰컴 혜택은 자동으로 적용됩니다</p>
            <p>• 잘못된 코드를 여러 번 입력하면 일시적으로 제한될 수 있습니다</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralCodeInput;