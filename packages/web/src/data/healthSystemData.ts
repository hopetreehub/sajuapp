/**
 * 12대 건강 시스템 데이터
 *
 * 오행의학 기반 건강 시스템 분석
 * 전통 명리학의 오행론과 현대 의학의 신체 시스템을 결합
 *
 * @author Master Kim Hyun-soo (명리학 전문가)
 * @version 1.0
 */

export interface HealthSystem {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  primaryElement: OhHaeng;
  secondaryElement: OhHaeng;
  relatedOrgans: string[];
  ageFactors: AgeHealthFactor[];
  keywords: string[];
}

export type OhHaeng = '목' | '화' | '토' | '금' | '수';

export interface AgeHealthFactor {
  ageRange: string;
  factor: number; // 연령대별 건강 가중치 (0.5 ~ 1.5)
  concerns: string[];
}

/**
 * 12대 건강 시스템 정의
 *
 * 1. 골격계 (Skeletal System)
 * 2. 근육계 (Muscular System)
 * 3. 순환계 (Circulatory System)
 * 4. 호흡계 (Respiratory System)
 * 5. 소화계 (Digestive System)
 * 6. 신경계 (Nervous System)
 * 7. 내분비계 (Endocrine System)
 * 8. 분비계 (Excretory System)
 * 9. 피부계 (Integumentary System)
 * 10. 정신계 (Mental/Emotional System)
 * 11. 생식계 (Reproductive System)
 * 12. 외형계 (External Appearance)
 */
