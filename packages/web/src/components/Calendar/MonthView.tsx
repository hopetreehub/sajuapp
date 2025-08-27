import { useMemo } from 'react'
import { useCalendar } from '@/contexts/CalendarContext'
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

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

interface MonthViewProps {
  events: CalendarEvent[]
  onCreateEvent: (date: Date) => void
  onEditEvent: (event: CalendarEvent) => void
}

export default function MonthView({ events, onCreateEvent, onEditEvent }: MonthViewProps) {
  const { currentDate, setSelectedDate, setViewMode } = useCalendar()

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

  const handleDayClick = (date: Date) => {
    onCreateEvent(date)
  }

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    onEditEvent(event)
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {WEEKDAYS.map((day, index) => (
          <div 
            key={day} 
            className={`
              px-2 py-3 text-center text-sm font-semibold
              ${index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'}
            `}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-px bg-gray-200">
        {monthDays.map((day) => {
          const dayOfWeek = getDay(day)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isCurrentDay = isToday(day)
          const dayEvents = getEventsForDay(day)
          
          return (
            <div
              key={day.toISOString()}
              onClick={() => handleDayClick(day)}
              className={`
                bg-white p-2 cursor-pointer transition-colors
                hover:bg-gray-50
                ${!isCurrentMonth ? 'bg-gray-50' : ''}
                ${isCurrentDay ? 'bg-primary-50' : ''}
              `}
            >
              {/* Date Number */}
              <div className="flex items-start justify-between mb-1">
                <span 
                  className={`
                    text-sm font-medium
                    ${isCurrentDay 
                      ? 'bg-primary-500 text-white rounded-full w-7 h-7 flex items-center justify-center' 
                      : ''
                    }
                    ${!isCurrentMonth ? 'text-gray-400' : ''}
                    ${dayOfWeek === 0 ? 'text-red-600' : ''}
                    ${dayOfWeek === 6 ? 'text-blue-600' : ''}
                  `}
                >
                  {format(day, 'd')}
                </span>
                
                {/* Lunar Date (placeholder) */}
                {isCurrentMonth && (
                  <span className="text-xs text-gray-400">
                    {/* 음력 날짜는 나중에 구현 */}
                  </span>
                )}
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                    style={{ 
                      backgroundColor: `${event.color || '#3b82f6'}20`,
                      color: event.color || '#3b82f6',
                      borderLeft: `2px solid ${event.color || '#3b82f6'}`
                    }}
                    onClick={(e) => handleEventClick(event, e)}
                  >
                    {event.all_day && <span className="font-semibold">종일 </span>}
                    {!event.all_day && format(new Date(event.start_time), 'HH:mm')} {event.title}
                  </div>
                ))}
                
                {/* More Events Indicator */}
                {events.filter(e => isSameDay(new Date(e.start_time), day)).length > 3 && (
                  <div className="text-xs text-gray-500 font-medium">
                    +{events.filter(e => isSameDay(new Date(e.start_time), day)).length - 3}개 더보기
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}