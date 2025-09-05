import { useMemo, useState } from 'react'
import { useCalendar } from '@/contexts/CalendarContext'
import { useDiaryData } from '@/hooks/useDiaryData'
import DiaryIndicator from './DiaryIndicator'
import { Todo } from '@/types/todo'
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  getDay
} from 'date-fns'
import { ko } from 'date-fns/locale'
import { CalendarEvent } from '@/services/api'
import { formatLunarDate, getSpecialLunarDay } from '@/utils/lunarCalendar'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

interface MonthViewProps {
  events: CalendarEvent[]
  onCreateEvent: (date: Date) => void
  onDateClick?: (date: Date, event: React.MouseEvent) => void
  onEditEvent: (event: CalendarEvent) => void
  onDeleteEvent?: (eventId: string) => void
  highlightedEventId?: string | null
  onDiaryClick?: (date: Date) => void
}

export default function MonthView({ events, onCreateEvent, onDateClick, onEditEvent, onDeleteEvent, highlightedEventId, onDiaryClick }: MonthViewProps) {
  const { currentDate, setSelectedDate, setViewMode, getTodosForDate, deleteTodo } = useCalendar()
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)
  
  // 일기 데이터 가져오기
  const { hasDiary, getDiaryForDate } = useDiaryData({ 
    viewMode: 'month', 
    currentDate 
  })

  const monthDays = useMemo(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const startWeek = startOfWeek(start, { weekStartsOn: 0 })
    const endWeek = endOfWeek(end, { weekStartsOn: 0 })
    
    return eachDayOfInterval({ start: startWeek, end: endWeek })
  }, [currentDate])

  const getEventsForDay = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time)
      return isSameDay(eventDate, date)
    }).slice(0, 3) // 최대 3개만 표시
  }

  // 날짜별 할일 데이터 메모이제이션
  const todosForMonth = useMemo(() => {
    const todosMap = new Map<string, ReturnType<typeof getTodosForDate>>()
    monthDays.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd')
      todosMap.set(dateKey, getTodosForDate(day))
    })
    return todosMap
  }, [monthDays, getTodosForDate])

  // 우선순위별 색상 정의
  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  // 우선순위별 아이콘
  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return '🔴'
      case 'medium':
        return '🟡'
      case 'low':
        return '🟢'
      default:
        return '⚪'
    }
  }

  const handleDayClick = (date: Date, event: React.MouseEvent) => {
    // 새로운 통합 날짜 클릭 핸들러가 있으면 그것을 사용, 없으면 기존 방식
    if (onDateClick) {
      onDateClick(date, event)
    } else {
      onCreateEvent(date)
    }
  }

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    onEditEvent(event)
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-border bg-muted">
        {WEEKDAYS.map((day, index) => (
          <div 
            key={day} 
            className={`
              px-2 py-3 text-center text-sm font-semibold
              ${index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-foreground'}
            `}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-px bg-border">
        {monthDays.map((day) => {
          const dayOfWeek = getDay(day)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isCurrentDay = isToday(day)
          const dayEvents = getEventsForDay(day)
          const dateKey = format(day, 'yyyy-MM-dd')
          const dayTodos = todosForMonth.get(dateKey) || []
          const incompleteTodos = dayTodos.filter(todo => !todo.completed)
          const completedTodos = dayTodos.filter(todo => todo.completed)
          
          return (
            <div
              key={day.toISOString()}
              onClick={(e) => handleDayClick(day, e)}
              onMouseEnter={() => setHoveredDate(day)}
              onMouseLeave={() => setHoveredDate(null)}
              className={`
                bg-background p-2 cursor-pointer transition-colors relative
                hover:bg-muted/50
                ${!isCurrentMonth ? 'bg-muted/30' : ''}
                ${isCurrentDay ? 'bg-primary/10' : ''}
              `}
            >
              {/* Date Number */}
              <div className="flex items-start justify-between mb-1">
                <div className="flex flex-col">
                  <span 
                    className={`
                      text-sm font-medium
                      ${isCurrentDay 
                        ? 'bg-primary-500 text-white rounded-full w-7 h-7 flex items-center justify-center' 
                        : ''
                      }
                      ${!isCurrentMonth ? 'text-muted-foreground' : ''}
                      ${dayOfWeek === 0 ? 'text-red-600' : ''}
                      ${dayOfWeek === 6 ? 'text-blue-600' : ''}
                    `}
                  >
                    {format(day, 'd')}
                  </span>
                  {/* 음력 날짜 표시 */}
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {formatLunarDate(day, false)}
                  </span>
                  {/* 특별한 음력 날짜 표시 */}
                  {getSpecialLunarDay(day) && (
                    <span className="text-[10px] text-red-500 font-semibold">
                      {getSpecialLunarDay(day)}
                    </span>
                  )}
                </div>
                
                {/* 할일 및 일기 표시 */}
                {isCurrentMonth && (
                  <div className="flex items-center gap-1">
                    {/* 일기 아이콘 표시 */}
                    <DiaryIndicator
                      date={day}
                      hasDiary={hasDiary(day)}
                      onClick={() => onDiaryClick?.(day)}
                      size="small"
                    />
                    
                    {/* 우선순위별 할일 개수 표시 */}
                    {dayTodos.length > 0 && (
                      <>
                        {incompleteTodos.filter(t => t.priority === 'high').length > 0 && (
                          <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                            {incompleteTodos.filter(t => t.priority === 'high').length}
                          </span>
                        )}
                        {incompleteTodos.filter(t => t.priority === 'medium').length > 0 && (
                          <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-yellow-500 rounded-full">
                            {incompleteTodos.filter(t => t.priority === 'medium').length}
                          </span>
                        )}
                        {incompleteTodos.filter(t => t.priority === 'low').length > 0 && (
                          <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-green-500 rounded-full">
                            {incompleteTodos.filter(t => t.priority === 'low').length}
                          </span>
                        )}
                        {/* 완료된 할일 */}
                        {completedTodos.length > 0 && (
                          <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-gray-500 bg-gray-200 rounded-full">
                            ✓
                          </span>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 group flex items-center ${
                      highlightedEventId === event.id ? 'ring-2 ring-primary animate-pulse' : ''
                    }`}
                    style={{ 
                      backgroundColor: `${event.color || '#3b82f6'}20`,
                      color: event.color || '#3b82f6',
                      borderLeft: `2px solid ${event.color || '#3b82f6'}`
                    }}
                    onClick={(e) => handleEventClick(event, e)}
                  >
                    <span className="flex-1 truncate">
                      {event.all_day && <span className="font-semibold">종일 </span>}
                      {!event.all_day && format(new Date(event.start_time), 'HH:mm')} {event.title}
                    </span>
                    {onDeleteEvent && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteEvent?.(event.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity ml-1"
                        title="일정 삭제"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                
                {/* More Events Indicator */}
                {events.filter(e => isSameDay(new Date(e.start_time), day)).length > 3 && (
                  <div className="text-xs text-muted-foreground font-medium">
                    +{events.filter(e => isSameDay(new Date(e.start_time), day)).length - 3}개 더보기
                  </div>
                )}
              </div>

              {/* 할일 미리보기 툴팁 */}
              {hoveredDate && isSameDay(hoveredDate, day) && dayTodos.length > 0 && (
                <div className="absolute z-50 top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
                  {/* 할일 목록 */}
                  <div className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">
                    할일 목록 ({dayTodos.length}개)
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {dayTodos.slice(0, 5).map((todo) => (
                      <div key={todo.id} className="flex items-start gap-2 text-xs group">
                        <span>{getPriorityIcon(todo.priority)}</span>
                        <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                          {todo.text}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteTodo(todo.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                          title="할일 삭제"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {dayTodos.length > 5 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        +{dayTodos.length - 5}개 더보기
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}