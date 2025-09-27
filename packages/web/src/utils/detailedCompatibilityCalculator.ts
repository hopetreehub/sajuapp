/**
 * 상세 궁합 분석 계산기 - Phase 1: 관계성 분석 7개 항목
 * 만세력 기반 정밀 분석
 */

import { SajuData } from './compatibilityCalculator';

// 천간 음양
const GAN_YINYANG: { [key: string]: string } = {
  '갑': '양', '을': '음', '병': '양', '정': '음',
  '무': '양', '기': '음', '경': '양', '신': '음',
  '임': '양', '계': '음',
};

// 천간 오행
const GAN_ELEMENTS: { [key: string]: string } = {
  '갑': '목', '을': '목', '병': '화', '정': '화',
  '무': '토', '기': '토', '경': '금', '신': '금',
  '임': '수', '계': '수',
};

// 지지 오행
const JI_ELEMENTS: { [key: string]: string } = {
  '자': '수', '축': '토', '인': '목', '묘': '목',
  '진': '토', '사': '화', '오': '화', '미': '토',
  '신': '금', '유': '금', '술': '토', '해': '수',
};

// 지지 충
const JI_CLASH: string[][] = [
  ['자', '오'], ['축', '미'], ['인', '신'],
  ['묘', '유'], ['진', '술'], ['사', '해'],
];

// 지지 형
const JI_PUNISHMENT: string[][] = [
  ['인', '사', '신'], // 무은형
  ['축', '술', '미'], // 무례형
  ['자', '묘'],        // 무례형
];

// 지지 파
const JI_DESTRUCTION: string[][] = [
  ['자', '유'], ['오', '묘'], ['신', '사'], ['인', '해'],
  ['축', '진'], ['미', '술'],
];

// 지지 해
const _JI_HARM: string[][] = [
  ['자', '미'], ['축', '오'], ['인', '사'],
  ['묘', '진'], ['신', '해'], ['유', '술'],
];

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
 * 1. 첫인상 궁합 - 년주 간지 조합 분석
 */
export function calculateFirstImpressionScore(saju1: SajuData, saju2: SajuData): DetailScore {
  let score = 60; // 기본 점수
  const positive: string[] = [];
  const negative: string[] = [];
  
  // 년간 음양 조화
  const gan1 = saju1.year.gan;
  const gan2 = saju2.year.gan;
  const yinyang1 = GAN_YINYANG[gan1];
  const yinyang2 = GAN_YINYANG[gan2];
  
  if (yinyang1 !== yinyang2) {
    score += 15;
    positive.push('음양이 조화로워 첫만남부터 끌림이 있습니다');
  } else {
    score -= 5;
    negative.push('같은 음양으로 첫인상이 평범할 수 있습니다');
  }
  
  // 년간 오행 관계
  const elem1 = GAN_ELEMENTS[gan1];
  const elem2 = GAN_ELEMENTS[gan2];
  
  // 상생 관계 체크
  const SHENG_CYCLE: { [key: string]: string } = {
    '목': '화', '화': '토', '토': '금', '금': '수', '수': '목',
  };
  
  if (SHENG_CYCLE[elem1] === elem2 || SHENG_CYCLE[elem2] === elem1) {
    score += 20;
    positive.push('오행이 상생하여 자연스러운 호감을 느낍니다');
  }
  
  // 년지 관계
  const ji1 = saju1.year.ji;
  const ji2 = saju2.year.ji;
  
  // 충 체크
  for (const clash of JI_CLASH) {
    if ((clash[0] === ji1 && clash[1] === ji2) || 
        (clash[1] === ji1 && clash[0] === ji2)) {
      score -= 15;
      negative.push('년지가 충이 되어 첫만남이 어색할 수 있습니다');
      break;
    }
  }
  
  // 같은 년지
  if (ji1 === ji2) {
    score += 10;
    positive.push('같은 띠로 공감대가 형성됩니다');
  }
  
  score = Math.max(0, Math.min(100, score));
  
  return {
    score,
    level: getLevel(score),
    description: `년주 기반 첫인상 궁합은 ${score}점입니다. ${score >= 70 ? '좋은 첫인상을 주고받습니다.' : '천천히 친해지는 스타일입니다.'}`,
    factors: { positive, negative },
  };
}

/**
 * 2. 대화소통 궁합 - 월주 중심 소통 능력
 */
