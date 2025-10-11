/**
 * 재물운 점수 계산 모듈
 *
 * 9대 재물운 시스템에 대한 사주 기반 점수 계산
 * 정재/편재 + 십신론 + 오행론 통합 알고리즘
 *
 * @author Master Kim Hyun-soo (명리학 전문가) + Jake Kim (프론트엔드 아키텍트)
 * @version 1.0
 */

import {
  WEALTH_SYSTEMS,
  WealthSystem,
  OhHaeng,
} from '@/data/wealthSystemData';
import {
  SajuData,
  CHEONGAN_OHHAENG,
  JIJI_OHHAENG,
  calculateTimeBonus,
} from './sajuScoreCalculator';

export interface WealthScoreResult {
  systemId: string;
  systemName: string;
  baseScore: number;           // 기본 재물운 점수 (20-70)
  todayScore: number;          // 오늘의 재물운 점수
  monthScore: number;          // 이달의 재물운 점수
  yearScore: number;           // 올해의 재물운 점수
  primaryElement: OhHaeng;     // 주 오행
  secondaryElement: OhHaeng;   // 보조 오행
  potential: 'high' | 'medium' | 'low';  // 재물 잠재력
  category: 'income' | 'asset' | 'investment';
  recommendations: string[];   // 재물운 권장사항
}

export interface ComprehensiveWealthReport {
  overall: {
    averageScore: number;
    trend: 'rising' | 'stable' | 'falling';
    strongSystems: string[];
    weakSystems: string[];
    bestOpportunity: string;
  };
  systems: WealthScoreResult[];
  wealthType: {
    primary: string;      // 주요 재물 유형
    secondary: string;    // 보조 재물 유형
    avoid: string;        // 피해야 할 재물 유형
  };
  recommendations: {
    immediate: string[];
    longTerm: string[];
  };
}

/**
 * 9대 재물운 시스템 점수 계산 (메인 함수)
 */
export function calculateWealthScores(
  sajuData: SajuData,
  birthYear: number,
  targetDate?: Date,
): ComprehensiveWealthReport {
  const now = targetDate || new Date();

  // 1. 각 재물운 시스템별 점수 계산
  const systemScores: WealthScoreResult[] = WEALTH_SYSTEMS.map(system =>
    calculateSingleWealthScore(system, sajuData, birthYear, now),
  );

  // 2. 전체 재물운 통계 계산
  const averageScore = systemScores.reduce((sum, s) => sum + s.baseScore, 0) / systemScores.length;

  // 3. 강점/약점 시스템 식별
  const strongSystems = systemScores
    .filter(s => s.baseScore >= 65)
    .map(s => s.systemName);

  const weakSystems = systemScores
    .filter(s => s.baseScore < 45)
    .map(s => s.systemName);

  // 4. 최고 기회 식별
  const bestSystem = systemScores.reduce((best, current) =>
    current.yearScore > best.yearScore ? current : best,
  );

  // 5. 추세 분석
  const trend = analyzeWealthTrend(systemScores);

  // 6. 재물 유형 분석
  const wealthType = analyzeWealthType(systemScores, sajuData);

  // 7. 권장사항 생성
  const recommendations = generateWealthRecommendations(systemScores, sajuData);

  return {
    overall: {
      averageScore: Math.round(averageScore),
      trend,
      strongSystems,
      weakSystems,
      bestOpportunity: bestSystem.systemName,
    },
    systems: systemScores,
    wealthType,
    recommendations,
  };
}

/**
 * 개별 재물운 시스템 점수 계산
 */
