/**
 * 자미두수(紫微斗數) 계산 엔진
 *
 * 생년월일시를 기반으로 12궁위에 14주성을 배치하고
 * 대운, 유년운 등을 계산하는 핵심 로직
 */

import type {
  ZiweiChart,
  Palace,
  EarthlyBranch,
  MainStar,
  AuxiliaryStar,
  ElementBureau,
  PalaceInfo,
  PalaceStrength,
  MajorFortune,
  YearlyFortune,
} from '@/types/ziwei';

// ============================================
// 상수 정의
// ============================================

// 12지지 배열 (寅부터 시작 - 자미두수 표준)
const EARTHLY_BRANCHES: EarthlyBranch[] = [
  '寅', '卯', '辰', '巳', '午', '未',
  '申', '酉', '戌', '亥', '子', '丑',
];

// 12궁위 이름 (명궁부터 순서대로)
const PALACE_NAMES: Palace[] = [
  '命宮', '兄弟宮', '夫妻宮', '子女宮', '財帛宮', '疾厄宮',
  '遷移宮', '奴僕宮', '官祿宮', '田宅宮', '福德宮', '父母宮',
];

// 14주성
const ZIWEI_STARS: MainStar[] = ['紫微', '天機', '太陽', '武曲', '天同', '廉貞'];
const TIANFU_STARS: MainStar[] = ['天府', '太陰', '貪狼', '巨門', '天相', '天梁', '七殺', '破軍'];

// 10천간 (향후 사용 예정)
const _HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 60갑자 납음오행 테이블 (간략화)
const NAYIN_TABLE: Record<number, ElementBureau> = {
  0: '金四局', 1: '金四局', 2: '水二局', 3: '水二局',
  4: '火六局', 5: '火六局', 6: '木三局', 7: '木三局',
  8: '土五局', 9: '土五局',
};

// ============================================
// 보조 함수
// ============================================

/**
 * 지지 인덱스 가져오기
 */
function getBranchIndex(branch: EarthlyBranch): number {
  return EARTHLY_BRANCHES.indexOf(branch);
}

/**
 * 인덱스로 지지 가져오기 (향후 사용 예정)
 */
function _getBranchByIndex(index: number): EarthlyBranch {
  return EARTHLY_BRANCHES[((index % 12) + 12) % 12];
}

/**
 * 생시를 지지로 변환
 * 23-01시: 子, 01-03시: 丑, ..., 21-23시: 亥
 */
function hourToBranch(hour: number): EarthlyBranch {
  const hourBranches: EarthlyBranch[] = [
    '子', '丑', '寅', '卯', '辰', '巳',
    '午', '未', '申', '酉', '戌', '亥',
  ];

  // 23시는 다음날 子시
  const adjustedHour = (hour + 1) % 24;
  const branchIndex = Math.floor(adjustedHour / 2);

  return hourBranches[branchIndex];
}

/**
 * 60갑자 순서 계산
 */
function calculateGanZhiIndex(year: number): number {
  // 기준: 1984년 = 갑자년 (0번)
  const baseYear = 1984;
  return ((year - baseYear) % 60 + 60) % 60;
}

// ============================================
// 핵심 계산 함수
// ============================================

/**
 * 납음오행 국수 계산
 * 생년의 60갑자로부터 계산
 */
function calculateElementBureau(year: number): ElementBureau {
  const ganZhiIndex = calculateGanZhiIndex(year);
  const nayinGroup = Math.floor(ganZhiIndex / 10) % 10;

  return NAYIN_TABLE[nayinGroup] || '水二局';
}

/**
 * 명궁(命宮) 위치 계산
 *
 * 규칙:
 * 1. 寅宮에서 시작하여 생월까지 순행
 * 2. 그 자리에서 子시를 일으켜 생시까지 역행
 */
function calculateLifePalace(birthMonth: number, birthHour: number): EarthlyBranch {
  // 1. 寅(index=0)에서 생월까지 순행
  let position = 0; // 寅 = index 0
  position = (position + birthMonth - 1) % 12;

  // 2. 생시의 지지 인덱스 계산 (子=4 기준)
  const hourBranch = hourToBranch(birthHour);
  const hourBranchIndexIn12 = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'].indexOf(hourBranch);

  // 3. 子시부터 생시까지 역행
  position = (position - hourBranchIndexIn12 + 12) % 12;

  return EARTHLY_BRANCHES[position];
}

