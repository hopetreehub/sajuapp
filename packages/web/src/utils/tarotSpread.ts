/**
 * 타로 스프레드(배치) 유틸리티
 * 다양한 타로 배치 방식과 해석 가이드
 */

import type { TarotCard } from '@/data/tarotCards';

export interface TarotCardPosition {
  card: TarotCard;
  position: number;
  positionName: string;
  positionMeaning: string;
  isReversed: boolean;
}

export interface TarotSpread {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  cardCount: number;
  exampleQuestions?: string[]; // 질문 예제
  positions: Array<{
    position: number;
    name: string;
    meaning: string;
  }>;
}

// =====================
// 타로 스프레드 정의
// =====================

export const TAROT_SPREADS: TarotSpread[] = [
  {
    id: 'one-card',
    name: 'One Card',
    nameKo: '원 카드',
    description: '오늘의 운세, 간단한 질문에 대한 답변',
    cardCount: 1,
    exampleQuestions: [
      '오늘 나에게 필요한 메시지는 무엇인가요?',
      '이번 주 나에게 가장 중요한 것은 무엇인가요?',
      '지금 이 순간 내가 집중해야 할 것은 무엇인가요?',
      '오늘의 운세는 어떤가요?',
    ],
    positions: [
      {
        position: 1,
        name: '답변',
        meaning: '질문에 대한 직접적인 답변과 조언',
      },
    ],
  },
  {
    id: 'three-card-past-present-future',
    name: 'Three Card (Past-Present-Future)',
    nameKo: '쓰리 카드 (과거-현재-미래)',
    description: '시간의 흐름에 따른 상황 파악',
    cardCount: 3,
    exampleQuestions: [
      '이 관계는 어떻게 발전할까요?',
      '내 커리어는 앞으로 어떻게 될까요?',
      '이 상황의 흐름은 어떻게 변화할까요?',
      '내 인생의 다음 단계는 무엇인가요?',
    ],
    positions: [
      {
        position: 1,
        name: '과거',
        meaning: '과거의 영향, 현재 상황의 원인',
      },
      {
        position: 2,
        name: '현재',
        meaning: '현재의 상황과 에너지',
      },
      {
        position: 3,
        name: '미래',
        meaning: '현재의 흐름이 이어질 경우 예상되는 결과',
      },
    ],
  },
  {
    id: 'three-card-situation-action-outcome',
    name: 'Three Card (Situation-Action-Outcome)',
    nameKo: '쓰리 카드 (상황-행동-결과)',
    description: '문제 해결을 위한 행동 지침',
    cardCount: 3,
    exampleQuestions: [
      '이 프로젝트를 성공시키려면 어떻게 해야 하나요?',
      '이 문제를 해결하려면 무엇을 해야 하나요?',
      '목표 달성을 위한 최선의 방법은 무엇인가요?',
      '이 상황에서 어떤 행동을 취해야 할까요?',
    ],
    positions: [
      {
        position: 1,
        name: '상황',
        meaning: '현재의 상황과 문제',
      },
      {
        position: 2,
        name: '행동',
        meaning: '취해야 할 행동이나 태도',
      },
      {
        position: 3,
        name: '결과',
        meaning: '행동을 취했을 때의 예상 결과',
      },
    ],
  },
  {
    id: 'five-card',
    name: 'Five Card',
    nameKo: '파이브 카드',
    description: '심층적인 상황 분석과 해결책',
    cardCount: 5,
    exampleQuestions: [
      '이 상황을 종합적으로 이해하고 싶습니다',
      '내 인생에서 지금 일어나고 있는 일은 무엇인가요?',
      '이 결정을 내리기 전에 알아야 할 것은 무엇인가요?',
      '현재 상황의 전체적인 그림을 보여주세요',
    ],
    positions: [
      {
        position: 1,
        name: '과거',
        meaning: '과거의 경험과 영향',
      },
      {
        position: 2,
        name: '현재',
        meaning: '현재의 상황',
      },
      {
        position: 3,
        name: '숨겨진 영향',
        meaning: '잠재의식, 숨겨진 요인',
      },
      {
        position: 4,
        name: '조언',
        meaning: '취해야 할 행동과 태도',
      },
      {
        position: 5,
        name: '결과',
        meaning: '최종적인 결과와 전망',
      },
    ],
  },
  {
    id: 'celtic-cross',
    name: 'Celtic Cross',
    nameKo: '켈틱 크로스',
    description: '가장 포괄적인 10장 배치, 깊이 있는 분석',
    cardCount: 10,
    exampleQuestions: [
      '내 인생의 전체적인 방향성을 알고 싶습니다',
      '이 중대한 결정에 대해 깊이 있는 조언이 필요합니다',
      '복잡한 상황을 완전히 이해하고 싶습니다',
      '내 삶의 모든 측면을 종합적으로 봐주세요',
    ],
    positions: [
      {
        position: 1,
        name: '현재 상황',
        meaning: '질문자의 현재 위치와 상태',
      },
      {
        position: 2,
        name: '도전과 장애물',
        meaning: '현재 직면한 문제나 장애물',
      },
      {
        position: 3,
        name: '의식적 목표',
        meaning: '의식적으로 추구하는 것',
      },
      {
        position: 4,
        name: '잠재의식',
        meaning: '무의식의 영향, 과거의 영향',
      },
      {
        position: 5,
        name: '과거',
        meaning: '과거의 사건과 경험',
      },
      {
        position: 6,
        name: '가까운 미래',
        meaning: '곧 다가올 사건이나 변화',
      },
      {
        position: 7,
        name: '당신의 태도',
        meaning: '현재의 태도와 접근 방식',
      },
      {
        position: 8,
        name: '외부 영향',
        meaning: '주변 환경과 타인의 영향',
      },
      {
        position: 9,
        name: '희망과 두려움',
        meaning: '내면의 희망과 두려움',
      },
      {
        position: 10,
        name: '최종 결과',
        meaning: '현재의 흐름이 이어질 경우 최종 결과',
      },
    ],
  },
  {
    id: 'relationship',
    name: 'Relationship Spread',
    nameKo: '관계 스프레드',
    description: '연애, 우정, 가족 관계 분석',
    cardCount: 7,
    exampleQuestions: [
      '이 사람과의 관계는 어떻게 발전할까요?',
      '우리 관계에서 개선해야 할 점은 무엇인가요?',
      '상대방은 나를 어떻게 생각하고 있나요?',
      '이 관계의 미래는 어떻게 될까요?',
    ],
    positions: [
      {
        position: 1,
        name: '당신',
        meaning: '당신의 현재 상태와 감정',
      },
      {
        position: 2,
        name: '상대방',
        meaning: '상대방의 현재 상태와 감정',
      },
      {
        position: 3,
        name: '관계의 현재',
        meaning: '두 사람 관계의 현재 상태',
      },
      {
        position: 4,
        name: '당신의 욕구',
        meaning: '당신이 원하는 것',
      },
      {
        position: 5,
        name: '상대방의 욕구',
        meaning: '상대방이 원하는 것',
      },
      {
        position: 6,
        name: '조언',
        meaning: '관계 개선을 위한 조언',
      },
      {
        position: 7,
        name: '관계의 미래',
        meaning: '관계가 나아갈 방향',
      },
    ],
  },
  {
    id: 'career',
    name: 'Career Spread',
    nameKo: '진로/커리어 스프레드',
    description: '직업, 사업, 프로젝트 관련 조언',
    cardCount: 6,
    exampleQuestions: [
      '이직을 해도 괜찮을까요?',
      '내 사업은 성공할 수 있을까요?',
      '승진 기회가 올까요?',
      '커리어에서 다음 단계는 무엇인가요?',
    ],
    positions: [
      {
        position: 1,
        name: '현재 상황',
        meaning: '현재의 직업적 상황',
      },
      {
        position: 2,
        name: '강점',
        meaning: '당신의 강점과 자원',
      },
      {
        position: 3,
        name: '약점',
        meaning: '극복해야 할 약점이나 장애물',
      },
      {
        position: 4,
        name: '기회',
        meaning: '다가오는 기회',
      },
      {
        position: 5,
        name: '조언',
        meaning: '취해야 할 행동',
      },
      {
        position: 6,
        name: '결과',
        meaning: '예상되는 결과',
      },
    ],
  },
  {
    id: 'decision-making',
    name: 'Decision Making Spread',
    nameKo: '선택 스프레드',
    description: '두 가지 선택지 중 결정할 때',
    cardCount: 7,
    exampleQuestions: [
      'A회사와 B회사 중 어디로 이직해야 할까요?',
      '유학을 가야 할까요, 취업을 해야 할까요?',
      '이 사람과 결혼해야 할까요, 더 기다려야 할까요?',
      '두 가지 선택 중 어느 것이 나에게 더 좋을까요?',
    ],
    positions: [
      {
        position: 1,
        name: '현재 상황',
        meaning: '선택을 앞둔 현재 상황',
      },
      {
        position: 2,
        name: '선택지 A - 장점',
        meaning: '첫 번째 선택의 긍정적 측면',
      },
      {
        position: 3,
        name: '선택지 A - 단점',
        meaning: '첫 번째 선택의 부정적 측면',
      },
      {
        position: 4,
        name: '선택지 A - 결과',
        meaning: '첫 번째 선택 시 예상 결과',
      },
      {
        position: 5,
        name: '선택지 B - 장점',
        meaning: '두 번째 선택의 긍정적 측면',
      },
      {
        position: 6,
        name: '선택지 B - 단점',
        meaning: '두 번째 선택의 부정적 측면',
      },
      {
        position: 7,
        name: '선택지 B - 결과',
        meaning: '두 번째 선택 시 예상 결과',
      },
    ],
  },
  {
    id: 'year-ahead',
    name: 'Year Ahead Spread',
    nameKo: '올해의 운세',
    description: '12개월 동안의 운세 전망',
    cardCount: 13,
    exampleQuestions: [
      '올해 나에게는 어떤 일들이 기다리고 있나요?',
      '2025년 나의 운세는 어떤가요?',
      '올 한 해 매달 주의해야 할 점은 무엇인가요?',
      '이번 해의 전체적인 흐름을 알고 싶습니다',
    ],
    positions: [
      {
        position: 1,
        name: '올해 전체',
        meaning: '올해 전체의 주제와 에너지',
      },
      {
        position: 2,
        name: '1월',
        meaning: '1월의 운세와 주제',
      },
      {
        position: 3,
        name: '2월',
        meaning: '2월의 운세와 주제',
      },
      {
        position: 4,
        name: '3월',
        meaning: '3월의 운세와 주제',
      },
      {
        position: 5,
        name: '4월',
        meaning: '4월의 운세와 주제',
      },
      {
        position: 6,
        name: '5월',
        meaning: '5월의 운세와 주제',
      },
      {
        position: 7,
        name: '6월',
        meaning: '6월의 운세와 주제',
      },
      {
        position: 8,
        name: '7월',
        meaning: '7월의 운세와 주제',
      },
      {
        position: 9,
        name: '8월',
        meaning: '8월의 운세와 주제',
      },
      {
        position: 10,
        name: '9월',
        meaning: '9월의 운세와 주제',
      },
      {
        position: 11,
        name: '10월',
        meaning: '10월의 운세와 주제',
      },
      {
        position: 12,
        name: '11월',
        meaning: '11월의 운세와 주제',
      },
      {
        position: 13,
        name: '12월',
        meaning: '12월의 운세와 주제',
      },
    ],
  },
];

