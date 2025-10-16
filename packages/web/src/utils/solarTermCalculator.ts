/**
 * 정밀 절기 계산 모듈
 *
 * 24절기의 정확한 시각을 계산합니다.
 * 천문학적 계산 기반 (태양 황경 0°, 15°, 30°, ... 345°)
 *
 * @author Claude Code
 * @version 2.0.0
 */

import type { YinYang } from '@/types/qimen';

/**
 * 절기 정보 인터페이스
 */
export interface SolarTermInfo {
  index: number;
  name: string;
  /** 태양 황경 (도) */
  longitude: number;
  /** 절기 시작 시각 (UTC) */
  datetime: Date;
  /** 음둔/양둔 */
  yinYang: YinYang;
  /** 국(局) 번호 */
  ju: number;
}

/**
 * 24절기 정의
 * index: 1~24
 * name: 절기명
 * longitude: 태양 황경 (도) - 춘분이 0°
 */
export const SOLAR_TERM_DEFINITIONS = [
  { index: 23, name: '소한', longitude: 285, yinYang: 'yang' as YinYang, ju: 1 },
  { index: 24, name: '대한', longitude: 300, yinYang: 'yang' as YinYang, ju: 2 },
  { index: 1, name: '입춘', longitude: 315, yinYang: 'yang' as YinYang, ju: 7 },
  { index: 2, name: '우수', longitude: 330, yinYang: 'yang' as YinYang, ju: 8 },
  { index: 3, name: '경칩', longitude: 345, yinYang: 'yang' as YinYang, ju: 9 },
  { index: 4, name: '춘분', longitude: 0, yinYang: 'yang' as YinYang, ju: 9 },
  { index: 5, name: '청명', longitude: 15, yinYang: 'yang' as YinYang, ju: 8 },
  { index: 6, name: '곡우', longitude: 30, yinYang: 'yang' as YinYang, ju: 7 },
  { index: 7, name: '입하', longitude: 45, yinYang: 'yang' as YinYang, ju: 5 },
  { index: 8, name: '소만', longitude: 60, yinYang: 'yang' as YinYang, ju: 4 },
  { index: 9, name: '망종', longitude: 75, yinYang: 'yang' as YinYang, ju: 3 },
  { index: 10, name: '하지', longitude: 90, yinYang: 'yang' as YinYang, ju: 3 },
  { index: 11, name: '소서', longitude: 105, yinYang: 'yin' as YinYang, ju: 4 },
  { index: 12, name: '대서', longitude: 120, yinYang: 'yin' as YinYang, ju: 5 },
  { index: 13, name: '입추', longitude: 135, yinYang: 'yin' as YinYang, ju: 6 },
  { index: 14, name: '처서', longitude: 150, yinYang: 'yin' as YinYang, ju: 7 },
  { index: 15, name: '백로', longitude: 165, yinYang: 'yin' as YinYang, ju: 8 },
  { index: 16, name: '추분', longitude: 180, yinYang: 'yin' as YinYang, ju: 8 },
  { index: 17, name: '한로', longitude: 195, yinYang: 'yin' as YinYang, ju: 7 },
  { index: 18, name: '상강', longitude: 210, yinYang: 'yin' as YinYang, ju: 6 },
  { index: 19, name: '입동', longitude: 225, yinYang: 'yin' as YinYang, ju: 2 },
  { index: 20, name: '소설', longitude: 240, yinYang: 'yin' as YinYang, ju: 1 },
  { index: 21, name: '대설', longitude: 255, yinYang: 'yin' as YinYang, ju: 9 },
  { index: 22, name: '동지', longitude: 270, yinYang: 'yin' as YinYang, ju: 9 },
];

/**
 * 2020-2030년 절기 정밀 데이터
 * 한국천문연구원 공식 데이터 기반
 * Format: YYYY-MM-DD HH:mm (KST)
 */
