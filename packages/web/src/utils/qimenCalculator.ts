/**
 * 귀문둔갑(奇門遁甲) 계산 엔진
 *
 * 국(局) 계산, 구궁 배치, 길흉 판단 등 핵심 로직
 * @author Claude Code
 * @version 1.0.0
 */

import type {
  QimenChart,
  QimenCalculationOptions,
  Palace,
  PalaceInfo,
  Gate,
  Star,
  Spirit,
  Fortune,
  YinYang,
} from '@/types/qimen';

import {
  GATES,
  STARS,
  SPIRITS,
  SOLAR_TERMS,
  PALACE_TO_DIRECTION,
  calculateCombinedNature,
} from '@/data/qimenDunjiaData';

// 사주 계산기에서 천간지지 가져오기
import { CheonGan, JiJi } from '@/utils/sajuScoreCalculator';

// ============================================
// 천간지지 배열
// ============================================

const CHEONGAN: CheonGan[] = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const JIJI: JiJi[] = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

// ============================================
// 팔문 순서 (고정)
// ============================================

const GATE_ORDER: Gate[] = ['휴문', '생문', '상문', '두문', '경문', '사문', '놀문', '개문'];

// ============================================
// 구성 순서 (고정)
// ============================================

const STAR_ORDER: Star[] = [
  '천봉', '천임', '천충', '천보', '천영', '천예', '천주', '천심', '천금',
];

// ============================================
// 팔신 순서 (고정)
// ============================================

const SPIRIT_ORDER: Spirit[] = [
  '직부', '등사', '태음', '육합', '백호', '현무', '구지', '구천',
];

// ============================================
// 주요 계산 함수
// ============================================

/**
 * 귀문둔갑 차트 계산 (메인 함수)
 */
export function calculateQimenChart(
  options: QimenCalculationOptions = {},
): QimenChart {
  const dateTime = options.dateTime || new Date();

  // 1. 절기 계산
  const solarTerm = getSolarTerm(dateTime);

  // 2. 음둔/양둔 결정
  const yinYang = solarTerm.yinYang;

  // 3. 국(局) 번호
  const ju = solarTerm.ju;

  // 4. 시간 간지 계산
  const hourGanZhi = getHourGanZhi(dateTime);

  // 5. 일간 계산
  const dayGan = getDayGan(dateTime);

  // 6. 구궁 배치 계산
  const palaces = arrangePalaces(ju, yinYang, hourGanZhi, dateTime);

  // 7. 전체 길흉 평가
  const overallFortune = evaluateOverallFortune(palaces);

  return {
    dateTime,
    ju,
    yinYang,
    solarTerm: {
      name: solarTerm.name,
      index: solarTerm.index,
      isStart: isStartOfSolarTerm(dateTime, solarTerm),
    },
    hourGanZhi,
    dayGan,
    palaces,
    overallFortune,
  };
}

/**
 * 절기 계산
 */
function getSolarTerm(date: Date) {
  const month = date.getMonth() + 1; // 0-based → 1-based
  const day = date.getDate();

  // 해당 월의 절기들 찾기
  const monthTerms = SOLAR_TERMS.filter((t) => t.month === month);

  // 날짜로 정확한 절기 결정
  let currentTerm = monthTerms[0];

  for (const term of monthTerms) {
    if (day >= term.approxDay) {
      currentTerm = term;
    }
  }

  // 만약 월초인데 이전 달 절기가 더 가까우면 이전 절기 사용
  if (day < 5 && monthTerms.length > 0) {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevTerms = SOLAR_TERMS.filter((t) => t.month === prevMonth);
    if (prevTerms.length > 0) {
      const lastPrevTerm = prevTerms[prevTerms.length - 1];
      if (Math.abs(day - lastPrevTerm.approxDay) < Math.abs(day - currentTerm.approxDay)) {
        currentTerm = lastPrevTerm;
      }
    }
  }

  return currentTerm;
}

/**
 * 절기 시작일 여부 확인
 */
function isStartOfSolarTerm(date: Date, term: typeof SOLAR_TERMS[0]): boolean {
  const day = date.getDate();
  return Math.abs(day - term.approxDay) <= 1;
}

/**
 * 시간 간지 계산
 */
