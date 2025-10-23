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

// =====================
// 질문 카테고리 시스템
// =====================

/**
 * 타로 질문 카테고리 타입
 */
export type QuestionCategory =
  | 'health'       // 🏥 건강
  | 'wealth'       // 💰 재물
  | 'love'         // ❤️  사랑/연애
  | 'relationship' // 👥 인간관계
  | 'career'       // 💼 사업/커리어
  | 'study'        // 📚 학업/성장
  | 'general';     // 🌟 일반/운세

/**
 * 카테고리 메타데이터 인터페이스
 */
export interface QuestionCategoryInfo {
  id: QuestionCategory;
  name: string;
  emoji: string;
  description: string;
  // 다크모드 최적화 색상 클래스 (Tailwind)
  colorClasses: {
    active: string;      // 선택된 탭
    inactive: string;    // 선택되지 않은 탭
    hover: string;       // 호버 상태
  };
}

/**
 * 카테고리별 질문 구조
 */
export interface CategorizedQuestion {
  category: QuestionCategory;
  question: string;
}

export interface TarotSpread {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  cardCount: number;
  exampleQuestions?: string[]; // @deprecated - 호환성 유지용
  categorizedQuestions?: CategorizedQuestion[]; // 새로운 카테고리 기반 질문
  positions: Array<{
    position: number;
    name: string;
    meaning: string;
  }>;
}

// =====================
// 질문 카테고리 메타데이터
// =====================

/**
 * 7대 질문 카테고리 정의
 * - 다크모드 최적화: 낮은 채도의 부드러운 색상 사용
 * - 기존 시스템 색상과 조화: Purple/Pink/Blue 계열 중심
 */