export const HEALTH_SYSTEMS: HealthSystem[] = [
  {
    id: 'skeletal',
    name: '골격계',
    nameEn: 'Skeletal System',
    description: '뼈, 관절, 인대 등 신체의 구조와 지지 시스템',
    primaryElement: '금',
    secondaryElement: '토',
    relatedOrgans: ['뼈', '관절', '인대', '치아', '척추'],
    ageFactors: [
      { ageRange: '0-20', factor: 1.2, concerns: ['성장 발육'] },
      { ageRange: '21-40', factor: 1.0, concerns: ['자세 교정'] },
      { ageRange: '41-60', factor: 0.9, concerns: ['골다공증', '관절염'] },
      { ageRange: '61+', factor: 0.7, concerns: ['골절 위험', '퇴행성 관절염'] }
    ],
    keywords: ['뼈 건강', '관절 통증', '척추', '골밀도', '자세']
  },
  {
    id: 'muscular',
    name: '근육계',
    nameEn: 'Muscular System',
    description: '근육, 힘줄 등 신체 운동과 힘을 담당하는 시스템',
    primaryElement: '목',
    secondaryElement: '화',
    relatedOrgans: ['골격근', '평활근', '심근', '힘줄'],
    ageFactors: [
      { ageRange: '0-20', factor: 1.1, concerns: ['근육 발달'] },
      { ageRange: '21-40', factor: 1.3, concerns: ['근력 강화'] },
      { ageRange: '41-60', factor: 1.0, concerns: ['근육 손실 예방'] },
      { ageRange: '61+', factor: 0.8, concerns: ['근감소증', '유연성 저하'] }
    ],
    keywords: ['근력', '체력', '운동', '피로', '근육통']
  },
  {
    id: 'circulatory',
    name: '순환계',
    nameEn: 'Circulatory System',
    description: '심장, 혈관 등 혈액 순환과 영양 공급 시스템',
    primaryElement: '화',
    secondaryElement: '목',
    relatedOrgans: ['심장', '동맥', '정맥', '모세혈관', '혈액'],
    ageFactors: [
      { ageRange: '0-20', factor: 1.2, concerns: ['선천성 심장 질환'] },
      { ageRange: '21-40', factor: 1.0, concerns: ['고혈압 예방'] },
      { ageRange: '41-60', factor: 0.8, concerns: ['심혈관 질환', '고지혈증'] },
      { ageRange: '61+', factor: 0.6, concerns: ['동맥경화', '심부전'] }
    ],
    keywords: ['심장', '혈압', '혈액순환', '부정맥', '심혈관']
  },
  {
    id: 'respiratory',
    name: '호흡계',
    nameEn: 'Respiratory System',
    description: '폐, 기관지 등 호흡과 산소 교환 시스템',
    primaryElement: '금',
    secondaryElement: '수',
    relatedOrgans: ['폐', '기관지', '기도', '횡격막', '흉곽'],
    ageFactors: [
      { ageRange: '0-20', factor: 1.1, concerns: ['천식', '알레르기'] },
      { ageRange: '21-40', factor: 1.0, concerns: ['호흡기 감염'] },
      { ageRange: '41-60', factor: 0.9, concerns: ['만성 기관지염', '폐 기능 저하'] },
      { ageRange: '61+', factor: 0.7, concerns: ['폐렴', 'COPD'] }
    ],
    keywords: ['폐', '호흡', '기관지', '산소', '천식']
  },
  {
    id: 'digestive',
    name: '소화계',
    nameEn: 'Digestive System',
    description: '위장, 간 등 음식물 소화와 영양 흡수 시스템',
    primaryElement: '토',
    secondaryElement: '금',
    relatedOrgans: ['위', '장', '간', '담낭', '췌장'],
    ageFactors: [
      { ageRange: '0-20', factor: 1.0, concerns: ['성장기 영양'] },
      { ageRange: '21-40', factor: 1.1, concerns: ['위염', '과민성 장 증후군'] },
      { ageRange: '41-60', factor: 0.9, concerns: ['역류성 식도염', '간 기능'] },
      { ageRange: '61+', factor: 0.8, concerns: ['소화 흡수 저하', '변비'] }
    ],
    keywords: ['소화', '위장', '간', '식욕', '복통']
  },
  {
    id: 'nervous',
    name: '신경계',
    nameEn: 'Nervous System',
    description: '뇌, 척수, 신경 등 감각과 운동을 조절하는 시스템',
    primaryElement: '수',
    secondaryElement: '목',
    relatedOrgans: ['뇌', '척수', '말초신경', '자율신경'],
    ageFactors: [
      { ageRange: '0-20', factor: 1.3, concerns: ['뇌 발달'] },
      { ageRange: '21-40', factor: 1.1, concerns: ['스트레스 관리'] },
      { ageRange: '41-60', factor: 0.9, concerns: ['기억력 저하', '수면 장애'] },
      { ageRange: '61+', factor: 0.7, concerns: ['치매', '파킨슨병'] }
    ],
    keywords: ['뇌', '신경', '집중력', '기억력', '두통']
  },
  {
    id: 'endocrine',
    name: '내분비계',
    nameEn: 'Endocrine System',
    description: '호르몬 분비와 조절을 담당하는 시스템',
    primaryElement: '수',
    secondaryElement: '화',
    relatedOrgans: ['갑상선', '부신', '뇌하수체', '송과체'],
    ageFactors: [
      { ageRange: '0-20', factor: 1.2, concerns: ['성장 호르몬'] },
      { ageRange: '21-40', factor: 1.0, concerns: ['갑상선 기능'] },
      { ageRange: '41-60', factor: 0.9, concerns: ['폐경기', '호르몬 불균형'] },
      { ageRange: '61+', factor: 0.8, concerns: ['호르몬 저하', '당뇨'] }
    ],
    keywords: ['호르몬', '갑상선', '대사', '피로', '체중']
  },
  {
    id: 'excretory',
    name: '분비계',
    nameEn: 'Excretory System',
    description: '신장, 방광 등 노폐물 배출 시스템',
    primaryElement: '수',
    secondaryElement: '토',
    relatedOrgans: ['신장', '방광', '요관', '요도'],
    ageFactors: [
      { ageRange: '0-20', factor: 1.0, concerns: ['요로 감염'] },
      { ageRange: '21-40', factor: 1.0, concerns: ['신장 기능'] },
      { ageRange: '41-60', factor: 0.9, concerns: ['전립선', '요실금'] },
      { ageRange: '61+', factor: 0.7, concerns: ['신부전', '배뇨 장애'] }
    ],
    keywords: ['신장', '방광', '배뇨', '부종', '요로']
  },
  {
    id: 'integumentary',
    name: '피부계',
    nameEn: 'Integumentary System',
    description: '피부, 모발, 손발톱 등 외부 보호 시스템',
    primaryElement: '금',
    secondaryElement: '토',
    relatedOrgans: ['피부', '모발', '손발톱', '땀샘', '피지선'],
    ageFactors: [
      { ageRange: '0-20', factor: 1.2, concerns: ['아토피', '여드름'] },
      { ageRange: '21-40', factor: 1.0, concerns: ['피부 트러블'] },
      { ageRange: '41-60', factor: 0.8, concerns: ['피부 노화', '탈모'] },
      { ageRange: '61+', factor: 0.7, concerns: ['피부 건조', '색소 침착'] }
    ],
    keywords: ['피부', '모발', '탈모', '여드름', '습진']
  },
  {
    id: 'mental',
    name: '정신계',
    nameEn: 'Mental/Emotional System',
    description: '정신 건강, 감정, 스트레스 관리 시스템',
    primaryElement: '화',
    secondaryElement: '수',
    relatedOrgans: ['뇌', '신경전달물질', '자율신경'],
    ageFactors: [
      { ageRange: '0-20', factor: 1.1, concerns: ['정서 발달', 'ADHD'] },
      { ageRange: '21-40', factor: 1.2, concerns: ['스트레스', '불안'] },
      { ageRange: '41-60', factor: 1.0, concerns: ['우울증', '중년 위기'] },
      { ageRange: '61+', factor: 0.9, concerns: ['고독감', '인지 저하'] }
    ],
    keywords: ['정신', '스트레스', '우울', '불안', '감정']
  },
  {
    id: 'reproductive',
    name: '생식계',
    nameEn: 'Reproductive System',
    description: '생식 기능과 호르몬 균형 시스템',
    primaryElement: '수',
    secondaryElement: '목',
    relatedOrgans: ['생식 기관', '성 호르몬'],
    ageFactors: [
      { ageRange: '0-20', factor: 0.8, concerns: ['사춘기 발달'] },
      { ageRange: '21-40', factor: 1.2, concerns: ['생식 건강', '임신'] },
      { ageRange: '41-60', factor: 0.9, concerns: ['폐경', '갱년기'] },
      { ageRange: '61+', factor: 0.6, concerns: ['호르몬 결핍'] }
    ],
    keywords: ['생식', '호르몬', '갱년기', '생리', '임신']
  },
  {
    id: 'appearance',
    name: '외형계',
    nameEn: 'External Appearance',
    description: '체형, 외모, 신체 비율 등 외적 특징',
    primaryElement: '금',
    secondaryElement: '목',
    relatedOrgans: ['체형', '골격 구조', '비율'],
    ageFactors: [
      { ageRange: '0-20', factor: 1.3, concerns: ['성장', '체형 형성'] },
      { ageRange: '21-40', factor: 1.0, concerns: ['체중 관리'] },
      { ageRange: '41-60', factor: 0.8, concerns: ['체형 변화', '비만'] },
      { ageRange: '61+', factor: 0.7, concerns: ['체력 저하', '자세 변형'] }
    ],
    keywords: ['체형', '외모', '체중', '비만', '자세']
  }
];

