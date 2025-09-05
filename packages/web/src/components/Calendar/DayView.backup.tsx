import { useMemo, useState } from 'react'
import { useCalendar } from '@/contexts/CalendarContext'
import { format, isSameDay, getHours, getMinutes } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CalendarEvent } from '@/services/api'
import DiaryBookModal from '@/components/DiaryBookModal'
import TaskSelectionModal from '@/components/TaskSelectionModal'
import { useDiaryData } from '@/hooks/useDiaryData'

const HOURS = Array.from({ length: 10 }, (_, i) => i + 9) // 9시-18시

interface DayViewProps {
  events: CalendarEvent[]
  onCreateEvent: (date: Date) => void
  onEditEvent: (event: CalendarEvent) => void
}

export default function DayView({ events, onCreateEvent, onEditEvent }: DayViewProps) {
  const { currentDate } = useCalendar()
  const [isDiaryOpen, setIsDiaryOpen] = useState(false)
  const [showTaskSelection, setShowTaskSelection] = useState(false)
  const [taskSelectionPosition, setTaskSelectionPosition] = useState({ x: 0, y: 0 })
  const [selectedDateTime, setSelectedDateTime] = useState<Date>(new Date())
  const { diaryDates, loading, error } = useDiaryData({ viewMode: 'day', currentDate })
  
  // 디버깅: useDiaryData 상태 로그
  console.log('📊 DayView useDiaryData 상태:', {
    diaryDatesSize: diaryDates.size,
    diaryDatesArray: Array.from(diaryDates),
    loading,
    error,
    currentDateStr: format(currentDate, 'yyyy-MM-dd'),
    hasTodayDiary: diaryDates.has(format(currentDate, 'yyyy-MM-dd')),
    viewMode: 'day'
  })
  
  // 일기 아이콘 조건부 렌더링 디버깅
  const hasCurrentDateDiary = diaryDates.has(format(currentDate, 'yyyy-MM-dd'))
  console.log('🖼️ DayView 일기 아이콘 상태:', {
    currentDateStr: format(currentDate, 'yyyy-MM-dd'),
    hasCurrentDateDiary,
    shouldShowIcon: hasCurrentDateDiary
  })

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
  // 9시-18시 범위 내에서만 현재 시간 표시
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
      {/* Left sidebar - Day info & All-day events */}
      <div className="w-80 border-r border-border p-4 overflow-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {format(currentDate, 'yyyy년 M월 d일', { locale: ko })}
              </h2>
              <p className="text-lg text-muted-foreground">
                {format(currentDate, 'EEEE', { locale: ko })}
              </p>
            </div>
            {/* 일기 아이콘 - 항상 표시 */}
            <button
              onClick={() => {
                setSelectedDateTime(currentDate)
                setIsDiaryOpen(true)
              }}
              className={`p-1 rounded-full text-xs transition-all hover:scale-110 ${
                hasCurrentDateDiary
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400 opacity-50 hover:opacity-100'
              }`}
              title={hasCurrentDateDiary ? '일기 보기/수정' : '일기 쓰기'}
            >
              📖
            </button>
          </div>
        </div>

        {/* All-day events */}
        {allDayEvents.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">종일 일정</h3>
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
                    <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                  )}
                  {event.location && (
                    <p className="text-sm text-muted-foreground mt-1">📍 {event.location}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick stats */}
        <div className="bg-muted rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">오늘의 요약</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">총 일정</span>
              <span className="font-medium">{dayEvents.length}개</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">종일 일정</span>
              <span className="font-medium">{allDayEvents.length}개</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">시간별 일정</span>
              <span className="font-medium">{timedEvents.length}개</span>
            </div>
          </div>
        </div>


        {/* Add task button */}
        <div className="mt-6">
          <button 
            onClick={(e) => {
              setSelectedDateTime(currentDate)
              const rect = e.currentTarget.getBoundingClientRect()
              setTaskSelectionPosition({
                x: rect.left + rect.width / 2,
                y: rect.top
              })
              setShowTaskSelection(true)
            }}
            className="w-full py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
            새 작업 추가
          </button>
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
                <div className="w-2 h-2 bg-red-500 rounded-full -ml-1"></div>
              </div>
            </div>
          )}

          {/* Hours grid */}
          <div className="relative">
            {HOURS.map(hour => (
              <div key={hour} className="flex border-b border-border/30" style={{ height: '80px' }}>
                <div className="w-20 px-3 py-2 text-xs text-muted-foreground text-right">
                  {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
                </div>
                <div 
                  className="flex-1 relative cursor-pointer hover:bg-muted/30"
                  onClick={(e) => {
                    const selectedDateTime = new Date(currentDate)
                    selectedDateTime.setHours(hour, 0, 0, 0)
                    setSelectedDateTime(selectedDateTime)
                    
                    // 클릭 위치 계산
                    const rect = e.currentTarget.getBoundingClientRect()
                    setTaskSelectionPosition({
                      x: rect.left + rect.width / 2,
                      y: rect.top + rect.height / 2
                    })
                    setShowTaskSelection(true)
                  }}
                >
                  {/* Half-hour line */}
                  <div className="absolute top-1/2 left-0 right-0 border-t border-border/20"></div>
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
                    <div className="font-medium text-foreground">{event.title}</div>
                    {event.location && (
                      <div className="text-sm text-muted-foreground mt-1">📍 {event.location}</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Task Selection Modal */}
      <TaskSelectionModal
        isOpen={showTaskSelection}
        onClose={() => setShowTaskSelection(false)}
        date={selectedDateTime}
        position={taskSelectionPosition}
        onSelectEvent={() => onCreateEvent(selectedDateTime)}
        onSelectTodo={() => {
          // TODO: 할일 추가 기능 구현
          console.log('할일 추가:', selectedDateTime)
        }}
        onSelectDiary={() => {
          setSelectedDateTime(selectedDateTime)
          setShowTaskSelection(false)
          setIsDiaryOpen(true)
        }}
      />

      {/* Diary Book Modal */}
      <DiaryBookModal 
        isOpen={isDiaryOpen}
        onClose={() => setIsDiaryOpen(false)}
        date={selectedDateTime}
        onSave={() => {
          setIsDiaryOpen(false)
          // 일기 저장 후 일기 데이터 새로고침
          // useDiaryData hook이 자동으로 다시 로드됩니다
        }}
      />
    </div>
  )
}