/**
 * 사주분석 AI 질문 카테고리 시스템
 * - 7대 카테고리별로 사주(四柱)에 최적화된 질문 제공
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
// 사주(四柱) 카테고리별 질문
// ====================

export const SAJU_QUESTIONS: CategorizedQuestion[] = [
  // 🏥 건강 (5개)
  { category: 'health', question: '제 사주를 보면 타고난 건강 상태는 어떤가요?' },
  { category: 'health', question: '주의해야 할 질병이나 신체 부위가 있나요?' },
  { category: 'health', question: '오행 균형이 건강에 어떤 영향을 미치나요?' },
  { category: 'health', question: '평생 건강운이 어떻게 변화하나요?' },
  { category: 'health', question: '건강을 위해 어떤 색이나 방위가 좋은가요?' },

  // 💰 돈·재산 (5개)
  { category: 'wealth', question: '제 사주에 재성이 강한가요? 재물운은 어떤가요?' },
  { category: 'wealth', question: '큰돈을 벌 수 있는 대운 시기는 언제인가요?' },
  { category: 'wealth', question: '정재와 편재 중 어느 쪽이 강한가요?' },
  { category: 'wealth', question: '투자나 사업으로 돈을 벌 수 있을까요?' },
  { category: 'wealth', question: '재물 손실을 조심해야 할 시기는 언제인가요?' },

  // ❤️ 사랑/연애 (5개)
  { category: 'love', question: '제 사주에 배우자 인연은 어떻게 나타나나요?' },
  { category: 'love', question: '결혼 시기는 언제쯤 될까요?' },
  { category: 'love', question: '배우자의 성격과 특징은 어떨까요?' },
  { category: 'love', question: '지금 만나는 사람과 궁합이 맞나요?' },
  { category: 'love', question: '연애에서 주의해야 할 점은 무엇인가요?' },

  // 👥 인간관계 (5개)
  { category: 'relationship', question: '제 사주에 인성과 비겁이 어떻게 작용하나요?' },
  { category: 'relationship', question: '직장 상사나 동료와의 관계는 어떤가요?' },
  { category: 'relationship', question: '가족 관계에서 겪는 어려움은 왜 생기나요?' },
  { category: 'relationship', question: '귀인운이 좋은 대운은 언제인가요?' },
  { category: 'relationship', question: '인간관계에서 손해를 보지 않으려면 어떻게 해야 하나요?' },

  // 💼 사업/커리어 (5개)
  { category: 'career', question: '제 사주에 관성이 강한가요? 직업운은 어떤가요?' },
  { category: 'career', question: '어떤 직업이나 업종이 저에게 맞나요?' },
  { category: 'career', question: '사업을 해야 할까요, 직장생활이 나을까요?' },
  { category: 'career', question: '승진이나 성공의 시기는 언제인가요?' },
  { category: 'career', question: '지금 이직을 해도 괜찮을까요?' },

  // 📚 학업/성장 (5개)
  { category: 'study', question: '제 사주에 식상이 강한가요? 학업운은 어떤가요?' },
  { category: 'study', question: '어떤 학문이나 분야를 공부하면 좋을까요?' },
  { category: 'study', question: '시험 합격 가능성은 얼마나 되나요?' },
  { category: 'study', question: '유학이나 진학은 언제가 좋을까요?' },
  { category: 'study', question: '자격증이나 전문 분야 공부에 유리한 시기는?' },

  // 🌟 일반/운세 (5개)
  { category: 'general', question: '제 사주 전체를 보면 평생 운세가 어떤가요?' },
  { category: 'general', question: '올해 대운과 세운은 어떻게 작용하나요?' },
  { category: 'general', question: '제 타고난 성격과 기질은 어떤가요?' },
  { category: 'general', question: '인생에서 가장 좋은 시기와 어려운 시기는 언제인가요?' },
  { category: 'general', question: '사주의 용신과 희신은 무엇이며, 어떻게 활용해야 하나요?' },
];
