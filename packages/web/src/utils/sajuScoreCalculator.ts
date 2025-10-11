/**
 * Saju Score Calculator - 실제 사주 이론 기반 점수 계산
 * 개인별 고유한 운세 곡선을 생성하기 위한 정밀 계산 모듈
 */

// 오행 타입 정의
export type OhHaeng = '목' | '화' | '토' | '금' | '수';

// 천간 타입 정의
export type CheonGan = '갑' | '을' | '병' | '정' | '무' | '기' | '경' | '신' | '임' | '계';

// 지지 타입 정의
export type JiJi = '자' | '축' | '인' | '묘' | '진' | '사' | '오' | '미' | '신' | '유' | '술' | '해';

// 사주 데이터 인터페이스
export interface SajuData {
  year: { gan: CheonGan; ji: JiJi };
  month: { gan: CheonGan; ji: JiJi };
  day: { gan: CheonGan; ji: JiJi };
  time: { gan: CheonGan; ji: JiJi };
  ohHaengBalance: {
    목: number;
    화: number;
    토: number;
    금: number;
    수: number;
  };
  fullSaju?: string;
}

// 천간 배열 (갑을병정무기경신임계)
const CHEONGAN: CheonGan[] = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];

// 지지 배열 (자축인묘진사오미신유술해)
const JIJI: JiJi[] = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

// 천간의 오행 매핑
export const CHEONGAN_OHHAENG: Record<CheonGan, OhHaeng> = {
  '갑': '목', '을': '목',
  '병': '화', '정': '화',
  '무': '토', '기': '토',
  '경': '금', '신': '금',
  '임': '수', '계': '수',
};

// 지지의 오행 매핑
export const JIJI_OHHAENG: Record<JiJi, OhHaeng> = {
  '인': '목', '묘': '목',
  '사': '화', '오': '화',
  '진': '토', '술': '토', '축': '토', '미': '토',
  '신': '금', '유': '금',
  '자': '수', '해': '수',
};

// 항목별 오행 속성 매핑 (주요 카테고리)
const ITEM_OHHAENG_MAPPING: Record<string, OhHaeng[]> = {
  // 주본 - 근본본 (실제 데이터 항목)
  '근본': ['토', '목'], // 기초, 뿌리
  '사고': ['수', '금'], // 생각, 판단
  '인연': ['화', '목'], // 만남, 관계
  '행동': ['화', '목'], // 실천, 움직임
  '행운': ['화', '수'], // 운세, 기회
  '환경': ['토', '수'], // 주변, 상황
  
  // 추가 기본 항목들
  '건강': ['목', '수'], // 생명력, 활력
  '성격': ['화', '토'], // 열정, 안정
  '지혜': ['수', '금'], // 지식, 명철
  '관계': ['화', '목'], // 소통, 성장
  '재물': ['금', '토'], // 물질, 축적
  '명예': ['화', '금'], // 명성, 권위
  
  // 주본 - 성향 (실제 데이터 항목)
  '감성': ['화', '수'], // 감정, 정서
  '논리성': ['금', '수'], // 논리적 사고
  '예술성': ['목', '화'], // 예술적 재능
  '이성': ['금', '수'], // 합리적 판단
  '인성': ['목', '토'], // 인격, 도덕성
  '지성': ['수', '금'], // 지적 능력
  '학습성': ['목', '수'], // 학습 능력
  
  // 추가 성향 항목들
  '관대함': ['목', '화'], // 베풂, 온정
  '끈기': ['토', '금'], // 인내, 지속
  '리더십': ['화', '금'], // 주도, 권위
  '분석력': ['수', '금'], // 논리, 정밀
  '순수함': ['목', '수'], // 순진, 맑음
  '용기': ['화', '목'], // 도전, 진취
  
  // 주본 - 욕정 (실제 데이터 항목)
  '권력욕': ['금', '화'],
  '기쁨': ['화', '목'], 
  '노여움': ['화', '금'],
  '두려움': ['수', '금'],
  '명예욕': ['화', '금'],
  '물욕': ['금', '토'], 
  '미움': ['금', '화'],
  '사람': ['화', '목'],
  '색욕': ['수', '화'],
  '소유욕': ['토', '금'],
  '수면욕': ['수', '토'],
  '슬픔': ['수', '토'],
  '승부욕': ['화', '금'],
  '식욕': ['토', '수'],
  '욕심': ['금', '토'],
  '즐거움': ['화', '목'],
  
  // 추가 욕정 항목들
  '애정욕': ['화', '목'],
  '지배욕': ['금', '화'],
  '성욕': ['수', '화'],
  '지식욕': ['수', '목'],
  '인정욕': ['화', '토'],
  '자유욕': ['목', '화'],
  '창조욕': ['목', '수'],
  '탐구욕': ['수', '금'],
  '표현욕': ['화', '목'],
  '휴식욕': ['토', '수'],
  
  // 주건 - 비만
  '간': ['목', '화'],
  '갑상선': ['화', '수'],
  '근육': ['목', '토'],
  '뇌하수체': ['수', '금'],
  '대사': ['화', '토'],
  '스트레스': ['화', '금'],
  '신장': ['수', '목'],
  '심장': ['화', '목'],
  '유전': ['목', '수'],
  '지방': ['토', '수'],
  '호르몬': ['수', '화'],
  '활동량': ['화', '목'],
  
  // 주건 - 심리
  '강박': ['금', '토'],
  '걱정': ['토', '수'],
  '공포': ['수', '금'],
  '낙관': ['화', '목'],
  '무기력': ['토', '수'],
  '불안': ['수', '화'],
  '스트레스심리': ['화', '금'],
  '우울': ['수', '토'],
  '자신감': ['화', '목'],
  '집착': ['토', '금'],
  '충동': ['화', '목'],
  '회피': ['수', '토'],
  
  // 주물 - 부동산
  '건물': ['토', '금'],
  '공장': ['금', '화'],
  '다가구': ['토', '목'],
  '부동산': ['토', '금'],
  '다세대': ['토', '목'],
  '단독': ['토', '목'],
  '대지': ['토'],
  '상가': ['금', '화'],
  '아파트': ['토', '금'],
  '연립': ['토', '목'],
  '오피스': ['금', '토'],
  '주상복합': ['토', '금'],
  '주택': ['토', '목'],
  
  // 주물 - 재물
  '대여': ['금', '수'],
  '동산': ['금', '목'],
  '사업': ['화', '금'],
  '주식': ['수', '금'],
  '채권': ['금', '토'],
  '투자': ['금', '수'],
  '펀드': ['수', '금'],
  '현금': ['금'],
  
  // 주물 - 투자
  '기술': ['금', '수'],
  '방송': ['화', '목'],
  '선물': ['수', '금'],
  '예능': ['화', '목'],
  '인력': ['목', '화'],
  '제품': ['금', '토'],
  
  // 주연 - 외가
  '외가친척': ['목', '수'],
  '외갓집': ['목', '토'],
  '외삼촌': ['목', '화'],
  '외숙모': ['수', '목'],
  '외조모': ['토', '수'],
  '외조부': ['목', '금'],
  '외종형제': ['목', '화'],
  '이모': ['수', '목'],
  '이모부': ['화', '목'],
  '큰이모': ['수', '토'],
  
  // 주연 - 이성
  '남자': ['화', '목'],
  '배우자': ['토', '수'],
  '애인': ['화', '목'],
  '여자': ['수', '목'],
  '연인': ['화', '수'],
  '이성관계': ['화', '수'],
  
  // 주재 - 논리
  '계산': ['금', '수'],
  '과학': ['수', '금'],
  '관찰': ['수', '목'],
  '논리일반': ['수', '금'],
  '논증': ['금', '수'],
  '도형': ['토', '금'],
  '문장': ['목', '수'],
  '법칙': ['금', '토'],
  '분류': ['금', '수'],
  '분석': ['수', '금'],
  '비교': ['금', '수'],
  '비판': ['금', '화'],
  '수리': ['금', '수'],
  '연역': ['금', '수'],
  '요약': ['금', '토'],
  '원인': ['수', '목'],
  '응용': ['화', '금'],
  '이해': ['수', '목'],
  '인과': ['목', '수'],
  '전략': ['금', '화'],
  '추론': ['수', '금'],
  '통계': ['금', '수'],
  '판단': ['금', '화'],
  '해석': ['수', '목'],
  
  // 주재 - 예술
  '공간': ['토', '목'],
  '공예': ['토', '목'],
  '농담': ['화', '목'],
  '댄스': ['화', '목'],
  '디자인': ['목', '화'],
  '리듬': ['화', '수'],
  '만화': ['목', '화'],
  '멜로디': ['수', '목'],
  '무용': ['화', '목'],
  '문학': ['목', '수'],
  '미술': ['목', '토'],
  '박자': ['화', '금'],
  '사진': ['금', '수'],
  '색채': ['화', '목'],
  '연극': ['화', '목'],
  '연기': ['화', '수'],
  '영상': ['화', '금'],
  '영화': ['화', '금'],
  '예술일반': ['목', '화'],
  '음악': ['수', '목'],
  '조각': ['토', '금'],
  '조형': ['토', '목'],
  '창작': ['목', '화'],
  '화음': ['수', '목'],
  
  // 주업 - 능력
  '격려': ['화', '목'],
  '결단': ['금', '화'],
  '계획': ['금', '수'],
  '고집': ['토', '금'],
  '공감': ['수', '목'],
  '관리': ['금', '토'],
  '교육': ['목', '수'],
  '긍정': ['화', '목'],
  '기획': ['수', '금'],
  '대화': ['목', '화'],
  '도덕': ['목', '토'],
  '명령': ['금', '화'],
  '봉사': ['목', '수'],
  '비판업무': ['금', '화'],
  '사교': ['화', '목'],
  '상담': ['수', '목'],
  '섬세': ['수', '목'],
  '성실': ['토', '금'],
  '소통': ['목', '화'],
  '솔선': ['화', '목'],
  '수리업무': ['금', '수'],
  '시간': ['금', '토'],
  '신뢰': ['토', '금'],
  '실천': ['화', '토'],
  '언어': ['목', '수'],
  '예의': ['목', '토'],
  '유머': ['화', '목'],
  '응용업무': ['수', '금'],
  '인내': ['토', '금'],
  '적응': ['수', '목'],
  '정리': ['금', '토'],
  '정직': ['토', '목'],
  '조정': ['수', '토'],
  '주도': ['화', '금'],
  '책임': ['토', '금'],
  '추진': ['화', '목'],
  '타협': ['수', '토'],
  '포용': ['목', '수'],
  
  // 주본 - 주격 (실제 데이터 항목)
  '개방적': ['목', '화'],
  '계산적': ['금', '수'],
  '긍정적': ['화', '목'],
  '배타적': ['금', '토'],
  '부정적': ['수', '금'],
  '사교적': ['화', '목'],
  '이기적': ['금', '화'],
  '진취적': ['화', '목'],
  '합리적': ['금', '수'],
  '희생적': ['목', '수'],
  
  // 주본 - 주운 (실제 데이터 항목)  
  '건강운': ['목', '수'],
  '결혼운': ['화', '토'],
  '금전운': ['금', '토'],
  '대인운': ['화', '목'],
  '사업운': ['화', '금'],
  '성공운': ['화', '목'],
  '승진운': ['화', '금'],
  '시험운': ['수', '목'],
  '재물운': ['금', '토'],
  '직장운': ['토', '금'],
  '취업운': ['금', '화'],
  '학업운': ['수', '목'],
  '여행운': ['목', '화'],
  '이사운': ['토', '목'],
  '이직운': ['금', '화'],
  '인기운': ['화', '목'],
  '자녀운': ['목', '화'],
  '투자운': ['금', '수'],
  '학운': ['수', '목'],
  '해외운': ['수', '목'],
  '혼인운': ['화', '토'],
  
  // 오늘의 운세 카테고리
  '연애운': ['화', '목'],
  '애정운': ['화', '수'],

  // 주능 - 리더십
  '통솔력': ['화', '금'],
  '결단력': ['금', '화'],
  '책임감': ['토', '금'],
  '영향력': ['화', '목'],
  '선득력': ['화', '목'],

  // 주능 - 창의력
  '상상력': ['목', '화'],
  '혁신성': ['목', '금'],
  '예술감': ['목', '화'],
  '독창성': ['목', '화'],
  '문제해결': ['수', '금'],

  // 주능 - 소통능력
  '의사소통': ['목', '화'],
  '경청': ['수', '목'],
  '설득': ['화', '목'],
  '표현력': ['화', '목'],

  // 주능 - 학습능력
  '이해력': ['수', '목'],
  '기억력': ['수', '토'],
  '정리력': ['금', '토'],
  '적응력': ['수', '목'],

  // 주능 - 사업능력
  '경영': ['금', '토'],
  '재무관리': ['금', '토'],
  '마케팅': ['화', '목'],
  '네트워킹': ['화', '목'],
  '협상력': ['금', '화'],

  // 주능 - 전문성
  '기술력': ['금', '수'],
  '전문지식': ['수', '금'],
  '실무능력': ['토', '금'],
  '장인정신': ['토', '금'],
  '발전성': ['목', '화'],

  // 주흉 - 건강주의
  '질병': ['수', '토'],
  '상처': ['금', '화'],
  '만성질환': ['토', '수'],
  '정신건강': ['수', '화'],

  // 주흉 - 재물주의
  '재물손실': ['금', '수'],
  '사기조심': ['수', '금'],
  '투자주의': ['수', '금'],
  '보증주의': ['토', '금'],
  '대출주의': ['금', '수'],

  // 주흉 - 관계주의
  '분쟁': ['화', '금'],
  '갈등': ['화', '금'],
  '오해조심': ['화', '수'],
  '배신주의': ['금', '수'],
  '이별': ['수', '금'],

  // 주흉 - 사고주의
  '교통사고': ['금', '화'],
  '산업재해': ['금', '토'],
  '화재': ['화', '금'],
  '수상사고': ['수', '목'],
  '낙상주의': ['토', '목'],

  // 주흉 - 법률주의
  '소송': ['금', '화'],
  '계약주의': ['금', '토'],
  '법적분쟁': ['금', '화'],
  '세무주의': ['금', '토'],
  '규제주의': ['금', '토'],

  // 주흉 - 사업주의
  '실패위험': ['수', '금'],
  '동업주의': ['화', '금'],
  '확장주의': ['목', '화'],
  '계역변경': ['수', '목'],
  '경쟁압박': ['금', '화'],
};

