// 12간지(地支) 상호작용 관련 타입 정의

export interface TwelveEarthlyBranchesData {
  ja: number     // 자(子) - 쥐
  chuk: number   // 축(丑) - 소  
  in: number     // 인(寅) - 호랑이
  myo: number    // 묘(卯) - 토끼
  jin: number    // 진(辰) - 용
  sa: number     // 사(巳) - 뱀
  o: number      // 오(午) - 말
  mi: number     // 미(未) - 양
  sin: number    // 신(申) - 원숭이
  yu: number     // 유(酉) - 닭
  sul: number    // 술(戌) - 개
  hae: number    // 해(亥) - 돼지
}

export type EarthlyBranchType = keyof TwelveEarthlyBranchesData

export interface BranchRelationship {
  type: 'harmony' | 'conflict' | 'punishment' | 'destruction' | 'neutral'
  strength: number  // 0-100
  description: string
}

export interface BranchInteractionMatrix {
  [key: string]: {  // "branch1-branch2" 형태의 키
    relationship: BranchRelationship
    effects: string[]
    recommendations: string[]
  }
}

export interface EarthlyBranchAnalysis {
  data: TwelveEarthlyBranchesData
  total: number
  dominant: EarthlyBranchType[]
  missing: EarthlyBranchType[]
  interactions: BranchInteractionMatrix
  overallHarmony: number  // 전체 조화도 (0-100)
  seasonalBalance: SeasonalBalance
  animalPersonality: AnimalPersonality
  recommendations: BranchRecommendations
}

export interface SeasonalBalance {
  spring: number   // 봄 (인묘진)
  summer: number   // 여름 (사오미)
  autumn: number   // 가을 (신유술)
  winter: number   // 겨울 (해자축)
  balance: number  // 사계절 균형도
}

export interface AnimalPersonality {
  primaryAnimal: string
  traits: string[]
  compatibility: string[]
  cautions: string[]
  lifePattern: string
}

export interface BranchRecommendations {
  colors: Array<{
    color: string
    hex: string
    reason: string
  }>
  directions: Array<{
    direction: string
    benefit: string
  }>
  timing: Array<{
    period: string
    activity: string
    effect: string
  }>
  relationships: Array<{
    compatible: string[]
    avoid: string[]
    reason: string
  }>
}

export interface EarthlyBranchInfo {
  name: string
  koreanName: string
  hanja: string
  animal: string
  animalEmoji: string
  element: 'water' | 'earth' | 'wood' | 'fire' | 'metal'
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  month: number
  direction: string
  time: string  // 시간대
  color: {
    primary: string
    secondary: string
    background: string
  }
  characteristics: string[]
  positiveTraits: string[]
  negativeTraits: string[]
  compatibility: EarthlyBranchType[]  // 잘 맞는 간지들
  conflict: EarthlyBranchType[]       // 충돌하는 간지들
}

