/**
 * 자미두수 사화성(四化星) 시스템
 *
 * 생년 천간에 따라 주성에 사화(化祿, 化權, 化科, 化忌)가 부여됨
 * 사화성은 궁위의 길흉을 크게 바꾸는 중요한 요소
 *
 * @author Claude Code - 자미두수 전문가
 * @version 2.0.0
 */

import type { MainStar, AuxiliaryStar } from '@/types/ziwei';

// 사화 타입
export type Transformation = '化祿' | '化權' | '化科' | '化忌';

// 천간 (10개)
export type HeavenlyStem = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';

// 사화성 매핑 결과
export interface TransformationResult {
  star: MainStar;
  transformation: Transformation;
}

// ============================================
// 10천간별 사화 테이블 (핵심 데이터)
// ============================================

/**
 * 10천간별 사화성 테이블
 *
 * 각 천간마다 어떤 주성이 화록/화권/화과/화기가 되는지 정의
 * 이 테이블은 자미두수의 가장 중요한 핵심 데이터
 */
export const TRANSFORMATION_TABLE: Record<HeavenlyStem, {
  祿: MainStar;
  權: MainStar;
  科: MainStar;
  忌: MainStar;
}> = {
  // 甲년생 (1984, 1994, 2004, 2014, 2024...)
  '甲': {
    祿: '廉貞',
    權: '破軍',
    科: '武曲',
    忌: '太陽',
  },

  // 乙년생 (1985, 1995, 2005, 2015, 2025...)
  '乙': {
    祿: '天機',
    權: '天梁',
    科: '紫微',
    忌: '太陰',
  },

  // 丙년생 (1986, 1996, 2006, 2016, 2026...)
  '丙': {
    祿: '天同',
    權: '天機',
    科: '天府',
    忌: '廉貞',
  },

  // 丁년생 (1987, 1997, 2007, 2017, 2027...)
  '丁': {
    祿: '太陰',
    權: '天同',
    科: '天機',
    忌: '巨門',
  },

  // 戊년생 (1988, 1998, 2008, 2018, 2028...)
  '戊': {
    祿: '貪狼',
    權: '太陰',
    科: '天機',
    忌: '天機',
  },

  // 己년생 (1989, 1999, 2009, 2019, 2029...)
  '己': {
    祿: '武曲',
    權: '貪狼',
    科: '天梁',
    忌: '天府',
  },

  // 庚년생 (1980, 1990, 2000, 2010, 2020, 2030...)
  '庚': {
    祿: '太陽',
    權: '武曲',
    科: '太陰',
    忌: '天同',
  },

  // 辛년생 (1981, 1991, 2001, 2011, 2021, 2031...)
  '辛': {
    祿: '巨門',
    權: '太陽',
    科: '天府',
    忌: '天府',
  },

  // 壬년생 (1982, 1992, 2002, 2012, 2022, 2032...)
  '壬': {
    祿: '天梁',
    權: '紫微',
    科: '天府',
    忌: '武曲',
  },

  // 癸년생 (1983, 1993, 2003, 2013, 2023, 2033...)
  '癸': {
    祿: '破軍',
    權: '巨門',
    科: '太陰',
    忌: '貪狼',
  },
};

// ============================================
// 천간 계산 헬퍼 함수
// ============================================

/**
 * 연도를 천간으로 변환
 * @param year 서기 연도
 * @returns 천간
 */
