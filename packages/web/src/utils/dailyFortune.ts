import { SajuCalculator } from './sajuCalculator';
import { SajuData, CheonGan, JiJi, OhHaeng, CHEONGAN_OHHAENG, JIJI_OHHAENG } from './sajuScoreCalculator';

// 오행별 행운 아이템 매핑
export const LUCKY_ITEMS_BY_OHHAENG = {
  색상: {
    목: ['초록색', '청색', '연두색', '에메랄드색'],
    화: ['빨간색', '분홍색', '주황색', '자주색'],
    토: ['노란색', '갈색', '베이지색', '황토색'],
    금: ['흰색', '은색', '금색', '회백색'],
    수: ['검은색', '남색', '회색', '진청색']
  },
  방향: {
    목: ['동쪽', '동남쪽'],
    화: ['남쪽', '남동쪽', '남서쪽'],
    토: ['중앙', '북동쪽', '남서쪽'],
    금: ['서쪽', '북서쪽'],
    수: ['북쪽', '북동쪽']
  },
  시간대: {
    목: ['05-07시 (묘시)', '03-05시 (인시)'],
    화: ['11-13시 (오시)', '09-11시 (사시)'],
    토: ['07-09시 (진시)', '13-15시 (미시)', '19-21시 (술시)', '01-03시 (축시)'],
    금: ['15-17시 (신시)', '17-19시 (유시)'],
    수: ['23-01시 (자시)', '21-23시 (해시)']
  },
  음식: {
    목: ['샐러드', '녹색 채소', '과일', '녹차', '허브티'],
    화: ['매운 음식', '구운 요리', '토마토', '빨간 과일', '커피'],
    토: ['곡물', '뿌리채소', '된장', '현미', '고구마'],
    금: ['흰 쌀밥', '두부', '배', '무', '우유'],
    수: ['해산물', '검은콩', '미역', '김', '물']
  },
  활동: {
    목: ['산책', '등산', '정원 가꾸기', '요가', '스트레칭'],
    화: ['운동', '사교 모임', '프레젠테이션', '열정적인 활동'],
    토: ['명상', '독서', '계획 세우기', '정리정돈'],
    금: ['음악 감상', '예술 활동', '정밀 작업', '분석'],
    수: ['수영', '목욕', '휴식', '학습', '연구']
  },
  보석: {
    목: ['에메랄드', '비취', '녹옥', '공작석'],
    화: ['루비', '홍옥', '산호', '석류석'],
    토: ['황옥', '호박', '시트린', '타이거아이'],
    금: ['진주', '다이아몬드', '백금', '은'],
    수: ['사파이어', '흑진주', '자수정', '아쿠아마린']
  }
};

// 날짜의 일진(일주) 계산
export function getDailyPillar(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const dayPillar = SajuCalculator.calculateDayPillar(year, month, day);
  return {
    gan: dayPillar.heavenly as CheonGan,
    ji: dayPillar.earthly as JiJi,
    combined: dayPillar.combined
  };
}

// 날짜별 행운 아이템 계산
export function getLuckyItemsByDate(date: Date, sajuData: SajuData) {
  const dailyPillar = getDailyPillar(date);
  
  // 일간과 일지의 오행
  const dayGanOhhaeng = CHEONGAN_OHHAENG[dailyPillar.gan];
  const dayJiOhhaeng = JIJI_OHHAENG[dailyPillar.ji];
  
  // 사주의 일간 오행
  const birthDayGanOhhaeng = CHEONGAN_OHHAENG[sajuData.day.gan];
  
  // 오늘의 주도적 오행 결정 (일간 > 일지 > 본인 일간 순서)
  const dominantOhhaeng = dayGanOhhaeng;
  const secondaryOhhaeng = dayJiOhhaeng;
  
  // 각 카테고리에서 행운 아이템 선택
  const luckyItems = {
    색상: selectLuckyItem(LUCKY_ITEMS_BY_OHHAENG.색상[dominantOhhaeng], date),
    방향: selectLuckyItem(LUCKY_ITEMS_BY_OHHAENG.방향[dominantOhhaeng], date),
    시간대: selectLuckyItem(LUCKY_ITEMS_BY_OHHAENG.시간대[dominantOhhaeng], date),
    음식: selectLuckyItem(LUCKY_ITEMS_BY_OHHAENG.음식[secondaryOhhaeng], date),
    활동: selectLuckyItem(LUCKY_ITEMS_BY_OHHAENG.활동[birthDayGanOhhaeng], date),
    보석: selectLuckyItem(LUCKY_ITEMS_BY_OHHAENG.보석[dominantOhhaeng], date),
    // 행운의 숫자는 날짜와 사주 조합으로 계산
    숫자: calculateLuckyNumber(date, sajuData),
    // 오늘의 일진 정보도 포함
    일진: dailyPillar.combined,
    일간오행: dominantOhhaeng,
    일지오행: secondaryOhhaeng
  };
  
  return luckyItems;
}

