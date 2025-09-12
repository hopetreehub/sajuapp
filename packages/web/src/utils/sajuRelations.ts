import { CheonGan, JiJi, SajuData } from './sajuScoreCalculator';
import { getDailyPillar } from './dailyFortune';

// 하도수 (河圖數) - 천간별 고유 숫자
export const HADO_NUMBERS: Record<CheonGan, number> = {
  '갑': 3, '을': 8,  // 목: 생수 3, 성수 8
  '병': 2, '정': 7,  // 화: 생수 2, 성수 7
  '무': 5, '기': 10, // 토: 생수 5, 성수 10
  '경': 4, '신': 9,  // 금: 생수 4, 성수 9
  '임': 1, '계': 6,   // 수: 생수 1, 성수 6
};

// 지지별 숫자 (낙서 기반)
export const JIJI_NUMBERS: Record<JiJi, number> = {
  '자': 1,  // 수
  '축': 5,  // 토
  '인': 3,  // 목
  '묘': 8,  // 목
  '진': 5,  // 토
  '사': 2,  // 화
  '오': 7,  // 화
  '미': 10, // 토
  '신': 4,  // 금
  '유': 9,  // 금
  '술': 5,  // 토
  '해': 6,   // 수
};

// 천간 충 관계
export function checkCheonganClash(gan1: CheonGan, gan2: CheonGan): boolean {
  const clashPairs: [CheonGan, CheonGan][] = [
    ['갑', '경'], ['을', '신'], ['병', '임'], ['정', '계'],
  ];
  return clashPairs.some(([a, b]) => 
    (gan1 === a && gan2 === b) || (gan1 === b && gan2 === a),
  );
}

// 천간 합 관계
export function checkCheonganHarmony(gan1: CheonGan, gan2: CheonGan): boolean {
  const harmonyPairs: [CheonGan, CheonGan][] = [
    ['갑', '기'], ['을', '경'], ['병', '신'], ['정', '임'], ['무', '계'],
  ];
  return harmonyPairs.some(([a, b]) => 
    (gan1 === a && gan2 === b) || (gan1 === b && gan2 === a),
  );
}

// 지지 충 관계
export function checkJijiClash(ji1: JiJi, ji2: JiJi): boolean {
  const clashPairs: [JiJi, JiJi][] = [
    ['자', '오'], ['축', '미'], ['인', '신'], 
    ['묘', '유'], ['진', '술'], ['사', '해'],
  ];
  return clashPairs.some(([a, b]) => 
    (ji1 === a && ji2 === b) || (ji1 === b && ji2 === a),
  );
}

// 지지 육합 관계
export function checkJijiHarmony(ji1: JiJi, ji2: JiJi): boolean {
  const harmonyPairs: [JiJi, JiJi][] = [
    ['자', '축'], ['인', '해'], ['묘', '술'],
    ['진', '유'], ['사', '신'], ['오', '미'],
  ];
  return harmonyPairs.some(([a, b]) => 
    (ji1 === a && ji2 === b) || (ji1 === b && ji2 === a),
  );
}

// 12운성 테이블 (타입 정의 개선)
type LifeStageTable = Partial<Record<JiJi, string>>;

