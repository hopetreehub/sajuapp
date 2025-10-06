import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
import { SajuRadarData, TimeFrame, TimeFrameWeights } from '@/types/sajuRadar';
import { CHART_DESIGN_SYSTEM, getTimeFrameColors, getChartOptions } from '@/constants/chartDesignSystem';
import { calculateTimeBasedScore, SajuData } from '@/utils/sajuScoreCalculator';
import { ChartStyleUtils, TimeFrameData } from '@/utils/chartStyleUtils';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
);

interface UnifiedSajuRadarChartProps {
  data: SajuRadarData;
  birthDate?: string;
  sajuData?: SajuData | null;
}

const UnifiedSajuRadarChart: React.FC<UnifiedSajuRadarChartProps> = ({ 
  data, 
  birthDate, 
  sajuData, 
}) => {

  // 다크모드 실시간 감지 (기존과 동일)
  const [isDarkMode, setIsDarkMode] = useState(false);
  // 시간대 선택 상태 (기존과 동일)
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('base');

  useEffect(() => {
    // 초기 다크모드 상태 확인
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    // MutationObserver로 다크모드 변경 감지
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // 시간대별 가중치 정의 (카테고리별로 다르게 적용 가능)
  const _timeFrameWeights: { [key in TimeFrame]: TimeFrameWeights } = {
    base: {},
    today: {
      // 오늘: 감성적, 즉석적 요소 강화
      emotion: 1.3,
      social: 1.2,
      energy: 1.4,
      intuitive: 1.3,
    },
    month: {
      // 이달: 논리적, 계획적 요소 강화
      logical: 1.3,
      planning: 1.3,
      relationship: 1.35,
      career: 1.2,
    },
    year: {
      // 올해: 안정적, 장기적 요소 강화
      stability: 1.3,
      wisdom: 1.4,
      growth: 1.3,
      foundation: 1.2,
    },
  };

  // 개선된 시간대별 데이터 생성 함수 (기존과 동일 로직)
  const generateTimeBasedScore = (
    baseScore: number,
    weight: number = 1.0,
    variance: number,
    maxLimit: number = 85,
  ): number => {
    // 기본 점수를 낮춤 (0.8 배율 적용)
    const adjustedBase = baseScore * 0.8;
    
    // 가중치 적용
    const weightedScore = adjustedBase * weight;
    
    // 변동성 추가
    const randomVariance = (Math.random() - 0.5) * variance;
    const finalScore = weightedScore + randomVariance;
    
    // 최소 20, 최대 maxLimit으로 제한
    return Math.max(20, Math.min(maxLimit, Math.round(finalScore)));
  };

  // 시간대별 데이터 메모이제이션 (ChartStyleUtils 호환 형식으로 변경)
  const timeFrameData = useMemo(() => {

    const result: { [key in TimeFrame]?: number[] } = {};
    
    // 사주 데이터 유효성 검증
    const isValidSajuData = (data: any): data is SajuData => {
      if (!data) return false;
      return data.year?.gan && data.year?.ji &&
             data.month?.gan && data.month?.ji &&
             data.day?.gan && data.day?.ji &&
             data.time?.gan && data.time?.ji &&
             data.ohHaengBalance;
    };
    
    // 기본 데이터 - 사주 데이터가 있으면 동적 계산, 없으면 정적 값 사용
    if (isValidSajuData(sajuData)) {

      result.base = data.items.map(item => {
        try {
          // base는 baseScore 사용 (시간대별 계산 불필요)
          return item.baseScore;
        } catch (error) {
          console.error(`[점수 계산 오류] ${item.name}:`, error);
          return item.baseScore;
        }
      });
    } else {

      result.base = data.items.map(item => item.baseScore);
    }
    
    // 사주 데이터가 있으면 사주 기반 계산, 없으면 랜덤 변동성
    if (isValidSajuData(sajuData)) {
      // 오늘: 사주 기반 일운 계산
      result.today = data.items.map(item => {
        try {
          return calculateTimeBasedScore(item.name, sajuData, 'today');
        } catch (error) {
          console.error(`[오늘 점수 계산 오류] ${item.name}:`, error);
          return generateTimeBasedScore(item.baseScore, 1.0, 25);
        }
      });
      
      // 이번달: 사주 기반 월운 계산
      result.month = data.items.map(item => {
        try {
          return calculateTimeBasedScore(item.name, sajuData, 'month');
        } catch (error) {
          console.error(`[이번달 점수 계산 오류] ${item.name}:`, error);
          return generateTimeBasedScore(item.baseScore, 1.0, 18);
        }
      });
      
      // 올해: 사주 기반 세운 계산
      result.year = data.items.map(item => {
        try {
          return calculateTimeBasedScore(item.name, sajuData, 'year');
        } catch (error) {
          console.error(`[올해 점수 계산 오류] ${item.name}:`, error);
          return generateTimeBasedScore(item.baseScore, 1.0, 12);
        }
      });
    } else {
      // 사주 데이터가 없으면 기존 랜덤 방식
      result.today = data.items.map(item => 
        generateTimeBasedScore(item.baseScore, 1.0, 25),
      );
      
      result.month = data.items.map(item => 
        generateTimeBasedScore(item.baseScore, 1.0, 18),
      );
      
      result.year = data.items.map(item => 
        generateTimeBasedScore(item.baseScore, 1.0, 12),
      );
    }
    
    return result;
  }, [data.items, sajuData]);

  // ChartStyleUtils용 TimeFrameData 배열 생성
  const chartTimeFrameDatasets = useMemo((): TimeFrameData[] => {
    const datasets: TimeFrameData[] = [];
    
    // 기본 데이터셋
    const baseValues = timeFrameData.base || data.items.map(item => item.baseScore);
    datasets.push({
      label: '나의 기본 사주',
      values: baseValues,
      timeFrame: 'base',
    });
    
    // 선택된 시간대 데이터셋 추가
    if (selectedTimeFrame !== 'base' && timeFrameData[selectedTimeFrame]) {
      const timeFrameLabels = {
        today: '오늘의 운세',
        month: '이번달 운세', 
        year: '올해 운세',
      };
      
      datasets.push({
        label: timeFrameLabels[selectedTimeFrame] || selectedTimeFrame,
        values: timeFrameData[selectedTimeFrame]!,
        timeFrame: selectedTimeFrame,
      });
    }
    
    return datasets;
  }, [timeFrameData, selectedTimeFrame, data.items]);

  // 최고점 찾기 로직 - 동적 기본 점수 사용
  const scoreValues = timeFrameData.base || data.items.map(item => item.baseScore);
  const maxScore = Math.max(...scoreValues);
  const maxScoreIndexes = scoreValues.map((score, index) => score === maxScore ? index : -1).filter(index => index !== -1);
  
  // 통일된 시간대 색상 사용 (기존과 동일)
  const _timeFrameColors = {
    today: getTimeFrameColors('today'),
    month: getTimeFrameColors('month'),
    year: getTimeFrameColors('year'),
  };

  // 시간대별 라벨 (기존과 동일)
  const _timeFrameLabels = {
    today: '오늘의 운세',
    month: '이번달 운세',
    year: '올해 운세',
  };

  // 통합 차트 설정 생성 (ChartStyleUtils 사용)
  const enhancedChartConfig = useMemo(() => {
    const labels = data.items.map(item => item.name);
    return ChartStyleUtils.createStandardRadarConfig(
      labels,
      chartTimeFrameDatasets,
      isDarkMode,
      true, // 최대값 강조 활성화
    );
  }, [data.items, chartTimeFrameDatasets, isDarkMode]);
  
  const chartData = enhancedChartConfig.data;

  // 향상된 차트 옵션 (ChartStyleUtils + 기존 옵션 결합)
  const options = useMemo(() => {
    const baseOptions = enhancedChartConfig.options;
    const customOptions = getChartOptions(isDarkMode, {
      plugins: {
        legend: {
          display: selectedTimeFrame !== 'base',
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              return `${context.dataset.label}: ${context.parsed.r}점`;
            },
          },
        },
      },
    });

    // 현재 표시 중인 모든 데이터의 최대값 계산
    const allCurrentValues: number[] = [];
    allCurrentValues.push(...(timeFrameData.base || []));
    if (selectedTimeFrame !== 'base' && timeFrameData[selectedTimeFrame]) {
      allCurrentValues.push(...(timeFrameData[selectedTimeFrame] || []));
    }

    // 동적 스케일 계산: 최대값에서 10 더한 값을 10 단위로 올림
    const maxDataValue = Math.max(...allCurrentValues, 50); // 최소 50은 보장
    const dynamicMax = Math.ceil(maxDataValue / 10) * 10 + 10; // 10 단위 올림 + 여유 10

    // 옵션 병합 (깊은 병합) + 동적 스케일 적용
    return {
      ...baseOptions,
      ...customOptions,
      plugins: {
        ...baseOptions?.plugins,
        ...customOptions.plugins,
        legend: {
          ...baseOptions?.plugins?.legend,
          ...customOptions.plugins?.legend,
        },
        tooltip: {
          ...baseOptions?.plugins?.tooltip,
          ...customOptions.plugins?.tooltip,
        },
      },
      scales: {
        ...baseOptions?.scales,
        ...customOptions.scales,
        r: {
          ...baseOptions?.scales?.r,
          ...customOptions.scales?.r,
          max: dynamicMax, // 동적 최대값 적용
        },
      },
    };
  }, [enhancedChartConfig, isDarkMode, selectedTimeFrame, timeFrameData]);

  const totalScore = scoreValues.reduce((sum, score) => sum + score, 0);
  const averageScore = (totalScore / data.items.length).toFixed(1);

  // 2개 항목일 때 바 차트용 데이터와 옵션
  const barChartData = {
    labels: data.items.map(item => item.name),
    datasets: [
      {
        label: '나의 기본 사주',
        data: scoreValues,
        backgroundColor: scoreValues.map((_, index) => 
          maxScoreIndexes.includes(index) 
            ? ChartStyleUtils.COLOR_PALETTE.accent  // 골드 (최고점)
            : getTimeFrameColors('base').background,
        ),
        borderColor: scoreValues.map((_, index) => 
          maxScoreIndexes.includes(index) 
            ? ChartStyleUtils.COLOR_PALETTE.accent  // 골드 (최고점)
            : getTimeFrameColors('base').border,
        ),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
        titleColor: isDarkMode ? '#ffffff' : '#000000',
        bodyColor: isDarkMode ? '#ffffff' : '#000000',
        borderColor: isDarkMode ? '#6b7280' : '#d1d5db',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.parsed.y}점`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280',
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: isDarkMode ? '#374151' : '#e5e7eb',
        },
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280',
        },
      },
    },
  };

  // 2개 이하 항목일 때는 바 차트 사용
  const useBarChart = data.items.length <= 2;

  return (
    <div className={CHART_DESIGN_SYSTEM.LAYOUT.chartContainer.wrapper}>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          🔮 {data.title} 상세 분석
        </h3>
        {birthDate && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            출생정보: {birthDate}
          </p>
        )}
        {useBarChart && (
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
            💡 항목이 적어 막대 차트로 표시됩니다
          </p>
        )}
      </div>

      {/* 차트 영역 - 조건부 렌더링 */}
      <div className="mb-6" style={{ height: CHART_DESIGN_SYSTEM.DIMENSIONS.height }}>
        {useBarChart ? (
          <Bar data={barChartData} options={barOptions} />
        ) : (
          <Radar data={chartData} options={options} />
        )}
      </div>

      {/* 시간대 선택 버튼 - 차트 아래 배치 (기존과 동일) */}
      <div className={`${CHART_DESIGN_SYSTEM.LAYOUT.timeFrameSelector.container} mb-6`}>
        {[
          { key: 'base' as TimeFrame, label: '기본', active: 'base' },
          { key: 'today' as TimeFrame, label: '오늘', active: 'today' },
          { key: 'month' as TimeFrame, label: '이달', active: 'month' },
          { key: 'year' as TimeFrame, label: '올해', active: 'year' },
        ].map(({ key, label, active: _active }) => (
          <button
            key={key}
            onClick={() => setSelectedTimeFrame(key)}
            className={`${CHART_DESIGN_SYSTEM.BUTTON_STYLES.timeFrame.base} ${
              selectedTimeFrame === key
                ? CHART_DESIGN_SYSTEM.BUTTON_STYLES.timeFrame.active[key as keyof typeof CHART_DESIGN_SYSTEM.BUTTON_STYLES.timeFrame.active]
                : CHART_DESIGN_SYSTEM.BUTTON_STYLES.timeFrame.inactive
            }`}
          >
            {label}
          </button>
        ))}
      </div>


      {/* 종합 분석 - 점수 없이 간단하게 */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl p-6 text-center">
        <h3 className="text-xl font-semibold mb-3">🔮 {data.title} 종합 분석</h3>
        <div className="text-lg">
          {Number(averageScore) >= 80 ? '✨ 매우 우수한 사주' :
           Number(averageScore) >= 60 ? '🌟 양호한 사주' :
           Number(averageScore) >= 40 ? '⭐ 평범한 사주' : '💪 노력이 필요한 사주'}
        </div>
        <div className="text-sm mt-2 opacity-90">
          각 영역별 균형과 최고점을 차트에서 확인하세요
        </div>
      </div>
    </div>
  );
};

export default UnifiedSajuRadarChart;