// 배열에서 날짜 기반으로 아이템 선택 (일정한 패턴으로)
function selectLuckyItem(items: string[], date: Date): string {
  if (!items || items.length === 0) return '정보 없음';
  
  // 날짜를 시드로 사용하여 일정한 패턴 생성
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const index = dayOfYear % items.length;
  
  return items[index];
}

// 날짜와 사주를 조합한 행운의 숫자 계산
function calculateLuckyNumber(date: Date, sajuData: SajuData): number {
  const dailyPillar = getDailyPillar(date);
  
  // 천간을 숫자로 변환 (갑=1, 을=2, ... 계=10)
  const CHEONGAN: CheonGan[] = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
  const dayGanNumber = CHEONGAN.indexOf(dailyPillar.gan) + 1;
  const birthGanNumber = CHEONGAN.indexOf(sajuData.day.gan) + 1;
  
  // 두 숫자를 조합 (1-9 범위)
  let luckyNumber = (dayGanNumber + birthGanNumber) % 9;
  if (luckyNumber === 0) luckyNumber = 9;
  
  return luckyNumber;
}

// 날짜에 따른 운세 보정값 계산
export function getDailyFortuneModifier(date: Date, sajuData: SajuData, category: string): number {
  const dailyPillar = getDailyPillar(date);
  const dayGanOhhaeng = CHEONGAN_OHHAENG[dailyPillar.gan];
  const dayJiOhhaeng = JIJI_OHHAENG[dailyPillar.ji];
  
  // 카테고리별 선호 오행
  const categoryOhhaeng: Record<string, OhHaeng[]> = {
    '금전운': ['금', '토'],
    '연애운': ['화', '목'],
    '직장운': ['금', '수'],
    '건강운': ['목', '수']
  };
  
  let modifier = 0;
  const preferredOhhaeng = categoryOhhaeng[category] || [];
  
  // 일간 오행이 선호 오행과 일치하면 가산점
  if (preferredOhhaeng.includes(dayGanOhhaeng)) {
    modifier += 10;
  }
  
  // 일지 오행이 선호 오행과 일치하면 가산점
  if (preferredOhhaeng.includes(dayJiOhhaeng)) {
    modifier += 5;
  }
  
  // 상생 관계 체크
  const birthDayOhhaeng = CHEONGAN_OHHAENG[sajuData.day.gan];
  const SANGSEANG: Record<OhHaeng, OhHaeng> = {
    목: '화',
    화: '토',
    토: '금',
    금: '수',
    수: '목'
  };
  
  // 일간이 본인 일간을 생하면 가산점
  if (SANGSEANG[dayGanOhhaeng] === birthDayOhhaeng) {
    modifier += 8;
  }
  
  return modifier;
}

// 오늘의 운세 메시지 생성
export function generateDailyFortuneMessage(date: Date, sajuData: SajuData): string {
  const dailyPillar = getDailyPillar(date);
  const dayGanOhhaeng = CHEONGAN_OHHAENG[dailyPillar.gan];
  const birthDayOhhaeng = CHEONGAN_OHHAENG[sajuData.day.gan];
  
  const messages: Record<string, string[]> = {
    목: [
      '새로운 시작과 성장의 에너지가 강한 날입니다.',
      '창의적인 아이디어가 샘솟는 날입니다.',
      '인간관계에서 좋은 기회가 올 수 있습니다.'
    ],
    화: [
      '열정과 활력이 넘치는 날입니다.',
      '적극적인 행동이 좋은 결과를 가져올 수 있습니다.',
      '리더십을 발휘하기 좋은 날입니다.'
    ],
    토: [
      '안정과 균형을 추구하기 좋은 날입니다.',
      '신중한 판단이 필요한 시기입니다.',
      '기초를 다지는 일에 집중하면 좋습니다.'
    ],
    금: [
      '결단력과 추진력이 강화되는 날입니다.',
      '목표를 향해 전진하기 좋은 시기입니다.',
      '재물운이 상승하는 날입니다.'
    ],
    수: [
      '지혜와 통찰력이 빛나는 날입니다.',
      '학습과 연구에 적합한 시기입니다.',
      '내면의 평화를 찾기 좋은 날입니다.'
    ]
  };
  
  // 일간 오행에 따른 메시지 선택
  const dayMessages = messages[dayGanOhhaeng] || messages['토'];
  const messageIndex = date.getDate() % dayMessages.length;
  
  // 상생/상극 관계에 따른 추가 메시지
  const SANGSEANG: Record<OhHaeng, OhHaeng> = {
    목: '화', 화: '토', 토: '금', 금: '수', 수: '목'
  };
  
  let additionalMessage = '';
  if (SANGSEANG[dayGanOhhaeng] === birthDayOhhaeng) {
    additionalMessage = ' 오늘은 특히 당신에게 유리한 기운이 흐릅니다.';
  } else if (SANGSEANG[birthDayOhhaeng] === dayGanOhhaeng) {
    additionalMessage = ' 주변에 베푸는 마음이 복으로 돌아올 것입니다.';
  }
  
  return dayMessages[messageIndex] + additionalMessage;
}