export const QUESTION_CATEGORIES: QuestionCategoryInfo[] = [
  {
    id: 'health',
    name: '건강',
    emoji: '🏥',
    description: '건강, 질병, 치료, 웰빙 관련',
    colorClasses: {
      active: 'bg-emerald-500 dark:bg-emerald-600 text-white shadow-lg',
      inactive: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
      hover: 'hover:bg-emerald-200 dark:hover:bg-emerald-900/50',
    },
  },
  {
    id: 'wealth',
    name: '재물',
    emoji: '💰',
    description: '금전, 투자, 재산, 수입 관련',
    colorClasses: {
      active: 'bg-amber-500 dark:bg-amber-600 text-white shadow-lg',
      inactive: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      hover: 'hover:bg-amber-200 dark:hover:bg-amber-900/50',
    },
  },
  {
    id: 'love',
    name: '사랑/연애',
    emoji: '❤️',
    description: '연애, 결혼, 이별, 만남 관련',
    colorClasses: {
      active: 'bg-rose-500 dark:bg-rose-600 text-white shadow-lg',
      inactive: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
      hover: 'hover:bg-rose-200 dark:hover:bg-rose-900/50',
    },
  },
  {
    id: 'relationship',
    name: '인간관계',
    emoji: '👥',
    description: '친구, 가족, 직장 동료 관계',
    colorClasses: {
      active: 'bg-sky-500 dark:bg-sky-600 text-white shadow-lg',
      inactive: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
      hover: 'hover:bg-sky-200 dark:hover:bg-sky-900/50',
    },
  },
  {
    id: 'career',
    name: '사업/커리어',
    emoji: '💼',
    description: '직장, 사업, 승진, 이직 관련',
    colorClasses: {
      active: 'bg-indigo-500 dark:bg-indigo-600 text-white shadow-lg',
      inactive: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
      hover: 'hover:bg-indigo-200 dark:hover:bg-indigo-900/50',
    },
  },
  {
    id: 'study',
    name: '학업/성장',
    emoji: '📚',
    description: '공부, 시험, 자기계발 관련',
    colorClasses: {
      active: 'bg-violet-500 dark:bg-violet-600 text-white shadow-lg',
      inactive: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
      hover: 'hover:bg-violet-200 dark:hover:bg-violet-900/50',
    },
  },
  {
    id: 'general',
    name: '일반/운세',
    emoji: '🌟',
    description: '오늘의 운세, 전반적 조언',
    colorClasses: {
      active: 'bg-purple-500 dark:bg-purple-600 text-white shadow-lg',
      inactive: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      hover: 'hover:bg-purple-200 dark:hover:bg-purple-900/50',
    },
  },
];

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
      '오늘의 운세는 어떤가요?',
      '지금 내가 가장 집중해야 할 것은?',
      '이번 주 나에게 가장 중요한 것은?',
      '오늘 조심해야 할 일이 있나요?',
      '지금 나에게 필요한 조언은?',
      '오늘의 행운 키워드는?',
      '이 결정을 내려도 괜찮을까요?',
    ],
    // 카테고리별 질문 (새로운 방식)
    categorizedQuestions: [
      // 건강
      { category: 'health', question: '오늘 내 건강 상태는 어떤가요?' },
      { category: 'health', question: '이 증상이 호전될까요?' },
      { category: 'health', question: '건강을 위해 무엇을 해야 할까요?' },

      // 재물
      { category: 'wealth', question: '오늘 금전운은 어떤가요?' },
      { category: 'wealth', question: '이 투자 결정이 괜찮을까요?' },
      { category: 'wealth', question: '돈 관리에서 주의할 점은?' },

      // 사랑/연애
      { category: 'love', question: '오늘 연애운은 어떤가요?' },
      { category: 'love', question: '이 사람과의 관계는 어떻게 될까요?' },
      { category: 'love', question: '고백해도 괜찮을까요?' },

      // 인간관계
      { category: 'relationship', question: '오늘 인간관계운은 어떤가요?' },
      { category: 'relationship', question: '이 사람과의 갈등은 해결될까요?' },
      { category: 'relationship', question: '친구 관계에서 주의할 점은?' },

      // 사업/커리어
      { category: 'career', question: '오늘 업무운은 어떤가요?' },
      { category: 'career', question: '이 프로젝트는 성공할까요?' },
      { category: 'career', question: '이직해도 괜찮을까요?' },

      // 학업/성장
      { category: 'study', question: '오늘 학업운은 어떤가요?' },
      { category: 'study', question: '이 시험에 합격할까요?' },
      { category: 'study', question: '공부에서 집중해야 할 부분은?' },

      // 일반/운세
      { category: 'general', question: '오늘 나에게 필요한 메시지는?' },
      { category: 'general', question: '오늘의 전체 운세는 어떤가요?' },
      { category: 'general', question: '이 결정을 내려도 괜찮을까요?' },
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
      '이 상황은 앞으로 어떻게 변할까요?',
      '내 인생의 다음 단계는 무엇인가요?',
      '이 문제는 언제 해결될까요?',
      '내 사랑은 어떻게 흘러갈까요?',
      '내 금전 운은 앞으로 어떻게 될까요?',
      '건강 상태는 앞으로 어떻게 변할까요?',
      '이 프로젝트의 결과는 어떻게 될까요?',
      '내가 원하는 것을 이룰 수 있을까요?',
    ],
    // 카테고리별 질문 (과거-현재-미래 흐름에 초점)
    categorizedQuestions: [
      // 건강
      { category: 'health', question: '내 건강 상태는 앞으로 어떻게 변할까요?' },
      { category: 'health', question: '이 증상의 과거 원인과 미래 경과는?' },
      { category: 'health', question: '건강 개선의 흐름은 어떻게 될까요?' },
      { category: 'health', question: '체력 회복은 언제쯤 될까요?' },
      { category: 'health', question: '운동 습관이 미래에 어떤 영향을 줄까요?' },

      // 재물
      { category: 'wealth', question: '내 재정 상태는 앞으로 어떻게 될까요?' },
      { category: 'wealth', question: '이 투자의 과거부터 미래까지 흐름은?' },
      { category: 'wealth', question: '금전운이 앞으로 좋아질까요?' },
      { category: 'wealth', question: '수입은 언제쯤 증가할까요?' },
      { category: 'wealth', question: '재테크 계획이 성공할 수 있을까요?' },

      // 사랑/연애
      { category: 'love', question: '이 사람과의 관계는 어떻게 발전할까요?' },
      { category: 'love', question: '우리 사랑의 과거와 미래는?' },
      { category: 'love', question: '짝사랑은 언제쯤 이루어질까요?' },
      { category: 'love', question: '연애 운명이 바뀔 시기는 언제인가요?' },
      { category: 'love', question: '이별 후 새로운 만남은 언제 올까요?' },

      // 인간관계
      { category: 'relationship', question: '이 사람과의 관계는 앞으로 어떻게 될까요?' },
      { category: 'relationship', question: '갈등이 해결되고 관계가 회복될까요?' },
      { category: 'relationship', question: '친구 관계가 더 깊어질 수 있을까요?' },
      { category: 'relationship', question: '가족 관계의 변화 흐름은?' },
      { category: 'relationship', question: '직장 내 인간관계는 어떻게 변할까요?' },

      // 사업/커리어
      { category: 'career', question: '내 커리어는 앞으로 어떻게 될까요?' },
      { category: 'career', question: '이 프로젝트의 결과는 어떻게 될까요?' },
      { category: 'career', question: '승진 기회는 언제쯤 올까요?' },
      { category: 'career', question: '사업 흐름이 호전될까요?' },
      { category: 'career', question: '직장 생활의 미래 전망은?' },

      // 학업/성장
      { category: 'study', question: '학업 성적은 앞으로 어떻게 될까요?' },
      { category: 'study', question: '이 공부가 미래에 도움이 될까요?' },
      { category: 'study', question: '시험 합격은 언제쯤 가능할까요?' },
      { category: 'study', question: '자기계발 노력이 결실을 맺을까요?' },
      { category: 'study', question: '배움의 여정은 어떻게 흘러갈까요?' },

      // 일반/운세
      { category: 'general', question: '내 인생은 앞으로 어떻게 변할까요?' },
      { category: 'general', question: '이 결정의 과거와 미래 영향은?' },
      { category: 'general', question: '운이 좋아지는 시기는 언제인가요?' },
      { category: 'general', question: '지금 상황이 언제 해결될까요?' },
      { category: 'general', question: '내가 원하는 것을 이룰 수 있을까요?' },
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
      '목표 달성을 위한 최선의 방법은?',
      '이 상황에서 어떤 행동을 취해야 할까요?',
      '이 일을 성공시키려면 뭘 해야 할까요?',
      '관계 개선을 위해 내가 할 수 있는 건?',
      '돈을 모으려면 어떻게 해야 할까요?',
      '승진하려면 무엇이 필요한가요?',
      '시험에 합격하려면 어떻게 해야 하나요?',
      '건강을 회복하려면 무엇을 해야 할까요?',
    ],
    // 카테고리별 질문 (문제 해결과 행동 지침에 초점)
    categorizedQuestions: [
      // 건강
      { category: 'health', question: '건강을 회복하려면 무엇을 해야 할까요?' },
      { category: 'health', question: '체력을 증진시키기 위한 행동은?' },
      { category: 'health', question: '이 질병을 극복하려면 어떻게 해야 하나요?' },
      { category: 'health', question: '다이어트에 성공하려면 무엇이 필요한가요?' },
      { category: 'health', question: '건강한 습관을 만들려면 어떻게 해야 할까요?' },

      // 재물
      { category: 'wealth', question: '돈을 모으려면 어떻게 해야 할까요?' },
      { category: 'wealth', question: '재정 문제를 해결하기 위한 방법은?' },
      { category: 'wealth', question: '투자 수익을 내려면 무엇을 해야 하나요?' },
      { category: 'wealth', question: '부자가 되기 위해 필요한 행동은?' },
      { category: 'wealth', question: '빚을 갚으려면 어떤 노력이 필요한가요?' },

      // 사랑/연애
      { category: 'love', question: '고백을 성공시키려면 어떻게 해야 할까요?' },
      { category: 'love', question: '이 사람의 마음을 얻으려면 무엇이 필요한가요?' },
      { category: 'love', question: '연인과의 갈등을 해결하려면?' },
      { category: 'love', question: '결혼까지 가려면 어떻게 해야 할까요?' },
      { category: 'love', question: '새로운 인연을 만나려면 무엇을 해야 하나요?' },

      // 인간관계
      { category: 'relationship', question: '관계 개선을 위해 내가 할 수 있는 건?' },
      { category: 'relationship', question: '갈등을 해결하려면 어떤 행동이 필요한가요?' },
      { category: 'relationship', question: '친구와 화해하려면 무엇을 해야 할까요?' },
      { category: 'relationship', question: '좋은 인간관계를 만들려면?' },
      { category: 'relationship', question: '오해를 풀기 위해 필요한 것은?' },

      // 사업/커리어
      { category: 'career', question: '이 프로젝트를 성공시키려면 어떻게 해야 하나요?' },
      { category: 'career', question: '승진하려면 무엇이 필요한가요?' },
      { category: 'career', question: '사업을 키우려면 어떤 노력이 필요한가요?' },
      { category: 'career', question: '이직에 성공하려면 무엇을 해야 할까요?' },
      { category: 'career', question: '직장에서 인정받으려면 어떻게 해야 하나요?' },

      // 학업/성장
      { category: 'study', question: '시험에 합격하려면 어떻게 해야 하나요?' },
      { category: 'study', question: '성적을 올리기 위해 필요한 것은?' },
      { category: 'study', question: '공부 습관을 만들려면 어떻게 해야 할까요?' },
      { category: 'study', question: '자격증 취득에 성공하려면?' },
      { category: 'study', question: '실력 향상을 위해 필요한 행동은?' },

      // 일반/운세
      { category: 'general', question: '목표 달성을 위한 최선의 방법은?' },
      { category: 'general', question: '이 문제를 해결하려면 무엇을 해야 하나요?' },
      { category: 'general', question: '행운을 만들려면 어떻게 해야 할까요?' },
      { category: 'general', question: '원하는 것을 얻으려면 무엇이 필요한가요?' },
      { category: 'general', question: '상황을 개선하기 위한 행동은?' },
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
      '지금 내 인생에서 일어나고 있는 일은?',
      '이 결정을 내리기 전에 알아야 할 것은?',
      '현재 상황의 전체 그림을 보여주세요',
      '내 인생의 전반적인 흐름은 어떤가요?',
      '이 문제의 근본 원인은 무엇인가요?',
      '내가 놓치고 있는 것은 무엇인가요?',
      '지금 나에게 가장 필요한 변화는?',
    ],
    // 카테고리별 질문 (심층 분석에 초점)
    categorizedQuestions: [
      // 건강
      { category: 'health', question: '내 건강 문제의 근본 원인은 무엇인가요?' },
      { category: 'health', question: '건강 상태를 종합적으로 분석해주세요' },
      { category: 'health', question: '건강 회복을 위해 놓치고 있는 것은?' },
      { category: 'health', question: '전체적인 건강 흐름과 조언을 알려주세요' },

      // 재물
      { category: 'wealth', question: '재정 상태를 심층적으로 분석해주세요' },
      { category: 'wealth', question: '돈 문제의 숨겨진 원인은 무엇인가요?' },
      { category: 'wealth', question: '재물운의 전체 흐름을 알고 싶습니다' },
      { category: 'wealth', question: '경제적 자유를 위해 필요한 전략은?' },

      // 사랑/연애
      { category: 'love', question: '이 관계를 종합적으로 분석해주세요' },
      { category: 'love', question: '연애의 숨겨진 문제점은 무엇인가요?' },
      { category: 'love', question: '사랑 운명의 전체 그림을 보여주세요' },
      { category: 'love', question: '관계 발전을 위한 심층 조언은?' },

      // 인간관계
      { category: 'relationship', question: '인간관계의 전반적인 상황은?' },
      { category: 'relationship', question: '관계 문제의 근본 원인은 무엇인가요?' },
      { category: 'relationship', question: '사람들과의 관계를 심층 분석해주세요' },
      { category: 'relationship', question: '내가 놓치고 있는 인간관계 요소는?' },

      // 사업/커리어
      { category: 'career', question: '내 커리어의 전체적인 흐름은?' },
      { category: 'career', question: '직업 생활의 숨겨진 문제는 무엇인가요?' },
      { category: 'career', question: '사업 상황을 종합적으로 분석해주세요' },
      { category: 'career', question: '커리어 발전을 위한 심층 조언은?' },

      // 학업/성장
      { category: 'study', question: '학업의 전반적인 상황을 분석해주세요' },
      { category: 'study', question: '성장을 가로막는 숨겨진 요인은?' },
      { category: 'study', question: '배움의 여정을 종합적으로 봐주세요' },
      { category: 'study', question: '자기계발을 위한 심층 조언은?' },

      // 일반/운세
      { category: 'general', question: '현재 상황의 전체 그림을 보여주세요' },
      { category: 'general', question: '이 상황을 종합적으로 이해하고 싶습니다' },
      { category: 'general', question: '내 인생의 전반적인 흐름은 어떤가요?' },
      { category: 'general', question: '지금 나에게 가장 필요한 변화는?' },
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
      '인생의 중요한 전환점에서 조언이 필요합니다',
      '이 관계의 모든 면을 깊이 알고 싶습니다',
      '내 커리어의 전체 흐름을 파악하고 싶습니다',
      '복잡한 문제를 근본적으로 해결하고 싶습니다',
    ],
    // 카테고리별 질문 (가장 포괄적이고 깊이 있는 분석)
    categorizedQuestions: [
      // 건강
      { category: 'health', question: '내 건강의 모든 측면을 완전히 분석해주세요' },
      { category: 'health', question: '건강 문제를 근본적으로 해결하고 싶습니다' },
      { category: 'health', question: '건강과 관련된 인생의 중대한 결정이 필요합니다' },

      // 재물
      { category: 'wealth', question: '재정 상황의 모든 면을 깊이 있게 분석해주세요' },
      { category: 'wealth', question: '경제적 문제를 근본적으로 해결하고 싶습니다' },
      { category: 'wealth', question: '재물과 관련된 중대한 결정이 필요합니다' },

      // 사랑/연애
      { category: 'love', question: '이 관계의 모든 면을 깊이 알고 싶습니다' },
      { category: 'love', question: '연애와 결혼에 대한 깊이 있는 조언이 필요합니다' },
      { category: 'love', question: '사랑과 관련된 인생의 전환점에 서 있습니다' },

      // 인간관계
      { category: 'relationship', question: '복잡한 인간관계를 완전히 이해하고 싶습니다' },
      { category: 'relationship', question: '관계의 모든 측면을 종합적으로 봐주세요' },
      { category: 'relationship', question: '중요한 관계 결정에 대한 깊은 통찰이 필요합니다' },

      // 사업/커리어
      { category: 'career', question: '내 커리어의 전체 흐름을 파악하고 싶습니다' },
      { category: 'career', question: '직업 생활의 모든 측면을 깊이 분석해주세요' },
      { category: 'career', question: '커리어 전환점에서 중대한 결정이 필요합니다' },

      // 학업/성장
      { category: 'study', question: '배움과 성장의 전체적인 방향을 알고 싶습니다' },
      { category: 'study', question: '자기계발의 모든 측면을 종합적으로 봐주세요' },
      { category: 'study', question: '학업과 관련된 중요한 결정이 필요합니다' },

      // 일반/운세
      { category: 'general', question: '내 인생의 전체적인 방향성을 알고 싶습니다' },
      { category: 'general', question: '내 삶의 모든 측면을 종합적으로 봐주세요' },
      { category: 'general', question: '인생의 중요한 전환점에서 조언이 필요합니다' },
      { category: 'general', question: '복잡한 문제를 근본적으로 해결하고 싶습니다' },
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
      '우리 관계에서 개선해야 할 점은?',
      '상대방은 나를 어떻게 생각하고 있나요?',
      '이 관계의 미래는 어떻게 될까요?',
      '이 사람과 연애해도 괜찮을까요?',
      '우리 관계가 더 나아질 수 있을까요?',
      '이별 후 복원이 가능할까요?',
      '소원이는 나를 좋아하나요?',
      '이 사람과 결혼하면 행복할까요?',
      '친구와의 갈등을 어떻게 풀어야 할까요?',
      '가족 관계를 개선하려면 어떻게 해야 할까요?',
      '직장 상사와의 관계는 어떻게 될까요?',
    ],
    // 카테고리별 질문 (관계 맥락에 초점)
    categorizedQuestions: [
      // 건강 (관계 맥락)
      { category: 'health', question: '건강이 우리 관계에 미치는 영향은?' },
      { category: 'health', question: '상대방과 함께 건강을 관리하려면?' },

      // 재물 (관계 맥락)
      { category: 'wealth', question: '금전 문제가 관계에 미치는 영향은?' },
      { category: 'wealth', question: '둘이 함께 재정을 관리하려면?' },
      { category: 'wealth', question: '돈 때문에 생긴 갈등을 해결하려면?' },

      // 사랑/연애 (주력)
      { category: 'love', question: '이 사람과의 관계는 어떻게 발전할까요?' },
      { category: 'love', question: '상대방은 나를 어떻게 생각하고 있나요?' },
      { category: 'love', question: '이 사람과 연애해도 괜찮을까요?' },
      { category: 'love', question: '우리 관계가 더 나아질 수 있을까요?' },
      { category: 'love', question: '이별 후 복원이 가능할까요?' },
      { category: 'love', question: '이 사람과 결혼하면 행복할까요?' },
      { category: 'love', question: '연인과의 갈등을 해결하려면?' },
      { category: 'love', question: '두 사람의 궁합은 어떤가요?' },

      // 인간관계 (주력)
      { category: 'relationship', question: '우리 관계에서 개선해야 할 점은?' },
      { category: 'relationship', question: '이 관계의 미래는 어떻게 될까요?' },
      { category: 'relationship', question: '친구와의 갈등을 어떻게 풀어야 할까요?' },
      { category: 'relationship', question: '가족 관계를 개선하려면 어떻게 해야 할까요?' },
      { category: 'relationship', question: '직장 상사와의 관계는 어떻게 될까요?' },
      { category: 'relationship', question: '동료와의 관계를 개선하려면?' },
      { category: 'relationship', question: '부모님과의 관계 문제를 해결하려면?' },
      { category: 'relationship', question: '형제자매와의 갈등을 풀려면?' },

      // 사업/커리어 (관계 맥락)
      { category: 'career', question: '직장 내 인간관계는 어떤가요?' },
      { category: 'career', question: '비즈니스 파트너와의 관계는?' },
      { category: 'career', question: '상사와의 관계를 개선하려면?' },

      // 학업/성장 (관계 맥락)
      { category: 'study', question: '스터디 그룹 내 관계는 어떤가요?' },
      { category: 'study', question: '선생님과의 관계는 어떤가요?' },

      // 일반/운세 (관계 맥락)
      { category: 'general', question: '전반적인 대인 운세는 어떤가요?' },
      { category: 'general', question: '새로운 인연을 만날 수 있을까요?' },
      { category: 'general', question: '인간관계에서 주의할 점은?' },
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
      '지금 창업해도 괜찮을까요?',
      '이 회사에 입사하면 어떨까요?',
      '프리랜서로 전환하는 게 좋을까요?',
      '내 일이 인정받을 수 있을까요?',
      '연봉 협상은 어떻게 해야 할까요?',
      '직장을 그만둬도 괜찮을까요?',
      '새로운 분야로 전환해도 될까요?',
      '사업 확장 시기가 맞나요?',
    ],
    // 카테고리별 질문 (커리어 맥락에 초점)
    categorizedQuestions: [
      // 건강 (커리어 맥락)
      { category: 'health', question: '건강이 직장 생활에 미치는 영향은?' },
      { category: 'health', question: '워라밸을 맞추려면 어떻게 해야 할까요?' },

      // 재물 (커리어 맥락)
      { category: 'wealth', question: '연봉 협상은 어떻게 해야 할까요?' },
      { category: 'wealth', question: '직장에서 수입을 늘리려면?' },
      { category: 'wealth', question: '사업 수익은 증가할까요?' },

      // 사랑/연애 (커리어 맥락)
      { category: 'love', question: '직장에서 만난 사람과 연애해도 될까요?' },
      { category: 'love', question: '연애와 커리어의 균형을 맞추려면?' },

      // 인간관계 (커리어 맥락)
      { category: 'relationship', question: '직장 내 인간관계는 어떤가요?' },
      { category: 'relationship', question: '상사와의 관계를 개선하려면?' },
      { category: 'relationship', question: '동료들과 협업을 잘하려면?' },

      // 사업/커리어 (주력)
      { category: 'career', question: '이직을 해도 괜찮을까요?' },
      { category: 'career', question: '내 사업은 성공할 수 있을까요?' },
      { category: 'career', question: '승진 기회가 올까요?' },
      { category: 'career', question: '커리어에서 다음 단계는 무엇인가요?' },
      { category: 'career', question: '지금 창업해도 괜찮을까요?' },
      { category: 'career', question: '이 회사에 입사하면 어떨까요?' },
      { category: 'career', question: '프리랜서로 전환하는 게 좋을까요?' },
      { category: 'career', question: '내 일이 인정받을 수 있을까요?' },
      { category: 'career', question: '직장을 그만둬도 괜찮을까요?' },
      { category: 'career', question: '새로운 분야로 전환해도 될까요?' },
      { category: 'career', question: '사업 확장 시기가 맞나요?' },
      { category: 'career', question: '이 프로젝트는 성공할까요?' },

      // 학업/성장 (커리어 맥락)
      { category: 'study', question: '직무 관련 자격증을 취득해야 할까요?' },
      { category: 'study', question: '커리어 발전을 위한 교육이 필요한가요?' },
      { category: 'study', question: '업무 능력 향상을 위해 배워야 할 것은?' },

      // 일반/운세 (커리어 맥락)
      { category: 'general', question: '전반적인 직업운은 어떤가요?' },
      { category: 'general', question: '커리어에서 기회가 올까요?' },
      { category: 'general', question: '직장 생활에서 주의할 점은?' },
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
      '결혼해야 할까요, 더 기다려야 할까요?',
      '두 가지 선택 중 어느 것이 나에게 더 좋을까요?',
      '집을 살까요, 전세로 살까요?',
      '투자를 할까요, 저축을 할까요?',
      '헤어져야 할까요, 관계를 이어가야 할까요?',
      '대학원에 갈까요, 취업할까요?',
      '서울로 갈까요, 지방에 남을까요?',
      '공무원 시험 vs 민간 취업, 어느 게 나을까요?',
    ],
    // 카테고리별 질문 (선택과 결정에 초점)
    categorizedQuestions: [
      // 건강
      { category: 'health', question: '수술할까요, 보존 치료할까요?' },
      { category: 'health', question: '운동을 시작할까요, 식이요법을 할까요?' },
      { category: 'health', question: '병원 A와 B 중 어디로 가야 할까요?' },

      // 재물
      { category: 'wealth', question: '투자를 할까요, 저축을 할까요?' },
      { category: 'wealth', question: '집을 살까요, 전세로 살까요?' },
      { category: 'wealth', question: 'A 사업과 B 사업 중 어느 것을 해야 할까요?' },
      { category: 'wealth', question: '주식 vs 부동산, 어디에 투자할까요?' },

      // 사랑/연애
      { category: 'love', question: '결혼해야 할까요, 더 기다려야 할까요?' },
      { category: 'love', question: '헤어져야 할까요, 관계를 이어가야 할까요?' },
      { category: 'love', question: 'A와 B 중 누구를 선택해야 할까요?' },
      { category: 'love', question: '고백할까요, 기다릴까요?' },

      // 인간관계
      { category: 'relationship', question: '화해할까요, 인연을 끊을까요?' },
      { category: 'relationship', question: '새 친구를 사귈까요, 기존 관계를 유지할까요?' },
      { category: 'relationship', question: '먼저 연락할까요, 기다릴까요?' },

      // 사업/커리어
      { category: 'career', question: 'A회사와 B회사 중 어디로 이직해야 할까요?' },
      { category: 'career', question: '유학을 가야 할까요, 취업을 해야 할까요?' },
      { category: 'career', question: '대학원에 갈까요, 취업할까요?' },
      { category: 'career', question: '서울로 갈까요, 지방에 남을까요?' },
      { category: 'career', question: '공무원 시험 vs 민간 취업, 어느 게 나을까요?' },
      { category: 'career', question: '창업할까요, 직장을 다닐까요?' },

      // 학업/성장
      { category: 'study', question: 'A 전공과 B 전공 중 어느 것을 선택할까요?' },
      { category: 'study', question: '학원을 다닐까요, 독학할까요?' },
      { category: 'study', question: '국내 대학 vs 해외 대학, 어디로 갈까요?' },

      // 일반/운세
      { category: 'general', question: '두 가지 선택 중 어느 것이 나에게 더 좋을까요?' },
      { category: 'general', question: '지금 결정할까요, 더 기다릴까요?' },
      { category: 'general', question: '변화를 시도할까요, 현상을 유지할까요?' },
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
      '올 한 해 매달 주의해야 할 점은?',
      '이번 해의 전체적인 흐름을 알고 싶습니다',
      '올해 나에게 행운이 올 시기는 언제인가요?',
      '이번 해에 조심해야 할 달은 언제인가요?',
      '올해의 연애운은 어떤가요?',
      '올해의 재물운은 어떤가요?',
    ],
    // 카테고리별 질문 (연간 운세에 초점)
    categorizedQuestions: [
      // 건강
      { category: 'health', question: '올해 나의 건강운은 어떤가요?' },
      { category: 'health', question: '올 한 해 건강 관리에서 주의할 점은?' },
      { category: 'health', question: '건강이 좋아지는 달은 언제인가요?' },

      // 재물
      { category: 'wealth', question: '올해의 재물운은 어떤가요?' },
      { category: 'wealth', question: '올 한 해 매달 금전 흐름은 어떤가요?' },
      { category: 'wealth', question: '돈이 들어오는 시기는 언제인가요?' },
      { category: 'wealth', question: '재정 관리에서 조심해야 할 달은?' },

      // 사랑/연애
      { category: 'love', question: '올해의 연애운은 어떤가요?' },
      { category: 'love', question: '올 한 해 사랑의 흐름은 어떻게 될까요?' },
      { category: 'love', question: '인연을 만날 수 있는 시기는 언제인가요?' },
      { category: 'love', question: '관계가 발전하는 달은 언제인가요?' },

      // 인간관계
      { category: 'relationship', question: '올해의 인간관계 운세는 어떤가요?' },
      { category: 'relationship', question: '올 한 해 대인관계 흐름은?' },
      { category: 'relationship', question: '새로운 인맥을 만날 시기는 언제인가요?' },

      // 사업/커리어
      { category: 'career', question: '올해의 직업운은 어떤가요?' },
      { category: 'career', question: '올 한 해 커리어 흐름은 어떻게 될까요?' },
      { category: 'career', question: '승진이나 이직의 기회가 올 시기는?' },
      { category: 'career', question: '사업이 번창할 달은 언제인가요?' },

      // 학업/성장
      { category: 'study', question: '올해의 학업운은 어떤가요?' },
      { category: 'study', question: '올 한 해 공부의 흐름은 어떻게 될까요?' },
      { category: 'study', question: '시험 합격이 가능한 시기는 언제인가요?' },

      // 일반/운세
      { category: 'general', question: '올해 나에게는 어떤 일들이 기다리고 있나요?' },
      { category: 'general', question: '2025년 나의 운세는 어떤가요?' },
      { category: 'general', question: '이번 해의 전체적인 흐름을 알고 싶습니다' },
      { category: 'general', question: '올해 나에게 행운이 올 시기는 언제인가요?' },
      { category: 'general', question: '이번 해에 조심해야 할 달은 언제인가요?' },
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
  cards: TarotCard[],
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
// 상황별 조언 시스템
// =====================

/**
 * 상황 카테고리 정의
 */
export type SituationCategory =
  | 'love' // 연애/결혼
  | 'career' // 직업/커리어
  | 'finance' // 재정/돈
  | 'health' // 건강
  | 'relationship' // 인간관계/우정
  | 'spiritual' // 영적 성장/자아
  | 'decision' // 선택/결정
  | 'general'; // 일반/종합

/**
 * 상황별 키워드 매핑
 */
const SITUATION_KEYWORDS: Record<SituationCategory, string[]> = {
  love: [
    '연애', '사랑', '결혼', '이별', '남자친구', '여자친구', '배우자', '짝사랑',
    '연인', '데이트', '고백', '프러포즈', '재회', '복연', '소개팅', '만남',
    '애인', '파트너', '썸', '커플', '부부', '이혼', '재혼',
  ],
  career: [
    '직장', '회사', '취업', '이직', '승진', '면접', '커리어', '일',
    '사업', '창업', '프로젝트', '업무', '상사', '동료', '직원', '사장',
    '성과', '성취', '목표', '비즈니스', '경력', '진로', '직업',
  ],
  finance: [
    '돈', '재정', '재산', '투자', '주식', '부동산', '저축', '수입',
    '지출', '빚', '대출', '경제', '금전', '수익', '손실', '금융',
    '자산', '코인', '암호화폐', '펀드', '예금', '보험',
  ],
  health: [
    '건강', '병', '질병', '치료', '병원', '의사', '약', '수술',
    '다이어트', '운동', '체중', '몸', '정신', '우울', '불안', '스트레스',
    '통증', '회복', '재활', '건강검진', '체력', '피로',
  ],
  relationship: [
    '친구', '가족', '부모', '형제', '자매', '아들', '딸', '자식',
    '시부모', '장인', '장모', '친정', '시댁', '친구', '지인', '사람',
    '관계', '인간관계', '소통', '갈등', '화해', '이해', '신뢰',
  ],
  spiritual: [
    '영적', '성장', '깨달음', '자아', '내면', '명상', '수행',
    '영성', '철학', '종교', '신앙', '믿음', '진리', '의미',
    '정체성', '가치관', '목적', '방향', '인생', '삶',
  ],
  decision: [
    '선택', '결정', '고민', '망설임', '갈림길', '기로', '딜레마',
    '판단', '결심', '결단', '선택지', '옵션', '대안', '방법',
  ],
  general: ['운세', '오늘', '이번주', '이번달', '올해', '미래', '전체', '종합'],
};

/**
 * 질문 텍스트에서 상황 카테고리 감지
 */
export function detectSituationCategory(question: string): SituationCategory {
  const lowerQuestion = question.toLowerCase();

  // 각 카테고리별 키워드 매칭 점수 계산
  const scores: Record<SituationCategory, number> = {
    love: 0,
    career: 0,
    finance: 0,
    health: 0,
    relationship: 0,
    spiritual: 0,
    decision: 0,
    general: 0,
  };

  for (const [category, keywords] of Object.entries(SITUATION_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerQuestion.includes(keyword)) {
        scores[category as SituationCategory] += 1;
      }
    }
  }

  // 가장 높은 점수의 카테고리 반환
  let maxCategory: SituationCategory = 'general';
  let maxScore = 0;

  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      maxCategory = category as SituationCategory;
    }
  }

  return maxCategory;
}

