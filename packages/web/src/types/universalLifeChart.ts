// Universal Life Chart Types
// 범용 인생차트 시스템을 위한 타입 정의

export interface UniversalLifeChartData {
  personalInfo: PersonalInfo;
  timeline: Timeline;
  chartData: ChartDimensions;
  lifePeriods: LifePeriodInfo[];
  metadata: ChartMetadata;
}

export interface PersonalInfo {
  name: string;
  birthDate: string;        // YYYY-MM-DD format
  birthTime: string;        // HH:mm format
  sajuText: string;         // 예: "신해 기해 병오 경인"
  gender: 'male' | 'female';
  lunarSolar: 'lunar' | 'solar';
}

export interface Timeline {
  startYear: number;        // 출생년
  endYear: number;          // 출생년 + 95
  currentYear: number;      // 현재년도
  currentAge: number;       // 현재나이
  lifeProgress: number;     // 0-100% 인생 진척도
}

export interface ChartDimensions {
  geunbon: ChartDataPoint[];    // 근본 (기질/성격)
  woon: ChartDataPoint[];       // 운 (행운/기회)
  haeng: ChartDataPoint[];      // 행 (실행력/의지)
  hyeong: ChartDataPoint[];     // 형 (권위/지위)
  byeon: ChartDataPoint[];      // 변 (변화/전환)
}

export interface ChartDataPoint {
  year: number;
  age: number;
  value: number;              // -2.0 ~ +2.0 정규화된 값
  intensity: number;          // 막대차트용 강도 (절대값)
  description?: string;       // 해당 나이의 설명
  phase?: LifePhase;          // 인생 단계
}

export interface LifePeriodInfo {
  startAge: number;
  endAge: number;
  phase: LifePhase;
  description: string;
  majorEvents: string[];
  overallTrend: TrendType;
  keyYears: number[];         // 중요한 해들
}

export interface ChartMetadata {
  calculationDate: string;    // 계산 수행 일시
  version: string;            // 계산 알고리즘 버전
  accuracy: number;           // 정확도 지수 (0-100)
  notes?: string[];           // 특이사항
}

// 차트 색상 시스템
export interface DimensionColors {
  geunbon: string;   // 회색 #9CA3AF
  woon: string;      // 녹색 #10B981
  haeng: string;     // 주황 #F59E0B
  hyeong: string;    // 파란 #3B82F6
  byeon: string;     // 보라 #8B5CF6
}

// 차트 설정
export interface ChartConfig {
  colors: DimensionColors;
  yAxisRange: {
    min: number;     // -2.0
    max: number;     // +2.0
  };
  timeRange: {
    totalYears: number;  // 95년
  };
  display: {
    showCurrentLine: boolean;
    showPeriodLabels: boolean;
    showIntensityBars: boolean;
  };
}

// 열거형 타입들
export type LifePhase =
  | 'childhood'     // 0-12세 (유아동기)
  | 'youth'         // 13-22세 (청소년기)
  | 'early_adult'   // 23-35세 (청년기)
  | 'middle_adult'  // 36-50세 (중년전기)
  | 'late_adult'    // 51-65세 (중년후기)
  | 'senior'        // 66-80세 (노년전기)
  | 'elder';        // 81-95세 (노년후기)

export type TrendType =
  | 'ascending'     // 상승
  | 'descending'    // 하강
  | 'stable'        // 안정
  | 'turbulent'     // 격변
  | 'cyclical';     // 순환

export type ChartDimensionType = keyof ChartDimensions;

// 사주 계산 관련 타입들
export interface SajuComponents {
  year: { gan: string; ji: string; };
  month: { gan: string; ji: string; };
  day: { gan: string; ji: string; };
  time: { gan: string; ji: string; };
}

export interface DaeunInfo {
  startAge: number;
  endAge: number;
  gan: string;
  ji: string;
  direction: 'forward' | 'backward';  // 순행/역행
}

export interface YearlyFortune {
  year: number;
  age: number;
  gan: string;
  ji: string;
  relation: string;    // 일간과의 관계
  fortune: number;     // 길흉 점수
}

// API 관련 타입들
export interface LifeChartRequest {
  customerId: number;
  includeAnalysis?: boolean;
  timeRange?: {
    startAge?: number;
    endAge?: number;
  };
}

export interface LifeChartResponse {
  success: boolean;
  data?: UniversalLifeChartData;
  error?: string;
  processingTime?: number;
}

// 차트 내보내기 관련
export interface ExportOptions {
  format: 'pdf' | 'png' | 'svg' | 'json';
  quality?: 'low' | 'medium' | 'high';
  includeAnalysis?: boolean;
  watermark?: boolean;
}

// 기본 설정값들
export const DEFAULT_CHART_CONFIG: ChartConfig = {
  colors: {
    geunbon: '#9CA3AF',
    woon: '#10B981',
    haeng: '#F59E0B',
    hyeong: '#3B82F6',
    byeon: '#8B5CF6',
  },
  yAxisRange: {
    min: -2.0,
    max: 2.0,
  },
  timeRange: {
    totalYears: 95,
  },
  display: {
    showCurrentLine: true,
    showPeriodLabels: true,
    showIntensityBars: true,
  },
};

export const DIMENSION_NAMES: Record<ChartDimensionType, string> = {
  geunbon: '근본',
  woon: '운',
  haeng: '행',
  hyeong: '형',
  byeon: '변',
};

export const DIMENSION_DESCRIPTIONS: Record<ChartDimensionType, string> = {
  geunbon: '기질과 성향의 기본 흐름',
  woon: '행운과 기회의 파동',
  haeng: '실행력과 의지력의 변화',
  hyeong: '권위운과 사회적 지위',
  byeon: '변화와 전환의 시기',
};