// 오행균형도 차트 전용 타입 정의

// 기본 오행 요소 데이터
export interface FiveElementsData {
  wood: number;    // 목(木) - 성장, 창조성 (0-100)
  fire: number;    // 화(火) - 열정, 활동성 (0-100)
  earth: number;   // 토(土) - 안정, 신용 (0-100)
  metal: number;   // 금(金) - 정의, 원칙 (0-100)
  water: number;   // 수(水) - 지혜, 유연성 (0-100)
}

// 오행 관계 분석 결과
export interface ElementRelationship {
  mutual_generation: {    // 상생관계 강도
    wood_fire: number;       // 목생화 (목 → 화)
    fire_earth: number;      // 화생토 (화 → 토)
    earth_metal: number;     // 토생금 (토 → 금)
    metal_water: number;     // 금생수 (금 → 수)
    water_wood: number;      // 수생목 (수 → 목)
  };
  mutual_destruction: {   // 상극관계 강도
    wood_earth: number;      // 목극토 (목 ← 토)
    fire_metal: number;      // 화극금 (화 ← 금)
    earth_water: number;     // 토극수 (토 ← 수)
    metal_wood: number;      // 금극목 (금 ← 목)
    water_fire: number;      // 수극화 (수 ← 화)
  };
  balance_score: number;  // 전체 균형도 (0-100)
  dominant_elements: string[];  // 강한 원소들
  weak_elements: string[];      // 약한 원소들
  missing_elements: string[];   // 부족한 원소들
}

// 오행 기반 맞춤 추천사항
export interface FiveElementsRecommendation {
  colors: {
    beneficial: Array<{
      name: string;
      hex: string;
      description: string;
    }>;
    avoid: Array<{
      name: string;
      hex: string;
      reason: string;
    }>;
  };
  directions: {
    beneficial: Array<{
      direction: string;
      element: string;
      benefit: string;
    }>;
    avoid: Array<{
      direction: string;
      element: string;
      risk: string;
    }>;
  };
  activities: {
    beneficial: Array<{
      activity: string;
      element: string;
      effect: string;
    }>;
    avoid: Array<{
      activity: string;
      element: string;
      risk: string;
    }>;
  };
  lifestyle: {
    diet: Array<{
      food: string;
      element: string;
      benefit: string;
    }>;
    exercise: Array<{
      type: string;
      element: string;
      effect: string;
    }>;
    career: Array<{
      field: string;
      element: string;
      aptitude: string;
    }>;
  };
}

// 오행별 세부 정보
export interface ElementDetail {
  name: string;           // 원소 이름
  korean: string;         // 한자명 (木, 火, 土, 金, 水)
  icon: string;           // 이모지 아이콘
  color: {
    primary: string;      // 주 색상
    secondary: string;    // 보조 색상
    background: string;   // 배경 색상
  };
  characteristics: {
    positive: string[];   // 긍정적 특성
    negative: string[];   // 부정적 특성
  };
  season: string;         // 대응 계절
  direction: string;      // 대응 방향
  body_parts: string[];   // 대응 신체 부위
  emotions: string[];     // 대응 감정
}

// 시간대별 오행 변화
export interface TimeFrameElements {
  base: FiveElementsData;     // 기본 오행 상태
  today: FiveElementsData;    // 오늘의 오행 변화
  month: FiveElementsData;    // 이달의 오행 변화
  year: FiveElementsData;     // 올해의 오행 변화
}

// 표준 레이더차트 인터페이스 (모든 차트 공통)
export interface StandardRadarChart {
  meta: {
    id: string;           // 차트 고유 ID
    title: string;        // 차트 제목
    icon: string;         // 차트 아이콘
    description: string;  // 차트 설명
    order: number;        // 네비게이션 순서
  };
  data: {
    labels: string[];     // 레이더차트 축 라벨
    values: number[];     // 각 축의 값 (0-100)
    colors: {
      primary: string;    // 주 색상
      secondary: string;  // 보조 색상
      background: string; // 배경 색상
    };
  };
  timeframes: {
    [key: string]: number[];  // 시간대별 데이터
  };
  interpretation: {
    summary: string;      // 종합 해석
    positive: string[];   // 긍정적 측면
    negative: string[];   // 주의할 점
    recommendations: string[]; // 개선 방안
  };
}

// 오행 전용 차트 데이터
export interface FiveElementsChartData extends StandardRadarChart {
  elements: FiveElementsData;
  relationships: ElementRelationship;
  recommendations: FiveElementsRecommendation;
  elementDetails: Record<keyof FiveElementsData, ElementDetail>;
}

// 계산 옵션
export interface CalculationOptions {
  includeHour: boolean;        // 시간 포함 여부
  lunarCalendar: boolean;      // 음력 사용 여부
  timezone: string;            // 시간대
  precisionLevel: 'basic' | 'detailed' | 'expert';  // 계산 정밀도
}

// 분석 결과 전체
export interface FiveElementsAnalysisResult {
  birthInfo: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    isLunar: boolean;
  };
  elements: FiveElementsData;
  timeframes: TimeFrameElements;
  relationships: ElementRelationship;
  recommendations: FiveElementsRecommendation;
  chartData: FiveElementsChartData;
  calculatedAt: string;         // 계산 시점
  version: string;              // 계산 버전
}