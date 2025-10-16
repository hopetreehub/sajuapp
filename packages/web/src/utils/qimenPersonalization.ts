/**
 * 귀문둔갑 개인화 점수 계산 시스템
 *
 * 오행 상생상극 기반으로 개인별 점수 조정
 * @author Claude Code
 * @version 1.0.0
 */

import type { QimenChart, Palace } from '@/types/qimen';
import { getGateData, getStarData } from '@/data/qimenDunjiaData';
import type { BirthYearAnalysis } from './birthYearAnalysis';

// ============================================
// 오행 상생상극 시스템
// ============================================

/**
 * 오행 상생 관계
 * 목생화, 화생토, 토생금, 금생수, 수생목
 */
const ELEMENT_GENERATION: Record<string, string> = {
  '목': '화',  // 木生火
  '화': '토',  // 火生土
  '토': '금',  // 土生金
  '금': '수',  // 金生水
  '수': '목',  // 水生木
};

/**
 * 오행 상극 관계
 * 목극토, 토극수, 수극화, 화극금, 금극목
 */
const ELEMENT_DESTRUCTION: Record<string, string> = {
  '목': '토',  // 木克土
  '토': '수',  // 土克水
  '수': '화',  // 水克火
  '화': '금',  // 火克金
  '금': '목',  // 金克木
};

/**
 * 오행 관계 판단
 * @param myElement 내 오행
 * @param targetElement 대상 오행
 * @returns 상생(1) / 동일(0) / 상극(-1) / 중립(0.5)
 */
export function getElementRelation(myElement: string, targetElement: string): number {
  // 같은 오행 (동류)
  if (myElement === targetElement) {
    return 0.3; // 약간 긍정적
  }

  // 상생 관계 (내가 생성하는 오행)
  if (ELEMENT_GENERATION[myElement] === targetElement) {
    return 0.8; // 강한 긍정
  }

  // 역상생 관계 (나를 생성하는 오행)
  if (ELEMENT_GENERATION[targetElement] === myElement) {
    return 0.6; // 긍정
  }

  // 상극 관계 (내가 극하는 오행)
  if (ELEMENT_DESTRUCTION[myElement] === targetElement) {
    return -0.3; // 약간 부정
  }

  // 역상극 관계 (나를 극하는 오행)
  if (ELEMENT_DESTRUCTION[targetElement] === myElement) {
    return -0.6; // 부정
  }

  // 중립
  return 0;
}

// ============================================
// 개인화 점수 계산
// ============================================

/**
 * 궁별 개인화 점수 조정
 * @param palace 궁 데이터
 * @param birthAnalysis 생년 분석 결과
 * @returns 조정된 점수 (-15 ~ +15)
 */
export function calculatePersonalizedPalaceScore(
  palace: any,
  birthAnalysis: BirthYearAnalysis | null,
): number {
  if (!birthAnalysis) return 0;

  const myElement = birthAnalysis.element;
  let bonusScore = 0;

  // 1. 팔문(八門)의 오행과 내 오행 궁합
  const gateData = getGateData(palace.gate);
  const gateRelation = getElementRelation(myElement, gateData.element);
  bonusScore += gateRelation * 8; // 최대 ±6.4점

  // 2. 구성(九星)의 오행과 내 오행 궁합
  const starData = getStarData(palace.star);
  const starRelation = getElementRelation(myElement, starData.element);
  bonusScore += starRelation * 7; // 최대 ±5.6점

  // 3. 방위 오행과 내 오행 궁합
  const directionElement = getDirectionElement(palace.direction);
  if (directionElement) {
    const directionRelation = getElementRelation(myElement, directionElement);
    bonusScore += directionRelation * 5; // 최대 ±4점
  }

  // 점수 범위 제한: -15 ~ +15
  return Math.max(-15, Math.min(15, Math.round(bonusScore)));
}

/**
 * 전체 운세 점수 개인화
 * @param chart 귀문둔갑 차트
 * @param birthAnalysis 생년 분석 결과
 * @returns { baseScore, personalScore, bonus }
 */
