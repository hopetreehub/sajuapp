/**
 * 귀문둔갑(奇門遁甲) 기본 데이터
 *
 * 팔문(八門), 구성(九星), 팔신(八神) 등의 참조 데이터
 * @author Claude Code
 * @version 1.0.0
 */

import type {
  Gate,
  GateData,
  Star,
  StarData,
  Spirit,
  SpiritData,
  Direction,
  Palace,
  PalaceDirectionMap,
  SolarTermData,
} from '@/types/qimen';

// ============================================
// 팔문(八門) 데이터
// ============================================

export const GATES: Record<Gate, GateData> = {
  휴문: {
    name: '휴문',
    element: '수',
    nature: 'auspicious',
    meaning: '휴식과 평온의 문. 쉼과 회복의 에너지',
    effects: {
      positive: ['휴식', '회복', '치유', '평온', '안정'],
      negative: ['나태', '소극적', '정체'],
    },
  },
  생문: {
    name: '생문',
    element: '토',
    nature: 'auspicious',
    meaning: '생성과 발전의 문. 새로운 시작과 성장',
    effects: {
      positive: ['성장', '발전', '창조', '생산', '번영'],
      negative: ['과욕', '무리한 확장'],
    },
  },
  상문: {
    name: '상문',
    element: '목',
    nature: 'inauspicious',
    meaning: '상처와 손상의 문. 충돌과 갈등',
    effects: {
      positive: ['경쟁력', '추진력', '돌파력'],
      negative: ['싸움', '상처', '손실', '갈등', '분쟁'],
    },
  },
  두문: {
    name: '두문',
    element: '목',
    nature: 'inauspicious',
    meaning: '막힘과 폐쇄의 문. 숨김과 은둔',
    effects: {
      positive: ['은둔', '수양', '비밀보호', '방어'],
      negative: ['막힘', '폐쇄', '고립', '소통불가'],
    },
  },
  경문: {
    name: '경문',
    element: '화',
    nature: 'auspicious',
    meaning: '경치와 명예의 문. 밝음과 영광',
    effects: {
      positive: ['명예', '빛남', '영광', '화려함', '성공'],
      negative: ['허영', '과시', '허명'],
    },
  },
  사문: {
    name: '사문',
    element: '토',
    nature: 'inauspicious',
    meaning: '죽음과 종결의 문. 끝과 소멸',
    effects: {
      positive: ['청산', '정리', '종결', '새로운 시작 전 정화'],
      negative: ['사망', '종말', '소멸', '실패', '끝'],
    },
  },
  놀문: {
    name: '놀문',
    element: '금',
    nature: 'neutral',
    meaning: '놀람과 변화의 문. 예상치 못한 변화',
    effects: {
      positive: ['기회', '변화', '각성', '깨달음'],
      negative: ['놀람', '충격', '불안', '혼란', '변동'],
    },
  },
  개문: {
    name: '개문',
    element: '금',
    nature: 'auspicious',
    meaning: '개방과 시작의 문. 열림과 시작',
    effects: {
      positive: ['개시', '개방', '기회', '시작', '확장'],
      negative: ['무분별', '노출', '방어력 약화'],
    },
  },
};

// ============================================
// 구성(九星) 데이터
// ============================================

