// 오행 분석 유틸리티

import { 
  FiveElementsData, 
  ElementRelationship, 
  FiveElementsRecommendation,
  ElementDetail, 
} from '@/types/fiveElements';
import { SajuData } from '@/types/saju';

export class FiveElementsAnalyzer {
  
  /**
   * 사주 데이터로부터 오행 균형도 분석
   */
  static analyzeFromSaju(sajuData: SajuData): FiveElementsData {
    const { fiveElements } = sajuData;
    
    return {
      wood: fiveElements.wood || 0,
      fire: fiveElements.fire || 0,
      earth: fiveElements.earth || 0,
      metal: fiveElements.metal || 0,
      water: fiveElements.water || 0,
    };
  }

  /**
   * 오행 간 관계 분석 (상생, 상극)
   */
  static analyzeElementRelationships(elements: FiveElementsData): ElementRelationship {
    const total = elements.wood + elements.fire + elements.earth + elements.metal + elements.water;
    
    // 상생 관계 강도 계산
    const mutual_generation = {
      wood_fire: Math.min((elements.wood * elements.fire) / 100, 100),      // 목생화
      fire_earth: Math.min((elements.fire * elements.earth) / 100, 100),    // 화생토
      earth_metal: Math.min((elements.earth * elements.metal) / 100, 100),  // 토생금
      metal_water: Math.min((elements.metal * elements.water) / 100, 100),  // 금생수
      water_wood: Math.min((elements.water * elements.wood) / 100, 100),     // 수생목
    };
    
    // 상극 관계 강도 계산
    const mutual_destruction = {
      wood_earth: Math.min((elements.wood * elements.earth) / 100, 100),    // 목극토
      fire_metal: Math.min((elements.fire * elements.metal) / 100, 100),    // 화극금
      earth_water: Math.min((elements.earth * elements.water) / 100, 100),  // 토극수
      metal_wood: Math.min((elements.metal * elements.wood) / 100, 100),    // 금극목
      water_fire: Math.min((elements.water * elements.fire) / 100, 100),     // 수극화
    };
    
    // 균형도 점수 계산 (분산이 작을수록 균형)
    const values = Object.values(elements);
    const average = total / 5;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / 5;
    const balance_score = Math.max(0, 100 - variance);
    
    // 강한/약한/부족한 원소 판정
    const dominant_elements: string[] = [];
    const weak_elements: string[] = [];
    const missing_elements: string[] = [];
    
    Object.entries(elements).forEach(([element, value]) => {
      const percentage = value / total;
      if (percentage > 0.3) dominant_elements.push(element);
      else if (percentage < 0.1) weak_elements.push(element);
      if (value === 0) missing_elements.push(element);
    });
    
    return {
      mutual_generation,
      mutual_destruction,
      balance_score,
      dominant_elements,
      weak_elements,
      missing_elements,
    };
  }

  /**
   * 오행 기반 맞춤 추천사항 생성
   */
  static generateRecommendations(
    elements: FiveElementsData, 
    relationships: ElementRelationship,
  ): FiveElementsRecommendation {
    const colors = this.getColorRecommendations(elements);
    const directions = this.getDirectionRecommendations(elements);
    const activities = this.getActivityRecommendations(elements);
    const lifestyle = this.getLifestyleRecommendations(elements);
    
    return {
      colors,
      directions,
      activities,
      lifestyle,
    };
  }

  /**
   * 오행별 세부 정보 제공
   */
  static getElementDetails(): Record<keyof FiveElementsData, ElementDetail> {
    return {
      wood: {
        name: 'Wood',
        korean: '목(木)',
        icon: '🌳',
        color: {
          primary: '#10B981',
          secondary: '#34D399',
          background: '#ECFDF5',
        },
        characteristics: {
          positive: ['창의성', '성장력', '유연성', '진취성'],
          negative: ['성급함', '변덕', '우유부단', '과도한 이상주의'],
        },
        season: '봄',
        direction: '동쪽',
        body_parts: ['간', '담', '눈', '근육'],
        emotions: ['분노', '짜증', '좌절감'],
      },
      fire: {
        name: 'Fire',
        korean: '화(火)',
        icon: '🔥',
        color: {
          primary: '#EF4444',
          secondary: '#F87171',
          background: '#FEF2F2',
        },
        characteristics: {
          positive: ['열정', '활력', '리더십', '표현력'],
          negative: ['성급함', '충동성', '과열', '소진'],
        },
        season: '여름',
        direction: '남쪽',
        body_parts: ['심장', '소장', '혀', '혈관'],
        emotions: ['기쁨', '흥분', '조급함'],
      },
      earth: {
        name: 'Earth',
        korean: '토(土)',
        icon: '🏔️',
        color: {
          primary: '#A16207',
          secondary: '#D97706',
          background: '#FFFBEB',
        },
        characteristics: {
          positive: ['안정성', '신뢰성', '포용력', '인내력'],
          negative: ['고집', '보수성', '느림', '걱정'],
        },
        season: '늦여름',
        direction: '중앙',
        body_parts: ['비장', '위', '입', '살'],
        emotions: ['걱정', '우려', '사려깊음'],
      },
      metal: {
        name: 'Metal',
        korean: '금(金)',
        icon: '⚡',
        color: {
          primary: '#FCD34D',
          secondary: '#FDE047',
          background: '#FEFCE8',
        },
        characteristics: {
          positive: ['정의감', '원칙성', '완결력', '논리성'],
          negative: ['경직성', '냉정함', '비판적', '완벽주의'],
        },
        season: '가을',
        direction: '서쪽',
        body_parts: ['폐', '대장', '코', '피부'],
        emotions: ['슬픔', '우울', '아쉬움'],
      },
      water: {
        name: 'Water',
        korean: '수(水)',
        icon: '💧',
        color: {
          primary: '#3B82F6',
          secondary: '#60A5FA',
          background: '#EFF6FF',
        },
        characteristics: {
          positive: ['지혜', '융통성', '적응력', '직관력'],
          negative: ['우유부단', '소극성', '냉담', '변덕'],
        },
        season: '겨울',
        direction: '북쪽',
        body_parts: ['신장', '방광', '귀', '뼈'],
        emotions: ['두려움', '불안', '신중함'],
      },
    };
  }

