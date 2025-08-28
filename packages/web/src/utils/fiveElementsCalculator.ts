// 오행균형도 계산 엔진
import { SajuBirthInfo, FourPillars } from '@/types/saju';
import { 
  FiveElementsData, 
  ElementRelationship, 
  FiveElementsRecommendation,
  TimeFrameElements,
  ElementDetail,
  CalculationOptions,
  FiveElementsAnalysisResult
} from '@/types/fiveElements';

// 오행별 상세 정보 상수
export const ELEMENT_DETAILS: Record<keyof FiveElementsData, ElementDetail> = {
  wood: {
    name: '목',
    korean: '木',
    icon: '🌳',
    color: {
      primary: '#22c55e',
      secondary: '#16a34a',
      background: 'rgba(34, 197, 94, 0.1)'
    },
    characteristics: {
      positive: ['창조적', '성장지향적', '유연한', '진취적', '협력적'],
      negative: ['우유부단', '완고함', '과도한 이상주의', '현실성 부족']
    },
    season: '봄',
    direction: '동쪽',
    body_parts: ['간', '담낭', '눈', '근육', '손발톱'],
    emotions: ['분노', '짜증', '좌절감', '의욕']
  },
  fire: {
    name: '화',
    korean: '火',
    icon: '🔥',
    color: {
      primary: '#ef4444',
      secondary: '#dc2626',
      background: 'rgba(239, 68, 68, 0.1)'
    },
    characteristics: {
      positive: ['열정적', '활동적', '사교적', '리더십', '창의적'],
      negative: ['성급함', '충동적', '감정기복', '과잉행동']
    },
    season: '여름',
    direction: '남쪽',
    body_parts: ['심장', '소장', '혀', '혈관', '안색'],
    emotions: ['기쁨', '흥분', '열정', '조급함']
  },
  earth: {
    name: '토',
    korean: '土',
    icon: '🏔️',
    color: {
      primary: '#f59e0b',
      secondary: '#d97706',
      background: 'rgba(245, 158, 11, 0.1)'
    },
    characteristics: {
      positive: ['안정적', '신용있는', '성실한', '포용적', '현실적'],
      negative: ['보수적', '변화 거부', '고집', '의존적']
    },
    season: '늦여름',
    direction: '중앙',
    body_parts: ['비장', '위', '입술', '근육', '살'],
    emotions: ['걱정', '사려깊음', '안정감', '근심']
  },
  metal: {
    name: '금',
    korean: '金',
    icon: '⚔️',
    color: {
      primary: '#6b7280',
      secondary: '#4b5563',
      background: 'rgba(107, 114, 128, 0.1)'
    },
    characteristics: {
      positive: ['정의로운', '원칙적', '분석적', '체계적', '정확한'],
      negative: ['완벽주의', '비판적', '경직성', '감정 억제']
    },
    season: '가을',
    direction: '서쪽',
    body_parts: ['폐', '대장', '코', '피부', '모공'],
    emotions: ['슬픔', '애수', '그리움', '정의감']
  },
  water: {
    name: '수',
    korean: '水',
    icon: '🌊',
    color: {
      primary: '#3b82f6',
      secondary: '#2563eb',
      background: 'rgba(59, 130, 246, 0.1)'
    },
    characteristics: {
      positive: ['지혜로운', '유연한', '직관적', '적응력', '포용적'],
      negative: ['우유부단', '변덕스러움', '회피적', '과도한 감정이입']
    },
    season: '겨울',
    direction: '북쪽',
    body_parts: ['신장', '방광', '귀', '뼈', '머리카락'],
    emotions: ['두려움', '불안', '신중함', '지혜']
  }
};

// 천간지지별 오행 대응표
const HEAVENLY_STEMS_ELEMENTS: Record<string, keyof FiveElementsData> = {
  '갑': 'wood', '을': 'wood',
  '병': 'fire', '정': 'fire',
  '무': 'earth', '기': 'earth',
  '경': 'metal', '신': 'metal',
  '임': 'water', '계': 'water'
};