export const STARS: Record<Star, StarData> = {
  천봉: {
    name: '천봉',
    element: '수',
    planet: '수성',
    nature: 'inauspicious',
    meaning: '지혜와 계략의 별. 도적과 간계',
    influences: ['지혜', '계략', '도적', '간교', '음모', '비밀'],
  },
  천임: {
    name: '천임',
    element: '토',
    planet: '토성',
    nature: 'auspicious',
    meaning: '신뢰와 안정의 별. 임무와 책임',
    influences: ['신뢰', '안정', '책임', '성실', '보좌', '충성'],
  },
  천충: {
    name: '천충',
    element: '목',
    planet: '목성',
    nature: 'neutral',
    meaning: '충동과 돌진의 별. 급진과 변화',
    influences: ['충동', '급진', '돌진', '변화', '혁신', '무모'],
  },
  천보: {
    name: '천보',
    element: '목',
    planet: '목성',
    nature: 'auspicious',
    meaning: '보좌와 지원의 별. 도움과 협력',
    influences: ['보좌', '지원', '협력', '조력', '문화', '학문'],
  },
  천영: {
    name: '천영',
    element: '화',
    planet: '화성',
    nature: 'neutral',
    meaning: '명예와 영광의 별. 빛과 명성',
    influences: ['명예', '영광', '명성', '화려', '문서', '증명'],
  },
  천예: {
    name: '천예',
    element: '토',
    planet: '토성',
    nature: 'inauspicious',
    meaning: '질병과 연약의 별. 병과 쇠약',
    influences: ['질병', '쇠약', '피로', '노쇠', '걱정', '근심'],
  },
  천주: {
    name: '천주',
    element: '금',
    planet: '금성',
    nature: 'neutral',
    meaning: '권위와 기둥의 별. 지지와 떠받침',
    influences: ['권위', '기둥', '지지', '근간', '강직', '고집'],
  },
  천심: {
    name: '천심',
    element: '금',
    planet: '금성',
    nature: 'auspicious',
    meaning: '의술과 치료의 별. 마음과 심장',
    influences: ['의술', '치료', '마음', '정신', '예술', '창조'],
  },
  천금: {
    name: '천금',
    element: '토',
    planet: '토성',
    nature: 'auspicious',
    meaning: '중앙과 균형의 별. 중심과 조화',
    influences: ['중앙', '균형', '조화', '중재', '통합', '안정'],
  },
};

// ============================================
// 팔신(八神) 데이터
// ============================================

export const SPIRITS: Record<Spirit, SpiritData> = {
  직부: {
    name: '직부',
    nature: 'auspicious',
    meaning: '권력과 통솔의 신',
    characteristics: ['권력', '통솔', '지도', '명령', '높은 지위', '귀인'],
  },
  등사: {
    name: '등사',
    nature: 'inauspicious',
    meaning: '번뇌와 불안의 신',
    characteristics: ['번뇌', '불안', '걱정', '혼란', '망상', '집착'],
  },
  태음: {
    name: '태음',
    nature: 'auspicious',
    meaning: '음과 여성의 신',
    characteristics: ['음', '여성', '온화', '부드러움', '비밀', '내면'],
  },
  육합: {
    name: '육합',
    nature: 'auspicious',
    meaning: '화합과 결합의 신',
    characteristics: ['화합', '결합', '협력', '중재', '타협', '조화'],
  },
  백호: {
    name: '백호',
    nature: 'inauspicious',
    meaning: '흉과 재앙의 신',
    characteristics: ['흉', '재앙', '공포', '위험', '파괴', '살상'],
  },
  현무: {
    name: '현무',
    nature: 'inauspicious',
    meaning: '도적과 음모의 신',
    characteristics: ['도적', '음모', '사기', '배신', '도둑', '속임'],
  },
  구지: {
    name: '구지',
    nature: 'auspicious',
    meaning: '방어와 땅의 신',
    characteristics: ['방어', '수비', '보호', '안정', '견고', '내실'],
  },
  구천: {
    name: '구천',
    nature: 'auspicious',
    meaning: '공격과 하늘의 신',
    characteristics: ['공격', '진취', '상승', '발전', '적극', '확장'],
  },
};

// ============================================
// 방위-궁 매핑
// ============================================

export const DIRECTION_TO_PALACE: PalaceDirectionMap = {
  북: 1,
  서남: 2,
  동: 3,
  동남: 4,
  중앙: 5,
  서북: 6,
  서: 7,
  동북: 8,
  남: 9,
};

export const PALACE_TO_DIRECTION: Record<Palace, Direction> = {
  1: '북',
  2: '서남',
  3: '동',
  4: '동남',
  5: '중앙',
  6: '서북',
  7: '서',
  8: '동북',
  9: '남',
};

// ============================================
// 24절기 데이터
// ============================================

