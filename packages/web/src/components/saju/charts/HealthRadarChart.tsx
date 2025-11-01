/**
 * 12대 건강 시스템 레이더 차트 컴포넌트
 *
 * 오행의학 기반 건강 분석 차트
 * @author Dr. Sarah Park (데이터 시각화 전문가) + Jake Kim (프론트엔드 아키텍트)
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
  calculateHealthScores,
  ComprehensiveHealthReport,
} from '@/utils/healthScoreCalculator';
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

interface HealthRadarChartProps {
  sajuData: SajuData;
  birthYear: number;
  birthDate?: string;
}

const HealthRadarChart: React.FC<HealthRadarChartProps> = ({
  sajuData,
  birthYear,
  birthDate,
}) => {
  // 다크모드 감지
  const [isDarkMode, setIsDarkMode] = useState(false);
  // 시간대 선택
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('base');
  // 년도 선택 (기본값: 현재 년도)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

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

  // 건강 점수 계산
  const healthReport = useMemo<ComprehensiveHealthReport>(() => {
    // 선택된 년도로 targetDate 생성
    const targetDate = new Date(selectedYear, 0, 1); // 1월 1일
    const report = calculateHealthScores(sajuData, birthYear, targetDate);

    // 🔍 디버깅: 점수 변화 확인
    console.log('=== 건강 점수 계산 결과 ===');
    report.systems.slice(0, 3).forEach(system => {
      console.log(`${system.systemName}:`);
      console.log(`  기본: ${system.baseScore}`);
      console.log(`  오늘: ${system.todayScore} (차이: ${system.todayScore - system.baseScore})`);
      console.log(`  이달: ${system.monthScore} (차이: ${system.monthScore - system.baseScore})`);
      console.log(`  올해: ${system.yearScore} (차이: ${system.yearScore - system.baseScore})`);
    });

    return report;
  }, [sajuData, birthYear, selectedYear]);

  // 차트 데이터 준비
  const chartData = useMemo(() => {
    const labels = healthReport.systems.map(s => s.systemName);

    // 시간대별 점수 데이터
    const getScoresByTimeFrame = (timeFrame: TimeFrame): number[] => {
      switch (timeFrame) {
        case 'today':
          return healthReport.systems.map(s => s.todayScore);
        case 'month':
          return healthReport.systems.map(s => s.monthScore);
        case 'year':
          return healthReport.systems.map(s => s.yearScore);
        default:
          return healthReport.systems.map(s => s.baseScore);
      }
    };

    const baseScores = healthReport.systems.map(s => s.baseScore);
    const selectedScores = getScoresByTimeFrame(selectedTimeFrame);

    // 기본 데이터셋 (항상 표시)
    const baseColors = getTimeFrameColors('base');
    const datasets: any[] = [
      {
        label: '기본 건강 상태',
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
        today: '오늘의 건강',
        month: '이달의 건강',
        year: '올해의 건강',
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
  }, [healthReport, selectedTimeFrame]);

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
              const system = healthReport.systems[systemIndex];
              return [
                `${context.dataset.label}: ${context.parsed.r}점`,
                `위험도: ${system.riskLevel === 'high' ? '높음' : system.riskLevel === 'medium' ? '중간' : '낮음'}`,
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
  }, [isDarkMode, selectedTimeFrame, healthReport]);

  // 통계 계산
  const stats = useMemo(() => {
    const scores = healthReport.systems.map(s => s.baseScore);
    const average = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
    const max = Math.max(...scores);
    const min = Math.min(...scores);

    const strongestSystem = healthReport.systems.find(s => s.baseScore === max);
    const weakestSystem = healthReport.systems.find(s => s.baseScore === min);

    return {
      average,
      max,
      min,
      strongestSystem,
      weakestSystem,
    };
  }, [healthReport]);

  return (
    <div className={CHART_DESIGN_SYSTEM.LAYOUT.chartContainer.wrapper}>
      {/* 헤더 */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          💚 12대 건강 시스템 분석
        </h3>
        {birthDate && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            출생정보: {birthDate} | 현재 나이: {healthReport.ageFactors.currentAge}세 ({healthReport.ageFactors.ageGroup})
          </p>
        )}
      </div>

      {/* 차트 */}
      <div className="mb-6" style={{ height: CHART_DESIGN_SYSTEM.DIMENSIONS.height }}>
        <Radar data={chartData} options={options} />
      </div>

      {/* 시간대 선택 버튼 */}
      <div className={`${CHART_DESIGN_SYSTEM.LAYOUT.timeFrameSelector.container} mb-4`}>
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

      {/* 십이운성 년도 선택 (year 모드일 때만 표시) */}
      {selectedTimeFrame === 'year' && (
        <div className="mb-6 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            🔮 십이운성 년도 선택:
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     focus:ring-2 focus:ring-purple-500 focus:border-transparent
                     cursor-pointer transition-all duration-200"
          >
            {Array.from({ length: 16 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
              <option key={year} value={year}>
                {year}년 {year === new Date().getFullYear() ? '(현재)' : ''}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            (과거 5년 ~ 미래 10년)
          </span>
        </div>
      )}

      {/* 종합 분석 카드 */}
      <div className="space-y-4">
        {/* 전체 건강 상태 */}
        <div className={`
          ${Number(stats.average) >= 70 ? 'bg-gradient-to-r from-green-600 to-green-800' :
            Number(stats.average) >= 50 ? 'bg-gradient-to-r from-blue-600 to-blue-800' :
            'bg-gradient-to-r from-orange-600 to-orange-800'}
          text-white rounded-xl p-6
        `}>
          <h4 className="text-lg font-semibold mb-2">💚 전체 건강 지수</h4>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.average}점</div>
              <div className="text-sm opacity-90">
                {Number(stats.average) >= 70 ? '✨ 매우 양호' :
                 Number(stats.average) >= 50 ? '🌟 양호' :
                 '⚠️ 주의 필요'}
              </div>
            </div>
            <div className="text-sm">
              <div>추세: {healthReport.overall.trend === 'improving' ? '📈 개선 중' :
                         healthReport.overall.trend === 'declining' ? '📉 주의 필요' :
                         '➡️ 안정적'}</div>
            </div>
          </div>
        </div>

        {/* 강점/취약 시스템 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 강점 */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <h5 className="font-semibold text-green-800 dark:text-green-300 mb-2">
              💪 강점 시스템
            </h5>
            <div className="text-sm text-green-700 dark:text-green-400">
              {stats.strongestSystem && (
                <div>
                  <span className="font-medium">{stats.strongestSystem.systemName}</span>
                  <span className="ml-2">{stats.max}점</span>
                </div>
              )}
              {healthReport.overall.strongSystems.length > 1 && (
                <div className="mt-1 text-xs opacity-80">
                  외 {healthReport.overall.strongSystems.length - 1}개 시스템
                </div>
              )}
            </div>
          </div>

          {/* 취약점 */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
            <h5 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">
              ⚠️ 주의 시스템
            </h5>
            <div className="text-sm text-orange-700 dark:text-orange-400">
              {stats.weakestSystem && (
                <div>
                  <span className="font-medium">{stats.weakestSystem.systemName}</span>
                  <span className="ml-2">{stats.min}점</span>
                </div>
              )}
              {healthReport.overall.riskSystems.length > 0 && (
                <div className="mt-1 text-xs opacity-80">
                  고위험: {healthReport.overall.riskSystems.length}개 시스템
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 권장사항 */}
        {(healthReport.recommendations.immediate.length > 0 ||
          healthReport.recommendations.longTerm.length > 0) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">
              💡 건강 권장사항
            </h5>

            {healthReport.recommendations.immediate.length > 0 && (
              <div className="mb-3">
                <h6 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">
                  즉시 조치 사항
                </h6>
                <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                  {healthReport.recommendations.immediate.slice(0, 3).map((rec, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {healthReport.recommendations.longTerm.length > 0 && (
              <div>
                <h6 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">
                  장기 관리 계획
                </h6>
                <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                  {healthReport.recommendations.longTerm.slice(0, 3).map((rec, idx) => (
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

        {/* 연령대별 주의사항 */}
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
          <h5 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">
            🎯 {healthReport.ageFactors.ageGroup} 주의사항
          </h5>
          <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
            {healthReport.ageFactors.generalConcerns.map((concern, idx) => (
              <li key={idx} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{concern}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HealthRadarChart;