/**
 * 신궁(身宮) 위치 계산
 *
 * 규칙:
 * 1. 寅宮에서 시작하여 생월까지 순행
 * 2. 그 자리에서 子시를 일으켜 생시까지 순행
 */
function calculateBodyPalace(birthMonth: number, birthHour: number): EarthlyBranch {
  // 1. 寅에서 생월까지 순행
  let position = 0;
  position = (position + birthMonth - 1) % 12;

  // 2. 생시의 지지 인덱스
  const hourBranch = hourToBranch(birthHour);
  const hourBranchIndexIn12 = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'].indexOf(hourBranch);

  // 3. 子시부터 생시까지 순행
  position = (position + hourBranchIndexIn12) % 12;

  return EARTHLY_BRANCHES[position];
}

/**
 * 자미성 위치 계산
 *
 * 규칙: 생일과 생시의 조합으로 결정
 * (간소화된 계산 - 실제로는 복잡한 테이블 필요)
 */
function calculateZiweiPosition(
  birthDay: number,
  birthHour: number,
  _bureau: ElementBureau,
): EarthlyBranch {
  // 국수에 따른 기본 오프셋
  const bureauOffset: Record<ElementBureau, number> = {
    '水二局': 0,
    '木三局': 2,
    '金四局': 4,
    '土五局': 5,
    '火六局': 6,
  };

  const offset = bureauOffset[_bureau];
  const dayFactor = (birthDay - 1) % 12;
  const hourFactor = Math.floor(birthHour / 2);

  const position = (offset + dayFactor + hourFactor) % 12;
  return EARTHLY_BRANCHES[position];
}

/**
 * 14주성 배치
 *
 * 자미성계: 자미 위치에서 시계 반대 방향으로 배치
 * 천부성계: 자미와 대칭 위치(寅申선 기준)에서 시계 방향으로 배치
 */
function placeMainStars(
  ziweiPosition: EarthlyBranch,
  _bureau: ElementBureau,
): Record<EarthlyBranch, MainStar[]> {
  const result: Record<EarthlyBranch, MainStar[]> = {} as any;

  // 모든 지지에 빈 배열 초기화
  EARTHLY_BRANCHES.forEach(branch => {
    result[branch] = [];
  });

  const ziweiIndex = getBranchIndex(ziweiPosition);

  // 자미성계 배치 (시계 반대 방향)
  ZIWEI_STARS.forEach((star, i) => {
    const targetIndex = (ziweiIndex - i + 12) % 12;
    result[EARTHLY_BRANCHES[targetIndex]].push(star);
  });

  // 천부 위치 계산 (자미와 대칭 - 寅申선 기준)
  // 寅=0, 申=6 이므로 대칭 공식: (6 - ziweiIndex + 12) % 12
  const tianfuIndex = (6 - ziweiIndex + 12) % 12;

  // 천부성계 배치 (시계 방향)
  TIANFU_STARS.forEach((star, i) => {
    const targetIndex = (tianfuIndex + i) % 12;
    result[EARTHLY_BRANCHES[targetIndex]].push(star);
  });

  return result;
}

/**
 * 보조성 배치 (간소화)
 * 실제로는 100+ 보조성 배치 필요
 */
function placeAuxiliaryStars(
  lifePalaceBranch: EarthlyBranch,
  birthYear: number,
  birthMonth: number,
  _birthDay: number,
): Record<EarthlyBranch, AuxiliaryStar[]> {
  const result: Record<EarthlyBranch, AuxiliaryStar[]> = {} as any;

  EARTHLY_BRANCHES.forEach(branch => {
    result[branch] = [];
  });

  const lifePalaceIndex = getBranchIndex(lifePalaceBranch);

  // 문창 (명궁에서 생시에 따라 배치)
  const wenChangIndex = (lifePalaceIndex + birthMonth) % 12;
  result[EARTHLY_BRANCHES[wenChangIndex]].push('文昌');

  // 문곡 (문창 대칭)
  const wenQuIndex = (lifePalaceIndex - birthMonth + 12) % 12;
  result[EARTHLY_BRANCHES[wenQuIndex]].push('文曲');

  // 좌보우필 (명궁 기준)
  result[EARTHLY_BRANCHES[(lifePalaceIndex + 1) % 12]].push('左輔');
  result[EARTHLY_BRANCHES[(lifePalaceIndex - 1 + 12) % 12]].push('右弼');

  // 천괴천월
  result[EARTHLY_BRANCHES[(lifePalaceIndex + 2) % 12]].push('天魁');
  result[EARTHLY_BRANCHES[(lifePalaceIndex + 3) % 12]].push('天鉞');

  // 녹존 (생년 천간으로 배치 - 간략화)
  const ganIndex = birthYear % 10;
  result[EARTHLY_BRANCHES[(lifePalaceIndex + ganIndex) % 12]].push('祿存');

  // 화성, 령성 (생년 지지로 배치)
  const zhiIndex = birthYear % 12;
  result[EARTHLY_BRANCHES[(zhiIndex + 1) % 12]].push('火星');
  result[EARTHLY_BRANCHES[(zhiIndex + 2) % 12]].push('鈴星');

  return result;
}

