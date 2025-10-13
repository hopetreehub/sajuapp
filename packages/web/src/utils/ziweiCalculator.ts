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
  MajorFortune,
  YearlyFortune,
} from '@/types/ziwei';
import { PalaceStrength } from '@/types/ziwei';
import { getAuxiliaryStarScore } from '@/data/ziweiAuxiliaryStars';
import {
  calculateTransformations,
  findTransformation,
  TRANSFORMATION_SCORE_ADJUSTMENT,
  type TransformationResult,
} from '@/data/ziweiTransformations';

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
 * 보조성 배치 (고도화 버전)
 * 50+ 보조성 배치 알고리즘
 */
function placeAuxiliaryStars(
  lifePalaceBranch: EarthlyBranch,
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHour: number,
): Record<EarthlyBranch, AuxiliaryStar[]> {
  const result: Record<EarthlyBranch, AuxiliaryStar[]> = {} as any;

  // 모든 지지에 빈 배열 초기화
  EARTHLY_BRANCHES.forEach(branch => {
    result[branch] = [];
  });

  const lifePalaceIndex = getBranchIndex(lifePalaceBranch);
  const yearGan = birthYear % 10; // 천간 인덱스 (0-9)
  const yearZhi = birthYear % 12; // 지지 인덱스 (0-11)
  const monthZhi = (birthMonth + 1) % 12; // 월지 인덱스

  // ========== 육길성 (六吉星) ==========

  // 문창 (文昌) - 생시에 따라 배치
  const wenChangIndex = (lifePalaceIndex + birthHour / 2) % 12;
  result[EARTHLY_BRANCHES[Math.floor(wenChangIndex)]].push('文昌');

  // 문곡 (文曲) - 문창 대칭
  const wenQuIndex = (lifePalaceIndex - birthHour / 2 + 12) % 12;
  result[EARTHLY_BRANCHES[Math.floor(wenQuIndex)]].push('文曲');

  // 좌보우필 (명궁 기준)
  result[EARTHLY_BRANCHES[(lifePalaceIndex + 1) % 12]].push('左輔');
  result[EARTHLY_BRANCHES[(lifePalaceIndex - 1 + 12) % 12]].push('右弼');

  // 천괴천월 (생년 천간으로 배치)
  const tianKuiTable = [1, 0, 11, 11, 1, 0, 7, 8, 7, 8]; // 천간별 천괴 위치
  const tianYueTable = [7, 8, 2, 2, 4, 4, 10, 10, 4, 4]; // 천간별 천월 위치
  result[EARTHLY_BRANCHES[(lifePalaceIndex + tianKuiTable[yearGan]) % 12]].push('天魁');
  result[EARTHLY_BRANCHES[(lifePalaceIndex + tianYueTable[yearGan]) % 12]].push('天鉞');

  // 녹존 (祿存) - 생년 천간으로 배치
  const luCunTable = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0]; // 천간별 녹존 위치
  result[EARTHLY_BRANCHES[(lifePalaceIndex + luCunTable[yearGan]) % 12]].push('祿存');

  // ========== 육흉성 (六凶星) ==========

  // 경양 (擎羊) - 녹존 다음 궁
  const qingYangIndex = (lifePalaceIndex + luCunTable[yearGan] + 1) % 12;
  result[EARTHLY_BRANCHES[qingYangIndex]].push('擎羊');

  // 타라 (陀羅) - 녹존 전 궁
  const tuoLuoIndex = (lifePalaceIndex + luCunTable[yearGan] - 1 + 12) % 12;
  result[EARTHLY_BRANCHES[tuoLuoIndex]].push('陀羅');

  // 화성, 령성 (생년 지지로 배치)
  const huoXingTable = [2, 3, 1, 0, 11, 9, 8, 7, 6, 5, 4, 3]; // 지지별 화성 위치
  const lingXingTable = [3, 2, 4, 5, 6, 8, 9, 10, 11, 0, 1, 2]; // 지지별 령성 위치
  result[EARTHLY_BRANCHES[(lifePalaceIndex + huoXingTable[yearZhi]) % 12]].push('火星');
  result[EARTHLY_BRANCHES[(lifePalaceIndex + lingXingTable[yearZhi]) % 12]].push('鈴星');

  // 지겁 (地劫) - 연지로 배치
  const diJieIndex = (lifePalaceIndex + (11 - yearZhi) + 12) % 12;
  result[EARTHLY_BRANCHES[diJieIndex]].push('地劫');

  // 지공 (地空) - 지겁 대칭
  const diKongIndex = (lifePalaceIndex + yearZhi + 1) % 12;
  result[EARTHLY_BRANCHES[diKongIndex]].push('地空');

  // ========== 일반 보조성 ==========

  // 천마 (天馬) - 생년 지지로 배치
  const tianMaTable = [2, 11, 8, 5, 2, 11, 8, 5, 2, 11, 8, 5];
  result[EARTHLY_BRANCHES[(lifePalaceIndex + tianMaTable[yearZhi]) % 12]].push('天馬');

  // 홍란 (紅鸞) - 묘궁 기준
  const hongLuanIndex = (3 - yearZhi + 12) % 12; // 卯궁(3)에서 역행
  result[EARTHLY_BRANCHES[hongLuanIndex]].push('紅鸞');

  // 천희 (天喜) - 홍란 대궁
  const tianXiIndex = (hongLuanIndex + 6) % 12;
  result[EARTHLY_BRANCHES[tianXiIndex]].push('天喜');

  // 천공 (天空)
  result[EARTHLY_BRANCHES[(lifePalaceIndex + yearZhi) % 12]].push('天空');

  // 천형 (天刑) - 자궁에서 년지순포
  const tianXingIndex = (10 + yearZhi) % 12;
  result[EARTHLY_BRANCHES[tianXingIndex]].push('天刑');

  // 천요 (天姚) - 대충 배치
  const tianYaoIndex = (7 - yearZhi + 12) % 12;
  result[EARTHLY_BRANCHES[tianYaoIndex]].push('天姚');

  // 천곡, 천허 (天哭, 天虛)
  result[EARTHLY_BRANCHES[(lifePalaceIndex + 5) % 12]].push('天哭');
  result[EARTHLY_BRANCHES[(lifePalaceIndex + 11) % 12]].push('天虛');

  // 용지, 봉각 (龍池, 鳳閣)
  result[EARTHLY_BRANCHES[(lifePalaceIndex + 4) % 12]].push('龍池');
  result[EARTHLY_BRANCHES[(lifePalaceIndex + 10) % 12]].push('鳳閣');

  // ========== 연지성 (年支星) ==========
  const yearBranchStars: Record<number, AuxiliaryStar[]> = {
    0: ['天官'], // 子
    1: ['天福'], // 丑
    2: ['天廚'], // 寅
    3: ['天才'], // 卯
    4: ['天壽'], // 辰
    5: ['天官'], // 巳
    6: ['天福'], // 午
    7: ['天廚'], // 未
    8: ['天才'], // 申
    9: ['天壽'], // 酉
    10: ['天官'], // 戌
    11: ['天福'], // 亥
  };

  const yearBranchIndex = yearZhi;
  (yearBranchStars[yearBranchIndex] || []).forEach(star => {
    result[EARTHLY_BRANCHES[yearBranchIndex]].push(star);
  });

  // ========== 월지성 (月支星) ==========
  const monthBranchStars: Record<number, AuxiliaryStar[]> = {
    0: ['天月'], // 子
    1: ['陰煞'], // 丑
    2: ['天月'], // 寅
    3: ['陰煞'], // 卯
    4: ['天月'], // 辰
    5: ['陰煞'], // 巳
    6: ['天月'], // 午
    7: ['陰煞'], // 未
    8: ['天月'], // 申
    9: ['陰煞'], // 酉
    10: ['天月'], // 戌
    11: ['陰煞'], // 亥
  };

  (monthBranchStars[monthZhi] || []).forEach(star => {
    result[EARTHLY_BRANCHES[monthZhi]].push(star);
  });

  // ========== 시지성 (時支星) ==========
  const hourBranch = hourToBranch(birthHour);
  const hourBranchIndex = getBranchIndex(hourBranch);
  result[EARTHLY_BRANCHES[hourBranchIndex]].push('天貴');
  result[EARTHLY_BRANCHES[(hourBranchIndex + 6) % 12]].push('天傷');

  // ========== 기타 보조성 ==========
  // 대보, 봉고, 은광 등은 간략화하여 랜덤 배치
  const otherStars: AuxiliaryStar[] = ['台輔', '封誥', '恩光', '天巫', '天德', '月德', '解神'];
  otherStars.forEach((star, i) => {
    const randomIndex = (lifePalaceIndex + yearGan + i * 2) % 12;
    result[EARTHLY_BRANCHES[randomIndex]].push(star);
  });

  // 고신, 과숙 (孤辰, 寡宿)
  const guChenTable = [2, 2, 5, 5, 5, 8, 8, 8, 11, 11, 11, 2];
  const guaSuTable = [10, 10, 1, 1, 1, 4, 4, 4, 7, 7, 7, 10];
  result[EARTHLY_BRANCHES[(lifePalaceIndex + guChenTable[yearZhi]) % 12]].push('孤辰');
  result[EARTHLY_BRANCHES[(lifePalaceIndex + guaSuTable[yearZhi]) % 12]].push('寡宿');

  // 비렴, 파쇄 (蜚廉, 破碎)
  result[EARTHLY_BRANCHES[(lifePalaceIndex + yearZhi + 5) % 12]].push('蜚廉');
  result[EARTHLY_BRANCHES[(lifePalaceIndex + yearZhi + 9) % 12]].push('破碎');

  // 화개, 함지 (華蓋, 咸池)
  result[EARTHLY_BRANCHES[(lifePalaceIndex + yearZhi + 4) % 12]].push('華蓋');
  result[EARTHLY_BRANCHES[(lifePalaceIndex + yearZhi - 1 + 12) % 12]].push('咸池');

  return result;
}

