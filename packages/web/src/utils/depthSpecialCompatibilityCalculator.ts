/**
 * 심층 및 특수 궁합 분석 계산기 - Phase 3: 심층 4개, 특수 4개 항목
 * 성적 궁합, 종교/신앙, 여행/취미, 노후생활, 천을귀인, 도화살, 공망, 신살
 */

import { SajuData } from './compatibilityCalculator';

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

// 도화살 지지
const PEACH_BLOSSOM = ['자', '오', '묘', '유'];

// 역마살 지지 
const TRAVELING_HORSE = ['인', '신', '사', '해'];

// 화개살 지지
const CANOPY = ['진', '술', '축', '미'];

/**
 * 13. 성적 궁합 - 화(火) 오행과 도화살
 */
export function calculateSexualScore(saju1: SajuData, saju2: SajuData): DetailScore {
  let score = 60;
  const positive: string[] = [];
  const negative: string[] = [];
  
  // 화 오행 개수 (열정)
  const fireCount1 = countElement(saju1, '화');
  const fireCount2 = countElement(saju2, '화');
  
  // 수 오행 개수 (감성)
  const waterCount1 = countElement(saju1, '수');
  const waterCount2 = countElement(saju2, '수');
  
  // 적절한 화수 균형
  if (fireCount1 >= 1 && fireCount1 <= 2 && waterCount1 >= 1 && waterCount1 <= 2) {
    score += 15;
    positive.push('화수가 균형을 이루어 건강한 성생활이 가능합니다');
  }
  if (fireCount2 >= 1 && fireCount2 <= 2 && waterCount2 >= 1 && waterCount2 <= 2) {
    score += 15;
    positive.push('상대방도 성적 에너지가 균형잡혀 있습니다');
  }
  
  // 도화살 체크
  const allJi1 = [saju1.year.ji, saju1.month.ji, saju1.day.ji, saju1.time.ji];
  const allJi2 = [saju2.year.ji, saju2.month.ji, saju2.day.ji, saju2.time.ji];
  
  const peachCount1 = allJi1.filter(ji => PEACH_BLOSSOM.includes(ji)).length;
  const peachCount2 = allJi2.filter(ji => PEACH_BLOSSOM.includes(ji)).length;
  
  if (peachCount1 === 1 && peachCount2 === 1) {
    score += 20;
    positive.push('적절한 도화가 있어 서로에게 매력을 느낍니다');
  } else if (peachCount1 > 2 || peachCount2 > 2) {
    score -= 15;
    negative.push('도화가 과다하여 이성 문제가 생길 수 있습니다');
  } else if (peachCount1 === 0 && peachCount2 === 0) {
    score -= 10;
    negative.push('도화가 없어 성적 매력이 부족할 수 있습니다');
  }
  
  // 일지가 도화인 경우 특별 가산
  if (PEACH_BLOSSOM.includes(saju1.day.ji) && PEACH_BLOSSOM.includes(saju2.day.ji)) {
    score += 10;
    positive.push('일지 도화로 강한 성적 끌림이 있습니다');
  }
  
  // 화가 너무 많으면 충동적
  if (fireCount1 > 3 || fireCount2 > 3) {
    score -= 10;
    negative.push('화가 과다하여 성적으로 충동적일 수 있습니다');
  }
  
  // 음양 조화
  const ganYinYang: { [key: string]: string } = {
    '갑': '양', '을': '음', '병': '양', '정': '음',
    '무': '양', '기': '음', '경': '양', '신': '음',
    '임': '양', '계': '음'
  };
  
  if (ganYinYang[saju1.day.gan] !== ganYinYang[saju2.day.gan]) {
    score += 10;
    positive.push('음양이 조화되어 성적 궁합이 좋습니다');
  }
  
  score = Math.max(0, Math.min(100, score));
  
  return {
    score,
    level: getLevel(score),
    description: `성적 궁합은 ${score}점입니다. ${score >= 70 ? '서로에게 성적 매력을 느낍니다.' : '성적 조화를 위한 노력이 필요합니다.'}`,
    factors: { positive, negative }
  };
}

/**
 * 14. 종교/신앙 궁합 - 인성과 식신 관계
 */