/**
 * 12궁위 생성
 */
function createPalaces(
  lifePalaceBranch: EarthlyBranch,
  mainStarPlacements: Record<EarthlyBranch, MainStar[]>,
  auxiliaryStarPlacements: Record<EarthlyBranch, AuxiliaryStar[]>,
): Record<Palace, PalaceInfo> {
  const result: Record<Palace, PalaceInfo> = {} as any;

  const lifePalaceIndex = getBranchIndex(lifePalaceBranch);

  PALACE_NAMES.forEach((palaceName, i) => {
    const branchIndex = (lifePalaceIndex + i) % 12;
    const branch = EARTHLY_BRANCHES[branchIndex];

    const mainStars = mainStarPlacements[branch] || [];
    const auxiliaryStars = auxiliaryStarPlacements[branch] || [];

    // 길흉 점수 계산 (별자리 기반)
    const luckyScore = calculatePalaceLuckyScore(mainStars, auxiliaryStars);

    // 길흉 상태 결정
    const strength = luckyScore >= 80 ? PalaceStrength.PROSPEROUS :
                     luckyScore >= 60 ? PalaceStrength.FAVORABLE :
                     luckyScore >= 40 ? PalaceStrength.FLAT :
                     luckyScore >= 20 ? PalaceStrength.WEAK :
                     PalaceStrength.UNFAVORABLE;

    result[palaceName] = {
      name: palaceName,
      branch,
      mainStars,
      auxiliaryStars,
      strength,
      luckyScore,
      description: generatePalaceDescription(palaceName, mainStars, auxiliaryStars),
      keywords: generatePalaceKeywords(palaceName, mainStars),
    };
  });

  return result;
}

/**
 * 궁위 길흉 점수 계산
 */
function calculatePalaceLuckyScore(mainStars: MainStar[], auxiliaryStars: AuxiliaryStar[]): number {
  let score = 50; // 기본 점수

  // 주성 점수
  const starScores: Record<string, number> = {
    '紫微': 20, '天機': 10, '太陽': 15, '武曲': 12,
    '天同': 15, '廉貞': 8, '天府': 18, '太陰': 12,
    '貪狼': 10, '巨門': 5, '天相': 14, '天梁': 16,
    '七殺': 7, '破軍': 6,
  };

  mainStars.forEach(star => {
    score += starScores[star] || 5;
  });

  // 보조성 점수
  const auxScores: Record<string, number> = {
    '文昌': 5, '文曲': 5, '左輔': 8, '右弼': 8,
    '天魁': 7, '天鉞': 7, '祿存': 10,
    '擎羊': -5, '陀羅': -5, '火星': -4, '鈴星': -4,
    '地劫': -6, '地空': -6, '化忌': -8,
    '化祿': 10, '化權': 8, '化科': 6,
  };

  auxiliaryStars.forEach(star => {
    score += auxScores[star] || 0;
  });

  return Math.max(0, Math.min(100, score));
}

/**
 * 궁위 설명 생성
 */
