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

export default function UnifiedSajuAnalysisPageWithLifeChart() {
  const [selectedCategory, setSelectedCategory] = useState('jubon');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSajuData, setCustomerSajuData] = useState<any>(null);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [lifetimeFortune, setLifetimeFortune] = useState<LifetimeFortuneResponse | null>(null);
  const [lifeChartLoading, setLifeChartLoading] = useState(false);
  const [lifeChartError, setLifeChartError] = useState<string | null>(null);
  const [categories, setCategories] = useState<SajuRadarCategory[]>(SAJU_RADAR_CATEGORIES);

  // 정확한 나이 계산 함수
  const calculateCurrentAge = (birthDate: string): number => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    // 생일이 아직 안 지났으면 1 빼기
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age + 1; // 한국 나이 계산 (태어나면 1살)
  };


  const currentCategory = categories.find(cat => cat.id === selectedCategory);

  // 카테고리 변경 시 첫 번째 중항목 자동 선택
  useEffect(() => {
    if (currentCategory && currentCategory.subcategories.length > 0) {
      setSelectedSubcategory(currentCategory.subcategories[0].id);
    }
  }, [selectedCategory, currentCategory]);

  // 고객 선택 시 사주 데이터 로드
  useEffect(() => {
    if (selectedCustomer?.id) {
      loadCustomerSajuData(selectedCustomer.id);
    } else {
      setCustomerSajuData(null);
      setGlobalSajuData(null); // 전역 사주 데이터도 초기화
    }
  }, [selectedCustomer]);

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

      const response = await getCustomerById(customerId);

      // saju_data가 문자열인 경우 JSON 파싱
      let sajuData = response.data.saju_data;
      if (typeof sajuData === 'string') {
        try {
          sajuData = JSON.parse(sajuData);

        } catch (e) {
          console.error('[사주 데이터 파싱 실패]', e);
          sajuData = null;
        }
      }

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

  // 생년월일 정보
  const birthDate = selectedCustomer 
    ? `${selectedCustomer.birth_date} ${selectedCustomer.birth_time}`
    : '고객을 선택해주세요';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🔮 통합 사주 레이더 분석
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            주문차트 기반 9개 대항목 상세 분석 시스템
          </p>
          <div className="mt-2 text-sm text-purple-600 dark:text-purple-400">
            기존 6대/17대/7대 성향 차트가 통합된 새로운 분석 시스템
          </div>
        </div>

        {/* 고객 선택 */}
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <CustomerSelector 
            onSelect={setSelectedCustomer}
            selectedCustomer={selectedCustomer}
          />
          {selectedCustomer && customerSajuData && (
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

        {/* 🔥 100년 인생운세 차트 버튼 - 고객 선택 후 표시 */}
        {selectedCustomer && (
          <div className="mb-6">
            <LifeChartButton
              customer={selectedCustomer}
              lifetimeFortune={lifetimeFortune}
              loading={lifeChartLoading}
              error={lifeChartError}
              onLoadChart={() => loadLifeChartForCustomer(selectedCustomer)}
              onScrollToChart={() => document.getElementById('hundred-year-chart')?.scrollIntoView({ behavior: 'smooth' })}
            />
          </div>
        )}

        {/* 🔥 100년 인생운세 차트 - 데이터 로드 시 표시 */}
        {lifetimeFortune && selectedCustomer && (
          <div id="hundred-year-chart" className="mb-8">
            <HundredYearChart
              data={lifetimeFortune.data.lifetimeFortune}
              currentAge={calculateCurrentAge(selectedCustomer.birth_date)}
              birthYear={new Date(selectedCustomer.birth_date).getFullYear()}
            />
          </div>
        )}

        {/* 💚 12대 건강 시스템 차트 - 고객 선택 및 사주 데이터 로드 시 표시 */}
        {selectedCustomer && customerSajuData && (
          <div id="health-system-chart" className="mb-8">
            <HealthRadarChart
              sajuData={customerSajuData}
              birthYear={new Date(selectedCustomer.birth_date).getFullYear()}
              birthDate={birthDate}
            />
          </div>
        )}

        {/* 💰 9대 재물운 시스템 차트 - 고객 선택 및 사주 데이터 로드 시 표시 */}
        {selectedCustomer && customerSajuData && (
          <div id="wealth-system-chart" className="mb-8">
            <WealthRadarChart
              sajuData={customerSajuData}
              birthYear={new Date(selectedCustomer.birth_date).getFullYear()}
              birthDate={birthDate}
            />
          </div>
        )}

        {/* 🤝 7대 인간관계운 시스템 차트 - 고객 선택 및 사주 데이터 로드 시 표시 */}
        {selectedCustomer && customerSajuData && (
          <div id="relationship-system-chart" className="mb-8">
            <RelationshipRadarChart
              sajuData={customerSajuData}
              birthYear={new Date(selectedCustomer.birth_date).getFullYear()}
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

      </div>
    </div>
  );
}