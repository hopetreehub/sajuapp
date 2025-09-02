// Todo 타입 정의 - 전체 앱에서 사용하는 통합 타입
export interface Todo {
  id: string
  text: string
  title?: string // SearchService와의 호환성을 위해 추가
  description?: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  date: string // YYYY-MM-DD
  tags?: string[]
  createdAt: Date | string
  updatedAt: Date | string
}

// Todo 생성 시 사용하는 타입
export type TodoInput = Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>

// Todo 업데이트 시 사용하는 타입
export type TodoUpdate = Partial<Todo>

// Todo 우선순위별 색상 매핑
export const TODO_PRIORITY_COLORS = {
  high: '#ef4444',    // red-500
  medium: '#f59e0b',  // amber-500
  low: '#10b981'      // emerald-500
} as const

// Todo 우선순위별 아이콘
export const TODO_PRIORITY_ICONS = {
  high: '🔴',
  medium: '🟡',
  low: '🟢'
} as const