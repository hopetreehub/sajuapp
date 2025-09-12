// 십성(十星) 관련 타입 정의

export interface TenGodsData {
  bijeon: number    // 비견(比肩) - 자아, 자존심
  geopjae: number   // 겁재(劫財) - 경쟁, 도전
  siksin: number    // 식신(食神) - 표현, 재능
  sanggwan: number  // 상관(傷官) - 창조, 반항
  pyeonjae: number  // 편재(偏財) - 활동, 사교
  jeongjae: number  // 정재(正財) - 근면, 절약
  pyeongwan: number // 편관(偏官) - 개척, 모험
  jeonggwan: number // 정관(正官) - 명예, 권위
  pyeongin: number  // 편인(偏印) - 직감, 독창
  jeongin: number   // 정인(正印) - 학습, 보호
}

export interface TenGodsAnalysis {
  data: TenGodsData
  total: number
  percentages: TenGodsData
  dominant: TenGodType[]     // 강한 십성 (15% 이상)
  weak: TenGodType[]         // 약한 십성 (3% 미만)
  missing: TenGodType[]      // 없는 십성
  balance: TenGodsBalance
  personality: PersonalityProfile
  recommendations: TenGodsRecommendation
}

export type TenGodType = keyof TenGodsData

export interface TenGodsBalance {
  score: number           // 0-100 균형 점수
  status: 'excellent' | 'good' | 'fair' | 'poor'
  description: string
}

export interface PersonalityProfile {
  leadership: number      // 리더십 (관성 기반)
  creativity: number      // 창의성 (식상 기반)
  stability: number       // 안정성 (인성 기반)
  sociability: number     // 사교성 (재성 기반)
  independence: number    // 독립성 (비겁 기반)
  overall: string         // 종합 성향
}

export interface TenGodsRecommendation {
  career: Array<{
    field: string
    tenGod: TenGodType
    suitability: number
    reason: string
  }>
  relationships: Array<{
    type: string
    advice: string
    basedOn: TenGodType[]
  }>
  development: Array<{
    area: string
    method: string
    targetTenGod: TenGodType
  }>
  caution: Array<{
    issue: string
    reason: string
    solution: string
  }>
}

export interface TenGodInfo {
  name: string
  koreanName: string
  hanja: string
  category: 'self' | 'expression' | 'wealth' | 'authority' | 'support'
  icon: string
  color: {
    primary: string
    secondary: string
    background: string
  }
  keywords: string[]
  positiveTraits: string[]
  negativeTraits: string[]
  description: string
  roles: string[]
}