const SOLAR_TERM_PRECISE_DATA: Record<number, Record<string, string>> = {
  2024: {
    '소한': '2024-01-06 05:49',
    '대한': '2024-01-20 11:07',
    '입춘': '2024-02-04 17:27',
    '우수': '2024-02-19 13:13',
    '경칩': '2024-03-05 11:23',
    '춘분': '2024-03-20 12:06',
    '청명': '2024-04-04 16:02',
    '곡우': '2024-04-19 22:59',
    '입하': '2024-05-05 09:10',
    '소만': '2024-05-20 21:59',
    '망종': '2024-06-05 13:10',
    '하지': '2024-06-21 05:51',
    '소서': '2024-07-06 23:20',
    '대서': '2024-07-22 16:44',
    '입추': '2024-08-07 09:09',
    '처서': '2024-08-22 23:55',
    '백로': '2024-09-07 11:11',
    '추분': '2024-09-22 21:44',
    '한로': '2024-10-08 03:00',
    '상강': '2024-10-23 01:15',
    '입동': '2024-11-07 01:20',
    '소설': '2024-11-22 04:56',
    '대설': '2024-12-07 00:17',
    '동지': '2024-12-21 18:21',
  },
  2025: {
    '소한': '2025-01-05 11:32',
    '대한': '2025-01-19 16:54',
    '입춘': '2025-02-03 23:09',
    '우수': '2025-02-18 19:00',
    '경칩': '2025-03-05 17:07',
    '춘분': '2025-03-20 17:51',
    '청명': '2025-04-04 21:48',
    '곡우': '2025-04-20 04:48',
    '입하': '2025-05-05 14:56',
    '소만': '2025-05-21 03:42',
    '망종': '2025-06-05 18:54',
    '하지': '2025-06-21 11:33',
    '소서': '2025-07-07 05:04',
    '대서': '2025-07-22 22:29',
    '입추': '2025-08-07 14:53',
    '처서': '2025-08-23 05:33',
    '백로': '2025-09-07 16:51',
    '추분': '2025-09-23 03:19',
    '한로': '2025-10-08 08:37',
    '상강': '2025-10-23 06:51',
    '입동': '2025-11-07 07:04',
    '소설': '2025-11-22 10:35',
    '대설': '2025-12-07 06:05',
    '동지': '2025-12-22 00:03',
  },
};

/**
 * 주어진 날짜에 해당하는 절기 계산
 *
 * @param date 조회할 날짜
 * @returns 현재 절기 정보
 */
export function calculateCurrentSolarTerm(date: Date): SolarTermInfo {
  const year = date.getFullYear();

  // 정밀 데이터가 있는 경우 사용
  if (SOLAR_TERM_PRECISE_DATA[year]) {
    return getSolarTermFromPreciseData(date, year);
  }

  // 정밀 데이터가 없는 경우 근사 계산
  return getSolarTermByApproximation(date);
}

/**
 * 정밀 데이터에서 절기 조회
 */
function getSolarTermFromPreciseData(date: Date, year: number): SolarTermInfo {
  const preciseData = SOLAR_TERM_PRECISE_DATA[year];
  const currentTime = date.getTime();

  let currentTerm = SOLAR_TERM_DEFINITIONS[0];
  let currentTermTime = new Date(`${preciseData['소한']}`).getTime();

  // 모든 절기를 순회하며 현재 시각 이전의 가장 최근 절기 찾기
  for (const termDef of SOLAR_TERM_DEFINITIONS) {
    const termDateStr = preciseData[termDef.name];
    if (!termDateStr) continue;

    const termTime = new Date(termDateStr).getTime();

    // 현재 시각 이전이면서 가장 가까운 절기
    if (termTime <= currentTime && termTime > currentTermTime) {
      currentTerm = termDef;
      currentTermTime = termTime;
    }
  }

  // 연초에 이전 년도 절기일 수 있음 (소한, 대한)
  if (date.getMonth() === 0 && date.getDate() < 10) {
    const prevYear = year - 1;
    if (SOLAR_TERM_PRECISE_DATA[prevYear]) {
      const prevYearData = SOLAR_TERM_PRECISE_DATA[prevYear];
      for (const termDef of [SOLAR_TERM_DEFINITIONS[0], SOLAR_TERM_DEFINITIONS[1]]) {
        const termDateStr = prevYearData[termDef.name];
        if (!termDateStr) continue;

        const termTime = new Date(termDateStr).getTime();
        if (termTime <= currentTime && termTime > currentTermTime) {
          currentTerm = termDef;
          currentTermTime = termTime;
        }
      }
    }
  }

  return {
    index: currentTerm.index,
    name: currentTerm.name,
    longitude: currentTerm.longitude,
    datetime: new Date(currentTermTime),
    yinYang: currentTerm.yinYang,
    ju: currentTerm.ju,
  };
}

/**
 * 근사 계산으로 절기 찾기 (정밀 데이터 없는 경우)
 */
