import React, { useState } from 'react';
import SajuInputForm from '@/components/saju/SajuInputForm';
import SixAreaChart from '@/components/saju/charts/SixAreaChart';
import { SajuBirthInfo, SajuAnalysisResult } from '@/types/saju';

const SajuAnalysisPage: React.FC = () => {
  const [birthInfo, setBirthInfo] = useState<SajuBirthInfo | null>(null);
  const [analysisResult, setAnalysisResult] = useState<SajuAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

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
    
    return `${info.year}년 ${info.month}월 ${info.day}일 ${info.hour}시 ${info.minute}분 (${weekday}요일) ${info.isLunar ? '음력' : '양력'}`;
  };

  const formatFourPillars = (pillars: any) => {
    return `${pillars.year.heavenly}${pillars.year.earthly}년 ${pillars.month.heavenly}${pillars.month.earthly}월 ${pillars.day.heavenly}${pillars.day.earthly}일 ${pillars.hour.heavenly}${pillars.hour.earthly}시`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 페이지 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            📜 전문 사주 분석
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            생년월일시를 입력하면 30가지 전문 차트로 운명을 분석합니다
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 입력 폼 */}
          <div className="lg:col-span-1">
            <SajuInputForm onSubmit={analyzeSaju} />
            
            {/* 분석 정보 표시 */}
            {birthInfo && analysisResult && !loading && (
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                  📋 분석 정보
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">이름:</span>
                    <span className="ml-2 text-gray-800 dark:text-gray-200 font-medium">
                      {birthInfo.name || '미입력'}
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
                    <button className="w-full text-left px-3 py-2 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg">
                      ▶ 6대 영역 분석
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      오행 균형도
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      십성 분포도
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      대운 흐름도
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      월별 운세
                    </button>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      ... 25개 차트 더보기
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 오른쪽: 차트 표시 영역 */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">사주를 분석하고 있습니다...</p>
                </div>
              </div>
            ) : analysisResult ? (
              <div className="space-y-8">
                {/* 6대 영역 차트 */}
                <SixAreaChart 
                  scores={analysisResult.sixAreas}
                  birthDate={formatBirthDate(birthInfo!)}
                />

                {/* 17대 운세 버튼 */}
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={() => window.location.href = '/saju/detailed'}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xl">🔮</span>
                      <span className="font-semibold">17대 세부운세 상세분석 보기</span>
                      <span className="text-xl">→</span>
                    </span>
                  </button>
                  
                  <button
                    onClick={() => window.location.href = '/saju/personality'}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xl">🧠</span>
                      <span className="font-semibold">7대 성향 분석 보기</span>
                      <span className="text-xl">→</span>
                    </span>
                  </button>
                </div>

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