export function calculateCommunicationScore(saju1: SajuData, saju2: SajuData): DetailScore {
  let score = 65;
  const positive: string[] = [];
  const negative: string[] = [];
  
  // 월간 오행 분석
  const monthElem1 = GAN_ELEMENTS[saju1.month.gan];
  const monthElem2 = GAN_ELEMENTS[saju2.month.gan];
  
  // 목화는 소통 활발, 금수는 침착한 소통
  const communicativeElements = ['목', '화'];
  const reflectiveElements = ['금', '수'];
  
  if (communicativeElements.includes(monthElem1) && communicativeElements.includes(monthElem2)) {
    score += 15;
    positive.push('둘 다 활발한 소통 스타일로 대화가 즐겁습니다');
  } else if (reflectiveElements.includes(monthElem1) && reflectiveElements.includes(monthElem2)) {
    score += 10;
    positive.push('차분하고 깊이 있는 대화를 나눕니다');
  } else if ((communicativeElements.includes(monthElem1) && reflectiveElements.includes(monthElem2)) ||
             (reflectiveElements.includes(monthElem1) && communicativeElements.includes(monthElem2))) {
    score += 5;
    positive.push('서로 다른 소통 스타일이 균형을 이룹니다');
  }
  
  // 월지 관계
  const monthJi1 = saju1.month.ji;
  const monthJi2 = saju2.month.ji;
  
  // 형 체크
  for (const punishment of JI_PUNISHMENT) {
    if (punishment.includes(monthJi1) && punishment.includes(monthJi2)) {
      score -= 10;
      negative.push('소통 과정에서 오해가 생기기 쉽습니다');
      break;
    }
  }
  
  // 같은 계절(월지)
  const seasons: { [key: string]: string } = {
    '인': '봄', '묘': '봄', '진': '봄',
    '사': '여름', '오': '여름', '미': '여름',
    '신': '가을', '유': '가을', '술': '가을',
    '해': '겨울', '자': '겨울', '축': '겨울',
  };
  
  if (seasons[monthJi1] === seasons[monthJi2]) {
    score += 10;
    positive.push('같은 계절 출생으로 정서적 리듬이 맞습니다');
  }
  
  score = Math.max(0, Math.min(100, score));
  
  return {
    score,
    level: getLevel(score),
    description: `월주 기반 소통 궁합은 ${score}점입니다. ${score >= 70 ? '원활한 의사소통이 가능합니다.' : '소통 방식의 차이를 이해할 필요가 있습니다.'}`,
    factors: { positive, negative },
  };
}

/**
 * 3. 가치관 궁합 - 일간 십신 관계
 */
export function calculateValueSystemScore(saju1: SajuData, saju2: SajuData): DetailScore {
  let score = 70;
  const positive: string[] = [];
  const negative: string[] = [];
  
  const dayGan1 = saju1.day.gan;
  const dayGan2 = saju2.day.gan;
  
  // 일간 음양 조화
  if (GAN_YINYANG[dayGan1] !== GAN_YINYANG[dayGan2]) {
    score += 20;
    positive.push('음양이 조화되어 서로를 보완합니다');
  }
  
  // 일간 오행 관계
  const dayElem1 = GAN_ELEMENTS[dayGan1];
  const dayElem2 = GAN_ELEMENTS[dayGan2];
  
  // 같은 오행
  if (dayElem1 === dayElem2) {
    score += 10;
    positive.push('같은 오행으로 기본 성향이 비슷합니다');
  }
  
  // 상생 관계
  const SHENG: { [key: string]: string } = {
    '목': '화', '화': '토', '토': '금', '금': '수', '수': '목',
  };
  
  if (SHENG[dayElem1] === dayElem2) {
    score += 15;
    positive.push(`${dayElem1}이 ${dayElem2}를 생하여 베푸는 관계입니다`);
  } else if (SHENG[dayElem2] === dayElem1) {
    score += 15;
    positive.push(`${dayElem2}가 ${dayElem1}을 생하여 받는 관계입니다`);
  }
  
  // 상극 관계
  const KE: { [key: string]: string } = {
    '목': '토', '토': '수', '수': '화', '화': '금', '금': '목',
  };
  
  if (KE[dayElem1] === dayElem2 || KE[dayElem2] === dayElem1) {
    score -= 15;
    negative.push('오행이 상극하여 가치관 충돌이 있을 수 있습니다');
  }
  
  score = Math.max(0, Math.min(100, score));
  
  return {
    score,
    level: getLevel(score),
    description: `일간 기반 가치관 궁합은 ${score}점입니다. ${score >= 70 ? '핵심 가치관이 잘 맞습니다.' : '서로의 가치관을 존중하는 노력이 필요합니다.'}`,
    factors: { positive, negative },
  };
}

