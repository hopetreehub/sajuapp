import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

interface ReferralSectionProps {
  className?: string
}

/**
 * 추천인 코드 관리 및 실적 확인 섹션
 * 사용자의 추천 코드 표시, 공유 기능, 실적 대시보드
 */
const ReferralSection: React.FC<ReferralSectionProps> = ({
  className = ''
}) => {
  const {
    user,
    myReferralCode,
    isGeneratingReferralCode,
    referralStats,
    isLoadingReferralStats,
    error,
    generateMyReferralCode,
    loadReferralStats
  } = useAuthStore()

  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const [showStats, setShowStats] = useState(false)

  // 컴포넌트 마운트 시 추천 코드와 통계 로드
  useEffect(() => {
    if (user && !myReferralCode) {
      generateMyReferralCode()
    }
  }, [user, myReferralCode, generateMyReferralCode])

  // 추천 코드 복사 기능
  const handleCopyCode = async () => {
    if (!myReferralCode) return

    try {
      await navigator.clipboard.writeText(myReferralCode)
      setCopyStatus('copied')
      setTimeout(() => setCopyStatus('idle'), 2000)
    } catch (error) {
      console.error('복사 실패:', error)
      setCopyStatus('error')
      setTimeout(() => setCopyStatus('idle'), 2000)
    }
  }

  // 통계 토글 및 로드
  const handleToggleStats = async () => {
    if (!showStats && (!referralStats || Object.keys(referralStats).length === 0)) {
      await loadReferralStats()
    }
    setShowStats(!showStats)
  }

  // 공유 URL 생성
  const getShareUrl = () => {
    if (!myReferralCode) return ''
    const baseUrl = window.location.origin
    return `${baseUrl}/auth?mode=signup&ref=${myReferralCode}`
  }

  // 공유 메시지 생성
  const getShareMessage = () => {
    if (!myReferralCode) return ''
    return `🔮 운명나침반에서 당신의 운명을 확인해보세요!\n\n추천인 코드: ${myReferralCode}\n링크: ${getShareUrl()}\n\n✨ 함께 가입하면 특별 혜택을 받을 수 있어요!`
  }

  // 소셜 공유 기능
  const handleSocialShare = (platform: 'kakao' | 'facebook' | 'twitter' | 'copy') => {
    const message = getShareMessage()
    const url = getShareUrl()

    switch (platform) {
      case 'kakao':
        // KakaoTalk 공유 (실제 구현 시 Kakao SDK 필요)
        if (window.Kakao && window.Kakao.Share) {
          window.Kakao.Share.sendDefault({
            objectType: 'text',
            text: message,
            link: {
              mobileWebUrl: url,
              webUrl: url
            }
          })
        } else {
          handleCopyCode()
        }
        break

      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        break

      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`, '_blank')
        break

      case 'copy':
        navigator.clipboard.writeText(message)
        setCopyStatus('copied')
        setTimeout(() => setCopyStatus('idle'), 2000)
        break

      default:
        break
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 추천 코드 섹션 */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <span className="mr-2">🎁</span>
            내 추천 코드
          </h3>
          <button
            onClick={handleToggleStats}
            className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 flex items-center space-x-1"
          >
            <span>실적 보기</span>
            <svg className={`w-4 h-4 transition-transform ${showStats ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* 추천 코드 표시 */}
        {isGeneratingReferralCode ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mr-3" />
            <span className="text-gray-600 dark:text-gray-400">추천 코드 생성 중...</span>
          </div>
        ) : myReferralCode ? (
          <div className="space-y-4">
            {/* 코드 표시 및 복사 */}
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-700 rounded-lg p-4">
                <div className="text-center">
                  <span className="text-2xl font-mono tracking-widest text-purple-700 dark:text-purple-300">
                    {myReferralCode}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCopyCode}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  copyStatus === 'copied'
                    ? 'bg-green-500 text-white'
                    : copyStatus === 'error'
                    ? 'bg-red-500 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {copyStatus === 'copied' ? '✓ 복사됨' : copyStatus === 'error' ? '❌ 실패' : '📋 복사'}
              </button>
            </div>

            {/* 공유 버튼들 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                onClick={() => handleSocialShare('kakao')}
                className="flex items-center justify-center space-x-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors text-sm"
              >
                <span>💬</span>
                <span>카카오톡</span>
              </button>
              <button
                onClick={() => handleSocialShare('facebook')}
                className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                <span>📘</span>
                <span>페이스북</span>
              </button>
              <button
                onClick={() => handleSocialShare('twitter')}
                className="flex items-center justify-center space-x-2 px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors text-sm"
              >
                <span>🐦</span>
                <span>트위터</span>
              </button>
              <button
                onClick={() => handleSocialShare('copy')}
                className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
              >
                <span>📎</span>
                <span>링크복사</span>
              </button>
            </div>

            {/* 혜택 안내 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                <span className="font-medium">친구 추천 혜택</span>
              </p>
              <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                <li>• 친구가 가입하면 둘 다 프리미엄 기능 1개월 무료</li>
                <li>• 특별 사주 분석 리포트 제공</li>
                <li>• 궁합 분석 서비스 무제한 이용</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600 dark:text-gray-400 mb-3">추천 코드를 생성할 수 없습니다.</p>
            <button
              onClick={generateMyReferralCode}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}
      </div>

      {/* 추천 실적 섹션 */}
      {showStats && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <span className="mr-2">📊</span>
            추천 실적
          </h3>

          {isLoadingReferralStats ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full mr-3" />
              <span className="text-gray-600 dark:text-gray-400">실적 로딩 중...</span>
            </div>
          ) : referralStats ? (
            <div className="space-y-4">
              {/* 실적 요약 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {referralStats.totalReferred}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">총 추천 인원</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {referralStats.pendingRewards}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">대기 중인 혜택</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {referralStats.totalRewards}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">받은 총 혜택</div>
                </div>
              </div>

              {/* 추천한 사용자 목록 */}
              {referralStats.referredUsers.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">추천한 친구들</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {referralStats.referredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-800 dark:text-white">
                              {user.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(user.joinedAt).toLocaleDateString('ko-KR')} 가입
                            </div>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.rewardStatus === 'completed'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {user.rewardStatus === 'completed' ? '혜택 지급 완료' : '혜택 대기 중'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {referralStats.referredUsers.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎯</div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    아직 추천한 친구가 없어요
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    친구들에게 추천 코드를 공유해보세요!
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-3">실적 정보를 불러올 수 없습니다.</p>
              <button
                onClick={loadReferralStats}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                다시 시도
              </button>
            </div>
          )}
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-600">⚠️</span>
            <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// TypeScript 전역 타입 확장 (Kakao SDK용)
declare global {
  interface Window {
    Kakao?: {
      Share?: {
        sendDefault: (options: any) => void
      }
    }
  }
}

export default ReferralSection