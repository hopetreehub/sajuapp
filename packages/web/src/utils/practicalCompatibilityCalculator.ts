/**
 * 현실적 궁합 분석 계산기 - Phase 2: 현실적 분석 5개 항목
 * 경제관념, 직업운, 주거환경, 자녀운, 시댁/처가 관계
 */

import { SajuData } from './compatibilityCalculator';

// 십신 계산 (간략 버전)
function calculateSipsin(dayGan: string, targetGan: string): string {
  const ganElements: { [key: string]: string } = {
    '갑': '목', '을': '목', '병': '화', '정': '화',
    '무': '토', '기': '토', '경': '금', '신': '금',
    '임': '수', '계': '수',
  };
  
  const ganYinYang: { [key: string]: string } = {
    '갑': '양', '을': '음', '병': '양', '정': '음',
    '무': '양', '기': '음', '경': '양', '신': '음',
    '임': '양', '계': '음',
  };
  
  const dayElement = ganElements[dayGan];
  const targetElement = ganElements[targetGan];
  const sameYinYang = ganYinYang[dayGan] === ganYinYang[targetGan];
  
  if (dayElement === targetElement) {
    return sameYinYang ? '비견' : '겁재';
  }
  
  const relationships: { [key: string]: { [key: string]: string[] } } = {
    '목': { '화': ['식신', '상관'], '토': ['편재', '정재'], '금': ['편관', '정관'], '수': ['편인', '정인'] },
    '화': { '토': ['식신', '상관'], '금': ['편재', '정재'], '수': ['편관', '정관'], '목': ['편인', '정인'] },
    '토': { '금': ['식신', '상관'], '수': ['편재', '정재'], '목': ['편관', '정관'], '화': ['편인', '정인'] },
    '금': { '수': ['식신', '상관'], '목': ['편재', '정재'], '화': ['편관', '정관'], '토': ['편인', '정인'] },
    '수': { '목': ['식신', '상관'], '화': ['편재', '정재'], '토': ['편관', '정관'], '금': ['편인', '정인'] },
  };
  
  const rel = relationships[dayElement]?.[targetElement];
  return rel ? (sameYinYang ? rel[0] : rel[1]) : '알수없음';
}

// 상세 점수 인터페이스
export interface DetailScore {
  score: number;
  level: '매우좋음' | '좋음' | '보통' | '주의' | '위험';
  description: string;
  factors: {
    positive: string[];
    negative: string[];
  };
}

// 점수를 레벨로 변환
function getLevel(score: number): DetailScore['level'] {
  if (score >= 85) return '매우좋음';
  if (score >= 70) return '좋음';
  if (score >= 50) return '보통';
  if (score >= 30) return '주의';
  return '위험';
}

/**
 * 8. 경제관념 궁합 - 재성(정재/편재) 분포
 */