// 오행 상생상극 관계 점수
const OHHAENG_RELATIONS = {
  상생: { // +20점
    '목': '화',
    '화': '토',
    '토': '금',
    '금': '수',
    '수': '목',
  },
  상극: { // -15점
    '목': '토',
    '화': '금',
    '토': '수',
    '금': '목',
    '수': '화',
  },
};

// 계절별 오행 강약
const SEASONAL_OHHAENG_STRENGTH = {
  1: { 수: 20, 토: 15 }, // 1월: 겨울 끝, 토왕용사
  2: { 목: 20, 화: 10, 금: -10 }, // 2월: 봄 시작
  3: { 목: 20, 화: 10, 금: -10 }, // 3월: 봄
  4: { 목: 15, 토: 20, 금: -5 }, // 4월: 환절기
  5: { 화: 20, 토: 10, 수: -10 }, // 5월: 여름 시작
  6: { 화: 20, 토: 10, 수: -10 }, // 6월: 여름
  7: { 화: 15, 토: 20, 수: -5 }, // 7월: 환절기
  8: { 금: 20, 수: 10, 목: -10 }, // 8월: 가을 시작
  9: { 금: 20, 수: 10, 목: -10 }, // 9월: 가을
  10: { 금: 15, 토: 20, 목: -5 }, // 10월: 환절기
  11: { 수: 20, 목: 10, 화: -10 }, // 11월: 겨울 시작
  12: { 수: 20, 목: 10, 화: -10 },  // 12월: 겨울
};

// 시간대별 오행 강약
const HOURLY_OHHAENG_STRENGTH = {
  23: { 수: 15 }, 0: { 수: 15 }, 1: { 수: 15 }, // 자시
  3: { 목: 15 }, 4: { 목: 15 }, 5: { 목: 15 }, // 인시, 묘시
  7: { 토: 10 }, 8: { 토: 10 }, // 진시
  9: { 화: 15 }, 10: { 화: 15 }, 11: { 화: 15 }, 12: { 화: 15 }, // 사시, 오시
  13: { 토: 10 }, 14: { 토: 10 }, // 미시
  15: { 금: 15 }, 16: { 금: 15 }, 17: { 금: 15 }, 18: { 금: 15 }, // 신시, 유시
  19: { 토: 10 }, 20: { 토: 10 }, // 술시
  21: { 수: 15 }, 22: { 수: 15 }, // 해시
};

