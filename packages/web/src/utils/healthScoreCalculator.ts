/**
 * 건강 점수 계산 모듈
 *
 * 12대 건강 시스템에 대한 사주 기반 점수 계산
 * 오행의학 + 전통 명리학 통합 알고리즘
 *
 * @author Master Kim Hyun-soo (명리학 전문가) + Jake Kim (프론트엔드 아키텍트)
 * @version 1.0
 */

import {
  HEALTH_SYSTEMS,
  HealthSystem,
  OhHaeng,
  OHHAENG_HEALTH_WEAKNESS,
} from '@/data/healthSystemData';
import {
  SajuData,
  CHEONGAN_OHHAENG,
  JIJI_OHHAENG,
  calculateTimeBonus,
} from './sajuScoreCalculator';

export interface HealthScoreResult {
  systemId: string;
  systemName: string;
  baseScore: number;           // 기본 건강 점수 (20-70)
  todayScore: number;          // 오늘의 건강 점수
  monthScore: number;          // 이달의 건강 점수
  yearScore: number;           // 올해의 건강 점수
  primaryElement: OhHaeng;     // 주 오행
  secondaryElement: OhHaeng;   // 보조 오행
  riskLevel: 'low' | 'medium' | 'high';  // 위험도
  ageAdjusted: number;         // 연령 보정 점수
  recommendations: string[];   // 건강 권장사항
}

export interface ComprehensiveHealthReport {
  overall: {
    averageScore: number;
    trend: 'improving' | 'stable' | 'declining';
    riskSystems: string[];
    strongSystems: string[];
  };
  systems: HealthScoreResult[];
  ageFactors: {
    currentAge: number;
    ageGroup: string;
    generalConcerns: string[];
  };
  recommendations: {
    immediate: string[];
    longTerm: string[];
  };
}

/**
 * 12대 건강 시스템 점수 계산 (메인 함수)
 */
export function calculateHealthScores(
  sajuData: SajuData,
  birthYear: number,
  targetDate?: Date,
): ComprehensiveHealthReport {
  const now = targetDate || new Date();
  const currentAge = now.getFullYear() - birthYear;

  // 1. 각 건강 시스템별 점수 계산
  const systemScores: HealthScoreResult[] = HEALTH_SYSTEMS.map(system =>
    calculateSingleHealthScore(system, sajuData, currentAge, birthYear, now),
  );

  // 2. 전체 건강 통계 계산
  const averageScore = systemScores.reduce((sum, s) => sum + s.baseScore, 0) / systemScores.length;

  // 3. 위험 시스템 및 강점 시스템 식별
  const riskSystems = systemScores
    .filter(s => s.riskLevel === 'high')
    .map(s => s.systemName);

  const strongSystems = systemScores
    .filter(s => s.baseScore >= 70)
    .map(s => s.systemName);

  // 4. 추세 분석
  const trend = analyzeTrend(systemScores);

  // 5. 연령대별 일반 주의사항
  const ageGroup = getAgeGroup(currentAge);
  const generalConcerns = getGeneralConcernsByAge(currentAge);

  // 6. 권장사항 생성
  const recommendations = generateRecommendations(systemScores, currentAge, sajuData);

  return {
    overall: {
      averageScore: Math.round(averageScore),
      trend,
      riskSystems,
      strongSystems,
    },
    systems: systemScores,
    ageFactors: {
      currentAge,
      ageGroup,
      generalConcerns,
    },
    recommendations,
  };
}

/**
 * 개별 건강 시스템 점수 계산
 */
