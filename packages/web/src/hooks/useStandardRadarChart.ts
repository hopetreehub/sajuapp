import { useState, useEffect, useMemo } from 'react';
import { TimeFrame } from '@/components/saju/charts/common/StandardTimeFrameSelector';
import { ChartStyleUtils, TimeFrameData } from '@/utils/chartStyleUtils';

interface UseStandardRadarChartOptions {
  baseData: any;
  chartType: string;
  calculator?: any;
  labels: string[];
  colors?: {
    primary: string;
    secondary: string;
    background: string;
  };
}

interface StandardRadarChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    pointBackgroundColor: string | string[];
    pointBorderColor: string;
    pointRadius: number | number[];
    pointHoverRadius: number | number[];
  }>;
}

export const useStandardRadarChart = (options: UseStandardRadarChartOptions) => {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('base');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 다크모드 실시간 감지
  useEffect(() => {
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

  // 기본 색상 설정
  const defaultColors = {
    primary: '#8b5cf6',
    secondary: '#06b6d4', 
    background: 'rgba(139, 92, 246, 0.1)',
  };

  const colors = options.colors || defaultColors;

  // 시간대별 데이터 계산
  const timeFrameData = useMemo(() => {
    if (!options.calculator) {
      // 계산기가 없는 경우 기본 데이터만 사용
      return {
        base: Object.values(options.baseData) as number[],
        today: Object.values(options.baseData) as number[],
        month: Object.values(options.baseData) as number[],
        year: Object.values(options.baseData) as number[],
      };
    }

    // 계산기가 있는 경우 시간대별 변화 적용
    const timeframes = options.calculator.calculateTimeFrameVariations(options.baseData);

    return {
      base: Object.values(timeframes.base) as number[],
      today: Object.values(timeframes.today) as number[],
      month: Object.values(timeframes.month) as number[],
      year: Object.values(timeframes.year) as number[],
    };
  }, [options.baseData, options.calculator]);

  // 시간대별 색상 정의
  const timeFrameColors = {
    base: {
      background: colors.background,
      border: colors.primary,
    },
    today: {
      background: 'rgba(239, 68, 68, 0.1)',
      border: '#ef4444',
    },
    month: {
      background: 'rgba(34, 197, 94, 0.1)',
      border: '#22c55e',
    },
    year: {
      background: 'rgba(59, 130, 246, 0.1)',
      border: '#3b82f6',
    },
  };

  const timeFrameLabels = {
    base: '기본',
    today: '오늘',
    month: '이달',
    year: '올해',
  };

  // ChartStyleUtils용 TimeFrameData 배열 생성
  const chartTimeFrameDatasets = useMemo((): TimeFrameData[] => {
    const datasets: TimeFrameData[] = [];
    
    // 기본 데이터셋
    datasets.push({
      label: timeFrameLabels.base,
      values: timeFrameData.base,
      timeFrame: 'base',
    });
    
    // 선택된 시간대 데이터셋 추가
    if (selectedTimeFrame !== 'base') {
      datasets.push({
        label: timeFrameLabels[selectedTimeFrame],
        values: timeFrameData[selectedTimeFrame],
        timeFrame: selectedTimeFrame,
      });
    }
    
    return datasets;
  }, [timeFrameData, selectedTimeFrame]);
  
  // 통합 차트 설정 생성 (ChartStyleUtils 사용)
  const enhancedChartConfig = useMemo(() => {
    return ChartStyleUtils.createStandardRadarConfig(
      options.labels,
      chartTimeFrameDatasets,
      isDarkMode,
      true, // 최대값 강조 활성화
    );
  }, [options.labels, chartTimeFrameDatasets, isDarkMode]);
  
  // 차트 데이터 생성
  const chartData: StandardRadarChartData = useMemo(() => {
    return {
      labels: (enhancedChartConfig.data.labels || []) as string[],
      datasets: enhancedChartConfig.data.datasets as StandardRadarChartData['datasets'],
    };
  }, [enhancedChartConfig]);

  // 향상된 차트 옵션 (ChartStyleUtils + 기존 옵션 결합)
  const chartOptions = useMemo(() => {
    const baseOptions = enhancedChartConfig.options;
    
    // 기존 스타일링과 결합
    return {
      ...baseOptions,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        ...baseOptions?.plugins,
        legend: {
          ...baseOptions?.plugins?.legend,
          display: selectedTimeFrame !== 'base',
          position: 'top' as const,
          labels: {
            ...baseOptions?.plugins?.legend?.labels,
            color: isDarkMode ? '#f8fafc' : '#2c3e50',
            font: {
              size: 12,
              weight: 600,
            },
            padding: 16,
            usePointStyle: true,
          },
        },
        tooltip: {
          ...baseOptions?.plugins?.tooltip,
          backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: isDarkMode ? '#ffffff' : '#2c3e50',
          bodyColor: isDarkMode ? '#ffffff' : '#2c3e50',
          borderColor: colors.primary,
          borderWidth: 2,
          cornerRadius: 8,
          padding: 12,
          titleFont: { size: 13, weight: 600 },
          bodyFont: { size: 12 },
          callbacks: {
            ...baseOptions?.plugins?.tooltip?.callbacks,
            label: (context: any) => {
              return `${context.dataset.label}: ${context.parsed.r}점`;
            },
          },
        },
      },
      scales: {
        ...baseOptions?.scales,
        r: {
          ...baseOptions?.scales?.r,
          beginAtZero: true,
          max: 100,
          ticks: {
            ...baseOptions?.scales?.r?.ticks,
            display: false,  // 중앙 점수 숫자 제거
            stepSize: 20,
            color: isDarkMode ? '#cbd5e1' : '#64748b',
            font: {
              size: isDarkMode ? 11 : 10,
              weight: 600,
            },
            showLabelBackdrop: false,
          },
          grid: {
            ...baseOptions?.scales?.r?.grid,
            color: isDarkMode ? 'rgba(203, 213, 225, 0.4)' : 'rgba(0, 0, 0, 0.1)',
            lineWidth: isDarkMode ? 2 : 1,
          },
          angleLines: {
            ...baseOptions?.scales?.r?.angleLines,
            color: isDarkMode ? 'rgba(203, 213, 225, 0.3)' : 'rgba(0, 0, 0, 0.1)',
            lineWidth: isDarkMode ? 2 : 1,
          },
          pointLabels: {
            ...baseOptions?.scales?.r?.pointLabels,
            color: isDarkMode ? '#f1f5f9' : '#2c3e50',
            font: {
              size: isDarkMode ? 13 : 11,
              weight: 700,
            },
          },
        },
      },
    };
  }, [enhancedChartConfig, selectedTimeFrame, isDarkMode, colors.primary]);

  return {
    chartData,
    chartOptions,
    selectedTimeFrame,
    setSelectedTimeFrame,
    isDarkMode,
    timeFrameData,
    timeFrameColors,
  };
};

export default useStandardRadarChart;