/**
 * 7대 인간관계운 시스템 레이더 차트 컴포넌트
 *
 * 전통 명리학 인간관계론 기반 인간관계 분석 차트
 * @author Dr. Emma Rodriguez (심리학 전문가) + Jake Kim (프론트엔드 아키텍트)
 * @version 1.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { SajuData } from '@/utils/sajuScoreCalculator';
import {
  calculateRelationshipScores,
  ComprehensiveRelationshipReport,
} from '@/utils/relationshipScoreCalculator';
import { CHART_DESIGN_SYSTEM, getTimeFrameColors } from '@/constants/chartDesignSystem';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

type TimeFrame = 'base' | 'today' | 'month' | 'year';

interface RelationshipRadarChartProps {
  sajuData: SajuData;
  birthYear: number;
  birthDate?: string;
}

const RelationshipRadarChart: React.FC<RelationshipRadarChartProps> = ({
  sajuData,
  birthYear,
  birthDate,
}) => {
  // 다크모드 감지
  const [isDarkMode, setIsDarkMode] = useState(false);
  // 시간대 선택
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('base');

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // 인간관계운 점수 계산
  const relationshipReport = useMemo<ComprehensiveRelationshipReport>(() => {
    return calculateRelationshipScores(sajuData, birthYear);
  }, [sajuData, birthYear]);

  // 차트 데이터 준비
  const chartData = useMemo(() => {
    const labels = relationshipReport.systems.map(s => s.systemName);

    // 시간대별 점수 데이터
    const getScoresByTimeFrame = (timeFrame: TimeFrame): number[] => {
      switch (timeFrame) {
        case 'today':
          return relationshipReport.systems.map(s => s.todayScore);
        case 'month':
          return relationshipReport.systems.map(s => s.monthScore);
        case 'year':
          return relationshipReport.systems.map(s => s.yearScore);
        default:
          return relationshipReport.systems.map(s => s.baseScore);
      }
    };

    const baseScores = relationshipReport.systems.map(s => s.baseScore);
    const selectedScores = getScoresByTimeFrame(selectedTimeFrame);

    // 기본 데이터셋 (항상 표시)
    const baseColors = getTimeFrameColors('base');
    const datasets: any[] = [
      {
        label: '기본 인간관계운',
        data: baseScores,
        backgroundColor: baseColors.background,
        borderColor: baseColors.border,
        borderWidth: 2,
        pointBackgroundColor: baseColors.border,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: baseColors.border,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ];

    // 선택된 시간대 데이터셋 추가
    if (selectedTimeFrame !== 'base') {
      const selectedColors = getTimeFrameColors(selectedTimeFrame);
      const timeFrameLabels: Record<TimeFrame, string> = {
        base: '기본',
        today: '오늘의 인간관계운',
        month: '이달의 인간관계운',
        year: '올해의 인간관계운',
      };

      datasets.push({
        label: timeFrameLabels[selectedTimeFrame],
        data: selectedScores,
        backgroundColor: selectedColors.background,
        borderColor: selectedColors.border,
        borderWidth: 2,
        pointBackgroundColor: selectedColors.border,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: selectedColors.border,
        pointRadius: 4,
        pointHoverRadius: 6,
      });
    }

    return {
      labels,
      datasets,
    };
  }, [relationshipReport, selectedTimeFrame]);

  // 차트 옵션
  const options = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: selectedTimeFrame !== 'base',
          position: 'top' as const,
          labels: {
            color: isDarkMode ? '#E5E7EB' : '#374151',
            font: {
              size: 12,
              family: 'Pretendard, sans-serif',
            },
            padding: 15,
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
          titleColor: isDarkMode ? '#FFFFFF' : '#000000',
          bodyColor: isDarkMode ? '#FFFFFF' : '#000000',
          borderColor: isDarkMode ? '#6B7280' : '#D1D5DB',
          borderWidth: 1,
          callbacks: {
            label: (context: any) => {
              const systemIndex = context.dataIndex;
              const system = relationshipReport.systems[systemIndex];
              return [
                `${context.dataset.label}: ${context.parsed.r}점`,
                `조화도: ${system.harmony === 'excellent' ? '최고' :
                         system.harmony === 'good' ? '좋음' :
                         system.harmony === 'fair' ? '보통' : '주의'}`,
              ];
            },
          },
        },
      },
      scales: {
        r: {
          beginAtZero: true,
          min: 0,
          max: 100,
          ticks: {
            stepSize: 20,
            color: isDarkMode ? '#9CA3AF' : '#6B7280',
            backdropColor: 'transparent',
            font: {
              size: 11,
            },
          },
          grid: {
            color: isDarkMode ? '#374151' : '#E5E7EB',
          },
          pointLabels: {
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
            font: {
              size: 12,
              family: 'Pretendard, sans-serif',
              weight: 500,
            },
          },
        },
      },
    };
  }, [isDarkMode, selectedTimeFrame, relationshipReport]);

  // 통계 계산
  const stats = useMemo(() => {
    const scores = relationshipReport.systems.map(s => s.baseScore);
    const average = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
    const max = Math.max(...scores);
    const min = Math.min(...scores);

    const strongestSystem = relationshipReport.systems.find(s => s.baseScore === max);
    const weakestSystem = relationshipReport.systems.find(s => s.baseScore === min);

    return {
      average,
      max,
      min,
      strongestSystem,
      weakestSystem,
    };
  }, [relationshipReport]);

  return (
    <div className={CHART_DESIGN_SYSTEM.LAYOUT.chartContainer.wrapper}>
      {/* 헤더 */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          🤝 7대 인간관계운 시스템 분석
        </h3>
        {birthDate && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            출생정보: {birthDate}
          </p>
        )}
      </div>

      {/* 차트 */}
      <div className="mb-6" style={{ height: CHART_DESIGN_SYSTEM.DIMENSIONS.height }}>
        <Radar data={chartData} options={options} />
      </div>

      {/* 시간대 선택 버튼 */}
      <div className={`${CHART_DESIGN_SYSTEM.LAYOUT.timeFrameSelector.container} mb-6`}>
        {[
          { key: 'base' as TimeFrame, label: '기본' },
          { key: 'today' as TimeFrame, label: '오늘' },
          { key: 'month' as TimeFrame, label: '이달' },
          { key: 'year' as TimeFrame, label: '올해' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSelectedTimeFrame(key)}
            className={`${CHART_DESIGN_SYSTEM.BUTTON_STYLES.timeFrame.base} ${
              selectedTimeFrame === key
                ? CHART_DESIGN_SYSTEM.BUTTON_STYLES.timeFrame.active[key]
                : CHART_DESIGN_SYSTEM.BUTTON_STYLES.timeFrame.inactive
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 종합 분석 카드 */}
      <div className="space-y-4">
        {/* 전체 인간관계운 지수 */}
        <div className={`
          ${Number(stats.average) >= 70 ? 'bg-gradient-to-r from-blue-500 to-blue-700' :
            Number(stats.average) >= 50 ? 'bg-gradient-to-r from-green-500 to-green-700' :
            'bg-gradient-to-r from-orange-500 to-orange-700'}
          text-white rounded-xl p-6
        `}>
          <h4 className="text-lg font-semibold mb-2">🤝 전체 인간관계운 지수</h4>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.average}점</div>
              <div className="text-sm opacity-90">
                {Number(stats.average) >= 70 ? '✨ 매우 원만' :
                 Number(stats.average) >= 50 ? '🌟  양호' :
                 '⚠️ 노력 필요'}
              </div>
            </div>
            <div className="text-sm">
              <div>사회성: {relationshipReport.overall.socialSkill === 'high' ? '높음 📈' :
                            relationshipReport.overall.socialSkill === 'medium' ? '보통 ➡️' :
                            '개발 필요 📚'}</div>
              <div>갈등: {relationshipReport.overall.conflictLevel === 'low' ? '낮음 ✅' :
                          relationshipReport.overall.conflictLevel === 'medium' ? '보통 ⚠️' :
                          '주의 🚨'}</div>
            </div>
          </div>
        </div>

        {/* 인간관계 유형 */}
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
          <h5 className="font-semibold text-purple-800 dark:text-purple-300 mb-3">
            🎯 인간관계 유형
          </h5>
          <div className="space-y-2 text-sm">
            <div className="flex items-start">
              <span className="mr-2 text-blue-600">🏷️</span>
              <div className="text-purple-700 dark:text-purple-300">
                <span className="font-medium">유형:</span> {relationshipReport.personalityStyle.type}
              </div>
            </div>
            <div className="flex items-start">
              <span className="mr-2 text-green-600">📝</span>
              <div className="text-purple-700 dark:text-purple-300">
                <span className="font-medium">특징:</span> {relationshipReport.personalityStyle.description}
              </div>
            </div>
            <div className="flex items-start">
              <span className="mr-2 text-yellow-600">💡</span>
              <div className="text-purple-700 dark:text-purple-300">
                <span className="font-medium">최적 접근:</span> {relationshipReport.personalityStyle.bestApproach}
              </div>
            </div>
          </div>
        </div>

        {/* 강점/약점 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 강점 */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <h5 className="font-semibold text-green-800 dark:text-green-300 mb-2">
              💪 인간관계 강점
            </h5>
            <div className="text-sm text-green-700 dark:text-green-400">
              {stats.strongestSystem && (
                <div>
                  <span className="font-medium">{stats.strongestSystem.systemName}</span>
                  <span className="ml-2">{stats.max}점</span>
                </div>
              )}
              {relationshipReport.overall.strongRelationships.length > 1 && (
                <div className="mt-1 text-xs opacity-80">
                  외 {relationshipReport.overall.strongRelationships.length - 1}개 관계
                </div>
              )}
            </div>
          </div>

          {/* 약점 */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
            <h5 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">
              ⚠️ 주의 관계
            </h5>
            <div className="text-sm text-orange-700 dark:text-orange-400">
              {stats.weakestSystem && (
                <div>
                  <span className="font-medium">{stats.weakestSystem.systemName}</span>
                  <span className="ml-2">{stats.min}점</span>
                </div>
              )}
              {relationshipReport.overall.weakRelationships.length > 0 && (
                <div className="mt-1 text-xs opacity-80">
                  개선 필요: {relationshipReport.overall.weakRelationships.length}개 관계
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 최고 인연 */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border border-pink-200 dark:border-pink-700 rounded-lg p-4">
          <h5 className="font-semibold text-pink-800 dark:text-pink-300 mb-2">
            🌟 최고의 인연
          </h5>
          <div className="text-sm text-pink-700 dark:text-pink-400">
            <span className="font-medium text-lg">{relationshipReport.overall.bestPartner}</span>
            <p className="mt-1 text-xs">가장 높은 점수를 기록한 관계입니다</p>
          </div>
        </div>

        {/* 합형충파해 분석 */}
        {(relationshipReport.harmonyAnalysis.harmonies.length > 0 ||
          relationshipReport.harmonyAnalysis.conflicts.length > 0) && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg p-4">
            <h5 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-3">
              ☯️ 합형충파해 분석
            </h5>

            {relationshipReport.harmonyAnalysis.harmonies.length > 0 && (
              <div className="mb-3">
                <h6 className="text-sm font-medium text-indigo-700 dark:text-indigo-400 mb-1">
                  조화 관계 (合)
                </h6>
                <ul className="text-sm text-indigo-600 dark:text-indigo-300 space-y-1">
                  {relationshipReport.harmonyAnalysis.harmonies.slice(0, 3).map((harmony, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">✨</span>
                      <span>{harmony}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {relationshipReport.harmonyAnalysis.conflicts.length > 0 && (
              <div>
                <h6 className="text-sm font-medium text-indigo-700 dark:text-indigo-400 mb-1">
                  갈등 관계 (沖/刑/破/害)
                </h6>
                <ul className="text-sm text-indigo-600 dark:text-indigo-300 space-y-1">
                  {relationshipReport.harmonyAnalysis.conflicts.slice(0, 3).map((conflict, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">⚠️</span>
                      <span>{conflict}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 권장사항 */}
        {(relationshipReport.recommendations.immediate.length > 0 ||
          relationshipReport.recommendations.longTerm.length > 0) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">
              💡 인간관계 권장사항
            </h5>

            {relationshipReport.recommendations.immediate.length > 0 && (
              <div className="mb-3">
                <h6 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">
                  즉시 실천 사항
                </h6>
                <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                  {relationshipReport.recommendations.immediate.slice(0, 3).map((rec, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {relationshipReport.recommendations.longTerm.length > 0 && (
              <div>
                <h6 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">
                  장기 관계 전략
                </h6>
                <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                  {relationshipReport.recommendations.longTerm.slice(0, 3).map((rec, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RelationshipRadarChart;