export function calculatePersonalizedOverallScore(
  chart: QimenChart,
  birthAnalysis: BirthYearAnalysis | null,
): {
  baseScore: number;
  personalScore: number;
  bonus: number;
  explanation: string;
} {
  const baseScore = chart.overallFortune.score;

  if (!birthAnalysis) {
    return {
      baseScore,
      personalScore: baseScore,
      bonus: 0,
      explanation: '',
    };
  }

  // 전체 궁의 개인화 점수 평균 계산
  let totalBonus = 0;
  let validPalaceCount = 0;

  // 길한 궁들에 대해 가중치를 더 주기
  const bestPalaces = chart.overallFortune.bestPalaces;
  const worstPalaces = chart.overallFortune.worstPalaces;

  for (const palaceNameStr of Object.keys(chart.palaces)) {
    const palaceName = Number(palaceNameStr) as Palace;
    const palace = chart.palaces[palaceName];
    const palaceBonus = calculatePersonalizedPalaceScore(palace, birthAnalysis);

    // 길한 궁이면 가중치 1.5배
    if (bestPalaces.includes(palaceName)) {
      totalBonus += palaceBonus * 1.5;
    }
    // 흉한 궁이면 가중치 0.7배
    else if (worstPalaces.includes(palaceName)) {
      totalBonus += palaceBonus * 0.7;
    }
    // 일반 궁
    else {
      totalBonus += palaceBonus;
    }

    validPalaceCount++;
  }

  // 평균 보너스 계산
  const averageBonus = Math.round(totalBonus / validPalaceCount);
  const personalScore = Math.max(0, Math.min(100, baseScore + averageBonus));

  // 설명 생성
  let explanation = '';
  if (averageBonus > 5) {
    explanation = `${birthAnalysis.characteristics.element} 기운이 오늘과 잘 맞습니다!`;
  } else if (averageBonus < -5) {
    explanation = `${birthAnalysis.characteristics.element} 기운이 오늘과 약간 충돌합니다.`;
  } else {
    explanation = `${birthAnalysis.characteristics.element} 기운이 오늘과 중립적입니다.`;
  }

  return {
    baseScore,
    personalScore,
    bonus: averageBonus,
    explanation,
  };
}

/**
 * 방위의 오행 가져오기
 */
function getDirectionElement(direction: string): string | null {
  const directionElementMap: Record<string, string> = {
    '동': '목',
    '동남': '목',
    '남': '화',
    '서남': '토',
    '서': '금',
    '서북': '금',
    '북': '수',
    '동북': '토',
    '중앙': '토',
  };
  return directionElementMap[direction] || null;
}

/**
 * 궁별 개인화 길흉 레벨 조정
 * @param originalLevel 원래 길흉 레벨
 * @param bonus 개인화 보너스 점수
 * @returns 조정된 레벨
 */
export function adjustFortuneLevel(
  originalLevel: 'excellent' | 'good' | 'neutral' | 'bad' | 'terrible',
  bonus: number,
): 'excellent' | 'good' | 'neutral' | 'bad' | 'terrible' {
  const levels: ('terrible' | 'bad' | 'neutral' | 'good' | 'excellent')[] = [
    'terrible',
    'bad',
    'neutral',
    'good',
    'excellent',
  ];

  const currentIndex = levels.indexOf(originalLevel);

  // 보너스에 따라 레벨 조정
  let adjustment = 0;
  if (bonus >= 10) adjustment = 1;
  else if (bonus >= 5) adjustment = 0.5;
  else if (bonus <= -10) adjustment = -1;
  else if (bonus <= -5) adjustment = -0.5;

  const newIndex = Math.max(0, Math.min(4, currentIndex + Math.round(adjustment)));
  return levels[newIndex];
}

/**
 * 개인화된 조언 생성
 * @param palace 궁 데이터
 * @param birthAnalysis 생년 분석
 * @returns 맞춤 조언
 */
export function generatePersonalizedAdvice(
  palace: any,
  birthAnalysis: BirthYearAnalysis | null,
): string {
  if (!birthAnalysis) return '';

  const myElement = birthAnalysis.element;
  const gateData = getGateData(palace.gate);
  const relation = getElementRelation(myElement, gateData.element);

  if (relation > 0.5) {
    return `${myElement} 기운인 당신에게 이 방위는 특히 유리합니다.`;
  } else if (relation < -0.3) {
    return `${myElement} 기운인 당신에게 이 방위는 조심스럽게 접근하세요.`;
  } else {
    return `${myElement} 기운인 당신에게 이 방위는 무난합니다.`;
  }
}
