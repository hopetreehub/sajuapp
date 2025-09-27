/**
 * 오늘의 운세 계산기
 * 사용자의 사주 정보와 현재 날짜를 기반으로 일일 운세를 계산
 */

import { format } from 'date-fns';
import { SajuBirthInfo, DailyFortune, FortuneLevel } from '@/types/saju';

// 천간과 지지
const HEAVENLY_STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const _EARTHLY_BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

// 오행 속성
const ELEMENT_MAP: { [key: string]: string } = {
  '갑': '목', '을': '목',
  '병': '화', '정': '화', 
  '무': '토', '기': '토',
  '경': '금', '신': '금',
  '임': '수', '계': '수',
  '인': '목', '묘': '목',
  '사': '화', '오': '화',
  '진': '토', '술': '토', '축': '토', '미': '토',
  '유': '금',
  '자': '수', '해': '수',
};

// 오행 상생상극
const ELEMENT_RELATIONS = {
  '생': { // 상생
    '목': '화', '화': '토', '토': '금', '금': '수', '수': '목',
  },
  '극': { // 상극 
    '목': '토', '화': '금', '토': '수', '금': '목', '수': '화',
  },
};

// 행운 레벨 정의
const FORTUNE_LEVELS: { [key: string]: FortuneLevel } = {
  excellent: { level: 'excellent', label: '대길', color: '#10b981', icon: '🌟' },
  good: { level: 'good', label: '길함', color: '#22c55e', icon: '✨' },
  normal: { level: 'normal', label: '보통', color: '#f59e0b', icon: '⭐' },
  caution: { level: 'caution', label: '주의', color: '#f97316', icon: '⚠️' },
  bad: { level: 'bad', label: '흉함', color: '#ef4444', icon: '🚨' },
};

// 행운 색상과 숫자
const LUCKY_COLORS = ['#4f46e5', '#059669', '#dc2626', '#7c3aed', '#ea580c', '#0891b2'];
const LUCKY_NUMBERS = [1, 3, 5, 7, 9, 11, 13, 17, 19, 21, 23, 29];

/**
 * 날짜에서 일간을 계산 (간단한 알고리즘)
 */
function getDayMaster(date: Date): string {
  const baseDate = new Date(1900, 0, 1); // 기준일 (경자일)
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const cycleIndex = (diffDays + 36) % 60; // 1900년 1월 1일이 경자일이므로 36을 더함
  
  const stemIndex = cycleIndex % 10;
  const _branchIndex = cycleIndex % 12;
  
  return HEAVENLY_STEMS[stemIndex];
}

/**
 * 점수를 레벨로 변환
 */
function getFortuneLevel(score: number): FortuneLevel {
  if (score >= 85) return FORTUNE_LEVELS.excellent;
  if (score >= 70) return FORTUNE_LEVELS.good;
  if (score >= 50) return FORTUNE_LEVELS.normal;
  if (score >= 30) return FORTUNE_LEVELS.caution;
  return FORTUNE_LEVELS.bad;
}

/**
 * 오행 관계에 따른 점수 계산
 */
function calculateElementScore(userElement: string, dayElement: string): number {
  if (userElement === dayElement) return 75; // 같은 오행
  if (ELEMENT_RELATIONS.생[userElement] === dayElement) return 85; // 상생
  if (ELEMENT_RELATIONS.생[dayElement] === userElement) return 90; // 일간이 사용자를 생조
  if (ELEMENT_RELATIONS.극[userElement] === dayElement) return 45; // 사용자가 일간을 극
  if (ELEMENT_RELATIONS.극[dayElement] === userElement) return 35; // 일간이 사용자를 극
  return 60; // 기본 점수
}

/**
 * 생년월일시를 기반으로 사용자의 기본 오행 에너지 계산
 */
function getUserElement(birthInfo: SajuBirthInfo): string {
  // 간단한 방식: 출생년의 천간으로 기본 오행 결정
  const yearStemIndex = (birthInfo.year - 4) % 10;
  const yearStem = HEAVENLY_STEMS[yearStemIndex];
  return ELEMENT_MAP[yearStem] || '목';
}

/**
 * 운세 메시지 생성
 */