// 12간지 상세 정보
export const EARTHLY_BRANCHES_INFO: Record<EarthlyBranchType, EarthlyBranchInfo> = {
  ja: {
    name: 'Ja',
    koreanName: '자',
    hanja: '子',
    animal: '쥐',
    animalEmoji: '🐭',
    element: 'water',
    season: 'winter',
    month: 11,
    direction: '북',
    time: '23:00-01:00',
    color: { primary: '#1E40AF', secondary: '#3B82F6', background: '#EFF6FF' },
    characteristics: ['영리함', '적응력', '기회포착'],
    positiveTraits: ['지혜', '민첩성', '실용성', '생존력'],
    negativeTraits: ['욕심', '계산적', '의심', '소심함'],
    compatibility: ['jin', 'sin'],  // 자진합, 자신합
    conflict: ['o']  // 자오충
  },
  chuk: {
    name: 'Chuk', 
    koreanName: '축',
    hanja: '丑',
    animal: '소',
    animalEmoji: '🐂',
    element: 'earth',
    season: 'winter',
    month: 12,
    direction: '북동',
    time: '01:00-03:00',
    color: { primary: '#92400E', secondary: '#D97706', background: '#FEF3C7' },
    characteristics: ['성실함', '인내력', '신뢰성'],
    positiveTraits: ['근면', '신중함', '책임감', '안정성'],
    negativeTraits: ['완고함', '보수적', '느림', '고집'],
    compatibility: ['sa', 'yu'],  // 축사합, 축유합
    conflict: ['mi']  // 축미충
  },
  in: {
    name: 'In',
    koreanName: '인',
    hanja: '寅',
    animal: '호랑이', 
    animalEmoji: '🐅',
    element: 'wood',
    season: 'spring',
    month: 1,
    direction: '동북',
    time: '03:00-05:00',
    color: { primary: '#059669', secondary: '#10B981', background: '#ECFDF5' },
    characteristics: ['용맹함', '리더십', '정의감'],
    positiveTraits: ['용기', '추진력', '정의감', '보호본능'],
    negativeTraits: ['성급함', '독선', '고집', '감정적'],
    compatibility: ['o', 'sul'],  // 인오합, 인술합  
    conflict: ['sin']  // 인신충
  },
  myo: {
    name: 'Myo',
    koreanName: '묘',
    hanja: '卯', 
    animal: '토끼',
    animalEmoji: '🐰',
    element: 'wood',
    season: 'spring',
    month: 2,
    direction: '동',
    time: '05:00-07:00',
    color: { primary: '#16A34A', secondary: '#22C55E', background: '#F0FDF4' },
    characteristics: ['온화함', '예술성', '직관력'],
    positiveTraits: ['부드러움', '예술감각', '평화주의', '직관'],
    negativeTraits: ['우유부단', '소심함', '의존성', '현실도피'],
    compatibility: ['mi', 'hae'],  // 묘미합, 묘해합
    conflict: ['yu']  // 묘유충
  },
  jin: {
    name: 'Jin',
    koreanName: '진',
    hanja: '辰',
    animal: '용',
    animalEmoji: '🐉',
    element: 'earth',
    season: 'spring',
    month: 3,
    direction: '동남',
    time: '07:00-09:00', 
    color: { primary: '#CA8A04', secondary: '#EAB308', background: '#FEFCE8' },
    characteristics: ['역동성', '변화', '신비성'],
    positiveTraits: ['포용력', '변화적응', '신비성', '창조력'],
    negativeTraits: ['변덕', '과도함', '신경질', '불안정'],
    compatibility: ['ja', 'yu'],  // 진자합, 진유합
    conflict: ['sul']  // 진술충
  },
  sa: {
    name: 'Sa', 
    koreanName: '사',
    hanja: '巳',
    animal: '뱀',
    animalEmoji: '🐍',
    element: 'fire',
    season: 'summer',
    month: 4,
    direction: '남동',
    time: '09:00-11:00',
    color: { primary: '#DC2626', secondary: '#EF4444', background: '#FEF2F2' },
    characteristics: ['지혜', '신중함', '신비함'],
    positiveTraits: ['지혜', '통찰력', '신중함', '집중력'],
    negativeTraits: ['의심', '질투', '복잡함', '집착'],
    compatibility: ['chuk', 'yu'],  // 사축합, 사유합
    conflict: ['hae']  // 사해충
  },
  o: {
    name: 'O',
    koreanName: '오',
    hanja: '午',
    animal: '말',
    animalEmoji: '🐎',
    element: 'fire',
    season: 'summer',
    month: 5,
    direction: '남',
    time: '11:00-13:00',
    color: { primary: '#E11D48', secondary: '#F43F5E', background: '#FFF1F2' },
    characteristics: ['활동성', '열정', '자유로움'],
    positiveTraits: ['활력', '자유로움', '열정', '진취성'],
    negativeTraits: ['성급함', '변덕', '불안정', '산만함'],
    compatibility: ['in', 'sul'],  // 오인합, 오술합
    conflict: ['ja']  // 오자충
  },
  mi: {
    name: 'Mi',
    koreanName: '미',
    hanja: '未',
    animal: '양',
    animalEmoji: '🐑',
    element: 'earth', 
    season: 'summer',
    month: 6,
    direction: '남서',
    time: '13:00-15:00',
    color: { primary: '#A16207', secondary: '#D97706', background: '#FEF3C7' },
    characteristics: ['온순함', '협조성', '예술성'],
    positiveTraits: ['온순함', '협조성', '예술성', '평화주의'],
    negativeTraits: ['우유부단', '의존성', '소극적', '걱정'],
    compatibility: ['myo', 'hae'],  // 미묘합, 미해합
    conflict: ['chuk']  // 미축충
  },
  sin: {
    name: 'Sin',
    koreanName: '신',
    hanja: '申',
    animal: '원숭이',
    animalEmoji: '🐵',
    element: 'metal',
    season: 'autumn',
    month: 7,
    direction: '서남', 
    time: '15:00-17:00',
    color: { primary: '#F59E0B', secondary: '#FBBF24', background: '#FFFBEB' },
    characteristics: ['재치', '활발함', '변화'],
    positiveTraits: ['재치', '활발함', '적응력', '창의성'],
    negativeTraits: ['변덕', '경박함', '불안정', '장난'],
    compatibility: ['ja', 'jin'],  // 신자합, 신진합
    conflict: ['in']  // 신인충
  },
  yu: {
    name: 'Yu',
    koreanName: '유',
    hanja: '酉',
    animal: '닭',
    animalEmoji: '🐓',
    element: 'metal',
    season: 'autumn',
    month: 8,
    direction: '서',
    time: '17:00-19:00',
    color: { primary: '#D97706', secondary: '#F59E0B', background: '#FEF3C7' },
    characteristics: ['정확성', '부지런함', '완벽주의'],
    positiveTraits: ['정확성', '부지런함', '완벽주의', '책임감'],
    negativeTraits: ['까다로움', '비판적', '경직성', '걱정'],
    compatibility: ['chuk', 'sa', 'jin'],  // 유축합, 유사합, 유진합
    conflict: ['myo']  // 유묘충
  },
  sul: {
    name: 'Sul',
    koreanName: '술',
    hanja: '戌',
    animal: '개',
    animalEmoji: '🐕',
    element: 'earth',
    season: 'autumn',
    month: 9,
    direction: '서북',
    time: '19:00-21:00',
    color: { primary: '#92400E', secondary: '#B45309', background: '#FEF3C7' },
    characteristics: ['충성심', '정의감', '보호본능'],
    positiveTraits: ['충성심', '정의감', '보호본능', '신뢰성'],
    negativeTraits: ['완고함', '의심', '보수적', '걱정'],
    compatibility: ['in', 'o'],  // 술인합, 술오합
    conflict: ['jin']  // 술진충
  },
  hae: {
    name: 'Hae',
    koreanName: '해',
    hanja: '亥',
    animal: '돼지',
    animalEmoji: '🐷',
    element: 'water',
    season: 'winter',
    month: 10,
    direction: '북서',
    time: '21:00-23:00',
    color: { primary: '#1E40AF', secondary: '#2563EB', background: '#EFF6FF' },
    characteristics: ['관대함', '성실함', '단순함'],
    positiveTraits: ['관대함', '성실함', '정직함', '포용력'],
    negativeTraits: ['단순함', '게으름', '욕심', '고집'],
    compatibility: ['myo', 'mi'],  // 해묘합, 해미합  
    conflict: ['sa']  // 해사충
  }
}

// 관계 유형별 정보
export const RELATIONSHIP_TYPES = {
  harmony: {
    name: '조화',
    description: '서로를 보완하고 발전시키는 관계',
    color: '#10B981',
    icon: '🤝'
  },
  conflict: {
    name: '충돌',
    description: '서로 대립하고 견제하는 관계',
    color: '#EF4444', 
    icon: '⚔️'
  },
  punishment: {
    name: '형',
    description: '서로를 억제하고 제약하는 관계',
    color: '#F59E0B',
    icon: '⚠️'
  },
  destruction: {
    name: '파괴',
    description: '서로를 해치고 파괴하는 관계',
    color: '#DC2626',
    icon: '💥'
  },
  neutral: {
    name: '중립',
    description: '특별한 영향을 주고받지 않는 관계',
    color: '#6B7280',
    icon: '➖'
  }
}