// 십성 정보 상수
export const TEN_GODS_INFO: Record<TenGodType, TenGodInfo> = {
  bijeon: {
    name: 'Bijeon',
    koreanName: '비견',
    hanja: '比肩',
    category: 'self',
    icon: '🤝',
    color: {
      primary: '#6366F1',
      secondary: '#818CF8',
      background: '#EEF2FF',
    },
    keywords: ['자아', '동등', '협력', '자존심'],
    positiveTraits: ['협동성', '동료애', '공정함', '균형감각'],
    negativeTraits: ['고집', '경직성', '비타협적', '자기중심적'],
    description: '자아와 동등한 기운으로 협력과 경쟁을 나타냄',
    roles: ['팀워크', '동료관계', '자아실현', '공정한 경쟁'],
  },
  geopjae: {
    name: 'Geopjae',
    koreanName: '겁재',
    hanja: '劫財',
    category: 'self', 
    icon: '⚡',
    color: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      background: '#F3F4F6',
    },
    keywords: ['경쟁', '도전', '변화', '투쟁'],
    positiveTraits: ['도전정신', '변화적응', '추진력', '개척정신'],
    negativeTraits: ['성급함', '충동성', '파괴성', '불안정'],
    description: '재물을 빼앗는 기운으로 경쟁과 도전을 의미',
    roles: ['혁신', '변화주도', '경쟁력', '위기대응'],
  },
  siksin: {
    name: 'Siksin',
    koreanName: '식신',
    hanja: '食神',
    category: 'expression',
    icon: '🎨',
    color: {
      primary: '#10B981',
      secondary: '#34D399',
      background: '#ECFDF5',
    },
    keywords: ['표현', '재능', '즐거움', '창작'],
    positiveTraits: ['재능', '표현력', '유쾌함', '창의성'],
    negativeTraits: ['방만함', '안일함', '현실도피', '의존성'],
    description: '일간이 생하는 기운으로 재능과 표현력을 나타냄',
    roles: ['예술', '창작', '엔터테인먼트', '서비스'],
  },
  sanggwan: {
    name: 'Sanggwan',
    koreanName: '상관',
    hanja: '傷官',
    category: 'expression',
    icon: '🚀',
    color: {
      primary: '#F59E0B',
      secondary: '#FBBF24', 
      background: '#FFFBEB',
    },
    keywords: ['창조', '반항', '혁신', '비판'],
    positiveTraits: ['창조력', '혁신성', '독창성', '예술성'],
    negativeTraits: ['반항성', '비판적', '불안정', '극단적'],
    description: '관을 상하게 하는 기운으로 창조와 혁신을 의미',
    roles: ['혁신', '창업', '예술', '비판'],
  },
  pyeonjae: {
    name: 'Pyeonjae',
    koreanName: '편재',
    hanja: '偏財',
    category: 'wealth',
    icon: '💰',
    color: {
      primary: '#EF4444',
      secondary: '#F87171',
      background: '#FEF2F2',
    },
    keywords: ['활동', '사교', '유동', '기회'],
    positiveTraits: ['사교성', '활동력', '기회포착', '유연성'],
    negativeTraits: ['산만함', '불안정', '투기성', '낭비'],
    description: '일간이 극하는 동성 재물로 활동적 재물을 의미',
    roles: ['영업', '사교', '서비스', '유통'],
  },
  jeongjae: {
    name: 'Jeongjae',
    koreanName: '정재',
    hanja: '正財',
    category: 'wealth',
    icon: '🏦',
    color: {
      primary: '#DC2626',
      secondary: '#EF4444',
      background: '#FEF2F2',
    },
    keywords: ['근면', '절약', '안정', '축적'],
    positiveTraits: ['근면성', '절약정신', '계획성', '안정성'],
    negativeTraits: ['보수성', '소심함', '경직성', '물질주의'],
    description: '일간이 극하는 이성 재물로 정당한 재물을 의미',
    roles: ['관리', '회계', '저축', '투자'],
  },
  pyeongwan: {
    name: 'Pyeongwan',
    koreanName: '편관',
    hanja: '偏官',
    category: 'authority',
    icon: '⚔️',
    color: {
      primary: '#7C2D12',
      secondary: '#A16207',
      background: '#FEF3C7',
    },
    keywords: ['개척', '모험', '권력', '압박'],
    positiveTraits: ['개척정신', '추진력', '결단력', '리더십'],
    negativeTraits: ['독선적', '권위적', '성급함', '강압적'],
    description: '일간을 극하는 동성 관성으로 개척과 권력을 의미',
    roles: ['개척', '경영', '군사', '혁신'],
  },
  jeonggwan: {
    name: 'Jeonggwan', 
    koreanName: '정관',
    hanja: '正官',
    category: 'authority',
    icon: '👑',
    color: {
      primary: '#92400E',
      secondary: '#D97706',
      background: '#FEF3C7',
    },
    keywords: ['명예', '권위', '질서', '책임'],
    positiveTraits: ['책임감', '신뢰성', '품격', '리더십'],
    negativeTraits: ['보수성', '형식적', '권위의존', '소극성'],
    description: '일간을 극하는 이성 관성으로 명예와 권위를 의미',
    roles: ['관리', '행정', '교육', '상담'],
  },
  pyeongin: {
    name: 'Pyeongin',
    koreanName: '편인',
    hanja: '偏印',
    category: 'support',
    icon: '🔮',
    color: {
      primary: '#3B82F6',
      secondary: '#60A5FA',
      background: '#EFF6FF',
    },
    keywords: ['직감', '독창', '신비', '특별함'],
    positiveTraits: ['직감력', '독창성', '신비성', '특별함'],
    negativeTraits: ['외로움', '비현실적', '변덕', '까다로움'],
    description: '일간을 생하는 동성 인성으로 직감과 독창성을 의미',
    roles: ['연구', '창작', '상담', '치료'],
  },
  jeongin: {
    name: 'Jeongin',
    koreanName: '정인',
    hanja: '正印',
    category: 'support',
    icon: '📚',
    color: {
      primary: '#1D4ED8',
      secondary: '#3B82F6',
      background: '#EFF6FF',
    },
    keywords: ['학습', '보호', '지혜', '인덕'],
    positiveTraits: ['학습력', '인덕', '보호본능', '지혜'],
    negativeTraits: ['의존성', '소극성', '현실도피', '게으름'],
    description: '일간을 생하는 이성 인성으로 학습과 보호를 의미',
    roles: ['교육', '학습', '상담', '보육'],
  },
};

// 십성 카테고리 정보
export const TEN_GODS_CATEGORIES = {
  self: {
    name: '자아성',
    description: '자아와 관련된 기운',
    tenGods: ['bijeon', 'geopjae'] as TenGodType[],
  },
  expression: {
    name: '표현성',
    description: '재능과 표현에 관련된 기운', 
    tenGods: ['siksin', 'sanggwan'] as TenGodType[],
  },
  wealth: {
    name: '재물성',
    description: '재물과 관련된 기운',
    tenGods: ['pyeonjae', 'jeongjae'] as TenGodType[],
  },
  authority: {
    name: '관성',
    description: '권위와 명예에 관련된 기운',
    tenGods: ['pyeongwan', 'jeonggwan'] as TenGodType[],
  },
  support: {
    name: '인성',
    description: '학습과 보호에 관련된 기운',
    tenGods: ['pyeongin', 'jeongin'] as TenGodType[],
  },
};

// 십성 균형 판정 기준
export const TEN_GODS_THRESHOLDS = {
  DOMINANT_MIN: 0.15,     // 15% 이상이면 강한 십성
  WEAK_MAX: 0.03,         // 3% 미만이면 약한 십성
  EXCELLENT_MIN: 85,      // 85점 이상 - 매우 균형
  GOOD_MIN: 70,          // 70점 이상 - 균형 양호
  FAIR_MIN: 50,           // 50점 이상 - 보통
};