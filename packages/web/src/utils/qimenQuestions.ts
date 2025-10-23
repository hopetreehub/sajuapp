/**
 * 귀문둔갑 AI 질문 카테고리 시스템
 * - 7대 카테고리별로 귀문둔갑에 최적화된 질문 제공
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
// 귀문둔갑 카테고리별 질문
// ====================

export const QIMEN_QUESTIONS: CategorizedQuestion[] = [
  // 🏥 건강 (5개)
  { category: 'health', question: '지금 시간의 귀문둔갑을 보면 건강운이 어떤가요?' },
  { category: 'health', question: '병원 방향은 어느 방위가 좋나요?' },
  { category: 'health', question: '생문이 있는 방위로 가면 건강에 도움이 될까요?' },
  { category: 'health', question: '언제 병원에 가는 것이 좋을까요?' },
  { category: 'health', question: '지금 몸 상태가 안 좋은데 언제 회복되나요?' },

  // 💰 돈·재산 (5개)
  { category: 'wealth', question: '지금 사업 계약을 해도 괜찮을까요?' },
  { category: 'wealth', question: '돈을 벌기 좋은 방향은 어디인가요?' },
  { category: 'wealth', question: '투자 타이밍이 지금 적절한가요?' },
  { category: 'wealth', question: '생문과 개문이 좋은 시간대는 언제인가요?' },
  { category: 'wealth', question: '재물운이 좋은 방위로 사무실을 두면 어떨까요?' },

  // ❤️ 사랑/연애 (5개)
  { category: 'love', question: '지금 고백하기 좋은 타이밍인가요?' },
  { category: 'love', question: '연애운이 좋은 방향으로 데이트하면 어떨까요?' },
  { category: 'love', question: '육합이 있는 방위가 어디인가요?' },
  { category: 'love', question: '언제 만남을 가지는 것이 좋을까요?' },
  { category: 'love', question: '이 사람과의 관계가 잘 풀릴까요?' },

  // 👥 인간관계 (5개)
  { category: 'relationship', question: '중요한 미팅은 어느 방향에서 하는 것이 좋을까요?' },
  { category: 'relationship', question: '상사와의 면담 시간은 언제가 좋을까요?' },
  { category: 'relationship', question: '귀인운이 있는 방위는 어디인가요?' },
  { category: 'relationship', question: '갈등이 있는 사람과 언제 대화해야 할까요?' },
  { category: 'relationship', question: '협상이나 설득은 어느 시간대가 유리한가요?' },

  // 💼 사업/커리어 (5개)
  { category: 'career', question: '사업 회의는 어느 방향에서 하는 것이 좋을까요?' },
  { category: 'career', question: '계약서 작성 시간은 언제가 좋을까요?' },
  { category: 'career', question: '개문이 있는 방위로 가면 사업 기회가 생길까요?' },
  { category: 'career', question: '이직 결정을 언제 하는 것이 좋을까요?' },
  { category: 'career', question: '중요한 프레젠테이션은 어느 방향에서 하는 것이 유리한가요?' },

  // 📚 학업/성장 (5개)
  { category: 'study', question: '시험 공부는 어느 방향에서 하는 것이 좋을까요?' },
  { category: 'study', question: '시험 시간대의 운세는 어떤가요?' },
  { category: 'study', question: '공부 환경을 바꾸면 도움이 될까요?' },
  { category: 'study', question: '면접이나 시험은 언제 보는 것이 좋을까요?' },
  { category: 'study', question: '학습 효율이 높은 시간대는 언제인가요?' },

  // 🌟 일반/운세 (5개)
  { category: 'general', question: '지금 국(局)의 전체 운세는 어떤가요?' },
  { category: 'general', question: '가장 좋은 방위와 피해야 할 방위는 어디인가요?' },
  { category: 'general', question: '오늘 하루 운세가 좋은 시간대는 언제인가요?' },
  { category: 'general', question: '중요한 결정을 내리기 좋은 타이밍은 언제인가요?' },
  { category: 'general', question: '지금 시간의 천반과 지반은 어떻게 작용하나요?' },
];