/**
 * 상황별 해석 가이드
 */
interface SituationAdvice {
  focusAreas: string[]; // 집중해야 할 영역
  interpretationTips: string[]; // 해석 팁
  actionAdvice: string[]; // 행동 지침
}

const SITUATION_ADVICE: Record<SituationCategory, SituationAdvice> = {
  love: {
    focusAreas: ['감정의 흐름', '상대방의 마음', '관계의 진전', '소통 방식'],
    interpretationTips: [
      '컵 수트는 감정과 사랑의 상태를 나타냅니다',
      '연인 카드는 선택과 관계의 조화를 의미합니다',
      '역방향 카드는 관계의 문제나 감정의 혼란을 나타낼 수 있습니다',
      '메이저 아르카나는 관계의 중대한 전환점을 암시합니다',
    ],
    actionAdvice: [
      '솔직한 대화로 마음을 표현하세요',
      '상대방의 입장을 이해하려 노력하세요',
      '성급하게 결론내리지 말고 시간을 가지세요',
      '자신의 감정을 먼저 정리하세요',
    ],
  },
  career: {
    focusAreas: ['업무 성과', '인간관계', '발전 기회', '장애물'],
    interpretationTips: [
      '완드 수트는 행동력과 추진력을 나타냅니다',
      '펜타클 수트는 실질적 성과와 안정성을 의미합니다',
      '황제/여황제는 리더십과 안정적 구조를 암시합니다',
      '전차는 목표 달성과 승리를 나타냅니다',
    ],
    actionAdvice: [
      '명확한 목표를 설정하고 계획을 세우세요',
      '전문성을 키우는 데 집중하세요',
      '협력과 네트워킹을 활용하세요',
      '현실적으로 가능한 것부터 시작하세요',
    ],
  },
  finance: {
    focusAreas: ['수입원', '지출 관리', '투자 기회', '재정 안정성'],
    interpretationTips: [
      '펜타클 수트는 금전과 물질적 상황을 나타냅니다',
      '에이스는 새로운 재정 기회를 암시합니다',
      '4는 안정과 보존, 10은 완성과 풍요를 의미합니다',
      '5는 재정적 어려움이나 손실을 경고합니다',
    ],
    actionAdvice: [
      '수입과 지출을 철저히 관리하세요',
      '장기적 관점에서 계획을 세우세요',
      '위험 분산을 고려하세요',
      '전문가의 조언을 구하는 것도 좋습니다',
    ],
  },
  health: {
    focusAreas: ['신체 상태', '정신 건강', '생활 습관', '회복력'],
    interpretationTips: [
      '검 수트는 정신적 스트레스와 불안을 나타낼 수 있습니다',
      '힘 카드는 내면의 회복력과 치유 능력을 의미합니다',
      '절제 카드는 균형과 조화로운 건강을 암시합니다',
      '역방향 카드는 건강 문제에 주의가 필요함을 나타냅니다',
    ],
    actionAdvice: [
      '규칙적인 생활 습관을 유지하세요',
      '충분한 휴식과 수면을 취하세요',
      '스트레스 관리에 신경 쓰세요',
      '필요하다면 전문의 상담을 받으세요',
    ],
  },
  relationship: {
    focusAreas: ['소통', '이해', '갈등 해결', '유대감'],
    interpretationTips: [
      '컵 수트는 감정적 연결과 관계를 나타냅니다',
      '2는 파트너십과 협력을, 3은 공동체와 우정을 의미합니다',
      '검 수트의 충돌 카드는 갈등을 암시합니다',
      '6은 조화와 균형, 치유를 나타냅니다',
    ],
    actionAdvice: [
      '열린 마음으로 대화하세요',
      '경청과 공감이 중요합니다',
      '작은 것부터 함께 해결해 나가세요',
      '시간이 필요하다면 여유를 가지세요',
    ],
  },
  spiritual: {
    focusAreas: ['내면의 목소리', '영적 성장', '깨달음', '방향성'],
    interpretationTips: [
      '은둔자는 내면 탐구와 성찰을 나타냅니다',
      '여사제는 직관과 내면의 지혜를 의미합니다',
      '별은 희망과 영감을, 달은 잠재의식을 나타냅니다',
      '메이저 아르카나는 영혼의 여정을 상징합니다',
    ],
    actionAdvice: [
      '명상이나 성찰의 시간을 가지세요',
      '내면의 목소리에 귀 기울이세요',
      '서두르지 말고 천천히 나아가세요',
      '의미 있는 경험을 추구하세요',
    ],
  },
  decision: {
    focusAreas: ['선택지 분석', '장단점', '결과 예측', '직관'],
    interpretationTips: [
      '연인 카드는 중요한 선택의 순간을 나타냅니다',
      '검 2는 결정의 어려움과 딜레마를 의미합니다',
      '정의 카드는 공정한 판단과 균형을 암시합니다',
      '각 선택지의 결과를 신중히 평가하세요',
    ],
    actionAdvice: [
      '충분한 정보를 수집하세요',
      '장단점을 객관적으로 비교하세요',
      '직관도 중요하게 고려하세요',
      '결정 후에는 흔들리지 말고 나아가세요',
    ],
  },
  general: {
    focusAreas: ['전반적 흐름', '주요 이슈', '기회와 도전', '방향성'],
    interpretationTips: [
      '메이저 아르카나는 중요한 생애 사건을 나타냅니다',
      '수트의 흐름을 보고 전체적 테마를 파악하세요',
      '긍정과 부정의 균형을 살펴보세요',
      '과거-현재-미래의 연결을 이해하세요',
    ],
    actionAdvice: [
      '현재 상황을 객관적으로 파악하세요',
      '우선순위를 정하고 집중하세요',
      '균형 잡힌 삶을 추구하세요',
      '변화를 두려워하지 마세요',
    ],
  },
};

