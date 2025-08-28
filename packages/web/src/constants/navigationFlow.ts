// 사주 분석 차트 네비게이션 플로우 정의
export interface ChartInfo {
  path: string;
  name: string;
  icon: string;
  description: string;
}

export const CHART_NAVIGATION_FLOW: ChartInfo[] = [
  {
    path: '/saju',
    name: '오행균형도',
    icon: '🌟',
    description: '목화토금수 균형과 상생상극 관계 분석'
  },
  {
    path: '/saju/six-areas',
    name: '6대 영역 분석',
    icon: '📊',
    description: '기본 사주 6개 영역 종합 분석'
  },
  {
    path: '/saju/detailed',
    name: '17대 운세 분석',
    icon: '🔮',
    description: '세부적인 17개 운세 영역 분석'
  },
  {
    path: '/saju/personality',
    name: '7대 성향 분석', 
    icon: '🧠',
    description: '개성과 성격 특성 7개 영역 분석'
  },
  {
    path: '/fortune',
    name: '오늘의 운세',
    icon: '🍀',
    description: '오늘의 전반적인 운세 정보'
  }
  // 향후 30개 차트까지 확장 예정
];

// 현재 차트의 인덱스 찾기
export const getCurrentChartIndex = (currentPath: string): number => {
  return CHART_NAVIGATION_FLOW.findIndex(chart => chart.path === currentPath);
};

// 이전 차트 정보 가져오기
export const getPreviousChart = (currentPath: string): ChartInfo | null => {
  const currentIndex = getCurrentChartIndex(currentPath);
  return currentIndex > 0 ? CHART_NAVIGATION_FLOW[currentIndex - 1] : null;
};

// 다음 차트 정보 가져오기
export const getNextChart = (currentPath: string): ChartInfo | null => {
  const currentIndex = getCurrentChartIndex(currentPath);
  return currentIndex < CHART_NAVIGATION_FLOW.length - 1 
    ? CHART_NAVIGATION_FLOW[currentIndex + 1] 
    : null;
};

// 현재 차트 정보 가져오기
export const getCurrentChart = (currentPath: string): ChartInfo | null => {
  return CHART_NAVIGATION_FLOW.find(chart => chart.path === currentPath) || null;
};