// =====================
// 스프레드 실행 함수
// =====================

/**
 * ID로 스프레드 찾기
 */
export function getSpreadById(id: string): TarotSpread | undefined {
  return TAROT_SPREADS.find((spread) => spread.id === id);
}

/**
 * 타로 스프레드 실행 - 카드 뽑고 배치하기
 */
export function performSpread(
  spreadId: string,
  cards: TarotCard[]
): TarotCardPosition[] | null {
  const spread = getSpreadById(spreadId);
  if (!spread) return null;

  if (cards.length < spread.cardCount) {
    console.error(`Not enough cards. Required: ${spread.cardCount}, Got: ${cards.length}`);
    return null;
  }

  return spread.positions.map((pos, index) => ({
    card: cards[index],
    position: pos.position,
    positionName: pos.name,
    positionMeaning: pos.meaning,
    isReversed: Math.random() > 0.5, // 50% 확률로 역방향
  }));
}

/**
 * 카드가 정방향인지 역방향인지 결정
 */
export function determineOrientation(): boolean {
  return Math.random() > 0.5;
}

/**
 * 카드의 길흉 판단 (정방향/역방향 고려)
 */
function getFortuneDetermination(card: TarotCard, isReversed: boolean): {
  status: '매우 긍정적' | '긍정적' | '중립' | '부정적' | '매우 부정적';
  message: string;
} {
  // 메이저 아르카나 긍정/부정 분류
  const majorPositive = ['The Fool', 'The Magician', 'The Empress', 'The Lovers', 'The Chariot',
                        'Strength', 'The Star', 'The Sun', 'The World'];
  const majorNegative = ['The Tower', 'The Devil', 'Death', 'The Hanged Man', 'The Moon'];

  // 마이너 아르카나 긍정 카드 (에이스, 9, 10, 6 등)
  const minorPositive = ['Ace of Wands', 'Ace of Cups', 'Ace of Pentacles', 'Ace of Swords',
                        'Six of Wands', 'Nine of Cups', 'Ten of Cups', 'Ten of Pentacles',
                        'Four of Wands', 'Six of Pentacles', 'Nine of Pentacles'];

  // 마이너 아르카나 부정 카드 (5, 10검, 3검 등)
  const minorNegative = ['Five of Cups', 'Five of Pentacles', 'Five of Swords', 'Five of Wands',
                        'Ten of Swords', 'Nine of Swords', 'Eight of Swords', 'Seven of Swords',
                        'Three of Swords'];

  if (!isReversed) {
    // 정방향
    if (majorPositive.includes(card.name)) {
      return {
        status: '매우 긍정적',
        message: '이 카드는 **매우 좋은 징조**입니다. 상황이 유리하게 전개될 것입니다.',
      };
    }
    if (minorPositive.includes(card.name)) {
      return {
        status: '긍정적',
        message: '이 카드는 **긍정적인 신호**입니다. 좋은 결과가 기대됩니다.',
      };
    }
    if (majorNegative.includes(card.name)) {
      return {
        status: '매우 부정적',
        message: '이 카드는 **주의가 필요**합니다. 어려운 상황이 예상됩니다.',
      };
    }
    if (minorNegative.includes(card.name)) {
      return {
        status: '부정적',
        message: '이 카드는 **불리한 조건**을 나타냅니다. 신중하게 대처하세요.',
      };
    }
    return {
      status: '중립',
      message: '이 카드는 **가능성이 열려있는** 상태입니다. 당신의 선택에 달려있습니다.',
    };
  } else {
    // 역방향 - 반대로 해석
    if (majorPositive.includes(card.name)) {
      return {
        status: '부정적',
        message: '역방향으로 나와 **상황이 불리**합니다. 조심스럽게 진행하세요.',
      };
    }
    if (minorPositive.includes(card.name)) {
      return {
        status: '부정적',
        message: '역방향으로 **좋지 않은 상황**입니다. 재검토가 필요합니다.',
      };
    }
    if (majorNegative.includes(card.name)) {
      return {
        status: '긍정적',
        message: '역방향으로 **위기가 완화**됩니다. 희망이 보입니다.',
      };
    }
    if (minorNegative.includes(card.name)) {
      return {
        status: '중립',
        message: '역방향으로 **상황이 개선** 중입니다. 긍정적 변화가 시작됩니다.',
      };
    }
    return {
      status: '중립',
      message: '역방향으로 **재평가가 필요**합니다. 다른 관점에서 접근하세요.',
    };
  }
}

