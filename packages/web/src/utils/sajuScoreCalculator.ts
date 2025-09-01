// 사주 기반 점수 계산 시스템

// 오행 타입 정의
export type OhHaeng = '목' | '화' | '토' | '금' | '수';

// 천간 타입 정의
export type CheonGan = '갑' | '을' | '병' | '정' | '무' | '기' | '경' | '신' | '임' | '계';

// 지지 타입 정의
export type JiJi = '자' | '축' | '인' | '묘' | '진' | '사' | '오' | '미' | '신' | '유' | '술' | '해';

// 사주 데이터 인터페이스
export interface SajuData {
  year: { gan: CheonGan; ji: JiJi };
  month: { gan: CheonGan; ji: JiJi };
  day: { gan: CheonGan; ji: JiJi };
  time: { gan: CheonGan; ji: JiJi };
  ohHaengBalance: {
    목: number;
    화: number;
    토: number;
    금: number;
    수: number;
  };
}

// 천간의 오행 매핑
const CHEONGAN_OHHAENG: Record<CheonGan, OhHaeng> = {
  '갑': '목', '을': '목',
  '병': '화', '정': '화',
  '무': '토', '기': '토',
  '경': '금', '신': '금',
  '임': '수', '계': '수'
};

// 지지의 오행 매핑
const JIJI_OHHAENG: Record<JiJi, OhHaeng> = {
  '인': '목', '묘': '목',
  '사': '화', '오': '화',
  '진': '토', '술': '토', '축': '토', '미': '토',
  '신': '금', '유': '금',
  '자': '수', '해': '수'
};