/**
 * 4. 생활패턴 궁합 - 시주 기반 일상 리듬
 */
export function calculateLifePatternScore(saju1: SajuData, saju2: SajuData): DetailScore {
  let score = 60;
  const positive: string[] = [];
  const negative: string[] = [];
  
  const timeJi1 = saju1.time.ji;
  const timeJi2 = saju2.time.ji;
  
  // 시간대별 활동 패턴
  const _timePatterns: { [key: string]: string } = {
    '자': '야행성(23-01시)', '축': '새벽형(01-03시)',
    '인': '새벽형(03-05시)', '묘': '아침형(05-07시)',
    '진': '아침형(07-09시)', '사': '오전형(09-11시)',
    '오': '낮형(11-13시)', '미': '오후형(13-15시)',
    '신': '오후형(15-17시)', '유': '저녁형(17-19시)',
    '술': '저녁형(19-21시)', '해': '밤형(21-23시)',
  };
  
  // 같은 시간대 그룹
  const morningTypes = ['인', '묘', '진', '사'];
  const afternoonTypes = ['오', '미', '신', '유'];
  const eveningTypes = ['술', '해', '자', '축'];
  
  const getTimeGroup = (ji: string) => {
    if (morningTypes.includes(ji)) return 'morning';
    if (afternoonTypes.includes(ji)) return 'afternoon';
    if (eveningTypes.includes(ji)) return 'evening';
    return 'unknown';
  };
  
  const group1 = getTimeGroup(timeJi1);
  const group2 = getTimeGroup(timeJi2);
  
  if (group1 === group2) {
    score += 20;
    positive.push('생활 리듬이 비슷하여 일상이 조화롭습니다');
  } else {
    score -= 10;
    negative.push('활동 시간대가 달라 조율이 필요합니다');
  }
  
  // 시지 충돌 체크
  for (const clash of JI_CLASH) {
    if ((clash[0] === timeJi1 && clash[1] === timeJi2) || 
        (clash[1] === timeJi1 && clash[0] === timeJi2)) {
      score -= 15;
      negative.push('생활 패턴이 정반대여서 갈등이 생길 수 있습니다');
      break;
    }
  }
  
  // 시간 오행 조화
  const timeElem1 = JI_ELEMENTS[timeJi1];
  const timeElem2 = JI_ELEMENTS[timeJi2];
  
  if (timeElem1 === timeElem2) {
    score += 10;
    positive.push('비슷한 에너지 패턴을 가지고 있습니다');
  }
  
  score = Math.max(0, Math.min(100, score));
  
  return {
    score,
    level: getLevel(score),
    description: `시주 기반 생활패턴 궁합은 ${score}점입니다. ${score >= 70 ? '일상생활이 조화롭게 흘러갑니다.' : '생활 패턴 조율이 필요합니다.'}`,
    factors: { positive, negative },
  };
}

/**
 * 5. 갈등해결 궁합 - 충/형/파/해 관계
 */
export function calculateConflictResolutionScore(saju1: SajuData, saju2: SajuData): DetailScore {
  let score = 80; // 기본 점수 높게 시작
  const positive: string[] = [];
  const negative: string[] = [];
  
  const allJi1 = [saju1.year.ji, saju1.month.ji, saju1.day.ji, saju1.time.ji];
  const allJi2 = [saju2.year.ji, saju2.month.ji, saju2.day.ji, saju2.time.ji];
  
  let clashCount = 0;
  let punishmentCount = 0;
  let destructionCount = 0;
  const _harmCount = 0;
  
  // 충 체크
  for (const ji1 of allJi1) {
    for (const ji2 of allJi2) {
      for (const clash of JI_CLASH) {
        if ((clash[0] === ji1 && clash[1] === ji2) || 
            (clash[1] === ji1 && clash[0] === ji2)) {
          clashCount++;
        }
      }
    }
  }
  
  if (clashCount > 0) {
    score -= clashCount * 10;
    negative.push(`${clashCount}개의 충이 있어 갈등이 자주 발생할 수 있습니다`);
  }
  
  // 형 체크
  for (const punishment of JI_PUNISHMENT) {
    let found1 = false, found2 = false;
    for (const ji of allJi1) {
      if (punishment.includes(ji)) found1 = true;
    }
    for (const ji of allJi2) {
      if (punishment.includes(ji)) found2 = true;
    }
    if (found1 && found2) punishmentCount++;
  }
  
  if (punishmentCount > 0) {
    score -= punishmentCount * 8;
    negative.push('형이 있어 서로 상처를 줄 수 있습니다');
  }
  
  // 파 체크
  for (const ji1 of allJi1) {
    for (const ji2 of allJi2) {
      for (const destruction of JI_DESTRUCTION) {
        if ((destruction[0] === ji1 && destruction[1] === ji2) || 
            (destruction[1] === ji1 && destruction[0] === ji2)) {
          destructionCount++;
        }
      }
    }
  }
  
  if (destructionCount > 0) {
    score -= destructionCount * 5;
    negative.push('파가 있어 관계가 불안정할 수 있습니다');
  }
  
  // 긍정 요소
  if (clashCount === 0 && punishmentCount === 0) {
    score += 10;
    positive.push('충이나 형이 없어 평화로운 관계입니다');
  }
  
  // 토(土) 오행이 많으면 중재 능력 우수
  const earthCount1 = allJi1.filter(ji => JI_ELEMENTS[ji] === '토').length;
  const earthCount2 = allJi2.filter(ji => JI_ELEMENTS[ji] === '토').length;
  
  if (earthCount1 > 0 || earthCount2 > 0) {
    score += 5;
    positive.push('토 오행이 있어 갈등 중재 능력이 있습니다');
  }
  
  score = Math.max(0, Math.min(100, score));
  
  return {
    score,
    level: getLevel(score),
    description: `갈등해결 궁합은 ${score}점입니다. ${score >= 70 ? '갈등을 잘 해결할 수 있습니다.' : '갈등 발생 시 신중한 대처가 필요합니다.'}`,
    factors: { positive, negative },
  };
}