/**
 * 타로 카드 해석 텍스트 생성 (길흉 판단 포함)
 */
export function interpretCard(cardPosition: TarotCardPosition): string {
  const { card, positionName, positionMeaning, isReversed } = cardPosition;

  const orientation = isReversed ? '역방향' : '정방향';
  const meaning = isReversed ? card.reversedMeaning : card.uprightMeaning;
  const keywords = isReversed ? card.reversedKeywords : card.uprightKeywords;
  const fortune = getFortuneDetermination(card, isReversed);

  return `
**${positionName}**: ${card.nameKo} (${card.name}) - ${orientation}

**위치 의미**: ${positionMeaning}

**길흉 판단**: ${fortune.message}

**카드 의미**: ${meaning}

**키워드**: ${keywords.join(', ')}

**해석**: ${card.description}
  `.trim();
}

/**
 * 전체 스프레드 해석 생성
 */
export function interpretSpread(cardPositions: TarotCardPosition[]): string {
  return cardPositions.map((cp) => interpretCard(cp)).join('\n\n---\n\n');
}

// =====================
// 카드 조합 분석 시스템
// =====================

/**
 * 카드 조합 유형 정의
 */
type CombinationType =
  | 'synergy' // 시너지 (강화)
  | 'conflict' // 충돌 (약화)
  | 'amplification' // 증폭
  | 'transformation' // 변형
  | 'balance' // 균형
  | 'warning' // 경고
  | 'opportunity'; // 기회