export function calculateSpiritualScore(saju1: SajuData, saju2: SajuData): DetailScore {
  let score = 70;
  const positive: string[] = [];
  const negative: string[] = [];
  
  // 인성 개수 (정신적 성향)
  const sealCount1 = countSipsin(saju1, ['정인', '편인']);
  const sealCount2 = countSipsin(saju2, ['정인', '편인']);
  
  // 식신 개수 (종교적 성향)
  const foodGodCount1 = countSipsin(saju1, ['식신']);
  const foodGodCount2 = countSipsin(saju2, ['식신']);
  
  // 인성이 많으면 정신적/종교적
  if (sealCount1 > 0 && sealCount2 > 0) {
    score += 15;
    positive.push('둘 다 정신적 가치를 중요시합니다');
  }
  
  if (foodGodCount1 > 0 && foodGodCount2 > 0) {
    score += 15;
    positive.push('종교나 철학에 대한 관심이 비슷합니다');
  }
  
  // 화개살 체크 (예술/종교 성향)
  const allJi1 = [saju1.year.ji, saju1.month.ji, saju1.day.ji, saju1.time.ji];
  const allJi2 = [saju2.year.ji, saju2.month.ji, saju2.day.ji, saju2.time.ji];
  
  const canopyCount1 = allJi1.filter(ji => CANOPY.includes(ji)).length;
  const canopyCount2 = allJi2.filter(ji => CANOPY.includes(ji)).length;
  
  if (canopyCount1 > 0 && canopyCount2 > 0) {
    score += 10;
    positive.push('화개살이 있어 예술적/영적 교감이 가능합니다');
  } else if ((canopyCount1 > 1 && canopyCount2 === 0) || (canopyCount1 === 0 && canopyCount2 > 1)) {
    score -= 10;
    negative.push('종교관의 차이가 클 수 있습니다');
  }
  
  // 목(木) 오행 (자비심)
  const woodCount1 = countElement(saju1, '목');
  const woodCount2 = countElement(saju2, '목');
  
  if (woodCount1 > 0 && woodCount2 > 0) {
    score += 5;
    positive.push('목 기운이 있어 자비롭고 포용적입니다');
  }
  
  // 인성 과다면 맹신 위험
  if (sealCount1 > 3 || sealCount2 > 3) {
    score -= 15;
    negative.push('인성이 과다하여 종교적 극단주의 우려가 있습니다');
  }
  
  score = Math.max(0, Math.min(100, score));
  
  return {
    score,
    level: getLevel(score),
    description: `종교/신앙 궁합은 ${score}점입니다. ${score >= 70 ? '정신적 가치관이 잘 맞습니다.' : '종교나 신념에 대한 상호 이해가 필요합니다.'}`,
    factors: { positive, negative }
  };
}

/**
 * 15. 여행/취미 궁합 - 역마살과 화개살
 */
export function calculateHobbyScore(saju1: SajuData, saju2: SajuData): DetailScore {
  let score = 65;
  const positive: string[] = [];
  const negative: string[] = [];
  
  const allJi1 = [saju1.year.ji, saju1.month.ji, saju1.day.ji, saju1.time.ji];
  const allJi2 = [saju2.year.ji, saju2.month.ji, saju2.day.ji, saju2.time.ji];
  
  // 역마살 체크 (여행/이동)
  const travelCount1 = allJi1.filter(ji => TRAVELING_HORSE.includes(ji)).length;
  const travelCount2 = allJi2.filter(ji => TRAVELING_HORSE.includes(ji)).length;
  
  if (travelCount1 > 0 && travelCount2 > 0) {
    score += 20;
    positive.push('둘 다 역마가 있어 여행을 즐깁니다');
  } else if ((travelCount1 > 1 && travelCount2 === 0) || (travelCount1 === 0 && travelCount2 > 1)) {
    score -= 10;
    negative.push('여행 취향의 차이로 갈등이 있을 수 있습니다');
  } else if (travelCount1 === 0 && travelCount2 === 0) {
    score += 5;
    positive.push('둘 다 안정적인 취미를 선호합니다');
  }
  
  // 화개살 체크 (예술/문화)
  const canopyCount1 = allJi1.filter(ji => CANOPY.includes(ji)).length;
  const canopyCount2 = allJi2.filter(ji => CANOPY.includes(ji)).length;
  
  if (canopyCount1 > 0 && canopyCount2 > 0) {
    score += 15;
    positive.push('예술적 취미를 공유할 수 있습니다');
  }
  
  // 식상 (창의적 취미)
  const creativityCount1 = countSipsin(saju1, ['식신', '상관']);
  const creativityCount2 = countSipsin(saju2, ['식신', '상관']);
  
  if (creativityCount1 > 0 && creativityCount2 > 0) {
    score += 10;
    positive.push('창의적인 취미 활동을 함께 즐길 수 있습니다');
  }
  
  // 목화 오행 (활동적 취미)
  const activeElements1 = countElement(saju1, '목') + countElement(saju1, '화');
  const activeElements2 = countElement(saju2, '목') + countElement(saju2, '화');
  
  if (activeElements1 >= 3 && activeElements2 >= 3) {
    score += 10;
    positive.push('활동적인 취미를 함께 즐길 수 있습니다');
  } else if ((activeElements1 >= 4 && activeElements2 <= 1) || (activeElements1 <= 1 && activeElements2 >= 4)) {
    score -= 10;
    negative.push('활동량의 차이로 취미 공유가 어려울 수 있습니다');
  }
  
  score = Math.max(0, Math.min(100, score));
  
  return {
    score,
    level: getLevel(score),
    description: `여행/취미 궁합은 ${score}점입니다. ${score >= 70 ? '취미와 여가를 함께 즐길 수 있습니다.' : '서로의 취미를 존중하는 노력이 필요합니다.'}`,
    factors: { positive, negative }
  };
}

