import { useState, useEffect } from 'react'
import { useCalendar } from '@/contexts/CalendarContext'
import MonthView from '@/components/Calendar/MonthView'
import WeekView from '@/components/Calendar/WeekView'
import DayView from '@/components/Calendar/DayView'
import DayViewEnhanced from '@/components/Calendar/DayViewEnhanced'
import YearView from '@/components/Calendar/YearView'
import YearViewEnhanced from '@/components/Calendar/YearViewEnhanced'
import EventModal from '@/components/EventModal'
import DiaryBookModal from '@/components/DiaryBookModal'
import ActionMenu, { ActionType } from '@/components/ActionMenu'
import { CalendarEvent, eventService } from '@/services/api'

// 임시 아이콘 컴포넌트들
const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function CalendarPage() {
  const { 
    currentDate,
    setCurrentDate, 
    viewMode, 
    setViewMode, 
    navigatePrevious, 
    navigateNext, 
    navigateToday 
  } = useCalendar()
  
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([])
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null)
  
  // ActionMenu 관련 상태
  const [showActionMenu, setShowActionMenu] = useState(false)
  const [actionMenuPosition, setActionMenuPosition] = useState({ x: 0, y: 0 })
  const [actionMenuDate, setActionMenuDate] = useState<Date | null>(null)
  
  // DiaryModal 관련 상태
  const [isDiaryModalOpen, setIsDiaryModalOpen] = useState(false)
  const [diaryModalDate, setDiaryModalDate] = useState<Date | null>(null)
  
  // 일기 클릭 핸들러 (모든 뷰에서 사용)
  const handleDiaryClick = (date: Date) => {
    setDiaryModalDate(date)
    setIsDiaryModalOpen(true)
  }

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    // 검색어에 따라 이벤트 필터링
    if (searchQuery) {
      const filtered = events.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredEvents(filtered)
    } else {
      setFilteredEvents(events)
    }
  }, [searchQuery, events])

  const loadEvents = async () => {
    try {
      const data = await eventService.getEvents()
      setEvents(data)
    } catch (error) {
      console.error('Failed to load events:', error)
    }
  }

  // 기존 이벤트 핸들러들 (날짜 우클릭이나 기존 이벤트 편집용)
  const handleCreateEvent = (date?: Date) => {
    setSelectedDate(date || null)
    setSelectedEvent(null)
    setIsModalOpen(true)
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  const handleSaveEvent = (event: CalendarEvent) => {
    loadEvents()
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await eventService.deleteEvent(eventId)
      loadEvents()
    } catch (error) {
      console.error('Failed to delete event:', error)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedEvent(null)
    setSelectedDate(null)
  }

  // 새로운 통합 날짜 클릭 핸들러 (ActionMenu 사용)
  const handleDateClick = (date: Date, event: React.MouseEvent) => {
    setActionMenuDate(date)
    setActionMenuPosition({ x: event.clientX, y: event.clientY })
    setShowActionMenu(true)
  }

  // ActionMenu 선택 핸들러
  const handleActionSelect = (action: ActionType) => {
    if (!actionMenuDate) return

    switch (action) {
      case 'event':
        setSelectedDate(actionMenuDate)
        setSelectedEvent(null)
        setIsModalOpen(true)
        break
      case 'diary':
        setDiaryModalDate(actionMenuDate)
        setIsDiaryModalOpen(true)
        break
    }
    setShowActionMenu(false)
  }

  // ActionMenu 닫기
  const handleCloseActionMenu = () => {
    setShowActionMenu(false)
    setActionMenuDate(null)
  }

  // Diary Modal 핸들러들
  const handleCloseDiaryModal = () => {
    setIsDiaryModalOpen(false)
    setDiaryModalDate(null)
  }

  // 검색 결과의 첫 번째 이벤트로 이동
  const navigateToFirstResult = () => {
    if (filteredEvents.length === 0 || !searchQuery) return
    
    const firstEvent = filteredEvents[0]
    const eventDate = new Date(firstEvent.start_time)
    
    // 1. 해당 날짜로 캘린더 이동
    setCurrentDate(eventDate)
    
    // 2. 적절한 뷰 모드로 전환 (연도 뷰인 경우 월 뷰로)
    if (viewMode === 'year') {
      setViewMode('month')
    }
    
    // 3. 이벤트 하이라이트
    setHighlightedEventId(firstEvent.id)
    
    // 4. 3초 후 하이라이트 제거
    setTimeout(() => {
      setHighlightedEventId(null)
    }, 3000)
    
    // 5. 선택적: 이벤트 상세 모달 열기
    // handleEditEvent(firstEvent)
  }

  // 검색창 키보드 이벤트 처리
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigateToFirstResult()
    } else if (e.key === 'Escape') {
      setSearchQuery('')
      setHighlightedEventId(null)
    }
  }

  const renderView = () => {
    const viewProps = {
      events: searchQuery ? filteredEvents : events,
      onCreateEvent: handleCreateEvent, // 기존 호환성 유지 (우클릭 등)
      onDateClick: handleDateClick, // 새로운 통합 날짜 클릭 핸들러
      onEditEvent: handleEditEvent,
      onDeleteEvent: handleDeleteEvent, // 일정 삭제 핸들러 추가
      highlightedEventId,
      onDiaryClick: handleDiaryClick, // 일기 클릭 핸들러 추가
    }

    switch (viewMode) {
      case 'year':
        return <YearViewEnhanced {...viewProps} />
      case 'month':
        return <MonthView {...viewProps} />
      case 'week':
        return <WeekView {...viewProps} />
      case 'day':
        return <DayView {...viewProps} />
      default:
        return <MonthView {...viewProps} />
    }
  }

  const viewModeLabels = {
    year: '년',
    month: '월',
    week: '주',
    day: '일'
  }

  const getDateDisplay = () => {
    switch (viewMode) {
      case 'year':
        return format(currentDate, 'yyyy년', { locale: ko })
      case 'month':
        return format(currentDate, 'yyyy년 M월', { locale: ko })
      case 'week':
        return format(currentDate, 'yyyy년 M월 w주차', { locale: ko })
      case 'day':
        return format(currentDate, 'yyyy년 M월 d일 EEEE', { locale: ko })
      default:
        return ''
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* 캘린더 전용 헤더 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex flex-col space-y-4">
          {/* 상단 행: 날짜와 컨트롤 */}
          <div className="flex justify-between items-center">
            {/* 날짜 표시 */}
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {getDateDisplay()}
            </h1>
            
            {/* 컨트롤 */}
            <div className="flex items-center space-x-4">
            {/* 뷰 모드 선택 */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {(['year', 'month', 'week', 'day'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`
                    px-3 py-1 rounded-md text-sm font-medium transition-colors
                    ${viewMode === mode
                      ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                    }
                  `}
                >
                  {viewModeLabels[mode]}
                </button>
              ))}
            </div>

            {/* 네비게이션 */}
            <div className="flex items-center space-x-2">
              <button
                onClick={navigatePrevious}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>

              <button
                onClick={navigateToday}
                className="px-3 py-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                오늘
              </button>

              <button
                onClick={navigateNext}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* 하단 행: 검색창 */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="일정, 할일, 일기 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            />
            <svg 
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredEvents.length}개의 결과
            </div>
          )}
        </div>
      </div>
    </div>

      {/* 캘린더 뷰 */}
      <div className="flex-1 overflow-hidden">
        {renderView()}
      </div>

      {/* 기존 EventModal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEvent}
        event={selectedEvent}
        initialDate={selectedDate || undefined}
      />

      {/* 새로운 ActionMenu */}
      <ActionMenu
        isOpen={showActionMenu}
        onClose={handleCloseActionMenu}
        date={actionMenuDate || new Date()}
        position={actionMenuPosition}
        onSelectAction={handleActionSelect}
      />

      {/* DiaryBookModal */}
      <DiaryBookModal
        isOpen={isDiaryModalOpen}
        onClose={handleCloseDiaryModal}
        date={diaryModalDate || new Date()}
      />
    </div>
  )
}