/**
 * 12궁위 생성 (사화성 포함)
 */
function createPalaces(
  lifePalaceBranch: EarthlyBranch,
  mainStarPlacements: Record<EarthlyBranch, MainStar[]>,
  auxiliaryStarPlacements: Record<EarthlyBranch, AuxiliaryStar[]>,
  birthYear: number,
): Record<Palace, PalaceInfo> {
  const result: Record<Palace, PalaceInfo> = {} as any;

  const lifePalaceIndex = getBranchIndex(lifePalaceBranch);

  // 사화성 계산
  const transformations = calculateTransformations(birthYear);

  PALACE_NAMES.forEach((palaceName, i) => {
    const branchIndex = (lifePalaceIndex + i) % 12;
    const branch = EARTHLY_BRANCHES[branchIndex];

    const mainStars = mainStarPlacements[branch] || [];
    const auxiliaryStars = [...(auxiliaryStarPlacements[branch] || [])];

    // 주성에 사화성 추가
    mainStars.forEach(mainStar => {
      const transformation = findTransformation(mainStar, transformations);
      if (transformation) {
        // 사화성을 보조성 배열에 추가
        auxiliaryStars.push(transformation);
      }
    });

    // 길흉 점수 계산 (사화성 포함)
    const luckyScore = calculatePalaceLuckyScore(mainStars, auxiliaryStars, transformations);

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
 * 데이터 파일의 점수를 활용하여 정확도 향상 (사화성 포함)
 */
function calculatePalaceLuckyScore(
  mainStars: MainStar[],
  auxiliaryStars: AuxiliaryStar[],
  transformations: TransformationResult[],
): number {
  let score = 50; // 기본 점수

  // 주성 점수
  const starScores: Record<string, number> = {
    '紫微': 20, '天機': 10, '太陽': 15, '武曲': 12,
    '天同': 15, '廉貞': 8, '天府': 18, '太陰': 12,
    '貪狼': 10, '巨門': 5, '天相': 14, '天梁': 16,
    '七殺': 7, '破軍': 6,
  };

  // 주성 기본 점수 추가
  mainStars.forEach(star => {
    score += starScores[star] || 5;

    // 사화성 보너스 점수
    const transformation = findTransformation(star, transformations);
    if (transformation) {
      score += TRANSFORMATION_SCORE_ADJUSTMENT[transformation];
    }
  });

  // 보조성 점수 - 데이터 파일에서 가져오기
  auxiliaryStars.forEach(star => {
    const starScore = getAuxiliaryStarScore(star);
    score += starScore;
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
  const keywords: string[] = [];

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
 * 대운 계산 (10년 단위) - 실제 궁위 점수 기반
 */
function calculateMajorFortunes(
  lifePalaceBranch: EarthlyBranch,
  bureau: ElementBureau,
  birthYear: number,
  gender: 'male' | 'female' | undefined,
  palaces: Record<Palace, PalaceInfo>,
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
    const palace = PALACE_NAMES[palaceIndex % 12];

    // 실제 궁위 정보 가져오기
    const palaceInfo = palaces[palace];
    const luckyScore = palaceInfo ? palaceInfo.luckyScore : 50;

    // 대운 해석 생성
    const description = generateMajorFortuneDescription(
      age,
      palace,
      palaceInfo,
      isForward,
    );

    // 대운 키워드 생성
    const keywords = palaceInfo
      ? palaceInfo.keywords.slice(0, 3)
      : ['변화', '성장', '도전'];

    fortunes.push({
      startAge: age,
      endAge: age + 9,
      palace,
      branch: palaceBranch,
      direction: isForward ? 'forward' : 'backward',
      description,
      luckyScore,
      keywords,
    });
  }

  return fortunes;
}

/**
 * 대운 해석 생성
 */
function generateMajorFortuneDescription(
  startAge: number,
  palace: Palace,
  palaceInfo: PalaceInfo | undefined,
  isForward: boolean,
): string {
  if (!palaceInfo) {
    return `${startAge}세부터 ${startAge + 9}세까지의 운세입니다.`;
  }

  const scoreLevel =
    palaceInfo.luckyScore >= 80
      ? '매우 좋은'
      : palaceInfo.luckyScore >= 60
        ? '좋은'
        : palaceInfo.luckyScore >= 40
          ? '보통의'
          : palaceInfo.luckyScore >= 20
            ? '어려운'
            : '매우 어려운';

  const palaceDesc: Record<Palace, string> = {
    '命宮': '인생의 기본 운세',
    '兄弟宮': '형제자매와 친구 관계',
    '夫妻宮': '배우자와 결혼 생활',
    '子女宮': '자녀와의 관계',
    '財帛宮': '재물과 수입',
    '疾厄宮': '건강과 체력',
    '遷移宮': '이동과 변화',
    '奴僕宮': '부하와 친구의 도움',
    '官祿宮': '직업과 명예',
    '田宅宮': '부동산과 가정',
    '福德宮': '정신적 안정과 복',
    '父母宮': '부모와 상사의 도움',
  };

  return `${startAge}세~${startAge + 9}세는 ${palace}(${palaceDesc[palace]})이 주관하는 시기로 ${scoreLevel} 운세입니다. ${palaceInfo.mainStars.join(', ') || '주성 없음'}의 영향을 받습니다.`;
}

/**
 * 유년운 계산 - 실제 궁위 점수 기반
 */
function calculateYearlyFortune(
  lifePalaceBranch: EarthlyBranch,
  currentYear: number,
  birthYear: number,
  palaces: Record<Palace, PalaceInfo>,
): YearlyFortune {
  const age = currentYear - birthYear + 1;
  const lifePalaceIndex = getBranchIndex(lifePalaceBranch);

  // 유년궁 = 명궁에서 나이만큼 순행
  const yearlyPalaceIndex = (lifePalaceIndex + age - 1) % 12;
  const yearlyBranch = EARTHLY_BRANCHES[yearlyPalaceIndex];
  const yearlyPalace = PALACE_NAMES[yearlyPalaceIndex % 12];

  // 실제 궁위 정보 가져오기
  const palaceInfo = palaces[yearlyPalace];
  const luckyScore = palaceInfo ? palaceInfo.luckyScore : 50;

  // 유년운 해석 생성
  const description = generateYearlyFortuneDescription(
    currentYear,
    age,
    yearlyPalace,
    palaceInfo,
  );

  // 유년운 키워드 생성
  const keywords = palaceInfo
    ? palaceInfo.keywords.slice(0, 3)
    : ['기회', '변화', '성장'];

  return {
    year: currentYear,
    age,
    palace: yearlyPalace,
    branch: yearlyBranch,
    description,
    luckyScore,
    keywords,
  };
}

/**
 * 유년운 해석 생성
 */
function generateYearlyFortuneDescription(
  year: number,
  age: number,
  palace: Palace,
  palaceInfo: PalaceInfo | undefined,
): string {
  if (!palaceInfo) {
    return `${year}년 ${age}세의 운세입니다.`;
  }

  const scoreLevel =
    palaceInfo.luckyScore >= 80
      ? '매우 좋습니다'
      : palaceInfo.luckyScore >= 60
        ? '좋습니다'
        : palaceInfo.luckyScore >= 40
          ? '보통입니다'
          : palaceInfo.luckyScore >= 20
            ? '주의가 필요합니다'
            : '매우 조심해야 합니다';

  const palaceInfluence: Record<Palace, string> = {
    '命宮': '자신의 운명에 집중하는',
    '兄弟宮': '형제와 친구의 도움을 받는',
    '夫妻宮': '배우자와 관계가 중요한',
    '子女宮': '자녀와의 인연이 있는',
    '財帛宮': '재물과 수입이 주목받는',
    '疾厄宮': '건강 관리가 중요한',
    '遷移宮': '변화와 이동이 많은',
    '奴僕宮': '사람들의 도움을 받는',
    '官祿宮': '직업과 명예가 빛나는',
    '田宅宮': '가정과 부동산이 안정되는',
    '福德宮': '정신적으로 충만한',
    '父母宮': '부모와 상사의 은혜를 받는',
  };

  return `${year}년 (${age}세)은 ${palace}의 영향을 받아 ${palaceInfluence[palace]} 해입니다. 올해 운세는 ${scoreLevel}.`;
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
    birthInfo.hour,
  );

  // 6. 12궁위 생성 (사화성 포함)
  const palaces = createPalaces(
    lifePalaceBranch,
    mainStarPlacements,
    auxiliaryStarPlacements,
    birthInfo.year,
  );

  // 7. 대운 계산 (실제 궁위 정보 기반)
  const majorFortunes = calculateMajorFortunes(
    lifePalaceBranch,
    bureau,
    birthInfo.year,
    birthInfo.gender,
    palaces,
  );

  // 8. 유년운 계산 (실제 궁위 정보 기반)
  const currentYear = new Date().getFullYear();
  const yearlyFortune = calculateYearlyFortune(
    lifePalaceBranch,
    currentYear,
    birthInfo.year,
    palaces,
  );

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
