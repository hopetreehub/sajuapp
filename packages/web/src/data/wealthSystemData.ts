/**
 * 9대 재물운 시스템 데이터
 *
 * 전통 명리학의 재물론 기반 재물운 분석
 * 정재/편재 + 십신론 + 오행론 통합
 *
 * @author Master Kim Hyun-soo (명리학 전문가)
 * @version 1.0
 */

export interface WealthSystem {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  primaryElement: OhHaeng;
  secondaryElement: OhHaeng;
  relatedFactors: string[];
  category: 'income' | 'asset' | 'investment';
  keywords: string[];
}

export type OhHaeng = '목' | '화' | '토' | '금' | '수';

/**
 * 9대 재물운 시스템 정의
 *
 * 【수입 계열】
 * 1. 근로소득운 (Earned Income) - 직장, 월급
 * 2. 사업소득운 (Business Income) - 자영업, 창업
 * 3. 투자소득운 (Investment Income) - 주식, 펀드
 *
 * 【자산 계열】
 * 4. 부동산운 (Real Estate) - 토지, 건물
 * 5. 금융자산운 (Financial Assets) - 현금, 예금
 * 6. 유형자산운 (Tangible Assets) - 귀금속, 골동품
 *
 * 【재테크 계열】
 * 7. 저축운 (Savings) - 돈 모으기
 * 8. 증식운 (Wealth Growth) - 돈 불리기
 * 9. 보존운 (Wealth Preservation) - 돈 지키기
 */
export const WEALTH_SYSTEMS: WealthSystem[] = [
  // ========== 수입 계열 ==========
  {
    id: 'earned_income',
    name: '근로소득운',
    nameEn: 'Earned Income',
    description: '직장 월급, 안정적인 근로소득을 얻는 능력',
    primaryElement: '금',
    secondaryElement: '토',
    relatedFactors: ['정재', '정관', '인수', '안정성'],
    category: 'income',
    keywords: ['월급', '직장', '승진', '연봉', '고용안정'],
  },
  {
    id: 'business_income',
    name: '사업소득운',
    nameEn: 'Business Income',
    description: '자영업, 창업으로 돈을 버는 능력',
    primaryElement: '화',
    secondaryElement: '목',
    relatedFactors: ['편재', '식신', '상관', '추진력'],
    category: 'income',
    keywords: ['창업', '자영업', '사업확장', '고객', '매출'],
  },
  {
    id: 'investment_income',
    name: '투자소득운',
    nameEn: 'Investment Income',
    description: '주식, 펀드 등 투자로 수익을 내는 능력',
    primaryElement: '수',
    secondaryElement: '금',
    relatedFactors: ['편재', '상관', '겁재', '위험감수'],
    category: 'income',
    keywords: ['주식', '펀드', '투자수익', '자본이득', '배당'],
  },

  // ========== 자산 계열 ==========
  {
    id: 'real_estate',
    name: '부동산운',
    nameEn: 'Real Estate',
    description: '토지, 건물 등 부동산 자산을 모으는 능력',
    primaryElement: '토',
    secondaryElement: '금',
    relatedFactors: ['정재', '비견', '인수', '축적'],
    category: 'asset',
    keywords: ['토지', '아파트', '상가', '건물', '임대수익'],
  },
  {
    id: 'financial_assets',
    name: '금융자산운',
    nameEn: 'Financial Assets',
    description: '현금, 예금, 채권 등 금융자산을 모으는 능력',
    primaryElement: '금',
    secondaryElement: '수',
    relatedFactors: ['정재', '식신', '인수', '유동성'],
    category: 'asset',
    keywords: ['현금', '예금', '채권', '보험', '연금'],
  },
  {
    id: 'tangible_assets',
    name: '유형자산운',
    nameEn: 'Tangible Assets',
    description: '귀금속, 골동품, 명품 등 실물자산을 모으는 능력',
    primaryElement: '금',
    secondaryElement: '토',
    relatedFactors: ['편재', '정재', '비견', '소장'],
    category: 'asset',
    keywords: ['금', '보석', '골동품', '명품', '수집'],
  },

  // ========== 재테크 계열 ==========
  {
    id: 'savings',
    name: '저축운',
    nameEn: 'Savings',
    description: '돈을 아끼고 모으는 능력',
    primaryElement: '토',
    secondaryElement: '금',
    relatedFactors: ['정재', '인수', '비견', '절약'],
    category: 'investment',
    keywords: ['저축', '절약', '알뜰', '계획소비', '목돈'],
  },
  {
    id: 'wealth_growth',
    name: '증식운',
    nameEn: 'Wealth Growth',
    description: '돈을 불리고 증식시키는 능력',
    primaryElement: '목',
    secondaryElement: '화',
    relatedFactors: ['편재', '식신', '상관', '성장'],
    category: 'investment',
    keywords: ['재테크', '수익률', '복리', '투자전략', '자산증식'],
  },
  {
    id: 'wealth_preservation',
    name: '보존운',
    nameEn: 'Wealth Preservation',
    description: '돈을 지키고 손실을 방지하는 능력',
    primaryElement: '수',
    secondaryElement: '토',
    relatedFactors: ['정관', '인수', '겁재', '방어'],
    category: 'investment',
    keywords: ['리스크관리', '손실방지', '분산투자', '안전자산', '보험'],
  },
];

