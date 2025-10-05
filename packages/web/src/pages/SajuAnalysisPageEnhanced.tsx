import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SajuInputForm from '@/components/saju/SajuInputForm';
import { FiveElementsBalanceChart } from '@/components/saju/charts/FiveElementsBalanceChart';
import { TenGodsDistributionChart } from '@/components/saju/charts/TenGodsDistributionChart';
// import SixAreaChart from '@/components/saju/charts/SixAreaChart';
import HundredYearChart from '@/components/charts/HundredYearChart';
import ChartNavigation from '@/components/Common/ChartNavigation';
import UserSelectionPanel from '@/components/User/UserSelectionPanel';
import LifeChartButton from '@/components/saju/LifeChartButton';
import { convertToLifetimeRequest, getCacheKey } from '@/utils/customerDataConverter';
import { SajuBirthInfo, SajuAnalysisResult, SajuData } from '@/types/saju';
import { UserProfile, AnalysisType } from '@/types/user';
import { getCurrentUser, addAnalysisHistory } from '@/utils/userStorage';
import { SajuCalculator, formatFourPillarsDetailed, FourPillarsResult } from '@/utils/sajuCalculator';
import { calculateSajuData } from '@/utils/sajuDataCalculator';
import { CHART_DESIGN_SYSTEM } from '@/constants/chartDesignSystem';
import { fetchLifetimeFortune, calculateCurrentAge, LifetimeFortuneResponse } from '@/services/lifetimeFortuneApi';