export function calculateEconomicScore(saju1: SajuData, saju2: SajuData): DetailScore {
  let score = 65;
  const positive: string[] = [];
  const negative: string[] = [];
  
  const dayGan1 = saju1.day.gan;
  const dayGan2 = saju2.day.gan;
  
  // 각자의 재성 개수 계산
  const gans1 = [saju1.year.gan, saju1.month.gan, saju1.day.gan, saju1.time.gan];
  const gans2 = [saju2.year.gan, saju2.month.gan, saju2.day.gan, saju2.time.gan];
  
  let wealthCount1 = 0;
  let regularWealth1 = 0; // 정재
  let irregularWealth1 = 0; // 편재
  
  for (const gan of gans1) {
    const sipsin = calculateSipsin(dayGan1, gan);
    if (sipsin === '정재') {
      wealthCount1++;
      regularWealth1++;
    } else if (sipsin === '편재') {
      wealthCount1++;
      irregularWealth1++;
    }
  }
  
  let wealthCount2 = 0;
  let regularWealth2 = 0;
  let irregularWealth2 = 0;
  
  for (const gan of gans2) {
    const sipsin = calculateSipsin(dayGan2, gan);
    if (sipsin === '정재') {
      wealthCount2++;
      regularWealth2++;
    } else if (sipsin === '편재') {
      wealthCount2++;
      irregularWealth2++;
    }
  }
  
  // 재성이 적절히 있으면 경제관념 우수
  if (wealthCount1 >= 1 && wealthCount1 <= 2) {
    score += 10;
    positive.push('적절한 재성으로 건실한 경제관념을 가지고 있습니다');
  }
  if (wealthCount2 >= 1 && wealthCount2 <= 2) {
    score += 10;
    positive.push('상대방도 안정적인 경제관을 가지고 있습니다');
  }
  
  // 정재가 많으면 보수적, 편재가 많으면 투기적
  if (regularWealth1 > irregularWealth1 && regularWealth2 > irregularWealth2) {
    score += 15;
    positive.push('둘 다 안정적이고 보수적인 재테크 성향입니다');
  } else if (irregularWealth1 > regularWealth1 && irregularWealth2 > regularWealth2) {
    score += 5;
    positive.push('둘 다 적극적인 투자 성향으로 의견이 맞을 수 있습니다');
  } else {
    score += 10;
    positive.push('서로 다른 재테크 스타일로 균형을 이룹니다');
  }
  
  // 재성이 너무 많으면 돈에 대한 집착
  if (wealthCount1 > 3 || wealthCount2 > 3) {
    score -= 15;
    negative.push('재성이 과다하여 돈 문제로 갈등이 생길 수 있습니다');
  }
  
  // 재성이 없으면 경제관념 부족
  if (wealthCount1 === 0 || wealthCount2 === 0) {
    score -= 10;
    negative.push('재성이 부족하여 경제적 계획성이 떨어질 수 있습니다');
  }
  
  // 금(金) 오행이 많으면 절약 정신
  const metalCount1 = countElement(saju1, '금');
  const metalCount2 = countElement(saju2, '금');
  
  if (metalCount1 > 0 && metalCount2 > 0) {
    score += 5;
    positive.push('금 기운이 있어 절약 정신이 있습니다');
  }
  
  score = Math.max(0, Math.min(100, score));
  
  return {
    score,
    level: getLevel(score),
    description: `경제관념 궁합은 ${score}점입니다. ${score >= 70 ? '경제적 가치관이 잘 맞습니다.' : '금전 관리 방식에 대한 조율이 필요합니다.'}`,
    factors: { positive, negative },
  };
}

/**
 * 9. 직업운 궁합 - 관성(정관/편관) 조화
 */
export function calculateCareerScore(saju1: SajuData, saju2: SajuData): DetailScore {
  let score = 60;
  const positive: string[] = [];
  const negative: string[] = [];
  
  const dayGan1 = saju1.day.gan;
  const dayGan2 = saju2.day.gan;
  
  // 관성 개수 계산
  const gans1 = [saju1.year.gan, saju1.month.gan, saju1.day.gan, saju1.time.gan];
  const gans2 = [saju2.year.gan, saju2.month.gan, saju2.day.gan, saju2.time.gan];
  
  let officerCount1 = 0;
  let regularOfficer1 = 0; // 정관
  let irregularOfficer1 = 0; // 편관
  
  for (const gan of gans1) {
    const sipsin = calculateSipsin(dayGan1, gan);
    if (sipsin === '정관') {
      officerCount1++;
      regularOfficer1++;
    } else if (sipsin === '편관') {
      officerCount1++;
      irregularOfficer1++;
    }
  }
  
  let officerCount2 = 0;
  let regularOfficer2 = 0;
  let irregularOfficer2 = 0;
  
  for (const gan of gans2) {
    const sipsin = calculateSipsin(dayGan2, gan);
    if (sipsin === '정관') {
      officerCount2++;
      regularOfficer2++;
    } else if (sipsin === '편관') {
      officerCount2++;
      irregularOfficer2++;
    }
  }
  
  // 관성이 적절히 있으면 직업운 안정
  if (officerCount1 >= 1 && officerCount1 <= 2) {
    score += 15;
    positive.push('안정적인 직업운을 가지고 있습니다');
  }
  if (officerCount2 >= 1 && officerCount2 <= 2) {
    score += 15;
    positive.push('상대방도 커리어가 안정적입니다');
  }
  
  // 정관이 많으면 직장인, 편관이 많으면 사업가
  if (regularOfficer1 > 0 && regularOfficer2 > 0) {
    score += 10;
    positive.push('둘 다 안정적인 직장 생활을 선호합니다');
  } else if (irregularOfficer1 > 0 && irregularOfficer2 > 0) {
    score += 10;
    positive.push('둘 다 도전적인 사업가 기질이 있습니다');
  }
  
  // 관성이 너무 많으면 업무 스트레스
  if (officerCount1 > 3 || officerCount2 > 3) {
    score -= 10;
    negative.push('관성이 과다하여 업무 스트레스가 관계에 영향을 줄 수 있습니다');
  }
  
  // 식상(식신/상관)이 있으면 창의적 직업
  let creativityCount1 = 0;
  let creativityCount2 = 0;
  
  for (const gan of gans1) {
    const sipsin = calculateSipsin(dayGan1, gan);
    if (sipsin === '식신' || sipsin === '상관') creativityCount1++;
  }
  
  for (const gan of gans2) {
    const sipsin = calculateSipsin(dayGan2, gan);
    if (sipsin === '식신' || sipsin === '상관') creativityCount2++;
  }
  
  if (creativityCount1 > 0 && creativityCount2 > 0) {
    score += 10;
    positive.push('둘 다 창의적인 능력이 있어 서로를 이해합니다');
  }
  
  score = Math.max(0, Math.min(100, score));
  
  return {
    score,
    level: getLevel(score),
    description: `직업운 궁합은 ${score}점입니다. ${score >= 70 ? '서로의 커리어를 지지할 수 있습니다.' : '직업적 목표에 대한 이해가 필요합니다.'}`,
    factors: { positive, negative },
  };
}

