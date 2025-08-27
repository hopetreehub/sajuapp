import { useMemo } from 'react'
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

const HOURS = Array.from({ length: 24 }, (_, i) => i)

interface WeekViewProps {
  events: CalendarEvent[]
  onCreateEvent: (date: Date) => void
  onEditEvent: (event: CalendarEvent) => void
}

export default function WeekView({ events, onCreateEvent, onEditEvent }: WeekViewProps) {
  const { currentDate, setSelectedDate } = useCalendar()

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 })
    const end = endOfWeek(currentDate, { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const getEventsForDayAndHour = (date: Date, hour: number) => {
    return events.filter(event => {
      const eventStart = new Date(event.start_time)
      const eventHour = getHours(eventStart)
      return isSameDay(eventStart, date) && eventHour === hour
    })
  }

  const currentHour = new Date().getHours()
  const currentMinute = new Date().getMinutes()
  const currentTimePosition = (currentHour * 60 + currentMinute) / (24 * 60) * 100

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header with weekdays */}
      <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
        <div className="p-3 text-center text-sm font-semibold text-gray-700">
          시간
        </div>
        {weekDays.map((day) => {
          const dayOfWeek = day.getDay()
          const isCurrentDay = isToday(day)
          
          return (
            <div 
              key={day.toISOString()} 
              className={`
                p-3 text-center border-l border-gray-200
                ${isCurrentDay ? 'bg-primary-50' : ''}
              `}
            >
              <div className={`text-xs font-medium ${dayOfWeek === 0 ? 'text-red-600' : dayOfWeek === 6 ? 'text-blue-600' : 'text-gray-500'}`}>
                {format(day, 'EEE', { locale: ko })}
              </div>
              <div className={`text-lg font-semibold ${isCurrentDay ? 'text-primary-600' : 'text-gray-900'}`}>
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
            <div className="border-r border-gray-200">
              {HOURS.map(hour => (
                <div key={hour} className="h-16 px-2 py-1 text-xs text-gray-500 text-right">
                  {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map(day => {
              const isCurrentDay = isToday(day)
              
              return (
                <div key={day.toISOString()} className="border-r border-gray-200">
                  {HOURS.map(hour => {
                    const dayEvents = getEventsForDayAndHour(day, hour)
                    
                    return (
                      <div 
                        key={`${day.toISOString()}-${hour}`} 
                        className={`
                          h-16 border-b border-gray-100 p-1 cursor-pointer
                          hover:bg-gray-50 transition-colors
                          ${isCurrentDay && currentHour === hour ? 'bg-primary-50' : ''}
                        `}
                        onClick={() => {
                          const selectedDateTime = new Date(day)
                          selectedDateTime.setHours(hour, 0, 0, 0)
                          onCreateEvent(selectedDateTime)
                        }}
                      >
                        {dayEvents.map(event => (
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
                            {format(new Date(event.start_time), 'HH:mm')} {event.title}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}