const SajuAnalysisPageEnhanced: React.FC = () => {
  const _navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [birthInfo, setBirthInfo] = useState<SajuBirthInfo | null>(null);
  const [analysisResult, setAnalysisResult] = useState<SajuAnalysisResult | null>(null);
  const [fourPillars, setFourPillars] = useState<FourPillarsResult | null>(null);
  const [lifetimeFortune, setLifetimeFortune] = useState<LifetimeFortuneResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showUserPanel, setShowUserPanel] = useState(true);
  const [lifeChartLoading, setLifeChartLoading] = useState(false);
  const [lifeChartError, setLifeChartError] = useState<string | null>(null);
  
  // 차트 데이터 캐시
  const lifeChartCache = React.useRef(new Map<string, LifetimeFortuneResponse>());

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

  // 인생차트 로드 함수
  const loadLifeChartForUser = async (user: UserProfile) => {
    try {
      setLifeChartLoading(true);
      setLifeChartError(null);
      
      const cacheKey = getCacheKey(user);
      
      // 캐시 확인
      if (lifeChartCache.current.has(cacheKey)) {

        setLifetimeFortune(lifeChartCache.current.get(cacheKey)!);
        return;
      }
      
      const request = convertToLifetimeRequest(user);
      const response = await fetchLifetimeFortune(request);
      
      // 캐시 저장
      lifeChartCache.current.set(cacheKey, response);
      setLifetimeFortune(response);

    } catch (error: any) {
      setLifeChartError(error.message || '인생차트 로드 실패');
      console.error('❌ 인생차트 로드 실패:', error);
    } finally {
      setLifeChartLoading(false);
    }
  };

  // 차트 영역으로 스크롤
  const scrollToChart = () => {
    document.getElementById('hundred-year-chart')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  // 사용자 선택 핸들러
  const handleUserSelect = async (user: UserProfile) => {
    setCurrentUser(user);
    if (user) {
      setBirthInfo(user.birthInfo);
      setShowUserPanel(false);
      analyzeSaju(user.birthInfo);
      // 분석 히스토리 추가
      addAnalysisHistory(user.id, AnalysisType.SIX_AREA);
      // 인생차트 자동 로드
      await loadLifeChartForUser(user);
    }
  };

  const handleUserChange = () => {
    // 사용자 변경 시 필요한 업데이트
  };

  // 정확한 사주 분석 함수 
  const analyzeSaju = async (info: SajuBirthInfo) => {
    setLoading(true);
    setBirthInfo(info);

    // 정확한 사주 계산
    const calculatedPillars = SajuCalculator.calculateFourPillars(info);
    setFourPillars(calculatedPillars);


    // 시뮬레이션: 1초 대기 후 결과 생성
    setTimeout(() => {
      // 실제 사주 데이터 계산
      const sajuData = calculateSajuData(info);
      
      // SajuAnalysisResult 형식으로 변환
      const result: SajuAnalysisResult = {
        birthInfo: sajuData.birthInfo,
        fourPillars: sajuData.fourPillars,
        sixAreas: sajuData.sixAreas,
        fiveElements: sajuData.fiveElements,
        tenGods: sajuData.tenGods,
        totalScore: sajuData.totalScore,
        averageScore: sajuData.averageScore,
      };
      
      setAnalysisResult(result);
      setLoading(false);
    }, 1000);
  };

  // 입력 폼 제출 핸들러
  const handleFormSubmit = (info: SajuBirthInfo) => {
    analyzeSaju(info);
  };

  // SajuAnalysisResult를 SajuData로 변환
  const convertToSajuData = (result: SajuAnalysisResult): SajuData => {
    // dayMaster는 일주의 천간 (사주팔자가 있으면 추출, 없으면 기본값)
    const dayMaster = fourPillars?.day.heavenly || '갑';

    return {
      birthInfo: result.birthInfo,
      fourPillars: result.fourPillars,
      sixAreas: result.sixAreas,
      fiveElements: result.fiveElements,
      tenGods: result.tenGods,
      totalScore: result.totalScore,
      averageScore: result.averageScore,
      dayMaster,
    };
  };

  // 키보드 단축키 지원
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'l' && currentUser) {
        e.preventDefault();
        loadLifeChartForUser(currentUser);
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            사주 분석
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            생년월일시를 입력하여 당신의 사주를 분석해보세요
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 입력 폼 */}
          <div className="lg:col-span-1">
            {/* 사용자 선택 패널 추가 */}
            {showUserPanel && (
              <div className="mb-6">
                <UserSelectionPanel
                  currentUser={currentUser}
                  onUserSelect={handleUserSelect}
                  onUserChange={handleUserChange}
                  alwaysShowAddButton={true}
                />
              </div>
            )}

            {/* 사주 입력 폼 */}
            {!currentUser && (
              <SajuInputForm
                onSubmit={handleFormSubmit}
              />
            )}

            {/* 사주 팔자 표시 - 현재 사용자가 있거나 분석 결과가 있을 때 */}
            {(currentUser || fourPillars) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  사주 팔자
                </h3>
                
                {/* 생년월일시 정보 */}
                {birthInfo && (
                  <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    <p>{birthInfo.year}년 {birthInfo.month}월 {birthInfo.day}일 {birthInfo.hour}시</p>
                    <p>{birthInfo.isLunar ? '음력' : '양력'}</p>
                  </div>
                )}
                
                {/* 사주 팔자 표시 */}
                {fourPillars && (
                  <div className="grid grid-cols-4 gap-2">
                    {['년주', '월주', '일주', '시주'].map((label, index) => {
                      const pillar = index === 0 ? fourPillars.year :
                                     index === 1 ? fourPillars.month :
                                     index === 2 ? fourPillars.day :
                                     fourPillars.hour;
                      return (
                        <div key={label} className="text-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</div>
                          <div className="bg-gray-100 dark:bg-gray-700 rounded px-2 py-1">
                            <div className="text-lg font-bold text-gray-900 dark:text-white">{pillar.heavenly}</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">{pillar.earthly}</div>
                          </div>
                        </div>
                      );
                    })}
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
                {/* 🔥 신규: 인생차트 진입점 */}
                <LifeChartButton
                  customer={currentUser}
                  lifetimeFortune={lifetimeFortune}
                  loading={lifeChartLoading}
                  error={lifeChartError}
                  onLoadChart={() => currentUser && loadLifeChartForUser(currentUser)}
                  onScrollToChart={scrollToChart}
                />

                {/* 100년 인생운세 차트 - 최상단 배치 */}
                {lifetimeFortune && (
                  <div id="hundred-year-chart" className="mb-12">
                    <HundredYearChart
                      data={lifetimeFortune.data.lifetimeFortune}
                      currentAge={birthInfo ? calculateCurrentAge(birthInfo.year) : undefined}
                    />
                  </div>
                )}

                {/* 오행균형도 */}
                <FiveElementsBalanceChart
                  sajuData={convertToSajuData(analysisResult)}
                  height={400}
                  showLegend={true}
                  showTooltips={true}
                />

                {/* 십성분포도 */}
                <TenGodsDistributionChart
                  sajuData={convertToSajuData(analysisResult)}
                  height={400}
                  chartType="bar"
                  showCategory={false}
                />

                {/* 차트 네비게이션 */}
                <ChartNavigation showCenter={false} />
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12">
                <div className="text-center">
                  <div className="text-6xl mb-4">🔮</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    사주 분석을 시작하세요
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    생년월일시를 입력하면 상세한 사주 분석 결과를 확인할 수 있습니다
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SajuAnalysisPageEnhanced;