/**
 * 상황별 맞춤 조언 생성
 */
export function generateSituationAdvice(
  category: SituationCategory,
  cardPositions: TarotCardPosition[],
): string {
  const advice = SITUATION_ADVICE[category];
  const categoryName = {
    love: '연애/사랑',
    career: '직업/커리어',
    finance: '재정/금전',
    health: '건강',
    relationship: '인간관계',
    spiritual: '영적 성장',
    decision: '선택/결정',
    general: '종합 운세',
  }[category];

  // 카드 분석
  const suits = cardPositions.map(cp => cp.card.suit);
  const suitCounts: Record<string, number> = {};
  suits.forEach(suit => {
    suitCounts[suit] = (suitCounts[suit] || 0) + 1;
  });

  const dominantSuit = Object.entries(suitCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const hasMajorArcana = suits.includes('major');

  let suitInsight = '';
  if (dominantSuit === 'wands') {
    suitInsight = '완드 수트가 많아 행동과 열정이 중요한 시기입니다.';
  } else if (dominantSuit === 'cups') {
    suitInsight = '컵 수트가 많아 감정과 관계가 핵심입니다.';
  } else if (dominantSuit === 'swords') {
    suitInsight = '검 수트가 많아 명확한 판단과 결단이 필요합니다.';
  } else if (dominantSuit === 'pentacles') {
    suitInsight = '펜타클 수트가 많아 실질적 성과에 집중해야 합니다.';
  }

  if (hasMajorArcana) {
    suitInsight += ' 메이저 아르카나가 출현하여 중요한 전환점에 있습니다.';
  }

  return `
## 📋 ${categoryName} 상황별 맞춤 조언

${suitInsight}

**🎯 집중 영역:**
${advice.focusAreas.map((area, i) => `${i + 1}. ${area}`).join('\n')}

**💡 해석 가이드:**
${advice.interpretationTips.map((tip, _i) => `• ${tip}`).join('\n')}

**✅ 행동 지침:**
${advice.actionAdvice.map((action, i) => `${i + 1}. ${action}`).join('\n')}
  `.trim();
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
      cp.card.suit === suit,
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
// =====================
// 타이밍 정보 시스템
// =====================

/**
 * 타이밍 속성 정의
 */
export type TimingAttribute =
  | 'immediate' // 즉시 (1-3일)
  | 'soon' // 곧 (1-2주)
  | 'near-future' // 가까운 미래 (1-2개월)
  | 'mid-term' // 중기적 (3-6개월)
  | 'long-term' // 장기적 (6개월 이상)
  | 'gradual' // 점진적 (단계적 변화)
  | 'cyclical' // 순환적 (반복적)
  | 'waiting'; // 대기 필요 (아직 아님)

/**
 * 타이밍 정보 인터페이스
 */
interface TimingInfo {
  attribute: TimingAttribute;
  message: string;
  actionWindow: string; // 행동해야 할 시기
}

/**
 * 카드별 타이밍 속성 매핑
 */
const CARD_TIMING: Record<string, { upright: TimingAttribute; reversed: TimingAttribute }> = {
  // 메이저 아르카나
  'The Fool': { upright: 'immediate', reversed: 'waiting' },
  'The Magician': { upright: 'immediate', reversed: 'soon' },
  'The High Priestess': { upright: 'waiting', reversed: 'gradual' },
  'The Empress': { upright: 'gradual', reversed: 'mid-term' },
  'The Emperor': { upright: 'mid-term', reversed: 'long-term' },
  'The Hierophant': { upright: 'mid-term', reversed: 'waiting' },
  'The Lovers': { upright: 'soon', reversed: 'waiting' },
  'The Chariot': { upright: 'immediate', reversed: 'mid-term' },
  'Strength': { upright: 'gradual', reversed: 'waiting' },
  'The Hermit': { upright: 'long-term', reversed: 'mid-term' },
  'Wheel of Fortune': { upright: 'cyclical', reversed: 'waiting' },
  'Justice': { upright: 'mid-term', reversed: 'long-term' },
  'The Hanged Man': { upright: 'waiting', reversed: 'gradual' },
  'Death': { upright: 'soon', reversed: 'gradual' },
  'Temperance': { upright: 'gradual', reversed: 'waiting' },
  'The Devil': { upright: 'immediate', reversed: 'soon' },
  'The Tower': { upright: 'immediate', reversed: 'soon' },
  'The Star': { upright: 'near-future', reversed: 'mid-term' },
  'The Moon': { upright: 'cyclical', reversed: 'waiting' },
  'The Sun': { upright: 'soon', reversed: 'near-future' },
  'Judgement': { upright: 'soon', reversed: 'mid-term' },
  'The World': { upright: 'near-future', reversed: 'long-term' },

  // 완드 수트 - 행동, 에너지 (빠른 타이밍)
  'Ace of Wands': { upright: 'immediate', reversed: 'soon' },
  'Two of Wands': { upright: 'soon', reversed: 'mid-term' },
  'Three of Wands': { upright: 'near-future', reversed: 'mid-term' },
  'Four of Wands': { upright: 'soon', reversed: 'near-future' },
  'Five of Wands': { upright: 'immediate', reversed: 'soon' },
  'Six of Wands': { upright: 'soon', reversed: 'near-future' },
  'Seven of Wands': { upright: 'immediate', reversed: 'soon' },
  'Eight of Wands': { upright: 'immediate', reversed: 'soon' },
  'Nine of Wands': { upright: 'waiting', reversed: 'gradual' },
  'Ten of Wands': { upright: 'near-future', reversed: 'mid-term' },

  // 컵 수트 - 감정, 관계 (중간 타이밍)
  'Ace of Cups': { upright: 'soon', reversed: 'near-future' },
  'Two of Cups': { upright: 'soon', reversed: 'near-future' },
  'Three of Cups': { upright: 'soon', reversed: 'near-future' },
  'Four of Cups': { upright: 'waiting', reversed: 'gradual' },
  'Five of Cups': { upright: 'gradual', reversed: 'soon' },
  'Six of Cups': { upright: 'cyclical', reversed: 'near-future' },
  'Seven of Cups': { upright: 'waiting', reversed: 'gradual' },
  'Eight of Cups': { upright: 'soon', reversed: 'near-future' },
  'Nine of Cups': { upright: 'near-future', reversed: 'mid-term' },
  'Ten of Cups': { upright: 'long-term', reversed: 'mid-term' },

  // 검 수트 - 사고, 갈등 (즉시 또는 빠른 타이밍)
  'Ace of Swords': { upright: 'immediate', reversed: 'soon' },
  'Two of Swords': { upright: 'waiting', reversed: 'soon' },
  'Three of Swords': { upright: 'immediate', reversed: 'soon' },
  'Four of Swords': { upright: 'waiting', reversed: 'soon' },
  'Five of Swords': { upright: 'immediate', reversed: 'soon' },
  'Six of Swords': { upright: 'gradual', reversed: 'mid-term' },
  'Seven of Swords': { upright: 'immediate', reversed: 'soon' },
  'Eight of Swords': { upright: 'waiting', reversed: 'gradual' },
  'Nine of Swords': { upright: 'immediate', reversed: 'soon' },
  'Ten of Swords': { upright: 'immediate', reversed: 'soon' },

  // 펜타클 수트 - 물질, 재정 (점진적, 장기적 타이밍)
  'Ace of Pentacles': { upright: 'soon', reversed: 'near-future' },
  'Two of Pentacles': { upright: 'cyclical', reversed: 'gradual' },
  'Three of Pentacles': { upright: 'gradual', reversed: 'mid-term' },
  'Four of Pentacles': { upright: 'waiting', reversed: 'gradual' },
  'Five of Pentacles': { upright: 'gradual', reversed: 'near-future' },
  'Six of Pentacles': { upright: 'cyclical', reversed: 'gradual' },
  'Seven of Pentacles': { upright: 'mid-term', reversed: 'long-term' },
  'Eight of Pentacles': { upright: 'gradual', reversed: 'mid-term' },
  'Nine of Pentacles': { upright: 'long-term', reversed: 'mid-term' },
  'Ten of Pentacles': { upright: 'long-term', reversed: 'mid-term' },

  // 코트 카드 (왕, 여왕, 기사, 시종)
  'Page of Wands': { upright: 'soon', reversed: 'near-future' },
  'Knight of Wands': { upright: 'immediate', reversed: 'soon' },
  'Queen of Wands': { upright: 'soon', reversed: 'near-future' },
  'King of Wands': { upright: 'near-future', reversed: 'mid-term' },
  'Page of Cups': { upright: 'soon', reversed: 'near-future' },
  'Knight of Cups': { upright: 'gradual', reversed: 'near-future' },
  'Queen of Cups': { upright: 'near-future', reversed: 'mid-term' },
  'King of Cups': { upright: 'mid-term', reversed: 'long-term' },
  'Page of Swords': { upright: 'immediate', reversed: 'soon' },
  'Knight of Swords': { upright: 'immediate', reversed: 'soon' },
  'Queen of Swords': { upright: 'soon', reversed: 'near-future' },
  'King of Swords': { upright: 'near-future', reversed: 'mid-term' },
  'Page of Pentacles': { upright: 'gradual', reversed: 'mid-term' },
  'Knight of Pentacles': { upright: 'gradual', reversed: 'mid-term' },
  'Queen of Pentacles': { upright: 'mid-term', reversed: 'long-term' },
  'King of Pentacles': { upright: 'long-term', reversed: 'mid-term' },
};

/**
 * 타이밍 속성별 설명 메시지
 */
const TIMING_MESSAGES: Record<TimingAttribute, { period: string; action: string }> = {
  immediate: {
    period: '지금 당장 (1-3일 이내)',
    action: '**즉시 행동**하세요. 지체하면 기회를 놓칠 수 있습니다.',
  },
  soon: {
    period: '곧 (1-2주 이내)',
    action: '**빠르게 준비**하고 실행하세요. 시기가 다가오고 있습니다.',
  },
  'near-future': {
    period: '가까운 미래 (1-2개월)',
    action: '**조금 더 준비**하세요. 아직 시간이 있지만 서두르는 것이 좋습니다.',
  },
  'mid-term': {
    period: '중기적 (3-6개월)',
    action: '**차근차근 계획**하고 진행하세요. 서두르지 말고 꾸준히 노력하세요.',
  },
  'long-term': {
    period: '장기적 (6개월 이상)',
    action: '**장기적 관점**에서 접근하세요. 인내심을 가지고 기반을 다지세요.',
  },
  gradual: {
    period: '점진적 (단계별 진행)',
    action: '**한 걸음씩** 나아가세요. 급격한 변화보다는 꾸준한 노력이 필요합니다.',
  },
  cyclical: {
    period: '순환적 (반복적)',
    action: '**타이밍을 잘 포착**하세요. 기회는 다시 돌아오니 놓치지 마세요.',
  },
  waiting: {
    period: '대기 필요 (아직 아님)',
    action: '**서두르지 마세요**. 지금은 관찰하고 준비하는 시기입니다.',
  },
};

/**
 * 카드의 타이밍 정보 분석
 */
export function analyzeCardTiming(card: TarotCard, isReversed: boolean): TimingInfo {
  const timingData = CARD_TIMING[card.name];
  if (!timingData) {
    // 기본값: 중립적 타이밍
    return {
      attribute: 'near-future',
      message: '가까운 미래에 변화가 일어날 것입니다.',
      actionWindow: '1-2개월 이내에 행동하세요.',
    };
  }

  const attribute = isReversed ? timingData.reversed : timingData.upright;
  const timingMsg = TIMING_MESSAGES[attribute];

  return {
    attribute,
    message: `이 카드의 시기는 **${timingMsg.period}**입니다.`,
    actionWindow: timingMsg.action,
  };
}

/**
 * 전체 스프레드의 타이밍 분석
 */
export function analyzeOverallTiming(cardPositions: TarotCardPosition[]): {
  dominant: TimingAttribute;
  summary: string;
  recommendations: string[];
} {
  // 각 카드의 타이밍 속성 수집
  const timingCounts: Record<TimingAttribute, number> = {
    immediate: 0,
    soon: 0,
    'near-future': 0,
    'mid-term': 0,
    'long-term': 0,
    gradual: 0,
    cyclical: 0,
    waiting: 0,
  };

  cardPositions.forEach((cp) => {
    const timing = analyzeCardTiming(cp.card, cp.isReversed);
    timingCounts[timing.attribute] += 1;
  });

  // 가장 많이 나타난 타이밍 속성 찾기
  let maxCount = 0;
  let dominant: TimingAttribute = 'near-future';

  for (const [attr, count] of Object.entries(timingCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominant = attr as TimingAttribute;
    }
  }

  // 타이밍 요약 메시지 생성
  const timingMsg = TIMING_MESSAGES[dominant];
  let summary = '';
  const recommendations: string[] = [];

  // 즉각적 행동 필요 카드 수
  const urgentCount = timingCounts.immediate + timingCounts.soon;
  // 대기/점진적 카드 수
  const slowCount = timingCounts.waiting + timingCounts.gradual;

  if (urgentCount >= 2) {
    summary = `전체적으로 **빠른 행동**이 필요한 시기입니다. ${timingMsg.period}가 핵심입니다.`;
    recommendations.push('지금이 결정과 행동의 시기입니다');
    recommendations.push('기회를 놓치지 않도록 신속하게 움직이세요');
    recommendations.push('직관을 믿고 과감하게 시작하세요');
  } else if (slowCount >= 2) {
    summary = `전체적으로 **신중하고 점진적인 접근**이 필요합니다. ${timingMsg.period}가 중요합니다.`;
    recommendations.push('서두르지 말고 충분히 준비하세요');
    recommendations.push('장기적 관점에서 계획을 세우세요');
    recommendations.push('인내심을 가지고 단계적으로 진행하세요');
  } else if (timingCounts.cyclical >= 1) {
    summary = `**타이밍이 중요**한 상황입니다. ${timingMsg.period}를 고려하세요.`;
    recommendations.push('적절한 시기를 기다리세요');
    recommendations.push('기회가 다시 오면 놓치지 마세요');
    recommendations.push('주기적으로 상황을 점검하세요');
  } else {
    summary = `**균형 잡힌 시간 계획**이 필요합니다. ${timingMsg.period}를 염두에 두세요.`;
    recommendations.push('급하거나 느린 것이 아닌, 적절한 타이밍을 찾으세요');
    recommendations.push('상황에 따라 유연하게 대응하세요');
    recommendations.push('필요하면 행동하고, 그렇지 않으면 기다리세요');
  }

  return {
    dominant,
    summary,
    recommendations,
  };
}

/**
 * 타이밍 분석 텍스트 생성
 */
export function formatTimingAnalysis(cardPositions: TarotCardPosition[]): string {
  const overallTiming = analyzeOverallTiming(cardPositions);

  // 각 카드별 타이밍 정보
  const cardTimings = cardPositions.map((cp) => {
    const timing = analyzeCardTiming(cp.card, cp.isReversed);
    return `• **${cp.positionName}** (${cp.card.nameKo}): ${timing.message}`;
  });

  return `
## ⏰ 타이밍 분석

${overallTiming.summary}

**각 카드별 시기:**
${cardTimings.join('\n')}

**타이밍 가이드:**
${overallTiming.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}
  `.trim();
}

/**
 * AI 프롬프트용 스프레드 정보 생성
 */
export function generateSpreadPrompt(
  spreadId: string,
  cardPositions: TarotCardPosition[],
  userQuestion: string,
): string {
  const spread = getSpreadById(spreadId);
  if (!spread) return '';

  const cardsInfo = cardPositions
    .map((cp) => {
      const orientation = cp.isReversed ? '역방향' : '정방향';
      const meaning = cp.isReversed ? cp.card.reversedMeaning : cp.card.uprightMeaning;
      const keywords = cp.isReversed ? cp.card.reversedKeywords : cp.card.uprightKeywords;
      const fortune = getFortuneDetermination(cp.card, cp.isReversed);
      const timing = analyzeCardTiming(cp.card, cp.isReversed);

      return `
${cp.position}. ${cp.positionName} (${cp.positionMeaning})
   카드: ${cp.card.nameKo} (${cp.card.name})
   방향: ${orientation}
   길흉: ${fortune.status} - ${fortune.message}
   타이밍: ${timing.message} ${timing.actionWindow}
   의미: ${meaning}
   키워드: ${keywords.join(', ')}
   상징: ${cp.card.symbolism}
      `.trim();
    })
    .join('\n\n');

  // 상황 카테고리 자동 감지
  const situationCategory = detectSituationCategory(userQuestion);
  const situationAdvice = SITUATION_ADVICE[situationCategory];

  const categoryNameKo = {
    love: '연애/사랑',
    career: '직업/커리어',
    finance: '재정/금전',
    health: '건강',
    relationship: '인간관계',
    spiritual: '영적 성장',
    decision: '선택/결정',
    general: '종합',
  }[situationCategory];

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

  // 타이밍 분석 추가
  const overallTiming = analyzeOverallTiming(cardPositions);
  const timingInfo = `\n\n타이밍 분석:\n${overallTiming.summary}\n주요 행동 시기:\n${overallTiming.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}`;

  // 위험도 분석 추가
  const overallRisk = analyzeOverallRisk(cardPositions);
  let riskInfo = `\n\n위험도 분석:\n${overallRisk.summary}`;
  if (overallRisk.allWarnings.length > 0) {
    riskInfo += `\n\n경고사항:\n${overallRisk.allWarnings.map((w, i) => `${i + 1}. ${w}`).join('\n')}`;
  }
  riskInfo += `\n\n예방 및 대응책:\n${overallRisk.allPrecautions.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
  if (overallRisk.criticalCards.length > 0) {
    riskInfo += `\n\n특히 주의할 카드:\n${overallRisk.criticalCards.map((cp) => {
      const risk = analyzeCardRisk(cp.card, cp.isReversed);
      return `- ${cp.positionName} (${cp.card.nameKo}): ${risk.message}`;
    }).join('\n')}`;
  }

  return `
타로 리딩 요청

사용자 질문: ${userQuestion}
질문 카테고리: ${categoryNameKo}

스프레드: ${spread.nameKo} (${spread.name})
설명: ${spread.description}

뽑힌 카드들:
${cardsInfo}${combinationInfo}${timingInfo}${riskInfo}

---

상황별 해석 가이드 (${categoryNameKo}):

집중 영역: ${situationAdvice.focusAreas.join(', ')}

핵심 해석 팁:
${situationAdvice.interpretationTips.map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

권장 행동:
${situationAdvice.actionAdvice.map((action, i) => `${i + 1}. ${action}`).join('\n')}

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

6. **상황별 맞춤 해석 (${categoryNameKo})**
   - 위에 제시된 "상황별 해석 가이드"를 적극 활용하세요
   - 집중 영역: ${situationAdvice.focusAreas.join(', ')}에 초점을 맞추세요
   - 핵심 해석 팁을 반드시 적용하여 ${categoryNameKo} 상황에 특화된 해석을 제공하세요
   - 권장 행동 지침을 구체적으로 반영하세요
   - 질문의 맥락에 맞는 실질적이고 구체적인 조언을 제공하세요

7. **타이밍 정보 적극 반영**
   - 위에 제시된 "타이밍 분석"을 반드시 활용하세요
   - 각 카드의 시기 정보(즉시, 곧, 가까운 미래, 중기적, 장기적, 점진적, 순환적, 대기)를 구체적으로 언급하세요
   - "언제" 행동해야 하는지 명확하게 전달하세요 (예: "1-2주 이내", "3-6개월 후", "지금 당장" 등)
   - 급한 것과 느긋한 것을 구분하여 우선순위를 제시하세요
   - ${overallTiming.summary}를 해석에 적극 반영하세요

8. **위험도 평가 명확히 전달**
   - 위에 제시된 "위험도 분석"을 반드시 반영하세요
   - 현재 상황의 위험 수준(${overallRisk.maxLevel})을 솔직하고 명확하게 전달하세요
   ${overallRisk.allWarnings.length > 0 ? `- 경고사항 ${overallRisk.allWarnings.length}가지를 구체적으로 언급하고 왜 위험한지 설명하세요` : ''}
   - 예방 및 대응책을 실행 가능한 형태로 제시하세요
   ${overallRisk.criticalCards.length > 0 ? `- 특히 주의할 카드 ${overallRisk.criticalCards.length}장에 대해서는 별도로 강조하세요` : ''}
   - 위험도가 높을수록 더 직접적이고 강하게 경고하세요
   - 안전한 상황이면 "안심하셔도 됩니다", "긍정적인 상황입니다"라고 명확히 말하세요

답변 구조:
1. **전체 흐름 요약** (2-3문장, 길흉 판단 포함${combinations.length > 0 ? ', 주요 카드 조합 언급' : ''}, 타이밍 요약 포함, 위험도 수준 언급, ${categoryNameKo} 맥락 반영)
2. **각 카드 위치별 해석** (위치마다 긍정/부정 명시, 각 카드의 타이밍 정보 포함, ${categoryNameKo} 관점에서 설명)
${combinations.length > 0 ? '3. **카드 조합의 의미** (조합에서 발견된 특별한 패턴과 그 의미)\n4' : '3'}. **위험도 평가와 경고** (현재 위험 수준 명시${overallRisk.allWarnings.length > 0 ? ', 경고사항 설명' : ''}${overallRisk.criticalCards.length > 0 ? ', 특히 주의할 카드 강조' : ''}, 예방 및 대응책 제시)
${combinations.length > 0 ? '5' : '4'}. **${categoryNameKo} 맞춤 행동 지침** (${categoryNameKo} 상황에 특화된 구체적 조언 3가지, 피해야 할 일 2가지, 위험도에 따른 우선순위 반영)
${combinations.length > 0 ? '6' : '5'}. **타이밍과 행동 계획** (각 행동을 언제 해야 하는지 구체적 시기 명시, ${overallTiming.recommendations.join(', ')} 반영, 위험도에 따른 긴급도 조정, ${categoryNameKo} 특성 고려)
  `.trim();
}

// =====================
// 경고 강도 레벨 시스템
// =====================

/**
 * 위험도 레벨 정의
 */
export type RiskLevel =
  | 'critical' // 치명적 (즉각 대응 필요)
  | 'high' // 높음 (심각한 주의 필요)
  | 'moderate' // 중간 (주의 필요)
  | 'low' // 낮음 (가벼운 경계)
  | 'safe'; // 안전 (긍정적 상황)

/**
 * 위험도 정보 인터페이스
 */
interface RiskInfo {
  level: RiskLevel;
  message: string;
  warnings: string[];
  precautions: string[];
}

/**
 * 카드별 위험도 레벨 매핑
 */
const CARD_RISK_LEVELS: Record<string, { upright: RiskLevel; reversed: RiskLevel }> = {
  // 메이저 아르카나
  'The Fool': { upright: 'moderate', reversed: 'high' },
  'The Magician': { upright: 'safe', reversed: 'moderate' },
  'The High Priestess': { upright: 'safe', reversed: 'moderate' },
  'The Empress': { upright: 'safe', reversed: 'moderate' },
  'The Emperor': { upright: 'safe', reversed: 'moderate' },
  'The Hierophant': { upright: 'safe', reversed: 'moderate' },
  'The Lovers': { upright: 'safe', reversed: 'high' },
  'The Chariot': { upright: 'safe', reversed: 'moderate' },
  'Strength': { upright: 'safe', reversed: 'moderate' },
  'The Hermit': { upright: 'low', reversed: 'moderate' },
  'Wheel of Fortune': { upright: 'low', reversed: 'moderate' },
  'Justice': { upright: 'safe', reversed: 'moderate' },
  'The Hanged Man': { upright: 'moderate', reversed: 'low' },
  'Death': { upright: 'high', reversed: 'moderate' },
  'Temperance': { upright: 'safe', reversed: 'moderate' },
  'The Devil': { upright: 'critical', reversed: 'high' },
  'The Tower': { upright: 'critical', reversed: 'high' },
  'The Star': { upright: 'safe', reversed: 'moderate' },
  'The Moon': { upright: 'high', reversed: 'moderate' },
  'The Sun': { upright: 'safe', reversed: 'low' },
  'Judgement': { upright: 'moderate', reversed: 'moderate' },
  'The World': { upright: 'safe', reversed: 'moderate' },

  // 완드 수트 - 행동, 에너지
  'Ace of Wands': { upright: 'safe', reversed: 'moderate' },
  'Two of Wands': { upright: 'low', reversed: 'moderate' },
  'Three of Wands': { upright: 'safe', reversed: 'moderate' },
  'Four of Wands': { upright: 'safe', reversed: 'moderate' },
  'Five of Wands': { upright: 'moderate', reversed: 'moderate' },
  'Six of Wands': { upright: 'safe', reversed: 'moderate' },
  'Seven of Wands': { upright: 'moderate', reversed: 'moderate' },
  'Eight of Wands': { upright: 'low', reversed: 'moderate' },
  'Nine of Wands': { upright: 'moderate', reversed: 'moderate' },
  'Ten of Wands': { upright: 'moderate', reversed: 'moderate' },

  // 컵 수트 - 감정, 관계
  'Ace of Cups': { upright: 'safe', reversed: 'moderate' },
  'Two of Cups': { upright: 'safe', reversed: 'moderate' },
  'Three of Cups': { upright: 'safe', reversed: 'moderate' },
  'Four of Cups': { upright: 'moderate', reversed: 'low' },
  'Five of Cups': { upright: 'high', reversed: 'moderate' },
  'Six of Cups': { upright: 'safe', reversed: 'moderate' },
  'Seven of Cups': { upright: 'moderate', reversed: 'moderate' },
  'Eight of Cups': { upright: 'moderate', reversed: 'moderate' },
  'Nine of Cups': { upright: 'safe', reversed: 'moderate' },
  'Ten of Cups': { upright: 'safe', reversed: 'moderate' },

  // 검 수트 - 사고, 갈등 (대체로 위험도 높음)
  'Ace of Swords': { upright: 'low', reversed: 'moderate' },
  'Two of Swords': { upright: 'moderate', reversed: 'moderate' },
  'Three of Swords': { upright: 'critical', reversed: 'high' },
  'Four of Swords': { upright: 'low', reversed: 'moderate' },
  'Five of Swords': { upright: 'high', reversed: 'moderate' },
  'Six of Swords': { upright: 'low', reversed: 'moderate' },
  'Seven of Swords': { upright: 'high', reversed: 'moderate' },
  'Eight of Swords': { upright: 'high', reversed: 'moderate' },
  'Nine of Swords': { upright: 'critical', reversed: 'high' },
  'Ten of Swords': { upright: 'critical', reversed: 'high' },

  // 펜타클 수트 - 물질, 재정
  'Ace of Pentacles': { upright: 'safe', reversed: 'moderate' },
  'Two of Pentacles': { upright: 'low', reversed: 'moderate' },
  'Three of Pentacles': { upright: 'safe', reversed: 'moderate' },
  'Four of Pentacles': { upright: 'moderate', reversed: 'moderate' },
  'Five of Pentacles': { upright: 'critical', reversed: 'high' },
  'Six of Pentacles': { upright: 'safe', reversed: 'moderate' },
  'Seven of Pentacles': { upright: 'low', reversed: 'moderate' },
  'Eight of Pentacles': { upright: 'safe', reversed: 'moderate' },
  'Nine of Pentacles': { upright: 'safe', reversed: 'moderate' },
  'Ten of Pentacles': { upright: 'safe', reversed: 'moderate' },

  // 코트 카드
  'Page of Wands': { upright: 'safe', reversed: 'moderate' },
  'Knight of Wands': { upright: 'low', reversed: 'moderate' },
  'Queen of Wands': { upright: 'safe', reversed: 'moderate' },
  'King of Wands': { upright: 'safe', reversed: 'moderate' },
  'Page of Cups': { upright: 'safe', reversed: 'moderate' },
  'Knight of Cups': { upright: 'low', reversed: 'moderate' },
  'Queen of Cups': { upright: 'safe', reversed: 'moderate' },
  'King of Cups': { upright: 'safe', reversed: 'moderate' },
  'Page of Swords': { upright: 'low', reversed: 'moderate' },
  'Knight of Swords': { upright: 'moderate', reversed: 'moderate' },
  'Queen of Swords': { upright: 'low', reversed: 'moderate' },
  'King of Swords': { upright: 'safe', reversed: 'moderate' },
  'Page of Pentacles': { upright: 'safe', reversed: 'moderate' },
  'Knight of Pentacles': { upright: 'safe', reversed: 'moderate' },
  'Queen of Pentacles': { upright: 'safe', reversed: 'moderate' },
  'King of Pentacles': { upright: 'safe', reversed: 'moderate' },
};

/**
 * 위험도 레벨별 메시지
 */
const RISK_MESSAGES: Record<RiskLevel, { emoji: string; label: string; description: string }> = {
  critical: {
    emoji: '🚨',
    label: '치명적 위험',
    description: '**즉각적인 대응이 필요**합니다. 현재 상황이 매우 심각하며, 지금 행동하지 않으면 큰 손실이나 위기가 발생할 수 있습니다.',
  },
  high: {
    emoji: '⚠️',
    label: '높은 위험',
    description: '**심각한 주의가 필요**합니다. 잘못된 선택이나 방치할 경우 상황이 악화될 가능성이 높습니다.',
  },
  moderate: {
    emoji: '⚡',
    label: '중간 위험',
    description: '**주의가 필요**합니다. 신중하게 접근하고 예방적 조치를 취하는 것이 좋습니다.',
  },
  low: {
    emoji: '💡',
    label: '낮은 위험',
    description: '**가벼운 경계가 필요**합니다. 큰 문제는 없으나 방심하지 말고 꾸준히 관리하세요.',
  },
  safe: {
    emoji: '✅',
    label: '안전',
    description: '**긍정적인 상황**입니다. 현재 방향을 유지하면서 기회를 적극 활용하세요.',
  },
};

/**
 * 카드의 위험도 분석
 */
export function analyzeCardRisk(card: TarotCard, isReversed: boolean): RiskInfo {
  const riskData = CARD_RISK_LEVELS[card.name];
  if (!riskData) {
    // 기본값: 중간 위험
    return {
      level: 'moderate',
      message: '주의가 필요한 상황입니다.',
      warnings: ['상황을 신중하게 판단하세요'],
      precautions: ['예방적 조치를 고려하세요'],
    };
  }

  const level = isReversed ? riskData.reversed : riskData.upright;
  const riskMsg = RISK_MESSAGES[level];

  // 레벨별 경고 및 예방책
  const warnings: string[] = [];
  const precautions: string[] = [];

  switch (level) {
    case 'critical':
      warnings.push('지금 즉시 행동하지 않으면 회복 불가능한 손실이 발생할 수 있습니다');
      warnings.push('현재 상황은 매우 위험하며 긴급한 대응이 필요합니다');
      precautions.push('즉시 전문가의 조언을 구하세요');
      precautions.push('모든 결정을 중단하고 상황을 재평가하세요');
      precautions.push('신뢰할 수 있는 사람들과 상의하세요');
      break;

    case 'high':
      warnings.push('잘못된 판단이 큰 문제로 이어질 수 있습니다');
      warnings.push('현재 방향을 유지하면 상황이 악화될 가능성이 높습니다');
      precautions.push('현재 계획을 신중하게 재검토하세요');
      precautions.push('위험 요소를 식별하고 대비책을 마련하세요');
      precautions.push('성급한 결정을 피하고 충분히 고민하세요');
      break;

    case 'moderate':
      warnings.push('방심하면 예상치 못한 문제가 발생할 수 있습니다');
      precautions.push('신중하게 접근하고 준비를 철저히 하세요');
      precautions.push('예방적 조치를 미리 준비하세요');
      precautions.push('정기적으로 상황을 점검하세요');
      break;

    case 'low':
      warnings.push('작은 실수가 나중에 문제가 될 수 있습니다');
      precautions.push('기본적인 주의를 게을리하지 마세요');
      precautions.push('꾸준히 관리하고 모니터링하세요');
      break;

    case 'safe':
      warnings.push('현재는 안전하지만 방심은 금물입니다');
      precautions.push('현재의 좋은 상황을 유지하기 위해 노력하세요');
      precautions.push('기회를 적극 활용하되 과신은 피하세요');
      break;
  }

  return {
    level,
    message: `${riskMsg.emoji} ${riskMsg.label}: ${riskMsg.description}`,
    warnings,
    precautions,
  };
}

/**
 * 전체 스프레드의 위험도 분석
 */
export function analyzeOverallRisk(cardPositions: TarotCardPosition[]): {
  maxLevel: RiskLevel;
  summary: string;
  criticalCards: TarotCardPosition[];
  allWarnings: string[];
  allPrecautions: string[];
} {
  const riskCounts: Record<RiskLevel, number> = {
    critical: 0,
    high: 0,
    moderate: 0,
    low: 0,
    safe: 0,
  };

  const criticalCards: TarotCardPosition[] = [];
  const allWarnings: string[] = [];
  const allPrecautions: string[] = [];

  // 각 카드 분석
  cardPositions.forEach((cp) => {
    const risk = analyzeCardRisk(cp.card, cp.isReversed);
    riskCounts[risk.level] += 1;

    if (risk.level === 'critical' || risk.level === 'high') {
      criticalCards.push(cp);
    }
  });

  // 최고 위험도 결정
  let maxLevel: RiskLevel = 'safe';
  if (riskCounts.critical > 0) maxLevel = 'critical';
  else if (riskCounts.high >= 2) maxLevel = 'critical'; // 높은 위험 2개 이상 = 치명적
  else if (riskCounts.high >= 1) maxLevel = 'high';
  else if (riskCounts.moderate >= 2) maxLevel = 'moderate';
  else if (riskCounts.moderate >= 1) maxLevel = 'low';

  // 요약 메시지 생성
  let summary = '';
  if (maxLevel === 'critical') {
    summary = '🚨 **매우 위험한 상황**입니다. 즉각적인 행동이 필요합니다.';
    allWarnings.push('현재 상황은 심각하며, 신속하고 현명한 대응이 필수입니다');
    allPrecautions.push('모든 중요한 결정을 중단하고 상황을 재평가하세요');
    allPrecautions.push('전문가나 신뢰할 수 있는 조언자의 도움을 구하세요');
  } else if (maxLevel === 'high') {
    summary = '⚠️ **위험도가 높습니다**. 매우 신중한 접근이 필요합니다.';
    allWarnings.push('잘못된 선택이 큰 문제를 초래할 수 있습니다');
    allPrecautions.push('모든 선택지를 신중하게 평가하고 위험을 최소화하세요');
  } else if (maxLevel === 'moderate') {
    summary = '⚡ **주의가 필요**한 상황입니다. 신중하게 진행하세요.';
    allWarnings.push('예상치 못한 문제가 발생할 수 있으니 주의하세요');
    allPrecautions.push('계획을 철저히 검토하고 대비책을 마련하세요');
  } else if (maxLevel === 'low') {
    summary = '💡 **전반적으로 안정적**이지만 작은 주의가 필요합니다.';
    allPrecautions.push('기본적인 관리와 모니터링을 지속하세요');
  } else {
    summary = '✅ **안전하고 긍정적**인 상황입니다.';
    allPrecautions.push('현재의 좋은 흐름을 유지하면서 기회를 활용하세요');
  }

  return {
    maxLevel,
    summary,
    criticalCards,
    allWarnings,
    allPrecautions,
  };
}

/**
 * 위험도 분석 텍스트 생성
 */
export function formatRiskAnalysis(cardPositions: TarotCardPosition[]): string {
  const overallRisk = analyzeOverallRisk(cardPositions);

  // 위험한 카드 목록
  let criticalSection = '';
  if (overallRisk.criticalCards.length > 0) {
    const criticalList = overallRisk.criticalCards.map((cp) => {
      const risk = analyzeCardRisk(cp.card, cp.isReversed);
      return `• **${cp.positionName}** (${cp.card.nameKo}): ${RISK_MESSAGES[risk.level].emoji} ${RISK_MESSAGES[risk.level].label}`;
    });

    criticalSection = `\n\n**⚠️ 특히 주의할 카드:**\n${criticalList.join('\n')}`;
  }

  return `
## ${RISK_MESSAGES[overallRisk.maxLevel].emoji} 위험도 분석

${overallRisk.summary}

${overallRisk.allWarnings.length > 0 ? `**경고사항:**\n${overallRisk.allWarnings.map((w, i) => `${i + 1}. ${w}`).join('\n')}\n` : ''}
**예방 및 대응책:**
${overallRisk.allPrecautions.map((p, i) => `${i + 1}. ${p}`).join('\n')}${criticalSection}
  `.trim();
}