export const SOLAR_TERMS: SolarTermData[] = [
  // 양둔 (동지 ~ 하지)
  { index: 1, name: '입춘', month: 2, approxDay: 4, yinYang: 'yang', ju: 7 },
  { index: 2, name: '우수', month: 2, approxDay: 19, yinYang: 'yang', ju: 8 },
  { index: 3, name: '경칩', month: 3, approxDay: 6, yinYang: 'yang', ju: 9 },
  { index: 4, name: '춘분', month: 3, approxDay: 21, yinYang: 'yang', ju: 9 },
  { index: 5, name: '청명', month: 4, approxDay: 5, yinYang: 'yang', ju: 8 },
  { index: 6, name: '곡우', month: 4, approxDay: 20, yinYang: 'yang', ju: 7 },
  { index: 7, name: '입하', month: 5, approxDay: 6, yinYang: 'yang', ju: 5 },
  { index: 8, name: '소만', month: 5, approxDay: 21, yinYang: 'yang', ju: 4 },
  { index: 9, name: '망종', month: 6, approxDay: 6, yinYang: 'yang', ju: 3 },
  { index: 10, name: '하지', month: 6, approxDay: 21, yinYang: 'yang', ju: 3 },

  // 음둔 (하지 ~ 동지)
  { index: 11, name: '소서', month: 7, approxDay: 7, yinYang: 'yin', ju: 4 },
  { index: 12, name: '대서', month: 7, approxDay: 23, yinYang: 'yin', ju: 5 },
  { index: 13, name: '입추', month: 8, approxDay: 8, yinYang: 'yin', ju: 6 },
  { index: 14, name: '처서', month: 8, approxDay: 23, yinYang: 'yin', ju: 7 },
  { index: 15, name: '백로', month: 9, approxDay: 8, yinYang: 'yin', ju: 8 },
  { index: 16, name: '추분', month: 9, approxDay: 23, yinYang: 'yin', ju: 8 },
  { index: 17, name: '한로', month: 10, approxDay: 8, yinYang: 'yin', ju: 7 },
  { index: 18, name: '상강', month: 10, approxDay: 23, yinYang: 'yin', ju: 6 },
  { index: 19, name: '입동', month: 11, approxDay: 7, yinYang: 'yin', ju: 2 },
  { index: 20, name: '소설', month: 11, approxDay: 22, yinYang: 'yin', ju: 1 },
  { index: 21, name: '대설', month: 12, approxDay: 7, yinYang: 'yin', ju: 9 },
  { index: 22, name: '동지', month: 12, approxDay: 22, yinYang: 'yin', ju: 9 },
  { index: 23, name: '소한', month: 1, approxDay: 6, yinYang: 'yang', ju: 1 },
  { index: 24, name: '대한', month: 1, approxDay: 20, yinYang: 'yang', ju: 2 },
];

// ============================================
// 구궁 그리드 레이아웃 (시각화용)
// ============================================

/**
 * 3x3 구궁 그리드
 * 로서도(洛書圖) 배치
 */
export const PALACE_GRID = [
  [4, 9, 2],  // 상단 (동남, 남, 서남)
  [3, 5, 7],  // 중단 (동, 중앙, 서)
  [8, 1, 6],  // 하단 (동북, 북, 서북)
] as const;

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 팔문 데이터 가져오기
 */
export function getGateData(gate: Gate): GateData {
  return GATES[gate];
}

/**
 * 구성 데이터 가져오기
 */
export function getStarData(star: Star): StarData {
  return STARS[star];
}

/**
 * 팔신 데이터 가져오기
 */
export function getSpiritData(spirit: Spirit): SpiritData {
  return SPIRITS[spirit];
}

/**
 * 방위로 궁 번호 가져오기
 */
export function getPalaceByDirection(direction: Direction): Palace {
  return DIRECTION_TO_PALACE[direction];
}

/**
 * 궁 번호로 방위 가져오기
 */
export function getDirectionByPalace(palace: Palace): Direction {
  return PALACE_TO_DIRECTION[palace];
}

/**
 * 길흉 성향 종합 판단
 * 팔문, 구성, 팔신의 성향을 종합하여 전체 길흉 계산
 */
export function calculateCombinedNature(
  gate: Gate,
  star: Star,
  spirit?: Spirit,
): 'auspicious' | 'neutral' | 'inauspicious' {
  const gateNature = GATES[gate].nature;
  const starNature = STARS[star].nature;
  const spiritNature = spirit ? SPIRITS[spirit].nature : 'neutral';

  // 길흉 점수 계산 (auspicious=2, neutral=1, inauspicious=0)
  const natureScore = {
    auspicious: 2,
    neutral: 1,
    inauspicious: 0,
  };

  const totalScore =
    natureScore[gateNature] +
    natureScore[starNature] +
    natureScore[spiritNature];

  const avgScore = totalScore / 3;

  // 평균 점수로 최종 길흉 결정
  if (avgScore >= 1.5) return 'auspicious';
  if (avgScore >= 0.8) return 'neutral';
  return 'inauspicious';
}
