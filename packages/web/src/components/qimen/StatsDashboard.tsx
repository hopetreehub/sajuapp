import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Radar, Doughnut } from 'react-chartjs-2';
import { useQimenStats } from '@/hooks/useQimenStats';
import { useQimenBookmarkStore } from '@/stores/qimenBookmarkStore';
import {
  analyzeUserPatterns,
  sortPatternsByImportance,
  filterActionablePatterns,
  type QimenPattern,
} from '@/utils/qimenPatternAI';
import type { QimenContext } from '@/data/qimenContextWeights';
import type { Direction } from '@/types/qimen';

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StatsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 귀문둔갑 통계 대시보드 컴포넌트
 *
 * 사용자의 북마크 데이터를 분석하여 다양한 통계, 패턴, 예측을 시각화합니다.
 */
export default function StatsDashboard({ isOpen, onClose }: StatsDashboardProps) {
  const stats = useQimenStats();
  const { getAllBookmarks } = useQimenBookmarkStore();
  const bookmarks = getAllBookmarks();

  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'predictions' | 'charts'>(
    'overview'
  );

  // AI 분석 실행
  const analysis = useMemo(() => {
    return analyzeUserPatterns(bookmarks, stats);
  }, [bookmarks, stats]);

  const sortedPatterns = useMemo(() => {
    return sortPatternsByImportance(analysis.patterns);
  }, [analysis.patterns]);

  const actionablePatterns = useMemo(() => {
    return filterActionablePatterns(analysis.patterns);
  }, [analysis.patterns]);

  if (!isOpen) return null;

  // ESC 키로 닫기
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // 차트 색상 (다크모드 지원)
  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#e5e7eb' : '#374151';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  // 월간 트렌드 차트 데이터
  const monthlyChartData = {
    labels: stats.monthlyPatterns.map((m) => m.month),
    datasets: [
      {
        label: '평균 점수',
        data: stats.monthlyPatterns.map((m) => m.avgScore),
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // 시간대별 차트 데이터
  const hourlyChartData = {
    labels: stats.hourlyDistribution.map((h) => `${String(h.hour).padStart(2, '0')}:00`),
    datasets: [
      {
        label: '평균 점수',
        data: stats.hourlyDistribution.map((h) => h.avgScore),
        backgroundColor: stats.hourlyDistribution.map((h) =>
          h.avgScore >= 70
            ? 'rgba(34, 197, 94, 0.8)'
            : h.avgScore >= 50
            ? 'rgba(59, 130, 246, 0.8)'
            : h.avgScore >= 30
            ? 'rgba(251, 191, 36, 0.8)'
            : 'rgba(239, 68, 68, 0.8)'
        ),
      },
    ],
  };

  // 방향별 레이더 차트 데이터
  const directionChartData = {
    labels: stats.directionStats.map((d) => d.direction),
    datasets: [
      {
        label: '방향별 평균 점수',
        data: stats.directionStats.map((d) => d.avgScore),
        backgroundColor: 'rgba(147, 51, 234, 0.2)',
        borderColor: 'rgb(147, 51, 234)',
        borderWidth: 2,
      },
    ],
  };

  // 컨텍스트별 차트 데이터
  const contextNames: Record<QimenContext, string> = {
    business: '사업/투자',
    meeting: '회의/협상',
    travel: '여행/이동',
    study: '학습/시험',
    health: '건강/치료',
    relationship: '인간관계',
    decision: '중요결정',
    lawsuit: '소송/법률',
  };

  const contextChartData = {
    labels: stats.contextStats.map((c) => contextNames[c.context]),
    datasets: [
      {
        label: '평균 점수',
        data: stats.contextStats.map((c) => c.avgScore),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(147, 51, 234, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(20, 184, 166, 0.8)',
          'rgba(249, 115, 22, 0.8)',
        ],
      },
    ],
  };

  // 운세 레벨 분포 도넛 차트
  const levelCounts = {
    excellent: bookmarks.filter((b) => b.chart.overallFortune.level === 'excellent').length,
    good: bookmarks.filter((b) => b.chart.overallFortune.level === 'good').length,
    neutral: bookmarks.filter((b) => b.chart.overallFortune.level === 'neutral').length,
    bad: bookmarks.filter((b) => b.chart.overallFortune.level === 'bad').length,
    terrible: bookmarks.filter((b) => b.chart.overallFortune.level === 'terrible').length,
  };

  const levelChartData = {
    labels: ['대길', '길', '평', '흉', '대흉'],
    datasets: [
      {
        data: [levelCounts.excellent, levelCounts.good, levelCounts.neutral, levelCounts.bad, levelCounts.terrible],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(156, 163, 175, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: textColor,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: textColor },
        grid: { color: gridColor },
      },
      y: {
        ticks: { color: textColor },
        grid: { color: gridColor },
        min: 0,
        max: 100,
      },
    },
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: textColor,
        },
      },
    },
    scales: {
      r: {
        ticks: { color: textColor },
        grid: { color: gridColor },
        min: 0,
        max: 100,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: textColor,
        },
      },
    },
  };

  // 패턴 아이콘
  const getPatternIcon = (pattern: QimenPattern) => {
    switch (pattern.type) {
      case 'insight':
        return '💡';
      case 'recommendation':
        return '✅';
      case 'prediction':
        return '🔮';
      case 'warning':
        return '⚠️';
    }
  };

  // 패턴 색상
  const getPatternColor = (pattern: QimenPattern) => {
    switch (pattern.type) {
      case 'insight':
        return 'blue';
      case 'recommendation':
        return 'green';
      case 'prediction':
        return 'purple';
      case 'warning':
        return 'yellow';
    }
  };

  // 트렌드 아이콘
  const getTrendIcon = () => {
    switch (analysis.summary.overallTrend) {
      case 'improving':
        return '📈';
      case 'stable':
        return '➡️';
      case 'declining':
        return '📉';
    }
  };

  const getTrendText = () => {
    switch (analysis.summary.overallTrend) {
      case 'improving':
        return '상승 추세';
      case 'stable':
        return '안정적';
      case 'declining':
        return '하락 추세';
    }
  };

  const getTrendColor = () => {
    switch (analysis.summary.overallTrend) {
      case 'improving':
        return 'text-green-600 dark:text-green-400';
      case 'stable':
        return 'text-blue-600 dark:text-blue-400';
      case 'declining':
        return 'text-red-600 dark:text-red-400';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="max-w-7xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              📊 귀문둔갑 통계 대시보드
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              총 {stats.totalChecks}개의 데이터 분석 | 평균 점수: {stats.averageScore}점 |{' '}
              데이터 품질: {analysis.summary.dataQuality === 'excellent' ? '우수' : analysis.summary.dataQuality === 'good' ? '양호' : analysis.summary.dataQuality === 'fair' ? '보통' : '부족'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
          {[
            { id: 'overview', label: '📋 개요', icon: '📋' },
            { id: 'patterns', label: '🔍 패턴 분석', icon: '🔍' },
            { id: 'predictions', label: '🔮 예측', icon: '🔮' },
            { id: 'charts', label: '📊 차트', icon: '📊' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 콘텐츠 */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* 개요 탭 */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 기본 통계 카드 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                  <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">총 조회수</div>
                  <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                    {stats.totalChecks}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">평균 점수</div>
                  <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                    {stats.averageScore}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="text-sm text-green-600 dark:text-green-400 mb-1">최고 점수</div>
                  <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                    {stats.highestScore}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                  <div className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">최저 점수</div>
                  <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
                    {stats.lowestScore}
                  </div>
                </div>
              </div>

              {/* 트렌드 및 추천사항 */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-700 p-5 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    {getTrendIcon()} 전반적 트렌드
                  </h3>
                  <div className={`text-2xl font-bold ${getTrendColor()}`}>
                    {getTrendText()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    신뢰도: {analysis.summary.trendConfidence}%
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-700 p-5 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-gray-100">
                    ⭐ 주요 인사이트
                  </h3>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400">최적 시간대:</span>{' '}
                      <span className="font-semibold text-gray-700 dark:text-gray-200">
                        {stats.bestTimeOfDay}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400">선호 방향:</span>{' '}
                      <span className="font-semibold text-gray-700 dark:text-gray-200">
                        {stats.favoriteDirection}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400">주요 용도:</span>{' '}
                      <span className="font-semibold text-gray-700 dark:text-gray-200">
                        {contextNames[stats.mostFrequentContext]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 추천 시간대 */}
              {analysis.recommendations.bestTimes.length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-lg border border-green-200 dark:border-green-700">
                  <h3 className="text-lg font-bold mb-3 text-green-800 dark:text-green-200">
                    ✅ 추천 시간대
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.recommendations.bestTimes.map((time, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full text-sm font-medium"
                      >
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 주의 시간대 */}
              {analysis.recommendations.avoidTimes.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 p-5 rounded-lg border border-red-200 dark:border-red-700">
                  <h3 className="text-lg font-bold mb-3 text-red-800 dark:text-red-200">
                    ⚠️ 주의 필요 시간대
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.recommendations.avoidTimes.map((time, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full text-sm font-medium"
                      >
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 패턴 분석 탭 */}
          {activeTab === 'patterns' && (
            <div className="space-y-4">
              {sortedPatterns.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <div className="text-6xl mb-4">📊</div>
                  <p>분석할 패턴이 충분하지 않습니다.</p>
                  <p className="text-sm mt-2">30일 이상의 데이터를 수집하면 더 정확한 분석이 가능합니다.</p>
                </div>
              ) : (
                sortedPatterns.map((pattern) => {
                  const color = getPatternColor(pattern);
                  const colorClasses = {
                    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700',
                    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700',
                    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700',
                    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700',
                  };

                  return (
                    <div
                      key={pattern.id}
                      className={`p-5 rounded-lg border ${colorClasses[color]}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{getPatternIcon(pattern)}</span>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                              {pattern.title}
                            </h3>
                            {pattern.actionable && (
                              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                                실행 가능
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 mb-3">
                            {pattern.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500 dark:text-gray-400">신뢰도:</span>
                              <span className="font-semibold text-gray-700 dark:text-gray-200">
                                {pattern.confidence}%
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500 dark:text-gray-400">중요도:</span>
                              <span
                                className={`font-semibold ${
                                  pattern.importance === 'high'
                                    ? 'text-red-600 dark:text-red-400'
                                    : pattern.importance === 'medium'
                                    ? 'text-yellow-600 dark:text-yellow-400'
                                    : 'text-gray-600 dark:text-gray-400'
                                }`}
                              >
                                {pattern.importance === 'high' ? '높음' : pattern.importance === 'medium' ? '중간' : '낮음'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 예측 탭 */}
          {activeTab === 'predictions' && (
            <div className="space-y-4">
              {analysis.predictions.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <div className="text-6xl mb-4">🔮</div>
                  <p>예측을 생성하기에 데이터가 부족합니다.</p>
                  <p className="text-sm mt-2">30일 이상의 데이터를 수집하면 미래 운세를 예측할 수 있습니다.</p>
                </div>
              ) : (
                <>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-lg border border-purple-200 dark:border-purple-700 mb-6">
                    <h3 className="text-lg font-bold mb-2 text-purple-800 dark:text-purple-200">
                      🔮 다음 7일간 최적 시간대 예측
                    </h3>
                    <p className="text-sm text-purple-600 dark:text-purple-400">
                      과거 패턴을 기반으로 AI가 예측한 결과입니다. 실제 운세는 다를 수 있습니다.
                    </p>
                  </div>

                  {analysis.predictions.map((pred, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-700 p-5 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                            {pred.date.toLocaleDateString('ko-KR', {
                              month: 'long',
                              day: 'numeric',
                              weekday: 'short',
                            })}
                          </h4>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {pred.timeRange}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-3xl font-bold ${
                              pred.predictedScore >= 70
                                ? 'text-green-600 dark:text-green-400'
                                : pred.predictedScore >= 50
                                ? 'text-blue-600 dark:text-blue-400'
                                : pred.predictedScore >= 30
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {pred.predictedScore}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            신뢰도: {pred.confidence}%
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="text-sm">
                          <span className="text-gray-500 dark:text-gray-400">추천 용도:</span>{' '}
                          <span className="font-semibold text-gray-700 dark:text-gray-200">
                            {contextNames[pred.suggestedContext]}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500 dark:text-gray-400">추천 방향:</span>{' '}
                          <span className="font-semibold text-gray-700 dark:text-gray-200">
                            {pred.suggestedDirection}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          예측 근거:
                        </div>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {pred.reasons.map((reason, ridx) => (
                            <li key={ridx}>• {reason}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* 차트 탭 */}
          {activeTab === 'charts' && (
            <div className="space-y-6">
              {stats.totalChecks === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <div className="text-6xl mb-4">📊</div>
                  <p>표시할 데이터가 없습니다.</p>
                  <p className="text-sm mt-2">귀문둔갑 분석을 북마크하면 통계 차트를 확인할 수 있습니다.</p>
                </div>
              ) : (
                <>
                  {/* 월간 트렌드 */}
                  {stats.monthlyPatterns.length > 0 && (
                    <div className="bg-white dark:bg-gray-700 p-5 rounded-lg border border-gray-200 dark:border-gray-600">
                      <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
                        📈 월간 평균 점수 추이
                      </h3>
                      <div style={{ height: '300px' }}>
                        <Line data={monthlyChartData} options={chartOptions} />
                      </div>
                    </div>
                  )}

                  {/* 시간대별 분포 */}
                  {stats.hourlyDistribution.length > 0 && (
                    <div className="bg-white dark:bg-gray-700 p-5 rounded-lg border border-gray-200 dark:border-gray-600">
                      <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
                        ⏰ 시간대별 평균 점수
                      </h3>
                      <div style={{ height: '300px' }}>
                        <Bar data={hourlyChartData} options={chartOptions} />
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* 방향별 레이더 차트 */}
                    {stats.directionStats.length > 0 && (
                      <div className="bg-white dark:bg-gray-700 p-5 rounded-lg border border-gray-200 dark:border-gray-600">
                        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
                          🧭 방향별 평균 점수
                        </h3>
                        <div style={{ height: '300px' }}>
                          <Radar data={directionChartData} options={radarOptions} />
                        </div>
                      </div>
                    )}

                    {/* 운세 레벨 분포 */}
                    <div className="bg-white dark:bg-gray-700 p-5 rounded-lg border border-gray-200 dark:border-gray-600">
                      <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
                        🎯 운세 레벨 분포
                      </h3>
                      <div style={{ height: '300px' }}>
                        <Doughnut data={levelChartData} options={doughnutOptions} />
                      </div>
                    </div>
                  </div>

                  {/* 컨텍스트별 차트 */}
                  {stats.contextStats.length > 0 && (
                    <div className="bg-white dark:bg-gray-700 p-5 rounded-lg border border-gray-200 dark:border-gray-600">
                      <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
                        📂 용도별 평균 점수
                      </h3>
                      <div style={{ height: '300px' }}>
                        <Bar data={contextChartData} options={chartOptions} />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            마지막 분석: {analysis.summary.analysisDate.toLocaleString('ko-KR')}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
