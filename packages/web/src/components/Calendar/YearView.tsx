import { useMemo } from 'react'
import { useCalendar } from '@/contexts/CalendarContext'
import { 
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  getDay
} from 'date-fns'
import { ko } from 'date-fns/locale'
import { CalendarEvent } from '@/services/api'

const WEEKDAYS_SHORT = ['일', '월', '화', '수', '목', '금', '토']

interface YearViewProps {
  events: CalendarEvent[]
  onCreateEvent: (date: Date) => void
  onEditEvent: (event: CalendarEvent) => void
}

export default function YearView({ events, onCreateEvent, onEditEvent }: YearViewProps) {
  const { currentDate, setCurrentDate, setViewMode } = useCalendar()

  const yearMonths = useMemo(() => {
    const start = startOfYear(currentDate)
    const end = endOfYear(currentDate)
    return eachMonthOfInterval({ start, end })
  }, [currentDate])

  const getMonthDays = (monthDate: Date) => {
    const start = startOfMonth(monthDate)
    const end = endOfMonth(monthDate)
    const startWeek = startOfWeek(start, { weekStartsOn: 0 })
    const endWeek = endOfWeek(end, { weekStartsOn: 0 })
    
    return eachDayOfInterval({ start: startWeek, end: endWeek })
  }

  const getEventCountForDay = (date: Date): number => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time)
      return isSameDay(eventDate, date)
    }).length
  }

  const handleMonthClick = (monthDate: Date) => {
    setCurrentDate(monthDate)
    setViewMode('month')
  }

  return (
    <div className="h-full overflow-auto bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Year Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            {format(currentDate, 'yyyy년', { locale: ko })}
          </h1>
        </div>

        {/* Months Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {yearMonths.map((monthDate) => {
            const monthDays = getMonthDays(monthDate)
            const monthEventCount = monthDays.reduce((acc, day) => {
              if (isSameMonth(day, monthDate)) {
                return acc + getEventCountForDay(day)
              }
              return acc
            }, 0)

            return (
              <div
                key={monthDate.toISOString()}
                className="bg-background rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleMonthClick(monthDate)}
              >
                {/* Month Header */}
                <div className="px-4 py-3 border-b border-border bg-muted rounded-t-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-foreground">
                      {format(monthDate, 'M월', { locale: ko })}
                    </h3>
                    {monthEventCount > 0 && (
                      <span className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded-full">
                        {monthEventCount}개 일정
                      </span>
                    )}
                  </div>
                </div>

                {/* Mini Calendar */}
                <div className="p-2">
                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 mb-1">
                    {WEEKDAYS_SHORT.map((day, index) => (
                      <div
                        key={day}
                        className={`text-xs text-center py-1 font-medium
                          ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-muted-foreground'}
                        `}
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Days grid */}
                  <div className="grid grid-cols-7 gap-px">
                    {monthDays.map((day) => {
                      const dayOfWeek = getDay(day)
                      const isCurrentMonth = isSameMonth(day, monthDate)
                      const isCurrentDay = isToday(day)
                      const eventCount = getEventCountForDay(day)

                      return (
                        <div
                          key={day.toISOString()}
                          className={`
                            aspect-square flex items-center justify-center text-xs relative
                            ${!isCurrentMonth ? 'text-muted-foreground/50' : ''}
                            ${isCurrentDay ? 'bg-primary-500 text-white rounded-full' : ''}
                            ${dayOfWeek === 0 && isCurrentMonth && !isCurrentDay ? 'text-red-500' : ''}
                            ${dayOfWeek === 6 && isCurrentMonth && !isCurrentDay ? 'text-blue-500' : ''}
                          `}
                        >
                          <span>{format(day, 'd')}</span>
                          
                          {/* Event indicator */}
                          {eventCount > 0 && isCurrentMonth && !isCurrentDay && (
                            <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2">
                              <div className={`
                                w-1 h-1 rounded-full
                                ${eventCount === 1 ? 'bg-gray-400' : ''}
                                ${eventCount === 2 ? 'bg-primary-400' : ''}
                                ${eventCount >= 3 ? 'bg-primary-600' : ''}
                              `}></div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Year Summary */}
        <div className="mt-8 bg-background rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">연간 요약</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {events.length}
              </div>
              <div className="text-sm text-muted-foreground">총 일정</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {events.filter(e => e.category === 'personal').length}
              </div>
              <div className="text-sm text-muted-foreground">개인 일정</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {events.filter(e => e.category === 'work').length}
              </div>
              <div className="text-sm text-muted-foreground">업무 일정</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {events.filter(e => e.isAllDay).length}
              </div>
              <div className="text-sm text-muted-foreground">종일 일정</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}