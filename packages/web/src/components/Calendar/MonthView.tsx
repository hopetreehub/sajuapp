import { useMemo, useState } from 'react';
import { useCalendar } from '@/contexts/CalendarContext';
import { useDiaryData } from '@/hooks/useDiaryData';
import DiaryBookModal from '@/components/DiaryBookModal';
import EditTodoModal from '@/components/EditTodoModal';
import { Todo } from '@/contexts/CalendarContext';
import { TraditionalPattern } from '@/components/WuxingElements';
import DailyFortuneIndicator from './DailyFortuneIndicator';
import QimenEventIndicator from './QimenEventIndicator';
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
  getDay,
} from 'date-fns';
import { CalendarEvent } from '@/services/api';
import { formatLunarDate, getSpecialLunarDay, getSolarTerm, solarToLunar } from '@/utils/lunarCalendar';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

interface MonthViewProps {
  events: CalendarEvent[]
  onCreateEvent: (date: Date) => void
  onDateClick?: (date: Date, event: React.MouseEvent) => void
  onEditEvent: (event: CalendarEvent) => void
  onDeleteEvent?: (eventId: string) => void
  highlightedEventId?: string | null
  onDiaryClick?: (date: Date) => void
}

export default function MonthView({ events, onCreateEvent, onDateClick, onEditEvent, onDeleteEvent, highlightedEventId }: MonthViewProps) {
  const { currentDate, getTodosForDate, deleteTodo } = useCalendar();
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [isDiaryOpen, setIsDiaryOpen] = useState(false);
  const [diaryDate, setDiaryDate] = useState<Date>(new Date());
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  
  // 일기 데이터 가져오기
  const { diaryDates } = useDiaryData({
    viewMode: 'month',
    currentDate,
  });

  const monthDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const startWeek = startOfWeek(start, { weekStartsOn: 0 });
    const endWeek = endOfWeek(end, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: startWeek, end: endWeek });
  }, [currentDate]);

  // 특별한 날짜들을 미리 계산하여 메모이제이션 (절기와 음력 명절 분리)
  const specialDaysMap = useMemo(() => {
    const map = new Map<string, string>();
    const processedSolarTerms = new Set<string>(); // 이미 처리된 절기

    // 현재 월의 날짜만 처리
    monthDays.forEach(day => {
      if (isSameMonth(day, currentDate)) {
        const dateKey = format(day, 'yyyy-MM-dd');

        // 절기는 정확한 날짜에만 표시
        const solarTerm = getSolarTerm(day);
        if (solarTerm) {
          // 같은 절기가 여러 번 나타나지 않도록 체크
          if (!processedSolarTerms.has(solarTerm)) {
            processedSolarTerms.add(solarTerm);
            map.set(dateKey, solarTerm);
          }
        } else {
          // 음력 명절 확인
          try {
            const lunar = solarToLunar(day);
            let lunarSpecialDay = null;

            if (lunar.month === 1 && lunar.day === 1) lunarSpecialDay = '설날';
            else if (lunar.month === 1 && lunar.day === 15) lunarSpecialDay = '정월대보름';
            else if (lunar.month === 5 && lunar.day === 5) lunarSpecialDay = '단오';
            else if (lunar.month === 7 && lunar.day === 7) lunarSpecialDay = '칠석';
            else if (lunar.month === 7 && lunar.day === 15) lunarSpecialDay = '백중';
            else if (lunar.month === 8 && lunar.day === 15) lunarSpecialDay = '추석';
            else if (lunar.month === 9 && lunar.day === 9) lunarSpecialDay = '중양절';

            if (lunarSpecialDay) {
              map.set(dateKey, lunarSpecialDay);
            }
          } catch (error) {
            // 음력 변환 에러는 무시 (로그 출력하지 않음)
          }
        }
      }
    });

    return map;
  }, [monthDays, currentDate]);

  const getEventsForDay = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return isSameDay(eventDate, date);
    }).slice(0, 3); // 최대 3개만 표시
  };

  // 날짜별 할일 데이터 메모이제이션
  const todosForMonth = useMemo(() => {
    const todosMap = new Map<string, ReturnType<typeof getTodosForDate>>();
    monthDays.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      todosMap.set(dateKey, getTodosForDate(day));
    });
    return todosMap;
  }, [monthDays, getTodosForDate]);

  // 우선순위별 아이콘
  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const handleDayClick = (date: Date, event: React.MouseEvent) => {
    // 새로운 통합 날짜 클릭 핸들러가 있으면 그것을 사용, 없으면 기존 방식
    if (onDateClick) {
      onDateClick(date, event);
    } else {
      onCreateEvent(date);
    }
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditEvent(event);
  };

  const handleDiaryClick = (date: Date) => {
    setDiaryDate(date);
    setIsDiaryOpen(true);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Traditional Korean Weekday Headers */}
      <div className="relative grid grid-cols-7 border-b border-border bg-gradient-to-r from-hanbok-white via-white to-hanbok-white">
        <TraditionalPattern pattern="clouds" opacity={0.05} />
        {WEEKDAYS.map((day, index) => (
          <div
            key={day}
            className={`
              relative px-2 py-4 text-center font-bold tracking-wider
              ${index === 0 ? 'text-hanbok-red' : index === 6 ? 'text-hanbok-blue' : 'text-gray-700 dark:text-gray-300'}
              ${index === 0 || index === 6 ? 'text-base' : 'text-sm'}
              transition-colors duration-200 hover:bg-white/50
            `}
          >
            <span className="relative z-10">{day}</span>
            {/* 주말 강조 */}
            {(index === 0 || index === 6) && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-current opacity-30 rounded"></div>
            )}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-px bg-border">
        {monthDays.map((day) => {
          const dayOfWeek = getDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);
          const dayEvents = getEventsForDay(day);
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayTodos = todosForMonth.get(dateKey) || [];
          const incompleteTodos = dayTodos.filter(todo => !todo.completed);
          const completedTodos = dayTodos.filter(todo => todo.completed);
          const specialDay = specialDaysMap.get(dateKey) || null; // 미리 계산된 맵에서 가져오기

          return (
            <div
              key={day.toISOString()}
              onClick={(e) => handleDayClick(day, e)}
              onMouseEnter={() => setHoveredDate(day)}
              onMouseLeave={() => setHoveredDate(null)}
              className={`
                relative p-2 cursor-pointer transition-all duration-200 group
                bg-background hover:bg-gradient-to-br hover:from-hanbok-white hover:to-white
                ${!isCurrentMonth ? 'bg-muted/30' : ''}
                ${isCurrentDay ? 'bg-gradient-to-br from-hanbok-yellow/20 to-yinyang-yang/10 shadow-inner border-2 border-yinyang-yang/30' : ''}
                ${dayOfWeek === 0 ? 'hover:from-hanbok-red/5 hover:to-red-50' : ''}
                ${dayOfWeek === 6 ? 'hover:from-hanbok-blue/5 hover:to-blue-50' : ''}
                min-h-[120px] border border-gray-100 dark:border-gray-800
              `}
            >
              {/* Traditional Korean Date Display */}
              <div className="flex items-start justify-between mb-1">
                <div className="flex flex-col space-y-1">
                  {/* 양력 날짜 */}
                  <div className="flex items-center space-x-1">
                    <span
                      className={`
                        font-bold transition-all duration-200
                        ${isCurrentDay
                          ? 'bg-gradient-to-br from-yinyang-yang to-hanbok-yellow text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg text-sm'
                          : 'text-base'
                        }
                        ${!isCurrentMonth ? 'text-muted-foreground opacity-50' : ''}
                        ${dayOfWeek === 0 ? 'text-hanbok-red' : ''}
                        ${dayOfWeek === 6 ? 'text-hanbok-blue' : ''}
                        group-hover:scale-110
                      `}
                    >
                      {format(day, 'd')}
                    </span>
                    {/* 오늘 표시 아이콘 */}
                    {isCurrentDay && (
                      <span className="text-xs animate-pulse">✨</span>
                    )}
                  </div>

                  {/* 음력 날짜 표시 */}
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                      {formatLunarDate(day, false)}
                    </span>
                    {/* 특별한 음력 날짜 표시 (절기, 명절) */}
                    {specialDay && (
                      <span className="text-[9px] text-hanbok-red font-bold bg-hanbok-red/10 px-1 py-0.5 rounded mt-0.5 truncate">
                        {specialDay}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* 할일 및 일기 표시 */}
                {isCurrentMonth && (
                  <div className="flex items-center gap-1">
                    {/* 일기 아이콘 표시 - 일기가 있을 때만 표시 */}
                    {diaryDates.has(format(day, 'yyyy-MM-dd')) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDiaryClick(day);
                        }}
                        className="p-1 rounded text-xs transition-all hover:scale-110 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                        title="일기 보기/수정"
                      >
                        📖
                      </button>
                    )}
                    
                    {/* 우선순위별 할일 개수 표시 */}
                    {dayTodos.length > 0 && (
                      <>
                        {incompleteTodos.filter(t => t.priority === 'high').length > 0 && (
                          <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                            {incompleteTodos.filter(t => t.priority === 'high').length}
                          </span>
                        )}
                        {incompleteTodos.filter(t => t.priority === 'medium').length > 0 && (
                          <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-yellow-500 rounded-full">
                            {incompleteTodos.filter(t => t.priority === 'medium').length}
                          </span>
                        )}
                        {incompleteTodos.filter(t => t.priority === 'low').length > 0 && (
                          <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-green-500 rounded-full">
                            {incompleteTodos.filter(t => t.priority === 'low').length}
                          </span>
                        )}
                        {/* 완료된 할일 */}
                        {completedTodos.length > 0 && (
                          <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-gray-500 bg-gray-200 rounded-full">
                            ✓
                          </span>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 group flex items-center ${
                      highlightedEventId === event.id ? 'ring-2 ring-primary animate-pulse' : ''
                    }`}
                    style={{ 
                      backgroundColor: `${event.color || '#3b82f6'}20`,
                      color: event.color || '#3b82f6',
                      borderLeft: `2px solid ${event.color || '#3b82f6'}`,
                    }}
                    onClick={(e) => handleEventClick(event, e)}
                  >
                    <span className="flex-1 truncate flex items-center gap-1">
                      {!event.all_day && (
                        <QimenEventIndicator
                          startTime={event.start_time}
                          endTime={event.end_time}
                          compact={true}
                        />
                      )}
                      {event.all_day && <span className="font-semibold">종일 </span>}
                      {!event.all_day && format(new Date(event.start_time), 'HH:mm')} {event.title}
                    </span>
                    {onDeleteEvent && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`"${event.title}" 일정을 삭제하시겠습니까?`)) {
                            onDeleteEvent?.(event.id!);
                          }
                        }}
                        className="opacity-50 hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity ml-1 text-lg font-bold"
                        title="일정 삭제"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                
                {/* More Events Indicator */}
                {events.filter(e => e.id && isSameDay(new Date(e.start_time), day)).length > 3 && (
                  <div className="text-xs text-muted-foreground font-medium">
                    +{events.filter(e => e.id && isSameDay(new Date(e.start_time), day)).length - 3}개 더보기
                  </div>
                )}
              </div>

              {/* 일간 운세 표시 */}
              {isCurrentMonth && (
                <DailyFortuneIndicator date={day} compact={true} />
              )}

              {/* 할일 미리보기 툴팁 */}
              {hoveredDate && isSameDay(hoveredDate, day) && dayTodos.length > 0 && (
                <div className="absolute z-50 top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
                  {/* 할일 목록 */}
                  <div className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">
                    할일 목록 ({dayTodos.length}개)
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {dayTodos.slice(0, 5).map((todo) => (
                      <div key={todo.id} className="flex items-start gap-2 text-xs group">
                        <span>{getPriorityIcon(todo.priority)}</span>
                        <span 
                          className={`flex-1 cursor-pointer hover:underline ${todo.completed ? 'line-through text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTodo(todo);
                          }}
                        >
                          {todo.text}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTodo(todo);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 transition-opacity text-xs"
                          title="할일 수정"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTodo(todo.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                          title="할일 삭제"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {dayTodos.length > 5 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        +{dayTodos.length - 5}개 더보기
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* 일기 모달 */}
      <DiaryBookModal 
        isOpen={isDiaryOpen}
        onClose={() => setIsDiaryOpen(false)}
        date={diaryDate}
        onSave={() => setIsDiaryOpen(false)}
      />
      
      {/* 할일 수정 모달 */}
      <EditTodoModal
        isOpen={!!editingTodo}
        onClose={() => setEditingTodo(null)}
        todo={editingTodo}
      />
    </div>
  );
}