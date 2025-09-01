import { useState, useEffect, useMemo } from 'react';
import { SAJU_RADAR_CATEGORIES, setGlobalSajuData } from '@/data/sajuRadarData';
import { SajuRadarData } from '@/types/sajuRadar';
import SajuCategoryNavigation from '@/components/saju/SajuCategoryNavigation';
import SajuSubcategoryTabs from '@/components/saju/SajuSubcategoryTabs';
import UnifiedSajuRadarChart from '@/components/saju/charts/UnifiedSajuRadarChart';
import CustomerSelector from '@/components/saju/CustomerSelector';
import { Customer, getCustomerById } from '@/services/customerApi';

export default function UnifiedSajuAnalysisPage() {
  const [selectedCategory, setSelectedCategory] = useState('jubon');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSajuData, setCustomerSajuData] = useState<any>(null);

  const currentCategory = SAJU_RADAR_CATEGORIES.find(cat => cat.id === selectedCategory);

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

  const loadCustomerSajuData = async (customerId: number) => {
    try {
      console.log('[데이터 로드 시작] 고객 ID:', customerId);
      const response = await getCustomerById(customerId);
      console.log('[API 응답]', response.data);
      const sajuData = response.data.saju_data;
      console.log('[사주 데이터 수신]', sajuData);
      
      setCustomerSajuData(sajuData);
      // 전역 사주 데이터 설정 (모든 차트에 반영)
      setGlobalSajuData(sajuData);
      console.log('[전역 사주 데이터 설정 완료]', sajuData);
    } catch (error) {
      console.error('[에러] 고객 사주 데이터 로딩 실패:', error);
      setGlobalSajuData(null);
    }
  };

  // 현재 선택된 차트 데이터 생성
  const chartData: SajuRadarData | null = useMemo(() => {
    if (!currentCategory || !selectedSubcategory) return null;

    const subcategory = currentCategory.subcategories.find(
      sub => sub.id === selectedSubcategory
    );

    if (!subcategory) return null;

    return {
      categoryId: selectedCategory,
      subcategoryId: selectedSubcategory,
      title: `${currentCategory.name} - ${subcategory.name}`,
      items: subcategory.items,
      chartData: subcategory.items.map(item => item.baseScore),
      maxValue: 100
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

        {/* 대항목 네비게이션 */}
        <SajuCategoryNavigation
          categories={SAJU_RADAR_CATEGORIES}
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
            {console.log('[차트 렌더링] customerSajuData:', customerSajuData)}
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
              {SAJU_RADAR_CATEGORIES.reduce((sum, cat) => sum + cat.subcategories.length, 0)}
            </div>
            <div className="text-sm">중항목</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">
              {SAJU_RADAR_CATEGORIES.reduce((sum, cat) => 
                sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.items.length, 0), 0
              )}
            </div>
            <div className="text-sm">세부항목</div>
          </div>
        </div>

      </div>
    </div>
  );
}