/**
 * 10. 주거환경 궁합 - 인성(정인/편인) 안정도
 */
export function calculateResidenceScore(saju1: SajuData, saju2: SajuData): DetailScore {
  let score = 65;
  const positive: string[] = [];
  const negative: string[] = [];
  
  const dayGan1 = saju1.day.gan;
  const dayGan2 = saju2.day.gan;
  
  // 인성 개수 계산
  const gans1 = [saju1.year.gan, saju1.month.gan, saju1.day.gan, saju1.time.gan];
  const gans2 = [saju2.year.gan, saju2.month.gan, saju2.day.gan, saju2.time.gan];
  
  let sealCount1 = 0;
  let sealCount2 = 0;
  
  for (const gan of gans1) {
    const sipsin = calculateSipsin(dayGan1, gan);
    if (sipsin === '정인' || sipsin === '편인') sealCount1++;
  }
  
  for (const gan of gans2) {
    const sipsin = calculateSipsin(dayGan2, gan);
    if (sipsin === '정인' || sipsin === '편인') sealCount2++;
  }
  
  // 인성이 적절히 있으면 안정적인 주거
  if (sealCount1 >= 1 && sealCount1 <= 2) {
    score += 15;
    positive.push('안정적인 주거 환경을 선호합니다');
  }
  if (sealCount2 >= 1 && sealCount2 <= 2) {
    score += 15;
    positive.push('상대방도 편안한 집을 중요시합니다');
  }
  
  // 토(土) 오행이 많으면 부동산 운
  const earthCount1 = countElement(saju1, '토');
  const earthCount2 = countElement(saju2, '토');
  
  if (earthCount1 >= 2 || earthCount2 >= 2) {
    score += 10;
    positive.push('토 기운이 강해 부동산 운이 좋습니다');
  }
  
  // 인성이 너무 많으면 의존적
  if (sealCount1 > 3 || sealCount2 > 3) {
    score -= 10;
    negative.push('인성이 과다하여 독립적인 주거 생활이 어려울 수 있습니다');
  }
  
  // 목(木) 오행이 있으면 자연친화적
  const woodCount1 = countElement(saju1, '목');
  const woodCount2 = countElement(saju2, '목');
  
  if (woodCount1 > 0 && woodCount2 > 0) {
    score += 5;
    positive.push('목 기운이 있어 자연친화적인 주거를 선호합니다');
  } else if ((woodCount1 > 2 && woodCount2 === 0) || (woodCount1 === 0 && woodCount2 > 2)) {
    score -= 5;
    negative.push('주거 환경 취향이 크게 다를 수 있습니다');
  }
  
  score = Math.max(0, Math.min(100, score));
  
  return {
    score,
    level: getLevel(score),
    description: `주거환경 궁합은 ${score}점입니다. ${score >= 70 ? '편안한 보금자리를 만들 수 있습니다.' : '주거 스타일 조율이 필요합니다.'}`,
    factors: { positive, negative },
  };
}

/**
 * 11. 자녀운 궁합 - 식상(식신/상관) 관계
 */
