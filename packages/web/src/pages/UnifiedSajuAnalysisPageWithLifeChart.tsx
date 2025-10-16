import { useState, useEffect, useMemo } from 'react';
import { SAJU_RADAR_CATEGORIES, setGlobalSajuData, loadDynamicSajuCategories, getSajuRadarCategories } from '@/data/sajuRadarData';
import { SajuRadarData, SajuRadarCategory } from '@/types/sajuRadar';
import SajuCategoryNavigation from '@/components/saju/SajuCategoryNavigation';
import SajuSubcategoryTabs from '@/components/saju/SajuSubcategoryTabs';
import UnifiedSajuRadarChart from '@/components/saju/charts/UnifiedSajuRadarChart';
import CustomerSelector from '@/components/saju/CustomerSelector';
import { Customer, getCustomerById } from '@/services/customerApi';
import LifeChartButton from '@/components/saju/LifeChartButton';
import HundredYearChart from '@/components/charts/HundredYearChartFixed';
import HealthRadarChart from '@/components/saju/charts/HealthRadarChart';
import WealthRadarChart from '@/components/saju/charts/WealthRadarChart';
import RelationshipRadarChart from '@/components/saju/charts/RelationshipRadarChart';
import { fetchLifetimeFortune, LifetimeFortuneResponse } from '@/services/lifetimeFortuneApi';
import { convertCustomerToLifetimeRequest } from '@/utils/customerDataConverter';
import '@/utils/testUniqueValues'; // 개인별 고유값 테스트 함수 로드
import SajuAIChat from '@/components/saju/SajuAIChat';
import { calculateFourPillars } from '@/utils/sajuCalculator';
import SajuBeginnerGuide from '@/components/saju/SajuBeginnerGuide';