function calculateSingleWealthScore(
  system: WealthSystem,
  sajuData: SajuData,
  birthYear: number,
  targetDate: Date,
): WealthScoreResult {
  // 1. 사주의 오행 분포 분석
  const userElements = getUserElements(sajuData);

  // 2. 시스템 오행과의 관계 점수
  const elementScore = calculateWealthElementRelation(
    [system.primaryElement, system.secondaryElement],
    userElements,
    sajuData,
  );

  // 3. 재성(財星) 분석
  const wealthStarBonus = analyzeWealthStar(sajuData, system);

  // 4. 식상(食傷) 분석 (재물의 원천)
  const foodInjuryBonus = analyzeFoodInjury(sajuData, system);

  // 5. 비겁(比劫) 분석 (재물 경쟁)
  const rivalryPenalty = analyzeRivalry(sajuData);

  // 6. 기본 재물운 점수
  const baseScore = elementScore + wealthStarBonus + foodInjuryBonus - rivalryPenalty;

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

  // baseScore에 보너스를 더함 (범위 20-90)
  const todayScore = Math.max(20, Math.min(90, Math.round(baseScore + todayBonus)));
  const monthScore = Math.max(20, Math.min(90, Math.round(baseScore + monthBonus)));
  const yearScore = Math.max(20, Math.min(90, Math.round(baseScore + yearBonus)));

  // 8. 재물 잠재력 평가
  const potential = evaluateWealthPotential(baseScore, system, sajuData);

  // 9. 개인화 권장사항 생성
  const recommendations = generateSystemWealthRecommendations(
    system,
    baseScore,
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
    potential,
    category: system.category,
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
 * 재물운 오행 관계 점수 계산
 */
function calculateWealthElementRelation(
  systemElements: OhHaeng[],
  userElements: Record<OhHaeng, number>,
  sajuData: SajuData,
): number {
  let score = 40; // 기본값

  systemElements.forEach(element => {
    // 같은 오행이 많으면 재물운 증진
    const count = userElements[element];
    score += count * 5;

    // 상생 관계 체크 (재물을 생함)
    const generatingElements = getGeneratingElements(element);
    generatingElements.forEach(genEl => {
      score += userElements[genEl] * 4;
    });

    // 상극 관계 체크 (재물을 극함 - 감점 작음)
    const conflictingElements = getConflictingElements(element);
    conflictingElements.forEach(confEl => {
      score -= userElements[confEl] * 2;
    });
  });

  // 일간 특별 보너스
  const dayElement = CHEONGAN_OHHAENG[sajuData.day.gan];
  if (systemElements.includes(dayElement)) {
    score += 10;
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
 * 재성(財星) 분석
 * 일간이 극하는 오행 = 재성
 */
function analyzeWealthStar(sajuData: SajuData, system: WealthSystem): number {
  const dayElement = CHEONGAN_OHHAENG[sajuData.day.gan];
  const wealthElement = getConflictingElements(dayElement)[0]; // 일간이 극하는 오행

  let bonus = 0;

  // 시스템의 오행이 재성과 일치하면 큰 가산점
  if (system.primaryElement === wealthElement) {
    bonus += 15;
  }
  if (system.secondaryElement === wealthElement) {
    bonus += 10;
  }

  // 사주에 재성이 많을수록 가산점 (단, 너무 많으면 감점)
  const userElements = getUserElements(sajuData);
  const wealthCount = userElements[wealthElement];

  if (wealthCount === 1) bonus += 8;
  else if (wealthCount === 2) bonus += 12;
  else if (wealthCount === 3) bonus += 10;
  else if (wealthCount >= 4) bonus -= 5; // 재성 과다 - 재물 탐욕

  return bonus;
}

/**
 * 식상(食傷) 분석
 * 일간이 생하는 오행 = 식상 (재물의 원천)
 */
function analyzeFoodInjury(sajuData: SajuData, system: WealthSystem): number {
  const dayElement = CHEONGAN_OHHAENG[sajuData.day.gan];
  const foodElement = getOppositeGeneration(dayElement); // 일간이 생하는 오행

  let bonus = 0;

  // 식상이 있어야 재물을 벌 수 있음
  const userElements = getUserElements(sajuData);
  const foodCount = userElements[foodElement];

  if (foodCount === 0) {
    bonus -= 10; // 식상 없음 - 재물 원천 부족
  } else if (foodCount === 1) {
    bonus += 8;
  } else if (foodCount >= 2) {
    bonus += 15; // 식상 많음 - 재물 원천 풍부
  }

  // 사업소득운/투자소득운은 식상이 특히 중요
  if ((system.id === 'business_income' || system.id === 'investment_income') && foodCount >= 2) {
    bonus += 10;
  }

  return bonus;
}

/**
 * 일간이 생하는 오행 찾기
 */
function getOppositeGeneration(element: OhHaeng): OhHaeng {
  const generation: Record<OhHaeng, OhHaeng> = {
    목: '화', 화: '토', 토: '금', 금: '수', 수: '목',
  };
  return generation[element];
}

/**
 * 비겁(比劫) 분석
 * 같은 오행 = 비견, 겁재 (재물 경쟁)
 */
function analyzeRivalry(sajuData: SajuData): number {
  const dayElement = CHEONGAN_OHHAENG[sajuData.day.gan];
  const userElements = getUserElements(sajuData);
  const rivalCount = userElements[dayElement] - 1; // 일간 제외

  let penalty = 0;

  // 비겁이 많으면 재물 경쟁 심화
  if (rivalCount === 0) {
    penalty = 0; // 비겁 없음 - 독립적
  } else if (rivalCount === 1) {
    penalty = 3; // 적당한 경쟁
  } else if (rivalCount === 2) {
    penalty = 8; // 경쟁 심함
  } else {
    penalty = 15; // 과도한 경쟁 - 재물 분산
  }

  return penalty;
}

/**
 * 재물 잠재력 평가
 */
function evaluateWealthPotential(
  score: number,
  system: WealthSystem,
  sajuData: SajuData,
): 'high' | 'medium' | 'low' {
  if (score >= 65) return 'high';
  if (score >= 45) return 'medium';
  return 'low';
}

/**
 * 시스템별 재물 권장사항 생성
 */
function generateSystemWealthRecommendations(
  system: WealthSystem,
  score: number,
  sajuData: SajuData,
): string[] {
  const recommendations: string[] = [];

  // 점수 기반 권장사항
  if (score >= 65) {
    recommendations.push(`${system.name} 적극 추천 - 높은 잠재력`);
  } else if (score >= 45) {
    recommendations.push(`${system.name} 신중한 접근 권장`);
  } else {
    recommendations.push(`${system.name} 리스크 관리 필요`);
  }

  // 카테고리별 권장사항
  if (system.category === 'income') {
    if (score >= 60) {
      recommendations.push('적극적인 소득 활동 권장');
    } else {
      recommendations.push('안정적인 소득원 확보 우선');
    }
  } else if (system.category === 'asset') {
    if (score >= 60) {
      recommendations.push('자산 축적에 유리한 시기');
    } else {
      recommendations.push('소액 분산 투자 권장');
    }
  } else if (system.category === 'investment') {
    if (score >= 60) {
      recommendations.push('적극적인 재테크 가능');
    } else {
      recommendations.push('보수적 재테크 권장');
    }
  }

  return recommendations;
}

/**
 * 재물운 추세 분석
 */
function analyzeWealthTrend(scores: WealthScoreResult[]): 'rising' | 'stable' | 'falling' {
  const averageBase = scores.reduce((sum, s) => sum + s.baseScore, 0) / scores.length;
  const averageYear = scores.reduce((sum, s) => sum + s.yearScore, 0) / scores.length;

  const diff = averageYear - averageBase;

  if (diff > 8) return 'rising';
  if (diff < -8) return 'falling';
  return 'stable';
}

/**
 * 재물 유형 분석
 */
function analyzeWealthType(
  scores: WealthScoreResult[],
  sajuData: SajuData,
): { primary: string; secondary: string; avoid: string } {
  // 점수 순으로 정렬
  const sorted = [...scores].sort((a, b) => b.baseScore - a.baseScore);

  const primary = sorted[0].systemName;
  const secondary = sorted[1].systemName;
  const avoid = sorted[sorted.length - 1].systemName;

  return { primary, secondary, avoid };
}

/**
 * 종합 재물운 권장사항 생성
 */
function generateWealthRecommendations(
  scores: WealthScoreResult[],
  sajuData: SajuData,
): { immediate: string[]; longTerm: string[] } {
  const immediate: string[] = [];
  const longTerm: string[] = [];

  // 즉각 조치 사항
  const highPotential = scores.filter(s => s.potential === 'high');
  if (highPotential.length > 0) {
    immediate.push(`강점 활용: ${highPotential[0].systemName} 집중`);
  }

  const lowPotential = scores.filter(s => s.potential === 'low');
  if (lowPotential.length >= 3) {
    immediate.push('재테크 교육 및 전문가 상담 권장');
  }

  // 장기 관리 계획
  const userElements = getUserElements(sajuData);
  const dayElement = CHEONGAN_OHHAENG[sajuData.day.gan];
  const wealthElement = getConflictingElements(dayElement)[0];

  if (userElements[wealthElement] === 0) {
    longTerm.push(`재성(${wealthElement}) 보강 - 재물운 기초 다지기`);
  }

  const foodElement = getOppositeGeneration(dayElement);
  if (userElements[foodElement] === 0) {
    longTerm.push(`식상(${foodElement}) 보강 - 재물 원천 확보`);
  }

  longTerm.push('분산 투자로 리스크 관리');
  longTerm.push('장기적 자산 축적 계획 수립');

  return { immediate, longTerm };
}