  // Private 헬퍼 메소드들
  private static getColorRecommendations(elements: FiveElementsData) {
    const weakest = Object.entries(elements).sort(([,a], [,b]) => a - b)[0][0];
    const strongest = Object.entries(elements).sort(([,a], [,b]) => b - a)[0][0];
    
    const colorMap: Record<string, any> = {
      wood: { color: '초록색', hex: '#10B981', effect: '성장과 창의성 증진' },
      fire: { color: '빨간색', hex: '#EF4444', effect: '활력과 열정 증진' },
      earth: { color: '갈색', hex: '#A16207', effect: '안정성과 신뢰성 증진' },
      metal: { color: '금색', hex: '#FCD34D', effect: '논리성과 완결력 증진' },
      water: { color: '파란색', hex: '#3B82F6', effect: '지혜와 적응력 증진' },
    };
    
    return {
      beneficial: [
        {
          name: colorMap[weakest].color,
          hex: colorMap[weakest].hex,
          description: `부족한 ${weakest} 오행을 보완하여 ${colorMap[weakest].effect}`,
        },
      ],
      avoid: [
        {
          name: colorMap[strongest].color,
          hex: colorMap[strongest].hex,
          reason: `과도한 ${strongest} 오행을 더욱 강화시켜 불균형 초래`,
        },
      ],
    };
  }

  private static getDirectionRecommendations(elements: FiveElementsData) {
    const directionMap: Record<string, string> = {
      wood: '동쪽', fire: '남쪽', earth: '중앙', metal: '서쪽', water: '북쪽',
    };
    
    const weakest = Object.entries(elements).sort(([,a], [,b]) => a - b)[0][0];
    
    return {
      beneficial: [
        {
          direction: directionMap[weakest],
          element: weakest,
          benefit: `부족한 ${weakest} 오행 에너지 보충`,
        },
      ],
      avoid: [],
    };
  }

  private static getActivityRecommendations(elements: FiveElementsData) {
    return {
      beneficial: [
        { activity: '산책, 원예', element: 'wood', effect: '목 오행 보충으로 창의성 증진' },
        { activity: '운동, 사교활동', element: 'fire', effect: '화 오행 보충으로 활력 증진' },
        { activity: '명상, 요가', element: 'earth', effect: '토 오행 보충으로 안정성 증진' },
        { activity: '독서, 학습', element: 'metal', effect: '금 오행 보충으로 논리성 증진' },
        { activity: '수영, 음악감상', element: 'water', effect: '수 오행 보충으로 지혜 증진' },
      ],
      avoid: [],
    };
  }

  private static getLifestyleRecommendations(elements: FiveElementsData) {
    return {
      diet: [
        { food: '녹색 채소', element: 'wood', benefit: '간 건강과 해독 기능 강화' },
        { food: '붉은 과일', element: 'fire', benefit: '심장 건강과 순환 기능 강화' },
        { food: '곡물류', element: 'earth', benefit: '소화 기능과 영양 흡수 강화' },
        { food: '견과류', element: 'metal', benefit: '폐 기능과 면역력 강화' },
        { food: '해산물', element: 'water', benefit: '신장 기능과 수분 대사 강화' },
      ],
      exercise: [
        { type: '스트레칭', element: 'wood', effect: '유연성과 순환 개선' },
        { type: '유산소 운동', element: 'fire', effect: '심폐 기능과 활력 증진' },
        { type: '근력 운동', element: 'earth', effect: '근육량과 기초대사 증진' },
        { type: '호흡 운동', element: 'metal', effect: '폐활량과 집중력 증진' },
        { type: '수영', element: 'water', effect: '전신 순환과 유연성 증진' },
      ],
      career: [
        { field: '예술, 디자인', element: 'wood', aptitude: '창의성과 미적 감각 활용' },
        { field: '영업, 마케팅', element: 'fire', aptitude: '소통능력과 추진력 활용' },
        { field: '관리, 서비스', element: 'earth', aptitude: '신뢰성과 책임감 활용' },
        { field: '분석, 연구', element: 'metal', aptitude: '논리성과 체계성 활용' },
        { field: '상담, 교육', element: 'water', aptitude: '지혜와 포용력 활용' },
      ],
    };
  }

  /**
   * Chart.js용 도넛 차트 데이터 생성
   */
  static generateChartData(elements: FiveElementsData) {
    const details = this.getElementDetails();
    
    return {
      labels: Object.keys(elements).map(key => 
        details[key as keyof FiveElementsData].korean,
      ),
      datasets: [{
        data: Object.values(elements),
        backgroundColor: Object.keys(elements).map(key =>
          details[key as keyof FiveElementsData].color.primary,
        ),
        borderColor: Object.keys(elements).map(key =>
          details[key as keyof FiveElementsData].color.secondary,
        ),
        borderWidth: 2,
        hoverOffset: 10,
      }],
    };
  }
}