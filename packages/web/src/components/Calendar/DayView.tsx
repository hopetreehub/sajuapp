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
  onDateClick?: (date: Date, event: React.MouseEvent) => void
  onDeleteEvent?: (eventId: string) => void
  highlightedEventId?: string | null
  onDiaryClick?: (date: Date) => void
}

export default function DayView({ 
  events, 
  onCreateEvent, 
  onEditEvent,
  onDateClick,
  onDeleteEvent,
  highlightedEventId,
  onDiaryClick
}: DayViewProps) {
  const { currentDate } = useCalendar()
  const [isDiaryOpen, setIsDiaryOpen] = useState(false)
  const { diaryDates } = useDiaryData({ viewMode: 'day', currentDate })
  
  // 현재 날짜에 일기가 있는지 확인
  const hasCurrentDateDiary = diaryDates.has(format(currentDate, 'yyyy-MM-dd'))

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

            {/* Timed events overlay */}
            <div className="absolute top-0 left-20 right-0 bottom-0">
              {timedEvents.map(event => {
                const position = getEventPosition(event)
                return (
                  <div
                    key={event.id}
                    className="absolute left-4 right-4 p-4 rounded-xl cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
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
            </div>
          </div>
        </div>
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