/**
 * 재물운 카테고리 그룹
 */
export const WEALTH_CATEGORIES = {
  income: {
    name: '수입 계열',
    systems: ['earned_income', 'business_income', 'investment_income'],
    color: '#10B981', // 녹색
    icon: '💰',
  },
  asset: {
    name: '자산 계열',
    systems: ['real_estate', 'financial_assets', 'tangible_assets'],
    color: '#F59E0B', // 주황
    icon: '🏦',
  },
  investment: {
    name: '재테크 계열',
    systems: ['savings', 'wealth_growth', 'wealth_preservation'],
    color: '#3B82F6', // 파랑
    icon: '📈',
  },
};

/**
 * 십신별 재물운 성향
 */
export const SIBSIN_WEALTH_TENDENCY = {
  정재: {
    strength: '안정적 재물',
    weakness: '큰 돈은 어려움',
    suitable: ['근로소득', '부동산', '저축'],
  },
  편재: {
    strength: '큰 돈 가능성',
    weakness: '불안정',
    suitable: ['사업소득', '투자소득', '증식'],
  },
  정관: {
    strength: '권위로 재물',
    weakness: '의존성',
    suitable: ['근로소득', '금융자산', '보존'],
  },
  편관: {
    strength: '승부로 재물',
    weakness: '리스크',
    suitable: ['사업소득', '투자소득'],
  },
  식신: {
    strength: '재능으로 재물',
    weakness: '산만함',
    suitable: ['사업소득', '금융자산', '증식'],
  },
  상관: {
    strength: '창의로 재물',
    weakness: '변동성',
    suitable: ['투자소득', '유형자산', '증식'],
  },
  정인: {
    strength: '명예와 재물',
    weakness: '재물 집착 약함',
    suitable: ['근로소득', '부동산'],
  },
  편인: {
    strength: '전문성으로 재물',
    weakness: '돈 관심 적음',
    suitable: ['근로소득', '유형자산'],
  },
  비견: {
    strength: '독립적 재물',
    weakness: '경쟁 심함',
    suitable: ['사업소득', '부동산', '저축'],
  },
  겁재: {
    strength: '순발력',
    weakness: '돈 모으기 어려움',
    suitable: ['투자소득', '증식'],
  },
};

/**
 * 오행별 재물운 특성
 */
export const OHHAENG_WEALTH_TRAIT = {
  목: {
    strength: ['성장성', '확장성', '인맥'],
    weakness: ['조급함', '과욕'],
    bestSystems: ['사업소득운', '증식운'],
  },
  화: {
    strength: ['추진력', '열정', '인기'],
    weakness: ['충동성', '낭비'],
    bestSystems: ['사업소득운', '투자소득운'],
  },
  토: {
    strength: ['안정성', '축적력', '신용'],
    weakness: ['보수적', '느림'],
    bestSystems: ['부동산운', '저축운'],
  },
  금: {
    strength: ['판단력', '결단력', '실행력'],
    weakness: ['냉정함', '고립'],
    bestSystems: ['근로소득운', '금융자산운'],
  },
  수: {
    strength: ['지혜', '유연성', '통찰'],
    weakness: ['우유부단', '변동'],
    bestSystems: ['투자소득운', '보존운'],
  },
};

/**
 * 재물운 위험 신호
 */
export const WEALTH_WARNING_SIGNS = {
  high_risk: [
    '편재 + 겁재 + 상관 조합',
    '재성이 너무 많음 (4개 이상)',
    '재성이 전혀 없음',
    '겁재가 재성을 극함',
    '관살이 재성을 설기함',
  ],
  medium_risk: [
    '재성이 약함 (1개)',
    '식상이 너무 강함',
    '비겁이 재성보다 많음',
    '인성이 식상을 극함',
  ],
  caution: [
    '투자보다 저축 권장',
    '동업 주의',
    '큰 지출 신중',
    '재테크 교육 필요',
  ],
};
