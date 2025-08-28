// 사주 분석 차트 통일 디자인 시스템
export const CHART_DESIGN_SYSTEM = {
  // 차트 크기 통일
  DIMENSIONS: {
    height: '400px',
    minHeight: '350px', 
    maxHeight: '450px',
    aspectRatio: '1:1'
  },

  // 30개 차트용 통일 색상 팔레트
  COLORS: {
    primary: [
      '#8b5cf6',   // 보라색 (메인)
      '#06b6d4',   // 청록색
      '#f59e0b',   // 주황색
      '#ef4444',   // 빨간색
      '#10b981',   // 녹색
      '#f97316',   // 진한 주황
      '#8b5a2b',   // 갈색
      '#6366f1',   // 인디고
      '#ec4899',   // 핑크
      '#14b8a6',   // 틸
      '#f97316',   // 오렌지
      '#8b5cf6',   // 바이올렛
      '#06b6d4',   // 스카이
      '#84cc16',   // 라임
      '#f59e0b',   // 앰버
      '#ef4444',   // 로즈
      '#64748b'    // 슬레이트
    ],
    
    // 배경색 통일
    backgrounds: {
      base: 'rgba(139, 92, 246, 0.1)',
      today: 'rgba(239, 68, 68, 0.15)',
      month: 'rgba(6, 182, 212, 0.15)',
      year: 'rgba(245, 158, 11, 0.15)'
    },

    // 테두리색 통일
    borders: {
      base: '#8b5cf6',
      today: '#ef4444',
      month: '#06b6d4', 
      year: '#f59e0b'
    }
  },

  // 표준 차트 옵션 (다크모드 개선 적용)
  CHART_OPTIONS: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: { size: 13, weight: 700 },
          padding: 16,
          boxWidth: 12,
          usePointStyle: true,
          color: '#374151'  // 기본 다크 색상
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#8b5cf6',
        borderWidth: 2,
        cornerRadius: 8,
        padding: 14,
        displayColors: true,
        titleFont: { size: 14, weight: 600 },
        bodyFont: { size: 13 }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        min: 0,
        ticks: {
          stepSize: 10,
          font: { size: 12, weight: 600 },
          color: '#6b7280',
          backdropColor: 'transparent',
          showLabelBackdrop: false
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.4)',
          lineWidth: 2
        },
        angleLines: {
          color: 'rgba(107, 114, 128, 0.3)',
          lineWidth: 2
        },
        pointLabels: {
          font: { size: 13, weight: 700 },
          color: '#374151'
        }
      }
    },
    interaction: {
      intersect: false
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const
    }
  },

  // 다크모드 전용 차트 옵션
  DARK_MODE_CHART_OPTIONS: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: { size: 13, weight: 700 },
          padding: 16,
          boxWidth: 12,
          usePointStyle: true,
          color: '#f1f5f9'  // 다크모드용 밝은 색상
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#a78bfa',
        borderWidth: 2,
        cornerRadius: 8,
        padding: 14,
        displayColors: true,
        titleFont: { size: 14, weight: 600 },
        bodyFont: { size: 13 }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        min: 0,
        ticks: {
          stepSize: 10,
          font: { size: 12, weight: 600 },
          color: '#cbd5e1',  // 다크모드용 밝은 틱
          backdropColor: 'transparent',
          showLabelBackdrop: false
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.5)',  // 더 밝은 격자선
          lineWidth: 2
        },
        angleLines: {
          color: 'rgba(156, 163, 175, 0.4)',  // 더 밝은 각도선
          lineWidth: 2
        },
        pointLabels: {
          font: { size: 13, weight: 700 },
          color: '#f1f5f9'  // 다크모드용 밝은 라벨
        }
      }
    },
    interaction: {
      intersect: false
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const
    }
  },

  // 버튼 스타일 통일 (그라데이션 제거, 단색 적용)
  BUTTON_STYLES: {
    // 메인 액션 버튼 (분석별 단색)
    sixArea: 'px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold',
    seventeen: 'px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold',
    personality: 'px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold',
    
    // 네비게이션 버튼
    navigation: 'px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-600',
    
    // 시간대 선택 버튼
    timeFrame: {
      base: 'px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
      active: {
        base: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        today: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
        month: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        year: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
      },
      inactive: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
    }
  },

  // 점수 카드 스타일 통일
  SCORE_CARD_STYLES: {
    container: 'p-4 bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200',
    icon: 'text-2xl mb-2',
    label: 'text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-center',
    score: 'text-xl font-bold text-center',
    progressBar: {
      container: 'w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2',
      fill: 'h-2 rounded-full transition-all duration-300'
    }
  },

  // 레이아웃 표준 (그라데이션 제거)
  LAYOUT: {
    pageContainer: 'min-h-screen bg-gray-50 dark:bg-gray-900',
    contentContainer: 'max-w-7xl mx-auto px-4 py-8',
    
    // 페이지 헤더 (단색 적용)
    header: {
      container: 'text-center mb-8',
      title: 'text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2',
      subtitle: 'text-gray-600 dark:text-gray-300 text-lg'
    },
    
    // 네비게이션
    navigation: {
      container: 'flex flex-wrap justify-center gap-4 mb-6',
      maxButtonsPerRow: 4
    },
    
    // 시간대 선택
    timeFrameSelector: {
      container: 'flex flex-wrap gap-3 mb-6',
      alignment: 'justify-start'
    },
    
    // 차트 영역
    chartContainer: {
      main: 'mb-8',
      wrapper: 'bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6'
    }
  },

  // 아이콘 통일
  ICONS: {
    // 분석 타입별 메인 아이콘
    sixArea: '📊',
    seventeen: '🔮', 
    personality: '🧠',
    
    // 공통 UI 아이콘
    loading: '⏳',
    info: '📋',
    guide: '💡',
    settings: '⚙️',
    navigation: {
      previous: '←',
      next: '→',
      up: '↑',
      down: '↓'
    }
  },

  // 로딩 스피너 통일
  LOADING: {
    spinner: 'animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600',
    container: 'flex items-center justify-center h-96',
    wrapper: 'text-center',
    text: 'text-gray-600 dark:text-gray-400 mt-4'
  }
};