/**
 * 16. 노후생활 궁합 - 금(金) 오행 안정도
 */
export function calculateRetirementScore(saju1: SajuData, saju2: SajuData): DetailScore {
  let score = 70;
  const positive: string[] = [];
  const negative: string[] = [];
  
  // 금 오행 (노후 안정)
  const metalCount1 = countElement(saju1, '금');
  const metalCount2 = countElement(saju2, '금');
  
  if (metalCount1 >= 1 && metalCount1 <= 3) {
    score += 10;
    positive.push('금 기운이 있어 노후 준비가 철저합니다');
  }
  if (metalCount2 >= 1 && metalCount2 <= 3) {
    score += 10;
    positive.push('상대방도 노후를 체계적으로 준비합니다');
  }
  
  // 토 오행 (안정성)
  const earthCount1 = countElement(saju1, '토');
  const earthCount2 = countElement(saju2, '토');
  
  if (earthCount1 > 0 && earthCount2 > 0) {
    score += 15;
    positive.push('토 기운이 있어 안정적인 노후생활이 가능합니다');
  }
  
  // 재성 (경제적 노후)
  const wealthCount1 = countSipsin(saju1, ['정재', '편재']);
  const wealthCount2 = countSipsin(saju2, ['정재', '편재']);
  
  if (wealthCount1 > 0 && wealthCount2 > 0) {
    score += 10;
    positive.push('재성이 있어 경제적으로 안정된 노후가 기대됩니다');
  } else if (wealthCount1 === 0 && wealthCount2 === 0) {
    score -= 15;
    negative.push('재성이 부족하여 노후 자금 준비에 신경써야 합니다');
  }
  
  // 인성 (정신적 노후)
  const sealCount1 = countSipsin(saju1, ['정인', '편인']);
  const sealCount2 = countSipsin(saju2, ['정인', '편인']);
  
  if (sealCount1 > 0 || sealCount2 > 0) {
    score += 5;
    positive.push('인성이 있어 정신적으로 풍요로운 노후가 가능합니다');
  }
  
  // 금이 너무 많으면 고집
  if (metalCount1 > 4 || metalCount2 > 4) {
    score -= 10;
    negative.push('금이 과다하여 노후에 고집이 세질 수 있습니다');
  }
  
  score = Math.max(0, Math.min(100, score));
  
  return {
    score,
    level: getLevel(score),
    description: `노후생활 궁합은 ${score}점입니다. ${score >= 70 ? '행복하고 안정된 노후를 보낼 수 있습니다.' : '노후 계획을 함께 준비해야 합니다.'}`,
    factors: { positive, negative }
  };
}

/**
 * 17. 천을귀인 궁합 - 귀인 보유 여부
 */
