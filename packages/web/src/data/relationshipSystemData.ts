/**
 * 7대 인간관계운 시스템 데이터
 *
 * 전통 명리학의 십신론 + 합형충파해론 기반 인간관계 분석
 *
 * @author Master Kim Hyun-soo (명리학 전문가) + Dr. Emma Rodriguez (심리학)
 * @version 1.0
 */

export interface RelationshipSystem {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  primaryElement: OhHaeng;
  secondaryElement: OhHaeng;
  relatedSibsin: string[];  // 관련 십신
  category: 'family' | 'social' | 'work';
  keywords: string[];
  harmonyFactors: string[];  // 조화 요인 (합/생)
  conflictFactors: string[];  // 갈등 요인 (충/극/형/파/해)
}

export type OhHaeng = '목' | '화' | '토' | '금' | '수';

/**
 * 7대 인간관계운 시스템 정의
 *
 * 【가족 관계】
 * 1. 부모관계운 (Parents) - 인수 중심
 * 2. 형제자매운 (Siblings) - 비겁 중심
 * 3. 자녀관계운 (Children) - 식상 중심
 *
 * 【사회 관계】
 * 4. 친구관계운 (Friends) - 비견 중심
 * 5. 배우자운 (Spouse) - 재성/관성 중심
 *
 * 【직장 관계】
 * 6. 상사관계운 (Boss) - 관성 중심
 * 7. 동료협업운 (Colleagues) - 식신/비견 중심
 */
export const RELATIONSHIP_SYSTEMS: RelationshipSystem[] = [
  // ========== 가족 관계 ==========
  {
    id: 'parents',
    name: '부모관계운',
    nameEn: 'Parents Relationship',
    description: '부모님과의 관계, 효도, 가정의 뿌리',
    primaryElement: '토',
    secondaryElement: '금',
    relatedSibsin: ['정인', '편인', '정관'],
    category: 'family',
    keywords: ['부모', '효도', '가풍', '전통', '존경'],
    harmonyFactors: ['인수왕', '관인상생', '토금상생'],
    conflictFactors: ['재성극인', '식상설기', '인수과다'],
  },
  {
    id: 'siblings',
    name: '형제자매운',
    nameEn: 'Siblings Relationship',
    description: '형제자매와의 관계, 우애, 경쟁',
    primaryElement: '목',
    secondaryElement: '화',
    relatedSibsin: ['비견', '겁재'],
    category: 'family',
    keywords: ['형제', '자매', '우애', '경쟁', '공동'],
    harmonyFactors: ['비견협력', '비겁적당', '목화상생'],
    conflictFactors: ['비겁쟁재', '형제충', '비겁과다'],
  },
  {
    id: 'children',
    name: '자녀관계운',
    nameEn: 'Children Relationship',
    description: '자녀와의 관계, 양육, 효과',
    primaryElement: '화',
    secondaryElement: '목',
    relatedSibsin: ['식신', '상관'],
    category: 'family',
    keywords: ['자녀', '양육', '교육', '소통', '성장'],
    harmonyFactors: ['식신온화', '식신생재', '화목상생'],
    conflictFactors: ['식상과다', '인성극식', '상관견관'],
  },

  // ========== 사회 관계 ==========
  {
    id: 'friends',
    name: '친구관계운',
    nameEn: 'Friends Relationship',
    description: '친구들과의 관계, 우정, 사교',
    primaryElement: '금',
    secondaryElement: '수',
    relatedSibsin: ['비견', '식신', '정재'],
    category: 'social',
    keywords: ['친구', '우정', '사교', '네트워크', '신뢰'],
    harmonyFactors: ['비견동지', '식신사교', '금수상생'],
    conflictFactors: ['비겁쟁재', '고립무원', '사회성부족'],
  },
  {
    id: 'spouse',
    name: '배우자운',
    nameEn: 'Spouse Relationship',
    description: '배우자와의 관계, 부부애, 인연',
    primaryElement: '수',
    secondaryElement: '금',
    relatedSibsin: ['정재', '편재', '정관', '편관'],
    category: 'social',
    keywords: ['배우자', '결혼', '부부', '애정', '조화'],
    harmonyFactors: ['재관균형', '음양조화', '수금상생'],
    conflictFactors: ['비겁쟁재', '재다신약', '관살혼잡'],
  },

  // ========== 직장 관계 ==========
  {
    id: 'boss',
    name: '상사관계운',
    nameEn: 'Boss Relationship',
    description: '상사와의 관계, 승진, 인정',
    primaryElement: '금',
    secondaryElement: '토',
    relatedSibsin: ['정관', '편관', '정인'],
    category: 'work',
    keywords: ['상사', '리더십', '승진', '인정', '권위'],
    harmonyFactors: ['관인상생', '관성적당', '토금상생'],
    conflictFactors: ['상관견관', '관살혼잡', '극관'],
  },
  {
    id: 'colleagues',
    name: '동료협업운',
    nameEn: 'Colleagues Relationship',
    description: '동료들과의 협업, 팀워크, 소통',
    primaryElement: '목',
    secondaryElement: '수',
    relatedSibsin: ['식신', '비견', '편재'],
    category: 'work',
    keywords: ['동료', '협업', '팀워크', '소통', '조율'],
    harmonyFactors: ['식신원만', '비견협력', '수목상생'],
    conflictFactors: ['상관독단', '비겁경쟁', '소통불화'],
  },
];