const EARTHLY_BRANCHES_ELEMENTS: Record<string, keyof FiveElementsData> = {
  '자': 'water', '축': 'earth', '인': 'wood', '묘': 'wood',
  '진': 'earth', '사': 'fire', '오': 'fire', '미': 'earth',
  '신': 'metal', '유': 'metal', '술': 'earth', '해': 'water'
};

export class FiveElementsCalculator {

  // 메인 계산 함수: 생년월일시로부터 오행 분석
  static calculateFromBirthInfo(
    birthInfo: SajuBirthInfo,
    options: Partial<CalculationOptions> = {}
  ): FiveElementsAnalysisResult {
    
    const defaultOptions: CalculationOptions = {
      includeHour: true,
      lunarCalendar: birthInfo.isLunar || false,
      timezone: 'Asia/Seoul',
      precisionLevel: 'detailed'
    };

    const finalOptions = { ...defaultOptions, ...options };
    
    // 사주 계산 (임시로 더미 데이터 사용)
    const fourPillars = this.getFourPillars(birthInfo);
    
    // 기본 오행 강도 계산
    const elements = this.calculateElementStrengths(fourPillars);
    
    // 시간대별 변화 계산
    const timeframes = this.calculateTimeFrameVariations(elements);
    
    // 상생상극 관계 분석
    const relationships = this.analyzeElementRelationships(elements);
    
    // 개인맞춤 추천사항 생성
    const recommendations = this.generateRecommendations(elements, relationships);

    return {
      birthInfo: {
        year: birthInfo.year,
        month: birthInfo.month,
        day: birthInfo.day,
        hour: birthInfo.hour,
        minute: birthInfo.minute || 0,
        isLunar: birthInfo.isLunar || false
      },
      elements,
      timeframes,
      relationships,
      recommendations,
      chartData: this.createChartData(elements, relationships, recommendations),
      calculatedAt: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  // 임시 사주 계산 (실제로는 더 복잡한 로직 필요)
  private static getFourPillars(birthInfo: SajuBirthInfo): FourPillars {
    // 임시 더미 데이터 - 실제로는 만세력 계산 필요
    return {
      year: { heavenly: '병', earthly: '술' },
      month: { heavenly: '신', earthly: '묘' },
      day: { heavenly: '임', earthly: '진' },
      hour: { heavenly: '계', earthly: '묘' }
    };
  }

  // 사주로부터 오행 강도 계산
  private static calculateElementStrengths(fourPillars: FourPillars): FiveElementsData {
    const elementCounts: Record<keyof FiveElementsData, number> = {
      wood: 0, fire: 0, earth: 0, metal: 0, water: 0
    };

    // 천간 계산 (각각 15점씩)
    const heavenlyStems = [
      fourPillars.year.heavenly,
      fourPillars.month.heavenly,
      fourPillars.day.heavenly,
      fourPillars.hour.heavenly
    ];

    heavenlyStems.forEach(stem => {
      const element = HEAVENLY_STEMS_ELEMENTS[stem];
      if (element) {
        elementCounts[element] += 15;
      }
    });

    // 지지 계산 (각각 10점씩)
    const earthlyBranches = [
      fourPillars.year.earthly,
      fourPillars.month.earthly,
      fourPillars.day.earthly,
      fourPillars.hour.earthly
    ];

    earthlyBranches.forEach(branch => {
      const element = EARTHLY_BRANCHES_ELEMENTS[branch];
      if (element) {
        elementCounts[element] += 10;
      }
    });

    // 점수 정규화 (0-100 범위)
    const total = Object.values(elementCounts).reduce((sum, val) => sum + val, 0);
    if (total === 0) {
      // 기본값 설정
      return { wood: 20, fire: 20, earth: 20, metal: 20, water: 20 };
    }

    return {
      wood: Math.round((elementCounts.wood / total) * 100),
      fire: Math.round((elementCounts.fire / total) * 100),
      earth: Math.round((elementCounts.earth / total) * 100),
      metal: Math.round((elementCounts.metal / total) * 100),
      water: Math.round((elementCounts.water / total) * 100)
    };
  }

  // 시간대별 변화 계산
  static calculateTimeFrameVariations(baseElements: FiveElementsData): TimeFrameElements {
    // 시간대별 변화 계수 (계절, 시기적 특성 반영)
    const variations = {
      today: { wood: 1.1, fire: 1.3, earth: 0.9, metal: 0.8, water: 1.2 },
      month: { wood: 0.9, fire: 1.1, earth: 1.2, metal: 1.1, water: 0.9 },
      year: { wood: 1.2, fire: 0.8, earth: 1.3, metal: 1.0, water: 1.1 }
    };

    const applyVariation = (elements: FiveElementsData, multipliers: any): FiveElementsData => ({
      wood: Math.min(100, Math.max(0, Math.round(elements.wood * multipliers.wood))),
      fire: Math.min(100, Math.max(0, Math.round(elements.fire * multipliers.fire))),
      earth: Math.min(100, Math.max(0, Math.round(elements.earth * multipliers.earth))),
      metal: Math.min(100, Math.max(0, Math.round(elements.metal * multipliers.metal))),
      water: Math.min(100, Math.max(0, Math.round(elements.water * multipliers.water)))
    });

    return {
      base: { ...baseElements },
      today: applyVariation(baseElements, variations.today),
      month: applyVariation(baseElements, variations.month),
      year: applyVariation(baseElements, variations.year)
    };
  }

  // 상생상극 관계 분석
  private static analyzeElementRelationships(elements: FiveElementsData): ElementRelationship {
    // 상생관계 강도 계산 (A생B: A의 강도가 B에게 미치는 영향)
    const mutual_generation = {
      wood_fire: Math.min(elements.wood, elements.fire) * 0.8,      // 목생화
      fire_earth: Math.min(elements.fire, elements.earth) * 0.8,    // 화생토
      earth_metal: Math.min(elements.earth, elements.metal) * 0.8,  // 토생금
      metal_water: Math.min(elements.metal, elements.water) * 0.8,  // 금생수
      water_wood: Math.min(elements.water, elements.wood) * 0.8     // 수생목
    };

    // 상극관계 강도 계산 (A극B: A가 B를 약화시키는 정도)
    const mutual_destruction = {
      wood_earth: Math.abs(elements.wood - elements.earth) * 0.6,   // 목극토
      fire_metal: Math.abs(elements.fire - elements.metal) * 0.6,   // 화극금
      earth_water: Math.abs(elements.earth - elements.water) * 0.6, // 토극수
      metal_wood: Math.abs(elements.metal - elements.wood) * 0.6,   // 금극목
      water_fire: Math.abs(elements.water - elements.fire) * 0.6    // 수극화
    };

    // 균형도 계산 (편차가 작을수록 균형적)
    const values = Object.values(elements);
    const average = values.reduce((sum, val) => sum + val, 0) / 5;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / 5;
    const balance_score = Math.max(0, Math.round(100 - (variance / 10)));

    // 강한/약한 원소 분류
    const elementEntries = Object.entries(elements) as [keyof FiveElementsData, number][];
    const sorted = elementEntries.sort((a, b) => b[1] - a[1]);
    
    const dominant_elements = sorted.slice(0, 2).map(([name]) => ELEMENT_DETAILS[name].name);
    const weak_elements = sorted.slice(-2).map(([name]) => ELEMENT_DETAILS[name].name);
    const missing_elements = sorted.filter(([, value]) => value < 10).map(([name]) => ELEMENT_DETAILS[name].name);

    return {
      mutual_generation,
      mutual_destruction,
      balance_score,
      dominant_elements,
      weak_elements,
      missing_elements
    };
  }

  // 개인맞춤 추천사항 생성
  private static generateRecommendations(
    elements: FiveElementsData,
    relationships: ElementRelationship
  ): FiveElementsRecommendation {
    
    const sortedElements = Object.entries(elements) as [keyof FiveElementsData, number][];
    sortedElements.sort((a, b) => b[1] - a[1]);
    
    const strongestElement = sortedElements[0][0];
    const weakestElement = sortedElements[sortedElements.length - 1][0];

    return {
      colors: {
        beneficial: [
          {
            name: `${ELEMENT_DETAILS[weakestElement].name} 보강색`,
            hex: ELEMENT_DETAILS[weakestElement].color.primary,
            description: `${ELEMENT_DETAILS[weakestElement].name}의 기운을 보강하여 균형을 맞춥니다`
          }
        ],
        avoid: [
          {
            name: `${ELEMENT_DETAILS[strongestElement].name} 과잉색`,
            hex: ELEMENT_DETAILS[strongestElement].color.primary,
            reason: `이미 강한 ${ELEMENT_DETAILS[strongestElement].name}의 기운을 더욱 강화할 수 있습니다`
          }
        ]
      },
      directions: {
        beneficial: [
          {
            direction: ELEMENT_DETAILS[weakestElement].direction,
            element: ELEMENT_DETAILS[weakestElement].name,
            benefit: `${ELEMENT_DETAILS[weakestElement].name}의 기운을 보강하여 운세 향상`
          }
        ],
        avoid: [
          {
            direction: ELEMENT_DETAILS[strongestElement].direction,
            element: ELEMENT_DETAILS[strongestElement].name,
            risk: `과도한 ${ELEMENT_DETAILS[strongestElement].name} 기운으로 불균형 심화`
          }
        ]
      },
      activities: {
        beneficial: [
          {
            activity: `${ELEMENT_DETAILS[weakestElement].season} 계절 활동`,
            element: ELEMENT_DETAILS[weakestElement].name,
            effect: `${ELEMENT_DETAILS[weakestElement].name}의 특성을 기를 수 있습니다`
          }
        ],
        avoid: [
          {
            activity: `과도한 ${ELEMENT_DETAILS[strongestElement].season} 계절 활동`,
            element: ELEMENT_DETAILS[strongestElement].name,
            risk: `이미 강한 기운이 더욱 강해져 다른 원소와 충돌할 수 있습니다`
          }
        ]
      },
      lifestyle: {
        diet: [
          {
            food: `${ELEMENT_DETAILS[weakestElement].name}에 해당하는 식품`,
            element: ELEMENT_DETAILS[weakestElement].name,
            benefit: `부족한 기운을 보강하여 건강과 운세 개선`
          }
        ],
        exercise: [
          {
            type: `${ELEMENT_DETAILS[weakestElement].name} 기운을 기르는 운동`,
            element: ELEMENT_DETAILS[weakestElement].name,
            effect: `균형잡힌 오행 순환으로 전체 운세 향상`
          }
        ],
        career: [
          {
            field: `${ELEMENT_DETAILS[strongestElement].name} 관련 직업`,
            element: ELEMENT_DETAILS[strongestElement].name,
            aptitude: `강한 기운을 활용할 수 있는 분야에서 성공 가능성 높음`
          }
        ]
      }
    };
  }

  // 차트 데이터 생성
  private static createChartData(
    elements: FiveElementsData,
    relationships: ElementRelationship,
    recommendations: FiveElementsRecommendation
  ): any {
    return {
      meta: {
        id: 'five-elements',
        title: '🌟 오행균형도',
        icon: '🌟',
        description: '목화토금수 균형과 상생상극 관계 분석',
        order: 1
      },
      data: {
        labels: ['목 🌳', '화 🔥', '토 🏔️', '금 ⚔️', '수 🌊'],
        values: [elements.wood, elements.fire, elements.earth, elements.metal, elements.water],
        colors: {
          primary: '#8b5cf6',
          secondary: '#06b6d4',
          background: 'rgba(139, 92, 246, 0.1)'
        }
      },
      timeframes: {
        base: [elements.wood, elements.fire, elements.earth, elements.metal, elements.water]
      },
      interpretation: {
        summary: `균형도 ${relationships.balance_score}점 - ${relationships.balance_score >= 70 ? '균형적' : relationships.balance_score >= 40 ? '보통' : '불균형적'}인 오행 상태입니다.`,
        positive: relationships.dominant_elements.map(el => `${el} 기운이 강하여 해당 분야에서 능력 발휘 가능`),
        negative: relationships.weak_elements.map(el => `${el} 기운 부족으로 해당 영역 보강 필요`),
        recommendations: [`${relationships.weak_elements[0]} 기운 보강을 위한 활동 추천`, '상생 관계 활용한 균형 개선 방안']
      }
    };
  }
}

export default FiveElementsCalculator;