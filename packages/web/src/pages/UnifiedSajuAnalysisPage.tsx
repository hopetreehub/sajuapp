import { useState, useEffect, useMemo } from 'react';
import { SAJU_RADAR_CATEGORIES, setGlobalSajuData, loadDynamicSajuCategories } from '@/data/sajuRadarData';
import { SajuRadarData } from '@/types/sajuRadar';
import SajuCategoryNavigation from '@/components/saju/SajuCategoryNavigation';
import SajuSubcategoryTabs from '@/components/saju/SajuSubcategoryTabs';
import UnifiedSajuRadarChart from '@/components/saju/charts/UnifiedSajuRadarChart';
import CustomerSelector from '@/components/saju/CustomerSelector';
import { Customer, getCustomerById } from '@/services/customerApi';
import { calculateSajuData } from '@/utils/sajuDataCalculator';
import SajuAIChat from '@/components/saju/SajuAIChat';
import { calculateFourPillars } from '@/utils/sajuCalculator';
import { exportUnifiedSajuToPDF, formatDateForFilename } from '@/utils/pdfExport';
import SajuBeginnerGuide from '@/components/saju/SajuBeginnerGuide';

export default function UnifiedSajuAnalysisPage() {
  const [selectedCategory, setSelectedCategory] = useState('jubon');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSajuData, setCustomerSajuData] = useState<any>(null);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const currentCategory = SAJU_RADAR_CATEGORIES.find(cat => cat.id === selectedCategory);

  // PDF 출력 함수
  const handleExportPDF = async () => {
    if (!selectedCustomer) return;

    setIsExportingPDF(true);
    try {
      const date = formatDateForFilename();
      await exportUnifiedSajuToPDF(
        selectedCustomer.birth_date,
        selectedCustomer.birth_time,
        date,
      );
      alert('PDF 출력이 완료되었습니다.');
    } catch (error) {
      console.error('PDF 출력 실패:', error);
      alert('PDF 출력 중 오류가 발생했습니다.');
    } finally {
      setIsExportingPDF(false);
    }
  };

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

  // 컴포넌트 마운트 시 동적 카테고리 데이터 로드
  useEffect(() => {
    const loadCategories = async () => {
      if (!categoriesLoaded && !isLoadingCategories) {
        setIsLoadingCategories(true);
        try {
          await loadDynamicSajuCategories();
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

  const loadCustomerSajuData = async (customerId: number) => {
    try {

      const response = await getCustomerById(customerId);

      const customer = response.data;

      // saju_data가 문자열인 경우 JSON 파싱
      let sajuData = customer.saju_data;
      if (typeof sajuData === 'string') {
        try {
          sajuData = JSON.parse(sajuData);

        } catch (e) {
          console.error('[사주 데이터 파싱 실패]', e);
          sajuData = null;
        }
      }

      // saju_data가 없으면 고객 정보로 계산
      if (!sajuData) {

        const sajuBirthInfo = {
          year: parseInt(customer.birth_date.split('-')[0]),
          month: parseInt(customer.birth_date.split('-')[1]),
          day: parseInt(customer.birth_date.split('-')[2]),
          hour: parseInt(customer.birth_time.split(':')[0]),
          minute: parseInt(customer.birth_time.split(':')[1]),
          gender: customer.gender,
          isLunar: customer.lunar_solar === 'lunar',
        };
        sajuData = calculateSajuData(sajuBirthInfo);

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

  // 사주팔자 계산 (AI 채팅용)
  const fourPillars = useMemo(() => {
    if (!selectedCustomer) return null;

    const [year, month, day] = selectedCustomer.birth_date.split('-').map(Number);
    const [hour, minute] = selectedCustomer.birth_time.split(':').map(Number);

    return calculateFourPillars({
      year,
      month,
      day,
      hour,
      minute,
      isLunar: selectedCustomer.lunar_solar === 'lunar',
      gender: selectedCustomer.gender,
    });
  }, [selectedCustomer]);

  // 사주 분석 결과 (AI 채팅용)
  const analysisResult = useMemo(() => {
    if (!customerSajuData || !fourPillars || !selectedCustomer) return null;

    return {
      fiveElements: customerSajuData.ohHaengBalance || {},
      tenGods: customerSajuData.sipSungBalance || {},
      totalScore: Object.values(customerSajuData.ohHaengBalance || {}).reduce((sum: number, val: any) => sum + val, 0),
      averageScore: Math.round(Object.values(customerSajuData.ohHaengBalance || {}).reduce((sum: number, val: any) => sum + val, 0) / 5),
      birthInfo: {
        year: parseInt(selectedCustomer.birth_date.split('-')[0]),
        month: parseInt(selectedCustomer.birth_date.split('-')[1]),
        day: parseInt(selectedCustomer.birth_date.split('-')[2]),
        hour: parseInt(selectedCustomer.birth_time.split(':')[0]),
        minute: parseInt(selectedCustomer.birth_time.split(':')[1]),
        isLunar: selectedCustomer.lunar_solar === 'lunar',
        gender: selectedCustomer.gender,
      },
      fourPillars,
      sixAreas: {
        career: customerSajuData.ohHaengBalance?.화 || 0,
        wealth: customerSajuData.ohHaengBalance?.금 || 0,
        health: customerSajuData.ohHaengBalance?.수 || 0,
        relationships: customerSajuData.ohHaengBalance?.목 || 0,
        study: customerSajuData.ohHaengBalance?.토 || 0,
        family: 50, // 기본값
      },
    };
  }, [customerSajuData, fourPillars, selectedCustomer]);

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
            {selectedCustomer && customerSajuData && (
              <>
                <button
                  onClick={() => setShowAIChat(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <span>🤖</span>
                  <span>AI에게 질문하기</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={isExportingPDF}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-medium hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>📄</span>
                  <span>{isExportingPDF ? 'PDF 생성 중...' : 'PDF 출력'}</span>
                </button>
              </>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            주문차트 기반 9개 대항목 상세 분석 시스템
          </p>
          <div className="mt-2 text-sm text-purple-600 dark:text-purple-400">
            기존 6대/17대/7대 성향 차트가 통합된 새로운 분석 시스템
          </div>
        </div>

        {/* PDF 출력용 컨테이너 */}
        <div
          id="unified-saju-content"
          className="space-y-6"
          style={{
            /* PDF 출력 최적화 스타일 */
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
          }}
        >
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
                sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.items.length, 0), 0,
              )}
            </div>
            <div className="text-sm">세부항목</div>
          </div>
        </div>

        </div>

        {/* AI 채팅 모달 */}
        {showAIChat && selectedCustomer && fourPillars && analysisResult && (
          <SajuAIChat
            customer={selectedCustomer}
            fourPillars={fourPillars}
            analysisResult={analysisResult as any}
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