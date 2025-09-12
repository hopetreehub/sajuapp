/**
 * 인생차트 버튼 컴포넌트
 * 100년 인생운세 차트에 빠르게 접근할 수 있는 진입점 제공
 */

import React from 'react';
import { Customer } from '@/services/customerApi';
import { UserProfile } from '@/types/user';
import { LifetimeFortuneResponse } from '@/services/lifetimeFortuneApi';
import { getCustomerName, getCustomerBirthDateString } from '@/utils/customerDataConverter';

interface LifeChartButtonProps {
  customer?: Customer | UserProfile | null;
  lifetimeFortune?: LifetimeFortuneResponse | null;
  loading?: boolean;
  error?: string | null;
  onLoadChart?: () => void;
  onScrollToChart?: () => void;
}

const LifeChartButton: React.FC<LifeChartButtonProps> = ({
  customer,
  lifetimeFortune,
  loading = false,
  error = null,
  onLoadChart,
  onScrollToChart,
}) => {
  const customerName = getCustomerName(customer);
  const birthDateString = getCustomerBirthDateString(customer);
  
  // 차트가 이미 로드되었는지 확인
  const isChartLoaded = !!lifetimeFortune;
  
  // 버튼 클릭 핸들러
  const handleClick = () => {
    if (isChartLoaded && onScrollToChart) {
      // 차트가 로드되어 있으면 스크롤
      onScrollToChart();
    } else if (!loading && onLoadChart) {
      // 차트가 로드되지 않았으면 로드
      onLoadChart();
    }
  };
  
  // 고객이 선택되지 않은 경우
  if (!customer) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
        <div className="text-gray-500 dark:text-gray-400">
          <span className="text-2xl mb-2 block">📊</span>
          <p className="text-lg font-medium">100년 인생운세 차트</p>
          <p className="text-sm mt-2">고객을 선택하면 인생운세 차트를 확인할 수 있습니다</p>
        </div>
      </div>
    );
  }
  
  // 로딩 중
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-6 text-white shadow-lg animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="animate-spin text-2xl">⭐</div>
              <div>
                <p className="text-lg font-bold">{customerName}님의 100년 운세를 계산하고 있습니다...</p>
                <p className="text-sm opacity-90 mt-1">{birthDateString}</p>
              </div>
            </div>
          </div>
          <div className="text-white/60">
            <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }
  
  // 오류 발생
  if (error) {
    return (
      <div 
        className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-6 text-white shadow-lg cursor-pointer hover:shadow-xl transition-all"
        onClick={handleClick}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <p className="text-lg font-bold">차트 로드 실패</p>
                <p className="text-sm opacity-90 mt-1">{error}</p>
                <p className="text-xs opacity-75 mt-2">클릭하여 다시 시도</p>
              </div>
            </div>
          </div>
          <div className="text-white/60">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        </div>
      </div>
    );
  }
  
  // 차트 로드 완료
  if (isChartLoaded) {
    const analysis = lifetimeFortune.data.analysis;
    
    return (
      <div 
        className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-6 text-white shadow-lg cursor-pointer hover:shadow-xl transition-all transform hover:scale-[1.02]"
        onClick={handleClick}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">📈</span>
              <div>
                <p className="text-xl font-bold">{customerName}님의 100년 인생운세 차트</p>
                <p className="text-sm opacity-90 mt-1">{birthDateString}</p>
                <div className="flex gap-4 mt-3 text-xs">
                  <span className="bg-white/20 px-2 py-1 rounded">
                    최고운세: {analysis.bestYear.age}세 ({analysis.bestYear.score}점)
                  </span>
                  <span className="bg-white/20 px-2 py-1 rounded">
                    평균: {analysis.averageScore.toFixed(1)}점
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-white">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <div className="mt-3 text-center">
          <p className="text-sm opacity-75">클릭하여 상세 차트 보기 ↓</p>
        </div>
      </div>
    );
  }
  
  // 차트 로드 전 (기본 상태)
  return (
    <div 
      className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-6 text-white shadow-lg cursor-pointer hover:shadow-xl transition-all transform hover:scale-[1.02]"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔮</span>
            <div>
              <p className="text-xl font-bold">{customerName}님의 100년 인생운세 차트</p>
              <p className="text-sm opacity-90 mt-1">{birthDateString}</p>
              <p className="text-xs opacity-75 mt-2">클릭하여 운세 차트 확인하기</p>
            </div>
          </div>
        </div>
        <div className="text-white">
          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default LifeChartButton;