function calculateSingleHealthScore(
  system: HealthSystem,
  sajuData: SajuData,
  currentAge: number,
  birthYear: number,
  targetDate: Date,
): HealthScoreResult {
  // 1. 사주의 오행 분포 분석
  const userElements = getUserElements(sajuData);

  // 2. 시스템 오행과의 관계 점수
  const elementScore = calculateElementRelation(
    [system.primaryElement, system.secondaryElement],
    userElements,
    sajuData,
  );

  // 3. 기본 건강 점수 (오행 관계 기반)
  let baseScore = elementScore;

  // 4. 오행 취약점 체크
  const weaknessPoint = checkElementWeakness(
    sajuData,
    system.primaryElement,
    system.secondaryElement,
  );
  baseScore -= weaknessPoint;

  // 5. 오행 강점 체크
  const strengthPoint = checkElementStrength(
    sajuData,
    system.primaryElement,
    system.secondaryElement,
  );
  baseScore += strengthPoint;

  // 6. 연령 보정 계수 적용
  const ageFactor = getAgeFactor(system, currentAge);
  const ageAdjusted = Math.round(baseScore * ageFactor);

  // 7. 시간대별 점수 계산 (NEW - 보너스 기반 계산으로 변경)
  // 기존: calculateMultiLayerScore (가중평균) → 시간대 점수가 기본보다 낮아지는 문제
  // 개선: calculateTimeBonus (보너스 가산) → 시간대 점수가 기본보다 높아질 수 있음
  const todayBonus = calculateTimeBonus(
    system.primaryElement,
    system.secondaryElement,
    sajuData,
    'today',
    targetDate,
    birthYear,
  );
  const monthBonus = calculateTimeBonus(
    system.primaryElement,
    system.secondaryElement,
    sajuData,
    'month',
    targetDate,
    birthYear,
  );
  const yearBonus = calculateTimeBonus(
    system.primaryElement,
    system.secondaryElement,
    sajuData,
    'year',
    targetDate,
    birthYear,
  );

  // baseScore에 보너스를 더하고 연령 보정 적용
  const todayScore = Math.max(20, Math.min(90, Math.round((baseScore + todayBonus) * ageFactor)));
  const monthScore = Math.max(20, Math.min(90, Math.round((baseScore + monthBonus) * ageFactor)));
  const yearScore = Math.max(20, Math.min(90, Math.round((baseScore + yearBonus) * ageFactor)));

  // 8. 위험도 평가
  const riskLevel = evaluateRiskLevel(ageAdjusted, currentAge, system);

  // 9. 개인화 권장사항 생성
  const recommendations = generateSystemRecommendations(
    system,
    ageAdjusted,
    currentAge,
    sajuData,
  );

  // 점수 범위 제한 (20-90)
  const finalBaseScore = Math.max(20, Math.min(90, Math.round(baseScore)));

  return {
    systemId: system.id,
    systemName: system.name,
    baseScore: finalBaseScore,
    todayScore,
    monthScore,
    yearScore,
    primaryElement: system.primaryElement,
    secondaryElement: system.secondaryElement,
    riskLevel,
    ageAdjusted,
    recommendations,
  };
}

/**
 * 사용자의 오행 분포 계산
 */
function getUserElements(sajuData: SajuData): Record<OhHaeng, number> {
  const elements: Record<OhHaeng, number> = {
    목: 0, 화: 0, 토: 0, 금: 0, 수: 0,
  };

  // 천간 오행
  elements[CHEONGAN_OHHAENG[sajuData.year.gan]]++;
  elements[CHEONGAN_OHHAENG[sajuData.month.gan]]++;
  elements[CHEONGAN_OHHAENG[sajuData.day.gan]]++;
  elements[CHEONGAN_OHHAENG[sajuData.time.gan]]++;

  // 지지 오행
  elements[JIJI_OHHAENG[sajuData.year.ji]]++;
  elements[JIJI_OHHAENG[sajuData.month.ji]]++;
  elements[JIJI_OHHAENG[sajuData.day.ji]]++;
  elements[JIJI_OHHAENG[sajuData.time.ji]]++;

  return elements;
}

/**
 * 오행 관계 점수 계산
 */
function calculateElementRelation(
  systemElements: OhHaeng[],
  userElements: Record<OhHaeng, number>,
  sajuData: SajuData,
): number {
  let score = 40; // 기본값

  systemElements.forEach(element => {
    // 같은 오행이 많으면 건강 증진
    const count = userElements[element];
    score += count * 4;

    // 상생 관계 체크
    const generatingElements = getGeneratingElements(element);
    generatingElements.forEach(genEl => {
      score += userElements[genEl] * 3;
    });

    // 상극 관계 체크 (건강에 악영향)
    const conflictingElements = getConflictingElements(element);
    conflictingElements.forEach(confEl => {
      score -= userElements[confEl] * 2;
    });
  });

  // 일간 특별 보너스
  const dayElement = CHEONGAN_OHHAENG[sajuData.day.gan];
  if (systemElements.includes(dayElement)) {
    score += 8;
  }

  return Math.max(20, Math.min(70, score));
}

