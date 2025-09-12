import { 
  SajuBirthInfo, 
  SajuData, 
  FiveElements, 
  TenGods, 
  SixAreaScores,
  PersonalityTraits,
  SeventeenFortuneScores,
} from '@/types/saju';
import { SajuCalculator, FourPillarsResult } from './sajuCalculator';

// 천간의 오행 속성
const HEAVENLY_STEM_ELEMENTS: Record<string, keyof FiveElements> = {
  '갑': 'wood', '을': 'wood',
  '병': 'fire', '정': 'fire',
  '무': 'earth', '기': 'earth',
  '경': 'metal', '신': 'metal',
  '임': 'water', '계': 'water',
};

// 지지의 오행 속성
const EARTHLY_BRANCH_ELEMENTS: Record<string, keyof FiveElements> = {
  '자': 'water', '축': 'earth', '인': 'wood', '묘': 'wood',
  '진': 'earth', '사': 'fire', '오': 'fire', '미': 'earth',
  '신': 'metal', '유': 'metal', '술': 'earth', '해': 'water',
};

// 지지의 장간(藏干) - 각 지지에 숨어있는 천간
const HIDDEN_STEMS: Record<string, string[]> = {
  '자': ['계'],
  '축': ['기', '계', '신'],
  '인': ['갑', '병', '무'],
  '묘': ['을'],
  '진': ['무', '을', '계'],
  '사': ['병', '무', '경'],
  '오': ['정', '기'],
  '미': ['기', '정', '을'],
  '신': ['경', '임', '무'],
  '유': ['신'],
  '술': ['무', '신', '정'],
  '해': ['임', '갑'],
};

// 십성 관계 테이블 (일간 기준)
const TEN_GODS_RELATIONS: Record<string, Record<string, keyof TenGods>> = {
  '갑': {
    '갑': 'bijeon', '을': 'geopjae', '병': 'siksin', '정': 'sanggwan',
    '무': 'pyeonjae', '기': 'jeongjae', '경': 'pyeongwan', '신': 'jeonggwan',
    '임': 'pyeongin', '계': 'jeongin',
  },
  '을': {
    '을': 'bijeon', '갑': 'geopjae', '정': 'siksin', '병': 'sanggwan',
    '기': 'pyeonjae', '무': 'jeongjae', '신': 'pyeongwan', '경': 'jeonggwan',
    '계': 'pyeongin', '임': 'jeongin',
  },
  '병': {
    '병': 'bijeon', '정': 'geopjae', '무': 'siksin', '기': 'sanggwan',
    '경': 'pyeonjae', '신': 'jeongjae', '임': 'pyeongwan', '계': 'jeonggwan',
    '갑': 'pyeongin', '을': 'jeongin',
  },
  '정': {
    '정': 'bijeon', '병': 'geopjae', '기': 'siksin', '무': 'sanggwan',
    '신': 'pyeonjae', '경': 'jeongjae', '계': 'pyeongwan', '임': 'jeonggwan',
    '을': 'pyeongin', '갑': 'jeongin',
  },
  '무': {
    '무': 'bijeon', '기': 'geopjae', '경': 'siksin', '신': 'sanggwan',
    '임': 'pyeonjae', '계': 'jeongjae', '갑': 'pyeongwan', '을': 'jeonggwan',
    '병': 'pyeongin', '정': 'jeongin',
  },
  '기': {
    '기': 'bijeon', '무': 'geopjae', '신': 'siksin', '경': 'sanggwan',
    '계': 'pyeonjae', '임': 'jeongjae', '을': 'pyeongwan', '갑': 'jeonggwan',
    '정': 'pyeongin', '병': 'jeongin',
  },
  '경': {
    '경': 'bijeon', '신': 'geopjae', '임': 'siksin', '계': 'sanggwan',
    '갑': 'pyeonjae', '을': 'jeongjae', '병': 'pyeongwan', '정': 'jeonggwan',
    '무': 'pyeongin', '기': 'jeongin',
  },
  '신': {
    '신': 'bijeon', '경': 'geopjae', '계': 'siksin', '임': 'sanggwan',
    '을': 'pyeonjae', '갑': 'jeongjae', '정': 'pyeongwan', '병': 'jeonggwan',
    '기': 'pyeongin', '무': 'jeongin',
  },
  '임': {
    '임': 'bijeon', '계': 'geopjae', '갑': 'siksin', '을': 'sanggwan',
    '병': 'pyeonjae', '정': 'jeongjae', '무': 'pyeongwan', '기': 'jeonggwan',
    '경': 'pyeongin', '신': 'jeongin',
  },
  '계': {
    '계': 'bijeon', '임': 'geopjae', '을': 'siksin', '갑': 'sanggwan',
    '정': 'pyeonjae', '병': 'jeongjae', '기': 'pyeongwan', '무': 'jeonggwan',
    '신': 'pyeongin', '경': 'jeongin',
  },
};