export const TWELVE_LIFE_STAGES: Record<CheonGan, LifeStageTable> = {
  '갑': { '해': '장생', '자': '목욕', '축': '관대', '인': '건록', '묘': '제왕', '진': '쇠', '사': '병', '오': '사', '미': '묘', '신': '절', '유': '태', '술': '양' },
  '을': { '오': '장생', '사': '목욕', '진': '관대', '묘': '건록', '인': '제왕', '축': '쇠', '자': '병', '해': '사', '술': '묘', '유': '절', '신': '태', '미': '양' },
  '병': { '인': '장생', '묘': '목욕', '진': '관대', '사': '건록', '오': '제왕', '미': '쇠', '신': '병', '유': '사', '술': '묘', '해': '절', '자': '태', '축': '양' },
  '정': { '유': '장생', '신': '목욕', '미': '관대', '오': '건록', '사': '제왕', '진': '쇠', '묘': '병', '인': '사', '축': '묘', '자': '절', '해': '태', '술': '양' },
  '무': { '인': '장생', '묘': '목욕', '진': '관대', '사': '건록', '오': '제왕', '미': '쇠', '신': '병', '유': '사', '술': '묘', '해': '절', '자': '태', '축': '양' },
  '기': { '유': '장생', '신': '목욕', '미': '관대', '오': '건록', '사': '제왕', '진': '쇠', '묘': '병', '인': '사', '축': '묘', '자': '절', '해': '태', '술': '양' },
  '경': { '사': '장생', '오': '목욕', '미': '관대', '신': '건록', '유': '제왕', '술': '쇠', '해': '병', '자': '사', '축': '묘', '인': '절', '묘': '태', '진': '양' },
  '신': { '자': '장생', '해': '목욕', '술': '관대', '유': '건록', '신': '제왕', '미': '쇠', '오': '병', '사': '사', '진': '묘', '묘': '절', '인': '태', '축': '양' },
  '임': { '신': '장생', '유': '목욕', '술': '관대', '해': '건록', '자': '제왕', '축': '쇠', '인': '병', '묘': '사', '진': '묘', '사': '절', '오': '태', '미': '양' },
  '계': { '묘': '장생', '인': '목욕', '축': '관대', '자': '건록', '해': '제왕', '술': '쇠', '유': '병', '신': '사', '미': '묘', '오': '절', '사': '태', '진': '양' },
};

// 12운성 계산
export function calculate12LifeStage(dayGan: CheonGan, ji: JiJi): string {
  const stageTable = TWELVE_LIFE_STAGES[dayGan];
  if (stageTable && ji in stageTable) {
    return stageTable[ji] || '없음';
  }
  return '없음';
}

// 공망 테이블 (타입 정의 개선)
type VoidDayTable = Partial<Record<CheonGan, JiJi[]>>;

export const VOID_DAYS: Record<CheonGan, VoidDayTable> = {
  '갑': { '갑': ['술', '해'], '을': ['술', '해'] },
  '을': { '갑': ['술', '해'], '을': ['술', '해'] },
  '병': { '병': ['신', '유'], '정': ['신', '유'] },
  '정': { '병': ['신', '유'], '정': ['신', '유'] },
  '무': { '무': ['오', '미'], '기': ['오', '미'] },
  '기': { '무': ['오', '미'], '기': ['오', '미'] },
  '경': { '경': ['진', '사'], '신': ['진', '사'] },
  '신': { '경': ['진', '사'], '신': ['진', '사'] },
  '임': { '임': ['인', '묘'], '계': ['인', '묘'] },
  '계': { '임': ['인', '묘'], '계': ['인', '묘'] },
};

// 천을귀인 테이블 (타입 정의 개선)
type NobleHelperTable = Partial<Record<CheonGan, JiJi[]>>;

export const NOBLE_HELPER: Record<CheonGan, NobleHelperTable> = {
  '갑': { '갑': ['축', '미'], '무': ['축', '미'] },
  '을': { '을': ['자', '신'], '기': ['자', '신'] },
  '병': { '병': ['해', '유'], '정': ['해', '유'] },
  '정': { '병': ['해', '유'], '정': ['해', '유'] },
  '무': { '갑': ['축', '미'], '무': ['축', '미'] },
  '기': { '을': ['자', '신'], '기': ['자', '신'] },
  '경': { '경': ['축', '미'], '신': ['인', '오'] },
  '신': { '경': ['인', '오'], '신': ['인', '오'] },
  '임': { '임': ['묘', '사'], '계': ['묘', '사'] },
  '계': { '임': ['묘', '사'], '계': ['묘', '사'] },
};