/**
 * 건강 시스템 카테고리 그룹
 */
export const HEALTH_CATEGORIES = {
  structural: {
    name: '구조/운동 시스템',
    systems: ['skeletal', 'muscular', 'appearance'],
    color: '#8B7FD8' // 보라색
  },
  vital: {
    name: '생명 유지 시스템',
    systems: ['circulatory', 'respiratory', 'digestive'],
    color: '#EF4444' // 빨강
  },
  regulatory: {
    name: '조절/통제 시스템',
    systems: ['nervous', 'endocrine', 'excretory'],
    color: '#3B82F6' // 파랑
  },
  protective: {
    name: '보호/심리 시스템',
    systems: ['integumentary', 'mental', 'reproductive'],
    color: '#10B981' // 녹색
  }
};

/**
 * 오행별 건강 취약점
 */
export const OHHAENG_HEALTH_WEAKNESS = {
  목: ['간', '담낭', '눈', '근육', '신경'],
  화: ['심장', '소장', '혈액순환', '정신'],
  토: ['위', '비장', '소화', '근심'],
  금: ['폐', '대장', '피부', '호흡기'],
  수: ['신장', '방광', '생식기', '뼈', '귀']
};

/**
 * 오행별 건강 강점
 */
export const OHHAENG_HEALTH_STRENGTH = {
  목: ['회복력', '유연성', '적응력'],
  화: ['활력', '순환', '면역력'],
  토: ['안정성', '소화력', '체력'],
  금: ['호흡력', '피부 재생', '면역'],
  수: ['지구력', '정화력', '생식력']
};