// 오행 점수 계산
export function calculateFiveElements(fourPillars: FourPillarsResult): FiveElements {
  const elements: FiveElements = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  
  // 년주, 월주, 일주, 시주의 천간과 지지 분석
  const pillars = [fourPillars.year, fourPillars.month, fourPillars.day, fourPillars.hour];
  
  pillars.forEach((pillar, index) => {
    // 천간 오행 (일주는 가중치 높게)
    const heavenlyElement = HEAVENLY_STEM_ELEMENTS[pillar.heavenly];
    if (heavenlyElement) {
      const weight = index === 2 ? 20 : 15; // 일주 천간은 20점, 나머지는 15점
      elements[heavenlyElement] += weight;
    }
    
    // 지지 오행
    const earthlyElement = EARTHLY_BRANCH_ELEMENTS[pillar.earthly];
    if (earthlyElement) {
      const weight = index === 2 ? 15 : 10; // 일주 지지는 15점, 나머지는 10점
      elements[earthlyElement] += weight;
    }
    
    // 장간 오행 (숨어있는 천간)
    const hiddenStems = HIDDEN_STEMS[pillar.earthly] || [];
    hiddenStems.forEach(stem => {
      const hiddenElement = HEAVENLY_STEM_ELEMENTS[stem];
      if (hiddenElement) {
        elements[hiddenElement] += 5; // 장간은 5점
      }
    });
  });
  
  // 정규화 (총합 100점으로)
  const total = Object.values(elements).reduce((sum, val) => sum + val, 0);
  if (total > 0) {
    Object.keys(elements).forEach(key => {
      const k = key as keyof FiveElements;
      elements[k] = Math.round((elements[k] / total) * 100);
    });
  }
  
  return elements;
}

// 십성 점수 계산
export function calculateTenGods(fourPillars: FourPillarsResult): TenGods {
  const dayMaster = fourPillars.day.heavenly; // 일간
  const tenGods: TenGods = {
    bijeon: 0, geopjae: 0, siksin: 0, sanggwan: 0,
    jeongjae: 0, pyeonjae: 0, jeonggwan: 0, pyeongwan: 0,
    jeongin: 0, pyeongin: 0,
  };
  
  if (!TEN_GODS_RELATIONS[dayMaster]) {
    console.error('Invalid day master:', dayMaster);
    return tenGods;
  }
  
  const pillars = [fourPillars.year, fourPillars.month, fourPillars.day, fourPillars.hour];
  
  pillars.forEach((pillar, index) => {
    // 천간의 십성 관계
    const relation = TEN_GODS_RELATIONS[dayMaster][pillar.heavenly];
    if (relation) {
      const weight = index === 2 ? 15 : 10; // 일주는 가중치 높게
      tenGods[relation] += weight;
    }
    
    // 지지의 장간도 고려
    const hiddenStems = HIDDEN_STEMS[pillar.earthly] || [];
    hiddenStems.forEach(stem => {
      const hiddenRelation = TEN_GODS_RELATIONS[dayMaster][stem];
      if (hiddenRelation) {
        tenGods[hiddenRelation] += 5;
      }
    });
  });
  
  return tenGods;
}