export function calculateNoblePersonScore(saju1: SajuData, saju2: SajuData): DetailScore {
  let score = 60;
  const positive: string[] = [];
  const negative: string[] = [];
  
  // 천을귀인 지지 (일간별)
  const NOBLE_PERSON: { [key: string]: string[] } = {
    '갑': ['축', '미'], '을': ['자', '신'],
    '병': ['해', '유'], '정': ['해', '유'],
    '무': ['축', '미'], '기': ['자', '신'],
    '경': ['축', '미'], '신': ['인', '오'],
    '임': ['묘', '사'], '계': ['묘', '사']
  };
  
  const dayGan1 = saju1.day.gan;
  const dayGan2 = saju2.day.gan;
  
  const allJi1 = [saju1.year.ji, saju1.month.ji, saju1.day.ji, saju1.time.ji];
  const allJi2 = [saju2.year.ji, saju2.month.ji, saju2.day.ji, saju2.time.ji];
  
  // 천을귀인 체크
  const nobleJi1 = NOBLE_PERSON[dayGan1] || [];
  const nobleJi2 = NOBLE_PERSON[dayGan2] || [];
  
  const hasNoble1 = allJi1.some(ji => nobleJi1.includes(ji));
  const hasNoble2 = allJi2.some(ji => nobleJi2.includes(ji));
  
  if (hasNoble1 && hasNoble2) {
    score += 30;
    positive.push('둘 다 천을귀인이 있어 귀인의 도움을 받습니다');
  } else if (hasNoble1 || hasNoble2) {
    score += 15;
    positive.push('천을귀인이 있어 어려울 때 도움을 받을 수 있습니다');
  } else {
    score -= 10;
    negative.push('천을귀인이 없어 스스로 헤쳐나가야 합니다');
  }
  
  // 서로가 서로의 귀인인지 체크
  const isNobleForEachOther1 = allJi2.some(ji => nobleJi1.includes(ji));
  const isNobleForEachOther2 = allJi1.some(ji => nobleJi2.includes(ji));
  
  if (isNobleForEachOther1 || isNobleForEachOther2) {
    score += 20;
    positive.push('서로가 서로의 귀인이 되어줄 수 있습니다');
  }
  
  // 월덕귀인 추가 체크
  const monthNoble: { [key: string]: string[] } = {
    '인': ['병', '정'], '묘': ['갑', '을'],
    '사': ['병', '정'], '오': ['임', '계'],
    '신': ['경', '신'], '유': ['경', '신'],
    '해': ['임', '계'], '자': ['임', '계']
  };
  
  const monthJi1 = saju1.month.ji;
  const monthJi2 = saju2.month.ji;
  
  if (monthNoble[monthJi1]?.includes(dayGan1) || monthNoble[monthJi2]?.includes(dayGan2)) {
    score += 10;
    positive.push('월덕귀인이 있어 인덕이 있습니다');
  }
  
  score = Math.max(0, Math.min(100, score));
  
  return {
    score,
    level: getLevel(score),
    description: `천을귀인 궁합은 ${score}점입니다. ${score >= 70 ? '귀인의 도움으로 순조로운 삶이 예상됩니다.' : '스스로 노력하여 길을 개척해야 합니다.'}`,
    factors: { positive, negative }
  };
}

/**
 * 18. 도화살 영향 - 이성 관계 복잡도
 */