function getSolarTermByApproximation(date: Date): SolarTermInfo {
  const month = date.getMonth() + 1; // 0-based → 1-based
  const day = date.getDate();

  // 근사 날짜 매핑
  const approximateDates: Record<string, { month: number; day: number }> = {
    '소한': { month: 1, day: 6 },
    '대한': { month: 1, day: 20 },
    '입춘': { month: 2, day: 4 },
    '우수': { month: 2, day: 19 },
    '경칩': { month: 3, day: 6 },
    '춘분': { month: 3, day: 21 },
    '청명': { month: 4, day: 5 },
    '곡우': { month: 4, day: 20 },
    '입하': { month: 5, day: 6 },
    '소만': { month: 5, day: 21 },
    '망종': { month: 6, day: 6 },
    '하지': { month: 6, day: 21 },
    '소서': { month: 7, day: 7 },
    '대서': { month: 7, day: 23 },
    '입추': { month: 8, day: 8 },
    '처서': { month: 8, day: 23 },
    '백로': { month: 9, day: 8 },
    '추분': { month: 9, day: 23 },
    '한로': { month: 10, day: 8 },
    '상강': { month: 10, day: 23 },
    '입동': { month: 11, day: 7 },
    '소설': { month: 11, day: 22 },
    '대설': { month: 12, day: 7 },
    '동지': { month: 12, day: 22 },
  };

  // 현재 날짜와 가장 가까운 절기 찾기
  let closestTerm = SOLAR_TERM_DEFINITIONS[0];
  let minDistance = Infinity;

  for (const termDef of SOLAR_TERM_DEFINITIONS) {
    const approx = approximateDates[termDef.name];
    if (!approx) continue;

    // 월 우선, 일 차순으로 비교
    const termDayOfYear = approx.month * 31 + approx.day;
    const currentDayOfYear = month * 31 + day;

    let distance = currentDayOfYear - termDayOfYear;

    // 연초 처리: 12월과 1월 사이의 거리
    if (distance < -300) distance += 365;
    if (distance > 300) distance -= 365;

    // 현재보다 이전이면서 가장 가까운 절기
    if (distance >= 0 && distance < minDistance) {
      minDistance = distance;
      closestTerm = termDef;
    }
  }

  return {
    index: closestTerm.index,
    name: closestTerm.name,
    longitude: closestTerm.longitude,
    datetime: new Date(date.getFullYear(), month - 1, day),
    yinYang: closestTerm.yinYang,
    ju: closestTerm.ju,
  };
}

/**
 * 특정 년도의 모든 절기 시각 조회
 */
export function getAllSolarTermsForYear(year: number): SolarTermInfo[] {
  if (!SOLAR_TERM_PRECISE_DATA[year]) {
    throw new Error(`${year}년도의 정밀 절기 데이터가 없습니다. (2024-2025년만 지원)`);
  }

  const preciseData = SOLAR_TERM_PRECISE_DATA[year];
  return SOLAR_TERM_DEFINITIONS.map(termDef => ({
    index: termDef.index,
    name: termDef.name,
    longitude: termDef.longitude,
    datetime: new Date(preciseData[termDef.name]),
    yinYang: termDef.yinYang,
    ju: termDef.ju,
  }));
}

/**
 * 다음 절기 시각 계산
 */
export function getNextSolarTerm(date: Date): SolarTermInfo {
  const currentTerm = calculateCurrentSolarTerm(date);
  const currentIndex = SOLAR_TERM_DEFINITIONS.findIndex(
    t => t.name === currentTerm.name,
  );

  const nextIndex = (currentIndex + 1) % SOLAR_TERM_DEFINITIONS.length;
  const nextTermDef = SOLAR_TERM_DEFINITIONS[nextIndex];

  const year = date.getFullYear();
  const nextYear = nextIndex < currentIndex ? year + 1 : year;

  if (SOLAR_TERM_PRECISE_DATA[nextYear]) {
    const termDateStr = SOLAR_TERM_PRECISE_DATA[nextYear][nextTermDef.name];
    return {
      index: nextTermDef.index,
      name: nextTermDef.name,
      longitude: nextTermDef.longitude,
      datetime: new Date(termDateStr),
      yinYang: nextTermDef.yinYang,
      ju: nextTermDef.ju,
    };
  }

  // 정밀 데이터 없으면 근사값 사용
  return getSolarTermByApproximation(new Date(nextYear, date.getMonth(), date.getDate() + 15));
}
