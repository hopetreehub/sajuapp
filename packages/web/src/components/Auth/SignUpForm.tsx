import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { authUtils } from '@/services/authService'
import ReferralCodeInput from './ReferralCodeInput'

interface SignUpFormProps {
  className?: string
  onSuccess?: () => void
  onLoginClick?: () => void
}

/**
 * 회원가입 폼 컴포넌트
 * 추천인 코드 통합 및 한국 사용자 특화 UX/UI 적용
 */
const SignUpForm: React.FC<SignUpFormProps> = ({
  className = '',
  onSuccess,
  onLoginClick
}) => {
  const navigate = useNavigate()
  const { signUp, isLoading, error } = useAuthStore()

  // 폼 상태
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    agreedToTerms: false,
    agreedToPrivacy: false,
    agreedToMarketing: false
  })

  // 유효성 검사 상태
  const [validation, setValidation] = useState({
    email: { isValid: false, message: '' },
    password: { isValid: false, message: '' },
    confirmPassword: { isValid: false, message: '' },
    name: { isValid: false, message: '' }
  })

  // 추천인 코드 상태
  const [isReferralValid, setIsReferralValid] = useState(false)
  const [referralCodeValue, setReferralCodeValue] = useState('')

  // 폼 제출 가능 여부
  const [canSubmit, setCanSubmit] = useState(false)

  // 비밀번호 강도
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' })

  // 실시간 유효성 검사
  useEffect(() => {
    // 이메일 검증
    const emailValid = authUtils.isValidEmail(formData.email)
    setValidation(prev => ({
      ...prev,
      email: {
        isValid: emailValid,
        message: formData.email && !emailValid ? '올바른 이메일 주소를 입력해주세요.' : ''
      }
    }))

    // 이름 검증
    const nameValid = formData.name.trim().length >= 2
    setValidation(prev => ({
      ...prev,
      name: {
        isValid: nameValid,
        message: formData.name && !nameValid ? '이름은 2자 이상 입력해주세요.' : ''
      }
    }))

    // 비밀번호 검증 및 강도 체크
    const passwordValid = formData.password.length >= 8
    const strength = authUtils.getPasswordStrength(formData.password)
    setPasswordStrength(strength)
    
    setValidation(prev => ({
      ...prev,
      password: {
        isValid: passwordValid,
        message: formData.password && !passwordValid ? '비밀번호는 8자리 이상 입력해주세요.' : ''
      }
    }))

    // 비밀번호 확인 검증
    const confirmPasswordValid = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0
    setValidation(prev => ({
      ...prev,
      confirmPassword: {
        isValid: confirmPasswordValid,
        message: formData.confirmPassword && !confirmPasswordValid ? '비밀번호가 일치하지 않습니다.' : ''
      }
    }))

    // 전체 폼 유효성 체크
    const allFieldsValid = emailValid && passwordValid && confirmPasswordValid && nameValid
    const termsAgreed = formData.agreedToTerms && formData.agreedToPrivacy
    
    setCanSubmit(allFieldsValid && termsAgreed)
  }, [formData])

  // 입력값 변경 핸들러
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 추천인 코드 검증 결과 핸들러
  const handleReferralValidation = (isValid: boolean, code: string) => {
    setIsReferralValid(isValid)
    setReferralCodeValue(code)
  }

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!canSubmit || isLoading) return

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        referralCode: isReferralValid ? referralCodeValue : undefined
      })

      // 회원가입 성공
      onSuccess?.()
      navigate('/settings') // 사주 정보 입력 페이지로 이동
      
    } catch (error) {
      console.error('회원가입 실패:', error)
      // 에러는 store에서 자동으로 설정됨
    }
  }

  // 비밀번호 강도 색상 클래스
  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 1) return 'text-red-500'
    if (passwordStrength.score <= 2) return 'text-yellow-500'
    if (passwordStrength.score <= 3) return 'text-blue-500'
    return 'text-green-500'
  }

  // 입력 필드 스타일
  const getInputStyle = (field: keyof typeof validation) => {
    const base = `
      w-full px-4 py-3 border-2 rounded-lg 
      focus:outline-none focus:ring-0 transition-all duration-200
      bg-white dark:bg-gray-800 
      text-gray-800 dark:text-gray-200
    `
    
    if (!formData[field] || formData[field] === '') {
      return base + ' border-gray-300 dark:border-gray-600 focus:border-purple-500'
    }
    
    if (validation[field].isValid) {
      return base + ' border-green-500 focus:border-green-600'
    } else {
      return base + ' border-red-500 focus:border-red-600'
    }
  }

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
            <span className="text-white text-2xl">🔮</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            운명나침반 가입하기
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            개인화된 사주 분석으로 운명을 확인해보세요
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

        {/* 회원가입 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 이메일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              이메일 주소 *
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

          {/* 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              이름 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="홍길동"
              className={getInputStyle('name')}
              disabled={isLoading}
            />
            {validation.name.message && (
              <p className="mt-1 text-sm text-red-600">{validation.name.message}</p>
            )}
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              비밀번호 *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="8자 이상 입력"
              className={getInputStyle('password')}
              disabled={isLoading}
            />
            {formData.password && (
              <div className="mt-2">
                <div className={`text-sm ${getPasswordStrengthColor()}`}>
                  {passwordStrength.feedback}
                </div>
                <div className="mt-1 h-2 bg-gray-200 rounded-full">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      passwordStrength.score <= 1 ? 'bg-red-500' :
                      passwordStrength.score <= 2 ? 'bg-yellow-500' :
                      passwordStrength.score <= 3 ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}
            {validation.password.message && (
              <p className="mt-1 text-sm text-red-600">{validation.password.message}</p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              비밀번호 확인 *
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="비밀번호를 다시 입력"
              className={getInputStyle('confirmPassword')}
              disabled={isLoading}
            />
            {validation.confirmPassword.message && (
              <p className="mt-1 text-sm text-red-600">{validation.confirmPassword.message}</p>
            )}
          </div>

          {/* 추천인 코드 섹션 */}
          <ReferralCodeInput 
            onValidationChange={handleReferralValidation}
            disabled={isLoading}
          />

          {/* 약관 동의 */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="terms"
                checked={formData.agreedToTerms}
                onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-0.5"
                disabled={isLoading}
              />
              <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">서비스 이용약관</span>에 동의합니다 <span className="text-red-500">*</span>
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="privacy"
                checked={formData.agreedToPrivacy}
                onChange={(e) => handleInputChange('agreedToPrivacy', e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-0.5"
                disabled={isLoading}
              />
              <label htmlFor="privacy" className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">개인정보 처리방침</span>에 동의합니다 <span className="text-red-500">*</span>
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="marketing"
                checked={formData.agreedToMarketing}
                onChange={(e) => handleInputChange('agreedToMarketing', e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-0.5"
                disabled={isLoading}
              />
              <label htmlFor="marketing" className="text-sm text-gray-700 dark:text-gray-300">
                마케팅 정보 수신에 동의합니다 (선택)
              </label>
            </div>
          </div>

          {/* 가입 버튼 */}
          <button
            type="submit"
            disabled={!canSubmit || isLoading}
            className={`
              w-full py-4 px-6 rounded-lg font-medium text-lg transition-all duration-200
              ${canSubmit && !isLoading
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                <span>가입 처리 중...</span>
              </div>
            ) : (
              '회원가입 완료'
            )}
          </button>

          {/* 로그인 링크 */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              이미 계정이 있으신가요?{' '}
              <button
                type="button"
                onClick={onLoginClick}
                className="text-purple-600 hover:text-purple-700 font-medium hover:underline"
                disabled={isLoading}
              >
                로그인하기
              </button>
            </p>
          </div>
        </form>
      </div>

      {/* 추가 정보 */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          가입하시면 개인화된 사주 분석과 운세 정보를 받아보실 수 있습니다.
        </p>
      </div>
    </div>
  )
}

export default SignUpForm