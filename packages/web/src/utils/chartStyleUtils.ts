// 🎨 차트 스타일 통합 관리 유틸리티

import { ChartConfiguration, ChartOptions } from 'chart.js';

export interface EnhancedRadarOptions {
  highlightMaximum: boolean;
  maxPointStyle: {
    radius: number;
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  };
  normalPointStyle: {
    radius: number;
    borderWidth: number;
  };
  animation: {
    duration: number;
    easing: 'easeInOutQuart' | 'easeOutBounce' | 'linear';
  };
}

export interface TimeFrameData {
  label: string;
  values: number[];
  timeFrame: 'base' | 'today' | 'thisMonth' | 'thisYear';
}

export class ChartStyleUtils {
  
  // 표준 색상 팔레트
  public static readonly COLOR_PALETTE = {
    primary: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFB4B4'],
    accent: '#FFD700',
    success: '#4CAF50',
    warning: '#FF9800',
    danger: '#F44336',
    dark: {
      background: 'rgba(255, 255, 255, 0.1)',
      text: '#ffffff',
      gridLines: 'rgba(255, 255, 255, 0.2)',
    },
    light: {
      background: 'rgba(0, 0, 0, 0.1)',
      text: '#333333',
      gridLines: 'rgba(0, 0, 0, 0.1)',
    },
  };

  // 기본 레이더 차트 옵션
  public static readonly DEFAULT_RADAR_OPTIONS: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: 'normal',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#ffffff',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label(context) {
            const label = context.dataset.label || '';
            const value = Math.round(context.parsed.r * 10) / 10;
            return `${label}: ${value}점`;
          },
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          display: false, // 점수 표시 제거
          font: {
            size: 10,
          },
        },
        grid: {
          color: 'rgba(128, 128, 128, 0.2)',
          lineWidth: 1,
        },
        angleLines: {
          color: 'rgba(128, 128, 128, 0.2)',
          lineWidth: 1,
        },
        pointLabels: {
          font: {
            size: 12,
            weight: 'bold',
          },
        },
      },
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart',
    },
  };

  /**
   * 시간대별 데이터에서 최대값들을 찾는 함수
   */
  public static findMaximumValues(datasets: TimeFrameData[]): { datasetIndex: number, pointIndex: number, value: number }[] {
    const maxValues: { datasetIndex: number, pointIndex: number, value: number }[] = [];
    
    datasets.forEach((dataset, datasetIndex) => {
      const maxValue = Math.max(...dataset.values);
      const maxIndex = dataset.values.indexOf(maxValue);
      
      maxValues.push({
        datasetIndex,
        pointIndex: maxIndex,
        value: maxValue,
      });
    });

    return maxValues;
  }

  /**
   * 최대값 포인트 강조 스타일 생성
   */
  public static createHighlightedPointStyles(
    datasets: TimeFrameData[], 
    options: EnhancedRadarOptions,
  ): any[] {
    const maxValues = this.findMaximumValues(datasets);
    
    return datasets.map((dataset, datasetIndex) => {
      const maxPoint = maxValues.find(max => max.datasetIndex === datasetIndex);
      
      // 각 포인트에 대한 스타일 배열 생성
      const pointRadii = dataset.values.map((_, pointIndex) => {
        return maxPoint && pointIndex === maxPoint.pointIndex 
          ? options.maxPointStyle.radius 
          : options.normalPointStyle.radius;
      });

      const pointBackgroundColors = dataset.values.map((_, pointIndex) => {
        return maxPoint && pointIndex === maxPoint.pointIndex
          ? options.maxPointStyle.backgroundColor
          : this.COLOR_PALETTE.primary[datasetIndex % this.COLOR_PALETTE.primary.length];
      });

      const pointBorderColors = dataset.values.map((_, pointIndex) => {
        return maxPoint && pointIndex === maxPoint.pointIndex
          ? options.maxPointStyle.borderColor
          : this.COLOR_PALETTE.primary[datasetIndex % this.COLOR_PALETTE.primary.length];
      });

      const pointBorderWidths = dataset.values.map((_, pointIndex) => {
        return maxPoint && pointIndex === maxPoint.pointIndex
          ? options.maxPointStyle.borderWidth
          : options.normalPointStyle.borderWidth;
      });

      return {
        label: dataset.label,
        data: dataset.values,
        backgroundColor: `${this.COLOR_PALETTE.primary[datasetIndex % this.COLOR_PALETTE.primary.length]}20`,
        borderColor: this.COLOR_PALETTE.primary[datasetIndex % this.COLOR_PALETTE.primary.length],
        pointBackgroundColor: pointBackgroundColors,
        pointBorderColor: pointBorderColors,
        pointRadius: pointRadii,
        pointBorderWidth: pointBorderWidths,
        borderWidth: 2,
        tension: 0.1,
      };
    });
  }

  /**
   * 다크모드 적용 옵션 생성
   */
  public static applyDarkMode(baseOptions: ChartOptions<'radar'>, isDark: boolean): ChartOptions<'radar'> {
    const theme = isDark ? this.COLOR_PALETTE.dark : this.COLOR_PALETTE.light;
    
    return {
      ...baseOptions,
      plugins: {
        ...baseOptions.plugins,
        legend: {
          ...baseOptions.plugins?.legend,
          labels: {
            ...baseOptions.plugins?.legend?.labels,
            color: theme.text,
          },
        },
      },
      scales: {
        r: {
          ...baseOptions.scales?.r,
          ticks: {
            ...baseOptions.scales?.r?.ticks,
            color: theme.text,
            display: false, // 점수 표시 제거 유지
          },
          grid: {
            ...baseOptions.scales?.r?.grid,
            color: theme.gridLines,
          },
          angleLines: {
            ...baseOptions.scales?.r?.angleLines,
            color: theme.gridLines,
          },
          pointLabels: {
            ...baseOptions.scales?.r?.pointLabels,
            color: theme.text,
          },
        },
      },
    };
  }

  /**
   * 궁합 전용 레이더 차트 설정 생성
   */
  public static createCompatibilityRadarConfig(
    labels: string[],
    datasets: TimeFrameData[],
    options: EnhancedRadarOptions,
    isDarkMode: boolean = false,
  ): ChartConfiguration<'radar'> {
    const enhancedDatasets = this.createHighlightedPointStyles(datasets, options);
    const chartOptions = this.applyDarkMode(this.DEFAULT_RADAR_OPTIONS, isDarkMode);

    return {
      type: 'radar',
      data: {
        labels,
        datasets: enhancedDatasets,
      },
      options: {
        ...chartOptions,
        animation: {
          ...chartOptions.animation,
          duration: options.animation.duration,
          easing: options.animation.easing,
        },
      },
    };
  }

  /**
   * 표준 레이더 차트 설정 생성 (사주 운세용)
   */
  public static createStandardRadarConfig(
    labels: string[],
    datasets: TimeFrameData[],
    isDarkMode: boolean = false,
    highlightMax: boolean = true,
  ): ChartConfiguration<'radar'> {
    const options: EnhancedRadarOptions = {
      highlightMaximum: highlightMax,
      maxPointStyle: {
        radius: 6,
        backgroundColor: this.COLOR_PALETTE.accent,
        borderColor: this.COLOR_PALETTE.accent,
        borderWidth: 3,
      },
      normalPointStyle: {
        radius: 3,
        borderWidth: 2,
      },
      animation: {
        duration: 1200,
        easing: 'easeInOutQuart',
      },
    };

    return this.createCompatibilityRadarConfig(labels, datasets, options, isDarkMode);
  }

  /**
   * 궁합 점수 등급별 색상 반환
   */
  public static getGradeColor(grade: string): string {
    const gradeColors: { [key: string]: string } = {
      'S': '#FFD700',      // 골드
      'A+': '#FF6B6B',     // 레드
      'A': '#4ECDC4',      // 터콰이즈
      'B+': '#45B7D1',     // 블루
      'B': '#96CEB4',      // 그린
      'C': '#FFEAA7',      // 옐로우
      'D': '#DDA0DD',       // 퍼플
    };

    return gradeColors[grade] || gradeColors['B'];
  }

  /**
   * 반응형 차트 크기 설정
   */
  public static getResponsiveOptions(containerWidth: number): Partial<ChartOptions<'radar'>> {
    const fontSize = containerWidth < 400 ? 10 : containerWidth < 600 ? 12 : 14;
    const pointRadius = containerWidth < 400 ? 2 : containerWidth < 600 ? 3 : 4;

    return {
      plugins: {
        legend: {
          labels: {
            font: {
              size: fontSize,
            },
          },
        },
      },
      scales: {
        r: {
          ticks: {
            font: {
              size: Math.max(8, fontSize - 2),
            },
          },
          pointLabels: {
            font: {
              size: fontSize,
            },
          },
        },
      },
    };
  }

  /**
   * 애니메이션 효과가 적용된 업데이트 옵션
   */
  public static getUpdateAnimation(): any {
    return {
      duration: 800,
      easing: 'easeInOutQuart',
      onComplete() {
        // 애니메이션 완료 후 콜백
      },
    };
  }

  /**
   * 궁합 분석 결과에 따른 차트 색상 팔레트 선택
   */
  public static getCompatibilityColorScheme(score: number): string[] {
    if (score >= 90) {
      return ['#FFD700', '#FFA500', '#FF8C00']; // 골드 계열
    } else if (score >= 80) {
      return ['#FF6B6B', '#FF8A80', '#FFAB91']; // 레드-오렌지 계열
    } else if (score >= 70) {
      return ['#4ECDC4', '#80DEEA', '#B2EBF2']; // 터콰이즈 계열
    } else if (score >= 60) {
      return ['#45B7D1', '#81C784', '#A5D6A7']; // 블루-그린 계열
    } else {
      return ['#96CEB4', '#BCAAA4', '#D7CCC8']; // 뉴트럴 계열
    }
  }
}

