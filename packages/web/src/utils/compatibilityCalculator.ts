/**
 * 정확한 만세력 기반 궁합 계산기
 * 십신, 오행상생상극, 지지관계를 고려한 정밀 분석
 */

interface SajuData {
  year: { gan: string; ji: string };
  month: { gan: string; ji: string };
  day: { gan: string; ji: string };
  time: { gan: string; ji: string };
  ohHaengBalance: { [key: string]: number };
  fullSaju: string;
}

// 천간 상생상극 관계
const STEM_RELATIONSHIPS = {
  상생: {
    '목': '화', '화': '토', '토': '금', '금': '수', '수': '목'
  },
  상극: {
    '목': '토', '화': '금', '토': '수', '금': '목', '수': '화'
  }
};

// 지지 삼합
const BRANCH_HARMONY = {
  '인오술': '화',
  '신자진': '수',
  '해묘미': '목',
  '사유축': '금'
};

// 지지 육합
const BRANCH_COMBINE = {
  '자축': '토', '인해': '목', '묘술': '화',
  '진유': '금', '사신': '수', '오미': '화토'
};

// 지지 충
const BRANCH_CLASH = [
  ['자', '오'], ['축', '미'], ['인', '신'],
  ['묘', '유'], ['진', '술'], ['사', '해']
];

// 오행 속성
const STEM_ELEMENTS: { [key: string]: string } = {
  '갑': '목', '을': '목',
  '병': '화', '정': '화',
  '무': '토', '기': '토',
  '경': '금', '신': '금',
  '임': '수', '계': '수'
};

const BRANCH_ELEMENTS: { [key: string]: string } = {
  '인': '목', '묘': '목',
  '사': '화', '오': '화',
  '진': '토', '술': '토', '축': '토', '미': '토',
  '신': '금', '유': '금',
  '자': '수', '해': '수'
};

// 십신 관계 계산
function calculateSipsin(dayGan: string, targetGan: string): string {
  const dayElement = STEM_ELEMENTS[dayGan];
  const targetElement = STEM_ELEMENTS[targetGan];
  
  const ganYinYang = {
    '갑': '양', '을': '음', '병': '양', '정': '음',
    '무': '양', '기': '음', '경': '양', '신': '음',
    '임': '양', '계': '음'
  };
  
  const dayYinYang = ganYinYang[dayGan];
  const targetYinYang = ganYinYang[targetGan];
  const sameYinYang = dayYinYang === targetYinYang;
  
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
  
  const rel = relationships[dayElement][targetElement];
  return rel ? (sameYinYang ? rel[0] : rel[1]) : '알수없음';
}

// 지지 관계 점수 계산
function calculateBranchRelationScore(branches1: string[], branches2: string[]): number {
  let score = 50; // 기본 점수
  
  // 합 관계 체크
  for (const b1 of branches1) {
    for (const b2 of branches2) {
      // 육합 체크
      if (BRANCH_COMBINE[b1 + b2] || BRANCH_COMBINE[b2 + b1]) {
        score += 15;
      }
      
      // 충 체크
      for (const clash of BRANCH_CLASH) {
        if ((clash[0] === b1 && clash[1] === b2) || 
            (clash[1] === b1 && clash[0] === b2)) {
          score -= 10;
        }
      }
    }
  }
  
  // 삼합 체크
  const allBranches = [...branches1, ...branches2].join('');
  for (const harmony of Object.keys(BRANCH_HARMONY)) {
    const count = harmony.split('').filter(b => allBranches.includes(b)).length;
    if (count >= 2) score += count * 5;
  }
  
  return Math.max(0, Math.min(100, score));
}