/**
 * 6. 정서적 궁합 - 수(水) 오행 조화도
 */
export function calculateEmotionalScore(saju1: SajuData, saju2: SajuData): DetailScore {
  let score = 65;
  const positive: string[] = [];
  const negative: string[] = [];
  
  // 수 오행 개수 계산
  const waterCount1 = countElement(saju1, '수');
  const waterCount2 = countElement(saju2, '수');
  
  // 수가 적절히 있으면 정서적 교감 우수
  if (waterCount1 > 0 && waterCount1 <= 2) {
    score += 10;
    positive.push('적절한 수 기운으로 감정 표현이 자연스럽습니다');
  }
  if (waterCount2 > 0 && waterCount2 <= 2) {
    score += 10;
    positive.push('상대방도 감정 교류가 원활합니다');
  }
  
  // 수가 너무 많으면 감정 기복
  if (waterCount1 > 3 || waterCount2 > 3) {
    score -= 10;
    negative.push('수가 과다하여 감정 기복이 심할 수 있습니다');
  }
  
  // 수가 없으면 감정 표현 부족
  if (waterCount1 === 0 && waterCount2 === 0) {
    score -= 15;
    negative.push('수가 부족하여 정서적 교감이 어려울 수 있습니다');
  }
  
  // 화수 균형 (화는 열정, 수는 감성)
  const fireCount1 = countElement(saju1, '화');
  const fireCount2 = countElement(saju2, '화');
  
  if (Math.abs(fireCount1 - waterCount1) <= 1 && Math.abs(fireCount2 - waterCount2) <= 1) {
    score += 15;
    positive.push('화수가 균형을 이루어 열정과 감성이 조화롭습니다');
  }
  
  // 오행 균형 체크
  if (saju1.ohHaengBalance && saju2.ohHaengBalance) {
    const waterBalance1 = saju1.ohHaengBalance['수'] || 0;
    const waterBalance2 = saju2.ohHaengBalance['수'] || 0;
    
    if (waterBalance1 >= 15 && waterBalance1 <= 25 && 
        waterBalance2 >= 15 && waterBalance2 <= 25) {
      score += 10;
      positive.push('수 오행이 균형잡혀 정서적 안정감이 있습니다');
    }
  }
  
  score = Math.max(0, Math.min(100, score));
  
  return {
    score,
    level: getLevel(score),
    description: `정서적 궁합은 ${score}점입니다. ${score >= 70 ? '깊은 정서적 교감이 가능합니다.' : '감정 표현과 이해에 노력이 필요합니다.'}`,
    factors: { positive, negative },
  };
}

/**
 * 7. 신뢰도 궁합 - 토(土) 오행 안정성
 */
