import { useState, useEffect, useMemo } from 'react';
import { TimeFrame } from '@/components/saju/charts/common/StandardTimeFrameSelector';

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
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // 기본 색상 설정
  const defaultColors = {
    primary: '#8b5cf6',
    secondary: '#06b6d4', 
    background: 'rgba(139, 92, 246, 0.1)'
  };

  const colors = options.colors || defaultColors;

  // 시간대별 데이터 계산
  const timeFrameData = useMemo(() => {
    if (!options.calculator) {
      // 계산기가 없는 경우 기본 데이터만 사용
      return {
        base: Object.values(options.baseData),
        today: Object.values(options.baseData),
        month: Object.values(options.baseData),
        year: Object.values(options.baseData)
      };
    }

    // 계산기가 있는 경우 시간대별 변화 적용
    const timeframes = options.calculator.calculateTimeFrameVariations(options.baseData);
    
    return {
      base: Object.values(timeframes.base),
      today: Object.values(timeframes.today),
      month: Object.values(timeframes.month),
      year: Object.values(timeframes.year)
    };
  }, [options.baseData, options.calculator]);

  // 시간대별 색상 정의
  const timeFrameColors = {
    base: {
      background: colors.background,
      border: colors.primary
    },
    today: {
      background: 'rgba(239, 68, 68, 0.1)',
      border: '#ef4444'
    },
    month: {
      background: 'rgba(34, 197, 94, 0.1)',
      border: '#22c55e'
    },
    year: {
      background: 'rgba(59, 130, 246, 0.1)',
      border: '#3b82f6'
    }
  };

  const timeFrameLabels = {
    base: '기본',
    today: '오늘',
    month: '이달',
    year: '올해'
  };

  // 차트 데이터 생성
  const chartData: StandardRadarChartData = useMemo(() => {
    // 기본 데이터의 최고값 찾기
    const baseMaxScore = Math.max(...timeFrameData.base);
    const baseMaxIndexes = timeFrameData.base.map((score, index) => score === baseMaxScore ? index : -1).filter(index => index !== -1);

    const datasets = [
      // 기본 데이터셋 (항상 표시) - 최고값 강조 적용
      {
        label: '기본',
        data: timeFrameData.base,
        backgroundColor: timeFrameColors.base.background,
        borderColor: timeFrameColors.base.border,
        borderWidth: 3,
        pointBackgroundColor: timeFrameData.base.map((_, index) => 
          baseMaxIndexes.includes(index) 
            ? '#f59e0b'  // 금색 (최고점)
            : timeFrameColors.base.border
        ),
        pointBorderColor: '#ffffff',
        pointRadius: timeFrameData.base.map((_, index) => 
          baseMaxIndexes.includes(index) ? 12 : 3  // 최고점 크게, 나머지 작게
        ),
        pointHoverRadius: timeFrameData.base.map((_, index) => 
          baseMaxIndexes.includes(index) ? 15 : 5
        )
      }
    ];

    // 선택된 시간대 데이터셋 추가
    if (selectedTimeFrame !== 'base') {
      const selectedColors = timeFrameColors[selectedTimeFrame];
      const selectedData = timeFrameData[selectedTimeFrame];
      const selectedMaxScore = Math.max(...selectedData);
      const selectedMaxIndexes = selectedData.map((score, index) => score === selectedMaxScore ? index : -1).filter(index => index !== -1);

      datasets.push({
        label: timeFrameLabels[selectedTimeFrame],
        data: selectedData,
        backgroundColor: selectedColors.background,
        borderColor: selectedColors.border,
        borderWidth: 3,
        pointBackgroundColor: selectedData.map((_, index) => 
          selectedMaxIndexes.includes(index) 
            ? '#f59e0b'  // 금색 (최고점)
            : selectedColors.border
        ),
        pointBorderColor: '#ffffff',
        pointRadius: selectedData.map((_, index) => {
          if (selectedTimeFrame !== 'base') {
            // 시간대별 차트: 최고점만 표시, 나머지 숨김
            return selectedMaxIndexes.includes(index) ? 12 : 0;
          } else {
            // 기본 차트: 최고점 크게, 나머지 작게
            return selectedMaxIndexes.includes(index) ? 12 : 3;
          }
        }),
        pointHoverRadius: selectedData.map((_, index) => {
          if (selectedTimeFrame !== 'base') {
            // 시간대별 차트: 최고점만 호버 가능
            return selectedMaxIndexes.includes(index) ? 15 : 0;
          } else {
            // 기본 차트: 모든 점 호버 가능
            return selectedMaxIndexes.includes(index) ? 15 : 5;
          }
        })
      });
    }

    return {
      labels: options.labels,
      datasets
    };
  }, [options.labels, selectedTimeFrame, timeFrameData]);

  // 차트 옵션 생성
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: selectedTimeFrame !== 'base',
        position: 'top' as const,
        labels: {
          color: isDarkMode ? '#f8fafc' : '#2c3e50',
          font: {
            size: 12,
            weight: 600
          },
          padding: 16,
          usePointStyle: true
        }
      },
      tooltip: {
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
          label: (context: any) => {
            return `${context.dataset.label}: ${context.parsed.r}점`;
          }
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          display: false,  // 중앙 점수 숫자 제거
          stepSize: 20,
          color: isDarkMode ? '#cbd5e1' : '#64748b',
          font: {
            size: isDarkMode ? 11 : 10,
            weight: 600
          },
          showLabelBackdrop: false
        },
        grid: {
          color: isDarkMode ? 'rgba(203, 213, 225, 0.4)' : 'rgba(0, 0, 0, 0.1)',
          lineWidth: isDarkMode ? 2 : 1
        },
        angleLines: {
          color: isDarkMode ? 'rgba(203, 213, 225, 0.3)' : 'rgba(0, 0, 0, 0.1)',
          lineWidth: isDarkMode ? 2 : 1
        },
        pointLabels: {
          color: isDarkMode ? '#f1f5f9' : '#2c3e50',
          font: {
            size: isDarkMode ? 13 : 11,
            weight: 700
          }
        }
      }
    }
  }), [selectedTimeFrame, isDarkMode, colors.primary]);

  return {
    chartData,
    chartOptions,
    selectedTimeFrame,
    setSelectedTimeFrame,
    isDarkMode,
    timeFrameData,
    timeFrameColors
  };
};

export default useStandardRadarChart;