// 오행 균형 궁합 점수
function calculateElementBalance(saju1: SajuData, saju2: SajuData): number {
  const balance1 = saju1.ohHaengBalance || {};
  const balance2 = saju2.ohHaengBalance || {};
  
  let score = 60; // 기본 점수
  
  // 상생 관계 점수
  const elements = ['목', '화', '토', '금', '수'];
  for (const elem of elements) {
    const nextElem = STEM_RELATIONSHIPS.상생[elem];
    if (balance1[elem] > 25 && balance2[nextElem] > 25) {
      score += 15; // 강한 상생
    } else if (balance1[elem] > 15 && balance2[nextElem] > 15) {
      score += 8; // 보통 상생
    }
  }
  
  // 상극 관계 감점
  for (const elem of elements) {
    const clashElem = STEM_RELATIONSHIPS.상극[elem];
    if (balance1[elem] > 30 && balance2[clashElem] > 30) {
      score -= 10; // 강한 상극
    }
  }
  
  // 균형 보완 점수
  for (const elem of elements) {
    if ((balance1[elem] < 10 && balance2[elem] > 30) ||
        (balance2[elem] < 10 && balance1[elem] > 30)) {
      score += 5; // 부족한 오행 보완
    }
  }
  
  return Math.max(0, Math.min(100, score));
}

// 십신 궁합 분석
function calculateSipsinCompatibility(saju1: SajuData, saju2: SajuData): number {
  const dayGan1 = saju1.day.gan;
  const dayGan2 = saju2.day.gan;
  
  let score = 70; // 기본 점수
  
  // 일간끼리의 관계
  const dayRelation = calculateSipsin(dayGan1, dayGan2);
  
  // 궁합에 좋은 십신 관계
  const goodRelations = ['정재', '정관', '정인', '식신'];
  const neutralRelations = ['비견', '편재', '편관', '편인'];
  const badRelations = ['겁재', '상관'];
  
  if (goodRelations.includes(dayRelation)) {
    score += 20;
  } else if (neutralRelations.includes(dayRelation)) {
    score += 5;
  } else if (badRelations.includes(dayRelation)) {
    score -= 10;
  }
  
  // 연주, 월주 십신 관계도 고려
  const yearRelation = calculateSipsin(dayGan1, saju2.year.gan);
  const monthRelation = calculateSipsin(dayGan1, saju2.month.gan);
  
  if (goodRelations.includes(yearRelation)) score += 10;
  if (goodRelations.includes(monthRelation)) score += 10;
  
  return Math.max(0, Math.min(100, score));
}

// 종합 궁합 점수 계산 함수들
export function calculateAccuratePersonalityScore(saju1: SajuData, saju2: SajuData): number {
  const elementScore = calculateElementBalance(saju1, saju2);
  const sipsinScore = calculateSipsinCompatibility(saju1, saju2);
  
  return Math.round((elementScore * 0.6 + sipsinScore * 0.4));
}

export function calculateAccurateLoveScore(saju1: SajuData, saju2: SajuData): number {
  const branches1 = [saju1.year.ji, saju1.month.ji, saju1.day.ji, saju1.time.ji];
  const branches2 = [saju2.year.ji, saju2.month.ji, saju2.day.ji, saju2.time.ji];
  
  const branchScore = calculateBranchRelationScore(branches1, branches2);
  const dayGan1 = saju1.day.gan;
  const dayGan2 = saju2.day.gan;
  
  // 일간 음양 조화
  const ganYinYang: { [key: string]: string } = {
    '갑': '양', '을': '음', '병': '양', '정': '음',
    '무': '양', '기': '음', '경': '양', '신': '음',
    '임': '양', '계': '음'
  };
  
  let yinYangScore = 60;
  if (ganYinYang[dayGan1] !== ganYinYang[dayGan2]) {
    yinYangScore += 20; // 음양 조화
  }
  
  return Math.round((branchScore * 0.5 + yinYangScore * 0.5));
}