// 차트 관련 상수들
export const CHART_CONSTANTS = {
  DEFAULT_MAX_VALUE: 100,
  DEFAULT_STEP_SIZE: 20,
  ANIMATION_DURATION: 1200,
  POINT_RADIUS: {
    NORMAL: 3,
    HIGHLIGHTED: 6,
    SMALL: 2,
    LARGE: 8,
  },
  BORDER_WIDTH: {
    NORMAL: 2,
    HIGHLIGHTED: 3,
    THIN: 1,
    THICK: 4,
  },
};

// 내보낼 기본 설정들
export const DEFAULT_ENHANCED_OPTIONS: EnhancedRadarOptions = {
  highlightMaximum: true,
  maxPointStyle: {
    radius: CHART_CONSTANTS.POINT_RADIUS.HIGHLIGHTED,
    backgroundColor: ChartStyleUtils.COLOR_PALETTE.accent,
    borderColor: ChartStyleUtils.COLOR_PALETTE.accent,
    borderWidth: CHART_CONSTANTS.BORDER_WIDTH.HIGHLIGHTED,
  },
  normalPointStyle: {
    radius: CHART_CONSTANTS.POINT_RADIUS.NORMAL,
    borderWidth: CHART_CONSTANTS.BORDER_WIDTH.NORMAL,
  },
  animation: {
    duration: CHART_CONSTANTS.ANIMATION_DURATION,
    easing: 'easeInOutQuart',
  },
};