// 천간지지 일치 보너스 계산
function calculateExactMatchBonus(
  sajuData: SajuData,
  currentGan: CheonGan,
  currentJi: JiJi,
  timeFrame: 'today' | 'month' | 'year',
): number {
  let bonus = 0;
  
  switch (timeFrame) {
    case 'today':
      if (sajuData.day.gan === currentGan) bonus += 20; // 천간 일치
      if (sajuData.day.ji === currentJi) bonus += 15;   // 지지 일치
      break;
    case 'month':
      if (sajuData.month.gan === currentGan) bonus += 18;
      if (sajuData.month.ji === currentJi) bonus += 12;
      break;
    case 'year':
      if (sajuData.year.gan === currentGan) bonus += 15;
      if (sajuData.year.ji === currentJi) bonus += 10;
      break;
  }
  
  return bonus;
}

// 오행 관계 점수 계산 (개선된 버전)
function calculateOhhaengRelation(
  itemOhhaeng: OhHaeng[],
  currentOhhaeng: OhHaeng,
  timeFrame: 'today' | 'month' | 'year',
): number {
  let score = 0;
  
  // 시간대별 가중치
  const weights = {
    today: { 상생: 25, 비화: 15, 상극: -15 },
    month: { 상생: 20, 비화: 12, 상극: -12 },
    year: { 상생: 15, 비화: 10, 상극: -10 },
  };
  
  const weight = weights[timeFrame];
  
  itemOhhaeng.forEach(oh => {
    if (OHHAENG_RELATIONS.상생[currentOhhaeng] === oh) {
      score += weight.상생; // 상생: 큰 가산점
    } else if (currentOhhaeng === oh) {
      score += weight.비화; // 같은 오행: 중간 가산점
    } else if (OHHAENG_RELATIONS.상극[currentOhhaeng] === oh) {
      score += weight.상극; // 상극: 적당한 감점
    }
  });
  
  return score;
}

// 계절 보정 계산
function calculateSeasonalBonus(itemOhhaeng: OhHaeng[], month: number): number {
  const seasonalStrength = (SEASONAL_OHHAENG_STRENGTH as any)[month] || {};
  let bonus = 0;
  
  itemOhhaeng.forEach(oh => {
    const strength = seasonalStrength[oh] || 0;
    bonus += strength * 0.5; // 50% 반영
  });
  
  return bonus;
}

// 시간 보정 계산
function calculateHourlyBonus(itemOhhaeng: OhHaeng[], hour: number): number {
  const hourlyStrength = (HOURLY_OHHAENG_STRENGTH as any)[hour] || {};
  let bonus = 0;
  
  itemOhhaeng.forEach(oh => {
    const strength = hourlyStrength[oh] || 0;
    bonus += strength * 0.3; // 30% 반영
  });
  
  return bonus;
}

/**
 * 대운 사이클 계산 헬퍼 함수
 * 사주 데이터에서 현재 나이/날짜에 해당하는 대운 사이클 번호를 계산
 */
function getCurrentDaeunCycle(sajuData: SajuData, birthYear: number, currentDate: Date): number {
  const currentYear = currentDate.getFullYear();
  const age = currentYear - birthYear;
  return Math.floor(age / 10); // 10년 단위 대운
}

/**
 * 다층 점수 통합 계산 함수 (NEW!)
 * 기본자질 + 대운 + 세운 + 월운 + 일운을 시간대별 가중치로 조합
 */
export function calculateMultiLayerScore(
  itemName: string,
  sajuData: SajuData,
  timeFrame: 'base' | 'today' | 'month' | 'year',
  targetDate?: Date,
  birthYear?: number,
): number {
  const now = targetDate || new Date();

  // 1. 각 계층 점수 계산
  const baseScore = calculateSajuScore(itemName, sajuData);

  // 대운 점수 (birthYear 필요) - 기본값 낮춤
  let daeunScore = 40; // 기본값
  if (birthYear) {
    const daeunCycle = getCurrentDaeunCycle(sajuData, birthYear, now);
    daeunScore = calculateDaeunScore(sajuData, daeunCycle);
  }

  // 세운 점수 - 기본값 낮춤
  const seunScore = calculateSeunScore(sajuData, now.getFullYear());

  // 월운 점수 - 기본값 낮춤
  const monthScore = calculateMonthScore(sajuData, now.getFullYear(), now.getMonth() + 1);

  // 일운 점수 - 기본값 낮춤
  const dayScore = calculateDayScore(sajuData, now);

  // 2. 시간대별 가중치 정의
  interface LayerWeights {
    base: number;
    daeun: number;
    seun: number;
    month: number;
    day: number;
  }

  const weights: Record<'base' | 'today' | 'month' | 'year', LayerWeights> = {
    base: {
      base: 0.70,  // 기본자질 70%
      daeun: 0.20, // 대운 20%
      seun: 0.05,  // 세운 5%
      month: 0.03, // 월운 3%
      day: 0.02,   // 일운 2%
    },
    year: {
      base: 0.30,  // 기본자질 30%
      daeun: 0.30, // 대운 30%
      seun: 0.30,  // 세운 30%
      month: 0.05, // 월운 5%
      day: 0.05,   // 일운 5%
    },
    month: {
      base: 0.25,  // 기본자질 25%
      daeun: 0.20, // 대운 20%
      seun: 0.15,  // 세운 15%
      month: 0.30, // 월운 30%
      day: 0.10,   // 일운 10%
    },
    today: {
      base: 0.20,  // 기본자질 20%
      daeun: 0.15, // 대운 15%
      seun: 0.10,  // 세운 10%
      month: 0.20, // 월운 20%
      day: 0.35,   // 일운 35%
    },
  };

  const currentWeights = weights[timeFrame];

  // 3. 가중 평균 계산
  const finalScore = (
    baseScore * currentWeights.base +
    daeunScore * currentWeights.daeun +
    seunScore * currentWeights.seun +
    monthScore * currentWeights.month +
    dayScore * currentWeights.day
  );

  // 4. 최종 점수 범위 제한 (20-90)
  return Math.max(20, Math.min(90, Math.round(finalScore)));
}

// 기존 함수 유지 (하위 호환성)
export function calculateTimeBasedScore(
  itemName: string,
  sajuData: SajuData,
  timeFrame: 'today' | 'month' | 'year',
  targetDate?: Date,
): number {
  const baseScore = calculateSajuScore(itemName, sajuData);

  // 기본 점수에서 시작

  // 현재 날짜/시간 정보 (타겟 날짜가 있으면 해당 날짜 사용)
  const now = targetDate || new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  const currentHour = now.getHours();

  // 항목의 오행 속성
  const itemOhhaeng = ITEM_OHHAENG_MAPPING[itemName] || [];
  if (itemOhhaeng.length === 0) return baseScore;

  // 1. 항목별로 다른 시드 생성 (날짜 + 항목명 + 시간프레임)
  // 각 항목이 독립적으로 변화하여 차트 형태가 달라짐
  const dateSeed = currentYear * 10000 + currentMonth * 100 + currentDay;
  const itemSeed = itemName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const timeFrameSeed = timeFrame === 'today' ? 1 : timeFrame === 'month' ? 100 : 10000;
  const combinedSeed = dateSeed + itemSeed * 100 + timeFrameSeed;

  // LCG 해시로 항목별 독립적인 변화값 생성 (-15 ~ +25 범위)
  // 일부 항목은 올라가고, 일부는 내려가서 차트 형태가 변함
  const seededValue = (combinedSeed * 9301 + 49297) % 233280;
  const variation = (seededValue / 233280) * 40 - 15; // -15 ~ +25 (균형 및 폭 확대)

  // 기본 점수에 변화값 적용
  let timeBasedScore = baseScore + variation;

  let currentGan: CheonGan;
  let currentJi: JiJi;
  let currentOhhaeng: OhHaeng;

  // 2. 시간대별 천간지지 계산 및 사주 기반 보너스
  switch (timeFrame) {
    case 'today':
      currentGan = CHEONGAN[Math.abs((currentDay - 1) % 10)];
      currentJi = JIJI[Math.abs((currentDay - 1) % 12)];
      currentOhhaeng = CHEONGAN_OHHAENG[currentGan];

      // 시간 보정 (항목별 차별화) - 가중치 강화
      timeBasedScore += calculateHourlyBonus(itemOhhaeng, currentHour) * 0.4;
      break;

    case 'month':
      currentGan = CHEONGAN[Math.abs((currentMonth - 1) % 10)];
      currentJi = JIJI[Math.abs((currentMonth - 1) % 12)];
      currentOhhaeng = CHEONGAN_OHHAENG[currentGan];

      // 계절 보정 (항목별 차별화) - 가중치 강화
      timeBasedScore += calculateSeasonalBonus(itemOhhaeng, currentMonth) * 0.4;
      break;

    case 'year':
      currentGan = CHEONGAN[Math.abs((currentYear - 1984) % 10)];
      currentJi = JIJI[Math.abs((currentYear - 1984) % 12)];
      currentOhhaeng = CHEONGAN_OHHAENG[currentGan];
      break;

    default:
      return baseScore;
  }

  // 3. 천간지지 일치 보너스 (사주와 현재 시점 일치 시 큰 보너스) - 가중치 강화
  const exactBonus = calculateExactMatchBonus(sajuData, currentGan, currentJi, timeFrame as any);
  timeBasedScore += exactBonus * 0.6;

  // 4. 오행 관계 점수 (상생상극 반영으로 항목별 차별화) - 가중치 강화
  const relationScore = calculateOhhaengRelation(itemOhhaeng, currentOhhaeng, timeFrame as any);
  timeBasedScore += relationScore * 0.5;

  // 5. 최종 점수 계산 (20-90 범위)
  const finalScore = Math.round(timeBasedScore);

  return Math.max(20, Math.min(90, finalScore));
}

