/**
 * 자미두수 AI 질문 카테고리 시스템
 * - 7대 카테고리별로 자미두수에 최적화된 질문 제공
 */

// ====================
// 타입 정의 (tarotSpread.ts와 동일)
// ====================

export type QuestionCategory =
  | 'health'       // 🏥 건강
  | 'wealth'       // 💰 돈·재산
  | 'love'         // ❤️  사랑/연애
  | 'relationship' // 👥 인간관계
  | 'career'       // 💼 사업/커리어
  | 'study'        // 📚 학업/성장
  | 'general';     // 🌟 일반/운세

export interface QuestionCategoryInfo {
  id: QuestionCategory;
  name: string;
  emoji: string;
  description: string;
  colorClasses: {
    active: string;
    inactive: string;
    hover: string;
  };
}

export interface CategorizedQuestion {
  category: QuestionCategory;
  question: string;
}

// ====================
// 카테고리 메타데이터
// ====================

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
    name: '돈·재산',
    emoji: '💰',
    description: '돈, 투자, 재산, 소득 관련',
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
    description: '전반적인 운세, 길흉, 조언',
    colorClasses: {
      active: 'bg-purple-500 dark:bg-purple-600 text-white shadow-lg',
      inactive: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      hover: 'hover:bg-purple-200 dark:hover:bg-purple-900/50',
    },
  },
];

// ====================
// 자미두수 카테고리별 질문
// ====================

export const ZIWEI_QUESTIONS: CategorizedQuestion[] = [
  // 🏥 건강 (5개)
  { category: 'health', question: '제 건강궁을 보면 어떤 질병에 주의해야 하나요?' },
  { category: 'health', question: '지금 앓고 있는 증상은 언제쯤 호전될까요?' },
  { category: 'health', question: '평생 건강운이 어떻게 변화하나요?' },
  { category: 'health', question: '어떤 건강 습관을 들여야 할까요?' },
  { category: 'health', question: '정신 건강과 감정 관리는 어떻게 해야 하나요?' },

  // 💰 돈·재산 (5개)
  { category: 'wealth', question: '제 재백궁을 보면 재산운이 어떤가요?' },
  { category: 'wealth', question: '큰돈을 벌 수 있는 시기는 언제인가요?' },
  { category: 'wealth', question: '지금 하려는 투자가 성공할까요?' },
  { category: 'wealth', question: '어떤 방법으로 재물을 모아야 유리한가요?' },
  { category: 'wealth', question: '평생 재물 흐름이 어떻게 변화하나요?' },

  // ❤️ 사랑/연애 (5개)
  { category: 'love', question: '제 부처궁을 보면 결혼운이 어떤가요?' },
  { category: 'love', question: '지금 만나는 사람과 결혼까지 갈 수 있을까요?' },
  { category: 'love', question: '언제 좋은 인연을 만날 수 있나요?' },
  { category: 'love', question: '배우자의 성격과 특징은 어떨까요?' },
  { category: 'love', question: '연애에서 겪는 어려움을 어떻게 극복해야 하나요?' },

  // 👥 인간관계 (5개)
  { category: 'relationship', question: '제 노복궁을 보면 인간관계는 어떤가요?' },
  { category: 'relationship', question: '직장에서 상사와의 관계는 어떻게 될까요?' },
  { category: 'relationship', question: '친구들과의 우정은 오래 갈까요?' },
  { category: 'relationship', question: '가족 관계에서 갈등을 어떻게 해결해야 하나요?' },
  { category: 'relationship', question: '귀인운이 좋은 시기는 언제인가요?' },

  // 💼 사업/커리어 (5개)
  { category: 'career', question: '제 관록궁을 보면 직업운이 어떤가요?' },
  { category: 'career', question: '지금 이직을 해도 괜찮을까요?' },
  { category: 'career', question: '사업을 시작하기 좋은 시기는 언제인가요?' },
  { category: 'career', question: '어떤 직업이 제게 가장 적합한가요?' },
  { category: 'career', question: '직장에서 승진 가능성은 얼마나 되나요?' },

  // 📚 학업/성장 (5개)
  { category: 'study', question: '제 천문궁을 보면 학업운이 어떤가요?' },
  { category: 'study', question: '지금 준비하는 시험에 합격할 수 있을까요?' },
  { category: 'study', question: '어떤 분야를 공부하는 것이 좋을까요?' },
  { category: 'study', question: '유학이나 진학은 어떻게 해야 하나요?' },
  { category: 'study', question: '자기계발을 위해 무엇에 집중해야 하나요?' },

  // 🌟 일반/운세 (5개)
  { category: 'general', question: '제 명반 전체를 보면 평생 운세가 어떤가요?' },
  { category: 'general', question: '올해 운세는 어떻게 흘러가나요?' },
  { category: 'general', question: '제 14주성 배치의 의미는 무엇인가요?' },
  { category: 'general', question: '저의 타고난 성격과 성향은 어떤가요?' },
  { category: 'general', question: '인생에서 가장 주의해야 할 점은 무엇인가요?' },
];