/**
 * 인간관계운 카테고리 그룹
 */
export const RELATIONSHIP_CATEGORIES = {
  family: {
    name: '가족 관계',
    systems: ['parents', 'siblings', 'children'],
    color: '#EC4899', // 핑크
    icon: '👨‍👩‍👧‍👦',
  },
  social: {
    name: '사회 관계',
    systems: ['friends', 'spouse'],
    color: '#8B5CF6', // 보라
    icon: '🤝',
  },
  work: {
    name: '직장 관계',
    systems: ['boss', 'colleagues'],
    color: '#3B82F6', // 파랑
    icon: '💼',
  },
};

/**
 * 십신별 인간관계 특성
 */
export const SIBSIN_RELATIONSHIP_TRAIT = {
  정재: {
    relationshipStyle: '책임감 있는 관계',
    strength: '안정적, 신뢰',
    weakness: '보수적, 경직',
    bestWith: ['배우자', '친구'],
  },
  편재: {
    relationshipStyle: '개방적인 관계',
    strength: '사교적, 활발',
    weakness: '가벼움, 변동',
    bestWith: ['친구', '동료'],
  },
  정관: {
    relationshipStyle: '예의 바른 관계',
    strength: '정중함, 질서',
    weakness: '형식적, 딱딱',
    bestWith: ['상사', '부모'],
  },
  편관: {
    relationshipStyle: '강력한 관계',
    strength: '추진력, 결단',
    weakness: '강압적, 충돌',
    bestWith: ['상사', '친구'],
  },
  식신: {
    relationshipStyle: '온화한 관계',
    strength: '친절함, 배려',
    weakness: '우유부단',
    bestWith: ['자녀', '동료', '친구'],
  },
  상관: {
    relationshipStyle: '창의적 관계',
    strength: '개성, 표현력',
    weakness: '비판적, 독단',
    bestWith: ['자녀', '친구'],
  },
  정인: {
    relationshipStyle: '학구적 관계',
    strength: '존중, 이해',
    weakness: '소극적',
    bestWith: ['부모', '상사'],
  },
  편인: {
    relationshipStyle: '독특한 관계',
    strength: '통찰력',
    weakness: '고립적',
    bestWith: ['부모', '친구'],
  },
  비견: {
    relationshipStyle: '동등한 관계',
    strength: '협력, 공감',
    weakness: '경쟁심',
    bestWith: ['형제', '친구', '동료'],
  },
  겁재: {
    relationshipStyle: '역동적 관계',
    strength: '순발력, 행동',
    weakness: '충돌, 쟁탈',
    bestWith: ['형제', '동료'],
  },
};

/**
 * 합형충파해 (오행 관계) - 인간관계의 핵심
 */
