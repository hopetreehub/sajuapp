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

      return `
${cp.position}. ${cp.positionName} (${cp.positionMeaning})
   카드: ${cp.card.nameKo} (${cp.card.name})
   방향: ${orientation}
   의미: ${meaning}
   키워드: ${keywords.join(', ')}
   상징: ${cp.card.symbolism}
      `.trim();
    })
    .join('\n\n');

  return `
타로 리딩 요청

사용자 질문: ${userQuestion}

스프레드: ${spread.nameKo} (${spread.name})
설명: ${spread.description}

뽑힌 카드들:
${cardsInfo}

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

답변 구조:
1. **전체 흐름 요약** (2-3문장, 길흉 판단 포함)
2. **각 카드 위치별 해석** (위치마다 긍정/부정 명시)
3. **구체적 행동 지침** (해야 할 일 3가지, 피해야 할 일 2가지)
4. **타이밍과 주의사항** (언제, 무엇을 조심해야 하는지)
  `.trim();
}