// 사주 기반 점수 계산 함수
export function calculateSajuScore(
  itemName: string,
  sajuData: SajuData,
): number {
  // 사주 데이터 유효성 검증
  if (!sajuData || !sajuData.year?.gan || !sajuData.month?.gan ||
      !sajuData.day?.gan || !sajuData.time?.gan) {
    return Math.floor(Math.random() * 30) + 40; // 40-70점
  }

  // 1. 항목의 오행 속성 가져오기
  const itemOhhaeng = ITEM_OHHAENG_MAPPING[itemName] || [];

  if (itemOhhaeng.length === 0) {
    // 매핑되지 않은 항목은 랜덤 범위 점수
    return Math.floor(Math.random() * 30) + 40; // 40-70점
  }

  // 2. 사주 고유값 계산 (개인별 차별화를 위한 시드)
  const sajuUniqueValue = getSajuUniqueValue(sajuData);

  // 3. 항목명 기반 시드 생성
  const itemSeed = itemName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // 4. 사주 + 항목 조합으로 개인별 고유 기본 점수 생성 (20-40 범위로 대폭 낮춤)
  const combinedSeed = (sajuUniqueValue + itemSeed * 1000) % 100000;
  const personalBaseScore = 20 + (combinedSeed % 21); // 20-40점 범위

  // 기본 점수를 개인화된 점수로 시작
  let score = personalBaseScore;

  // 5. 사주의 오행 분포 계산
  const userOhhaeng: OhHaeng[] = [];

  try {
    // 천간 오행
    userOhhaeng.push(CHEONGAN_OHHAENG[sajuData.year.gan]);
    userOhhaeng.push(CHEONGAN_OHHAENG[sajuData.month.gan]);
    userOhhaeng.push(CHEONGAN_OHHAENG[sajuData.day.gan]);
    userOhhaeng.push(CHEONGAN_OHHAENG[sajuData.time.gan]);

    // 지지 오행
    userOhhaeng.push(JIJI_OHHAENG[sajuData.year.ji]);
    userOhhaeng.push(JIJI_OHHAENG[sajuData.month.ji]);
    userOhhaeng.push(JIJI_OHHAENG[sajuData.day.ji]);
    userOhhaeng.push(JIJI_OHHAENG[sajuData.time.ji]);
  } catch (error) {
    console.error('[오행 분포 계산 오류]', error);
    return Math.floor(Math.random() * 30) + 40; // 40-70점
  }

  // 6. 개인별 가중치 계수 (사주마다 다른 영향력)
  const personalWeight = 1 + ((sajuUniqueValue % 20) - 10) / 100; // 0.9 ~ 1.1

  // 7. 오행 균형 점수 계산 (개인별 가중치 적용) - 가중치 감소로 차별화 강화
  itemOhhaeng.forEach(itemOh => {
    const count = userOhhaeng.filter(oh => oh === itemOh).length;

    // 오행이 많을수록 가산점 (가중치 감소: 5→3)
    score += count * 3 * personalWeight;

    // 상생 관계 체크 (가중치 감소: 8→5, 5→3)
    userOhhaeng.forEach(userOh => {
      if (OHHAENG_RELATIONS.상생[userOh] === itemOh) {
        score += 5 * personalWeight; // 상생 관계 가산점 감소
      }
      if (OHHAENG_RELATIONS.상극[userOh] === itemOh) {
        score -= 3 * personalWeight; // 상극 관계 감점 감소
      }
    });
  });

  // 8. 오행 균형도 반영
  const balanceBonus = calculateBalanceBonus(sajuData.ohHaengBalance, itemOhhaeng);
  score += balanceBonus * personalWeight;

  // 9. 일주 천간 특별 가산점 (가중치 감소: 10→6)
  const dayGanOhhaeng = CHEONGAN_OHHAENG[sajuData.day.gan];
  if (itemOhhaeng.includes(dayGanOhhaeng)) {
    score += 6 * personalWeight; // 일주와 같은 오행 가산점 감소
  }

  // 점수 범위 제한 (20-70으로 대폭 축소)
  const finalScore = Math.max(20, Math.min(70, Math.round(score)));

  return finalScore;
}

// 오행 균형 보너스 계산
function calculateBalanceBonus(
  balance: Record<OhHaeng, number>,
  itemOhhaeng: OhHaeng[],
): number {
  let bonus = 0;
  
  itemOhhaeng.forEach(oh => {
    const strength = balance[oh];
    
    // 균형잡힌 오행(40-60)은 가산점
    if (strength >= 40 && strength <= 60) {
      bonus += 5;
    }
    // 매우 강한 오행(70+)도 가산점
    else if (strength >= 70) {
      bonus += 8;
    }
    // 매우 약한 오행(20-)은 감점
    else if (strength <= 20) {
      bonus -= 3;
    }
  });
  
  return bonus;
}

// 지배적인 오행 찾기
export function getDominantOhhaeng(ohHaengBalance: Record<OhHaeng, number>): OhHaeng {
  return Object.entries(ohHaengBalance)
    .reduce((a, b) => a[1] > b[1] ? a : b)[0] as OhHaeng;
}

// 행운의 숫자 계산
export function calculateLuckyNumber(sajuData: SajuData): number {
  const dayGan = sajuData.day.gan;
  const ganIndex = CHEONGAN.indexOf(dayGan);
  return ((ganIndex + 1) % 9) || 9; // 1-9 범위
}

// 샘플 사주 데이터 생성 (테스트용)
export function generateSampleSajuData(): SajuData {
  return {
    year: { gan: '갑', ji: '자' },
    month: { gan: '병', ji: '인' },
    day: { gan: '무', ji: '진' },
    time: { gan: '경', ji: '신' },
    ohHaengBalance: {
      목: 30,
      화: 25,
      토: 20,
      금: 15,
      수: 10,
    },
    fullSaju: '갑자 병인 무진 경신',
  };
}

// ====================
// 100년 인생운세 차트용 추가 기능
// ====================

// 십신 강도 점수
const _SIBSIN_STRENGTH: Record<string, number> = {
  비견: 80, 겁재: 75, 식신: 85, 상관: 70,
  편재: 80, 정재: 85, 편관: 75, 정관: 90,
  편인: 80, 정인: 85,
};

// 천간 합
const CHEONGAN_HARMONY: Record<string, string> = {
  갑: '기', 을: '경', 병: '신', 정: '임', 무: '계',
  기: '갑', 경: '을', 신: '병', 임: '정', 계: '무',
};

// 지지 삼합
const JIJI_TRIPLE_HARMONY: Record<string, string[]> = {
  인: ['오', '술'], 오: ['인', '술'], 술: ['인', '오'], // 화국
  신: ['자', '진'], 자: ['신', '진'], 진: ['신', '자'], // 수국
  해: ['묘', '미'], 묘: ['해', '미'], 미: ['해', '묘'], // 목국
  사: ['유', '축'], 유: ['사', '축'], 축: ['사', '유'], // 금국
};

