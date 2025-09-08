import { useMemo, useState } from 'react'
import { useCalendar } from '@/contexts/CalendarContext'
import { format, isSameDay, getHours, getMinutes } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CalendarEvent } from '@/services/api'
import DiaryBookModal from '@/components/DiaryBookModal'
import { useDiaryData } from '@/hooks/useDiaryData'
import TodayFortuneSection from '@/components/TodayFortuneSection'

const HOURS = Array.from({ length: 10 }, (_, i) => i + 9) // 9시-18시

interface DayViewProps {
  events: CalendarEvent[]
  onCreateEvent: (date: Date) => void
  onEditEvent: (event: CalendarEvent) => void
}

export default function DayView({ 
  events, 
  onCreateEvent, 
  onEditEvent
}: DayViewProps) {
  const { currentDate, todos, getTodosForDate, deleteTodo, toggleTodo } = useCalendar()
  const [isDiaryOpen, setIsDiaryOpen] = useState(false)
  const { diaryDates } = useDiaryData({ viewMode: 'day', currentDate })
  
  // 현재 날짜에 일기가 있는지 확인
  const hasCurrentDateDiary = diaryDates.has(format(currentDate, 'yyyy-MM-dd'))

  // 현재 날짜의 할일 가져오기
  const dayTodos = useMemo(() => {
    return getTodosForDate(currentDate)
  }, [todos, currentDate, getTodosForDate])

  // 우선순위별 아이콘 가져오기
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '🟡'
    }
  }

  // 시간별 할일과 일반 할일 분리
  const timedTodos = useMemo(() => dayTodos.filter(todo => todo.hasTime && todo.startTime), [dayTodos])
  const generalTodos = useMemo(() => dayTodos.filter(todo => !todo.hasTime || !todo.startTime), [dayTodos])

  // 할일 통계
  const todoStats = useMemo(() => {
    const total = dayTodos.length
    const completed = dayTodos.filter(t => t.completed).length
    const byPriority = {
      high: dayTodos.filter(t => t.priority === 'high').length,
      highCompleted: dayTodos.filter(t => t.priority === 'high' && t.completed).length,
      medium: dayTodos.filter(t => t.priority === 'medium').length,
      mediumCompleted: dayTodos.filter(t => t.priority === 'medium' && t.completed).length,
      low: dayTodos.filter(t => t.priority === 'low').length,
      lowCompleted: dayTodos.filter(t => t.priority === 'low' && t.completed).length
    }
    return { total, completed, byPriority }
  }, [dayTodos])

  const dayEvents = useMemo(() => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time)
      return isSameDay(eventDate, currentDate)
    }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  }, [events, currentDate])

  const allDayEvents = dayEvents.filter(event => event.all_day)
  const timedEvents = dayEvents.filter(event => !event.all_day)

  const currentHour = new Date().getHours()
  const currentMinute = new Date().getMinutes()
  const isWithinRange = currentHour >= 9 && currentHour <= 18
  const currentTimePosition = isWithinRange ? ((currentHour - 9) * 60 + currentMinute) / (10 * 60) * 100 : -1

  const getEventPosition = (event: CalendarEvent) => {
    const start = new Date(event.start_time)
    const end = new Date(event.end_time)
    const startHour = getHours(start)
    const endHour = getHours(end)
    const startMinutes = Math.max((startHour - 9) * 60 + getMinutes(start), 0)
    const endMinutes = Math.min((endHour - 9) * 60 + getMinutes(end), 10 * 60)
    
    const top = (startMinutes / (10 * 60)) * 100
    const height = ((endMinutes - startMinutes) / (10 * 60)) * 100
    
    return { top: `${top}%`, height: `${Math.max(height, 2)}%` }
  }

  return (
    <div className="h-full flex flex-col lg:flex-row bg-background">
      {/* Left side - Today's Fortune (50% on desktop, full width on mobile) */}
      <div className="lg:w-1/2 w-full lg:border-r border-b lg:border-b-0 border-border p-6 overflow-auto bg-gradient-to-br from-background to-muted/20 h-1/2 lg:h-full">
        {/* 날짜 정보 */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-1">
            {format(currentDate, 'yyyy년 M월 d일', { locale: ko })}
          </h2>
          <p className="text-xl text-muted-foreground">
            {format(currentDate, 'EEEE', { locale: ko })}
          </p>
        </div>

        {/* 오늘의 운세 섹션 - 확장된 UI */}
        <div className="h-full flex flex-col">
          <TodayFortuneSection 
            currentDate={currentDate} 
            onDiaryClick={() => setIsDiaryOpen(true)}
            hasDiary={hasCurrentDateDiary}
          />
          
          {/* 오늘의 할일 요약 섹션 */}
          {dayTodos.length > 0 && (
            <div className="mt-6 p-4 rounded-lg bg-muted/10 border border-border/50">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                📝 오늘의 할일
                <span className="text-sm text-muted-foreground">
                  ({todoStats.completed}/{todoStats.total} 완료)
                </span>
              </h3>
              <div className="space-y-2">
                {/* 우선순위별 할일 요약 */}
                {['high', 'medium', 'low'].map(priority => {
                  const count = todoStats.byPriority[priority as keyof typeof todoStats.byPriority]
                  const completedCount = todoStats.byPriority[`${priority}Completed` as keyof typeof todoStats.byPriority]
                  
                  if (typeof count === 'number' && count > 0) {
                    return (
                      <div key={priority} className="flex items-center gap-2 text-sm">
                        <span>{getPriorityIcon(priority)}</span>
                        <span className="flex-1">
                          {priority === 'high' ? '높음' : priority === 'medium' ? '보통' : '낮음'}
                        </span>
                        <span className="text-muted-foreground">
                          {completedCount}/{count}개
                        </span>
                      </div>
                    )
                  }
                  return null
                })}
                
                {/* 빠른 할일 추가 버튼 */}
                <button
                  onClick={() => {
                    const eventDate = new Date(currentDate)
                    eventDate.setHours(new Date().getHours(), 0, 0, 0)
                    onCreateEvent(eventDate)
                  }}
                  className="w-full mt-3 px-3 py-2 text-sm bg-primary-500/10 hover:bg-primary-500/20 text-primary-600 rounded-md transition-colors"
                >
                  + 할일 추가
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Calendar Timeline (50% on desktop, full width on mobile) */}
      <div className="lg:w-1/2 w-full overflow-auto h-1/2 lg:h-full">
        {/* 종일 일정 상단 표시 */}
        {allDayEvents.length > 0 && (
          <div className="p-4 border-b border-border bg-muted/30">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">종일 일정</h3>
            <div className="flex flex-wrap gap-2">
              {allDayEvents.map(event => (
                <div
                  key={event.id}
                  className="px-3 py-1 rounded-full text-sm cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ 
                    backgroundColor: event.color || '#3b82f6',
                    color: 'white'
                  }}
                  onClick={() => onEditEvent(event)}
                  title={event.description || event.title}
                >
                  {event.title}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="relative min-h-full">
          {/* Current time indicator */}
          {isSameDay(currentDate, new Date()) && currentTimePosition >= 0 && (
            <div 
              className="absolute left-0 right-0 z-20 pointer-events-none"
              style={{ top: `${currentTimePosition}%` }}
            >
              <div className="flex items-center">
                <div className="w-20"></div>
                <div className="flex-1 h-0.5 bg-red-500"></div>
                <div className="w-3 h-3 bg-red-500 rounded-full -ml-1.5"></div>
              </div>
            </div>
          )}

          {/* Hours grid */}
          <div className="relative">
            {HOURS.map(hour => (
              <div key={hour} className="flex border-b border-border/30" style={{ height: '100px' }}>
                <div className="w-20 px-4 py-3 text-muted-foreground text-right">
                  <div className="text-xl font-semibold">
                    {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
                  </div>
                </div>
                <div 
                  className="flex-1 relative cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => {
                    const eventDate = new Date(currentDate)
                    eventDate.setHours(hour, 0, 0, 0)
                    onCreateEvent(eventDate)
                  }}
                >
                  {/* Half-hour line */}
                  <div className="absolute top-1/2 left-0 right-0 border-t border-border/15"></div>
                </div>
              </div>
            ))}

            {/* Timed events and todos overlay */}
            <div className="absolute top-0 left-20 right-0 bottom-0">
              {/* Events */}
              {timedEvents.map(event => {
                const position = getEventPosition(event)
                return (
                  <div
                    key={event.id}
                    className="absolute left-4 right-1/2 p-4 rounded-xl cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] mr-2"
                    style={{ 
                      ...position,
                      backgroundColor: `${event.color || '#3b82f6'}15`,
                      borderLeft: `4px solid ${event.color || '#3b82f6'}`,
                      border: `1px solid ${event.color || '#3b82f6'}30`
                    }}
                    onClick={() => onEditEvent(event)}
                  >
                    <div className="text-sm font-semibold mb-1" style={{ color: event.color || '#3b82f6' }}>
                      {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
                    </div>
                    <div className="font-semibold text-foreground text-lg mb-1">{event.title}</div>
                    {event.description && (
                      <div className="text-sm text-muted-foreground">{event.description}</div>
                    )}
                    {event.location && (
                      <div className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                        <span>📍</span> {event.location}
                      </div>
                    )}
                  </div>
                )
              })}
              
              {/* Timed Todos */}
              {timedTodos.map(todo => {
                const [hours, minutes] = (todo.startTime || '09:00').split(':').map(Number)
                const todoDate = new Date(currentDate)
                todoDate.setHours(hours, minutes, 0, 0)
                
                const topPosition = Math.max(((hours - 9) * 60 + minutes) / (10 * 60) * 100, 0)
                
                return (
                  <div
                    key={todo.id}
                    className="absolute left-1/2 right-4 p-3 rounded-lg cursor-pointer hover:shadow-md transition-all ml-2"
                    style={{ 
                      top: `${topPosition}%`,
                      height: '40px',
                      backgroundColor: todo.completed ? '#10b98115' : '#fbbf2415',
                      borderLeft: `3px solid ${todo.completed ? '#10b981' : '#fbbf24'}`,
                      opacity: todo.completed ? 0.7 : 1
                    }}
                    onClick={() => toggleTodo(todo.id)}
                  >
                    <div className="flex items-center justify-between h-full">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => toggleTodo(todo.id)}
                          className="w-4 h-4"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-sm font-medium">{getPriorityIcon(todo.priority)}</span>
                        <span className={`text-sm ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {todo.text}
                        </span>
                        <span className="text-xs text-muted-foreground">({todo.startTime})</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteTodo(todo.id)
                        }}
                        className="text-red-500 hover:text-red-700 text-sm px-2"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        
        {/* General Todos Section (at bottom) */}
        {generalTodos.length > 0 && (
          <div className="p-4 border-t border-border bg-muted/10">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">시간 미지정 할일</h3>
            <div className="space-y-2">
              {generalTodos.map(todo => (
                <div
                  key={todo.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background border border-border hover:shadow-sm transition-all"
                  style={{
                    opacity: todo.completed ? 0.6 : 1
                  }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">{getPriorityIcon(todo.priority)}</span>
                    <span className={`text-sm flex-1 ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {todo.text}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-red-500 hover:text-red-700 text-sm px-2 py-1"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Diary Book Modal */}
      <DiaryBookModal 
        isOpen={isDiaryOpen}
        onClose={() => setIsDiaryOpen(false)}
        date={currentDate}
        onSave={() => {
          setIsDiaryOpen(false)
        }}
      />
    </div>
  )
}