export const OHHAENG_RELATIONSHIP = {
  // 六合 (육합) - 조화로운 관계
  harmony: {
    '子丑': { relation: '합', score: +20, description: '수토합 - 화합' },
    '寅亥': { relation: '합', score: +20, description: '목목합 - 협력' },
    '卯戌': { relation: '합', score: +20, description: '화합 - 열정' },
    '辰酉': { relation: '합', score: +20, description: '금합 - 조율' },
    '巳申': { relation: '합', score: +20, description: '수합 - 유연' },
    '午未': { relation: '합', score: +20, description: '토합 - 안정' },
  },

  // 三合 (삼합) - 강한 협력
  threeHarmony: {
    '申子辰': { element: '수', score: +25, description: '수국 - 지혜' },
    '亥卯未': { element: '목', score: +25, description: '목국 - 성장' },
    '寅午戌': { element: '화', score: +25, description: '화국 - 열정' },
    '巳酉丑': { element: '금', score: +25, description: '금국 - 결단' },
  },

  // 沖 (충) - 정면 충돌
  conflict: {
    '子午': { relation: '충', score: -20, description: '수화충 - 극단 대립' },
    '丑未': { relation: '충', score: -20, description: '토토충 - 고집 대립' },
    '寅申': { relation: '충', score: -20, description: '목금충 - 가치 충돌' },
    '卯酉': { relation: '충', score: -20, description: '목금충 - 강경 대립' },
    '辰戌': { relation: '충', score: -20, description: '토토충 - 권력 다툼' },
    '巳亥': { relation: '충', score: -20, description: '화수충 - 이념 대립' },
  },

  // 刑 (형) - 숨은 갈등
  punishment: {
    '寅巳申': { type: '무은지형', score: -15, description: '배신, 배은망덕' },
    '丑戌未': { type: '지세지형', score: -15, description: '권력 다툼' },
    '子卯': { type: '무례지형', score: -10, description: '예의 없음' },
    '辰辰': { type: '자형', score: -10, description: '자기 모순' },
  },

  // 破 (파) - 깨짐
  destruction: {
    '子酉': { relation: '파', score: -12, description: '약속 파기' },
    '午卯': { relation: '파', score: -12, description: '신뢰 파괴' },
    '辰丑': { relation: '파', score: -12, description: '관계 균열' },
    '戌未': { relation: '파', score: -12, description: '소원해짐' },
    '寅亥': { relation: '파', score: -12, description: '오해와 거리' },
    '巳申': { relation: '파', score: -12, description: '이간질' },
  },

  // 害 (해) - 해침
  harm: {
    '子未': { relation: '해', score: -15, description: '상처 주고받음' },
    '丑午': { relation: '해', score: -15, description: '갈등과 고통' },
    '寅巳': { relation: '해', score: -15, description: '배신과 상처' },
    '卯辰': { relation: '해', score: -15, description: '감정 상함' },
    '申亥': { relation: '해', score: -15, description: '음해와 시기' },
    '酉戌': { relation: '해', score: -15, description: '불신과 반목' },
  },
};

/**
 * 연령대별 인간관계 가중치
 */
export const AGE_RELATIONSHIP_WEIGHT = {
  '0-20': {
    ageGroup: '청소년기',
    weights: {
      parents: 1.3,      // 부모 관계 중요
      siblings: 1.2,     // 형제 관계 중요
      children: 0.5,     // 자녀 관계 미해당
      friends: 1.2,      // 친구 관계 중요
      spouse: 0.6,       // 배우자 미해당
      boss: 0.7,         // 상사 관계 낮음
      colleagues: 0.8,   // 동료 관계 낮음
    },
  },
  '21-40': {
    ageGroup: '청년기',
    weights: {
      parents: 1.1,
      siblings: 1.0,
      children: 1.2,
      friends: 1.3,      // 친구 관계 최고
      spouse: 1.4,       // 배우자 관계 최고
      boss: 1.3,         // 직장 관계 중요
      colleagues: 1.3,
    },
  },
  '41-60': {
    ageGroup: '중년기',
    weights: {
      parents: 1.2,      // 부모 봉양
      siblings: 1.0,
      children: 1.4,     // 자녀 교육 최고
      friends: 1.1,
      spouse: 1.3,
      boss: 1.2,
      colleagues: 1.2,
    },
  },
  '61+': {
    ageGroup: '노년기',
    weights: {
      parents: 0.8,      // 부모 연로
      siblings: 1.2,     // 형제 중요
      children: 1.3,     // 자녀 효도 기대
      friends: 1.2,      // 친구 중요
      spouse: 1.4,       // 배우자 최고
      boss: 0.7,         // 은퇴
      colleagues: 0.7,
    },
  },
};

/**
 * 인간관계 위험 신호
 */
export const RELATIONSHIP_WARNING_SIGNS = {
  high_risk: [
    '충(沖) 3개 이상',
    '형(刑) 2개 이상',
    '비겁과다 + 재성약함',
    '관살혼잡',
    '식상과다 + 인성없음',
  ],
  medium_risk: [
    '충(沖) 1-2개',
    '형(刑) 1개',
    '십신 편중 심함',
    '고립된 오행',
  ],
  caution: [
    '소통 능력 개발 필요',
    '감정 조절 연습',
    '타인 존중 의식',
    '협력 태도 함양',
  ],
};
