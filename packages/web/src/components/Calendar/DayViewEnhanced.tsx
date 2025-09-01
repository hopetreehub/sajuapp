import { useMemo, useState, useEffect } from 'react'
import { useCalendar } from '@/contexts/CalendarContext'
import { format, isSameDay } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CalendarEvent } from '@/services/api'
import TodayFortuneWidget from '@/components/Fortune/TodayFortuneWidget'
import DiaryModal from '@/components/DiaryModal'
import { getCustomerById, Customer } from '@/services/customerApi'
import { SajuData } from '@/utils/sajuScoreCalculator'

interface DayViewEnhancedProps {
  events: CalendarEvent[]
  onCreateEvent: (date: Date) => void
  onEditEvent: (event: CalendarEvent) => void
}

export default function DayViewEnhanced({ events, onCreateEvent, onEditEvent }: DayViewEnhancedProps) {
  const { currentDate, getTodosForDate, addTodo, updateTodo, deleteTodo, toggleTodo } = useCalendar()
  const [newTodo, setNewTodo] = useState('')
  const [isDiaryModalOpen, setIsDiaryModalOpen] = useState(false)
  const [diaryEntry, setDiaryEntry] = useState<any>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerSajuData, setCustomerSajuData] = useState<SajuData | null>(null)
  
  // LocalStorage에서 마지막 선택 고객 복원
  useEffect(() => {
    const lastCustomerId = localStorage.getItem('lastSelectedCustomerId')
    if (lastCustomerId) {
      loadCustomerData(parseInt(lastCustomerId))
    }
  }, [])
  
  const loadCustomerData = async (customerId: number) => {
    try {
      const response = await getCustomerById(customerId)
      setSelectedCustomer(response.data)
      setCustomerSajuData(response.data.saju_data)
      localStorage.setItem('lastSelectedCustomerId', customerId.toString())
    } catch (error) {
      console.error('Error loading customer data:', error)
    }
  }

  const dayEvents = useMemo(() => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time)
      return isSameDay(eventDate, currentDate)
    }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  }, [events, currentDate])

  const todos = getTodosForDate(currentDate)
  const todayTags = ['#중요', '#긴급', '#업무', '#개인']
  const completedTodos = todos.filter(todo => todo.completed).length
  const totalTodos = todos.length
  const progressPercentage = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      addTodo({
        text: newTodo.trim(),
        completed: false,
        priority: 'medium',
        date: format(currentDate, 'yyyy-MM-dd')
      })
      setNewTodo('')
    }
  }

  const handleDiarySave = (entry: any) => {
    setDiaryEntry(entry)
    // 실제로는 여기서 API 호출하여 저장
    console.log('Saving diary entry:', entry)
  }

  const hasDiaryEntry = !!diaryEntry

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return ''
    }
  }

  const formatEventTime = (event: CalendarEvent) => {
    if (event.all_day) return '종일'
    const start = new Date(event.start_time)
    const end = new Date(event.end_time)
    return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`
  }

  return (
    <div className="h-full p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto h-full">
        {/* 메인 콘텐츠 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
          {/* 왼쪽 영역 (3/5) - 일정과 할일 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 오늘의 일정 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <span className="mr-2">📅</span>
                오늘의 일정
                <span className="ml-2 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full">
                  {dayEvents.length}개
                </span>
              </h2>

              {/* 시간 그리드 스타일 일정 표시 */}
              <div className="schedule-grid border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {Array.from({ length: 10 }, (_, i) => i + 9).map(hour => {
                  // 해당 시간의 이벤트 찾기
                  const hourEvents = dayEvents.filter(event => {
                    const eventStart = new Date(event.start_time);
                    const eventEnd = new Date(event.end_time);
                    const eventStartHour = eventStart.getHours();
                    const eventEndHour = eventEnd.getHours();
                    
                    // 이벤트가 이 시간대에 걸쳐있는지 확인
                    return hour >= eventStartHour && hour < eventEndHour;
                  });

                  // 이 시간에 시작하는 이벤트만 표시 (중복 방지)
                  const startingEvents = hourEvents.filter(event => {
                    return new Date(event.start_time).getHours() === hour;
                  });

                  const currentHour = new Date().getHours();
                  const isCurrentHour = hour === currentHour && isSameDay(currentDate, new Date());

                  return (
                    <div key={hour} className="grid grid-cols-[60px_1fr]">
                      {/* 시간 라벨 */}
                      <div className={`
                        flex items-center justify-center py-3 px-2 text-xs font-medium border-r border-gray-200 dark:border-gray-700
                        ${isCurrentHour 
                          ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' 
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }
                        ${hour !== 18 ? 'border-b border-gray-200 dark:border-gray-700' : ''}
                      `}>
                        {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
                      </div>
                      
                      {/* 이벤트 영역 */}
                      <div className={`
                        relative min-h-[48px] p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors
                        ${hour !== 18 ? 'border-b border-gray-200 dark:border-gray-700' : ''}
                        ${isCurrentHour ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''}
                      `}
                      onClick={() => {
                        const selectedDateTime = new Date(currentDate);
                        selectedDateTime.setHours(hour, 0, 0, 0);
                        onCreateEvent(selectedDateTime);
                      }}
                      >
                        {startingEvents.length > 0 ? (
                          startingEvents.map(event => {
                            const eventStart = new Date(event.start_time);
                            const eventEnd = new Date(event.end_time);
                            const duration = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60); // hours
                            
                            return (
                              <div
                                key={event.id}
                                className="absolute inset-x-2 top-2 bottom-2 rounded-md p-2 cursor-pointer hover:shadow-md transition-all"
                                style={{ 
                                  backgroundColor: event.color || '#3b82f6',
                                  minHeight: `${Math.max(duration * 44, 40)}px`
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditEvent(event);
                                }}
                              >
                                <div className="text-white">
                                  <div className="font-medium text-sm leading-tight">
                                    {event.title}
                                  </div>
                                  <div className="text-xs opacity-90 mt-1">
                                    {formatEventTime(event)}
                                  </div>
                                  {event.location && (
                                    <div className="text-xs opacity-80 mt-1">
                                      📍 {event.location}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="flex items-center h-full text-xs text-gray-400 dark:text-gray-600">
                            <span className="opacity-0 hover:opacity-100 transition-opacity">
                              + 일정 추가
                            </span>
                          </div>
                        )}
                        
                        {/* 현재 시간 인디케이터 */}
                        {isCurrentHour && (
                          <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <div className="flex-1 h-0.5 bg-red-500"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 일정이 없을 때 안내 메시지 */}
              {dayEvents.length === 0 && (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <span className="text-3xl mb-2 block">📭</span>
                  <p className="text-sm">오늘 예정된 일정이 없습니다</p>
                  <p className="text-xs mt-1 opacity-75">시간을 클릭하여 새 일정을 추가하세요</p>
                </div>
              )}

              {/* 할일 목록을 일정 하단으로 이동 */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                    <span className="mr-2">✅</span>
                    오늘의 할일
                  </h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {completedTodos}/{totalTodos} 완료
                  </div>
                </div>

                {/* 할일 목록 */}
                <div className="space-y-2 mb-4">
                  {todos.map(todo => (
                    <div key={todo.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg group">
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          todo.completed 
                            ? 'bg-purple-600 border-purple-600 text-white' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {todo.completed && <span className="text-xs">✓</span>}
                      </button>
                      <span className="text-sm">{getPriorityIcon(todo.priority)}</span>
                      <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                        {todo.text}
                      </span>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-sm transition-opacity"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>

                {/* 새 할일 추가 */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                    placeholder="새 할일 추가..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  />
                  <button
                    onClick={handleAddTodo}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    추가
                  </button>
                </div>

                {/* 일기 버튼 - 할일 바로 아래 */}
                <button 
                  onClick={() => setIsDiaryModalOpen(true)}
                  className={`
                    w-full mt-2 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-all text-sm
                    ${hasDiaryEntry 
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    }
                  `}
                >
                  <span className="text-lg">📝</span>
                  <span>오늘의 일기</span>
                  {hasDiaryEntry && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                </button>
              </div>
            </div>

            {/* 태그 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <span className="mr-2">🏷️</span>
                오늘의 태그
              </h2>
              <div className="flex flex-wrap gap-2">
                {todayTags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽 영역 (2/5) - 오늘의 운세 */}
          <div className="lg:col-span-2">
            <TodayFortuneWidget 
              sajuData={customerSajuData}
              customerName={selectedCustomer?.name}
            />
          </div>
        </div>


        {/* 일기 작성 모달 */}
        <DiaryModal 
          isOpen={isDiaryModalOpen}
          onClose={() => setIsDiaryModalOpen(false)}
          date={currentDate}
          onSave={handleDiarySave}
        />
      </div>
    </div>
  )
}