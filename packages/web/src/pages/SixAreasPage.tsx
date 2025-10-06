import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// import SixAreaChart from '@/components/saju/charts/SixAreaChart'; // TODO: File not available
import ChartNavigation from '@/components/Common/ChartNavigation';
import { SajuAnalysisResult, SajuBirthInfo } from '@/types/saju';
import { UserProfile } from '@/types/user';
import { getCurrentUser } from '@/utils/userStorage';
import { CHART_DESIGN_SYSTEM } from '@/constants/chartDesignSystem';
import { calculateSajuData } from '@/utils/sajuDataCalculator';

const SixAreasPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setLoading(false);
    } else {
      // 사용자가 없으면 메인 사주분석 페이지로 리다이렉트
      navigate('/saju');
    }
  }, [navigate]);

  // 실제 사주 분석 결과 생성
  const generateAnalysisResult = (birthInfo: SajuBirthInfo): SajuAnalysisResult => {
    // 실제 사주 데이터 계산
    const sajuData = calculateSajuData(birthInfo);
    
    return {
      birthInfo: sajuData.birthInfo,
      fourPillars: sajuData.fourPillars,
      sixAreas: sajuData.sixAreas,
      fiveElements: sajuData.fiveElements,
      tenGods: sajuData.tenGods,
      totalScore: sajuData.totalScore,
      averageScore: sajuData.averageScore,
    };
  };

  const formatBirthDate = (birthInfo: SajuBirthInfo) => {
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const date = new Date(birthInfo.year, birthInfo.month - 1, birthInfo.day);
    const weekday = weekdays[date.getDay()];
    
    return `${birthInfo.year}년 ${birthInfo.month}월 ${birthInfo.day}일 ${birthInfo.hour}시 ${birthInfo.minute || 0}분 (${weekday}요일) ${birthInfo.isLunar ? '음력' : '양력'}`;
  };

  // 사주 데이터 계산 (해석 패널용) - Hook을 조건문 전에 호출
  const sajuData = useMemo(() => {
    if (!currentUser?.birthInfo) return null;

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { calculateSajuData } = require('@/utils/sajuDataCalculator');
      return calculateSajuData(currentUser.birthInfo);
    } catch (error) {
      console.error('사주 계산 오류:', error);
      return null;
    }
  }, [currentUser?.birthInfo]);

  if (loading) {
    return (
      <div className={CHART_DESIGN_SYSTEM.LAYOUT.pageContainer}>
        <div className={CHART_DESIGN_SYSTEM.LOADING.container}>
          <div className={CHART_DESIGN_SYSTEM.LOADING.wrapper}>
            <div className={CHART_DESIGN_SYSTEM.LOADING.spinner}></div>
            <p className={CHART_DESIGN_SYSTEM.LOADING.text}>6대 영역 분석을 준비하고 있습니다...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className={CHART_DESIGN_SYSTEM.LAYOUT.pageContainer}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              분석할 사용자를 찾을 수 없습니다
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              먼저 사주분석 페이지에서 생년월일시를 입력해주세요
            </p>
            <button
              onClick={() => navigate('/saju')}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors"
            >
              사주분석 페이지로 이동
            </button>
          </div>
        </div>
      </div>
    );
  }

  const analysisResult = generateAnalysisResult(currentUser.birthInfo);

  return (
    <div className={CHART_DESIGN_SYSTEM.LAYOUT.pageContainer}>
      <div className={CHART_DESIGN_SYSTEM.LAYOUT.contentContainer}>
        {/* 페이지 헤더 */}
        <div className={CHART_DESIGN_SYSTEM.LAYOUT.header.container}>
          <h1 className={CHART_DESIGN_SYSTEM.LAYOUT.header.title}>
            📊 6대 영역 분석
          </h1>
          <p className={CHART_DESIGN_SYSTEM.LAYOUT.header.subtitle}>
            기본 사주 6개 영역 종합 분석
          </p>
        </div>

        {/* 현재 분석 대상 표시 */}
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            👤 분석 대상: {currentUser.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            📅 {formatBirthDate(currentUser.birthInfo)}
          </p>
        </div>

        {/* 6대 영역 차트 */}
        <div className="mb-8">
          {/* TODO: SixAreaChart component not available */}
          <div className="text-center py-8 text-gray-500">
            6대 영역 차트 (개발 중)
          </div>
        </div>

        {/* 차트 네비게이션 */}
        <ChartNavigation showCenter={false} />

        {/* 다른 사용자 분석 버튼 */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/saju')}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors"
          >
            다른 사용자 분석하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SixAreasPage;