interface CardCombination {
  type: CombinationType;
  cards: TarotCard[];
  positions: string[];
  strength: 'strong' | 'moderate' | 'weak';
  message: string;
  advice: string;
}

/**
 * 카드 조합 패턴 분석
 */
export function analyzeCardCombinations(cardPositions: TarotCardPosition[]): CardCombination[] {
  const combinations: CardCombination[] = [];

  // 2장 이상의 카드가 있을 때만 분석
  if (cardPositions.length < 2) return combinations;

  // 1. 메이저 아르카나 다중 출현 (3장 이상)
  const majorArcana = cardPositions.filter(cp => cp.card.suit === 'major');
  if (majorArcana.length >= 3) {
    combinations.push({
      type: 'amplification',
      cards: majorArcana.map(cp => cp.card),
      positions: majorArcana.map(cp => cp.positionName),
      strength: 'strong',
      message: '**메이저 아르카나가 3장 이상 출현**했습니다. 이는 **인생의 중대한 전환점**을 의미합니다.',
      advice: '이 시기는 운명적인 변화가 일어나는 중요한 순간입니다. 신중하되 과감하게 결정을 내리세요.',
    });
  }

  // 2. 같은 수트 3장 이상 (마이너 아르카나)
  const suits = ['wands', 'cups', 'swords', 'pentacles'];
  for (const suit of suits) {
    const sameSuit = cardPositions.filter(cp =>
      cp.card.suit === suit
    );

    if (sameSuit.length >= 3) {
      const suitMessages: Record<string, { message: string; advice: string }> = {
        wands: {
          message: '**지팡이 수트 3장 이상** - 행동, 열정, 창조성이 핵심 테마입니다.',
          advice: '지금은 **적극적으로 행동**할 때입니다. 아이디어를 실행에 옮기고 새로운 프로젝트를 시작하세요.',
        },
        cups: {
          message: '**컵 수트 3장 이상** - 감정, 관계, 사랑이 핵심 테마입니다.',
          advice: '**감정적 연결**에 주목하세요. 관계를 깊이 있게 발전시키고 마음의 소리에 귀 기울이세요.',
        },
        swords: {
          message: '**검 수트 3장 이상** - 사고, 갈등, 결단이 핵심 테마입니다.',
          advice: '**명확한 판단**이 필요합니다. 복잡한 상황을 논리적으로 분석하고 어려운 결정을 내려야 합니다.',
        },
        pentacles: {
          message: '**펜타클 수트 3장 이상** - 물질, 재정, 실용성이 핵심 테마입니다.',
          advice: '**현실적 계획**에 집중하세요. 재정 관리, 커리어 발전, 장기적 안정성을 추구하세요.',
        },
      };

      combinations.push({
        type: 'synergy',
        cards: sameSuit.map(cp => cp.card),
        positions: sameSuit.map(cp => cp.positionName),
        strength: 'strong',
        message: suitMessages[suit].message,
        advice: suitMessages[suit].advice,
      });
    }
  }

  // 3. 긍정-부정 카드 충돌 (인접 위치)
  for (let i = 0; i < cardPositions.length - 1; i++) {
    const current = cardPositions[i];
    const next = cardPositions[i + 1];

    const currentFortune = getFortuneDetermination(current.card, current.isReversed);
    const nextFortune = getFortuneDetermination(next.card, next.isReversed);

    // 매우 긍정적과 매우 부정적이 인접
    if (
      (currentFortune.status === '매우 긍정적' && nextFortune.status === '매우 부정적') ||
      (currentFortune.status === '매우 부정적' && nextFortune.status === '매우 긍정적')
    ) {
      combinations.push({
        type: 'conflict',
        cards: [current.card, next.card],
        positions: [current.positionName, next.positionName],
        strength: 'strong',
        message: `**극단적 대조**가 나타났습니다. ${current.positionName}과 ${next.positionName} 사이에 큰 변화가 있습니다.`,
        advice: '급격한 변화에 대비하세요. 좋은 상황에서 방심하지 말고, 어려운 상황에서도 희망을 잃지 마세요.',
      });
    }
  }

  // 4. 특정 카드 조합 패턴
  const cardNames = cardPositions.map(cp => cp.card.name);

  // 타워 + 별 = 파괴 후 재건
  if (cardNames.includes('The Tower') && cardNames.includes('The Star')) {
    const towerPos = cardPositions.find(cp => cp.card.name === 'The Tower');
    const starPos = cardPositions.find(cp => cp.card.name === 'The Star');

    combinations.push({
      type: 'transformation',
      cards: [towerPos!.card, starPos!.card],
      positions: [towerPos!.positionName, starPos!.positionName],
      strength: 'strong',
      message: '**타워와 별의 조합** - 파괴 후 희망과 재건이 따릅니다.',
      advice: '현재의 위기는 새로운 시작을 위한 과정입니다. 무너진 것을 두려워하지 말고, 더 나은 미래를 준비하세요.',
    });
  }

  // 죽음 + 심판 = 완전한 변화와 재탄생
  if (cardNames.includes('Death') && cardNames.includes('Judgement')) {
    const deathPos = cardPositions.find(cp => cp.card.name === 'Death');
    const judgementPos = cardPositions.find(cp => cp.card.name === 'Judgement');

    combinations.push({
      type: 'transformation',
      cards: [deathPos!.card, judgementPos!.card],
      positions: [deathPos!.positionName, judgementPos!.positionName],
      strength: 'strong',
      message: '**죽음과 심판의 조합** - 과거를 완전히 끝내고 새롭게 태어납니다.',
      advice: '과거에 대한 집착을 버리세요. 완전히 새로운 시작이 가능한 시기입니다. 과감하게 변화하세요.',
    });
  }

  // 연인 + 악마 = 관계의 위험
  if (cardNames.includes('The Lovers') && cardNames.includes('The Devil')) {
    const loversPos = cardPositions.find(cp => cp.card.name === 'The Lovers');
    const devilPos = cardPositions.find(cp => cp.card.name === 'The Devil');

    combinations.push({
      type: 'warning',
      cards: [loversPos!.card, devilPos!.card],
      positions: [loversPos!.positionName, devilPos!.positionName],
      strength: 'strong',
      message: '**연인과 악마의 조합** - 관계에서 집착, 의존, 유혹의 위험이 있습니다.',
      advice: '건강하지 못한 관계 패턴을 경계하세요. 사랑이 속박이 되지 않도록 주의하세요.',
    });
  }

  // 에이스 카드 2장 이상 = 새로운 시작의 기회
  const aces = cardPositions.filter(cp => cp.card.name.startsWith('Ace of'));
  if (aces.length >= 2) {
    combinations.push({
      type: 'opportunity',
      cards: aces.map(cp => cp.card),
      positions: aces.map(cp => cp.positionName),
      strength: 'strong',
      message: '**에이스 카드 다중 출현** - 여러 분야에서 새로운 시작의 기회가 옵니다.',
      advice: '지금은 씨앗을 뿌릴 때입니다. 다양한 가능성에 열린 마음으로 도전하세요.',
    });
  }

  // 5. 숫자 패턴 (같은 숫자 3장 이상)
  const numbers = ['Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
  for (const num of numbers) {
    const sameNumber = cardPositions.filter(cp => cp.card.name.includes(num));

    if (sameNumber.length >= 3) {
      const numberMeanings: Record<string, { message: string; advice: string }> = {
        Two: {
          message: '**숫자 2가 반복** - 선택, 균형, 파트너십이 중요합니다.',
          advice: '협력과 조화를 추구하세요. 중요한 선택을 앞두고 있습니다.',
        },
        Three: {
          message: '**숫자 3이 반복** - 창조, 성장, 표현이 활발합니다.',
          advice: '창의성을 발휘하고 소통하세요. 협업을 통해 더 큰 성과를 낼 수 있습니다.',
        },
        Four: {
          message: '**숫자 4가 반복** - 안정, 기초, 구조가 핵심입니다.',
          advice: '탄탄한 기반을 다지세요. 서두르지 말고 차근차근 진행하세요.',
        },
        Five: {
          message: '**숫자 5가 반복** - 변화, 도전, 갈등이 많습니다.',
          advice: '변화를 받아들이세요. 어려움 속에서 성장의 기회를 찾으세요.',
        },
        Six: {
          message: '**숫자 6이 반복** - 조화, 책임, 치유가 필요합니다.',
          advice: '균형을 회복하세요. 타인에 대한 책임과 자신에 대한 돌봄 사이의 조화를 찾으세요.',
        },
        Seven: {
          message: '**숫자 7이 반복** - 성찰, 평가, 전략이 중요합니다.',
          advice: '깊이 생각하세요. 행동하기 전에 현재 상황을 신중히 평가하세요.',
        },
        Eight: {
          message: '**숫자 8이 반복** - 움직임, 발전, 힘이 증가합니다.',
          advice: '적극적으로 행동하세요. 추진력을 가지고 목표를 향해 나아가세요.',
        },
        Nine: {
          message: '**숫자 9가 반복** - 완성, 성취, 완결이 가까워집니다.',
          advice: '마무리에 집중하세요. 거의 다 왔으니 끝까지 완수하세요.',
        },
        Ten: {
          message: '**숫자 10이 반복** - 순환의 끝, 새로운 시작이 옵니다.',
          advice: '한 사이클이 끝나고 있습니다. 배운 것을 정리하고 새로운 단계로 나아가세요.',
        },
      };

      if (numberMeanings[num]) {
        combinations.push({
          type: 'synergy',
          cards: sameNumber.map(cp => cp.card),
          positions: sameNumber.map(cp => cp.positionName),
          strength: 'moderate',
          message: numberMeanings[num].message,
          advice: numberMeanings[num].advice,
        });
      }
    }
  }

  // 6. 과거-현재-미래 흐름 분석 (3카드 스프레드)
  if (cardPositions.length === 3 &&
      cardPositions.some(cp => cp.positionName === '과거') &&
      cardPositions.some(cp => cp.positionName === '현재') &&
      cardPositions.some(cp => cp.positionName === '미래')) {

    const past = cardPositions.find(cp => cp.positionName === '과거')!;
    const present = cardPositions.find(cp => cp.positionName === '현재')!;
    const future = cardPositions.find(cp => cp.positionName === '미래')!;

    const pastFortune = getFortuneDetermination(past.card, past.isReversed);
    const presentFortune = getFortuneDetermination(present.card, present.isReversed);
    const futureFortune = getFortuneDetermination(future.card, future.isReversed);

    // 상승 추세 (부정→중립→긍정 또는 부정→긍정)
    if (
      (pastFortune.status.includes('부정') && futureFortune.status.includes('긍정')) ||
      (pastFortune.status === '부정적' && presentFortune.status === '중립' && futureFortune.status.includes('긍정'))
    ) {
      combinations.push({
        type: 'opportunity',
        cards: [past.card, present.card, future.card],
        positions: ['과거', '현재', '미래'],
        strength: 'strong',
        message: '**상승 추세** - 어려움을 극복하고 점점 좋아지는 흐름입니다.',
        advice: '현재의 노력을 계속하세요. 상황이 긍정적으로 변화하고 있습니다.',
      });
    }

    // 하락 추세 (긍정→부정)
    if (
      (pastFortune.status.includes('긍정') && futureFortune.status.includes('부정')) ||
      (pastFortune.status.includes('긍정') && presentFortune.status === '중립' && futureFortune.status.includes('부정'))
    ) {
      combinations.push({
        type: 'warning',
        cards: [past.card, present.card, future.card],
        positions: ['과거', '현재', '미래'],
        strength: 'strong',
        message: '**하락 추세** - 현재 방향을 유지하면 상황이 악화될 수 있습니다.',
        advice: '지금이 변화의 시점입니다. 현재의 접근 방식을 재검토하고 수정하세요.',
      });
    }
  }

  return combinations;
}

/**
 * 카드 조합 분석 텍스트 생성
 */
export function formatCombinationAnalysis(combinations: CardCombination[]): string {
  if (combinations.length === 0) {
    return '';
  }

  const sortedCombinations = combinations.sort((a, b) => {
    const strengthOrder = { strong: 0, moderate: 1, weak: 2 };
    return strengthOrder[a.strength] - strengthOrder[b.strength];
  });

  const sections = sortedCombinations.map((combo, index) => {
    const strengthEmoji = combo.strength === 'strong' ? '🔥' : combo.strength === 'moderate' ? '⚡' : '💡';
    const typeEmoji = {
      synergy: '✨',
      conflict: '⚔️',
      amplification: '📈',
      transformation: '🔄',
      balance: '⚖️',
      warning: '⚠️',
      opportunity: '🎯',
    }[combo.type];

    return `
${index + 1}. ${typeEmoji} ${strengthEmoji} **카드 조합 발견**

${combo.message}

**관련 위치**: ${combo.positions.join(', ')}
**관련 카드**: ${combo.cards.map(c => c.nameKo).join(', ')}

**조언**: ${combo.advice}
    `.trim();
  });

  return `
## 🔮 카드 조합 분석

${sections.join('\n\n')}
  `.trim();
}

/**
 * AI 프롬프트용 스프레드 정보 생성
 */
export function generateSpreadPrompt(
  spreadId: string,
  cardPositions: TarotCardPosition[],
  userQuestion: string
): string {
  const spread = getSpreadById(spreadId);
  if (!spread) return '';

  const cardsInfo = cardPositions
    .map((cp) => {
      const orientation = cp.isReversed ? '역방향' : '정방향';
      const meaning = cp.isReversed ? cp.card.reversedMeaning : cp.card.uprightMeaning;
      const keywords = cp.isReversed ? cp.card.reversedKeywords : cp.card.uprightKeywords;
      const fortune = getFortuneDetermination(cp.card, cp.isReversed);

      return `
${cp.position}. ${cp.positionName} (${cp.positionMeaning})
   카드: ${cp.card.nameKo} (${cp.card.name})
   방향: ${orientation}
   길흉: ${fortune.status} - ${fortune.message}
   의미: ${meaning}
   키워드: ${keywords.join(', ')}
   상징: ${cp.card.symbolism}
      `.trim();
    })
    .join('\n\n');

  // 카드 조합 분석 추가
  const combinations = analyzeCardCombinations(cardPositions);
  let combinationInfo = '';
  if (combinations.length > 0) {
    combinationInfo = `\n\n카드 조합 특이사항:\n${combinations
      .map((combo, index) => {
        const typeKorean = {
          synergy: '시너지',
          conflict: '충돌',
          amplification: '증폭',
          transformation: '변형',
          balance: '균형',
          warning: '경고',
          opportunity: '기회',
        }[combo.type];

        return `${index + 1}. [${typeKorean}] ${combo.message}\n   조언: ${combo.advice}\n   관련 카드: ${combo.cards.map(c => c.nameKo).join(', ')}`;
      })
      .join('\n\n')}`;
  }

  return `
타로 리딩 요청

사용자 질문: ${userQuestion}

스프레드: ${spread.nameKo} (${spread.name})
설명: ${spread.description}

뽑힌 카드들:
${cardsInfo}${combinationInfo}

---

위 타로 카드들을 바탕으로 사용자의 질문에 대한 명확하고 직접적인 해석을 제공해주세요.

필수 요구사항:
1. **길흉 판단을 분명히 하세요**
   - 좋은 카드: "매우 긍정적입니다", "좋은 결과가 예상됩니다", "유리한 상황입니다"
   - 나쁜 카드: "어려운 상황입니다", "주의가 필요합니다", "불리한 조건입니다"
   - 중립 카드: "가능성이 열려있습니다", "당신의 선택에 달려있습니다"

2. **구체적인 조언을 하세요**
   - "~하는 것이 좋습니다", "~은 피하세요", "~에 집중하세요"
   - 막연한 조언 대신 실행 가능한 행동 지침

3. **현실적으로 말하세요**
   - 과도한 낙관이나 위로 금지
   - 객관적 사실과 가능성 중심으로 전달
   - "모든 것이 잘 될 거예요" 같은 애매한 표현 금지

4. **각 위치별로 명확한 메시지**
   - 각 카드가 해당 위치에서 의미하는 바를 직접적으로 설명
   - 긍정/부정/중립을 명확히 구분하여 전달

5. **카드 조합 해석 반영**
   ${combinations.length > 0 ? `- 위에 제시된 ${combinations.length}개의 카드 조합 특이사항을 반드시 해석에 반영하세요
   - 조합에서 발견된 시너지, 충돌, 변형 등을 해석에 포함하세요
   - 조합 분석에서 나온 조언을 종합 해석에 통합하세요` : '- 개별 카드의 의미를 종합하여 해석하세요'}

답변 구조:
1. **전체 흐름 요약** (2-3문장, 길흉 판단 포함${combinations.length > 0 ? ', 주요 카드 조합 언급' : ''})
2. **각 카드 위치별 해석** (위치마다 긍정/부정 명시)
${combinations.length > 0 ? '3. **카드 조합의 의미** (조합에서 발견된 특별한 패턴과 그 의미)\n4' : '3'}. **구체적 행동 지침** (해야 할 일 3가지, 피해야 할 일 2가지)
${combinations.length > 0 ? '5' : '4'}. **타이밍과 주의사항** (언제, 무엇을 조심해야 하는지)
  `.trim();
}
