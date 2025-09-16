import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SajuInputForm from '@/components/saju/SajuInputForm';
import { FiveElementsBalanceChart } from '@/components/saju/charts/FiveElementsBalanceChart';
import { TenGodsDistributionChart } from '@/components/saju/charts/TenGodsDistributionChart';
// import SixAreaChart from '@/components/saju/charts/SixAreaChart'; // 현재 사용하지 않음
import HundredYearChart from '@/components/Charts/HundredYearChart';
import ChartNavigation from '@/components/Common/ChartNavigation';
import CustomerSelector from '@/components/saju/CustomerSelector';
import UniversalLifeChart from '@/components/charts/UniversalLifeChart';
import { SajuBirthInfo, SajuAnalysisResult, SajuData } from '@/types/saju';
import { Customer } from '@/services/customerApi';
import { customerToSajuBirthInfo, formatCustomerBirthDate } from '@/utils/customerConverter';
import { SajuCalculator, formatFourPillarsDetailed, FourPillarsResult } from '@/utils/sajuCalculator';
import { calculateSajuData } from '@/utils/sajuDataCalculator';
import { CHART_DESIGN_SYSTEM } from '@/constants/chartDesignSystem';
import { fetchLifetimeFortune, calculateCurrentAge, LifetimeFortuneResponse } from '@/services/lifetimeFortuneApi';
import { generateUniversalLifeChart, getCachedChart, setCachedChart } from '@/services/universalLifeChartApi';
import { UniversalLifeChartData } from '@/types/universalLifeChart';

const SajuAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [birthInfo, setBirthInfo] = useState<SajuBirthInfo | null>(null);
  const [analysisResult, setAnalysisResult] = useState<SajuAnalysisResult | null>(null);
  const [fourPillars, setFourPillars] = useState<FourPillarsResult | null>(null);
  const [lifetimeFortune, setLifetimeFortune] = useState<LifetimeFortuneResponse | null>(null);
  const [universalChart, setUniversalChart] = useState<UniversalLifeChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCustomerPanel, setShowCustomerPanel] = useState(true);
  const [activeTab, setActiveTab] = useState<'analysis' | 'chart' | 'hundred-year'>('analysis');

  // 초기 로드 (고객 선택 패널 표시)
  useEffect(() => {
    // 고객관리 시스템으로 전환했으므로 초기에는 고객 선택 패널 표시
    setShowCustomerPanel(true);
  }, []);

  // 고객 선택 핸들러
  const handleCustomerSelect = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    if (customer) {
      const sajuBirthInfo = customerToSajuBirthInfo(customer);
      setBirthInfo(sajuBirthInfo);
      setShowCustomerPanel(false);
      analyzeSaju(sajuBirthInfo);
      loadUniversalChart(customer.id);
      // console.log('고객 선택됨:', customer.name, sajuBirthInfo);
    } else {
      setBirthInfo(null);
      setAnalysisResult(null);
      setFourPillars(null);
      setLifetimeFortune(null);
      setUniversalChart(null);
      setShowCustomerPanel(true);
    }
  };

  // 인생차트 로드 함수
  const loadUniversalChart = async (customerId: number) => {
    try {
      // 캐시된 차트 확인
      const cached = getCachedChart(customerId);
      if (cached) {
        setUniversalChart(cached);
        return;
      }

      // 새 차트 생성
      const chartData = await generateUniversalLifeChart(customerId);
      setUniversalChart(chartData);
      setCachedChart(customerId, chartData);
    } catch (error) {
      console.error('❌ 인생차트 로드 실패:', error);
      setUniversalChart(null);
    }
  };

  // 정확한 사주 분석 함수 
  const analyzeSaju = async (info: SajuBirthInfo) => {
    setLoading(true);
    setBirthInfo(info);

    // 정확한 사주 계산
    const calculatedPillars = SajuCalculator.calculateFourPillars(info);
    setFourPillars(calculatedPillars);
    
    // console.log('=== 사주 계산 결과 ===');
    // console.log('입력:', info);
    // console.log('사주:', formatFourPillarsDetailed(calculatedPillars));

    // 100년 인생운세 계산 추가
    fetchLifetimeFortune({
      year: info.year,
      month: info.month,
      day: info.day,
      hour: info.hour || 12,
      isLunar: info.isLunar || false,
      gender: info.gender || 'male',
    }).then(fortuneData => {
      setLifetimeFortune(fortuneData);
      // console.log('✅ 100년 인생운세 계산 완료:', fortuneData);
    }).catch(error => {
      console.error('❌ 100년 인생운세 계산 실패:', error);
    });

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

  const formatBirthDate = (info: SajuBirthInfo) => {
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const date = new Date(info.year, info.month - 1, info.day);
    const weekday = weekdays[date.getDay()];
    
    return `${info.year}년 ${info.month}월 ${info.day}일 ${info.hour}시 ${info.minute || 0}분 (${weekday}요일) ${info.isLunar ? '음력' : '양력'}`;
  };

  // formatFourPillars는 현재 사용하지 않으므로 주석 처리
  // const formatFourPillars = (pillars: any) => {
  //   return `${pillars.year.heavenly}${pillars.year.earthly}년 ` +
  //     `${pillars.month.heavenly}${pillars.month.earthly}월 ` +
  //     `${pillars.day.heavenly}${pillars.day.earthly}일 ` +
  //     `${pillars.hour.heavenly}${pillars.hour.earthly}시`;
  // };

  // SajuAnalysisResult를 SajuData로 변환
  const convertToSajuData = (result: SajuAnalysisResult): SajuData => {
    // 실제 사주 데이터 재계산하여 완전한 SajuData 생성
    return calculateSajuData(result.birthInfo);
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
          {/* 왼쪽: 고객 선택 또는 입력 폼 */}
          <div className="lg:col-span-1">
            {showCustomerPanel || !selectedCustomer ? (
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      👥 고객 선택
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      등록된 고객을 선택하거나 새로 등록하세요
                    </p>
                  </div>
                  <div className="p-4">
                    <CustomerSelector
                      onSelect={handleCustomerSelect}
                      selectedCustomer={selectedCustomer}
                      showAddButton={true}
                    />
                  </div>
                </div>
                
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
                {/* 현재 선택된 고객 정보 표시 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      👤 현재 분석 대상
                    </h3>
                    <button
                      onClick={() => setShowCustomerPanel(true)}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors"
                    >
                      변경
                    </button>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900 dark:text-white">{selectedCustomer.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatCustomerBirthDate(selectedCustomer)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      📞 {selectedCustomer.phone}
                    </p>
                  </div>
                </div>
            
                {/* 사주 결과 우선 표시 */}
                {birthInfo && fourPillars && !loading && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                      🔮 사주(四柱) 결과
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">이름:</span>
                        <span className="ml-2 text-gray-800 dark:text-gray-200 font-medium">
                          {selectedCustomer?.name || birthInfo.name || '미입력'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">출생:</span>
                        <span className="ml-2 text-gray-800 dark:text-gray-200 font-medium">
                          {selectedCustomer ? formatCustomerBirthDate(selectedCustomer) : (birthInfo ? formatBirthDate(birthInfo) : '미입력')}
                        </span>
                      </div>
                      
                      <div className="border-t pt-3 mt-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                            <div className="font-semibold text-red-800 dark:text-red-200">년주 (年柱)</div>
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                              {fourPillars.year.combined}
                            </div>
                            <div className="text-xs text-red-600 dark:text-red-400">
                              {fourPillars.year.heavenly}({fourPillars.year.heavenly === '갑'||fourPillars.year.heavenly === '을' ? '목' : 
                               fourPillars.year.heavenly === '병'||fourPillars.year.heavenly === '정' ? '화' :
                               fourPillars.year.heavenly === '무'||fourPillars.year.heavenly === '기' ? '토' :
                               fourPillars.year.heavenly === '경'||fourPillars.year.heavenly === '신' ? '금' : '수'}) 
                              {fourPillars.year.earthly}
                            </div>
                          </div>
                          
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                            <div className="font-semibold text-green-800 dark:text-green-200">월주 (月柱)</div>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {fourPillars.month.combined}
                            </div>
                            <div className="text-xs text-green-600 dark:text-green-400">
                              {fourPillars.month.heavenly}({fourPillars.month.heavenly === '갑'||fourPillars.month.heavenly === '을' ? '목' : 
                               fourPillars.month.heavenly === '병'||fourPillars.month.heavenly === '정' ? '화' :
                               fourPillars.month.heavenly === '무'||fourPillars.month.heavenly === '기' ? '토' :
                               fourPillars.month.heavenly === '경'||fourPillars.month.heavenly === '신' ? '금' : '수'}) 
                              {fourPillars.month.earthly}
                            </div>
                          </div>
                          
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                            <div className="font-semibold text-blue-800 dark:text-blue-200">일주 (日柱)</div>
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {fourPillars.day.combined}
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              {fourPillars.day.heavenly}({fourPillars.day.heavenly === '갑'||fourPillars.day.heavenly === '을' ? '목' : 
                               fourPillars.day.heavenly === '병'||fourPillars.day.heavenly === '정' ? '화' :
                               fourPillars.day.heavenly === '무'||fourPillars.day.heavenly === '기' ? '토' :
                               fourPillars.day.heavenly === '경'||fourPillars.day.heavenly === '신' ? '금' : '수'}) 
                              {fourPillars.day.earthly} (일간)
                            </div>
                          </div>
                          
                          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                            <div className="font-semibold text-purple-800 dark:text-purple-200">시주 (時柱)</div>
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {fourPillars.hour.combined}
                            </div>
                            <div className="text-xs text-purple-600 dark:text-purple-400">
                              {fourPillars.hour.heavenly}({fourPillars.hour.heavenly === '갑'||fourPillars.hour.heavenly === '을' ? '목' : 
                               fourPillars.hour.heavenly === '병'||fourPillars.hour.heavenly === '정' ? '화' :
                               fourPillars.hour.heavenly === '무'||fourPillars.hour.heavenly === '기' ? '토' :
                               fourPillars.hour.heavenly === '경'||fourPillars.hour.heavenly === '신' ? '금' : '수'}) 
                              {fourPillars.hour.earthly}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <div className="text-center">
                            <div className="font-bold text-lg text-gray-800 dark:text-gray-200">
                              {formatFourPillarsDetailed(fourPillars)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              완전한 사주(四柱)
                            </div>
                          </div>
                        </div>
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
                          onClick={() => navigate('/saju/charts')}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 rounded-lg transition-colors"
                        >
                          📈 오행/십성 상세 차트
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
                {/* 탭 네비게이션 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
                  <div className="border-b border-gray-200 dark:border-gray-600">
                    <nav className="flex space-x-1" aria-label="Tabs">
                      <button
                        onClick={() => setActiveTab('analysis')}
                        className={`py-3 px-6 text-sm font-medium rounded-t-lg transition-colors ${
                          activeTab === 'analysis'
                            ? 'bg-blue-500 text-white border-b-2 border-blue-500'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        📊 기본 분석
                      </button>
                      <button
                        onClick={() => setActiveTab('chart')}
                        className={`py-3 px-6 text-sm font-medium rounded-t-lg transition-colors ${
                          activeTab === 'chart'
                            ? 'bg-blue-500 text-white border-b-2 border-blue-500'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        📈 인생차트
                      </button>
                      <button
                        onClick={() => setActiveTab('hundred-year')}
                        className={`py-3 px-6 text-sm font-medium rounded-t-lg transition-colors ${
                          activeTab === 'hundred-year'
                            ? 'bg-blue-500 text-white border-b-2 border-blue-500'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        🍀 100년 운세
                      </button>
                    </nav>
                  </div>

                  {/* 탭 컨텐츠 */}
                  <div className="p-6">
                    {activeTab === 'analysis' && (
                      <div className="space-y-8">
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
                    )}

                    {activeTab === 'chart' && (
                      <div>
                        {universalChart ? (
                          <UniversalLifeChart
                            data={universalChart}
                            height={500}
                            showControls={true}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-96">
                            <div className="text-center">
                              <div className="text-4xl mb-4">📈</div>
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                                인생차트 생성 중...
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400">
                                개인 맞춤형 95년 인생차트를 생성하고 있습니다
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'hundred-year' && (
                      <div>
                        {lifetimeFortune ? (
                          <HundredYearChart
                            data={lifetimeFortune.data.lifetimeFortune}
                            currentAge={birthInfo ? calculateCurrentAge(birthInfo.year) : undefined}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-96">
                            <div className="text-center">
                              <div className="text-4xl mb-4">🍀</div>
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                                100년 운세 계산 중...
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400">
                                평생 운세 패턴을 분석하고 있습니다
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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