// 지지 육합
const JIJI_SIX_HARMONY: Record<string, string> = {
  자: '축', 축: '자', 인: '해', 해: '인',
  묘: '술', 술: '묘', 진: '유', 유: '진',
  사: '신', 신: '사', 오: '미', 미: '오',
};

// 지지 충
const JIJI_CONFLICT: Record<string, string> = {
  자: '오', 오: '자', 축: '미', 미: '축',
  인: '신', 신: '인', 묘: '유', 유: '묘',
  진: '술', 술: '진', 사: '해', 해: '사',
};

// 오행 상생 관계
const ELEMENT_GENERATION: Record<string, string> = {
  목: '화', 화: '토', 토: '금', 금: '수', 수: '목',
};

// 오행 상극 관계
const ELEMENT_CONFLICT: Record<string, string> = {
  목: '토', 화: '금', 토: '수', 금: '목', 수: '화',
};

export interface LifeChartScoreResult {
  baseScore: number;           // 기본 점수 (0-100)
  yearlyScores: number[];      // 연도별 점수 배열 (96개)
  pattern: {
    type: string;              // 패턴 유형
    volatility: number;        // 변동성 (0-1)
    trend: 'ascending' | 'descending' | 'stable' | 'cyclic';
  };
  keyCharacteristics: {
    elementBalance: number;    // 오행 균형도
    dayMasterStrength: number; // 일간 강도
    harmonyLevel: number;      // 조화 수준
    conflictLevel: number;     // 충돌 수준
  };
}

/**
 * 100년 인생운세용 사주 점수 계산
 */
export function calculateLifeChartScore(
  saju: {
    year: { gan: string; ji: string };
    month: { gan: string; ji: string };
    day: { gan: string; ji: string };
    time: { gan: string; ji: string };
  },
  birthYear: number,
): LifeChartScoreResult {

  // 1. 기본 특성 분석
  const elementBalance = calculateElementBalanceForLifeChart(saju);
  const dayMasterStrength = calculateDayMasterStrength(saju);
  const harmonyLevel = calculateHarmonyLevel(saju);
  const conflictLevel = calculateConflictLevel(saju);

  // 2. 기본 점수 계산 (출생 시점)
  const baseScore = calculateBaseLifeScore(
    elementBalance,
    dayMasterStrength,
    harmonyLevel,
    conflictLevel,
  );

  // 3. 96년간 연도별 점수 계산
  const yearlyScores: number[] = [];
  const _currentYear = new Date().getFullYear();

  for (let age = 0; age <= 95; age++) {
    const year = birthYear + age;

    // 대운 계산 (10년 주기)
    const daeunCycle = Math.floor(age / 10);
    const daeunScore = calculateDaeunScore(saju, daeunCycle);

    // 세운 계산 (연도별)
    const seunScore = calculateSeunScore(saju, year);

    // 개인 리듬 계산
    const personalRhythm = calculatePersonalRhythm(saju, age);

    // 종합 점수 계산
    let yearScore = baseScore * 0.4 + daeunScore * 0.3 + seunScore * 0.2 + personalRhythm * 0.1;

    // 특정 나이대별 보정
    yearScore = applyAgeCorrection(yearScore, age);

    // 변동성 추가 (개인별 고유 패턴)
    const volatility = calculateVolatility(saju, age);
    yearScore += volatility;

    // 0-100 범위로 정규화
    yearScore = Math.max(0, Math.min(100, yearScore));

    yearlyScores.push(yearScore);
  }

  // 4. 패턴 분석
  const pattern = analyzeLifePattern(yearlyScores);

  return {
    baseScore,
    yearlyScores,
    pattern,
    keyCharacteristics: {
      elementBalance,
      dayMasterStrength,
      harmonyLevel,
      conflictLevel,
    },
  };
}

/**
 * 오행 균형도 계산 (인생차트용)
 */
function calculateElementBalanceForLifeChart(saju: any): number {
  const elements: Record<string, number> = {
    목: 0, 화: 0, 토: 0, 금: 0, 수: 0,
  };

  // 천간 오행
  elements[CHEONGAN_OHHAENG[saju.year.gan as CheonGan]]++;
  elements[CHEONGAN_OHHAENG[saju.month.gan as CheonGan]]++;
  elements[CHEONGAN_OHHAENG[saju.day.gan as CheonGan]]++;
  elements[CHEONGAN_OHHAENG[saju.time.gan as CheonGan]]++;

  // 지지 오행
  elements[JIJI_OHHAENG[saju.year.ji as JiJi]]++;
  elements[JIJI_OHHAENG[saju.month.ji as JiJi]]++;
  elements[JIJI_OHHAENG[saju.day.ji as JiJi]]++;
  elements[JIJI_OHHAENG[saju.time.ji as JiJi]]++;

  // 균형도 계산
  const values = Object.values(elements);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const avg = values.reduce((a, b) => a + b) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;

  // 균형도 점수 (0-100)
  const balance = Math.max(0, 100 - (Math.sqrt(variance) * 25) - ((max - min) * 10));

  return balance;
}

/**
 * 일간 강도 계산
 */
function calculateDayMasterStrength(saju: any): number {
  const dayMaster = saju.day.gan;
  const dayElement = CHEONGAN_OHHAENG[dayMaster as CheonGan];
  let strength = 50; // 기본값

  // 같은 오행이 많으면 강함
  const sameElementCount = [
    saju.year.gan, saju.month.gan, saju.time.gan,
    saju.year.ji, saju.month.ji, saju.day.ji, saju.time.ji,
  ].filter(char =>
    CHEONGAN_OHHAENG[char as CheonGan] === dayElement ||
    JIJI_OHHAENG[char as JiJi] === dayElement,
  ).length;

  strength += sameElementCount * 5;

  // 상생 오행이 있으면 강화
  const generatingElement = Object.entries(ELEMENT_GENERATION)
    .find(([_, target]) => target === dayElement)?.[0];

  if (generatingElement) {
    const generatingCount = [
      saju.year.gan, saju.month.gan, saju.time.gan,
      saju.year.ji, saju.month.ji, saju.day.ji, saju.time.ji,
    ].filter(char =>
      CHEONGAN_OHHAENG[char as CheonGan] === generatingElement ||
      JIJI_OHHAENG[char as JiJi] === generatingElement,
    ).length;

    strength += generatingCount * 3;
  }

  // 상극 오행이 있으면 약화
  const conflictingElement = ELEMENT_CONFLICT[dayElement];
  const conflictCount = [
    saju.year.gan, saju.month.gan, saju.time.gan,
    saju.year.ji, saju.month.ji, saju.day.ji, saju.time.ji,
  ].filter(char =>
    CHEONGAN_OHHAENG[char as CheonGan] === conflictingElement ||
    JIJI_OHHAENG[char as JiJi] === conflictingElement,
  ).length;

  strength -= conflictCount * 4;

  return Math.max(0, Math.min(100, strength));
}

/**
 * 조화 수준 계산
 */
function calculateHarmonyLevel(saju: any): number {
  let harmony = 50;

  // 천간 합 체크
  const gans = [saju.year.gan, saju.month.gan, saju.day.gan, saju.time.gan];
  for (let i = 0; i < gans.length; i++) {
    for (let j = i + 1; j < gans.length; j++) {
      if (CHEONGAN_HARMONY[gans[i]] === gans[j]) {
        harmony += 10;
      }
    }
  }

  // 지지 합 체크
  const jis = [saju.year.ji, saju.month.ji, saju.day.ji, saju.time.ji];

  // 육합
  for (let i = 0; i < jis.length; i++) {
    for (let j = i + 1; j < jis.length; j++) {
      if (JIJI_SIX_HARMONY[jis[i]] === jis[j]) {
        harmony += 8;
      }
    }
  }

  // 삼합
  for (const ji of jis) {
    const tripleHarmony = JIJI_TRIPLE_HARMONY[ji];
    if (tripleHarmony) {
      const count = tripleHarmony.filter(h => jis.includes(h)).length;
      harmony += count * 5;
    }
  }

  return Math.min(100, harmony);
}

/**
 * 충돌 수준 계산
 */