function generatePalaceDescription(
  palace: Palace,
  mainStars: MainStar[],
  _auxStars: AuxiliaryStar[],
): string {
  const descriptions: Record<Palace, string> = {
    '命宮': '당신의 전반적인 성격과 운명을 나타냅니다.',
    '兄弟宮': '형제자매와의 관계, 친구운을 나타냅니다.',
    '夫妻宮': '배우자와의 인연, 결혼운을 나타냅니다.',
    '子女宮': '자녀운, 자녀와의 관계를 나타냅니다.',
    '財帛宮': '재물운, 금전 관리 능력을 나타냅니다.',
    '疾厄宮': '건강 상태, 체질적 특성을 나타냅니다.',
    '遷移宮': '외출운, 이동 및 변화운을 나타냅니다.',
    '奴僕宮': '부하, 친구의 도움을 나타냅니다.',
    '官祿宮': '직업, 사업운, 명예를 나타냅니다.',
    '田宅宮': '부동산운, 가정환경을 나타냅니다.',
    '福德宮': '정신세계, 취미, 여가를 나타냅니다.',
    '父母宮': '부모, 상사와의 관계를 나타냅니다.',
  };

  let desc = descriptions[palace];

  if (mainStars.length > 0) {
    desc += ` ${mainStars[0]}이(가) 자리하여 영향을 미칩니다.`;
  }

  return desc;
}

/**
 * 궁위 키워드 생성
 */
function generatePalaceKeywords(palace: Palace, mainStars: MainStar[]): string[] {
  const keywords = [];

  // 별자리별 키워드
  const starKeywords: Record<string, string[]> = {
    '紫微': ['리더십', '권위', '고귀함'],
    '天機': ['지혜', '계획', '변화'],
    '太陽': ['명예', '권력', '외향적'],
    '武曲': ['재물', '용기', '결단력'],
    '天同': ['복덕', '평화', '안정'],
    '廉貞': ['정열', '변화', '활동적'],
    '天府': ['재물', '안정', '보수적'],
    '太陰': ['모성', '재능', '예술'],
    '貪狼': ['욕망', '인기', '다재다능'],
    '巨門': ['언변', '분쟁', '탐구'],
    '天相': ['보좌', '조화', '외교'],
    '天梁': ['수명', '해결', '노련함'],
    '七殺': ['권력', '고독', '강함'],
    '破軍': ['파괴', '혁신', '변화'],
  };

  mainStars.forEach(star => {
    if (starKeywords[star]) {
      keywords.push(...starKeywords[star]);
    }
  });

  return keywords.slice(0, 5); // 최대 5개
}

/**
 * 대운 계산 (10년 단위)
 */
function calculateMajorFortunes(
  lifePalaceBranch: EarthlyBranch,
  bureau: ElementBureau,
  birthYear: number,
  gender?: 'male' | 'female',
): MajorFortune[] {
  const fortunes: MajorFortune[] = [];

  // 국수에 따른 대운 시작 나이
  const startAges: Record<ElementBureau, number> = {
    '水二局': 2,
    '木三局': 3,
    '金四局': 4,
    '土五局': 5,
    '火六局': 6,
  };

  const startAge = startAges[bureau];

  // 순행/역행 결정 (생년 음양 + 성별)
  const yearGan = birthYear % 10;
  const isYangYear = yearGan % 2 === 0; // 甲丙戊庚壬 = 양

  // 남자+양년 또는 여자+음년 = 순행
  const isForward = (gender === 'male' && isYangYear) || (gender === 'female' && !isYangYear);

  const lifePalaceIndex = getBranchIndex(lifePalaceBranch);

  // 대운 8단계 생성
  for (let i = 0; i < 8; i++) {
    const age = startAge + i * 10;
    const direction = isForward ? 1 : -1;
    const palaceIndex = (lifePalaceIndex + i * direction + 12) % 12;
    const palaceBranch = EARTHLY_BRANCHES[palaceIndex];
    const palace = PALACE_NAMES[i % 12];

    fortunes.push({
      startAge: age,
      endAge: age + 9,
      palace,
      branch: palaceBranch,
      direction: isForward ? 'forward' : 'backward',
      description: `${age}세부터 ${age + 9}세까지의 운세`,
      luckyScore: 50 + Math.random() * 30,
      keywords: ['성장', '발전', '도전'],
    });
  }

  return fortunes;
}

/**
 * 유년운 계산
 */
