import { useMemo, useState } from 'react'
import { useCalendar } from '@/contexts/CalendarContext'
import { 
  startOfWeek, 
  endOfWeek,
  eachDayOfInterval,
  eachHourOfInterval,
  format,
  isSameDay,
  isToday,
  getHours,
  getMinutes,
  startOfDay,
  endOfDay
} from 'date-fns'
import { ko } from 'date-fns/locale'
import { CalendarEvent } from '@/services/api'

const HOURS = Array.from({ length: 11 }, (_, i) => i + 9) // 9시-19시

interface WeekViewProps {
  events: CalendarEvent[]
  onCreateEvent: (date: Date) => void
  onEditEvent: (event: CalendarEvent) => void
}

export default function WeekView({ events, onCreateEvent, onEditEvent }: WeekViewProps) {
  const { currentDate, getTodosForDate, addTodo, updateTodo, deleteTodo, toggleTodo } = useCalendar()

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 })
    const end = endOfWeek(currentDate, { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const handleAddTodo = (date: Date, text: string) => {
    if (text.trim()) {
      addTodo({
        text: text.trim(),
        completed: false,
        priority: 'medium',
        date: format(date, 'yyyy-MM-dd')
      })
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return ''
    }
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
              <div className={`text-lg font-semibold ${isCurrentDay ? 'text-primary' : 'text-foreground'}`}>
                {format(day, 'd')}
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
                    
                    return (
                      <div 
                        key={`${day.toISOString()}-${hour}`} 
                        className={`
                          h-16 border-b border-border/50 p-1 cursor-pointer
                          hover:bg-muted/50 transition-colors
                          ${isCurrentDay && currentHour === hour ? 'bg-primary/10' : ''}
                        `}
                        onClick={() => {
                          const selectedDateTime = new Date(day)
                          selectedDateTime.setHours(hour, 0, 0, 0)
                          onCreateEvent(selectedDateTime)
                        }}
                      >
                        {dayEvents.map(event => {
                          if (!event.id || !event.start_time || !event.title) return null
                          
                          try {
                            const startTime = new Date(event.start_time)
                            if (isNaN(startTime.getTime())) return null
                            
                            return (
                              <div
                                key={event.id}
                                className="text-xs p-1 mb-1 rounded truncate cursor-pointer hover:opacity-80"
                                style={{ 
                                  backgroundColor: `${event.color || '#3b82f6'}20`,
                                  color: event.color || '#3b82f6',
                                  borderLeft: `2px solid ${event.color || '#3b82f6'}`
                                }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onEditEvent(event)
                                }}
                              >
                                {format(startTime, 'HH:mm')} {event.title}
                              </div>
                            )
                          } catch (error) {
                            console.warn('Error rendering event:', event, error)
                            return null
                          }
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
            
            {/* 각 요일의 할일 */}
            {weekDays.map(day => {
              const dayTodos = getTodosForDate(day)
              const isCurrentDay = isToday(day)
              
              return (
                <div 
                  key={`todos-${day.toISOString()}`} 
                  className={`
                    bg-background p-3 min-h-[120px]
                    ${isCurrentDay ? 'bg-primary/5' : ''}
                  `}
                >
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
                            flex-1 text-xs truncate
                            ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800 dark:text-gray-200'}
                          `}
                        >
                          {todo.text}
                        </span>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* 할일 추가 */}
                  <button
                    onClick={() => {
                      const newTodoText = prompt('새 할일을 입력하세요:')
                      if (newTodoText) {
                        handleAddTodo(day, newTodoText)
                      }
                    }}
                    className="w-full text-xs text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 py-1 border border-dashed border-gray-300 rounded hover:border-purple-300 transition-colors"
                  >
                    + 할일 추가
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}