export function calculatePeachBlossomScore(saju1: SajuData, saju2: SajuData): DetailScore {
  let score = 70;
  const positive: string[] = [];
  const negative: string[] = [];
  
  const allJi1 = [saju1.year.ji, saju1.month.ji, saju1.day.ji, saju1.time.ji];
  const allJi2 = [saju2.year.ji, saju2.month.ji, saju2.day.ji, saju2.time.ji];
  
  const peachCount1 = allJi1.filter(ji => PEACH_BLOSSOM.includes(ji)).length;
  const peachCount2 = allJi2.filter(ji => PEACH_BLOSSOM.includes(ji)).length;
  
  // 적절한 도화 (1개)
  if (peachCount1 === 1 && peachCount2 === 1) {
    score += 20;
    positive.push('적절한 도화로 서로에게만 매력을 느낍니다');
  }
  
  // 도화 없음
  else if (peachCount1 === 0 && peachCount2 === 0) {
    score += 10;
    positive.push('도화가 없어 이성 문제가 적습니다');
  }
  
  // 과도한 도화
  else if (peachCount1 >= 3 || peachCount2 >= 3) {
    score -= 30;
    negative.push('도화가 과다하여 이성 문제로 갈등이 예상됩니다');
  }
  
  // 한쪽만 도화 과다
  else if ((peachCount1 >= 2 && peachCount2 === 0) || (peachCount1 === 0 && peachCount2 >= 2)) {
    score -= 20;
    negative.push('도화 불균형으로 이성 문제가 생길 수 있습니다');
  }
  
  // 도화 위치 체크
  if (PEACH_BLOSSOM.includes(saju1.day.ji) || PEACH_BLOSSOM.includes(saju2.day.ji)) {
    if (PEACH_BLOSSOM.includes(saju1.day.ji) && PEACH_BLOSSOM.includes(saju2.day.ji)) {
      score += 10;
      positive.push('일지 도화로 서로에게 강한 매력을 느낍니다');
    } else {
      score -= 10;
      negative.push('일지 도화 불균형으로 주의가 필요합니다');
    }
  }
  
  // 관살혼잡 체크 (이성 복잡)
  const officerCount1 = countSipsin(saju1, ['정관', '편관']);
  const officerCount2 = countSipsin(saju2, ['정관', '편관']);
  
  if ((officerCount1 >= 3 && saju1.day.gan in {'을': 1, '정': 1, '기': 1, '신': 1, '계': 1}) ||
      (officerCount2 >= 3 && saju2.day.gan in {'을': 1, '정': 1, '기': 1, '신': 1, '계': 1})) {
    score -= 15;
    negative.push('관살혼잡으로 이성관계가 복잡할 수 있습니다');
  }
  
  score = Math.max(0, Math.min(100, score));
  
  return {
    score,
    level: getLevel(score),
    description: `도화살 영향은 ${score}점입니다. ${score >= 70 ? '이성 문제 없이 안정적인 관계입니다.' : '이성 관계에 특별한 주의가 필요합니다.'}`,
    factors: { positive, negative }
  };
}

/**
 * 19. 공망 분석 - 허무함과 공허감 지수
 */
export function calculateEmptinessScore(saju1: SajuData, saju2: SajuData): DetailScore {
  let score = 75;
  const positive: string[] = [];
  const negative: string[] = [];
  
  // 공망 계산 (년지 기준)
  const GONGMANG: { [key: string]: string[] } = {
    '자': ['술', '해'], '축': ['술', '해'],
    '인': ['자', '축'], '묘': ['자', '축'],
    '진': ['인', '묘'], '사': ['인', '묘'],
    '오': ['진', '사'], '미': ['진', '사'],
    '신': ['오', '미'], '유': ['오', '미'],
    '술': ['신', '유'], '해': ['신', '유']
  };
  
  const yearJi1 = saju1.year.ji;
  const yearJi2 = saju2.year.ji;
  
  const gongmangJi1 = GONGMANG[yearJi1] || [];
  const gongmangJi2 = GONGMANG[yearJi2] || [];
  
  const allJi1 = [saju1.month.ji, saju1.day.ji, saju1.time.ji];
  const allJi2 = [saju2.month.ji, saju2.day.ji, saju2.time.ji];
  
  const hasGongmang1 = allJi1.some(ji => gongmangJi1.includes(ji));
  const hasGongmang2 = allJi2.some(ji => gongmangJi2.includes(ji));
  
  // 공망이 없으면 좋음
  if (!hasGongmang1 && !hasGongmang2) {
    score += 15;
    positive.push('공망이 없어 현실적이고 실속있는 관계입니다');
  }
  
  // 둘 다 공망
  else if (hasGongmang1 && hasGongmang2) {
    score -= 20;
    negative.push('둘 다 공망이 있어 허무함을 느낄 수 있습니다');
  }
  
  // 한쪽만 공망
  else if (hasGongmang1 || hasGongmang2) {
    score -= 10;
    negative.push('공망으로 인한 공허함을 이해해주어야 합니다');
  }
  
  // 일지 공망 체크 (심각)
  if (gongmangJi1.includes(saju1.day.ji) || gongmangJi2.includes(saju2.day.ji)) {
    score -= 15;
    negative.push('일지 공망으로 관계의 실속이 부족할 수 있습니다');
  }
  
  // 월지 공망 체크
  if (gongmangJi1.includes(saju1.month.ji) || gongmangJi2.includes(saju2.month.ji)) {
    score -= 10;
    negative.push('월지 공망으로 가족 관계에 어려움이 있을 수 있습니다');
  }
  
  // 공망 해소 요인 (채워지는 경우)
  if (hasGongmang1 && allJi2.some(ji => gongmangJi1.includes(ji))) {
    score += 10;
    positive.push('상대방이 공망을 채워줄 수 있습니다');
  }
  if (hasGongmang2 && allJi1.some(ji => gongmangJi2.includes(ji))) {
    score += 10;
    positive.push('서로의 공망을 채워주는 관계입니다');
  }
  
  score = Math.max(0, Math.min(100, score));
  
  return {
    score,
    level: getLevel(score),
    description: `공망 분석은 ${score}점입니다. ${score >= 70 ? '실속있고 충실한 관계입니다.' : '공허함을 채우기 위한 노력이 필요합니다.'}`,
    factors: { positive, negative }
  };
}