export function getHeavenlyStem(year: number): HeavenlyStem {
  const stems: HeavenlyStem[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

  // 기준: 1984년 = 甲子년 (甲 = 0)
  const baseYear = 1984;
  const stemIndex = ((year - baseYear) % 10 + 10) % 10;

  return stems[stemIndex];
}

/**
 * 천간 인덱스 가져오기 (0-9)
 */
export function getStemIndex(year: number): number {
  const baseYear = 1984;
  return ((year - baseYear) % 10 + 10) % 10;
}

// ============================================
// 사화성 계산 함수
// ============================================

/**
 * 생년에 따른 사화성 계산
 * @param year 생년 (서기)
 * @returns 4개의 사화성 배열 (화록, 화권, 화과, 화기)
 */
export function calculateTransformations(year: number): TransformationResult[] {
  const stem = getHeavenlyStem(year);
  const table = TRANSFORMATION_TABLE[stem];

  return [
    { star: table.祿, transformation: '化祿' },
    { star: table.權, transformation: '化權' },
    { star: table.科, transformation: '化科' },
    { star: table.忌, transformation: '化忌' },
  ];
}

/**
 * 특정 주성이 어떤 사화를 받는지 확인
 * @param year 생년
 * @param star 주성
 * @returns 사화 타입 또는 null
 */
export function getTransformationForStar(year: number, star: MainStar): Transformation | null {
  const transformations = calculateTransformations(year);
  const result = transformations.find(t => t.star === star);
  return result ? result.transformation : null;
}

/**
 * 사화성이 있는지 확인
 * @param star 주성
 * @param transformations 사화성 배열
 * @returns 사화 타입 또는 null
 */
export function findTransformation(
  star: MainStar,
  transformations: TransformationResult[],
): Transformation | null {
  const result = transformations.find(t => t.star === star);
  return result ? result.transformation : null;
}

// ============================================
// 사화성 점수 가중치
// ============================================

/**
 * 사화성에 따른 점수 조정값
 */
export const TRANSFORMATION_SCORE_ADJUSTMENT: Record<Transformation, number> = {
  '化祿': +20,  // 재물운 대폭 상승
  '化權': +15,  // 권력운 상승
  '化科': +12,  // 명예운 상승
  '化忌': -15,  // 불운, 장애
};

/**
 * 사화성 설명
 */
export const TRANSFORMATION_DESCRIPTIONS: Record<Transformation, string> = {
  '化祿': '재물운과 인기운이 크게 상승합니다. 수입 증가, 기회 확대, 명성 획득',
  '化權': '권력운과 지위운이 상승합니다. 리더십 발휘, 승진, 영향력 확대',
  '化科': '명예운과 학문운이 상승합니다. 시험 합격, 학업 성취, 명성 획득',
  '化忌': '불운과 장애가 생깁니다. 계획 틀어짐, 어려움 발생, 신중 필요',
};

/**
 * 사화성 키워드
 */
export const TRANSFORMATION_KEYWORDS: Record<Transformation, string[]> = {
  '化祿': ['재물', '인기', '명예', '기회', '성공'],
  '化權': ['권력', '지위', '리더십', '승진', '영향력'],
  '化科': ['명예', '시험', '학문', '명성', '인정'],
  '化忌': ['불운', '장애', '좌절', '어려움', '신중'],
};

// ============================================
// 사화성 궁위별 해석
// ============================================

/**
 * 사화성이 어느 궁위에 있는지에 따른 해석
 */
export function getTransformationPalaceInterpretation(
  transformation: Transformation,
  palaceName: string,
): string {
  const interpretations: Record<Transformation, Record<string, string>> = {
    '化祿': {
      '命宮': '일생 복록이 풍부하고 재물운이 좋습니다. 인기도 많습니다.',
      '兄弟宮': '형제자매의 도움을 받고 친구들이 재물을 가져다줍니다.',
      '夫妻宮': '배우자가 재물을 가져오고 결혼생활이 화목합니다.',
      '子女宮': '자녀가 효도하고 자녀로 인한 기쁨이 많습니다.',
      '財帛宮': '재물운이 매우 좋고 수입이 증가합니다. 투자 시 유리.',
      '疾厄宮': '건강이 좋고 질병이 없습니다. 체력이 왕성합니다.',
      '遷移宮': '외출하면 재물과 기회를 얻습니다. 이동운이 좋습니다.',
      '奴僕宮': '부하와 친구들의 도움을 많이 받습니다.',
      '官祿宮': '직업운이 좋고 승진하며 명예를 얻습니다.',
      '田宅宮': '부동산운이 좋고 집안이 번창합니다.',
      '福德宮': '정신적으로 풍요롭고 취미생활이 즐겁습니다.',
      '父母宮': '부모님의 도움을 많이 받고 유산을 받습니다.',
    },
    '化權': {
      '命宮': '리더십이 강하고 권력욕이 있습니다. 지위가 높아집니다.',
      '兄弟宮': '형제자매 중 권력을 가진 사람이 있습니다.',
      '夫妻宮': '배우자가 강하고 주도권을 쥡니다.',
      '子女宮': '자녀가 권력을 가지고 출세합니다.',
      '財帛宮': '재물 관리 능력이 뛰어나고 투자에 강합니다.',
      '疾厄宮': '체력이 강하고 질병을 이겨냅니다.',
      '遷移宮': '외출하면 권력을 얻고 영향력이 커집니다.',
      '奴僕宮': '부하를 잘 다루고 리더십을 발휘합니다.',
      '官祿宮': '권력과 지위가 크게 상승합니다. 승진 가능성 높음.',
      '田宅宮': '부동산으로 권력을 얻고 집안이 강해집니다.',
      '福德宮': '정신적으로 강하고 결단력이 있습니다.',
      '父母宮': '부모님이 권력을 가지고 있습니다.',
    },
    '化科': {
      '命宮': '명예롭고 학문이 뛰어납니다. 시험에 강합니다.',
      '兄弟宮': '형제자매가 명예를 얻고 학문이 뛰어납니다.',
      '夫妻宮': '배우자가 명예롭고 품격이 있습니다.',
      '子女宮': '자녀가 학업에 뛰어나고 시험에 합격합니다.',
      '財帛宮': '정당한 방법으로 재물을 얻고 명예도 함께 얻습니다.',
      '疾厄宮': '의사를 만나면 치료가 잘 됩니다.',
      '遷移宮': '외출하면 명예를 얻고 좋은 평판을 받습니다.',
      '奴僕宮': '부하와 친구들이 명예롭고 도움이 됩니다.',
      '官祿宮': '직업적으로 명예를 얻고 인정받습니다.',
      '田宅宮': '명문가의 집안이거나 집이 명예롭습니다.',
      '福德宮': '정신적으로 고상하고 문화적입니다.',
      '父母宮': '부모님이 명예롭고 학식이 높습니다.',
    },
    '化忌': {
      '命宮': '일생 고난이 많고 장애가 생깁니다. 신중해야 합니다.',
      '兄弟宮': '형제자매와 갈등이 있고 친구 문제가 생깁니다.',
      '夫妻宮': '배우자와 갈등이 많고 결혼생활에 어려움이 있습니다.',
      '子女宮': '자녀 문제로 고민이 많고 자녀운이 약합니다.',
      '財帛宮': '재물 손실이 있고 투자 시 신중해야 합니다.',
      '疾厄宮': '건강에 문제가 생기고 질병에 주의해야 합니다.',
      '遷移宮': '외출하면 사고나 어려움을 만납니다. 이동 시 조심.',
      '奴僕宮': '부하와 갈등이 있고 배신당할 수 있습니다.',
      '官祿宮': '직업상 어려움이 있고 승진이 막힙니다.',
      '田宅宮': '부동산 문제가 생기고 집안에 불화가 있습니다.',
      '福德宮': '정신적으로 고통받고 스트레스가 많습니다.',
      '父母宮': '부모님과 갈등이 있고 인연이 약합니다.',
    },
  };

  return interpretations[transformation]?.[palaceName] || '영향이 있습니다.';
}

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 사화성 이모지
 */
export function getTransformationEmoji(transformation: Transformation): string {
  const emojis: Record<Transformation, string> = {
    '化祿': '💰',
    '化權': '👑',
    '化科': '🎓',
    '化忌': '⚠️',
  };
  return emojis[transformation];
}

/**
 * 사화성 색상 (UI용)
 */
export function getTransformationColor(transformation: Transformation): string {
  const colors: Record<Transformation, string> = {
    '化祿': 'text-green-600',
    '化權': 'text-purple-600',
    '化科': 'text-blue-600',
    '化忌': 'text-red-600',
  };
  return colors[transformation];
}
