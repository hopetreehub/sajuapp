import { useMemo, useState } from 'react'
import { useCalendar } from '@/contexts/CalendarContext'
import { useDiaryData } from '@/hooks/useDiaryData'
import AddItemModal from '@/components/AddItemModal'
import DiaryBookModal from '@/components/DiaryBookModal'
import EditTodoModal from '@/components/EditTodoModal'
import { Todo } from '@/contexts/CalendarContext'
import { ITEM_COLORS } from '@/types/todo'
import { 
  startOfWeek, 
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  getHours
} from 'date-fns'
import { ko } from 'date-fns/locale'
import { CalendarEvent } from '@/services/api'

const HOURS = Array.from({ length: 11 }, (_, i) => i + 9) // 9시-19시

interface WeekViewProps {
  events: CalendarEvent[]
  onCreateEvent: (date: Date) => void
  onDateClick?: (date: Date, event: React.MouseEvent) => void
  onEditEvent: (event: CalendarEvent) => void
  onDeleteEvent?: (eventId: string) => void
  highlightedEventId?: string | null
  onDiaryClick?: (date: Date) => void
}

export default function WeekView({ events, onCreateEvent, onDateClick, onEditEvent, onDeleteEvent, highlightedEventId }: WeekViewProps) {
  const { currentDate, getTodosForDate, addTodo, deleteTodo, toggleTodo } = useCalendar()
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedHour, setSelectedHour] = useState<number | undefined>()
  const [isDiaryOpen, setIsDiaryOpen] = useState(false)
  const [diaryDate, setDiaryDate] = useState<Date>(new Date())
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  
  // 일기 데이터 가져오기
  const { diaryDates } = useDiaryData({ 
    viewMode: 'week', 
    currentDate 
  })

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 })
    const end = endOfWeek(currentDate, { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return ''
    }
  }

  const handleDiaryClick = (date: Date) => {
    setDiaryDate(date)
    setIsDiaryOpen(true)
  }

  const getEventsForDayAndHour = (date: Date, hour: number) => {
    if (!events || events.length === 0) return []
    
    return events.filter(event => {
      if (!event.start_time) return false
      
      try {
        const eventStart = new Date(event.start_time)
        if (isNaN(eventStart.getTime())) return false
        
        const eventHour = getHours(eventStart)
        return isSameDay(eventStart, date) && eventHour === hour
      } catch (error) {
        console.warn('Invalid event date:', event.start_time, error)
        return false
      }
    })
  }

  // 시간이 지정된 할일을 가져오는 함수
  const getTodosForDayAndHour = (date: Date, hour: number) => {
    const dayTodos = getTodosForDate(date)
    return dayTodos.filter(todo => {
      if (!todo.hasTime || !todo.startTime) return false
      
      try {
        const [todoHour] = todo.startTime.split(':').map(Number)
        return todoHour === hour
      } catch (error) {
        console.warn('Invalid todo time:', todo.startTime, error)
        return false
      }
    })
  }

  // 시간이 지정되지 않은 할일만 가져오는 함수
  const getUntimedTodosForDate = (date: Date) => {
    const dayTodos = getTodosForDate(date)
    return dayTodos.filter(todo => !todo.hasTime || !todo.startTime)
  }

  const currentHour = new Date().getHours()
  const currentMinute = new Date().getMinutes()
  const currentTimePosition = (currentHour * 60 + currentMinute) / (24 * 60) * 100

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header with weekdays */}
      <div className="grid grid-cols-8 border-b border-border bg-muted sticky top-0 z-10">
        <div className="p-3 text-center text-sm font-semibold text-muted-foreground">
          시간
        </div>
        {weekDays.map((day) => {
          const dayOfWeek = day.getDay()
          const isCurrentDay = isToday(day)
          
          return (
            <div 
              key={day.toISOString()} 
              className={`
                p-3 text-center border-l border-border
                ${isCurrentDay ? 'bg-primary/10' : ''}
              `}
            >
              <div className={`text-xs font-medium ${dayOfWeek === 0 ? 'text-red-600' : dayOfWeek === 6 ? 'text-blue-600' : 'text-muted-foreground'}`}>
                {format(day, 'EEE', { locale: ko })}
              </div>
              <div className="flex items-center justify-center gap-1">
                <div className={`text-lg font-semibold ${isCurrentDay ? 'text-primary' : 'text-foreground'}`}>
                  {format(day, 'd')}
                </div>
                {/* 일기 아이콘 표시 - 일기가 있을 때만 표시 */}
                {diaryDates.has(format(day, 'yyyy-MM-dd')) && (
                  <button
                    onClick={() => handleDiaryClick(day)}
                    className="p-1 rounded-full text-xs transition-all hover:scale-110 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    title="일기 보기/수정"
                  >
                    📖
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-auto">
        <div className="relative">
          {/* Current time indicator */}
          {weekDays.some(day => isToday(day)) && (
            <div 
              className="absolute left-0 right-0 z-20 pointer-events-none"
              style={{ top: `${currentTimePosition}%` }}
            >
              <div className="flex items-center">
                <div className="w-16"></div>
                <div className="flex-1 h-0.5 bg-red-500"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full -ml-1"></div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-8">
            {/* Time column */}
            <div className="border-r border-border">
              {HOURS.map(hour => (
                <div key={hour} className="h-16 px-2 py-1 text-xs text-muted-foreground text-right">
                  {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map(day => {
              const isCurrentDay = isToday(day)
              
              return (
                <div key={day.toISOString()} className="border-r border-border">
                  {HOURS.map(hour => {
                    const dayEvents = getEventsForDayAndHour(day, hour)
                    const hourTodos = getTodosForDayAndHour(day, hour)
                    
                    return (
                      <div 
                        key={`${day.toISOString()}-${hour}`} 
                        className={`
                          h-16 border-b border-border/50 p-1 cursor-pointer
                          hover:bg-muted/50 transition-colors
                          ${isCurrentDay && currentHour === hour ? 'bg-primary/10' : ''}
                        `}
                        onClick={(e) => {
                          if (onDateClick) {
                            // 새로운 통합 날짜 클릭 핸들러가 있으면 그것을 사용
                            onDateClick(day, e)
                          } else {
                            // 기존 방식
                            setSelectedDate(new Date(day))
                            setSelectedHour(hour)
                            setShowAddModal(true)
                          }
                        }}
                      >
                        {/* 일정 표시 */}
                        {dayEvents.map(event => {
                          if (!event.id || !event.start_time || !event.title) return null
                          
                          try {
                            const startTime = new Date(event.start_time)
                            if (isNaN(startTime.getTime())) return null
                            
                            return (
                              <div
                                key={event.id}
                                className="text-xs p-1 mb-1 rounded truncate cursor-pointer hover:opacity-80 group flex items-center justify-between"
                                style={{ 
                                  backgroundColor: ITEM_COLORS.event.background,
                                  color: ITEM_COLORS.event.text,
                                  borderLeft: `2px solid ${ITEM_COLORS.event.border}`
                                }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onEditEvent(event)
                                }}
                              >
                                <span className="truncate">
                                  {format(startTime, 'HH:mm')} {event.title}
                                </span>
                                {onDeleteEvent && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (confirm(`"${event.title}" 일정을 삭제하시겠습니까?`)) {
                                        onDeleteEvent(event.id)
                                      }
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity ml-1 flex-shrink-0"
                                    title="일정 삭제"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            )
                          } catch (error) {
                            console.warn('Error rendering event:', event, error)
                            return null
                          }
                        })}
                        
                        {/* 시간별 할일 표시 */}
                        {hourTodos.map(todo => {
                          const todoColors = ITEM_COLORS.todo[todo.priority]
                          return (
                            <div
                              key={todo.id}
                              className="text-xs p-1 mb-1 rounded truncate cursor-pointer hover:opacity-80 flex items-center space-x-1"
                              style={{
                                backgroundColor: todoColors.background,
                                color: todoColors.text,
                                borderLeft: `2px solid ${todoColors.border}`
                              }}
                            onClick={(e) => {
                              e.stopPropagation()
                              // 할일 편집 로직 추가 가능
                            }}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleTodo(todo.id)
                              }}
                              className={`
                                w-2 h-2 rounded-full border flex items-center justify-center text-xs
                                ${todo.completed 
                                  ? 'bg-green-500 border-green-500 text-white' 
                                  : 'border-orange-400'
                                }
                              `}
                            >
                              {todo.completed && '✓'}
                            </button>
                            <span className="text-xs">{getPriorityIcon(todo.priority)}</span>
                            <span className={`flex-1 ${todo.completed ? 'line-through opacity-60' : ''}`}>
                              {todo.startTime} {todo.text}
                            </span>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>

          {/* 할일 섹션 */}
          <div className="mt-4 grid grid-cols-8 gap-px bg-border">
            {/* 할일 헤더 */}
            <div className="bg-muted p-3 text-center text-sm font-semibold text-muted-foreground">
              할일
            </div>
            
            {/* 각 요일의 시간이 지정되지 않은 할일 및 일기 */}
            {weekDays.map(day => {
              const dayTodos = getUntimedTodosForDate(day)
              const isCurrentDay = isToday(day)
              
              return (
                <div 
                  key={`todos-${day.toISOString()}`} 
                  className={`
                    bg-background p-3 min-h-[120px]
                    ${isCurrentDay ? 'bg-primary/5' : ''}
                  `}
                >
                  {/* 일기 아이콘 표시 - 일기가 있을 때만 표시 */}
                  {diaryDates.has(format(day, 'yyyy-MM-dd')) && (
                    <div className="mb-2 flex items-center">
                      <button
                        onClick={() => handleDiaryClick(day)}
                        className="p-1 rounded text-xs transition-all hover:scale-105 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                        title="일기 보기/수정"
                      >
                        📖 <span className="ml-1 text-xs">일기</span>
                      </button>
                    </div>
                  )}
                  
                  {/* 할일 목록 */}
                  <div className="space-y-1 mb-2">
                    {dayTodos.map(todo => (
                      <div key={todo.id} className="flex items-center space-x-1 group">
                        <button
                          onClick={() => toggleTodo(todo.id)}
                          className={`
                            w-3 h-3 rounded-full border flex items-center justify-center text-xs
                            ${todo.completed 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-gray-300 dark:border-gray-600'
                            }
                          `}
                        >
                          {todo.completed && '✓'}
                        </button>
                        <span className="text-xs">{getPriorityIcon(todo.priority)}</span>
                        <span 
                          className={`
                            flex-1 text-xs truncate cursor-pointer hover:underline
                            ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800 dark:text-gray-200'}
                          `}
                          onClick={() => setEditingTodo(todo)}
                        >
                          {todo.text}
                        </span>
                        <button
                          onClick={() => setEditingTodo(todo)}
                          className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 text-xs"
                          title="수정"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* 할일 추가 버튼 제거됨 - 타임라인 클릭으로 통합 */}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 통합 추가 모달 */}
      {showAddModal && (
        <AddItemModal
          date={selectedDate}
          hour={selectedHour}
          onClose={() => setShowAddModal(false)}
          onAddEvent={(event) => {
            onCreateEvent(new Date(event.start_time))
            setShowAddModal(false)
          }}
          onAddTodo={(todo) => {
            addTodo(todo)
            setShowAddModal(false)
          }}
        />
      )}
      
      {/* 일기 모달 */}
      <DiaryBookModal 
        isOpen={isDiaryOpen}
        onClose={() => setIsDiaryOpen(false)}
        date={diaryDate}
        onSave={() => setIsDiaryOpen(false)}
      />
      
      {/* 할일 수정 모달 */}
      <EditTodoModal
        isOpen={!!editingTodo}
        onClose={() => setEditingTodo(null)}
        todo={editingTodo}
      />
    </div>
  )
}