// 시간대별 데이터셋 색상 헬퍼
export const getTimeFrameColors = (timeFrame: 'base' | 'today' | 'month' | 'year') => {
  const colors = CHART_DESIGN_SYSTEM.COLORS;
  
  switch (timeFrame) {
    case 'today':
      return {
        background: colors.backgrounds.today,
        border: colors.borders.today
      };
    case 'month':
      return {
        background: colors.backgrounds.month,
        border: colors.borders.month
      };
    case 'year':
      return {
        background: colors.backgrounds.year,
        border: colors.borders.year
      };
    default:
      return {
        background: colors.backgrounds.base,
        border: colors.borders.base
      };
  }
};

// 차트별 고유 색상 할당
export const getChartColor = (index: number) => {
  const colors = CHART_DESIGN_SYSTEM.COLORS.primary;
  return colors[index % colors.length];
};

// 다크모드 감지 및 적절한 차트 옵션 반환
export const getChartOptions = (isDarkMode: boolean, customOptions?: any) => {
  const baseOptions = isDarkMode 
    ? CHART_DESIGN_SYSTEM.DARK_MODE_CHART_OPTIONS 
    : CHART_DESIGN_SYSTEM.CHART_OPTIONS;
  
  if (customOptions) {
    return {
      ...baseOptions,
      ...customOptions,
      plugins: {
        ...baseOptions.plugins,
        ...customOptions.plugins
      },
      scales: {
        ...baseOptions.scales,
        ...customOptions.scales
      }
    };
  }
  
  return baseOptions;
};