function generateFortuneMessage(totalLuck: number, _userElement: string, _dayElement: string): string {
  const level = getFortuneLevel(totalLuck);
  const messages = {
    excellent: [
      '오늘은 모든 일이 순조롭게 풀리는 대길한 날입니다. 새로운 도전을 시작하기에 좋습니다.',
      '행운의 기운이 가득한 하루입니다. 중요한 결정을 내리기에 최적의 시기입니다.',
      '긍정적인 에너지가 충만한 날입니다. 주변 사람들과의 관계도 더욱 좋아질 것입니다.',
    ],
    good: [
      '전반적으로 좋은 흐름을 타는 하루입니다. 계획했던 일들을 추진해보세요.',
      '운세가 상승하는 시기입니다. 적극적인 자세로 임하면 좋은 결과가 있을 것입니다.',
      '안정적이고 평화로운 하루가 될 것입니다. 차분한 마음으로 일을 처리하세요.',
    ],
    normal: [
      '무난한 하루가 예상됩니다. 평소보다 신중하게 행동하는 것이 좋겠습니다.',
      '큰 변화보다는 현재 상황을 유지하는 것이 바람직한 시기입니다.',
      '조급해하지 말고 차근차근 진행하면 좋은 결과를 얻을 수 있습니다.',
    ],
    caution: [
      '조심스럽게 행동하는 것이 필요한 하루입니다. 성급한 판단은 피하세요.',
      '작은 일도 꼼꼼히 확인하고 진행하는 것이 좋겠습니다.',
      '어려움이 있더라도 포기하지 말고 꾸준히 노력하세요.',
    ],
    bad: [
      '오늘은 새로운 일을 시작하기보다는 기존 일을 정리하는 것이 좋겠습니다.',
      '주변 사람들과의 갈등을 피하고 조화를 이루도록 노력하세요.',
      '힘든 시기이지만 이또한 지나갈 것입니다. 긍정적인 마음을 유지하세요.',
    ],
  };
  
  const levelMessages = messages[level.level];
  const randomIndex = Math.floor(Math.random() * levelMessages.length);
  return levelMessages[randomIndex];
}

/**
 * 오늘의 운세 계산 메인 함수
 */
export function calculateDailyFortune(birthInfo: SajuBirthInfo, targetDate: Date = new Date()): DailyFortune {
  // 사용자 기본 오행과 오늘의 일간 오행
  const userElement = getUserElement(birthInfo);
  const dayMaster = getDayMaster(targetDate);
  const dayElement = ELEMENT_MAP[dayMaster] || '목';
  
  // 기본 점수 계산
  const baseScore = calculateElementScore(userElement, dayElement);
  
  // 날짜 기반 변동 요소 (일/월/년 조합)
  const dayNum = targetDate.getDate();
  const monthNum = targetDate.getMonth() + 1;
  const yearNum = targetDate.getFullYear();
  
  // 개인별 고유 시드 (생년월일 기반)
  const personalSeed = (birthInfo.year + birthInfo.month + birthInfo.day + birthInfo.hour) % 100;
  
  // 각 운세별 점수 계산 (기본점수 + 랜덤 변동)
  const totalLuck = Math.min(100, Math.max(0, baseScore + ((dayNum + personalSeed) % 31) - 15));
  const loveLuck = Math.min(100, Math.max(0, baseScore + ((monthNum + personalSeed) % 31) - 15));
  const wealthLuck = Math.min(100, Math.max(0, baseScore + ((yearNum + personalSeed) % 31) - 15));
  const healthLuck = Math.min(100, Math.max(0, baseScore + ((dayNum * monthNum + personalSeed) % 31) - 15));
  const careerLuck = Math.min(100, Math.max(0, baseScore + ((dayNum + monthNum + personalSeed) % 31) - 15));
  
  // 행운의 색상과 숫자 (날짜와 개인 정보 기반)
  const colorIndex = (dayNum + personalSeed) % LUCKY_COLORS.length;
  const numberIndex = (monthNum + personalSeed) % LUCKY_NUMBERS.length;
  
  return {
    date: format(targetDate, 'yyyy-MM-dd'),
    totalLuck,
    loveLuck,
    wealthLuck,
    healthLuck,
    careerLuck,
    message: generateFortuneMessage(totalLuck, userElement, dayElement),
    luckyColor: LUCKY_COLORS[colorIndex],
    luckyNumber: LUCKY_NUMBERS[numberIndex],
    advice: `오늘의 기운: ${userElement}행이 ${dayElement}행과 만나는 날입니다.`,
  };
}

/**
 * 운세 점수를 레벨 정보로 변환
 */
export function getFortuneInfo(score: number): FortuneLevel {
  return getFortuneLevel(score);
}

/**
 * 당일 운세 캐싱을 위한 키 생성
 */
export function getFortuneKey(birthInfo: SajuBirthInfo, date: Date): string {
  return `fortune_${birthInfo.year}_${birthInfo.month}_${birthInfo.day}_${birthInfo.hour}_${format(date, 'yyyy-MM-dd')}`;
}