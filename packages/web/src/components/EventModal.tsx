import React, { useState, useEffect, useMemo } from 'react';
import { format, addDays } from 'date-fns';
import { CalendarEvent, eventService, Tag } from '../services/api';
import { useCalendar } from '../contexts/CalendarContext';
import TagSelector from './TagSelector';
import { useQimenCalendarIntegration } from '../hooks/useQimenCalendarIntegration';
import { lunarToSolar, solarToLunar } from '../utils/lunarCalendar';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  event?: CalendarEvent | null;
  initialDate?: Date;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  event,
  initialDate,
}) => {
  const { addTodo } = useCalendar();
  const [activeTab, setActiveTab] = useState<'event' | 'todo'>('event');
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    start_time: initialDate ? format(initialDate, "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    end_time: initialDate ? format(new Date(initialDate.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm") : format(new Date(Date.now() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
    all_day: false,
    location: '',
    type: 'personal',
    color: '#3b82f6',
    reminder_minutes: 15,
    tags: [],
  });

  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  // 음력 관련 상태
  const [isLunar, setIsLunar] = useState(false);
  const [lunarDate, setLunarDate] = useState({
    year: new Date().getFullYear(),
    month: 1,
    day: 1,
    isLeapMonth: false,
  });
  const [isYearlyRecurring, setIsYearlyRecurring] = useState(false);

  const [todoData, setTodoData] = useState({
    text: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    date: initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
  });

  // 귀문둔갑 통합 - 최적 시간 추천을 위한 날짜 범위 설정
  const qimenDateRange = useMemo(() => {
    if (!formData.start_time) return { startDate: new Date(), endDate: addDays(new Date(), 1) };

    const startDate = new Date(formData.start_time);
    const dayStart = new Date(startDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(startDate);
    dayEnd.setHours(23, 59, 59, 999);

    return { startDate: dayStart, endDate: dayEnd };
  }, [formData.start_time]);

  const {
    evaluateEvent,
    getFortuneDisplay,
    getBestTimeForDay,
  } = useQimenCalendarIntegration({
    startDate: qimenDateRange.startDate,
    endDate: qimenDateRange.endDate,
    autoCalculate: activeTab === 'event', // 일정 탭에서만 자동 계산
  });

  // 현재 일정의 귀문둔갑 평가
  const eventEvaluation = useMemo(() => {
    if (activeTab !== 'event' || !formData.start_time) return null;

    const startTime = new Date(formData.start_time);
    const endTime = formData.end_time ? new Date(formData.end_time) : undefined;

    return evaluateEvent(startTime, endTime);
  }, [activeTab, formData.start_time, formData.end_time, evaluateEvent]);

  // 최적 시간 추천
  const optimalTimeInfo = useMemo(() => {
    if (activeTab !== 'event' || !formData.start_time) return null;

    const startTime = new Date(formData.start_time);
    const bestTime = getBestTimeForDay(startTime);

    // 현재 선택된 시간과 최적 시간이 다르고, 점수 차이가 20점 이상인 경우에만 추천
    if (bestTime && eventEvaluation && (bestTime.score - eventEvaluation.score) >= 20) {
      return bestTime;
    }

    return null;
  }, [activeTab, formData.start_time, eventEvaluation, getBestTimeForDay]);

  // 양력 날짜가 변경될 때 음력 날짜 업데이트
  useEffect(() => {
    if (formData.start_time && !isLunar) {
      try {
        const date = new Date(formData.start_time);
        const lunar = solarToLunar(date);
        setLunarDate({
          year: lunar.year,
          month: lunar.month,
          day: lunar.day,
          isLeapMonth: lunar.isLeapMonth || false,
        });
      } catch (error) {
        console.error('Failed to convert solar to lunar:', error);
      }
    }
  }, [formData.start_time, isLunar]);

  // 음력 날짜가 변경될 때 양력 날짜 업데이트
  useEffect(() => {
    if (isLunar && lunarDate.year && lunarDate.month && lunarDate.day) {
      try {
        const solarDate = lunarToSolar(
          lunarDate.year,
          lunarDate.month,
          lunarDate.day,
          lunarDate.isLeapMonth,
        );
        const timeStr = formData.start_time ? formData.start_time.split('T')[1] || '09:00' : '09:00';

        // 시작 시간 설정
        const startDateTime = new Date(`${format(solarDate, 'yyyy-MM-dd')}T${timeStr}`);

        // 종료 시간 = 시작 시간 + 1시간
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

        setFormData(prev => ({
          ...prev,
          start_time: format(startDateTime, "yyyy-MM-dd'T'HH:mm"),
          end_time: format(endDateTime, "yyyy-MM-dd'T'HH:mm"),
        }));
      } catch (error) {
        console.error('Failed to convert lunar to solar:', error);
      }
    }
  }, [isLunar, lunarDate]);

  useEffect(() => {
    if (event) {
      setFormData(event);
      setSelectedTags(event.tags || []);
      setActiveTab('event');
    } else if (initialDate) {
      setFormData(prev => ({
        ...prev,
        start_time: format(initialDate, "yyyy-MM-dd'T'HH:mm"),
        end_time: format(new Date(initialDate.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
      }));
      setTodoData(prev => ({
        ...prev,
        date: format(initialDate, 'yyyy-MM-dd'),
      }));
    }
  }, [event, initialDate]);

  const handleTodoSubmit = () => {
    if (!todoData.text.trim()) {
      alert('할일 내용을 입력해주세요.');
      return;
    }

    try {
      addTodo({
        text: todoData.text.trim(),
        completed: false,
        priority: todoData.priority,
        date: todoData.date,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save todo:', error);
      alert('할일 저장에 실패했습니다.');
    }
  };


  const _getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '🟡';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'todo') {
      handleTodoSubmit();
      return;
    }
    
    
    if (!formData.title || !formData.start_time || !formData.end_time) {
      alert('제목과 시간을 입력해주세요.');
      return;
    }

    try {
      // 백엔드가 필드명 변환을 처리하므로 원래 프론트엔드 필드명으로 전송
      const apiData = {
        title: formData.title,
        description: formData.description,
        start_time: formData.start_time ? `${formData.start_time}:00` : formData.start_time,
        end_time: formData.end_time ? `${formData.end_time}:00` : formData.end_time,
        all_day: formData.all_day,
        location: formData.location,
        type: formData.type,
        color: formData.color,
        reminder_minutes: formData.reminder_minutes === undefined ? undefined : formData.reminder_minutes,
      };

      let savedEvent: CalendarEvent;
      
      if (event?.id) {

        savedEvent = await eventService.updateEvent(event.id, apiData);
        // Add tags to the saved event object
        savedEvent.tags = selectedTags;
      } else {

        savedEvent = await eventService.createEvent(apiData as any);
        // Add tags to the saved event object
        savedEvent.tags = selectedTags;
      }

      onSave(savedEvent);
      onClose();
    } catch (error: any) {
      console.error('Failed to save event - Full error:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('Request was made but no response:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      alert(`일정 저장에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
    }
  };

  const handleDelete = async () => {
    if (event?.id && window.confirm('이 일정을 삭제하시겠습니까?')) {
      try {
        await eventService.deleteEvent(event.id);
        onClose();
        window.location.reload(); // Temporary solution to refresh events
      } catch (error) {
        console.error('Failed to delete event:', error);
        alert('일정 삭제에 실패했습니다.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-border">
        <h2 className="text-xl font-bold mb-4 text-foreground">
          {event ? '일정 수정' : '새 작성'}
        </h2>
        
        {/* 기존 일정 수정이 아닌 경우에만 탭 표시 */}
        {!event && (
          <div className="flex mb-6 bg-muted rounded-lg p-1">
            <button
              type="button"
              onClick={() => setActiveTab('event')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'event'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              📅 일정
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('todo')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'todo'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ✅ 할일
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'todo' ? (
            <>
              {/* 할일 폼 */}
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">할일 내용*</label>
                <input
                  type="text"
                  value={todoData.text}
                  onChange={(e) => setTodoData({ ...todoData, text: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary-500 bg-background text-foreground"
                  placeholder="할일을 입력하세요..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">우선순위</label>
                <div className="flex space-x-2">
                  {[
                    { value: 'high', label: '높음', icon: '🔴' },
                    { value: 'medium', label: '보통', icon: '🟡' },
                    { value: 'low', label: '낮음', icon: '🟢' },
                  ].map((priority) => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() => setTodoData({ ...todoData, priority: priority.value as any })}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium border transition-colors ${
                        todoData.priority === priority.value
                          ? 'border-primary-500 bg-primary-500/10 text-primary-600'
                          : 'border-border hover:border-primary-300'
                      }`}
                    >
                      <span className="mr-1">{priority.icon}</span>
                      {priority.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">날짜</label>
                <input
                  type="date"
                  value={todoData.date}
                  onChange={(e) => setTodoData({ ...todoData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary-500 bg-background text-foreground"
                  required
                />
              </div>
            </>
          ) : (
            <>
              {/* 일정 폼 */}
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">제목*</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary-500 bg-background text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">설명</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary-500 bg-background text-foreground"
                  rows={3}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.all_day}
                  onChange={(e) => setFormData({ ...formData, all_day: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm text-foreground">종일</label>
              </div>

              {/* 음력/양력 전환 토글 */}
              <div className="border border-border rounded-md p-3 bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-foreground">날짜 유형</label>
                  <button
                    type="button"
                    onClick={() => setIsLunar(!isLunar)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      isLunar
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-foreground'
                    }`}
                  >
                    {isLunar ? '🌙 음력' : '☀️ 양력'}
                  </button>
                </div>

                {/* 음력 날짜 입력 UI */}
                {isLunar && (
                  <div className="space-y-3 pt-2 border-t border-border">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-medium mb-1 text-foreground">년</label>
                        <input
                          type="number"
                          value={lunarDate.year}
                          onChange={(e) => setLunarDate({ ...lunarDate, year: parseInt(e.target.value) })}
                          min="1900"
                          max="2100"
                          className="w-full px-2 py-1 text-sm border border-border rounded-md bg-background text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-foreground">월</label>
                        <input
                          type="number"
                          value={lunarDate.month}
                          onChange={(e) => setLunarDate({ ...lunarDate, month: parseInt(e.target.value) })}
                          min="1"
                          max="12"
                          className="w-full px-2 py-1 text-sm border border-border rounded-md bg-background text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-foreground">일</label>
                        <input
                          type="number"
                          value={lunarDate.day}
                          onChange={(e) => setLunarDate({ ...lunarDate, day: parseInt(e.target.value) })}
                          min="1"
                          max="30"
                          className="w-full px-2 py-1 text-sm border border-border rounded-md bg-background text-foreground"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={lunarDate.isLeapMonth}
                          onChange={(e) => setLunarDate({ ...lunarDate, isLeapMonth: e.target.checked })}
                          className="mr-2"
                        />
                        <label className="text-xs text-foreground">윤달</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isYearlyRecurring}
                          onChange={(e) => setIsYearlyRecurring(e.target.checked)}
                          className="mr-2"
                        />
                        <label className="text-xs text-foreground">매년 반복</label>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                      💡 양력: {formData.start_time ? format(new Date(formData.start_time), 'yyyy년 M월 d일') : '-'}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">시작*</label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary-500 bg-background text-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">종료*</label>
                  <input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary-500 bg-background text-foreground"
                    required
                  />
                </div>
              </div>

              {/* 귀문둔갑 시간 평가 섹션 */}
              {eventEvaluation && (
                <div className="border border-border rounded-md p-4 bg-muted/50">
                  <h3 className="text-sm font-semibold mb-2 text-foreground flex items-center">
                    <span className="mr-2">🔮</span>
                    귀문둔갑 시간 평가
                  </h3>

                  <div className="space-y-2">
                    {/* 현재 선택된 시간의 점수 */}
                    <div className={`flex items-center justify-between p-2 rounded-md ${getFortuneDisplay(eventEvaluation.fortune).bgColor}`}>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getFortuneDisplay(eventEvaluation.fortune).icon}</span>
                        <div>
                          <div className={`font-medium ${getFortuneDisplay(eventEvaluation.fortune).color}`}>
                            {eventEvaluation.fortune === 'excellent' && '대길 (大吉)'}
                            {eventEvaluation.fortune === 'good' && '길 (吉)'}
                            {eventEvaluation.fortune === 'neutral' && '평 (平)'}
                            {eventEvaluation.fortune === 'bad' && '흉 (凶)'}
                            {eventEvaluation.fortune === 'terrible' && '대흉 (大凶)'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            점수: {eventEvaluation.score}/100
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 요약 */}
                    <p className="text-xs text-foreground/80 leading-relaxed">
                      {eventEvaluation.summary}
                    </p>

                    {/* 최적 시간 추천 */}
                    {optimalTimeInfo && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs font-medium text-foreground mb-2">
                          💡 더 좋은 시간 추천
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            const timeStr = format(optimalTimeInfo.time, "yyyy-MM-dd'T'HH:mm");
                            setFormData({
                              ...formData,
                              start_time: timeStr,
                              end_time: formData.end_time && formData.start_time
                                ? format(
                                    new Date(
                                      optimalTimeInfo.time.getTime() +
                                        (new Date(formData.end_time).getTime() - new Date(formData.start_time).getTime()),
                                    ),
                                    "yyyy-MM-dd'T'HH:mm",
                                  )
                                : timeStr,
                            });
                          }}
                          className="w-full text-left p-2 rounded-md bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">🌟</span>
                              <div>
                                <div className="text-sm font-medium text-green-700 dark:text-green-300">
                                  {format(optimalTimeInfo.time, 'HH:mm')} 시작
                                </div>
                                <div className="text-xs text-green-600 dark:text-green-400">
                                  점수: {optimalTimeInfo.score}/100 (+{optimalTimeInfo.score - eventEvaluation.score}점 향상)
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-green-600 dark:text-green-400">적용 →</span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">위치</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary-500 bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">유형</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary-500 bg-background text-foreground"
                >
                  <option value="personal">개인</option>
                  <option value="work">업무</option>
                  <option value="holiday">휴일</option>
                  <option value="other">기타</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">색상</label>
                <input
                  type="color"
                  value={formData.color || '#3b82f6'}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-10 border border-border rounded-md bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">태그</label>
                <TagSelector
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                  placeholder="태그를 선택하거나 새로 만들기"
                  allowCreate={true}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">알림 (분)</label>
                <select
                  value={formData.reminder_minutes}
                  onChange={(e) => setFormData({ ...formData, reminder_minutes: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary-500 bg-background text-foreground"
                >
                  <option value="0">없음</option>
                  <option value="5">5분 전</option>
                  <option value="10">10분 전</option>
                  <option value="15">15분 전</option>
                  <option value="30">30분 전</option>
                  <option value="60">1시간 전</option>
                  <option value="1440">1일 전</option>
                </select>
              </div>
            </>
          )}

          <div className="flex justify-between pt-4">
            <div>
              {event?.id && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 text-red-600 hover:bg-red-500/10 rounded-md"
                >
                  삭제
                </button>
              )}
            </div>
            <div className="space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-foreground hover:bg-muted rounded-md"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
              >
                {event ? '수정' : activeTab === 'todo' ? '할일 저장' : '일정 저장'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;