export function calculateAccurateWealthScore(saju1: SajuData, saju2: SajuData): number {
  const dayGan1 = saju1.day.gan;
  const dayGan2 = saju2.day.gan;
  
  let score = 65;
  
  // 재성(정재/편재) 관계 분석
  const gans1 = [saju1.year.gan, saju1.month.gan, saju1.day.gan, saju1.time.gan];
  const gans2 = [saju2.year.gan, saju2.month.gan, saju2.day.gan, saju2.time.gan];
  
  let wealthCount1 = 0;
  let wealthCount2 = 0;
  
  for (const gan of gans1) {
    const sipsin = calculateSipsin(dayGan1, gan);
    if (sipsin === '정재' || sipsin === '편재') wealthCount1++;
  }
  
  for (const gan of gans2) {
    const sipsin = calculateSipsin(dayGan2, gan);
    if (sipsin === '정재' || sipsin === '편재') wealthCount2++;
  }
  
  // 재성이 적절히 있으면 좋음
  if (wealthCount1 > 0 && wealthCount1 <= 2) score += 10;
  if (wealthCount2 > 0 && wealthCount2 <= 2) score += 10;
  
  // 둘 다 재성이 너무 많으면 충돌 가능
  if (wealthCount1 > 2 && wealthCount2 > 2) score -= 15;
  
  return Math.max(0, Math.min(100, score));
}

export function calculateAccurateHealthScore(saju1: SajuData, saju2: SajuData): number {
  const balance1 = saju1.ohHaengBalance || {};
  const balance2 = saju2.ohHaengBalance || {};
  
  let score = 70;
  
  // 오행 균형이 잡혀있을수록 건강
  const elements = ['목', '화', '토', '금', '수'];
  for (const elem of elements) {
    const avg = (balance1[elem] + balance2[elem]) / 2;
    if (avg >= 15 && avg <= 25) {
      score += 4; // 균형잡힌 오행
    }
  }
  
  // 상생 관계가 많으면 건강에 좋음
  for (const elem of elements) {
    const nextElem = STEM_RELATIONSHIPS.상생[elem];
    if (balance1[elem] > 15 && balance2[nextElem] > 15) {
      score += 3;
    }
  }
  
  return Math.max(0, Math.min(100, score));
}

export function calculateAccurateFutureScore(saju1: SajuData, saju2: SajuData): number {
  const branches1 = [saju1.year.ji, saju1.month.ji, saju1.day.ji, saju1.time.ji];
  const branches2 = [saju2.year.ji, saju2.month.ji, saju2.day.ji, saju2.time.ji];
  
  let score = 60;
  
  // 삼합이 완성되면 미래 발전 가능성 높음
  const allBranches = [...branches1, ...branches2];
  for (const harmony of Object.keys(BRANCH_HARMONY)) {
    const harmonyBranches = harmony.split('');
    const count = harmonyBranches.filter(b => allBranches.includes(b)).length;
    if (count === 3) {
      score += 20; // 삼합 완성
    } else if (count === 2) {
      score += 10; // 삼합 일부
    }
  }
  
  // 충이 많으면 미래 불안정
  for (const clash of BRANCH_CLASH) {
    if (branches1.includes(clash[0]) && branches2.includes(clash[1])) {
      score -= 8;
    }
  }
  
  return Math.max(0, Math.min(100, score));
}

// 궁합 조언 생성
export function generateDetailedAdvice(
  totalScore: number,
  categories: { name: string; score: number }[]
): string {
  let advice = '';
  
  // 전체 점수 기반 조언
  if (totalScore >= 90) {
    advice = '천생연분입니다! 서로를 위한 완벽한 파트너입니다. ';
  } else if (totalScore >= 80) {
    advice = '매우 좋은 궁합입니다. 서로를 이해하고 존중하면 행복한 관계가 될 것입니다. ';
  } else if (totalScore >= 70) {
    advice = '좋은 궁합입니다. 서로의 차이를 인정하고 노력한다면 좋은 관계를 유지할 수 있습니다. ';
  } else if (totalScore >= 60) {
    advice = '보통의 궁합입니다. 서로를 이해하려는 노력이 필요합니다. ';
  } else {
    advice = '노력이 필요한 궁합입니다. 상대방을 이해하고 배려하는 자세가 중요합니다. ';
  }
  
  // 가장 높은 점수와 낮은 점수 분야 언급
  const sorted = [...categories].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  
  if (best.score >= 80) {
    advice += `특히 ${best.name} 면에서 뛰어난 조화를 보입니다. `;
  }
  
  if (worst.score < 60) {
    advice += `${worst.name} 부분은 서로 더 노력이 필요한 영역입니다.`;
  }
  
  return advice;
}