export default function UnifiedSajuAnalysisPageWithLifeChart() {
  const [selectedCategory, setSelectedCategory] = useState('jubon');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [appliedCustomer, setAppliedCustomer] = useState<Customer | null>(null);
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState(false);
  const [customerSajuData, setCustomerSajuData] = useState<any>(null);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [lifetimeFortune, setLifetimeFortune] = useState<LifetimeFortuneResponse | null>(null);
  const [lifeChartLoading, setLifeChartLoading] = useState(false);
  const [lifeChartError, setLifeChartError] = useState<string | null>(null);
  const [categories, setCategories] = useState<SajuRadarCategory[]>(SAJU_RADAR_CATEGORIES);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // 정확한 나이 계산 함수
  const calculateCurrentAge = (birthDate: string): number => {
    const birth = new Date(birthDate);
    const today = new Date();

    console.log('🔍 [나이계산] birthDate 입력:', birthDate);
    console.log('🔍 [나이계산] birth 객체:', birth);
    console.log('🔍 [나이계산] 출생년도:', birth.getFullYear());
    console.log('🔍 [나이계산] 현재년도:', today.getFullYear());

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    console.log('🔍 [나이계산] 기본 나이 (연도차):', age);
    console.log('🔍 [나이계산] 월 차이:', monthDiff);
    console.log('🔍 [나이계산] 출생월:', birth.getMonth() + 1);
    console.log('🔍 [나이계산] 현재월:', today.getMonth() + 1);

    // 생일이 아직 안 지났으면 1 빼기
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
      console.log('🔍 [나이계산] 생일 전이므로 -1:', age);
    }

    const koreanAge = age + 1; // 한국 나이 계산 (태어나면 1살)
    console.log('🔍 [나이계산] 최종 한국 나이:', koreanAge);

    return koreanAge;
  };


  const currentCategory = categories.find(cat => cat.id === selectedCategory);

  // 카테고리 변경 시 첫 번째 중항목 자동 선택
  useEffect(() => {
    if (currentCategory && currentCategory.subcategories.length > 0) {
      setSelectedSubcategory(currentCategory.subcategories[0].id);
    }
  }, [selectedCategory, currentCategory]);

  // 고객 선택 변경 감지
  useEffect(() => {
    setHasUnappliedChanges(selectedCustomer?.id !== appliedCustomer?.id);
  }, [selectedCustomer, appliedCustomer]);

  // 고객 적용 시 사주 데이터 로드 (적용된 고객 정보 사용)
  useEffect(() => {
    console.log('🔮 [사주분석] appliedCustomer 변경:', appliedCustomer?.name, appliedCustomer?.id);
    if (appliedCustomer?.id) {
      loadCustomerSajuData(appliedCustomer.id);
    } else {
      setCustomerSajuData(null);
      setGlobalSajuData(null); // 전역 사주 데이터도 초기화
    }
  }, [appliedCustomer]);

  // 컴포넌트 마운트 시 동적 카테고리 데이터 로드 (현재 비활성화 - 백엔드 API 없음)
  useEffect(() => {
    const loadCategories = async () => {
      if (!categoriesLoaded && !isLoadingCategories) {
        setIsLoadingCategories(true);
        try {
          // 백엔드 API가 없으므로 동적 로딩 비활성화
          // await loadDynamicSajuCategories();

          // 정적 데이터만 사용
          console.log('[카테고리 로드] 정적 데이터 사용 (백엔드 API 비활성화)');
          const updatedCategories = getSajuRadarCategories();
          setCategories([...updatedCategories]); // 새 배열로 상태 업데이트
          setCategoriesLoaded(true);
        } catch (error) {
          console.error('카테고리 로드 실패:', error);
        } finally {
          setIsLoadingCategories(false);
        }
      }
    };

    loadCategories();
  }, [categoriesLoaded, isLoadingCategories]);

  // 고객 적용 핸들러
  const handleApplyCustomer = () => {
    console.log('🔥 [사주분석] 고객 적용:', selectedCustomer?.name, selectedCustomer?.birth_date);
    setAppliedCustomer(selectedCustomer);
    setHasUnappliedChanges(false);
  };

  // 인생차트 로드 함수
  const loadLifeChartForCustomer = async (customer: Customer) => {
    try {
      setLifeChartLoading(true);
      setLifeChartError(null);

      // 캐시 무효화를 위해 이전 데이터 초기화
      setLifetimeFortune(null);

      const request = convertCustomerToLifetimeRequest(customer);


      const response = await fetchLifetimeFortune(request);

      setLifetimeFortune(response);

    } catch (error: any) {
      setLifeChartError(error.message || '인생차트 로드 실패');
      console.error('❌ 인생차트 로드 실패:', error);
    } finally {
      setLifeChartLoading(false);
    }
  };

  const loadCustomerSajuData = async (customerId: number) => {
    try {
      console.log('📥 [사주분석] 고객 데이터 로딩 시작:', customerId);

      const response = await getCustomerById(customerId);
      console.log('📦 [사주분석] API 전체 응답:', response);
      console.log('📦 [사주분석] response.data:', response.data);

      // API가 배열을 반환하는 경우 처리
      let customerData;
      if (Array.isArray(response.data)) {
        console.log('⚠️ [사주분석] API가 배열 반환 - ID로 필터링:', customerId);
        customerData = response.data.find((c: any) => c.id === customerId);
        console.log('📦 [사주분석] 필터링된 고객 데이터:', customerData);
      } else {
        customerData = response.data;
      }

      if (!customerData) {
        console.error('❌ [사주분석] 고객을 찾을 수 없음:', customerId);
        setCustomerSajuData(null);
        setGlobalSajuData(null);
        return;
      }

      console.log('📦 [사주분석] 고객 이름:', customerData.name);
      console.log('📦 [사주분석] 고객 객체 전체:', customerData);
      console.log('📦 [사주분석] 고객 객체 키들:', Object.keys(customerData));

      // saju_data가 문자열인 경우 JSON 파싱
      let sajuData = customerData.saju_data;
      console.log('📦 [사주분석] saju_data (파싱 전):', sajuData);
      console.log('📦 [사주분석] saju_data 타입:', typeof sajuData);

      if (typeof sajuData === 'string') {
        try {
          sajuData = JSON.parse(sajuData);
          console.log('📦 [사주분석] saju_data (파싱 후):', sajuData);
        } catch (e) {
          console.error('[사주 데이터 파싱 실패]', e);
          sajuData = null;
        }
      }

      // saju_data가 없는 경우 기본 데이터 생성 (AI 버튼용)
      if (!sajuData) {
        console.log('⚠️ [사주분석] saju_data 없음 - AI용 기본 데이터 생성');
        sajuData = {
          fullSaju: '사주 데이터 계산 필요',
          ohHaengBalance: {
            목: 20,
            화: 20,
            토: 20,
            금: 20,
            수: 20
          },
          sipSungBalance: {
            비겁: 10,
            식상: 10,
            재성: 10,
            관성: 10,
            인성: 10
          },
          // 차트 에러 방지용 플래그
          _isMinimal: true
        };
        console.log('✅ [사주분석] AI용 기본 데이터 생성 완료');
      }

      console.log('✅ [사주분석] 사주 데이터 설정:', sajuData?.fullSaju);
      console.log('✅ [사주분석] 사주 데이터 전체:', sajuData);
      setCustomerSajuData(sajuData);
      // 전역 사주 데이터 설정 (모든 차트에 반영)
      setGlobalSajuData(sajuData);

    } catch (error) {
      console.error('[에러] 고객 사주 데이터 로딩 실패:', error);
      setGlobalSajuData(null);
    }
  };

  // 현재 선택된 차트 데이터 생성
  const chartData: SajuRadarData | null = useMemo(() => {
    if (!currentCategory || !selectedSubcategory) return null;

    const subcategory = currentCategory.subcategories.find(
      sub => sub.id === selectedSubcategory,
    );

    if (!subcategory) return null;

    return {
      categoryId: selectedCategory,
      subcategoryId: selectedSubcategory,
      title: `${currentCategory.name} - ${subcategory.name}`,
      items: subcategory.items,
      chartData: subcategory.items.map(item => item.baseScore),
      maxValue: 100,
    };
  }, [selectedCategory, selectedSubcategory, currentCategory]);

  // 생년월일 정보 (적용된 고객 기준)
  const birthDate = appliedCustomer
    ? `${appliedCustomer.birth_date} ${appliedCustomer.birth_time}`
    : '고객을 선택해주세요';

  // 사주팔자 계산 (AI 채팅용)
  const fourPillars = useMemo(() => {
    if (!appliedCustomer) {
      console.log('🤖 [AI 버튼] fourPillars 계산 불가: appliedCustomer 없음');
      return null;
    }

    const [year, month, day] = appliedCustomer.birth_date.split('-').map(Number);
    const [hour, minute] = appliedCustomer.birth_time.split(':').map(Number);

    const result = calculateFourPillars({
      year,
      month,
      day,
      hour,
      minute,
      isLunar: appliedCustomer.lunar_solar === 'lunar',
      gender: appliedCustomer.gender,
    });

    console.log('🤖 [AI 버튼] fourPillars 계산 완료:', result);
    return result;
  }, [appliedCustomer]);

  // 사주 분석 결과 (AI 채팅용)
  const analysisResult = useMemo(() => {
    if (!customerSajuData || !fourPillars || !appliedCustomer) {
      console.log('🤖 [AI 버튼] analysisResult 생성 불가:', {
        customerSajuData: !!customerSajuData,
        fourPillars: !!fourPillars,
        appliedCustomer: !!appliedCustomer
      });
      return null;
    }

    const result = {
      fiveElements: customerSajuData.ohHaengBalance || {},
      tenGods: customerSajuData.sipSungBalance || {},
      totalScore: Object.values(customerSajuData.ohHaengBalance || {}).reduce((sum: number, val: any) => sum + val, 0),
      averageScore: Math.round(Object.values(customerSajuData.ohHaengBalance || {}).reduce((sum: number, val: any) => sum + val, 0) / 5),
      birthInfo: {
        year: parseInt(appliedCustomer.birth_date.split('-')[0]),
        month: parseInt(appliedCustomer.birth_date.split('-')[1]),
        day: parseInt(appliedCustomer.birth_date.split('-')[2]),
        hour: parseInt(appliedCustomer.birth_time.split(':')[0]),
        minute: parseInt(appliedCustomer.birth_time.split(':')[1]),
        isLunar: appliedCustomer.lunar_solar === 'lunar',
        gender: appliedCustomer.gender,
      },
      fourPillars,
      sixAreas: {
        career: customerSajuData.ohHaengBalance?.화 || 0,
        wealth: customerSajuData.ohHaengBalance?.금 || 0,
        health: customerSajuData.ohHaengBalance?.수 || 0,
        relationships: customerSajuData.ohHaengBalance?.목 || 0,
        study: customerSajuData.ohHaengBalance?.토 || 0,
        family: 50,
      },
    };

    console.log('🤖 [AI 버튼] analysisResult 생성 완료');
    return result;
  }, [customerSajuData, fourPillars, appliedCustomer]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-2 flex-wrap">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              🔮 통합 사주 레이더 분석
            </h1>
            <button
              onClick={() => setShowGuide(true)}
              className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center gap-2"
            >
              <span>📖</span>
              <span>초보자 가이드</span>
            </button>
            {/* AI 버튼 디버깅 */}
            {(() => {
              console.log('🔍 [AI 버튼 렌더링 체크]', {
                appliedCustomer: !!appliedCustomer,
                customerSajuData: !!customerSajuData,
                fourPillars: !!fourPillars,
                analysisResult: !!analysisResult,
                모두충족: !!(appliedCustomer && customerSajuData && fourPillars && analysisResult)
              });
              return null;
            })()}
            {appliedCustomer && fourPillars && (
              <button
                onClick={() => setShowAIChat(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <span>🤖</span>
                <span>AI에게 질문하기</span>
              </button>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            주문차트 기반 9개 대항목 상세 분석 시스템
          </p>
          <div className="mt-2 text-sm text-purple-600 dark:text-purple-400">
            기존 6대/17대/7대 성향 차트가 통합된 새로운 분석 시스템
          </div>
        </div>

        {/* 고객 선택 */}
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="flex items-center justify-center gap-3">
            <CustomerSelector
              onSelect={setSelectedCustomer}
              selectedCustomer={selectedCustomer}
            />
            {selectedCustomer && (
              <button
                onClick={handleApplyCustomer}
                disabled={!hasUnappliedChanges}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  hasUnappliedChanges
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl animate-pulse'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                {hasUnappliedChanges ? '✨ 적용하기' : '✓ 적용됨'}
              </button>
            )}
          </div>
          {appliedCustomer && (
            <div className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
              💡 현재 <strong>{appliedCustomer.name}</strong>님({appliedCustomer.birth_date}) 기준으로 분석 중
            </div>
          )}
          {selectedCustomer && hasUnappliedChanges && (
            <div className="mt-2 text-sm text-center text-orange-600 dark:text-orange-400 font-medium">
              ⚠️ <strong>{selectedCustomer.name}</strong>님으로 변경하려면 "적용하기" 버튼을 클릭하세요
            </div>
          )}
          {appliedCustomer && customerSajuData && (
            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-sm text-purple-700 dark:text-purple-300">
                <div className="font-semibold mb-1">사주 팔자:</div>
                <div>{customerSajuData.fullSaju}</div>
                <div className="mt-2 grid grid-cols-5 gap-2 text-xs">
                  <div>목: {customerSajuData.ohHaengBalance?.목}%</div>
                  <div>화: {customerSajuData.ohHaengBalance?.화}%</div>
                  <div>토: {customerSajuData.ohHaengBalance?.토}%</div>
                  <div>금: {customerSajuData.ohHaengBalance?.금}%</div>
                  <div>수: {customerSajuData.ohHaengBalance?.수}%</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 🔥 100년 인생운세 차트 버튼 - 적용된 고객 선택 후 표시 */}
        {appliedCustomer && (
          <div className="mb-6">
            <LifeChartButton
              customer={appliedCustomer}
              lifetimeFortune={lifetimeFortune}
              loading={lifeChartLoading}
              error={lifeChartError}
              onLoadChart={() => loadLifeChartForCustomer(appliedCustomer)}
              onScrollToChart={() => document.getElementById('hundred-year-chart')?.scrollIntoView({ behavior: 'smooth' })}
            />
          </div>
        )}

        {/* 🔥 100년 인생운세 차트 - 데이터 로드 시 표시 */}
        {lifetimeFortune && appliedCustomer && (
          <div id="hundred-year-chart" className="mb-8">
            <HundredYearChart
              data={lifetimeFortune.data.lifetimeFortune}
              currentAge={calculateCurrentAge(appliedCustomer.birth_date)}
              birthYear={new Date(appliedCustomer.birth_date).getFullYear()}
            />
          </div>
        )}

        {/* 💚 12대 건강 시스템 차트 - 완전한 사주 데이터가 있을 때만 표시 */}
        {appliedCustomer && customerSajuData && !customerSajuData._isMinimal && (
          <div id="health-system-chart" className="mb-8">
            <HealthRadarChart
              sajuData={customerSajuData}
              birthYear={new Date(appliedCustomer.birth_date).getFullYear()}
              birthDate={birthDate}
            />
          </div>
        )}

        {/* 💰 9대 재물운 시스템 차트 - 완전한 사주 데이터가 있을 때만 표시 */}
        {appliedCustomer && customerSajuData && !customerSajuData._isMinimal && (
          <div id="wealth-system-chart" className="mb-8">
            <WealthRadarChart
              sajuData={customerSajuData}
              birthYear={new Date(appliedCustomer.birth_date).getFullYear()}
              birthDate={birthDate}
            />
          </div>
        )}

        {/* 🤝 7대 인간관계운 시스템 차트 - 완전한 사주 데이터가 있을 때만 표시 */}
        {appliedCustomer && customerSajuData && !customerSajuData._isMinimal && (
          <div id="relationship-system-chart" className="mb-8">
            <RelationshipRadarChart
              sajuData={customerSajuData}
              birthYear={new Date(appliedCustomer.birth_date).getFullYear()}
              birthDate={birthDate}
            />
          </div>
        )}

        {/* 카테고리 로딩 상태 */}
        {isLoadingCategories && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" />
              <span className="text-blue-700 dark:text-blue-300 font-medium">
                🔮 주능/주흉 카테고리 데이터를 백엔드에서 가져오는 중...
              </span>
            </div>
          </div>
        )}

        {/* 대항목 네비게이션 */}
        <SajuCategoryNavigation
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* 선택된 카테고리 정보 */}
        {currentCategory && (
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{currentCategory.icon}</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentCategory.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {currentCategory.description}
                </p>
                <div className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                  {currentCategory.subcategories.length}개 중항목 • 총 {
                    currentCategory.subcategories.reduce((sum, sub) => sum + sub.items.length, 0)
                  }개 세부항목
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 중항목 탭 */}
        {currentCategory && (
          <SajuSubcategoryTabs
            subcategories={currentCategory.subcategories}
            selectedSubcategory={selectedSubcategory}
            onSubcategoryChange={setSelectedSubcategory}
          />
        )}

        {/* 통합 레이더차트 */}
        {chartData && (
          <div className="mb-8">
            <UnifiedSajuRadarChart
              data={chartData}
              birthDate={birthDate}
              sajuData={customerSajuData}
            />
          </div>
        )}

        {/* 하단 정보 */}
        <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>
            ✨ 이 분석은 전통 사주학과 현대 통계학을 결합한 해석입니다.
          </p>
          <p className="mt-1">
            💡 시간대별 운세 변화는 참고용이며, 개인의 노력과 환경에 따라 달라질 수 있습니다.
          </p>
        </div>

        {/* 통계 정보 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">9</div>
            <div className="text-sm">대항목</div>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">
              {categories.reduce((sum, cat) => sum + cat.subcategories.length, 0)}
            </div>
            <div className="text-sm">중항목</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">
              {categories.reduce((sum, cat) => 
                sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.items.length, 0), 0,
              )}
            </div>
            <div className="text-sm">세부항목</div>
          </div>
        </div>

        {/* AI 채팅 모달 */}
        {showAIChat && appliedCustomer && fourPillars && (
          <SajuAIChat
            customer={appliedCustomer}
            fourPillars={fourPillars}
            analysisResult={analysisResult || {
              fiveElements: customerSajuData?.ohHaengBalance || {},
              tenGods: customerSajuData?.sipSungBalance || {},
              fourPillars,
              birthInfo: {
                year: parseInt(appliedCustomer.birth_date.split('-')[0]),
                month: parseInt(appliedCustomer.birth_date.split('-')[1]),
                day: parseInt(appliedCustomer.birth_date.split('-')[2]),
                hour: parseInt(appliedCustomer.birth_time.split(':')[0]),
                minute: parseInt(appliedCustomer.birth_time.split(':')[1]),
                isLunar: appliedCustomer.lunar_solar === 'lunar',
                gender: appliedCustomer.gender,
              }
            } as any}
            onClose={() => setShowAIChat(false)}
          />
        )}

        {/* 초보자 가이드 모달 */}
        {showGuide && (
          <SajuBeginnerGuide onClose={() => setShowGuide(false)} />
        )}

      </div>
    </div>
  );
}