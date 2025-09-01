import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'
import { eventService, diaryService, CalendarEvent, DiaryEntry } from './api'

// 대시보드 통계 타입
export interface DashboardStats {
  today: {
    events: CalendarEvent[]
    todos: any[] // TODO: Todo 타입 정의 후 변경
    diary: DiaryEntry | null
    hasScheduledEvents: boolean
    completedTodos: number
    totalTodos: number
  }
  week: {
    completionRate: number
    totalEvents: number
    totalDiaries: number
    moodTrend: { date: string; mood: string }[]
    activityData: { date: string; events: number; todos: number; diary: boolean }[]
  }
  month: {
    activityHeatmap: { date: string; intensity: number }[]
    tagDistribution: { name: string; count: number; color: string }[]
    totalActivities: number
  }
}

export interface QuickAction {
  id: string
  label: string
  icon: string
  color: string
  action: () => void
}

/**
 * 오늘의 데이터 가져오기
 */
export const getTodayData = async (todos: any[] = []): Promise<DashboardStats['today']> => {
  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')
  
  try {
    // 병렬로 데이터 가져오기
    const [events, diary] = await Promise.all([
      eventService.getEvents({
        start_date: todayStr,
        end_date: todayStr
      }),
      diaryService.getDiaryByDate(todayStr).catch(() => null) // 404 에러 무시
    ])
    
    // 오늘의 할일 필터링
    const todayTodos = todos.filter(todo => isSameDay(new Date(todo.date), today))
    const completedTodos = todayTodos.filter(todo => todo.completed).length
    
    return {
      events: events || [],
      todos: todayTodos,
      diary: diary,
      hasScheduledEvents: (events?.length || 0) > 0,
      completedTodos,
      totalTodos: todayTodos.length
    }
  } catch (error) {
    console.error('Failed to fetch today data:', error)
    return {
      events: [],
      todos: [],
      diary: null,
      hasScheduledEvents: false,
      completedTodos: 0,
      totalTodos: 0
    }
  }
}

/**
 * 주간 통계 데이터 가져오기
 */
export const getWeeklyStats = async (todos: any[] = []): Promise<DashboardStats['week']> => {
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 0 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
  
  try {
    // 주간 이벤트 및 일기 가져오기
    const [events, diaries] = await Promise.all([
      eventService.getEvents({
        start_date: format(weekStart, 'yyyy-MM-dd'),
        end_date: format(weekEnd, 'yyyy-MM-dd')
      }),
      Promise.all(weekDays.map(day => 
        diaryService.getDiaryByDate(format(day, 'yyyy-MM-dd')).catch(() => null)
      ))
    ])
    
    // 주간 할일 필터링
    const weekTodos = todos.filter(todo => {
      const todoDate = new Date(todo.date)
      return todoDate >= weekStart && todoDate <= weekEnd
    })
    
    const completedWeekTodos = weekTodos.filter(todo => todo.completed).length
    const completionRate = weekTodos.length > 0 ? (completedWeekTodos / weekTodos.length) * 100 : 0
    
    // 기분 트렌드
    const moodTrend = diaries
      .filter(diary => diary && diary.mood)
      .map(diary => ({
        date: diary!.date,
        mood: diary!.mood || '😐'
      }))
    
    // 활동 데이터
    const activityData = weekDays.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd')
      const dayEvents = events?.filter(event => 
        format(new Date(event.start_time), 'yyyy-MM-dd') === dayStr
      ) || []
      const dayTodos = weekTodos.filter(todo => 
        format(new Date(todo.date), 'yyyy-MM-dd') === dayStr
      )
      const hasDiary = diaries.some(diary => diary && diary.date === dayStr)
      
      return {
        date: dayStr,
        events: dayEvents.length,
        todos: dayTodos.length,
        diary: hasDiary
      }
    })
    
    return {
      completionRate: Math.round(completionRate),
      totalEvents: events?.length || 0,
      totalDiaries: diaries.filter(d => d).length,
      moodTrend,
      activityData
    }
  } catch (error) {
    console.error('Failed to fetch weekly stats:', error)
    return {
      completionRate: 0,
      totalEvents: 0,
      totalDiaries: 0,
      moodTrend: [],
      activityData: []
    }
  }
}