export function calculateChildrenScore(saju1: SajuData, saju2: SajuData): DetailScore {
  let score = 70;
  const positive: string[] = [];
  const negative: string[] = [];
  
  const dayGan1 = saju1.day.gan;
  const dayGan2 = saju2.day.gan;
  
  // 식상 개수 계산
  const gans1 = [saju1.year.gan, saju1.month.gan, saju1.day.gan, saju1.time.gan];
  const gans2 = [saju2.year.gan, saju2.month.gan, saju2.day.gan, saju2.time.gan];
  
  let outputCount1 = 0;
  let foodGod1 = 0; // 식신
  let hurtOfficer1 = 0; // 상관
  
  for (const gan of gans1) {
    const sipsin = calculateSipsin(dayGan1, gan);
    if (sipsin === '식신') {
      outputCount1++;
      foodGod1++;
    } else if (sipsin === '상관') {
      outputCount1++;
      hurtOfficer1++;
    }
  }
  
  let outputCount2 = 0;
  let foodGod2 = 0;
  let hurtOfficer2 = 0;
  
  for (const gan of gans2) {
    const sipsin = calculateSipsin(dayGan2, gan);
    if (sipsin === '식신') {
      outputCount2++;
      foodGod2++;
    } else if (sipsin === '상관') {
      outputCount2++;
      hurtOfficer2++;
    }
  }
  
  // 식신이 있으면 자녀운 좋음
  if (foodGod1 > 0 && foodGod2 > 0) {
    score += 20;
    positive.push('둘 다 식신이 있어 자녀 복이 있습니다');
  } else if (foodGod1 > 0 || foodGod2 > 0) {
    score += 10;
    positive.push('자녀에 대한 사랑이 깊습니다');
  }
  
  // 상관이 많으면 자녀 교육에 엄격
  if (hurtOfficer1 > 1 || hurtOfficer2 > 1) {
    score -= 5;
    negative.push('자녀 교육 방식에서 의견 충돌이 있을 수 있습니다');
  }
  
  // 식상이 전혀 없으면 자녀운 약함
  if (outputCount1 === 0 && outputCount2 === 0) {
    score -= 15;
    negative.push('식상이 부족하여 자녀 계획에 어려움이 있을 수 있습니다');
  }
  
  // 수(水) 오행이 있으면 생식 능력
  const waterCount1 = countElement(saju1, '수');
  const waterCount2 = countElement(saju2, '수');
  
  if (waterCount1 > 0 && waterCount2 > 0) {
    score += 10;
    positive.push('수 기운이 있어 자녀 생산력이 좋습니다');
  }
  
  // 시지가 자오묘유(도화)면 이성 자녀
  const peachBlossom = ['자', '오', '묘', '유'];
  if (peachBlossom.includes(saju1.time.ji) || peachBlossom.includes(saju2.time.ji)) {
    score += 5;
    positive.push('도화가 있어 예쁜 자녀를 얻을 수 있습니다');
  }
  
  score = Math.max(0, Math.min(100, score));
  
  return {
    score,
    level: getLevel(score),
    description: `자녀운 궁합은 ${score}점입니다. ${score >= 70 ? '자녀와 행복한 가정을 이룰 수 있습니다.' : '자녀 계획에 대한 충분한 대화가 필요합니다.'}`,
    factors: { positive, negative },
  };
}

/**
 * 12. 시댁/처가 궁합 - 년주/월주 관계성
 */
export function calculateInLawScore(saju1: SajuData, saju2: SajuData): DetailScore {
  let score = 70;
  const positive: string[] = [];
  const negative: string[] = [];
  
  // 년주는 조상/부모, 월주는 형제/가족을 나타냄
  const yearJi1 = saju1.year.ji;
  const yearJi2 = saju2.year.ji;
  const monthJi1 = saju1.month.ji;
  const monthJi2 = saju2.month.ji;
  
  // 년지 충돌 체크 (부모와의 관계)
  const JI_CLASH: string[][] = [
    ['자', '오'], ['축', '미'], ['인', '신'],
    ['묘', '유'], ['진', '술'], ['사', '해'],
  ];
  
  let hasClash = false;
  for (const clash of JI_CLASH) {
    if ((clash[0] === yearJi1 && clash[1] === yearJi2) || 
        (clash[1] === yearJi1 && clash[0] === yearJi2)) {
      score -= 15;
      negative.push('년지가 충이 되어 양가 부모님과의 관계에 주의가 필요합니다');
      hasClash = true;
      break;
    }
  }
  
  if (!hasClash) {
    score += 10;
    positive.push('년지가 충돌하지 않아 양가 화합이 좋습니다');
  }
  
  // 월지 관계 (형제/친척과의 관계)
  for (const clash of JI_CLASH) {
    if ((clash[0] === monthJi1 && clash[1] === monthJi2) || 
        (clash[1] === monthJi1 && clash[0] === monthJi2)) {
      score -= 10;
      negative.push('월지가 충이 되어 형제간 관계에 신경써야 합니다');
      break;
    }
  }
  
  // 년간 오행 조화
  const yearGanElem1 = getGanElement(saju1.year.gan);
  const yearGanElem2 = getGanElement(saju2.year.gan);
  
  const SHENG: { [key: string]: string } = {
    '목': '화', '화': '토', '토': '금', '금': '수', '수': '목',
  };
  
  if (SHENG[yearGanElem1] === yearGanElem2 || SHENG[yearGanElem2] === yearGanElem1) {
    score += 15;
    positive.push('년간이 상생하여 양가 어른들의 축복을 받습니다');
  }
  
  // 인성이 많으면 효도
  const gans1 = [saju1.year.gan, saju1.month.gan, saju1.day.gan, saju1.time.gan];
  const gans2 = [saju2.year.gan, saju2.month.gan, saju2.day.gan, saju2.time.gan];
  
  let sealCount1 = 0;
  let sealCount2 = 0;
  
  for (const gan of gans1) {
    const sipsin = calculateSipsin(saju1.day.gan, gan);
    if (sipsin === '정인' || sipsin === '편인') sealCount1++;
  }
  
  for (const gan of gans2) {
    const sipsin = calculateSipsin(saju2.day.gan, gan);
    if (sipsin === '정인' || sipsin === '편인') sealCount2++;
  }
  
  if (sealCount1 > 0 && sealCount2 > 0) {
    score += 10;
    positive.push('인성이 있어 어른을 공경하는 마음이 있습니다');
  }
  
  score = Math.max(0, Math.min(100, score));
  
  return {
    score,
    level: getLevel(score),
    description: `시댁/처가 궁합은 ${score}점입니다. ${score >= 70 ? '양가 가족과 원만한 관계를 유지할 수 있습니다.' : '가족 관계에서 서로 배려가 필요합니다.'}`,
    factors: { positive, negative },
  };
}

