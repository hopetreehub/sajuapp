// 🔮 고도화된 궁합 분석 시스템 타입 정의

export interface CompatibilityScoreComponents {
  // Tier 1: 핵심 명리학 (50점)
  ilganCompatibility: number;    // 일간 상생상극 (20점)
  yongsinRelation: number;       // 용신 관계 (15점)
  jijiHarmony: number;          // 지지 조화 (15점)
  
  // Tier 2: 심화 분석 (30점)
  daeunMatching: number;        // 대운 매칭 (12점)
  personalityFit: number;       // 성격 오행 (10점)
  ageBalance: number;           // 나이차 균형 (8점)
  
  // Tier 3: 현대적 보정 (20점)
  aiPrediction: number;         // AI 예측 (10점)
  statisticalAdjust: number;    // 통계 보정 (5점)
  modernFactors: number;        // 현대적 요소 (5점)
}

export type CompatibilityGrade = 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';

export interface GradeInfo {
  min: number;
  max: number;
  label: string;
  color: string;
  description: string;
  successRate: number; // 성공 확률 %
}

export interface CompatibilityAnalysisResult {
  totalScore: number;           // 총합 (0-100점)
  grade: CompatibilityGrade;
  gradeInfo: GradeInfo;
  components: CompatibilityScoreComponents;
  
  // 상세 분석 결과
  analysis: {
    strengths: string[];        // 강점 분석
    challenges: string[];       // 약점 분석
    advice: string[];          // 조언
    keyInsight: string;        // 핵심 통찰
  };
  
  // 예측 결과
  prediction: {
    marriageSuccessRate: number;  // 결혼 성공률
    conflictResolution: 'high' | 'medium' | 'low';  // 갈등 해결력
    longTermSatisfaction: number; // 장기 만족도
  };
  
  // 시기별 궁합 변화
  timePeriods: {
    current: number;    // 현재 궁합도
    oneYear: number;    // 1년 후
    fiveYears: number;  // 5년 후
  };
}

export interface AnimalCompatibilityMatrix {
  [key: string]: {
    [key: string]: {
      score: number;
      type: 'sangHab' | 'yukHab' | 'yukChung' | 'samHyeong' | 'normal';
      description: string;
    };
  };
}

export interface FiveElementsRelation {
  person1Element: string;
  person2Element: string;
  relationType: 'sangSaeng' | 'sangGeuk' | 'same' | 'normal';
  score: number;
  description: string;
}

export interface PersonalityCompatibility {
  emotionalSync: number;      // 감정적 동조
  communicationStyle: number; // 소통 스타일
  lifeGoals: number;         // 인생 목표 일치도
  conflictStyle: number;     // 갈등 해결 스타일
  overallFit: number;        // 전체적 어울림
}

// 레이더 차트용 궁합 데이터
export interface CompatibilityRadarData {
  labels: string[];
  datasets: [
    {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      pointBackgroundColor: string[];
      pointBorderColor: string[];
      pointRadius: number[];
      borderWidth: number;
    }
  ];
}

// 차트 스타일 개선을 위한 타입
export interface EnhancedChartOptions {
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
    easing: string;
  };
}