function calculateYearlyFortune(
  lifePalaceBranch: EarthlyBranch,
  currentYear: number,
  birthYear: number,
): YearlyFortune {
  const age = currentYear - birthYear + 1;
  const lifePalaceIndex = getBranchIndex(lifePalaceBranch);

  // 유년궁 = 명궁에서 나이만큼 순행
  const yearlyPalaceIndex = (lifePalaceIndex + age - 1) % 12;
  const yearlyBranch = EARTHLY_BRANCHES[yearlyPalaceIndex];
  const yearlyPalace = PALACE_NAMES[yearlyPalaceIndex % 12];

  return {
    year: currentYear,
    age,
    palace: yearlyPalace,
    branch: yearlyBranch,
    description: `${currentYear}년 ${age}세의 운세`,
    luckyScore: 50 + Math.random() * 30,
    keywords: ['기회', '변화', '성장'],
  };
}

/**
 * 종합 운세 생성
 */
function generateOverallFortune(palaces: Record<Palace, PalaceInfo>): ZiweiChart['overallFortune'] {
  const lifePalace = palaces['命宮'];
  const wealthPalace = palaces['財帛宮'];
  const careerPalace = palaces['官祿宮'];

  const avgScore = Math.round(
    (lifePalace.luckyScore + wealthPalace.luckyScore + careerPalace.luckyScore) / 3,
  );

  const level = avgScore >= 80 ? 'excellent' :
                avgScore >= 60 ? 'good' :
                avgScore >= 40 ? 'neutral' :
                avgScore >= 20 ? 'bad' :
                'terrible';

  return {
    score: avgScore,
    level,
    summary: '자미두수 명반 분석 결과입니다. 14주성의 배치를 통해 전반적인 운세를 분석했습니다.',
    strengths: ['명궁의 길성 배치', '재물궁의 안정적 구조'],
    weaknesses: ['일부 궁위의 흉성 영향'],
    advice: ['길한 방위로 이동하세요', '재물 관리에 주의하세요'],
    luckyElements: ['긍정적 사고', '적극적 행동'],
    unluckyElements: ['과도한 욕심', '성급한 판단'],
  };
}

// ============================================
// 메인 계산 함수
// ============================================

/**
 * 자미두수 명반 계산 (메인 함수)
 */
export function calculateZiweiChart(birthInfo: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute?: number;
  lunar?: boolean;
  gender?: 'male' | 'female';
}): ZiweiChart {
  // 1. 납음오행 국수 계산
  const bureau = calculateElementBureau(birthInfo.year);

  // 2. 명궁, 신궁 위치 계산
  const lifePalaceBranch = calculateLifePalace(birthInfo.month, birthInfo.hour);
  const bodyPalaceBranch = calculateBodyPalace(birthInfo.month, birthInfo.hour);

  // 3. 자미성 위치 계산
  const ziweiPosition = calculateZiweiPosition(birthInfo.day, birthInfo.hour, bureau);

  // 4. 14주성 배치
  const mainStarPlacements = placeMainStars(ziweiPosition, bureau);

  // 5. 보조성 배치
  const auxiliaryStarPlacements = placeAuxiliaryStars(
    lifePalaceBranch,
    birthInfo.year,
    birthInfo.month,
    birthInfo.day,
  );

  // 6. 12궁위 생성
  const palaces = createPalaces(lifePalaceBranch, mainStarPlacements, auxiliaryStarPlacements);

  // 7. 대운 계산
  const majorFortunes = calculateMajorFortunes(
    lifePalaceBranch,
    bureau,
    birthInfo.year,
    birthInfo.gender,
  );

  // 8. 유년운 계산
  const currentYear = new Date().getFullYear();
  const yearlyFortune = calculateYearlyFortune(lifePalaceBranch, currentYear, birthInfo.year);

  // 9. 종합 운세 생성
  const overallFortune = generateOverallFortune(palaces);

  // 10. 주요 특성 추출
  const characteristics = {
    personality: palaces['命宮'].keywords,
    career: palaces['官祿宮'].keywords,
    wealth: palaces['財帛宮'].keywords,
    health: palaces['疾厄宮'].keywords,
    relationships: palaces['兄弟宮'].keywords,
  };

  return {
    birthInfo: {
      ...birthInfo,
      lunar: birthInfo.lunar || false,
    },
    bureau,
    palaces,
    lifePalaceBranch,
    bodyPalaceBranch,
    majorFortunes,
    yearlyFortune,
    overallFortune,
    characteristics,
  };
}