/**
 * 20. 신살 종합 - 각종 신살의 영향
 */
export function calculateSinsalScore(saju1: SajuData, saju2: SajuData): DetailScore {
  let score = 70;
  const positive: string[] = [];
  const negative: string[] = [];
  
  const allJi1 = [saju1.year.ji, saju1.month.ji, saju1.day.ji, saju1.time.ji];
  const allJi2 = [saju2.year.ji, saju2.month.ji, saju2.day.ji, saju2.time.ji];
  
  // 백호살 (충동적)
  const BAEKHO = ['인', '신'];
  const baekhoCount1 = allJi1.filter(ji => BAEKHO.includes(ji)).length;
  const baekhoCount2 = allJi2.filter(ji => BAEKHO.includes(ji)).length;
  
  if (baekhoCount1 >= 2 || baekhoCount2 >= 2) {
    score -= 10;
    negative.push('백호살이 있어 충동적인 행동에 주의해야 합니다');
  }
  
  // 현침살 (예민함)
  const HYUNCHIM = ['사', '해'];
  const hyunchimCount1 = allJi1.filter(ji => HYUNCHIM.includes(ji)).length;
  const hyunchimCount2 = allJi2.filter(ji => HYUNCHIM.includes(ji)).length;
  
  if (hyunchimCount1 >= 2 || hyunchimCount2 >= 2) {
    score -= 5;
    negative.push('현침살이 있어 예민한 반응에 주의가 필요합니다');
  }
  
  // 문창귀인 (학문/예술)
  const MUNCHANG: { [key: string]: string } = {
    '갑': '사', '을': '오', '병': '신', '정': '유',
    '무': '신', '기': '유', '경': '해', '신': '자',
    '임': '인', '계': '묘'
  };
  
  const dayGan1 = saju1.day.gan;
  const dayGan2 = saju2.day.gan;
  
  if (allJi1.includes(MUNCHANG[dayGan1]) || allJi2.includes(MUNCHANG[dayGan2])) {
    score += 10;
    positive.push('문창귀인이 있어 학문과 예술에 재능이 있습니다');
  }
  
  // 장성살 (리더십)
  const JANGSEONG: { [key: string]: string } = {
    '갑': '묘', '을': '진', '병': '오', '정': '미',
    '무': '오', '기': '미', '경': '유', '신': '술',
    '임': '자', '계': '축'
  };
  
  if (allJi1.includes(JANGSEONG[dayGan1]) && allJi2.includes(JANGSEONG[dayGan2])) {
    score += 15;
    positive.push('둘 다 장성살이 있어 서로를 발전시킵니다');
  }
  
  // 괴강살 (극단적 성격)
  const GOIGANG = ['경진', '임진', '무술', '경술'];
  const dayPillar1 = saju1.day.gan + saju1.day.ji;
  const dayPillar2 = saju2.day.gan + saju2.day.ji;
  
  if (GOIGANG.includes(dayPillar1) || GOIGANG.includes(dayPillar2)) {
    score -= 10;
    negative.push('괴강살이 있어 극단적인 성격에 주의가 필요합니다');
  }
  
  // 천라지망 (속박)
  const CHUNRA = ['진', '사'];
  const JIMANG = ['술', '해'];
  
  if ((allJi1.some(ji => CHUNRA.includes(ji)) && allJi2.some(ji => JIMANG.includes(ji))) ||
      (allJi1.some(ji => JIMANG.includes(ji)) && allJi2.some(ji => CHUNRA.includes(ji)))) {
    score -= 15;
    negative.push('천라지망이 형성되어 서로를 속박할 수 있습니다');
  }
  
  score = Math.max(0, Math.min(100, score));
  
  return {
    score,
    level: getLevel(score),
    description: `신살 종합 점수는 ${score}점입니다. ${score >= 70 ? '길신이 많아 순조로운 관계입니다.' : '흉신의 영향을 주의해야 합니다.'}`,
    factors: { positive, negative }
  };
}