// 헬퍼 함수들
function countElement(saju: SajuData, element: string): number {
  const ganElements: { [key: string]: string } = {
    '갑': '목', '을': '목', '병': '화', '정': '화',
    '무': '토', '기': '토', '경': '금', '신': '금',
    '임': '수', '계': '수',
  };
  
  const jiElements: { [key: string]: string } = {
    '자': '수', '축': '토', '인': '목', '묘': '목',
    '진': '토', '사': '화', '오': '화', '미': '토',
    '신': '금', '유': '금', '술': '토', '해': '수',
  };
  
  let count = 0;
  const gans = [saju.year.gan, saju.month.gan, saju.day.gan, saju.time.gan];
  const jis = [saju.year.ji, saju.month.ji, saju.day.ji, saju.time.ji];
  
  for (const gan of gans) {
    if (ganElements[gan] === element) count++;
  }
  for (const ji of jis) {
    if (jiElements[ji] === element) count++;
  }
  
  return count;
}

function getGanElement(gan: string): string {
  const ganElements: { [key: string]: string } = {
    '갑': '목', '을': '목', '병': '화', '정': '화',
    '무': '토', '기': '토', '경': '금', '신': '금',
    '임': '수', '계': '수',
  };
  return ganElements[gan] || '';
}

// 전체 현실적 분석 통합 함수
export interface PracticalAnalysis {
  economic: DetailScore;
  career: DetailScore;
  residence: DetailScore;
  children: DetailScore;
  inLaw: DetailScore;
  averageScore: number;
  summary: string;
}

export function analyzePractical(saju1: SajuData, saju2: SajuData): PracticalAnalysis {
  const economic = calculateEconomicScore(saju1, saju2);
  const career = calculateCareerScore(saju1, saju2);
  const residence = calculateResidenceScore(saju1, saju2);
  const children = calculateChildrenScore(saju1, saju2);
  const inLaw = calculateInLawScore(saju1, saju2);
  
  const scores = [
    economic.score,
    career.score,
    residence.score,
    children.score,
    inLaw.score,
  ];
  
  const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  
  let summary = '';
  if (averageScore >= 80) {
    summary = '현실적인 면에서 매우 잘 맞습니다. 안정적인 가정을 이룰 수 있습니다.';
  } else if (averageScore >= 70) {
    summary = '실생활에서 큰 문제없이 조화를 이룰 수 있습니다.';
  } else if (averageScore >= 60) {
    summary = '일부 현실적 문제에서 조율이 필요하지만 극복 가능합니다.';
  } else if (averageScore >= 50) {
    summary = '현실적 가치관의 차이가 있어 충분한 대화가 필요합니다.';
  } else {
    summary = '현실적 문제로 어려움이 예상됩니다. 신중한 접근이 필요합니다.';
  }
  
  return {
    economic,
    career,
    residence,
    children,
    inLaw,
    averageScore,
    summary,
  };
}