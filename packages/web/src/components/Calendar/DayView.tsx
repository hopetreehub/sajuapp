import { useMemo } from 'react'
import { useCalendar } from '@/contexts/CalendarContext'
import { format, isSameDay, getHours, getMinutes } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CalendarEvent } from '@/services/api'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

interface DayViewProps {
  events: CalendarEvent[]
  onCreateEvent: (date: Date) => void
  onEditEvent: (event: CalendarEvent) => void
}

export default function DayView({ events, onCreateEvent, onEditEvent }: DayViewProps) {
  const { currentDate } = useCalendar()

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
  const currentTimePosition = (currentHour * 60 + currentMinute) / (24 * 60) * 100

  const getEventPosition = (event: CalendarEvent) => {
    const start = new Date(event.start_time)
    const end = new Date(event.end_time)
    const startMinutes = getHours(start) * 60 + getMinutes(start)
    const endMinutes = getHours(end) * 60 + getMinutes(end)
    
    const top = (startMinutes / (24 * 60)) * 100
    const height = ((endMinutes - startMinutes) / (24 * 60)) * 100
    
    return { top: `${top}%`, height: `${height}%` }
  }

  return (
    <div className="h-full flex bg-white">
      {/* Left sidebar - Day info & All-day events */}
      <div className="w-80 border-r border-gray-200 p-4 overflow-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {format(currentDate, 'yyyy년 M월 d일', { locale: ko })}
          </h2>
          <p className="text-lg text-gray-600">
            {format(currentDate, 'EEEE', { locale: ko })}
          </p>
        </div>

        {/* All-day events */}
        {allDayEvents.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">종일 일정</h3>
            <div className="space-y-2">
              {allDayEvents.map(event => (
                <div
                  key={event.id}
                  className="p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow"
                  style={{ 
                    backgroundColor: `${event.color || '#3b82f6'}10`,
                    borderColor: event.color || '#3b82f6'
                  }}
                  onClick={() => onEditEvent(event)}
                >
                  <h4 className="font-medium" style={{ color: event.color || '#3b82f6' }}>
                    {event.title}
                  </h4>
                  {event.description && (
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  )}
                  {event.location && (
                    <p className="text-sm text-gray-500 mt-1">📍 {event.location}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick stats */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">오늘의 요약</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">총 일정</span>
              <span className="font-medium">{dayEvents.length}개</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">종일 일정</span>
              <span className="font-medium">{allDayEvents.length}개</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">시간별 일정</span>
              <span className="font-medium">{timedEvents.length}개</span>
            </div>
          </div>
        </div>

        {/* Add event button */}
        <div className="mt-6">
          <button 
            onClick={() => onCreateEvent(currentDate)}
            className="w-full py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
            새 일정 추가
          </button>
        </div>
      </div>

      {/* Right side - Timeline */}
      <div className="flex-1 overflow-auto">
        <div className="relative min-h-full">
          {/* Current time indicator */}
          {isSameDay(currentDate, new Date()) && (
            <div 
              className="absolute left-0 right-0 z-20 pointer-events-none"
              style={{ top: `${currentTimePosition}%` }}
            >
              <div className="flex items-center">
                <div className="w-20"></div>
                <div className="flex-1 h-0.5 bg-red-500"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full -ml-1"></div>
              </div>
            </div>
          )}

          {/* Hours grid */}
          <div className="relative">
            {HOURS.map(hour => (
              <div key={hour} className="flex border-b border-gray-100" style={{ height: '80px' }}>
                <div className="w-20 px-3 py-2 text-xs text-gray-500 text-right">
                  {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
                </div>
                <div 
                  className="flex-1 relative cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    const selectedDateTime = new Date(currentDate)
                    selectedDateTime.setHours(hour, 0, 0, 0)
                    onCreateEvent(selectedDateTime)
                  }}
                >
                  {/* Half-hour line */}
                  <div className="absolute top-1/2 left-0 right-0 border-t border-gray-50"></div>
                </div>
              </div>
            ))}

            {/* Timed events overlay */}
            <div className="absolute top-0 left-20 right-0 bottom-0">
              {timedEvents.map(event => {
                const position = getEventPosition(event)
                return (
                  <div
                    key={event.id}
                    className="absolute left-2 right-2 p-2 rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                    style={{ 
                      ...position,
                      backgroundColor: `${event.color || '#3b82f6'}20`,
                      borderLeft: `3px solid ${event.color || '#3b82f6'}`
                    }}
                    onClick={() => onEditEvent(event)}
                  >
                    <div className="text-sm font-medium" style={{ color: event.color || '#3b82f6' }}>
                      {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
                    </div>
                    <div className="font-medium text-gray-900">{event.title}</div>
                    {event.location && (
                      <div className="text-sm text-gray-600 mt-1">📍 {event.location}</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}