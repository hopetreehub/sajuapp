/**
 * 자미두수 궁위 상세 정보 모달
 *
 * 선택한 궁위의 주성, 보조성, 길흉 해석, 키워드 등을
 * 상세하게 표시하는 모달 컴포넌트
 */

import React from 'react';
import type { PalaceInfo } from '@/types/ziwei';

interface ZiweiPalaceDetailProps {
  palace: PalaceInfo;
  onClose: () => void;
}

export default function ZiweiPalaceDetail({ palace, onClose }: ZiweiPalaceDetailProps) {
  // ESC 키로 닫기
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // 길흉 색상 계산
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400';
    if (score >= 40) return 'text-gray-600 dark:text-gray-400';
    if (score >= 20) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score: number): string => {
    if (score >= 80) return 'bg-green-50 dark:bg-green-900/20';
    if (score >= 60) return 'bg-blue-50 dark:bg-blue-900/20';
    if (score >= 40) return 'bg-gray-50 dark:bg-gray-800/20';
    if (score >= 20) return 'bg-orange-50 dark:bg-orange-900/20';
    return 'bg-red-50 dark:bg-red-900/20';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return '대길 🌟';
    if (score >= 60) return '길 ✨';
    if (score >= 40) return '평 ⚖️';
    if (score >= 20) return '흉 ⚠️';
    return '대흉 ❌';
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className={`p-6 border-b border-gray-200 dark:border-gray-700 ${getScoreBg(palace.luckyScore)}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                {palace.name}
              </h2>
              <span className="text-lg text-gray-500 dark:text-gray-400">
                {palace.branch}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="닫기"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 길흉 점수 */}
          <div className="flex items-center gap-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">길흉 점수</div>
              <div className={`text-5xl font-bold ${getScoreColor(palace.luckyScore)}`}>
                {palace.luckyScore}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">상태</div>
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-200">
                {getScoreLabel(palace.luckyScore)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {palace.strength}
              </div>
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-6">
          {/* 설명 */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
              📝 해석
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {palace.description}
            </p>
          </div>

          {/* 주성 (14주성) */}
          {palace.mainStars.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">
                ⭐ 주성 (主星)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {palace.mainStars.map((star, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg text-center"
                  >
                    <div className="text-2xl mb-1">⭐</div>
                    <div className="text-sm font-bold text-purple-700 dark:text-purple-300">
                      {star}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 보조성 */}
          {palace.auxiliaryStars.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">
                ✨ 보조성
              </h3>
              <div className="flex flex-wrap gap-2">
                {palace.auxiliaryStars.map((star, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full text-sm text-blue-700 dark:text-blue-300"
                  >
                    {star}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 키워드 */}
          {palace.keywords.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">
                🔑 키워드
              </h3>
              <div className="flex flex-wrap gap-2">
                {palace.keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-800 rounded-full text-sm font-medium text-purple-700 dark:text-purple-300"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 별자리가 없을 경우 */}
          {palace.mainStars.length === 0 && palace.auxiliaryStars.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🌙</div>
              <p className="text-gray-500 dark:text-gray-400">
                이 궁위에는 주요 별자리가 배치되지 않았습니다
              </p>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