// 6대 영역 점수 계산
export function calculateSixAreas(fiveElements: FiveElements, tenGods: TenGods): SixAreaScores {
  return {
    foundation: calculateFoundationScore(fiveElements, tenGods),
    thinking: calculateThinkingScore(fiveElements, tenGods),
    relationship: calculateRelationshipScore(fiveElements, tenGods),
    action: calculateActionScore(fiveElements, tenGods),
    luck: calculateLuckScore(fiveElements, tenGods),
    environment: calculateEnvironmentScore(fiveElements, tenGods),
  };
}

// 근본 점수 계산
function calculateFoundationScore(elements: FiveElements, gods: TenGods): number {
  // 목과 토의 균형, 비견과 정인의 강도
  const elementBalance = (elements.wood + elements.earth) / 2;
  const godStrength = (gods.bijeon * 2 + gods.jeongin * 2);
  return Math.min(100, Math.round(elementBalance + godStrength));
}

// 사고 점수 계산
function calculateThinkingScore(elements: FiveElements, gods: TenGods): number {
  // 수와 화의 균형, 식신과 상관의 영향
  const elementBalance = (elements.water + elements.fire) / 2;
  const godStrength = (gods.siksin * 2 + gods.sanggwan * 1.5);
  return Math.min(100, Math.round(elementBalance + godStrength));
}

// 인연 점수 계산
function calculateRelationshipScore(elements: FiveElements, gods: TenGods): number {
  // 목과 화의 조화, 정재와 편재의 영향
  const elementBalance = (elements.wood + elements.fire) / 2;
  const godStrength = (gods.jeongjae * 2 + gods.pyeonjae * 1.5);
  return Math.min(100, Math.round(elementBalance + godStrength));
}

// 행동 점수 계산
function calculateActionScore(elements: FiveElements, gods: TenGods): number {
  // 금과 목의 균형, 정관과 편관의 영향
  const elementBalance = (elements.metal + elements.wood) / 2;
  const godStrength = (gods.jeonggwan * 2 + gods.pyeongwan * 1.5);
  return Math.min(100, Math.round(elementBalance + godStrength));
}

// 행운 점수 계산
function calculateLuckScore(elements: FiveElements, gods: TenGods): number {
  // 오행의 균형도
  const values = Object.values(elements);
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
  const balance = Math.max(0, 100 - variance * 2);
  
  // 십성의 조화
  const godBalance = (gods.jeongin + gods.pyeongin + gods.siksin) / 3;
  
  return Math.min(100, Math.round(balance * 0.6 + godBalance * 0.4));
}

// 환경 점수 계산
function calculateEnvironmentScore(elements: FiveElements, gods: TenGods): number {
  // 토와 수의 조화, 비견과 겁재의 영향
  const elementBalance = (elements.earth + elements.water) / 2;
  const godStrength = (gods.bijeon * 1.5 + gods.geopjae * 1.5);
  return Math.min(100, Math.round(elementBalance + godStrength));
}

// 성격 특성 계산
export function calculatePersonalityTraits(elements: FiveElements, gods: TenGods): PersonalityTraits {
  return {
    emotion: Math.min(100, Math.round(elements.water * 0.7 + gods.jeongin * 2)),
    logic: Math.min(100, Math.round(elements.metal * 0.7 + gods.jeonggwan * 2)),
    artistic: Math.min(100, Math.round(elements.fire * 0.7 + gods.siksin * 2)),
    rational: Math.min(100, Math.round(elements.earth * 0.7 + gods.sanggwan * 2)),
    character: Math.min(100, Math.round(elements.wood * 0.7 + gods.bijeon * 2)),
    intelligence: Math.min(100, Math.round((elements.water + elements.metal) * 0.4 + gods.pyeongin * 2)),
    learning: Math.min(100, Math.round(elements.wood * 0.5 + gods.jeongin * 2.5)),
  };
}