// 항목별 오행 속성 매핑 (주요 카테고리)
const ITEM_OHHAENG_MAPPING: Record<string, OhHaeng[]> = {
  // 주본 - 근본본
  '건강': ['목', '수'], // 생명력, 활력
  '성격': ['화', '토'], // 열정, 안정
  '지혜': ['수', '금'], // 지식, 명철
  '관계': ['화', '목'], // 소통, 성장
  '재물': ['금', '토'], // 물질, 축적
  '명예': ['화', '금'], // 명성, 권위
  
  // 주본 - 성향
  '관대함': ['목', '화'], // 베풂, 온정
  '끈기': ['토', '금'], // 인내, 지속
  '리더십': ['화', '금'], // 주도, 권위
  '분석력': ['수', '금'], // 논리, 정밀
  '순수함': ['목', '수'], // 순진, 맑음
  '용기': ['화', '목'], // 도전, 진취
  '지적능력': ['수', '금'], // 지성, 명석
  
  // 주본 - 욕정
  '명예욕': ['화', '금'],
  '물욕': ['금', '토'],
  '애정욕': ['화', '목'],
  '지배욕': ['금', '화'],
  '식욕': ['토', '수'],
  '수면욕': ['수', '토'],
  '성욕': ['수', '화'],
  '권력욕': ['금', '화'],
  '소유욕': ['토', '금'],
  '지식욕': ['수', '목'],
  '인정욕': ['화', '토'],
  '자유욕': ['목', '화'],
  '창조욕': ['목', '수'],
  '탐구욕': ['수', '금'],
  '표현욕': ['화', '목'],
  '휴식욕': ['토', '수'],
  
  // 주건 - 비만
  '간': ['목', '화'],
  '갑상선': ['화', '수'],
  '근육': ['목', '토'],
  '뇌하수체': ['수', '금'],
  '대사': ['화', '토'],
  '스트레스': ['화', '금'],
  '신장': ['수', '목'],
  '심장': ['화', '목'],
  '유전': ['목', '수'],
  '지방': ['토', '수'],
  '호르몬': ['수', '화'],
  '활동량': ['화', '목'],
  
  // 주건 - 심리
  '강박': ['금', '토'],
  '걱정': ['토', '수'],
  '공포': ['수', '금'],
  '낙관': ['화', '목'],
  '무기력': ['토', '수'],
  '불안': ['수', '화'],
  '스트레스심리': ['화', '금'],
  '우울': ['수', '토'],
  '자신감': ['화', '목'],
  '집착': ['토', '금'],
  '충동': ['화', '목'],
  '회피': ['수', '토'],
  
  // 주물 - 부동산
  '건물': ['토', '금'],
  '공장': ['금', '화'],
  '다가구': ['토', '목'],
  '부동산': ['토', '금'],
  '다세대': ['토', '목'],
  '단독': ['토', '목'],
  '대지': ['토'],
  '상가': ['금', '화'],
  '아파트': ['토', '금'],
  '연립': ['토', '목'],
  '오피스': ['금', '토'],
  '주상복합': ['토', '금'],
  '주택': ['토', '목'],
  
  // 주물 - 재물
  '대여': ['금', '수'],
  '동산': ['금', '목'],
  '사업': ['화', '금'],
  '주식': ['수', '금'],
  '채권': ['금', '토'],
  '투자': ['금', '수'],
  '펀드': ['수', '금'],
  '현금': ['금'],
  
  // 주물 - 투자
  '기술': ['금', '수'],
  '방송': ['화', '목'],
  '선물': ['수', '금'],
  '예능': ['화', '목'],
  '인력': ['목', '화'],
  '제품': ['금', '토'],
  
  // 주연 - 외가
  '외가친척': ['목', '수'],
  '외갓집': ['목', '토'],
  '외삼촌': ['목', '화'],
  '외숙모': ['수', '목'],
  '외조모': ['토', '수'],
  '외조부': ['목', '금'],
  '외종형제': ['목', '화'],
  '이모': ['수', '목'],
  '이모부': ['화', '목'],
  '큰이모': ['수', '토'],
  
  // 주연 - 이성
  '남자': ['화', '목'],
  '배우자': ['토', '수'],
  '애인': ['화', '목'],
  '여자': ['수', '목'],
  '연인': ['화', '수'],
  '이성': ['화', '수'],
  
  // 주재 - 논리
  '계산': ['금', '수'],
  '과학': ['수', '금'],
  '관찰': ['수', '목'],
  '논리일반': ['수', '금'],
  '논증': ['금', '수'],
  '도형': ['토', '금'],
  '문장': ['목', '수'],
  '법칙': ['금', '토'],
  '분류': ['금', '수'],
  '분석': ['수', '금'],
  '비교': ['금', '수'],
  '비판': ['금', '화'],
  '수리': ['금', '수'],
  '연역': ['금', '수'],
  '요약': ['금', '토'],
  '원인': ['수', '목'],
  '응용': ['화', '금'],
  '이해': ['수', '목'],
  '인과': ['목', '수'],
  '전략': ['금', '화'],
  '추론': ['수', '금'],
  '통계': ['금', '수'],
  '판단': ['금', '화'],
  '해석': ['수', '목'],
  
  // 주재 - 예술
  '공간': ['토', '목'],
  '공예': ['토', '목'],
  '농담': ['화', '목'],
  '댄스': ['화', '목'],
  '디자인': ['목', '화'],
  '리듬': ['화', '수'],
  '만화': ['목', '화'],
  '멜로디': ['수', '목'],
  '무용': ['화', '목'],
  '문학': ['목', '수'],
  '미술': ['목', '토'],
  '박자': ['화', '금'],
  '사진': ['금', '수'],
  '색채': ['화', '목'],
  '연극': ['화', '목'],
  '연기': ['화', '수'],
  '영상': ['화', '금'],
  '영화': ['화', '금'],
  '예술일반': ['목', '화'],
  '음악': ['수', '목'],
  '조각': ['토', '금'],
  '조형': ['토', '목'],
  '창작': ['목', '화'],
  '화음': ['수', '목'],
  
  // 주업 - 능력
  '격려': ['화', '목'],
  '결단': ['금', '화'],
  '계획': ['금', '수'],
  '고집': ['토', '금'],
  '공감': ['수', '목'],
  '관리': ['금', '토'],
  '교육': ['목', '수'],
  '긍정': ['화', '목'],
  '기획': ['수', '금'],
  '대화': ['목', '화'],
  '도덕': ['목', '토'],
  '명령': ['금', '화'],
  '봉사': ['목', '수'],
  '비판업무': ['금', '화'],
  '사교': ['화', '목'],
  '상담': ['수', '목'],
  '섬세': ['수', '목'],
  '성실': ['토', '금'],
  '소통': ['목', '화'],
  '솔선': ['화', '목'],
  '수리업무': ['금', '수'],
  '시간': ['금', '토'],
  '신뢰': ['토', '금'],
  '실천': ['화', '토'],
  '언어': ['목', '수'],
  '예의': ['목', '토'],
  '유머': ['화', '목'],
  '응용업무': ['수', '금'],
  '인내': ['토', '금'],
  '적응': ['수', '목'],
  '정리': ['금', '토'],
  '정직': ['토', '목'],
  '조정': ['수', '토'],
  '주도': ['화', '금'],
  '책임': ['토', '금'],
  '추진': ['화', '목'],
  '타협': ['수', '토'],
  '포용': ['목', '수']
};

