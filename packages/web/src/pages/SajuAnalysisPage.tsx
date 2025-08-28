import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SajuInputForm from '@/components/saju/SajuInputForm';
import FiveElementsChart from '@/components/saju/charts/FiveElementsChart';
import SixAreaChart from '@/components/saju/charts/SixAreaChart';
import ChartNavigation from '@/components/Common/ChartNavigation';
import UserSelectionPanel from '@/components/User/UserSelectionPanel';
import { SajuBirthInfo, SajuAnalysisResult } from '@/types/saju';
import { UserProfile, AnalysisType } from '@/types/user';
import { getCurrentUser, addAnalysisHistory } from '@/utils/userStorage';
import { CHART_DESIGN_SYSTEM } from '@/constants/chartDesignSystem';

const SajuAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [birthInfo, setBirthInfo] = useState<SajuBirthInfo | null>(null);
  const [analysisResult, setAnalysisResult] = useState<SajuAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showUserPanel, setShowUserPanel] = useState(true);

  // 현재 사용자 로드
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setBirthInfo(user.birthInfo);
      setShowUserPanel(false);
      // 자동으로 분석 시작
      analyzeSaju(user.birthInfo);
    }
  }, []);

  // 사용자 선택 핸들러
  const handleUserSelect = (user: UserProfile) => {
    setCurrentUser(user);
    if (user) {
      setBirthInfo(user.birthInfo);
      setShowUserPanel(false);
      analyzeSaju(user.birthInfo);
      // 분석 히스토리 추가
      addAnalysisHistory(user.id, AnalysisType.SIX_AREA);
    }
  };

  const handleUserChange = () => {
    // 사용자 변경 시 필요한 업데이트
  };

  // 임시 사주 분석 함수 (실제로는 백엔드 API 호출)
  const analyzeSaju = async (info: SajuBirthInfo) => {
    setLoading(true);
    setBirthInfo(info);

    // 시뮬레이션: 2초 대기 후 결과 생성
    setTimeout(() => {
      // 임시 데이터 생성 (실제로는 백엔드에서 계산)
      const result: SajuAnalysisResult = {
        birthInfo: info,
        fourPillars: {
          year: { heavenly: '병', earthly: '술' },
          month: { heavenly: '신', earthly: '묘' },
          day: { heavenly: '임', earthly: '진' },
          hour: { heavenly: '계', earthly: '묘' }
        },
        sixAreas: {
          foundation: 68,
          thinking: 62,
          relationship: 71,
          action: 58,
          luck: 73,
          environment: 55
        },
        fiveElements: {
          wood: 25,
          fire: 20,
          earth: 15,
          metal: 22,
          water: 18
        },
        tenGods: {
          bijeon: 10,
          geopjae: 8,
          siksin: 12,
          sanggwan: 9,
          jeongjae: 11,
          pyeonjae: 7,
          jeonggwan: 13,
          pyeongwan: 10,
          jeongin: 12,
          pyeongin: 8
        },
        totalScore: 387,
        averageScore: 64.5
      };
      setAnalysisResult(result);
      setLoading(false);
    }, 2000);
  };

  const formatBirthDate = (info: SajuBirthInfo) => {
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const date = new Date(info.year, info.month - 1, info.day);
    const weekday = weekdays[date.getDay()];
    
    return `${info.year}년 ${info.month}월 ${info.day}일 ${info.hour}시 ${info.minute || 0}분 (${weekday}요일) ${info.isLunar ? '음력' : '양력'}`;
  };

  const formatFourPillars = (pillars: any) => {
    return `${pillars.year.heavenly}${pillars.year.earthly}년 ${pillars.month.heavenly}${pillars.month.earthly}월 ${pillars.day.heavenly}${pillars.day.earthly}일 ${pillars.hour.heavenly}${pillars.hour.earthly}시`;
  };

  return (
    <div className={CHART_DESIGN_SYSTEM.LAYOUT.pageContainer}>
      <div className={CHART_DESIGN_SYSTEM.LAYOUT.contentContainer}>
        {/* 페이지 헤더 - 통일된 디자인 */}
        <div className={CHART_DESIGN_SYSTEM.LAYOUT.header.container}>
          <h1 className={CHART_DESIGN_SYSTEM.LAYOUT.header.title}>
            📊 전문 사주 분석
          </h1>
          <p className={CHART_DESIGN_SYSTEM.LAYOUT.header.subtitle}>
            생년월일시를 입력하면 30가지 전문 차트로 운명을 분석합니다
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 사용자 선택 또는 입력 폼 */}
          <div className="lg:col-span-1">
            {showUserPanel || !currentUser ? (
              <div className="space-y-4">
                <UserSelectionPanel
                  currentUser={currentUser}
                  onUserSelect={handleUserSelect}
                  onUserChange={handleUserChange}
                  alwaysShowAddButton={true}
                  maxUsers={Infinity}
                />
                
                {/* 직접 입력 옵션 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      📝 직접 입력
                    </h3>
                  </div>
                  <div className="p-4">
                    <SajuInputForm onSubmit={analyzeSaju} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 현재 사용자 정보 표시 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      👤 현재 분석 대상
                    </h3>
                    <button
                      onClick={() => setShowUserPanel(true)}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors"
                    >
                      변경
                    </button>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900 dark:text-white">{currentUser.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatBirthDate(currentUser.birthInfo)}
                    </p>
                  </div>
                </div>
            
                {/* 분석 정보 표시 */}
                {birthInfo && analysisResult && !loading && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                      📋 분석 정보
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">이름:</span>
                        <span className="ml-2 text-gray-800 dark:text-gray-200 font-medium">
                          {currentUser?.name || birthInfo.name || '미입력'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">출생:</span>
                        <span className="ml-2 text-gray-800 dark:text-gray-200 font-medium">
                          {formatBirthDate(birthInfo)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">사주:</span>
                        <span className="ml-2 text-gray-800 dark:text-gray-200 font-medium">
                          {formatFourPillars(analysisResult.fourPillars)}
                        </span>
                      </div>
                    </div>

                    {/* 차트 네비게이션 */}
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        📊 분석 차트 (총 30개)
                      </h4>
                      <div className="space-y-1">
                        <button className="w-full text-left px-3 py-2 text-sm bg-purple-600 text-white rounded-lg">
                          ▶ 오행균형도 분석 (현재)
                        </button>
                        <button 
                          onClick={() => navigate('/saju/six-areas')}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 rounded-lg transition-colors"
                        >
                          📊 6대 영역 분석
                        </button>
                        <button 
                          onClick={() => navigate('/saju/detailed')}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 rounded-lg transition-colors"
                        >
                          🔮 17대 운세 분석
                        </button>
                        <button 
                          onClick={() => navigate('/saju/personality')}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 rounded-lg transition-colors"
                        >
                          🧠 7대 성향 분석
                        </button>
                        <button 
                          onClick={() => navigate('/fortune')}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 rounded-lg transition-colors"
                        >
                          🍀 오늘의 운세
                        </button>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          ... 25개 차트 더보기
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 오른쪽: 차트 표시 영역 */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className={CHART_DESIGN_SYSTEM.LOADING.container}>
                <div className={CHART_DESIGN_SYSTEM.LOADING.wrapper}>
                  <div className={CHART_DESIGN_SYSTEM.LOADING.spinner}></div>
                  <p className={CHART_DESIGN_SYSTEM.LOADING.text}>사주를 분석하고 있습니다...</p>
                </div>
              </div>
            ) : analysisResult ? (
              <div className="space-y-8">
                {/* 오행균형도 차트 - 첫 번째 차트 */}
                <FiveElementsChart 
                  birthInfo={birthInfo!}
                  birthDate={formatBirthDate(birthInfo!)}
                />

                {/* 자동 네비게이션 - 다음 차트로만 이동 */}
                <ChartNavigation showCenter={false} />

                {/* 추가 차트 플레이스홀더 */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    🎯 오행 균형도
                  </h3>
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    <p>차트 개발 중...</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    ⭐ 십성 분포도
                  </h3>
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    <p>차트 개발 중...</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12">
                <div className="text-center">
                  <div className="text-6xl mb-4">🔮</div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    사주 분석 준비 완료
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    왼쪽에서 생년월일시를 입력하면 상세한 분석 결과를 확인할 수 있습니다
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-500">
          <p>※ 본 분석은 전통 사주명리학과 현대 통계학을 결합한 참고 자료입니다.</p>
          <p>※ 개인의 노력과 환경에 따라 실제 결과는 달라질 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
};

export default SajuAnalysisPage;