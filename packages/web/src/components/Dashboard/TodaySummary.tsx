import { format, isValid } from 'date-fns'
import { ko } from 'date-fns/locale'
import { 
  CalendarIcon, 
  CheckCircleIcon, 
  BookOpenIcon, 
  ClockIcon,
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline'
import { DashboardStats } from '@/services/dashboardService'

interface TodaySummaryProps {
  todayData: DashboardStats['today']
  loading?: boolean
}

// 안전한 날짜 포맷팅 유틸리티 함수
const safeFormatDate = (dateValue: string | Date, formatString: string, fallback: string = '시간 오류') => {
  try {
    if (!dateValue) return fallback
    
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue
    
    if (!isValid(date)) {
      console.warn('Invalid date value:', dateValue)
      return fallback
    }
    
    return format(date, formatString, { locale: ko })
  } catch (error) {
    console.error('Date formatting error:', error, 'Input:', dateValue)
    return fallback
  }
}

// 안전한 날짜 비교 함수
const safeIsBeforeNow = (dateValue: string | Date) => {
  try {
    if (!dateValue) return false
    
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue
    
    if (!isValid(date)) return false
    
    return date < new Date()
  } catch (error) {
    console.error('Date comparison error:', error, 'Input:', dateValue)
    return false
  }
}

export default function TodaySummary({ todayData, loading }: TodaySummaryProps) {
  const today = new Date()
  
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }
  
  const completionPercentage = todayData.totalTodos > 0 
    ? Math.round((todayData.completedTodos / todayData.totalTodos) * 100)
    : 0
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            오늘의 요약
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {safeFormatDate(today, 'yyyy년 M월 d일 EEEE', '날짜 오류')}
          </p>
        </div>
        <div className="text-2xl">📊</div>
      </div>
      
      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* 일정 */}
        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
            <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {todayData.events.length}
            </p>
            <p className="text-sm text-blue-600/70 dark:text-blue-400/70">
              오늘 일정
            </p>
          </div>
        </div>
        
        {/* 할일 */}
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-lg">
            <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {todayData.completedTodos}/{todayData.totalTodos}
            </p>
            <p className="text-sm text-green-600/70 dark:text-green-400/70">
              완료된 할일
            </p>
          </div>
        </div>
        
        {/* 일기 */}
        <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="p-2 bg-purple-100 dark:bg-purple-800/50 rounded-lg">
            <BookOpenIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {todayData.diary ? '작성됨' : '미작성'}
            </p>
            <p className="text-sm text-purple-600/70 dark:text-purple-400/70">
              오늘 일기
            </p>
          </div>
        </div>
      </div>
      
      {/* 할일 진행률 */}
      {todayData.totalTodos > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              할일 완료율
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* 오늘의 일정 목록 */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          오늘 일정 ({todayData.events.length})
        </h3>
        
        {todayData.events.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>오늘 예정된 일정이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {todayData.events.map((event) => (
              <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {event.all_day 
                      ? '종일' 
                      : safeFormatDate(event.start_time, 'HH:mm', '--:--')
                    }
                  </p>
                </div>
                {!event.all_day && safeIsBeforeNow(event.start_time) && (
                  <ExclamationCircleIcon className="h-4 w-4 text-orange-500" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 오늘의 할일 목록 */}
      <div className="mt-6 space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <CheckCircleIcon className="h-5 w-5" />
          오늘 할일 ({todayData.todos.length})
        </h3>
        
        {todayData.todos.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <CheckCircleIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>오늘 예정된 할일이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {todayData.todos.map((todo) => (
              <div key={todo.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    todo.completed 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-300 dark:border-gray-500'
                  }`}>
                    {todo.completed && (
                      <CheckCircleIcon className="h-3 w-3 text-white" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    todo.completed 
                      ? 'text-gray-500 dark:text-gray-400 line-through' 
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {todo.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      todo.priority === 'high' 
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                        : todo.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {todo.priority === 'high' ? '높음' : todo.priority === 'medium' ? '보통' : '낮음'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 일기 상태 */}
      <div className="mt-6 p-4 rounded-lg border-2 border-dashed border-purple-300 dark:border-purple-600">
        <div className="flex items-center gap-3">
          <BookOpenIcon className="h-6 w-6 text-purple-500" />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {todayData.diary ? '오늘 일기가 작성되었습니다' : '오늘 일기를 작성해보세요'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {todayData.diary 
                ? `기분: ${todayData.diary.mood || '😐'}`
                : '하루를 마무리하며 생각을 정리해보세요'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}