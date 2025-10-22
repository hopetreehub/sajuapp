/**
 * 인간관계운 점수 계산 모듈
 *
 * 7대 인간관계운 시스템에 대한 사주 기반 점수 계산
 * 십신론 + 합형충파해론 통합 알고리즘
 *
 * @author Master Kim Hyun-soo (명리학 전문가) + Dr. Emma Rodriguez (심리학)
 * @version 1.0
 */

import {
  RELATIONSHIP_SYSTEMS,
  RelationshipSystem,
  OhHaeng,
  AGE_RELATIONSHIP_WEIGHT,
} from '@/data/relationshipSystemData';
import {
  SajuData,
  CHEONGAN_OHHAENG,
  JIJI_OHHAENG,
  calculateTimeBonus,
  JiJi,
} from './sajuScoreCalculator';

// 한자 → 한글 지지 변환 맵
const HANJA_TO_KOREAN: Record<string, JiJi> = {
  '子': '자', '丑': '축', '寅': '인', '卯': '묘', '辰': '진', '巳': '사',
  '午': '오', '未': '미', '申': '신', '酉': '유', '戌': '술', '亥': '해',
};

export interface RelationshipScoreResult {
  systemId: string;
  systemName: string;
  baseScore: number;           // 기본 인간관계운 점수 (20-90)
  todayScore: number;          // 오늘의 인간관계운 점수
  monthScore: number;          // 이달의 인간관계운 점수
  yearScore: number;           // 올해의 인간관계운 점수
  primaryElement: OhHaeng;     // 주 오행
  secondaryElement: OhHaeng;   // 보조 오행
  harmony: 'excellent' | 'good' | 'fair' | 'poor';  // 조화도
  category: 'family' | 'social' | 'work';
  strengths: string[];         // 강점
  weaknesses: string[];        // 약점
  advice: string[];            // 조언
}

export interface ComprehensiveRelationshipReport {
  overall: {
    averageScore: number;
    socialSkill: 'high' | 'medium' | 'low';  // 사회성
    conflictLevel: 'high' | 'medium' | 'low';  // 갈등 수준
    strongRelationships: string[];
    weakRelationships: string[];
    bestPartner: string;  // 최고 인연
  };
  systems: RelationshipScoreResult[];
  personalityStyle: {
    type: string;         // 인간관계 유형
    description: string;
    bestApproach: string; // 최적 접근법
  };
  recommendations: {
    immediate: string[];
    longTerm: string[];
  };
  harmonyAnalysis: {
    harmonies: string[];  // 합 관계
    conflicts: string[];  // 충형파해 관계
  };
}

/**
 * 7대 인간관계운 시스템 점수 계산 (메인 함수)
 */
export function calculateRelationshipScores(
  sajuData: SajuData,
  birthYear: number,
  targetDate?: Date,
): ComprehensiveRelationshipReport {
  const now = targetDate || new Date();
  const age = now.getFullYear() - birthYear + 1;

  // 1. 각 인간관계운 시스템별 점수 계산
  const systemScores: RelationshipScoreResult[] = RELATIONSHIP_SYSTEMS.map(system =>
    calculateSingleRelationshipScore(system, sajuData, birthYear, age, now),
  );

  // 2. 전체 인간관계운 통계 계산
  const averageScore = systemScores.reduce((sum, s) => sum + s.baseScore, 0) / systemScores.length;

  // 3. 사회성 평가
  const socialSkill = evaluateSocialSkill(systemScores, sajuData);

  // 4. 갈등 수준 평가
  const conflictLevel = evaluateConflictLevel(sajuData);

  // 5. 강점/약점 관계 식별
  const strongRelationships = systemScores
    .filter(s => s.baseScore >= 70)
    .map(s => s.systemName);

  const weakRelationships = systemScores
    .filter(s => s.baseScore < 50)
    .map(s => s.systemName);

  // 6. 최고 인연 식별
  const bestSystem = systemScores.reduce((best, current) =>
    current.baseScore > best.baseScore ? current : best,
  );

  // 7. 인간관계 유형 분석
  const personalityStyle = analyzePersonalityStyle(systemScores, sajuData);

  // 8. 합형충파해 분석
  const harmonyAnalysis = analyzeHarmonyConflict(sajuData);

  // 9. 권장사항 생성
  const recommendations = generateRelationshipRecommendations(
    systemScores,
    sajuData,
    harmonyAnalysis,
  );

  return {
    overall: {
      averageScore: Math.round(averageScore),
      socialSkill,
      conflictLevel,
      strongRelationships,
      weakRelationships,
      bestPartner: bestSystem.systemName,
    },
    systems: systemScores,
    personalityStyle,
    recommendations,
    harmonyAnalysis,
  };
}