function getHourGanZhi(date: Date): { gan: CheonGan; zhi: JiJi } {
  const hour = date.getHours();

  // 시지(時支) 결정 (2시간 단위)
  const jiIndex = Math.floor(((hour + 1) % 24) / 2);
  const zhi = JIJI[jiIndex];

  // 시간(時干) 계산 (일간에 따라 시작점이 다름)
  const dayGan = getDayGan(date);
  const dayGanIndex = CHEONGAN.indexOf(dayGan);

  // 시간 천간 공식: (일간 × 2 + 시지) % 10
  const ganIndex = (dayGanIndex * 2 + jiIndex) % 10;
  const gan = CHEONGAN[ganIndex];

  return { gan, zhi };
}

/**
 * 일간(日干) 계산
 * 간지력 기준: 1984-01-01 = 갑자일
 */
function getDayGan(date: Date): CheonGan {
  const baseDate = new Date(1984, 0, 1); // 1984-01-01
  const daysDiff = Math.floor(
    (date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  const ganIndex = ((daysDiff % 10) + 10) % 10;
  return CHEONGAN[ganIndex];
}

/**
 * 구궁 배치 계산 (핵심 로직)
 */
function arrangePalaces(
  ju: number,
  yinYang: YinYang,
  hourGanZhi: { gan: CheonGan; zhi: JiJi },
  dateTime: Date,
): QimenChart['palaces'] {
  // 기본 구궁 순서 (낙서 순서)
  const basePalaceOrder: Palace[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  // 국(局)에 따라 시작 궁 결정
  // 간단한 계산식: (ju - 1) % 9 + 1
  const startPalace = (((ju - 1) % 9) + 1) as Palace;

  // 팔문 배치
  const gatePositions = arrangeGates(startPalace, yinYang);

  // 구성 배치
  const starPositions = arrangeStars(startPalace, yinYang);

  // 팔신 배치
  const spiritPositions = arrangeSpirits(startPalace, hourGanZhi);

  // 각 궁의 정보 생성
  const palaces: QimenChart['palaces'] = {} as QimenChart['palaces'];

  for (let palace = 1; palace <= 9; palace++) {
    const p = palace as Palace;
    const gate = gatePositions[p];
    const star = starPositions[p];
    const spirit = spiritPositions[p];

    palaces[p] = createPalaceInfo(p, gate, star, spirit, hourGanZhi, dateTime);
  }

  return palaces;
}

/**
 * 팔문 배치
 */
function arrangeGates(
  startPalace: Palace,
  yinYang: YinYang,
): Record<Palace, Gate> {
  const positions: Record<Palace, Gate> = {} as Record<Palace, Gate>;

  // 간단한 순환 배치 (실제로는 더 복잡한 규칙이 있음)
  const palaceOrder: Palace[] = [1, 8, 3, 4, 9, 2, 7, 6];

  for (let i = 0; i < GATE_ORDER.length; i++) {
    const palace = palaceOrder[(i + startPalace - 1) % 8];
    positions[palace] = GATE_ORDER[i];
  }

  // 5궁은 특별 처리 (중앙은 문이 없거나 임의 배치)
  positions[5] = '휴문';

  return positions;
}

/**
 * 구성 배치
 */
function arrangeStars(
  startPalace: Palace,
  yinYang: YinYang,
): Record<Palace, Star> {
  const positions: Record<Palace, Star> = {} as Record<Palace, Star>;

  // 9개 별을 9개 궁에 순환 배치
  for (let i = 0; i < 9; i++) {
    const palace = (((i + startPalace - 1) % 9) + 1) as Palace;
    positions[palace] = STAR_ORDER[i];
  }

  return positions;
}

/**
 * 팔신 배치
 */
function arrangeSpirits(
  startPalace: Palace,
  hourGanZhi: { gan: CheonGan; zhi: JiJi },
): Record<Palace, Spirit | undefined> {
  const positions: Record<Palace, Spirit | undefined> = {} as Record<
    Palace,
    Spirit | undefined
  >;

  // 시간에 따라 시작 위치 결정
  const hourIndex = JIJI.indexOf(hourGanZhi.zhi);
  const offset = Math.floor(hourIndex / 3);

  const palaceOrder: Palace[] = [1, 8, 3, 4, 9, 2, 7, 6];

  for (let i = 0; i < SPIRIT_ORDER.length; i++) {
    const palace = palaceOrder[(i + offset) % 8];
    positions[palace] = SPIRIT_ORDER[i];
  }

  // 5궁 중앙은 신이 없음
  positions[5] = undefined;

  // 배치되지 않은 궁도 undefined
  for (let p = 1; p <= 9; p++) {
    if (!positions[p as Palace]) {
      positions[p as Palace] = undefined;
    }
  }

  return positions;
}

/**
 * 궁 정보 생성
 */
function createPalaceInfo(
  palace: Palace,
  gate: Gate,
  star: Star,
  spirit: Spirit | undefined,
  hourGanZhi: { gan: CheonGan; zhi: JiJi },
  dateTime: Date,
): PalaceInfo {
  const direction = PALACE_TO_DIRECTION[palace];

  // 길흉 판단
  const fortune = evaluateFortune(gate, star, spirit);

  // 해석 생성
  const interpretation = generateInterpretation(
    palace,
    gate,
    star,
    spirit,
    fortune,
  );

  // 추천사항 생성
  const recommendations = generateRecommendations(gate, star, spirit, fortune);

  // 주의사항 생성
  const warnings = generateWarnings(gate, star, spirit, fortune);

  return {
    palace,
    direction,
    gate,
    star,
    spirit,
    tianGan: hourGanZhi.gan,
    diZhi: hourGanZhi.zhi,
    wuXing: GATES[gate].element,
    fortune,
    interpretation,
    recommendations,
    warnings,
  };
}

/**
 * 길흉 판단
 */
function evaluateFortune(
  gate: Gate,
  star: Star,
  spirit?: Spirit,
): Fortune {
  const combinedNature = calculateCombinedNature(gate, star, spirit);

  // 점수 계산 (0-100)
  let score = 50; // 기본 중립

  // 팔문 영향
  const gateNature = GATES[gate].nature;
  if (gateNature === 'auspicious') score += 15;
  else if (gateNature === 'inauspicious') score -= 15;

  // 구성 영향
  const starNature = STARS[star].nature;
  if (starNature === 'auspicious') score += 15;
  else if (starNature === 'inauspicious') score -= 15;

  // 팔신 영향
  if (spirit) {
    const spiritNature = SPIRITS[spirit].nature;
    if (spiritNature === 'auspicious') score += 20;
    else if (spiritNature === 'inauspicious') score -= 20;
  }

  // 점수를 Fortune 타입으로 변환
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'neutral';
  if (score >= 20) return 'bad';
  return 'terrible';
}

/**
 * 해석 생성
 */
function generateInterpretation(
  palace: Palace,
  gate: Gate,
  star: Star,
  spirit: Spirit | undefined,
  fortune: Fortune,
): string {
  const direction = PALACE_TO_DIRECTION[palace];
  const gateData = GATES[gate];
  const starData = STARS[star];

  let interpretation = `${direction} 방위 (${palace}궁)은 `;

  if (fortune === 'excellent') {
    interpretation += '대길한 기운이 흐릅니다. ';
  } else if (fortune === 'good') {
    interpretation += '길한 기운이 있습니다. ';
  } else if (fortune === 'neutral') {
    interpretation += '평온한 기운입니다. ';
  } else if (fortune === 'bad') {
    interpretation += '조심해야 할 방위입니다. ';
  } else {
    interpretation += '매우 불길한 방위입니다. ';
  }

  interpretation += `${gateData.meaning} `;
  interpretation += `${starData.meaning} `;

  if (spirit) {
    const spiritData = SPIRITS[spirit];
    interpretation += `${spiritData.meaning}이 작용하고 있습니다.`;
  }

  return interpretation;
}

/**
 * 추천사항 생성
 */
function generateRecommendations(
  gate: Gate,
  star: Star,
  spirit: Spirit | undefined,
  fortune: Fortune,
): string[] {
  const recommendations: string[] = [];

  if (fortune === 'excellent' || fortune === 'good') {
    recommendations.push('중요한 일을 시작하기 좋은 시간입니다');
    recommendations.push('이 방위로 이동하거나 이 방향을 보고 일하세요');
    recommendations.push('새로운 계획이나 프로젝트 추진에 유리합니다');
  }

  // 팔문 기반 추천
  const gateEffects = GATES[gate].effects.positive;
  if (gateEffects.length > 0) {
    recommendations.push(`${gateEffects.slice(0, 2).join(', ')}에 집중하세요`);
  }

  return recommendations;
}

/**
 * 주의사항 생성
 */
function generateWarnings(
  gate: Gate,
  star: Star,
  spirit: Spirit | undefined,
  fortune: Fortune,
): string[] {
  const warnings: string[] = [];

  if (fortune === 'bad' || fortune === 'terrible') {
    warnings.push('중요한 결정은 피하는 것이 좋습니다');
    warnings.push('이 방위로의 이동이나 행동은 신중히 하세요');
    warnings.push('갈등이나 분쟁의 소지가 있으니 주의하세요');
  }

  // 팔문 기반 주의사항
  const gateEffects = GATES[gate].effects.negative;
  if (gateEffects.length > 0) {
    warnings.push(`${gateEffects.slice(0, 2).join(', ')}를 경계하세요`);
  }

  // 팔신 기반 주의사항
  if (spirit) {
    const spiritData = SPIRITS[spirit];
    if (spiritData.nature === 'inauspicious') {
      warnings.push(
        `${spiritData.characteristics.slice(0, 2).join(', ')}에 주의하세요`,
      );
    }
  }

  return warnings;
}

/**
 * 전체 길흉 평가
 */
function evaluateOverallFortune(
  palaces: QimenChart['palaces'],
): QimenChart['overallFortune'] {
  const fortuneScores = {
    excellent: 100,
    good: 75,
    neutral: 50,
    bad: 25,
    terrible: 0,
  };

  let totalScore = 0;
  const palaceScores: { palace: Palace; score: number }[] = [];

  // 각 궁의 점수 계산
  for (let p = 1; p <= 9; p++) {
    const palace = p as Palace;
    const palaceInfo = palaces[palace];
    const score = fortuneScores[palaceInfo.fortune];
    totalScore += score;
    palaceScores.push({ palace, score });
  }

  // 평균 점수
  const avgScore = Math.round(totalScore / 9);

  // 전체 길흉 등급
  let level: Fortune;
  if (avgScore >= 80) level = 'excellent';
  else if (avgScore >= 60) level = 'good';
  else if (avgScore >= 40) level = 'neutral';
  else if (avgScore >= 20) level = 'bad';
  else level = 'terrible';

  // 정렬
  palaceScores.sort((a, b) => b.score - a.score);

  // 상위 3개, 하위 3개
  const bestPalaces = palaceScores.slice(0, 3).map((ps) => ps.palace);
  const worstPalaces = palaceScores.slice(-3).map((ps) => ps.palace);

  // 요약
  let summary = '';
  if (level === 'excellent') {
    summary = '현재 시간은 매우 길한 시간입니다. 중요한 일을 추진하기 좋습니다.';
  } else if (level === 'good') {
    summary = '현재 시간은 길한 편입니다. 계획한 일을 진행하세요.';
  } else if (level === 'neutral') {
    summary = '현재 시간은 평온합니다. 일상적인 활동에 적합합니다.';
  } else if (level === 'bad') {
    summary = '현재 시간은 주의가 필요합니다. 신중하게 행동하세요.';
  } else {
    summary = '현재 시간은 불길합니다. 중요한 일은 미루는 것이 좋습니다.';
  }

  return {
    score: avgScore,
    level,
    summary,
    bestPalaces,
    worstPalaces,
  };
}

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 특정 방위의 길흉 빠른 조회
 */
export function checkDirectionFortune(
  chart: QimenChart,
  direction: string,
): PalaceInfo | null {
  for (const palace of Object.values(chart.palaces)) {
    if (palace.direction === direction) {
      return palace;
    }
  }
  return null;
}

/**
 * 가장 좋은 방위 찾기
 */
export function findBestDirection(chart: QimenChart): PalaceInfo {
  const bestPalace = chart.overallFortune.bestPalaces[0];
  return chart.palaces[bestPalace];
}

/**
 * 가장 나쁜 방위 찾기
 */
export function findWorstDirection(chart: QimenChart): PalaceInfo {
  const worstPalace = chart.overallFortune.worstPalaces[0];
  return chart.palaces[worstPalace];
}