/**
 * 상생 오행 찾기
 */
function getGeneratingElements(element: OhHaeng): OhHaeng[] {
  const generation: Record<OhHaeng, OhHaeng> = {
    목: '수', 화: '목', 토: '화', 금: '토', 수: '금',
  };
  return [generation[element]];
}

/**
 * 상극 오행 찾기
 */
function getConflictingElements(element: OhHaeng): OhHaeng[] {
  const conflict: Record<OhHaeng, OhHaeng> = {
    목: '금', 화: '수', 토: '목', 금: '화', 수: '토',
  };
  return [conflict[element]];
}

/**
 * 오행 취약점 체크
 */
function checkElementWeakness(
  sajuData: SajuData,
  primary: OhHaeng,
  secondary: OhHaeng,
): number {
  let weaknessPoint = 0;

  // 취약 장기 체크 (추후 권장사항 생성 시 활용 예정)
  const _weakOrgans = [
    ...(OHHAENG_HEALTH_WEAKNESS[primary] || []),
    ...(OHHAENG_HEALTH_WEAKNESS[secondary] || []),
  ];

  // 사주에 해당 오행이 부족하면 취약점 증가
  const userElements = getUserElements(sajuData);

  if (userElements[primary] === 0) {
    weaknessPoint += 15;
  } else if (userElements[primary] === 1) {
    weaknessPoint += 8;
  }

  if (userElements[secondary] === 0) {
    weaknessPoint += 10;
  } else if (userElements[secondary] === 1) {
    weaknessPoint += 5;
  }

  return weaknessPoint;
}

/**
 * 오행 강점 체크
 */
function checkElementStrength(
  sajuData: SajuData,
  primary: OhHaeng,
  secondary: OhHaeng,
): number {
  let strengthPoint = 0;

  const userElements = getUserElements(sajuData);

  // 해당 오행이 많으면 강점 증가
  if (userElements[primary] >= 3) {
    strengthPoint += 12;
  } else if (userElements[primary] === 2) {
    strengthPoint += 6;
  }

  if (userElements[secondary] >= 3) {
    strengthPoint += 8;
  } else if (userElements[secondary] === 2) {
    strengthPoint += 4;
  }

  return strengthPoint;
}

/**
 * 연령 보정 계수 계산
 */
function getAgeFactor(system: HealthSystem, currentAge: number): number {
  // 시스템별 연령대 요인 찾기
  const ageFactor = system.ageFactors.find(factor => {
    const [min, max] = parseAgeRange(factor.ageRange);
    return currentAge >= min && currentAge <= max;
  });

  return ageFactor?.factor || 1.0;
}

/**
 * 연령 범위 파싱
 */
function parseAgeRange(range: string): [number, number] {
  if (range.includes('+')) {
    const min = parseInt(range.replace('+', ''));
    return [min, 150];
  }

  const [min, max] = range.split('-').map(Number);
  return [min, max];
}

/**
 * 위험도 평가
 */
function evaluateRiskLevel(
  score: number,
  age: number,
  system: HealthSystem,
): 'low' | 'medium' | 'high' {
  // 점수 기반 기본 위험도
  let baseRisk: 'low' | 'medium' | 'high' = 'low';

  if (score < 40) {
    baseRisk = 'high';
  } else if (score < 60) {
    baseRisk = 'medium';
  }

  // 연령 요인 고려
  const ageFactor = system.ageFactors.find(factor => {
    const [min, max] = parseAgeRange(factor.ageRange);
    return age >= min && age <= max;
  });

  if (ageFactor && ageFactor.factor < 0.8 && score < 50) {
    baseRisk = 'high';
  }

  return baseRisk;
}

/**
 * 시스템별 권장사항 생성
 */