export function calculateTrustScore(saju1: SajuData, saju2: SajuData): DetailScore {
  let score = 70;
  const positive: string[] = [];
  const negative: string[] = [];
  
  // 토 오행 개수 계산
  const earthCount1 = countElement(saju1, '토');
  const earthCount2 = countElement(saju2, '토');
  
  // 토가 적절히 있으면 신뢰감 형성
  if (earthCount1 >= 1 && earthCount1 <= 3) {
    score += 10;
    positive.push('토 기운이 있어 믿음직합니다');
  }
  if (earthCount2 >= 1 && earthCount2 <= 3) {
    score += 10;
    positive.push('상대방도 신뢰할 만한 사람입니다');
  }
  
  // 둘 다 토가 있으면 안정적 관계
  if (earthCount1 > 0 && earthCount2 > 0) {
    score += 15;
    positive.push('서로 토 기운이 있어 안정적인 신뢰관계를 형성합니다');
  }
  
  // 토가 너무 많으면 융통성 부족
  if (earthCount1 > 4 || earthCount2 > 4) {
    score -= 10;
    negative.push('토가 과다하여 고집이 세고 변화를 거부할 수 있습니다');
  }
  
  // 토가 없으면 신뢰 형성 어려움
  if (earthCount1 === 0 || earthCount2 === 0) {
    score -= 15;
    negative.push('토가 부족하여 신뢰 형성에 시간이 필요합니다');
  }
  
  // 일지가 토인 경우 추가 점수
  const dayJi1 = saju1.day.ji;
  const dayJi2 = saju2.day.ji;
  const earthJi = ['축', '진', '미', '술'];
  
  if (earthJi.includes(dayJi1) || earthJi.includes(dayJi2)) {
    score += 5;
    positive.push('일지에 토가 있어 기본적으로 신뢰감을 줍니다');
  }
  
  score = Math.max(0, Math.min(100, score));
  
  return {
    score,
    level: getLevel(score),
    description: `신뢰도 궁합은 ${score}점입니다. ${score >= 70 ? '서로를 깊이 신뢰할 수 있습니다.' : '신뢰 구축에 시간과 노력이 필요합니다.'}`,
    factors: { positive, negative },
  };
}

// 헬퍼 함수: 특정 오행 개수 세기
function countElement(saju: SajuData, element: string): number {
  let count = 0;
  const gans = [saju.year.gan, saju.month.gan, saju.day.gan, saju.time.gan];
  const jis = [saju.year.ji, saju.month.ji, saju.day.ji, saju.time.ji];
  
  for (const gan of gans) {
    if (GAN_ELEMENTS[gan] === element) count++;
  }
  for (const ji of jis) {
    if (JI_ELEMENTS[ji] === element) count++;
  }
  
  return count;
}

// 전체 관계성 분석 통합 함수
export interface RelationshipAnalysis {
  firstImpression: DetailScore;
  communication: DetailScore;
  valueSystem: DetailScore;
  lifePattern: DetailScore;
  conflictResolution: DetailScore;
  emotional: DetailScore;
  trust: DetailScore;
  averageScore: number;
  summary: string;
}

export function analyzeRelationship(saju1: SajuData, saju2: SajuData): RelationshipAnalysis {
  const firstImpression = calculateFirstImpressionScore(saju1, saju2);
  const communication = calculateCommunicationScore(saju1, saju2);
  const valueSystem = calculateValueSystemScore(saju1, saju2);
  const lifePattern = calculateLifePatternScore(saju1, saju2);
  const conflictResolution = calculateConflictResolutionScore(saju1, saju2);
  const emotional = calculateEmotionalScore(saju1, saju2);
  const trust = calculateTrustScore(saju1, saju2);
  
  const scores = [
    firstImpression.score,
    communication.score,
    valueSystem.score,
    lifePattern.score,
    conflictResolution.score,
    emotional.score,
    trust.score,
  ];
  
  const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  
  let summary = '';
  if (averageScore >= 80) {
    summary = '매우 훌륭한 관계성을 가지고 있습니다. 서로를 깊이 이해하고 존중할 수 있는 관계입니다.';
  } else if (averageScore >= 70) {
    summary = '좋은 관계를 유지할 수 있습니다. 약간의 노력으로 더욱 발전할 가능성이 있습니다.';
  } else if (averageScore >= 60) {
    summary = '평균적인 관계입니다. 서로를 이해하려는 노력이 필요합니다.';
  } else if (averageScore >= 50) {
    summary = '관계 유지에 상당한 노력이 필요합니다. 차이점을 인정하고 존중하는 것이 중요합니다.';
  } else {
    summary = '관계에 어려움이 예상됩니다. 충분한 이해와 인내가 필요합니다.';
  }
  
  return {
    firstImpression,
    communication,
    valueSystem,
    lifePattern,
    conflictResolution,
    emotional,
    trust,
    averageScore,
    summary,
  };
}