function calculateConflictLevel(saju: any): number {
  let conflict = 0;

  // 지지 충 체크
  const jis = [saju.year.ji, saju.month.ji, saju.day.ji, saju.time.ji];
  for (let i = 0; i < jis.length; i++) {
    for (let j = i + 1; j < jis.length; j++) {
      if (JIJI_CONFLICT[jis[i]] === jis[j]) {
        conflict += 15;
      }
    }
  }

  // 오행 상극 체크
  const elements = [
    CHEONGAN_OHHAENG[saju.year.gan as CheonGan],
    CHEONGAN_OHHAENG[saju.month.gan as CheonGan],
    CHEONGAN_OHHAENG[saju.day.gan as CheonGan],
    CHEONGAN_OHHAENG[saju.time.gan as CheonGan],
  ];

  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      if (ELEMENT_CONFLICT[elements[i]] === elements[j]) {
        conflict += 10;
      }
    }
  }

  return Math.min(100, conflict);
}

/**
 * 기본 점수 계산
 */
function calculateBaseLifeScore(
  elementBalance: number,
  dayMasterStrength: number,
  harmonyLevel: number,
  conflictLevel: number,
): number {
  // 가중 평균
  const score = (
    elementBalance * 0.3 +
    dayMasterStrength * 0.3 +
    harmonyLevel * 0.25 +
    (100 - conflictLevel) * 0.15
  );

  return Math.round(score);
}

/**
 * 강화된 대운 점수 계산 - 실제 사주 이론 반영
 */
function calculateDaeunScore(saju: any, cycle: number): number {
  // 1. 월지를 기준으로 한 순행/역행 결정
  const monthJi = saju.month.ji;
  const _monthElement = JIJI_OHHAENG[monthJi as JiJi];

  // 양간(갑병무경임)이면 순행, 음간(을정기신계)이면 역행 (간화)
  const dayGan = saju.day.gan;
  const isForward = ['갑', '병', '무', '경', '임'].includes(dayGan);

  // 2. 실제 대운 천간지지 계산 (월주 기준으로 진행)
  const monthGanIndex = CHEONGAN.indexOf(saju.month.gan as CheonGan);
  const monthJiIndex = JIJI.indexOf(monthJi as JiJi);

  let daeunGanIndex: number;
  let daeunJiIndex: number;

  if (isForward) {
    // 순행: 월주에서 앞으로 진행
    daeunGanIndex = (monthGanIndex + cycle + 1) % 10;
    daeunJiIndex = (monthJiIndex + cycle + 1) % 12;
  } else {
    // 역행: 월주에서 뒤로 진행
    daeunGanIndex = (monthGanIndex - cycle - 1 + 10) % 10;
    daeunJiIndex = (monthJiIndex - cycle - 1 + 12) % 12;
  }

  const daeunGan = CHEONGAN[daeunGanIndex];
  const daeunJi = JIJI[daeunJiIndex];

  let score = 40; // 기본값 50→40으로 낮춤

  // 3. 일간과 대운 천간의 십신 관계 (복잡한 상호작용)
  const dayElement = CHEONGAN_OHHAENG[saju.day.gan as CheonGan];
  const daeunElement = CHEONGAN_OHHAENG[daeunGan];

  // 상생 관계 (길운) - 영향력 조정 (45→30, 35→25)
  if (ELEMENT_GENERATION[daeunElement] === dayElement) {
    score += 30; // 정인, 편인 관계
  } else if (ELEMENT_GENERATION[dayElement] === daeunElement) {
    score += 25; // 식신, 상관 관계
  }

  // 상극 관계 (흉운 가능성) - 영향력 조정 (50→35, 40→30)
  if (ELEMENT_CONFLICT[daeunElement] === dayElement) {
    score -= 35; // 정관, 편관의 강한 극
  } else if (ELEMENT_CONFLICT[dayElement] === daeunElement) {
    score -= 30; // 일간이 극하는 재성
  }

  // 같은 오행 (비견, 겁재)
  if (dayElement === daeunElement) {
    score += 10; // 비교적 안정
  }

  // 4. 천간 합 (강한 길운)
  if (CHEONGAN_HARMONY[saju.day.gan] === daeunGan ||
      CHEONGAN_HARMONY[daeunGan] === saju.day.gan) {
    score += 35; // 천간 합은 매우 길함
  }

  // 5. 지지 충/합 관계
  if (JIJI_CONFLICT[saju.day.ji] === daeunJi ||
      JIJI_CONFLICT[daeunJi] === saju.day.ji) {
    score -= 25; // 일지와 대운지지의 충은 큰 변화
  }

  if (JIJI_SIX_HARMONY[saju.day.ji] === daeunJi ||
      JIJI_SIX_HARMONY[daeunJi] === saju.day.ji) {
    score += 20; // 육합은 길함
  }

  // 6. 삼합 관계 체크
  const sajuJis = [saju.year.ji, saju.month.ji, saju.day.ji, saju.time.ji];
  const tripleHarmony = JIJI_TRIPLE_HARMONY[daeunJi];
  if (tripleHarmony) {
    const harmonyCount = tripleHarmony.filter(ji => sajuJis.includes(ji)).length;
    score += harmonyCount * 12; // 삼합 완성도에 따라 가점
  }

  // 7. 대운 전환 시 급변 효과 (특정 cycle에서 큰 변화)
  const transitionBonus = calculateTransitionEffect(saju, cycle, daeunGan, daeunJi);
  score += transitionBonus;

  // 8. 월령과의 관계 (계절성)
  const seasonalBonus = calculateSeasonalDaeun(monthJi, daeunJi);
  score += seasonalBonus;

  // 대운 점수 범위 축소 (10-90 → 20-80)
  return Math.max(20, Math.min(80, score));
}

/**
 * 대운 전환 시 급변 효과 계산
 */
function calculateTransitionEffect(saju: any, cycle: number, daeunGan: string, daeunJi: string): number {
  let transitionEffect = 0;

  // 특정 cycle에서 극적 변화 (개인별로 다름)
  const uniqueValue = getSajuUniqueValue(saju);
  const criticalCycles = [(uniqueValue % 3) + 1, (uniqueValue % 5) + 3, (uniqueValue % 7) + 6];

  if (criticalCycles.includes(cycle)) {
    // 대운에 따라 급상승 또는 급하락 - 극적 효과 확대
    const isPositiveTransition = (uniqueValue + cycle) % 2 === 0;
    transitionEffect = isPositiveTransition ? 45 : -45;

    // 더 복잡한 전환 패턴 추가
    if (cycle === criticalCycles[0]) {
      transitionEffect *= 1.5; // 첫 번째 위기는 더 강하게
    }
  }

  // 대운 천간지지의 조합에 따른 특수 효과 - 영향력 확대
  const daeunPattern = CHEONGAN.indexOf(daeunGan as CheonGan) * 12 + JIJI.indexOf(daeunJi as JiJi);
  const specialEffects = [13, 27, 41, 55]; // 특수한 60갑자 조합

  if (specialEffects.includes(daeunPattern)) {
    transitionEffect += (uniqueValue % 3 - 1) * 30; // -30, 0, 30 중 하나로 확대
  }

  // 추가적인 개인별 변동성
  const personalVariation = Math.sin((cycle + uniqueValue) * 0.7) * 20;
  transitionEffect += personalVariation;

  return transitionEffect;
}

/**
 * 계절성 대운 보너스
 */
function calculateSeasonalDaeun(monthJi: string, daeunJi: string): number {
  const seasonMap: Record<string, string> = {
    인: '봄', 묘: '봄', 진: '봄말',
    사: '여름', 오: '여름', 미: '여름말',
    신: '가을', 유: '가을', 술: '가을말',
    자: '겨울', 축: '겨울말', 해: '겨울',
  };

  const monthSeason = seasonMap[monthJi];
  const daeunSeason = seasonMap[daeunJi];

  // 같은 계절이면 조화
  if (monthSeason === daeunSeason) {
    return 8;
  }

  // 상극 계절이면 변화
  const conflictSeasons: Record<string, string> = {
    '봄': '가을', '가을': '봄',
    '여름': '겨울', '겨울': '여름',
  };

  if (conflictSeasons[monthSeason] === daeunSeason) {
    return -5;
  }

  return 0;
}

/**
 * 세운 점수 계산
 */