/**
 * 개별 인간관계운 시스템 점수 계산
 */
function calculateSingleRelationshipScore(
  system: RelationshipSystem,
  sajuData: SajuData,
  birthYear: number,
  age: number,
  targetDate: Date,
): RelationshipScoreResult {
  // 1. 사주의 오행 분포 분석
  const userElements = getUserElements(sajuData);

  // 2. 시스템 오행과의 관계 점수
  const elementScore = calculateRelationshipElementScore(
    [system.primaryElement, system.secondaryElement],
    userElements,
    sajuData,
  );

  // 3. 십신 분석 (인간관계의 핵심)
  const sibsinBonus = analyzeSibsinForRelationship(sajuData, system);

  // 4. 합형충파해 분석
  const harmonyConflictScore = analyzeHarmonyConflictScore(sajuData, system);

  // 5. 연령대별 가중치 적용
  const ageWeight = getAgeWeight(age, system.id);

  // 6. 기본 인간관계운 점수
  const baseScore = (elementScore + sibsinBonus + harmonyConflictScore) * ageWeight;

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

  // baseScore에 보너스를 더하고 연령 가중치 재적용 (범위 20-90)
  const todayScore = Math.max(20, Math.min(90, Math.round((baseScore + todayBonus))));
  const monthScore = Math.max(20, Math.min(90, Math.round((baseScore + monthBonus))));
  const yearScore = Math.max(20, Math.min(90, Math.round((baseScore + yearBonus))));

  // 8. 조화도 평가
  const harmony = evaluateHarmony(baseScore);

  // 9. 강점/약점 추출
  const { strengths, weaknesses } = extractStrengthsWeaknesses(
    system,
    baseScore,
    sajuData,
  );

  // 10. 맞춤 조언 생성
  const advice = generateSystemAdvice(system, baseScore, sajuData);

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
    harmony,
    category: system.category,
    strengths,
    weaknesses,
    advice,
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
 * 인간관계 오행 관계 점수 계산
 */
function calculateRelationshipElementScore(
  systemElements: OhHaeng[],
  userElements: Record<OhHaeng, number>,
  sajuData: SajuData,
): number {
  let score = 40; // 기본값

  systemElements.forEach(element => {
    // 같은 오행이 많으면 공감 능력 증진
    const count = userElements[element];
    score += count * 5;

    // 상생 관계 체크 (조화로운 관계)
    const generatingElements = getGeneratingElements(element);
    generatingElements.forEach(genEl => {
      score += userElements[genEl] * 6;
    });

    // 상극 관계 체크 (긴장 관계 - 약간 감점)
    const conflictingElements = getConflictingElements(element);
    conflictingElements.forEach(confEl => {
      score -= userElements[confEl] * 3;
    });
  });

  // 일간 특별 보너스 (자아 인식)
  const dayElement = CHEONGAN_OHHAENG[sajuData.day.gan];
  if (systemElements.includes(dayElement)) {
    score += 12;
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
 * 십신 분석 (인간관계의 핵심)
 */
function analyzeSibsinForRelationship(sajuData: SajuData, system: RelationshipSystem): number {
  let bonus = 0;

  // 십신 카운트 (간단한 구현 - 실제로는 더 복잡)
  const sibsinCount: Record<string, number> = {
    비견: 0, 겁재: 0, 식신: 0, 상관: 0, 정재: 0,
    편재: 0, 정관: 0, 편관: 0, 정인: 0, 편인: 0,
  };

  // 시스템별 관련 십신 체크
  system.relatedSibsin.forEach(sibsin => {
    const count = sibsinCount[sibsin] || 0;

    if (count === 1) bonus += 12;
    else if (count === 2) bonus += 18; // 최적
    else if (count >= 3) bonus += 10; // 과다하면 감점
  });

  // 시스템별 특수 보너스
  if (system.id === 'parents' || system.id === 'boss') {
    // 인수(정인/편인)가 있으면 존경심 증가
    bonus += (sibsinCount['정인'] + sibsinCount['편인']) * 8;
  }

  if (system.id === 'children') {
    // 식상(식신/상관)이 있으면 소통 능력 증가
    bonus += (sibsinCount['식신'] + sibsinCount['상관']) * 8;
  }

  if (system.id === 'spouse') {
    // 재성(정재/편재)과 관성(정관/편관)의 균형
    const jaeCount = sibsinCount['정재'] + sibsinCount['편재'];
    const gwanCount = sibsinCount['정관'] + sibsinCount['편관'];

    if (jaeCount > 0 && gwanCount > 0) {
      bonus += 15; // 재관 균형
    }
  }

  if (system.id === 'friends' || system.id === 'siblings' || system.id === 'colleagues') {
    // 비견이 적당하면 협력 능력 증가
    const bigeonCount = sibsinCount['비견'];
    if (bigeonCount === 1 || bigeonCount === 2) {
      bonus += 12;
    } else if (bigeonCount >= 3) {
      bonus -= 8; // 비겁 과다 - 경쟁 심화
    }
  }

  return bonus;
}

/**
 * 합형충파해 점수 분석
 */
function analyzeHarmonyConflictScore(sajuData: SajuData, _system: RelationshipSystem): number {
  let score = 0;

  const jijis = [
    sajuData.year.ji,
    sajuData.month.ji,
    sajuData.day.ji,
    sajuData.time.ji,
  ];

  // 합(合) 체크 - 조화로운 관계
  const harmonies = countHarmonies(jijis);
  score += harmonies * 8;

  // 충(沖) 체크 - 정면 충돌
  const conflicts = countConflicts(jijis);
  score -= conflicts * 10;

  // 형(刑) 체크 - 숨은 갈등
  const punishments = countPunishments(jijis);
  score -= punishments * 8;

  // 파(破) 체크 - 깨짐
  const destructions = countDestructions(jijis);
  score -= destructions * 6;

  // 해(害) 체크 - 해침
  const harms = countHarms(jijis);
  score -= harms * 7;

  return score;
}

/**
 * 합 개수 세기
 */
function countHarmonies(jijis: string[]): number {
  const harmonyPairs = [
    ['子', '丑'], ['寅', '亥'], ['卯', '戌'],
    ['辰', '酉'], ['巳', '申'], ['午', '未'],
  ];

  let count = 0;
  for (const pair of harmonyPairs) {
    if (jijis.includes(pair[0]) && jijis.includes(pair[1])) {
      count++;
    }
  }

  return count;
}

/**
 * 충 개수 세기
 */
function countConflicts(jijis: string[]): number {
  const conflictPairs = [
    ['子', '午'], ['丑', '未'], ['寅', '申'],
    ['卯', '酉'], ['辰', '戌'], ['巳', '亥'],
  ];

  let count = 0;
  for (const pair of conflictPairs) {
    if (jijis.includes(pair[0]) && jijis.includes(pair[1])) {
      count++;
    }
  }

  return count;
}

/**
 * 형 개수 세기
 */
function countPunishments(jijis: string[]): number {
  let count = 0;

  // 寅巳申 삼형
  if (jijis.includes('寅') && jijis.includes('巳') && jijis.includes('申')) {
    count++;
  }

  // 丑戌未 삼형
  if (jijis.includes('丑') && jijis.includes('戌') && jijis.includes('未')) {
    count++;
  }

  // 子卯 형
  if (jijis.includes('子') && jijis.includes('卯')) {
    count++;
  }

  return count;
}

/**
 * 파 개수 세기
 */
function countDestructions(jijis: string[]): number {
  const destructionPairs = [
    ['子', '酉'], ['午', '卯'], ['辰', '丑'],
    ['戌', '未'], ['寅', '亥'], ['巳', '申'],
  ];

  let count = 0;
  for (const pair of destructionPairs) {
    if (jijis.includes(pair[0]) && jijis.includes(pair[1])) {
      count++;
    }
  }

  return count;
}

/**
 * 해 개수 세기
 */
function countHarms(jijis: string[]): number {
  const harmPairs = [
    ['子', '未'], ['丑', '午'], ['寅', '巳'],
    ['卯', '辰'], ['申', '亥'], ['酉', '戌'],
  ];

  let count = 0;
  for (const pair of harmPairs) {
    if (jijis.includes(pair[0]) && jijis.includes(pair[1])) {
      count++;
    }
  }

  return count;
}

/**
 * 연령대별 가중치 가져오기
 */
function getAgeWeight(age: number, systemId: string): number {
  let ageGroup: keyof typeof AGE_RELATIONSHIP_WEIGHT;

  if (age <= 20) ageGroup = '0-20';
  else if (age <= 40) ageGroup = '21-40';
  else if (age <= 60) ageGroup = '41-60';
  else ageGroup = '61+';

  const weights = AGE_RELATIONSHIP_WEIGHT[ageGroup].weights;
  return weights[systemId as keyof typeof weights] || 1.0;
}

/**
 * 조화도 평가
 */
function evaluateHarmony(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 75) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 45) return 'fair';
  return 'poor';
}

/**
 * 강점/약점 추출
 */
function extractStrengthsWeaknesses(
  system: RelationshipSystem,
  score: number,
  sajuData: SajuData,
): { strengths: string[]; weaknesses: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (score >= 70) {
    strengths.push(`${system.name} 매우 원만`);
    strengths.push('자연스러운 소통');
  } else if (score >= 50) {
    strengths.push('평균적인 관계 유지');
  } else {
    weaknesses.push(`${system.name} 개선 필요`);
    weaknesses.push('의식적인 노력 필요');
  }

  // 카테고리별 특성
  if (system.category === 'family') {
    if (score >= 60) {
      strengths.push('가족 화목');
    } else {
      weaknesses.push('가족 소통 강화 필요');
    }
  } else if (system.category === 'social') {
    if (score >= 60) {
      strengths.push('사교성 양호');
    } else {
      weaknesses.push('사회성 개발 필요');
    }
  } else if (system.category === 'work') {
    if (score >= 60) {
      strengths.push('직장 적응력 양호');
    } else {
      weaknesses.push('직장 인간관계 주의');
    }
  }

  return { strengths, weaknesses };
}

/**
 * 시스템별 맞춤 조언 생성
 */
function generateSystemAdvice(
  system: RelationshipSystem,
  score: number,
  sajuData: SajuData,
): string[] {
  const advice: string[] = [];

  if (score >= 70) {
    advice.push(`${system.name} 강점 활용하여 다른 관계 개선`);
  } else if (score >= 50) {
    advice.push(`${system.name} 꾸준한 관심과 노력 유지`);
  } else {
    advice.push(`${system.name} 적극적인 개선 필요`);
    advice.push('전문가 상담이나 교육 고려');
  }

  // 시스템별 특화 조언
  if (system.id === 'parents') {
    advice.push('효도는 정성과 시간 투자');
  } else if (system.id === 'spouse') {
    advice.push('소통과 이해가 핵심');
  } else if (system.id === 'children') {
    advice.push('경청과 공감이 중요');
  } else if (system.id === 'boss') {
    advice.push('존중과 보고가 기본');
  }

  return advice;
}

/**
 * 사회성 평가
 */
function evaluateSocialSkill(
  scores: RelationshipScoreResult[],
  sajuData: SajuData,
): 'high' | 'medium' | 'low' {
  // 사회 관계 + 직장 관계 평균
  const socialScores = scores.filter(s =>
    s.category === 'social' || s.category === 'work',
  );
  const average = socialScores.reduce((sum, s) => sum + s.baseScore, 0) / socialScores.length;

  if (average >= 65) return 'high';
  if (average >= 50) return 'medium';
  return 'low';
}

/**
 * 갈등 수준 평가
 */
function evaluateConflictLevel(sajuData: SajuData): 'high' | 'medium' | 'low' {
  const jijis = [
    sajuData.year.ji,
    sajuData.month.ji,
    sajuData.day.ji,
    sajuData.time.ji,
  ];

  const conflicts = countConflicts(jijis);
  const punishments = countPunishments(jijis);
  const total = conflicts + punishments;

  if (total >= 2) return 'high';
  if (total >= 1) return 'medium';
  return 'low';
}

/**
 * 인간관계 유형 분석
 */
function analyzePersonalityStyle(
  scores: RelationshipScoreResult[],
  sajuData: SajuData,
): { type: string; description: string; bestApproach: string } {
  const familyAvg = scores.filter(s => s.category === 'family')
    .reduce((sum, s) => sum + s.baseScore, 0) / 3;
  const socialAvg = scores.filter(s => s.category === 'social')
    .reduce((sum, s) => sum + s.baseScore, 0) / 2;
  const workAvg = scores.filter(s => s.category === 'work')
    .reduce((sum, s) => sum + s.baseScore, 0) / 2;

  if (familyAvg >= 65 && socialAvg >= 65 && workAvg >= 65) {
    return {
      type: '올라운더형',
      description: '모든 관계에서 균형잡힌 능력',
      bestApproach: '현재 강점 유지하며 약점 보완',
    };
  } else if (socialAvg >= workAvg && socialAvg >= familyAvg) {
    return {
      type: '사교형',
      description: '친구와 배우자 관계에 강점',
      bestApproach: '사회성을 가족/직장에도 활용',
    };
  } else if (workAvg >= socialAvg && workAvg >= familyAvg) {
    return {
      type: '직장형',
      description: '상사와 동료 관계에 강점',
      bestApproach: '직장 경험을 다른 관계에 응용',
    };
  } else {
    return {
      type: '가족형',
      description: '가족 관계에 강점',
      bestApproach: '가족 경험을 사회로 확장',
    };
  }
}

/**
 * 합형충파해 분석
 */
function analyzeHarmonyConflict(sajuData: SajuData): { harmonies: string[]; conflicts: string[] } {
  const jijis = [
    sajuData.year.ji,
    sajuData.month.ji,
    sajuData.day.ji,
    sajuData.time.ji,
  ];

  const harmonies: string[] = [];
  const conflicts: string[] = [];

  // 합 찾기
  const harmonyPairs: [JiJi, JiJi, string][] = [
    [HANJA_TO_KOREAN['子'], HANJA_TO_KOREAN['丑'], '수토합'],
    [HANJA_TO_KOREAN['寅'], HANJA_TO_KOREAN['亥'], '목목합'],
    [HANJA_TO_KOREAN['卯'], HANJA_TO_KOREAN['戌'], '화합'],
    [HANJA_TO_KOREAN['辰'], HANJA_TO_KOREAN['酉'], '금합'],
    [HANJA_TO_KOREAN['巳'], HANJA_TO_KOREAN['申'], '수합'],
    [HANJA_TO_KOREAN['午'], HANJA_TO_KOREAN['未'], '토합'],
  ];

  for (const [ji1, ji2, name] of harmonyPairs) {
    if (jijis.includes(ji1) && jijis.includes(ji2)) {
      harmonies.push(`${name} - 조화로운 관계 형성`);
    }
  }

  // 충 찾기
  const conflictPairs: [JiJi, JiJi, string][] = [
    [HANJA_TO_KOREAN['子'], HANJA_TO_KOREAN['午'], '자오충'],
    [HANJA_TO_KOREAN['丑'], HANJA_TO_KOREAN['未'], '축미충'],
    [HANJA_TO_KOREAN['寅'], HANJA_TO_KOREAN['申'], '인신충'],
    [HANJA_TO_KOREAN['卯'], HANJA_TO_KOREAN['酉'], '묘유충'],
    [HANJA_TO_KOREAN['辰'], HANJA_TO_KOREAN['戌'], '진술충'],
    [HANJA_TO_KOREAN['巳'], HANJA_TO_KOREAN['亥'], '사해충'],
  ];

  for (const [ji1, ji2, name] of conflictPairs) {
    if (jijis.includes(ji1) && jijis.includes(ji2)) {
      conflicts.push(`${name} - 정면 충돌 주의`);
    }
  }

  return { harmonies, conflicts };
}

/**
 * 종합 인간관계 권장사항 생성
 */
function generateRelationshipRecommendations(
  scores: RelationshipScoreResult[],
  sajuData: SajuData,
  harmonyAnalysis: { harmonies: string[]; conflicts: string[] },
): { immediate: string[]; longTerm: string[] } {
  const immediate: string[] = [];
  const longTerm: string[] = [];

  // 즉각 조치 사항
  const poorRelationships = scores.filter(s => s.harmony === 'poor');
  if (poorRelationships.length > 0) {
    immediate.push(`${poorRelationships[0].systemName} 개선 집중`);
    immediate.push('적극적인 소통과 이해 노력');
  }

  if (harmonyAnalysis.conflicts.length >= 2) {
    immediate.push('갈등 관리 기술 학습');
    immediate.push('감정 조절 연습');
  }

  // 장기 관리 계획
  longTerm.push('정기적인 관계 점검 시간 확보');
  longTerm.push('경청과 공감 능력 개발');

  if (harmonyAnalysis.harmonies.length > 0) {
    longTerm.push('조화 관계를 활용한 네트워크 확장');
  }

  longTerm.push('갈등 해결 교육이나 상담');
  longTerm.push('인간관계 독서나 강연 참여');

  return { immediate, longTerm };
}