function generateSystemRecommendations(
  system: HealthSystem,
  score: number,
  age: number,
  sajuData: SajuData,
): string[] {
  const recommendations: string[] = [];

  // 점수 기반 권장사항
  if (score < 40) {
    recommendations.push(`${system.name} 정기 검진 권장`);
    recommendations.push(`${system.relatedOrgans.join(', ')} 건강에 특히 주의`);
  } else if (score < 60) {
    recommendations.push(`${system.name} 예방 관리 필요`);
  }

  // 연령 기반 권장사항
  const ageFactor = system.ageFactors.find(factor => {
    const [min, max] = parseAgeRange(factor.ageRange);
    return age >= min && age <= max;
  });

  if (ageFactor) {
    ageFactor.concerns.forEach(concern => {
      recommendations.push(`${concern} 주의`);
    });
  }

  // 오행 기반 권장사항
  const userElements = getUserElements(sajuData);
  if (userElements[system.primaryElement] === 0) {
    recommendations.push(`${system.primaryElement} 오행 보강 필요 (음식, 운동)`);
  }

  return recommendations;
}

/**
 * 전체 건강 추세 분석
 */
function analyzeTrend(scores: HealthScoreResult[]): 'improving' | 'stable' | 'declining' {
  const averageBase = scores.reduce((sum, s) => sum + s.baseScore, 0) / scores.length;
  const averageToday = scores.reduce((sum, s) => sum + s.todayScore, 0) / scores.length;

  const diff = averageToday - averageBase;

  if (diff > 5) return 'improving';
  if (diff < -5) return 'declining';
  return 'stable';
}

/**
 * 연령대 그룹 반환
 */
function getAgeGroup(age: number): string {
  if (age <= 20) return '청소년기';
  if (age <= 40) return '청년기';
  if (age <= 60) return '중년기';
  return '노년기';
}

/**
 * 연령대별 일반 주의사항
 */
function getGeneralConcernsByAge(age: number): string[] {
  if (age <= 20) {
    return ['성장 발육', '면역력 강화', '올바른 자세'];
  }
  if (age <= 40) {
    return ['스트레스 관리', '규칙적인 운동', '균형잡힌 식단'];
  }
  if (age <= 60) {
    return ['만성질환 예방', '정기 검진', '체력 유지'];
  }
  return ['낙상 예방', '치매 예방', '영양 관리', '사회 활동'];
}

/**
 * 종합 권장사항 생성
 */
function generateRecommendations(
  scores: HealthScoreResult[],
  age: number,
  sajuData: SajuData,
): { immediate: string[]; longTerm: string[] } {
  const immediate: string[] = [];
  const longTerm: string[] = [];

  // 즉각 조치 필요 (고위험 시스템)
  const highRisk = scores.filter(s => s.riskLevel === 'high');
  if (highRisk.length > 0) {
    immediate.push('종합 건강 검진 권장');
    highRisk.forEach(system => {
      immediate.push(`${system.systemName} 전문의 상담`);
    });
  }

  // 장기 관리 계획
  const userElements = getUserElements(sajuData);
  const weakElements = (Object.entries(userElements) as [OhHaeng, number][])
    .filter(([_, count]) => count === 0)
    .map(([element, _]) => element);

  if (weakElements.length > 0) {
    longTerm.push(`부족한 오행(${weakElements.join(', ')}) 보강`);
    longTerm.push('오행 균형 식단 및 생활습관');
  }

  // 연령대별 권장사항
  if (age > 40) {
    longTerm.push('정기적인 건강 검진 (6개월~1년)');
  }
  if (age > 60) {
    longTerm.push('근력 운동 및 유연성 훈련');
    longTerm.push('사회 활동 및 뇌 자극');
  }

  return { immediate, longTerm };
}

/**
 * 건강 점수를 차트 데이터 형식으로 변환
 */
export function convertToChartData(
  healthReport: ComprehensiveHealthReport,
  timeFrame: 'base' | 'today' | 'month' | 'year' = 'base',
): {
  labels: string[];
  scores: number[];
  colors: string[];
} {
  const labels = healthReport.systems.map(s => s.systemName);

  let scores: number[];
  switch (timeFrame) {
    case 'today':
      scores = healthReport.systems.map(s => s.todayScore);
      break;
    case 'month':
      scores = healthReport.systems.map(s => s.monthScore);
      break;
    case 'year':
      scores = healthReport.systems.map(s => s.yearScore);
      break;
    default:
      scores = healthReport.systems.map(s => s.baseScore);
  }

  // 위험도별 색상
  const colors = healthReport.systems.map(s => {
    switch (s.riskLevel) {
      case 'high': return '#EF4444'; // 빨강
      case 'medium': return '#F59E0B'; // 주황
      default: return '#10B981'; // 녹색
    }
  });

  return { labels, scores, colors };
}