// 오행 상생상극 관계 점수
const OHHAENG_RELATIONS = {
  상생: { // +20점
    '목': '화',
    '화': '토',
    '토': '금',
    '금': '수',
    '수': '목'
  },
  상극: { // -15점
    '목': '토',
    '화': '금',
    '토': '수',
    '금': '목',
    '수': '화'
  }
};

// 시간대별 점수 계산을 위한 헬퍼 함수
export function calculateTimeBasedScore(
  itemName: string,
  sajuData: SajuData,
  timeFrame: 'base' | 'today' | 'month' | 'year'
): number {
  const baseScore = calculateSajuScore(itemName, sajuData);
  
  if (timeFrame === 'base') return baseScore;
  
  // 현재 날짜 기반 운세 계산
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  
  // 항목의 오행
  const itemOhhaeng = ITEM_OHHAENG_MAPPING[itemName] || [];
  if (itemOhhaeng.length === 0) return baseScore;
  
  let modifier = 0;
  
  switch (timeFrame) {
    case 'today': {
      // 오늘의 일진과 비교
      const todayGan = CHEONGAN[(currentDay % 10)];
      const todayJi = JIJI[(currentDay % 12)];
      const todayOhhaeng = CHEONGAN_OHHAENG[todayGan];
      
      // 상생 관계면 점수 증가
      itemOhhaeng.forEach(oh => {
        if (OHHAENG_RELATIONS.상생[todayOhhaeng] === oh) {
          modifier += 15;
        } else if (OHHAENG_RELATIONS.상극[todayOhhaeng] === oh) {
          modifier -= 10;
        }
      });
      
      // 일주와의 궁합
      if (sajuData.day.gan === todayGan) {
        modifier += 10; // 같은 천간일 때 가산
      }
      break;
    }
    
    case 'month': {
      // 이번 달의 월운과 비교
      const monthGan = CHEONGAN[(currentMonth % 10)];
      const monthJi = JIJI[(currentMonth % 12)];
      const monthOhhaeng = CHEONGAN_OHHAENG[monthGan];
      
      itemOhhaeng.forEach(oh => {
        if (OHHAENG_RELATIONS.상생[monthOhhaeng] === oh) {
          modifier += 12;
        } else if (OHHAENG_RELATIONS.상극[monthOhhaeng] === oh) {
          modifier -= 8;
        }
      });
      
      // 월지와의 합충
      if (sajuData.month.ji === monthJi) {
        modifier += 8;
      }
      break;
    }
    
    case 'year': {
      // 올해의 세운과 비교
      const yearGan = CHEONGAN[(currentYear % 10)];
      const yearJi = JIJI[(currentYear % 12)];
      const yearOhhaeng = CHEONGAN_OHHAENG[yearGan];
      
      itemOhhaeng.forEach(oh => {
        if (OHHAENG_RELATIONS.상생[yearOhhaeng] === oh) {
          modifier += 10;
        } else if (OHHAENG_RELATIONS.상극[yearOhhaeng] === oh) {
          modifier -= 5;
        }
      });
      
      // 년지와의 관계
      if (sajuData.year.ji === yearJi) {
        modifier += 5;
      }
      break;
    }
  }
  
  // 최종 점수 계산 (20-85 범위)
  const finalScore = baseScore + modifier;
  return Math.max(20, Math.min(85, Math.round(finalScore)));
}