function calculateSeunScore(saju: any, year: number): number {
  // 60갑자 순환
  const ganIndex = (year - 4) % 10;
  const jiIndex = (year - 4) % 12;

  const yearGan = CHEONGAN[ganIndex];
  const yearJi = JIJI[jiIndex];

  let score = 40; // 기본값 50→40으로 낮춤

  // 천간 관계
  if (CHEONGAN_HARMONY[saju.day.gan] === yearGan) {
    score += 15;
  }

  // 지지 관계
  if (JIJI_SIX_HARMONY[saju.day.ji] === yearJi) {
    score += 12;
  }
  if (JIJI_CONFLICT[saju.day.ji] === yearJi) {
    score -= 18;
  }

  // 오행 관계
  const dayElement = CHEONGAN_OHHAENG[saju.day.gan as CheonGan];
  const yearElement = CHEONGAN_OHHAENG[yearGan];

  if (ELEMENT_GENERATION[yearElement] === dayElement) {
    score += 8;
  }
  if (ELEMENT_CONFLICT[yearElement] === dayElement) {
    score -= 12;
  }

  // 세운 점수 범위 축소 (0-100 → 20-80)
  return Math.max(20, Math.min(80, score));
}

/**
 * 월운 점수 계산 (새로 추가)
 */
function calculateMonthScore(saju: any, year: number, month: number): number {
  // 월별 천간지지 계산 (연도와 월을 조합)
  const ganIndex = ((year - 4) * 12 + (month - 1)) % 10;
  const jiIndex = (month - 1) % 12;

  const monthGan = CHEONGAN[ganIndex];
  const monthJi = JIJI[jiIndex];

  let score = 40; // 기본값 50→40으로 낮춤

  // 천간 관계 (세운보다 약간 강하게)
  if (CHEONGAN_HARMONY[saju.day.gan] === monthGan) {
    score += 18;
  }

  // 지지 관계
  if (JIJI_SIX_HARMONY[saju.day.ji] === monthJi) {
    score += 15;
  }
  if (JIJI_CONFLICT[saju.day.ji] === monthJi) {
    score -= 20;
  }

  // 오행 관계
  const dayElement = CHEONGAN_OHHAENG[saju.day.gan as CheonGan];
  const monthElement = CHEONGAN_OHHAENG[monthGan];

  if (ELEMENT_GENERATION[monthElement] === dayElement) {
    score += 12;
  }
  if (ELEMENT_CONFLICT[monthElement] === dayElement) {
    score -= 15;
  }

  // 계절성 보너스 추가
  const seasonalStrength = (SEASONAL_OHHAENG_STRENGTH as any)[month] || {};
  const monthOhhaeng = JIJI_OHHAENG[monthJi];
  const seasonBonus = seasonalStrength[monthOhhaeng] || 0;
  score += seasonBonus * 0.3;

  // 월운 점수 범위 축소 (0-100 → 20-80)
  return Math.max(20, Math.min(80, score));
}

/**
 * 일운 점수 계산 (새로 추가)
 * 간지력 기반 일진 계산
 */
function calculateDayScore(saju: any, targetDate: Date): number {
  // 간지력 계산 (1984년 1월 1일 = 갑자일 기준)
  const baseDate = new Date(1984, 0, 1);
  const daysDiff = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));

  const ganIndex = Math.abs(daysDiff % 10);
  const jiIndex = Math.abs(daysDiff % 12);

  const dayGan = CHEONGAN[ganIndex];
  const dayJi = JIJI[jiIndex];

  let score = 40; // 기본값 50→40으로 낮춤

  // 천간 관계 (일진이므로 더 강하게)
  if (CHEONGAN_HARMONY[saju.day.gan] === dayGan) {
    score += 20;
  }

  // 지지 관계
  if (JIJI_SIX_HARMONY[saju.day.ji] === dayJi) {
    score += 18;
  }
  if (JIJI_CONFLICT[saju.day.ji] === dayJi) {
    score -= 22;
  }

  // 오행 관계
  const sajuDayElement = CHEONGAN_OHHAENG[saju.day.gan as CheonGan];
  const currentDayElement = CHEONGAN_OHHAENG[dayGan];

  if (ELEMENT_GENERATION[currentDayElement] === sajuDayElement) {
    score += 15;
  }
  if (ELEMENT_CONFLICT[currentDayElement] === sajuDayElement) {
    score -= 18;
  }

  // 시간대 영향 추가
  const currentHour = targetDate.getHours();
  const hourlyStrength = (HOURLY_OHHAENG_STRENGTH as any)[currentHour] || {};
  const currentDayOhhaeng = CHEONGAN_OHHAENG[dayGan];
  const hourBonus = hourlyStrength[currentDayOhhaeng] || 0;
  score += hourBonus * 0.5;

  // 일운 점수 범위 축소 (0-100 → 20-80)
  return Math.max(20, Math.min(80, score));
}

/**
 * 개인 리듬 계산
 */
function calculatePersonalRhythm(saju: any, age: number): number {
  // 사주 고유값으로 개인 리듬 생성
  const uniqueValue = getSajuUniqueValue(saju);

  // 바이오리듬 형태의 주기적 변화
  const physical = Math.sin((age * 2 * Math.PI) / 23) * 15;
  const emotional = Math.sin((age * 2 * Math.PI) / 28) * 10;
  const intellectual = Math.sin((age * 2 * Math.PI) / 33) * 8;

  // 개인별 고유 변조 - 폭 대폭 확대
  const personalModulation = Math.sin((age + uniqueValue) * 0.15) * 25 +
                             Math.cos((age + uniqueValue * 2) * 0.08) * 15 +
                             Math.sin((age + uniqueValue * 3) * 0.3) * 10;

  const rhythm = 50 + physical + emotional + intellectual + personalModulation;

  return Math.max(0, Math.min(100, rhythm));
}

/**
 * 강화된 사주 고유값 계산 - 실제 사주 이론 반영
 */
function getSajuUniqueValue(saju: any): number {
  // 1. 기본 천간지지 값
  const ganValues: Record<string, number> = {
    갑: 1, 을: 2, 병: 3, 정: 4, 무: 5,
    기: 6, 경: 7, 신: 8, 임: 9, 계: 10,
  };

  const jiValues: Record<string, number> = {
    자: 1, 축: 2, 인: 3, 묘: 4, 진: 5, 사: 6,
    오: 7, 미: 8, 신: 9, 유: 10, 술: 11, 해: 12,
  };

  // 2. 60갑자 조합별 고유 패턴 계수
  const gapjaPattern = ((ganValues[saju.year.gan] - 1) * 12 + (jiValues[saju.year.ji] - 1)) % 60;
  const monthPattern = ((ganValues[saju.month.gan] - 1) * 12 + (jiValues[saju.month.ji] - 1)) % 60;
  const dayPattern = ((ganValues[saju.day.gan] - 1) * 12 + (jiValues[saju.day.ji] - 1)) % 60;
  const timePattern = ((ganValues[saju.time.gan] - 1) * 12 + (jiValues[saju.time.ji] - 1)) % 60;

  // 3. 오행 편중도 계산
  const elements: Record<string, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  [saju.year.gan, saju.month.gan, saju.day.gan, saju.time.gan].forEach(gan => {
    elements[CHEONGAN_OHHAENG[gan as CheonGan]]++;
  });
  [saju.year.ji, saju.month.ji, saju.day.ji, saju.time.ji].forEach(ji => {
    elements[JIJI_OHHAENG[ji as JiJi]]++;
  });

  const elementValues = Object.values(elements);
  const maxElement = Math.max(...elementValues);
  const minElement = Math.min(...elementValues);
  const elementImbalance = (maxElement - minElement) * 100; // 편중도

  // 4. 충합 관계 복잡도
  let harmonyComplexity = 0;
  let conflictComplexity = 0;

  // 천간 합 체크
  const gans = [saju.year.gan, saju.month.gan, saju.day.gan, saju.time.gan];
  for (let i = 0; i < gans.length; i++) {
    for (let j = i + 1; j < gans.length; j++) {
      if (CHEONGAN_HARMONY[gans[i]] === gans[j]) {
        harmonyComplexity += (i + 1) * (j + 1) * 10;
      }
    }
  }

  // 지지 충 체크
  const jis = [saju.year.ji, saju.month.ji, saju.day.ji, saju.time.ji];
  for (let i = 0; i < jis.length; i++) {
    for (let j = i + 1; j < jis.length; j++) {
      if (JIJI_CONFLICT[jis[i]] === jis[j]) {
        conflictComplexity += (i + 1) * (j + 1) * 15;
      }
    }
  }

  // 5. 일간 중심 특수 계수
  const _dayMasterElement = CHEONGAN_OHHAENG[saju.day.gan as CheonGan];
  const dayMasterBonus = ganValues[saju.day.gan] * jiValues[saju.day.ji] * 5;

  // 6. 계절성 반영 (월지 기준)
  const monthJi = saju.month.ji;
  const seasonality = jiValues[monthJi] * 7;

  // 7. 종합 고유값 계산 (각 요소의 가중치 조정)
  const complexUniqueValue = (
    gapjaPattern * 1000 +          // 년주 60갑자 패턴
    monthPattern * 500 +          // 월주 패턴
    dayPattern * 800 +            // 일주 패턴 (가장 중요)
    timePattern * 300 +           // 시주 패턴
    elementImbalance * 20 +       // 오행 편중도
    harmonyComplexity * 3 +       // 조화 복잡도
    conflictComplexity * 2 +      // 충돌 복잡도
    dayMasterBonus +              // 일간 특수 계수
    seasonality * 10              // 계절성
  );

  return complexUniqueValue;
}