// 공망일 체크
export function isVoidDay(date: Date, sajuData: SajuData): boolean {
  const dailyPillar = getDailyPillar(date);
  const voidDayTable = VOID_DAYS[sajuData.year.gan];
  if (voidDayTable && dailyPillar.gan in voidDayTable) {
    const voidJiji = voidDayTable[dailyPillar.gan];
    return voidJiji?.includes(dailyPillar.ji) || false;
  }
  return false;
}

// 천을귀인일 체크
export function isNobleHelperDay(date: Date, sajuData: SajuData): boolean {
  const dailyPillar = getDailyPillar(date);
  const helperTable = NOBLE_HELPER[sajuData.day.gan];
  if (helperTable && dailyPillar.gan in helperTable) {
    const nobleJiji = helperTable[dailyPillar.gan];
    return nobleJiji?.includes(dailyPillar.ji) || false;
  }
  return false;
}

// 향상된 행운의 숫자 계산
export function calculateEnhancedLuckyNumber(date: Date, sajuData: SajuData): number {
  const dailyPillar = getDailyPillar(date);
  
  // 1. 하도수 기반 계산
  const dayHado = HADO_NUMBERS[dailyPillar.gan];
  const birthHado = HADO_NUMBERS[sajuData.day.gan];
  
  // 2. 지지 숫자 추가
  const dayJijiNum = JIJI_NUMBERS[dailyPillar.ji];
  const birthJijiNum = JIJI_NUMBERS[sajuData.day.ji];
  
  // 3. 날짜 요소 추가 (월 + 일)
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // 4. 복잡한 계산식으로 다양성 확보
  let luckyNumber = (dayHado * 2 + birthHado) % 10;
  luckyNumber = (luckyNumber + dayJijiNum + birthJijiNum) % 10;
  luckyNumber = (luckyNumber + month + day) % 9;
  
  // 5. 특별한 관계에 따른 보정
  if (checkCheonganHarmony(dailyPillar.gan, sajuData.day.gan)) {
    luckyNumber = (luckyNumber + 3) % 9;
  }
  
  if (checkJijiHarmony(dailyPillar.ji, sajuData.day.ji)) {
    luckyNumber = (luckyNumber + 6) % 9;
  }
  
  // 0을 9로 변환 (1-9 범위)
  return luckyNumber === 0 ? 9 : luckyNumber;
}

// 월운 영향 계산
export function calculateMonthlyFortune(date: Date, sajuData: SajuData): number {
  const month = date.getMonth() + 1;
  const dayGan = sajuData.day.gan;
  
  // 계절별 천간 선호도 (Partial 타입 사용)
  type SeasonPreference = Partial<Record<CheonGan, number>>;
  const seasonalPreference: Record<number, SeasonPreference> = {
    1: { '임': 10, '계': 8, '갑': -5, '을': -3 },   // 겨울
    2: { '갑': 5, '을': 8, '임': 3, '계': 2 },      // 초봄
    3: { '갑': 10, '을': 10, '병': 5, '정': 5 },    // 봄
    4: { '병': 8, '정': 8, '무': 5, '기': 5 },      // 늦봄
    5: { '병': 10, '정': 10, '무': 3, '기': 3 },    // 초여름
    6: { '병': 8, '정': 8, '경': -3, '신': -3 },    // 여름
    7: { '무': 10, '기': 10, '경': 3, '신': 3 },    // 늦여름
    8: { '경': 8, '신': 8, '무': 5, '기': 5 },      // 초가을
    9: { '경': 10, '신': 10, '임': 3, '계': 3 },    // 가을
    10: { '임': 5, '계': 5, '경': 5, '신': 5 },     // 늦가을
    11: { '임': 8, '계': 8, '갑': -3, '을': -3 },   // 초겨울
    12: { '임': 10, '계': 10, '병': -5, '정': -5 },  // 겨울
  };
  
  const monthPreference = seasonalPreference[month];
  if (monthPreference && dayGan in monthPreference) {
    return monthPreference[dayGan] || 0;
  }
  return 0;
}