// 사주 기반 점수 계산 함수
export function calculateSajuScore(
  itemName: string,
  sajuData: SajuData
): number {
  // 기본 점수 (50점에서 시작)
  let score = 50;
  
  // 1. 항목의 오행 속성 가져오기
  const itemOhhaeng = ITEM_OHHAENG_MAPPING[itemName] || [];
  
  if (itemOhhaeng.length === 0) {
    // 매핑되지 않은 항목은 랜덤 범위 점수
    return Math.floor(Math.random() * 30) + 40; // 40-70점
  }
  
  // 2. 사주의 오행 분포 계산
  const userOhhaeng: OhHaeng[] = [];
  
  // 천간 오행
  userOhhaeng.push(CHEONGAN_OHHAENG[sajuData.year.gan]);
  userOhhaeng.push(CHEONGAN_OHHAENG[sajuData.month.gan]);
  userOhhaeng.push(CHEONGAN_OHHAENG[sajuData.day.gan]);
  userOhhaeng.push(CHEONGAN_OHHAENG[sajuData.time.gan]);
  
  // 지지 오행
  userOhhaeng.push(JIJI_OHHAENG[sajuData.year.ji]);
  userOhhaeng.push(JIJI_OHHAENG[sajuData.month.ji]);
  userOhhaeng.push(JIJI_OHHAENG[sajuData.day.ji]);
  userOhhaeng.push(JIJI_OHHAENG[sajuData.time.ji]);
  
  // 3. 오행 균형 점수 계산
  itemOhhaeng.forEach(itemOh => {
    const count = userOhhaeng.filter(oh => oh === itemOh).length;
    
    // 오행이 많을수록 가산점
    score += count * 5; // 각 오행당 5점
    
    // 상생 관계 체크
    userOhhaeng.forEach(userOh => {
      if (OHHAENG_RELATIONS.상생[userOh] === itemOh) {
        score += 8; // 상생 관계 가산점
      }
      if (OHHAENG_RELATIONS.상극[userOh] === itemOh) {
        score -= 5; // 상극 관계 감점
      }
    });
  });
  
  // 4. 오행 균형도 반영
  const balanceBonus = calculateBalanceBonus(sajuData.ohHaengBalance, itemOhhaeng);
  score += balanceBonus;
  
  // 5. 일주 천간 특별 가산점
  const dayGanOhhaeng = CHEONGAN_OHHAENG[sajuData.day.gan];
  if (itemOhhaeng.includes(dayGanOhhaeng)) {
    score += 10; // 일주와 같은 오행 가산점
  }
  
  // 점수 범위 제한 (20-85)
  return Math.max(20, Math.min(85, Math.round(score)));
}

// 오행 균형 보너스 계산
function calculateBalanceBonus(
  balance: Record<OhHaeng, number>,
  itemOhhaeng: OhHaeng[]
): number {
  let bonus = 0;
  
  itemOhhaeng.forEach(oh => {
    const strength = balance[oh];
    
    // 균형잡힌 오행(40-60)은 가산점
    if (strength >= 40 && strength <= 60) {
      bonus += 5;
    }
    // 매우 강한 오행(70+)도 가산점
    else if (strength >= 70) {
      bonus += 8;
    }
    // 매우 약한 오행(20-)은 감점
    else if (strength <= 20) {
      bonus -= 3;
    }
  });
  
  return bonus;
}

// 샘플 사주 데이터 생성 (테스트용)
export function generateSampleSajuData(): SajuData {
  const gans: CheonGan[] = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
  const jijis: JiJi[] = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
  
  return {
    year: { gan: '갑', ji: '자' },
    month: { gan: '병', ji: '인' },
    day: { gan: '무', ji: '진' },
    time: { gan: '경', ji: '신' },
    ohHaengBalance: {
      목: 30,
      화: 25,
      토: 20,
      금: 15,
      수: 10
    }
  };
}