/**
 * 나이대별 보정
 */
function applyAgeCorrection(score: number, age: number): number {
  // 유년기 (0-10): 안정적
  if (age <= 10) {
    return score * 0.9 + 10;
  }

  // 청소년기 (11-20): 변동성 증가
  if (age <= 20) {
    return score * 1.1;
  }

  // 청년기 (21-35): 도전과 기회
  if (age <= 35) {
    return score * 1.05;
  }

  // 중년기 (36-55): 안정화
  if (age <= 55) {
    return score * 0.95 + 5;
  }

  // 노년기 (56+): 점진적 감소
  return score * (1 - (age - 55) * 0.003);
}

/**
 * 변동성 계산
 */
function calculateVolatility(saju: any, age: number): number {
  const uniqueValue = getSajuUniqueValue(saju);

  // 개인별 고유 변동 패턴
  const noise1 = Math.sin((age + uniqueValue * 0.1) * 0.3) * 3;
  const noise2 = Math.cos((age + uniqueValue * 0.2) * 0.5) * 2;
  const noise3 = Math.sin((age * uniqueValue * 0.01) * 0.7) * 1.5;

  return noise1 + noise2 + noise3;
}

/**
 * 패턴 분석
 */
function analyzeLifePattern(scores: number[]): any {
  const avg = scores.reduce((a, b) => a + b) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;
  const volatility = Math.sqrt(variance) / 50; // 정규화

  // 전반부와 후반부 비교
  const firstHalf = scores.slice(0, 48).reduce((a, b) => a + b) / 48;
  const secondHalf = scores.slice(48).reduce((a, b) => a + b) / 48;

  let trend: 'ascending' | 'descending' | 'stable' | 'cyclic';
  if (secondHalf - firstHalf > 10) {
    trend = 'ascending';
  } else if (firstHalf - secondHalf > 10) {
    trend = 'descending';
  } else if (volatility > 0.5) {
    trend = 'cyclic';
  } else {
    trend = 'stable';
  }

  // 패턴 유형 결정
  let type = '안정형';
  if (volatility > 0.7) type = '격변형';
  else if (volatility > 0.5) type = '변동형';
  else if (trend === 'ascending') type = '상승형';
  else if (trend === 'descending') type = '하강형';

  return {
    type,
    volatility: Math.min(1, volatility),
    trend,
  };
}

/**
 * 시간대별 보너스 점수 계산 (NEW - 근본 해결)
 * baseScore에 더할 보너스를 반환 (-20 ~ +20)
 *
 * 기존 문제: calculateMultiLayerScore가 독립적인 점수들의 가중평균을 계산하여
 *           시간대 점수가 기본 점수보다 낮아지는 문제 발생
 *
 * 해결 방법: 시간대 영향을 "보너스"로 계산하여 baseScore에 더함
 *           → todayScore = baseScore + calculateTimeBonus('today')
 *           → 이렇게 하면 시간대 점수가 기본 점수보다 높아질 수 있음
 */
export function calculateTimeBonus(
  primaryElement: OhHaeng,
  secondaryElement: OhHaeng,
  sajuData: SajuData,
  timeFrame: 'today' | 'month' | 'year',
  targetDate: Date,
  birthYear: number
): number {
  let bonus = 0;

  // 1. 시간대별 운세 점수 계산
  const daeunCycle = getCurrentDaeunCycle(sajuData, birthYear, targetDate);
  const daeunScore = calculateDaeunScore(sajuData, daeunCycle);
  const seunScore = calculateSeunScore(sajuData, targetDate.getFullYear());
  const monthScore = calculateMonthScore(sajuData, targetDate.getFullYear(), targetDate.getMonth() + 1);
  const dayScore = calculateDayScore(sajuData, targetDate);

  // 2. 중간값 40을 기준으로 보너스 계산 (40 이상이면 +, 40 미만이면 -)
  const daeunBonus = (daeunScore - 40) * 0.5;  // -10 ~ +20
  const seunBonus = (seunScore - 40) * 0.5;    // -10 ~ +20
  const monthBonus = (monthScore - 40) * 0.5;  // -10 ~ +20
  const dayBonus = (dayScore - 40) * 0.5;      // -10 ~ +20

  // 3. 시간대별 가중치 적용
  switch (timeFrame) {
    case 'today':
      // 오늘: 일운 35%, 월운 20%, 대운 15%, 세운 10%
      bonus = dayBonus * 0.35 + monthBonus * 0.20 + daeunBonus * 0.15 + seunBonus * 0.10;
      break;
    case 'month':
      // 이달: 월운 30%, 대운 20%, 세운 15%, 일운 10%
      bonus = monthBonus * 0.30 + daeunBonus * 0.20 + seunBonus * 0.15 + dayBonus * 0.10;
      break;
    case 'year':
      // 올해: 세운 30%, 대운 30%, 월운 5%, 일운 5%
      bonus = seunBonus * 0.30 + daeunBonus * 0.30 + monthBonus * 0.05 + dayBonus * 0.05;
      break;
  }

  // 4. 오행 관계 보너스 추가
  const currentYear = targetDate.getFullYear();
  const currentMonth = targetDate.getMonth() + 1;
  const currentDay = targetDate.getDate();

  let currentGan: CheonGan;
  let currentJi: JiJi;
  let currentOhhaeng: OhHaeng;

  switch (timeFrame) {
    case 'today':
      currentGan = CHEONGAN[Math.abs((currentDay - 1) % 10)];
      currentJi = JIJI[Math.abs((currentDay - 1) % 12)];
      currentOhhaeng = CHEONGAN_OHHAENG[currentGan];
      break;
    case 'month':
      currentGan = CHEONGAN[Math.abs((currentMonth - 1) % 10)];
      currentJi = JIJI[Math.abs((currentMonth - 1) % 12)];
      currentOhhaeng = CHEONGAN_OHHAENG[currentGan];
      break;
    case 'year':
      currentGan = CHEONGAN[Math.abs((currentYear - 1984) % 10)];
      currentJi = JIJI[Math.abs((currentYear - 1984) % 12)];
      currentOhhaeng = CHEONGAN_OHHAENG[currentGan];
      break;
  }

  // 주요 오행과 보조 오행 모두 체크
  const itemOhhaeng = [primaryElement, secondaryElement];
  itemOhhaeng.forEach(oh => {
    // 상생 관계: +3~5
    if (OHHAENG_RELATIONS.상생[currentOhhaeng] === oh) {
      bonus += timeFrame === 'today' ? 5 : timeFrame === 'month' ? 4 : 3;
    }
    // 비화 (같은 오행): +2~3
    else if (currentOhhaeng === oh) {
      bonus += timeFrame === 'today' ? 3 : 2;
    }
    // 상극 관계: -2~-4
    else if (OHHAENG_RELATIONS.상극[currentOhhaeng] === oh) {
      bonus -= timeFrame === 'today' ? 4 : timeFrame === 'month' ? 3 : 2;
    }
  });

  // 5. 천간지지 일치 보너스
  const exactBonus = calculateExactMatchBonus(sajuData, currentGan, currentJi, timeFrame);
  bonus += exactBonus * 0.15; // 가중치 15%

  // 6. 최종 보너스 범위 제한 (-20 ~ +20)
  return Math.max(-20, Math.min(20, Math.round(bonus)));
}