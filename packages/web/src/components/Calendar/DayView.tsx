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

export default function DayView({ events, onCreateEvent, onEditEvent }: DayViewProps) {
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
    <div className="h-full flex bg-background">
      {/* Left sidebar - Day info & Daily summary */}
      <div className="w-80 border-r border-border p-6 overflow-auto">
        {/* 날짜 정보 */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-1">
            {format(currentDate, 'yyyy년 M월 d일', { locale: ko })}
          </h2>
          <p className="text-xl text-muted-foreground">
            {format(currentDate, 'EEEE', { locale: ko })}
          </p>
        </div>

        {/* 일기 아이콘 - 태그 자리에 배치 */}
        <div className="mb-6">
          <button
            onClick={() => {
              setIsDiaryOpen(true)
            }}
            className={`flex items-center gap-3 p-4 rounded-xl transition-all hover:scale-105 w-full text-left ${
              hasCurrentDateDiary
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 shadow-sm'
                : 'hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400 opacity-70 hover:opacity-100 border-2 border-dashed border-amber-300 dark:border-amber-600'
            }`}
            title={hasCurrentDateDiary ? '일기 보기/수정' : '일기 쓰기'}
          >
            <span className="text-2xl">📖</span>
            <div>
              <div className="font-semibold">
                {hasCurrentDateDiary ? '일기 보기' : '일기 쓰기'}
              </div>
              <div className="text-sm opacity-75">
                {hasCurrentDateDiary ? '작성된 일기가 있습니다' : '오늘의 이야기를 남겨보세요'}
              </div>
            </div>
          </button>
        </div>

        {/* 오늘의 운세 섹션 */}
        <TodayFortuneSection currentDate={currentDate} />

        {/* 종일 일정 */}
        {allDayEvents.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">종일 일정</h3>
            <div className="space-y-3">
              {allDayEvents.map(event => (
                <div
                  key={event.id}
                  className="p-4 rounded-xl border cursor-pointer hover:shadow-md transition-all"
                  style={{ 
                    backgroundColor: `${event.color || '#3b82f6'}10`,
                    borderColor: event.color || '#3b82f6'
                  }}
                  onClick={() => onEditEvent(event)}
                >
                  <h4 className="font-semibold" style={{ color: event.color || '#3b82f6' }}>
                    {event.title}
                  </h4>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                  )}
                  {event.location && (
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <span>📍</span> {event.location}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 오늘의 요약 */}
        <div className="bg-muted/50 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">오늘의 요약</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2">
                <span>📅</span> 총 일정
              </span>
              <span className="font-semibold text-lg">{dayEvents.length}개</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2">
                <span>⏰</span> 종일 일정
              </span>
              <span className="font-semibold text-lg">{allDayEvents.length}개</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2">
                <span>🕐</span> 시간별 일정
              </span>
              <span className="font-semibold text-lg">{timedEvents.length}개</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Timeline */}
      <div className="flex-1 overflow-auto">
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