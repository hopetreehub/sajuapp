import React, { useState, useEffect } from 'react';
import { SajuBirthInfo } from '@/services/sajuAnalysisApi';

const TestComprehensiveScoresPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'base' | 'daily' | 'monthly' | 'yearly'>('base');

  const testBirthInfo: SajuBirthInfo = {
    user_id: 'test-comprehensive-user',
    birth_date: '1990-05-15', 
    birth_time: '14:30',
    is_lunar: false,
  };

  const fetchAnalysis = async (selectedTimeframe: 'base' | 'daily' | 'monthly' | 'yearly') => {
    setLoading(true);
    setError(null);
    try {
      console.log('🎯 종합 분석 요청 중...', { timeframe: selectedTimeframe });
      
      // API 직접 호출하여 원본 데이터 받기
      const response = await fetch('http://localhost:4015/api/saju/scores/comprehensive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testBirthInfo),
      });
      
      const result = await response.json();
      console.log('✅ 종합 분석 결과:', result);
      setAnalysisData(result.data);
    } catch (err) {
      console.error('❌ 분석 실패:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis(timeframe);
  }, [timeframe]);

  const timeframeLabels = {
    base: '기본 사주',
    daily: '오늘의 운세',
    monthly: '이달의 운세', 
    yearly: '올해의 운세',
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          🔮 종합 점수 시스템 테스트
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          신규 API를 사용한 주능/주흉 분석 (중복 제거 완료)
        </p>
      </div>

      {/* 시점 선택 버튼 */}
      <div className="mb-8 flex justify-center space-x-4">
        {(['base', 'daily', 'monthly', 'yearly'] as const).map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              timeframe === tf 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {timeframeLabels[tf]}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">분석 중...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>오류:</strong> {error}
        </div>
      )}

      {analysisData && (
        <div className="space-y-8">
          {/* 종합 요약 */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">📊 종합 분석 결과</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{analysisData.summary.overall_fortune}점</div>
                <div className="text-sm opacity-90">전체 운세</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold capitalize">{analysisData.summary.trend}</div>
                <div className="text-sm opacity-90">추세</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{analysisData.summary.recommendations.length}개</div>
                <div className="text-sm opacity-90">추천사항</div>
              </div>
            </div>
            {analysisData.summary.recommendations.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">💡 추천사항:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {analysisData.summary.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-sm opacity-90">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 주능 카테고리 */}
          {analysisData.positive_scores && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-4">
                ⚡ 주능 (긍정적 능력)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(analysisData.positive_scores).map(([categoryName, categoryData]: [string, any]) => (
                  <div key={categoryName} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-white">
                      🎯 {categoryName}
                    </h3>
                    <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                      <div>기본: {categoryData.base_score}점</div>
                      <div>오늘: {categoryData.daily_score}점</div>
                      <div>이달: {categoryData.monthly_score}점</div>
                      <div>올해: {categoryData.yearly_score}점</div>
                    </div>
                    <div className="space-y-2">
                      {categoryData.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {item.name}
                          </span>
                          <span className="font-bold text-green-600 dark:text-green-400">
                            {item.score}점
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 주흉 카테고리 */}
          {analysisData.negative_scores && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
                ⚠️ 주흉 (주의사항)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(analysisData.negative_scores).map(([categoryName, categoryData]: [string, any]) => (
                  <div key={categoryName} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-white">
                      ⚠️ {categoryName}
                    </h3>
                    <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                      <div>기본: {categoryData.base_score}점</div>
                      <div>오늘: {categoryData.daily_score}점</div>
                      <div>이달: {categoryData.monthly_score}점</div>
                      <div>올해: {categoryData.yearly_score}점</div>
                    </div>
                    <div className="space-y-2">
                      {categoryData.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {item.name}
                          </span>
                          <span className="font-bold text-red-600 dark:text-red-400">
                            {item.score}점
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 디버그 정보 */}
          <details className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
            <summary className="cursor-pointer font-semibold text-gray-700 dark:text-gray-300">
              🔧 디버그 정보 (개발자용)
            </summary>
            <pre className="mt-4 text-xs bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">
              {JSON.stringify(analysisData, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default TestComprehensiveScoresPage;