// 17대 운세 계산
export function calculateSeventeenFortunes(elements: FiveElements, gods: TenGods): SeventeenFortuneScores {
  return {
    health: Math.min(100, Math.round(elements.wood * 0.8 + gods.bijeon * 2)),
    marriage: Math.min(100, Math.round(elements.fire * 0.6 + (gods.jeongjae + gods.pyeonjae) * 1.5)),
    power: Math.min(100, Math.round(elements.metal * 0.7 + (gods.jeonggwan + gods.pyeongwan) * 1.5)),
    fame: Math.min(100, Math.round(elements.fire * 0.8 + gods.siksin * 2)),
    accident: Math.max(10, Math.round(100 - elements.earth * 0.8 - gods.jeongin * 2)),
    business: Math.min(100, Math.round(elements.metal * 0.6 + gods.pyeonjae * 2.5)),
    movement: Math.min(100, Math.round(elements.water * 0.8 + gods.geopjae * 2)),
    separation: Math.max(10, Math.round(100 - elements.earth * 0.7 - gods.bijeon * 2)),
    relationship: Math.min(100, Math.round(elements.fire * 0.7 + gods.jeongin * 2)),
    children: Math.min(100, Math.round(elements.wood * 0.6 + gods.siksin * 2.5)),
    talent: Math.min(100, Math.round(elements.water * 0.7 + gods.pyeongin * 2)),
    wealth: Math.min(100, Math.round(elements.metal * 0.5 + (gods.jeongjae + gods.pyeonjae) * 2)),
    ancestor: Math.min(100, Math.round(elements.earth * 0.8 + gods.jeongin * 1.5)),
    career: Math.min(100, Math.round(elements.metal * 0.6 + gods.jeonggwan * 2.5)),
    family: Math.min(100, Math.round(elements.earth * 0.7 + gods.bijeon * 2)),
    study: Math.min(100, Math.round(elements.water * 0.6 + gods.jeongin * 2.5)),
    fortune: Math.min(100, Math.round((elements.fire + elements.water) * 0.4 + gods.pyeongin * 2)),
  };
}

// 총점 계산
function calculateTotalScore(sixAreas: SixAreaScores): number {
  return Object.values(sixAreas).reduce((sum, val) => sum + val, 0);
}

// 평균 점수 계산
function calculateAverageScore(sixAreas: SixAreaScores): number {
  const values = Object.values(sixAreas);
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

// 사주 데이터 형식 변환
function convertFourPillarsFormat(fourPillars: FourPillarsResult) {
  return {
    year: { 
      heavenly: fourPillars.year.heavenly, 
      earthly: fourPillars.year.earthly, 
    },
    month: { 
      heavenly: fourPillars.month.heavenly, 
      earthly: fourPillars.month.earthly, 
    },
    day: { 
      heavenly: fourPillars.day.heavenly, 
      earthly: fourPillars.day.earthly, 
    },
    hour: { 
      heavenly: fourPillars.hour.heavenly, 
      earthly: fourPillars.hour.earthly, 
    },
  };
}

// 통합 사주 데이터 계산 함수
export function calculateSajuData(birthInfo: SajuBirthInfo): SajuData {
  // 사주 계산
  const fourPillars = SajuCalculator.calculateFourPillars(birthInfo);
  
  // 오행 계산
  const fiveElements = calculateFiveElements(fourPillars);
  
  // 십성 계산
  const tenGods = calculateTenGods(fourPillars);
  
  // 6대 영역 계산
  const sixAreas = calculateSixAreas(fiveElements, tenGods);
  
  // 성격 특성 계산
  const personalityTraits = calculatePersonalityTraits(fiveElements, tenGods);
  
  // 17대 운세 계산
  const seventeenFortunes = calculateSeventeenFortunes(fiveElements, tenGods);
  
  return {
    birthInfo,
    fourPillars: convertFourPillarsFormat(fourPillars),
    fiveElements,
    tenGods,
    sixAreas,
    dayMaster: fourPillars.day.heavenly,
    totalScore: calculateTotalScore(sixAreas),
    averageScore: calculateAverageScore(sixAreas),
    personalityTraits,
    seventeenFortunes,
  };
}