/**
 * 월간 통계 데이터 가져오기
 */
export const getMonthlyStats = async (todos: any[] = []): Promise<DashboardStats['month']> => {
  const today = new Date()
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  try {
    // 월간 이벤트 및 일기 가져오기
    const [events, diaries] = await Promise.all([
      eventService.getEvents({
        start_date: format(monthStart, 'yyyy-MM-dd'),
        end_date: format(monthEnd, 'yyyy-MM-dd')
      }),
      Promise.all(monthDays.map(day => 
        diaryService.getDiaryByDate(format(day, 'yyyy-MM-dd')).catch(() => null)
      ))
    ])
    
    // 월간 할일 필터링
    const monthTodos = todos.filter(todo => {
      const todoDate = new Date(todo.date)
      return todoDate >= monthStart && todoDate <= monthEnd
    })
    
    // 활동 히트맵 데이터
    const activityHeatmap = monthDays.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd')
      const dayEvents = events?.filter(event => 
        format(new Date(event.start_time), 'yyyy-MM-dd') === dayStr
      ) || []
      const dayTodos = monthTodos.filter(todo => 
        format(new Date(todo.date), 'yyyy-MM-dd') === dayStr
      )
      const hasDiary = diaries.some(diary => diary && diary.date === dayStr)
      
      // 활동 강도 계산 (0-4)
      let intensity = 0
      if (dayEvents.length > 0) intensity += 1
      if (dayTodos.length > 0) intensity += 1
      if (hasDiary) intensity += 1
      if (dayTodos.filter(t => t.completed).length > 0) intensity += 1
      
      return {
        date: dayStr,
        intensity: Math.min(intensity, 4)
      }
    })
    
    // 태그 분포 (이벤트 태그 기준)
    const tagCounts = new Map<string, number>()
    events?.forEach(event => {
      if (event.tags && Array.isArray(event.tags)) {
        event.tags.forEach((tag: any) => {
          const tagName = typeof tag === 'string' ? tag : tag.name
          tagCounts.set(tagName, (tagCounts.get(tagName) || 0) + 1)
        })
      }
    })
    
    const tagDistribution = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count], index) => ({
        name,
        count,
        color: [
          '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', 
          '#EF4444', '#6366F1', '#EC4899', '#14B8A6',
          '#F97316', '#84CC16'
        ][index] || '#6B7280'
      }))
    
    const totalActivities = (events?.length || 0) + monthTodos.length + diaries.filter(d => d).length
    
    return {
      activityHeatmap,
      tagDistribution,
      totalActivities
    }
  } catch (error) {
    console.error('Failed to fetch monthly stats:', error)
    return {
      activityHeatmap: [],
      tagDistribution: [],
      totalActivities: 0
    }
  }
}

/**
 * 전체 대시보드 데이터 가져오기
 */
export const getDashboardData = async (todos: any[] = []): Promise<DashboardStats> => {
  try {
    const [today, week, month] = await Promise.all([
      getTodayData(todos),
      getWeeklyStats(todos),
      getMonthlyStats(todos)
    ])
    
    return { today, week, month }
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
    throw error
  }
}

/**
 * 빠른 액션 목록
 */
export const getQuickActions = (): QuickAction[] => [
  {
    id: 'add-event',
    label: '일정 추가',
    icon: '📅',
    color: 'bg-blue-500 hover:bg-blue-600',
    action: () => {
      // TODO: 이벤트 추가 모달 열기
      console.log('Open add event modal')
    }
  },
  {
    id: 'add-todo',
    label: '할일 추가',
    icon: '✅',
    color: 'bg-green-500 hover:bg-green-600',
    action: () => {
      // TODO: 할일 추가 모달 열기
      console.log('Open add todo modal')
    }
  },
  {
    id: 'write-diary',
    label: '일기 작성',
    icon: '📝',
    color: 'bg-purple-500 hover:bg-purple-600',
    action: () => {
      // TODO: 일기 모달 열기
      console.log('Open diary modal')
    }
  },
  {
    id: 'view-calendar',
    label: '캘린더 보기',
    icon: '🗓️',
    color: 'bg-orange-500 hover:bg-orange-600',
    action: () => {
      window.location.href = '/calendar'
    }
  }
]