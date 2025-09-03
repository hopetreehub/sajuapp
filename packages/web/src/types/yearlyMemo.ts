export type MemoType = 'goal' | 'event' | 'memo' | 'milestone';
export type ImportanceLevel = 'high' | 'medium' | 'low';

export interface YearlyMemo {
  id: string;
  year: number;
  month: number;
  type: MemoType;
  title: string;
  description?: string;
  color: string;
  importance: ImportanceLevel;
  completed?: boolean;
  position?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthlyOverview {
  month: number;
  memos: YearlyMemo[];
  statistics: {
    totalEvents: number;
    completedGoals: number;
    upcomingMilestones: number;
  };
}

export const MEMO_TYPE_CONFIG = {
  goal: {
    icon: '🎯',
    label: '목표',
    color: '#9333EA', // Purple
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-600 dark:text-purple-400'
  },
  event: {
    icon: '📅',
    label: '이벤트',
    color: '#3B82F6', // Blue
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-600 dark:text-blue-400'
  },
  memo: {
    icon: '📝',
    label: '메모',
    color: '#EAB308', // Yellow
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    textColor: 'text-yellow-600 dark:text-yellow-400'
  },
  milestone: {
    icon: '🏆',
    label: '마일스톤',
    color: '#22C55E', // Green
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-600 dark:text-green-400'
  }
};

export const IMPORTANCE_CONFIG = {
  high: {
    icon: '🔴',
    label: '높음'
  },
  medium: {
    icon: '🟡',
    label: '보통'
  },
  low: {
    icon: '🟢',
    label: '낮음'
  }
};