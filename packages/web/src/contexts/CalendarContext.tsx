import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ViewMode, UserSettings } from '@/types/calendar';
import { Todo } from '@/types/todo';
import { CalendarEvent } from '@/services/api';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, format } from 'date-fns';

// Todo 타입을 다시 export 하여 다른 컴포넌트에서 사용할 수 있도록 함
export type { Todo };

interface CalendarContextType {
  currentDate: Date
  viewMode: ViewMode
  events: CalendarEvent[]
  selectedDate: Date | null
  settings: UserSettings
  todos: Todo[]
  
  setCurrentDate: (date: Date) => void
  setViewMode: (mode: ViewMode) => void
  setSelectedDate: (date: Date | null) => void
  navigatePrevious: () => void
  navigateNext: () => void
  navigateToday: () => void
  addEvent: (event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) => void
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void
  deleteEvent: (id: string) => void
  getEventsForDateRange: (start: Date, end: Date) => CalendarEvent[]
  
  // 할일 관련 함수들
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTodo: (id: string, updates: Partial<Todo>) => void
  deleteTodo: (id: string) => void
  toggleTodo: (id: string) => void
  getTodosForDate: (date: Date) => Todo[]
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};

interface CalendarProviderProps {
  children: ReactNode
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [todos, setTodos] = useState<Todo[]>([
    { 
      id: '1', 
      text: '보고서 작성', 
      completed: false, 
      priority: 'high', 
      date: format(new Date(), 'yyyy-MM-dd'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { 
      id: '2', 
      text: '장보기', 
      completed: true, 
      priority: 'medium', 
      date: format(new Date(), 'yyyy-MM-dd'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { 
      id: '3', 
      text: '운동하기', 
      completed: false, 
      priority: 'low', 
      date: format(new Date(), 'yyyy-MM-dd'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4',
      text: '팀 미팅 준비',
      completed: false,
      priority: 'high',
      date: format(new Date(), 'yyyy-MM-dd'),
      hasTime: true,
      startTime: '14:00',
      endTime: '15:00',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '5',
      text: '이메일 확인',
      completed: true,
      priority: 'medium',
      date: format(new Date(), 'yyyy-MM-dd'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '6',
      text: '코드 리뷰',
      completed: false,
      priority: 'high',
      date: format(new Date(new Date().setDate(new Date().getDate() + 1)), 'yyyy-MM-dd'),
      hasTime: true,
      startTime: '10:30',
      endTime: '11:30',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '7',
      text: '프로젝트 계획서 작성',
      completed: false,
      priority: 'high',
      date: format(new Date(new Date().setDate(new Date().getDate() + 2)), 'yyyy-MM-dd'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '8',
      text: '책 읽기',
      completed: false,
      priority: 'low',
      date: format(new Date(new Date().setDate(new Date().getDate() + 3)), 'yyyy-MM-dd'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '9',
      text: '병원 예약',
      completed: false,
      priority: 'medium',
      date: format(new Date(new Date().setDate(new Date().getDate() + 5)), 'yyyy-MM-dd'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '10',
      text: '친구 생일 선물 준비',
      completed: false,
      priority: 'medium',
      date: format(new Date(new Date().setDate(new Date().getDate() + 7)), 'yyyy-MM-dd'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  
  const [settings] = useState<UserSettings>({
    timezone: 'Asia/Seoul',
    weekStartsOn: 0,
    defaultView: 'month',
    showLunarCalendar: true,
    showFortune: true,
    theme: 'light',
    language: 'ko',
  });

  const navigatePrevious = useCallback(() => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'year':
        newDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      case 'month':
        newDate.setMonth(currentDate.getMonth() - 1);
        break;
      case 'week':
        newDate.setDate(currentDate.getDate() - 7);
        break;
      case 'day':
        newDate.setDate(currentDate.getDate() - 1);
        break;
    }
    
    setCurrentDate(newDate);
  }, [currentDate, viewMode]);

  const navigateNext = useCallback(() => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'year':
        newDate.setFullYear(currentDate.getFullYear() + 1);
        break;
      case 'month':
        newDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'week':
        newDate.setDate(currentDate.getDate() + 7);
        break;
      case 'day':
        newDate.setDate(currentDate.getDate() + 1);
        break;
    }
    
    setCurrentDate(newDate);
  }, [currentDate, viewMode]);

  const navigateToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const addEvent = useCallback((eventData: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setEvents(prev => [...prev, newEvent]);
  }, []);

  const updateEvent = useCallback((id: string, eventData: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(event => 
      event.id === id 
        ? { ...event, ...eventData, updated_at: new Date().toISOString() }
        : event,
    ));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  }, []);

  const getEventsForDateRange = useCallback((start: Date, end: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);
      return (
        (eventStart >= start && eventStart <= end) ||
        (eventEnd >= start && eventEnd <= end) ||
        (eventStart <= start && eventEnd >= end)
      );
    });
  }, [events]);

  const addTodo = useCallback((todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTodo: Todo = {
      ...todoData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTodos(prev => [...prev, newTodo]);
  }, []);

  const updateTodo = useCallback((id: string, updates: Partial<Todo>) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id 
        ? { ...todo, ...updates, updatedAt: new Date() }
        : todo,
    ));
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id 
        ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
        : todo,
    ));
  }, []);

  const getTodosForDate = useCallback((date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return todos.filter(todo => todo.date === dateStr);
  }, [todos]);

  const value = {
    currentDate,
    viewMode,
    events,
    selectedDate,
    settings,
    todos,
    setCurrentDate,
    setViewMode,
    setSelectedDate,
    navigatePrevious,
    navigateNext,
    navigateToday,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDateRange,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    getTodosForDate,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};