// 헬퍼 함수들
function countElement(saju: SajuData, element: string): number {
  const ganElements: { [key: string]: string } = {
    '갑': '목', '을': '목', '병': '화', '정': '화',
    '무': '토', '기': '토', '경': '금', '신': '금',
    '임': '수', '계': '수'
  };
  
  const jiElements: { [key: string]: string } = {
    '자': '수', '축': '토', '인': '목', '묘': '목',
    '진': '토', '사': '화', '오': '화', '미': '토',
    '신': '금', '유': '금', '술': '토', '해': '수'
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

function countSipsin(saju: SajuData, sipsins: string[]): number {
  const dayGan = saju.day.gan;
  const gans = [saju.year.gan, saju.month.gan, saju.day.gan, saju.time.gan];
  let count = 0;
  
  for (const gan of gans) {
    const sipsin = calculateSipsin(dayGan, gan);
    if (sipsins.includes(sipsin)) count++;
  }
  
  return count;
}

function calculateSipsin(dayGan: string, targetGan: string): string {
  const ganElements: { [key: string]: string } = {
    '갑': '목', '을': '목', '병': '화', '정': '화',
    '무': '토', '기': '토', '경': '금', '신': '금',
    '임': '수', '계': '수'
  };
  
  const ganYinYang: { [key: string]: string } = {
    '갑': '양', '을': '음', '병': '양', '정': '음',
    '무': '양', '기': '음', '경': '양', '신': '음',
    '임': '양', '계': '음'
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
    '수': { '목': ['식신', '상관'], '화': ['편재', '정재'], '토': ['편관', '정관'], '금': ['편인', '정인'] }
  };
  
  const rel = relationships[dayElement]?.[targetElement];
  return rel ? (sameYinYang ? rel[0] : rel[1]) : '알수없음';
}

// 심층 분석 통합 함수
export interface DepthAnalysis {
  sexual: DetailScore;
  spiritual: DetailScore;
  hobby: DetailScore;
  retirement: DetailScore;
  averageScore: number;
  summary: string;
}

export function analyzeDepth(saju1: SajuData, saju2: SajuData): DepthAnalysis {
  const sexual = calculateSexualScore(saju1, saju2);
  const spiritual = calculateSpiritualScore(saju1, saju2);
  const hobby = calculateHobbyScore(saju1, saju2);
  const retirement = calculateRetirementScore(saju1, saju2);
  
  const scores = [sexual.score, spiritual.score, hobby.score, retirement.score];
  const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  
  let summary = '';
  if (averageScore >= 80) {
    summary = '심층적인 면에서도 매우 잘 어울립니다.';
  } else if (averageScore >= 70) {
    summary = '깊이 있는 관계를 만들어갈 수 있습니다.';
  } else if (averageScore >= 60) {
    summary = '일부 깊은 주제에서 이해가 필요합니다.';
  } else {
    summary = '심층적 이해를 위한 노력이 많이 필요합니다.';
  }
  
  return { sexual, spiritual, hobby, retirement, averageScore, summary };
}

// 특수 분석 통합 함수
export interface SpecialAnalysis {
  noblePerson: DetailScore;
  peachBlossom: DetailScore;
  emptiness: DetailScore;
  sinsal: DetailScore;
  averageScore: number;
  summary: string;
}

export function analyzeSpecial(saju1: SajuData, saju2: SajuData): SpecialAnalysis {
  const noblePerson = calculateNoblePersonScore(saju1, saju2);
  const peachBlossom = calculatePeachBlossomScore(saju1, saju2);
  const emptiness = calculateEmptinessScore(saju1, saju2);
  const sinsal = calculateSinsalScore(saju1, saju2);
  
  const scores = [noblePerson.score, peachBlossom.score, emptiness.score, sinsal.score];
  const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  
  let summary = '';
  if (averageScore >= 80) {
    summary = '특수한 인연으로 맺어진 좋은 관계입니다.';
  } else if (averageScore >= 70) {
    summary = '길신이 많아 순조로운 관계가 예상됩니다.';
  } else if (averageScore >= 60) {
    summary = '일부 신살의 영향에 주의가 필요합니다.';
  } else {
    summary = '신살의 영향을 극복하기 위한 노력이 필요합니다.';
  }
  
  return { noblePerson, peachBlossom, emptiness, sinsal, averageScore, summary };
}